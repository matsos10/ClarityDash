import { ROKU_CHANNELS } from '../apps';
import { AppId, RemoteKey, TvDevice, TvRemote } from '../types';

/** Roku External Control Protocol (TVs TCL Roku), porta 8060. */
const KEYS: Partial<Record<RemoteKey, string>> = {
  POWER: 'Power',
  HOME: 'Home',
  BACK: 'Back',
  MENU: 'Info',
  INFO: 'Info',
  UP: 'Up',
  DOWN: 'Down',
  LEFT: 'Left',
  RIGHT: 'Right',
  OK: 'Select',
  VOL_UP: 'VolumeUp',
  VOL_DOWN: 'VolumeDown',
  MUTE: 'VolumeMute',
  CH_UP: 'ChannelUp',
  CH_DOWN: 'ChannelDown',
  PLAY: 'Play',
  PAUSE: 'Play',
  REWIND: 'Rev',
  FAST_FORWARD: 'Fwd',
  NUM_0: 'Lit_0',
  NUM_1: 'Lit_1',
  NUM_2: 'Lit_2',
  NUM_3: 'Lit_3',
  NUM_4: 'Lit_4',
  NUM_5: 'Lit_5',
  NUM_6: 'Lit_6',
  NUM_7: 'Lit_7',
  NUM_8: 'Lit_8',
  NUM_9: 'Lit_9',
};

async function request(url: string, method: 'GET' | 'POST', timeoutMs: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { method, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function fetchRokuInfo(ip: string, timeoutMs = 1500): Promise<{ name: string } | null> {
  try {
    const res = await request(`http://${ip}:8060/query/device-info`, 'GET', timeoutMs);
    if (!res.ok) return null;
    const xml = await res.text();
    if (!xml.includes('<device-info')) return null;
    const tag = (t: string) => xml.match(new RegExp(`<${t}>([^<]*)</${t}>`))?.[1]?.trim();
    const name = tag('user-device-name') || tag('friendly-device-name') || tag('default-device-name');
    const vendor = tag('vendor-name') || 'Roku';
    return { name: name || `${vendor} Roku TV` };
  } catch {
    return null;
  }
}

export class RokuRemote implements TvRemote {
  constructor(private device: TvDevice) {}

  supports(key: RemoteKey) {
    return KEYS[key] !== undefined;
  }

  async connect() {
    const info = await fetchRokuInfo(this.device.ip, 3000);
    if (!info) throw new Error('Roku TV não encontrada. Verifica o IP e se "Controlo por apps móveis" está ativo.');
  }

  async send(key: RemoteKey) {
    const code = KEYS[key];
    if (!code) return;
    const res = await request(`http://${this.device.ip}:8060/keypress/${code}`, 'POST', 3000);
    if (res.status === 403) {
      throw new Error('A TV bloqueou o controlo. Ativa "Controlo por apps móveis" nas definições da TV.');
    }
  }

  async launchApp(app: AppId) {
    const res = await request(`http://${this.device.ip}:8060/launch/${ROKU_CHANNELS[app]}`, 'POST', 5000);
    if (!res.ok) throw new Error('A aplicação não está instalada na TV.');
  }

  async sendText(text: string) {
    for (const ch of text) {
      await request(`http://${this.device.ip}:8060/keypress/Lit_${encodeURIComponent(ch)}`, 'POST', 3000);
    }
  }

  disconnect() {}
}
