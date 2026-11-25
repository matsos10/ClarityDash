import { Buffer } from 'buffer';
import { appLabel, SONY_TITLES } from '../apps';
import { AppId, RemoteKey, TvDevice, TvRemote } from '../types';
import { NotPairedError } from './errors';

/**
 * Sony Bravia (2013+): API REST em http://IP/sony/... e códigos IRCC.
 * Registo por PIN: a TV mostra um PIN de 4 dígitos e devolve um cookie "auth".
 */

const NICKNAME = 'Telecomando Universal';

/** Nomes IRCC usados pela TV, por ordem de preferência. */
const KEY_NAMES: Partial<Record<RemoteKey, string[]>> = {
  SOURCE: ['Input'],
  HOME: ['Home'],
  BACK: ['Return', 'Back'],
  MENU: ['Options', 'ActionMenu', 'SyncMenu'],
  INFO: ['Display', 'Info'],
  GUIDE: ['GGuide', 'EPG', 'Guide'],
  UP: ['Up'],
  DOWN: ['Down'],
  LEFT: ['Left'],
  RIGHT: ['Right'],
  OK: ['Confirm', 'DpadCenter', 'Enter'],
  VOL_UP: ['VolumeUp'],
  VOL_DOWN: ['VolumeDown'],
  MUTE: ['Mute'],
  CH_UP: ['ChannelUp'],
  CH_DOWN: ['ChannelDown'],
  PLAY: ['Play'],
  PAUSE: ['Pause'],
  STOP: ['Stop'],
  REWIND: ['Rewind'],
  FAST_FORWARD: ['Forward'],
  RED: ['Red'],
  GREEN: ['Green'],
  YELLOW: ['Yellow'],
  BLUE: ['Blue'],
  NUM_0: ['Num0'],
  NUM_1: ['Num1'],
  NUM_2: ['Num2'],
  NUM_3: ['Num3'],
  NUM_4: ['Num4'],
  NUM_5: ['Num5'],
  NUM_6: ['Num6'],
  NUM_7: ['Num7'],
  NUM_8: ['Num8'],
  NUM_9: ['Num9'],
};

/** Códigos IRCC conhecidos, usados se a TV não devolver a lista. */
const ircc = (system: number, code: number) =>
  Buffer.from([0, 0, 0, system === 1 ? 1 : 2, 0, 0, 0, system, 0, 0, 0, code, 3]).toString('base64');
const FALLBACK: Record<string, string> = {
  Power: ircc(1, 0x15),
  Input: ircc(1, 0x25),
  Home: ircc(1, 0x60),
  Return: ircc(0x97, 0x23),
  Options: ircc(0x97, 0x36),
  Display: ircc(1, 0x3a),
  Up: ircc(1, 0x74),
  Down: ircc(1, 0x75),
  Left: ircc(1, 0x34),
  Right: ircc(1, 0x33),
  Confirm: ircc(1, 0x65),
  VolumeUp: ircc(1, 0x12),
  VolumeDown: ircc(1, 0x13),
  Mute: ircc(1, 0x14),
  ChannelUp: ircc(1, 0x10),
  ChannelDown: ircc(1, 0x11),
  Play: ircc(0x97, 0x1a),
  Pause: ircc(0x97, 0x19),
  Stop: ircc(0x97, 0x18),
  Rewind: ircc(0x97, 0x1b),
  Forward: ircc(0x97, 0x1c),
  Red: ircc(0x97, 0x25),
  Green: ircc(0x97, 0x26),
  Yellow: ircc(0x97, 0x27),
  Blue: ircc(0x97, 0x24),
  Num1: ircc(1, 0),
  Num2: ircc(1, 1),
  Num3: ircc(1, 2),
  Num4: ircc(1, 3),
  Num5: ircc(1, 4),
  Num6: ircc(1, 5),
  Num7: ircc(1, 6),
  Num8: ircc(1, 7),
  Num9: ircc(1, 8),
  Num0: ircc(1, 9),
};

interface Auth {
  cookie?: string;
  pin?: string;
}

interface RpcResult {
  status: number;
  json: any;
  cookie?: string;
}

async function post(
  url: string,
  body: string,
  headers: Record<string, string>,
  auth: Auth,
  timeoutMs: number,
): Promise<Response> {
  const h: Record<string, string> = { ...headers };
  if (auth.cookie) h.Cookie = `auth=${auth.cookie}`;
  if (auth.pin !== undefined) h.Authorization = 'Basic ' + Buffer.from(`:${auth.pin}`).toString('base64');
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { method: 'POST', body, headers: h, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function rpc(
  ip: string,
  service: string,
  method: string,
  params: unknown[],
  auth: Auth = {},
  timeoutMs = 4000,
  version = '1.0',
): Promise<RpcResult> {
  const res = await post(
    `http://${ip}/sony/${service}`,
    JSON.stringify({ method, params, id: 1, version }),
    { 'Content-Type': 'application/json' },
    auth,
    timeoutMs,
  );
  let json: any = null;
  try {
    json = await res.json();
  } catch {}
  const cookie = res.headers.get('set-cookie')?.match(/auth=([^;,\s]+)/)?.[1];
  return { status: res.status, json, cookie };
}

const isAuthError = (r: RpcResult) =>
  r.status === 401 || r.status === 403 || r.json?.error?.[0] === 401 || r.json?.error?.[0] === 403;

/** Identifica uma TV Sony Bravia (não precisa de autenticação). */
export async function fetchSonyInfo(ip: string, timeoutMs = 1500): Promise<{ name: string } | null> {
  try {
    const r = await rpc(ip, 'system', 'getInterfaceInformation', [], {}, timeoutMs);
    const info = r.json?.result?.[0];
    if (!info || (info.productCategory && info.productCategory !== 'tv')) return null;
    return { name: `Sony ${info.modelName || info.productName || 'Bravia'}` };
  } catch {
    return null;
  }
}

function newClientId() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `Telecomando:${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function register(ip: string, clientId: string, auth: Auth) {
  return rpc(
    ip,
    'accessControl',
    'actRegister',
    [{ clientid: clientId, nickname: NICKNAME, level: 'private' }, [{ value: 'yes', function: 'WOL' }]],
    auth,
    8000,
  );
}

export interface SonyPairing {
  /** Preenchido quando a TV aceitou o registo sem pedir PIN. */
  done?: Partial<TvDevice>;
  finish(pin: string): Promise<Partial<TvDevice>>;
}

/** Pede à TV que mostre o PIN de registo. */
export async function startSonyPairing(device: TvDevice): Promise<SonyPairing> {
  const clientId = device.clientId ?? newClientId();
  const requestPin = async () => {
    const r = await register(device.ip, clientId, {});
    if (r.status === 200 && !r.json?.error) return { clientId, authCookie: r.cookie, paired: true };
    if (r.status === 401) return null;
    throw new Error(
      'A TV recusou o registo. Na TV ativa Rede > Configuração da rede doméstica > Controlo IP > Autenticação "Normal".',
    );
  };

  const done = await requestPin();
  return {
    done: done ?? undefined,
    async finish(pin: string) {
      const clean = pin.trim();
      if (!/^\d{4}$/.test(clean)) throw new Error('O PIN tem 4 dígitos.');
      const r = await register(device.ip, clientId, { pin: clean });
      if (r.status === 200 && !r.json?.error) {
        return { clientId, pin: clean, authCookie: r.cookie, paired: true };
      }
      if (isAuthError(r)) {
        await requestPin();
        throw new Error('PIN incorreto. A TV mostrou um novo PIN.');
      }
      throw new Error(`Falha no registo (HTTP ${r.status}).`);
    },
  };
}

export class SonyRemote implements TvRemote {
  private codes = new Map<string, string>();
  private ready = false;

  constructor(
    private device: TvDevice,
    private onDeviceUpdate: (patch: Partial<TvDevice>) => void,
  ) {}

  supports(key: RemoteKey) {
    if (key === 'POWER') return true;
    const names = KEY_NAMES[key];
    if (!names) return false;
    if (!this.ready || this.codes.size === 0) return true;
    return names.some((n) => this.codes.has(n) || FALLBACK[n] !== undefined);
  }

  async connect() {
    if (!this.device.paired || !this.device.clientId) throw new NotPairedError();
    let r: RpcResult;
    try {
      r = await rpc(this.device.ip, 'system', 'getRemoteControllerInfo', [], this.auth());
    } catch {
      throw new Error('Não foi possível ligar à TV Sony. Verifica se a TV está ligada e na mesma rede.');
    }
    const list: { name: string; value: string }[] = r.json?.result?.[1] ?? [];
    this.codes = new Map(list.map((c) => [c.name, c.value]));
    this.ready = true;
  }

  private auth(): Auth {
    return { cookie: this.device.authCookie };
  }

  /** Renova o cookie com o PIN guardado. */
  private async reauth() {
    if (!this.device.pin || !this.device.clientId) throw new NotPairedError();
    const r = await register(this.device.ip, this.device.clientId, { pin: this.device.pin });
    if (r.status !== 200 || r.json?.error) throw new NotPairedError();
    if (r.cookie) {
      this.device = { ...this.device, authCookie: r.cookie };
      this.onDeviceUpdate({ authCookie: r.cookie });
    }
  }

  private async withAuth<T extends { status: number }>(fn: () => Promise<T>, failed: (r: T) => boolean) {
    let r = await fn();
    if (failed(r)) {
      await this.reauth();
      r = await fn();
      if (failed(r)) throw new NotPairedError();
    }
    return r;
  }

  private code(key: RemoteKey): string | undefined {
    for (const n of KEY_NAMES[key] ?? []) {
      const c = this.codes.get(n) ?? FALLBACK[n];
      if (c) return c;
    }
    return undefined;
  }

  private sendIrcc(code: string) {
    const body =
      '<?xml version="1.0"?>' +
      '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
      '<s:Body><u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1">' +
      `<IRCCCode>${code}</IRCCCode>` +
      '</u:X_SendIRCC></s:Body></s:Envelope>';
    return this.withAuth(
      () =>
        post(
          `http://${this.device.ip}/sony/IRCC`,
          body,
          {
            'Content-Type': 'text/xml; charset=UTF-8',
            SOAPACTION: '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"',
          },
          this.auth(),
          4000,
        ),
      (res) => res.status === 401 || res.status === 403,
    );
  }

  private async togglePower() {
    const st = await rpc(this.device.ip, 'system', 'getPowerStatus', [], this.auth());
    const on = st.json?.result?.[0]?.status === 'active';
    const r = await this.withAuth(
      () => rpc(this.device.ip, 'system', 'setPowerStatus', [{ status: !on }], this.auth()),
      isAuthError,
    );
    if (r.status !== 200 || r.json?.error) {
      // Alternativa: tecla de energia por IRCC.
      const code = this.codes.get('TvPower') ?? this.codes.get('Power') ?? FALLBACK.Power;
      await this.sendIrcc(code);
    }
  }

  async send(key: RemoteKey) {
    if (!this.ready) await this.connect();
    if (key === 'POWER') {
      await this.togglePower();
      return;
    }
    const code = this.code(key);
    if (!code) return;
    const res = await this.sendIrcc(code);
    if (res.status !== 200) throw new Error(`A TV rejeitou o comando (HTTP ${res.status}).`);
  }

  private apps?: { title: string; uri: string }[];

  async launchApp(app: AppId) {
    if (!this.ready) await this.connect();
    if (!this.apps) {
      const r = await this.withAuth(
        () => rpc(this.device.ip, 'appControl', 'getApplicationList', [], this.auth()),
        isAuthError,
      );
      this.apps = (r.json?.result?.[0] ?? []).map((a: any) => ({ title: String(a.title), uri: String(a.uri) }));
    }
    const found = this.apps!.find((a) => SONY_TITLES[app].test(a.title));
    if (!found) throw new Error(`${appLabel(app)} não está instalada nesta TV.`);
    const r = await this.withAuth(
      () => rpc(this.device.ip, 'appControl', 'setActiveApp', [{ uri: found.uri }], this.auth()),
      isAuthError,
    );
    if (r.json?.error) throw new Error(`A TV não abriu ${found.title} (erro ${r.json.error[0]}).`);
  }

  async sendText(text: string) {
    if (!this.ready) await this.connect();
    const r = await this.withAuth(
      () => rpc(this.device.ip, 'appControl', 'setTextForm', [text], this.auth()),
      isAuthError,
    );
    if (r.json?.error) throw new Error('Não há nenhum campo de texto ativo na TV. Seleciona primeiro um campo de pesquisa.');
  }

  disconnect() {}
}
