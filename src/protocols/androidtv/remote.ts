import { OpenedSocket, openSocket, probePort, toBytes } from '../../net/socket';
import { ANDROID_TV_LINKS } from '../../apps';
import { AppId, RemoteKey, TvDevice, TvRemote } from '../../types';
import { NotPairedError } from '../errors';
import { getIdentity } from './identity';
import { PAIRING_PORT, PairingSession } from './pairing';
import { decode, fMsg, fString, fVarint, frame, FrameReader, getMsg, getNum } from './protobuf';

export const REMOTE_PORT = 6466;

/** Códigos android.view.KeyEvent. */
const KEYS: Partial<Record<RemoteKey, number>> = {
  POWER: 26,
  SOURCE: 178,
  HOME: 3,
  BACK: 4,
  MENU: 82,
  INFO: 165,
  GUIDE: 172,
  UP: 19,
  DOWN: 20,
  LEFT: 21,
  RIGHT: 22,
  OK: 23,
  VOL_UP: 24,
  VOL_DOWN: 25,
  MUTE: 164,
  CH_UP: 166,
  CH_DOWN: 167,
  PLAY: 126,
  PAUSE: 127,
  STOP: 86,
  REWIND: 89,
  FAST_FORWARD: 90,
  RED: 183,
  GREEN: 184,
  YELLOW: 185,
  BLUE: 186,
  NUM_0: 7,
  NUM_1: 8,
  NUM_2: 9,
  NUM_3: 10,
  NUM_4: 11,
  NUM_5: 12,
  NUM_6: 13,
  NUM_7: 14,
  NUM_8: 15,
  NUM_9: 16,
};

// Campos de RemoteMessage (remotemessage.proto)
const F_CONFIGURE = 1;
const F_SET_ACTIVE = 2;
const F_ERROR = 3;
const F_PING_REQUEST = 8;
const F_PING_RESPONSE = 9;
const F_KEY_INJECT = 10;
const F_IME_KEY_INJECT = 20;
const F_IME_BATCH_EDIT = 21;
const F_IME_SHOW_REQUEST = 22;
const F_APP_LINK_LAUNCH = 90;
const DIRECTION_SHORT = 3;
// Funcionalidades: PING | KEY | IME | POWER | VOLUME | APP_LINK
const FEATURES = 1 | 2 | 4 | 32 | 64 | 512;


/** Indica se o IP responde nas portas do Android TV Remote v2. */
export async function isAndroidTv(ip: string, timeoutMs = 1200) {
  return (await probePort(ip, REMOTE_PORT, timeoutMs)) || (await probePort(ip, PAIRING_PORT, timeoutMs));
}

/** Tenta obter o nome da TV através do Google Cast (porta 8008). */
export async function fetchAndroidTvName(ip: string, timeoutMs = 1500): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`http://${ip}:8008/setup/eureka_info?params=name,device_info`, {
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.name ? String(json.name) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function startPairing(ip: string): Promise<PairingSession> {
  const identity = await getIdentity();
  const session = new PairingSession(ip, identity, 'Telecomando Universal');
  await session.start();
  return session;
}

export class AndroidTvRemote implements TvRemote {
  private conn?: OpenedSocket;
  private ready = false;
  private connecting?: Promise<void>;
  /** Contadores do campo de texto ativo, enviados pela TV. */
  private imeCounter = 0;
  private fieldCounter = 0;
  private hasImeCounter = false;
  private hasFieldCounter = false;
  private features = FEATURES;

  constructor(
    private device: TvDevice,
    private onDisconnect: () => void,
  ) {}

  supports(key: RemoteKey) {
    return KEYS[key] !== undefined;
  }

  connect(): Promise<void> {
    if (this.ready) return Promise.resolve();
    if (!this.connecting) {
      this.connecting = this.doConnect().finally(() => {
        this.connecting = undefined;
      });
    }
    return this.connecting;
  }

  private async doConnect() {
    const identity = await getIdentity();
    let conn: OpenedSocket;
    try {
      conn = await openSocket({
        host: this.device.ip,
        port: REMOTE_PORT,
        tls: true,
        cert: identity.certPem,
        key: identity.keyPem,
        timeoutMs: 6000,
      });
    } catch (e) {
      // A TV termina o handshake TLS quando o certificado não está emparelhado.
      if (!this.device.paired || /certificate|handshake|ssl|tls/i.test(String(e))) {
        throw new NotPairedError();
      }
      throw e;
    }
    this.conn = conn;

    let features = FEATURES;
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          this.disconnect();
          reject(new Error('A TV não respondeu.'));
        }
      }, 8000);

      const reader = new FrameReader((raw) => {
        const msg = decode(raw);
        if (this.trackIme(msg)) return;
        if (msg.has(F_CONFIGURE)) {
          const cfg = getMsg(msg, F_CONFIGURE);
          const tvFeatures = (cfg && getNum(cfg, 1)) ?? FEATURES;
          features = FEATURES & tvFeatures;
          this.features = features;
          this.write(
            fMsg(
              F_CONFIGURE,
              fVarint(1, features),
              fMsg(
                2,
                fString(1, 'Telecomando'),
                fString(2, 'Telecomando Universal'),
                fVarint(3, 1),
                fString(4, '1'),
                fString(5, 'atvremote'),
                fString(6, '1.0.0'),
              ),
            ),
          );
        } else if (msg.has(F_SET_ACTIVE)) {
          this.write(fMsg(F_SET_ACTIVE, fVarint(1, features)));
          this.ready = true;
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve();
          }
        } else if (msg.has(F_PING_REQUEST)) {
          const ping = getMsg(msg, F_PING_REQUEST);
          this.write(fMsg(F_PING_RESPONSE, fVarint(1, (ping && getNum(ping, 1)) ?? 0)));
        } else if (msg.has(F_ERROR) && !settled) {
          settled = true;
          clearTimeout(timer);
          reject(new Error('A TV devolveu um erro de configuração.'));
        }
      });

      conn.socket.on('data', (d) => reader.push(toBytes(d)));
      const onEnd = () => {
        const wasReady = this.ready;
        this.ready = false;
        this.conn = undefined;
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          // Fechar antes da configuração = certificado não reconhecido pela TV.
          reject(new NotPairedError());
        } else if (wasReady) {
          this.onDisconnect();
        }
      };
      conn.socket.on('close', onEnd);
      conn.socket.on('error', onEnd);
    });
  }

  /** Guarda os contadores do campo de texto (necessários para escrever). */
  private trackIme(msg: ReturnType<typeof decode>): boolean {
    const inject = getMsg(msg, F_IME_KEY_INJECT);
    if (inject) {
      const app = getMsg(inject, 1);
      const field = getMsg(inject, 2);
      this.imeCounter = (app && getNum(app, 1)) ?? 0;
      this.fieldCounter = (field && getNum(field, 1)) ?? 0;
      this.hasImeCounter = this.imeCounter !== 0;
      this.hasFieldCounter = this.fieldCounter !== 0;
      return true;
    }
    const show = getMsg(msg, F_IME_SHOW_REQUEST);
    if (show) {
      const st = getMsg(show, 2);
      if (st && getNum(st, 1) !== undefined) {
        this.fieldCounter = getNum(st, 1)!;
        this.hasFieldCounter = true;
      }
      return true;
    }
    const batch = getMsg(msg, F_IME_BATCH_EDIT);
    if (batch) {
      if (!this.hasImeCounter) this.imeCounter = getNum(batch, 1) ?? 0;
      if (!this.hasFieldCounter) this.fieldCounter = getNum(batch, 2) ?? 0;
      return true;
    }
    return false;
  }

  async launchApp(app: AppId) {
    await this.connect();
    if (!(this.features & 512)) throw new Error('Esta TV não permite abrir aplicações remotamente.');
    this.write(fMsg(F_APP_LINK_LAUNCH, fString(1, ANDROID_TV_LINKS[app])));
  }

  async sendText(text: string) {
    if (!text) return;
    await this.connect();
    if (!(this.features & 4)) throw new Error('Esta TV não aceita texto pelo comando.');
    const len = text.length;
    this.write(
      fMsg(
        F_IME_BATCH_EDIT,
        fVarint(1, this.imeCounter),
        fVarint(2, this.fieldCounter),
        fMsg(3, fVarint(1, 1), fMsg(2, fVarint(1, len), fVarint(2, len), fString(3, text))),
      ),
    );
  }

  private write(inner: Uint8Array) {
    this.conn?.socket.write(frame(inner));
  }

  async send(key: RemoteKey) {
    const code = KEYS[key];
    if (code === undefined) return;
    await this.connect();
    this.write(fMsg(F_KEY_INJECT, fVarint(1, code), fVarint(2, DIRECTION_SHORT)));
  }

  disconnect() {
    const c = this.conn;
    this.conn = undefined;
    this.ready = false;
    try {
      c?.socket.destroy();
    } catch {}
  }
}
