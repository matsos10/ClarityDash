import { MiniWebSocket, base64 } from '../net/miniWebSocket';
import { utf8Encode } from '../net/socket';
import { SAMSUNG_APP_IDS } from '../apps';
import { AppId, RemoteKey, TvDevice, TvRemote } from '../types';

const APP_NAME = 'Telecomando Universal';

const KEYS: Partial<Record<RemoteKey, string>> = {
  POWER: 'KEY_POWER',
  SOURCE: 'KEY_SOURCE',
  HOME: 'KEY_HOME',
  BACK: 'KEY_RETURN',
  MENU: 'KEY_MENU',
  INFO: 'KEY_INFO',
  GUIDE: 'KEY_GUIDE',
  UP: 'KEY_UP',
  DOWN: 'KEY_DOWN',
  LEFT: 'KEY_LEFT',
  RIGHT: 'KEY_RIGHT',
  OK: 'KEY_ENTER',
  VOL_UP: 'KEY_VOLUP',
  VOL_DOWN: 'KEY_VOLDOWN',
  MUTE: 'KEY_MUTE',
  CH_UP: 'KEY_CHUP',
  CH_DOWN: 'KEY_CHDOWN',
  PLAY: 'KEY_PLAY',
  PAUSE: 'KEY_PAUSE',
  STOP: 'KEY_STOP',
  REWIND: 'KEY_REWIND',
  FAST_FORWARD: 'KEY_FF',
  RED: 'KEY_RED',
  GREEN: 'KEY_GREEN',
  YELLOW: 'KEY_YELLOW',
  BLUE: 'KEY_CYAN',
  NUM_0: 'KEY_0',
  NUM_1: 'KEY_1',
  NUM_2: 'KEY_2',
  NUM_3: 'KEY_3',
  NUM_4: 'KEY_4',
  NUM_5: 'KEY_5',
  NUM_6: 'KEY_6',
  NUM_7: 'KEY_7',
  NUM_8: 'KEY_8',
  NUM_9: 'KEY_9',
};

export interface SamsungInfo {
  name: string;
  secure: boolean;
}

/** Lê http://IP:8001/api/v2/ — responde em todas as TVs Samsung Tizen (2016+). */
export async function fetchSamsungInfo(ip: string, timeoutMs = 1500): Promise<SamsungInfo | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`http://${ip}:8001/api/v2/`, { signal: ctrl.signal });
    if (!res.ok) return null;
    const json = await res.json();
    const dev = json?.device ?? {};
    if (!json?.device && !json?.name) return null;
    return {
      name: String(dev.name || json.name || 'Samsung TV').replace(/^\[TV\]\s*/, ''),
      secure: String(dev.TokenAuthSupport) === 'true',
    };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export class SamsungRemote implements TvRemote {
  private ws?: MiniWebSocket;
  private connecting?: Promise<void>;

  constructor(
    private device: TvDevice,
    private onTokenUpdate: (token: string) => void,
    private onWaitingForTv: () => void,
    private onDisconnect: () => void,
  ) {}

  supports(key: RemoteKey) {
    return KEYS[key] !== undefined;
  }

  connect(): Promise<void> {
    if (this.ws?.isOpen) return Promise.resolve();
    if (!this.connecting) {
      this.connecting = this.doConnect().finally(() => {
        this.connecting = undefined;
      });
    }
    return this.connecting;
  }

  private async doConnect() {
    const attempts: { port: number; tls: boolean }[] = this.device.secure
      ? [{ port: 8002, tls: true }, { port: 8001, tls: false }]
      : [{ port: 8001, tls: false }, { port: 8002, tls: true }];

    let lastErr: unknown;
    for (const a of attempts) {
      try {
        await this.open(a.port, a.tls);
        return;
      } catch (e) {
        lastErr = e;
        if (e instanceof UnauthorizedError) throw e;
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error('Não foi possível ligar à TV Samsung');
  }

  private async open(port: number, tls: boolean) {
    let path = `/api/v2/channels/samsung.remote.control?name=${base64(utf8Encode(APP_NAME))}`;
    if (tls && this.device.token) path += `&token=${this.device.token}`;

    const ws = new MiniWebSocket(this.device.ip, port, path, tls);
    await ws.connect(4000);

    await new Promise<void>((resolve, reject) => {
      // A TV mostra um pedido de autorização na primeira ligação.
      const waitTimer = setTimeout(() => this.onWaitingForTv(), 1200);
      const timeout = setTimeout(() => {
        clearTimeout(waitTimer);
        ws.close();
        reject(new Error('A TV não respondeu ao pedido de ligação'));
      }, 30000);

      ws.onclose = () => {
        clearTimeout(waitTimer);
        clearTimeout(timeout);
        reject(new Error('Ligação fechada pela TV'));
      };
      ws.onmessage = (text) => {
        let msg: any;
        try {
          msg = JSON.parse(text);
        } catch {
          return;
        }
        if (msg.event === 'ms.channel.connect') {
          clearTimeout(waitTimer);
          clearTimeout(timeout);
          const token = msg.data?.token;
          if (token && token !== this.device.token) {
            this.device = { ...this.device, token: String(token) };
            this.onTokenUpdate(String(token));
          }
          resolve();
        } else if (msg.event === 'ms.channel.unauthorized') {
          clearTimeout(waitTimer);
          clearTimeout(timeout);
          ws.close();
          reject(new UnauthorizedError());
        }
      };
    });

    ws.onmessage = undefined;
    ws.onclose = () => {
      this.ws = undefined;
      this.onDisconnect();
    };
    this.ws = ws;
  }

  async send(key: RemoteKey) {
    const code = KEYS[key];
    if (!code) return;
    await this.connect();
    this.ws!.send(
      JSON.stringify({
        method: 'ms.remote.control',
        params: {
          Cmd: 'Click',
          DataOfCmd: code,
          Option: 'false',
          TypeOfRemote: 'SendRemoteKey',
        },
      }),
    );
  }

  async launchApp(app: AppId) {
    const ids = SAMSUNG_APP_IDS[app];
    // 1) API REST (a maioria das TVs Tizen); devolve 404 se a app não existir.
    for (const id of ids) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      try {
        const res = await fetch(`http://${this.device.ip}:8001/api/v2/applications/${id}`, {
          method: 'POST',
          signal: ctrl.signal,
        });
        if (res.ok) return;
      } catch {
      } finally {
        clearTimeout(t);
      }
    }
    // 2) Pedido pelo canal WebSocket (TVs mais recentes).
    await this.connect();
    for (const id of ids) {
      this.ws!.send(
        JSON.stringify({
          method: 'ms.channel.emit',
          params: { event: 'ed.apps.launch', to: 'host', data: { appId: id, action_type: 'DEEP_LINK' } },
        }),
      );
    }
  }

  async sendText(text: string) {
    await this.connect();
    this.ws!.send(
      JSON.stringify({
        method: 'ms.remote.control',
        params: { Cmd: base64(utf8Encode(text)), DataOfCmd: 'base64', TypeOfRemote: 'SendInputString' },
      }),
    );
    this.ws!.send(JSON.stringify({ method: 'ms.remote.control', params: { TypeOfRemote: 'SendInputEnd' } }));
  }

  disconnect() {
    const ws = this.ws;
    this.ws = undefined;
    if (ws) {
      ws.onclose = undefined;
      ws.close();
    }
  }
}

class UnauthorizedError extends Error {
  constructor() {
    super('Ligação recusada na TV. Aceita o pedido ou verifica Definições > Geral > Gestor de dispositivos externos.');
  }
}
