import * as Network from 'expo-network';
import { fetchAndroidTvName, isAndroidTv } from './protocols/androidtv/remote';
import { fetchRokuInfo } from './protocols/roku';
import { fetchSamsungInfo } from './protocols/samsung';
import { fetchSonyInfo } from './protocols/sony';
import { Protocol, TvDevice } from './types';

export function deviceId(ip: string, protocol: Protocol) {
  return `${protocol}@${ip}`;
}

/** Identifica o tipo de TV num IP (Samsung, Sony, Roku ou Android TV). */
export async function identify(ip: string, timeoutMs = 1500): Promise<TvDevice | null> {
  const [samsung, roku, sony] = await Promise.all([
    fetchSamsungInfo(ip, timeoutMs),
    fetchRokuInfo(ip, timeoutMs),
    fetchSonyInfo(ip, timeoutMs),
  ]);
  if (samsung) {
    return { id: deviceId(ip, 'samsung'), ip, protocol: 'samsung', name: samsung.name, secure: samsung.secure };
  }
  if (sony) {
    return { id: deviceId(ip, 'sony'), ip, protocol: 'sony', name: sony.name };
  }
  if (roku) {
    return { id: deviceId(ip, 'roku'), ip, protocol: 'roku', name: roku.name };
  }
  if (await isAndroidTv(ip, timeoutMs)) {
    const name = (await fetchAndroidTvName(ip, timeoutMs)) ?? 'TCL Android TV';
    return { id: deviceId(ip, 'androidtv'), ip, protocol: 'androidtv', name };
  }
  return null;
}

/** Percorre a sub-rede /24 do telemóvel à procura de TVs. */
export async function scanNetwork(
  onFound: (d: TvDevice) => void,
  onProgress: (done: number, total: number) => void,
  shouldStop: () => boolean,
): Promise<void> {
  const ip = await Network.getIpAddressAsync();
  const m = ip?.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m || ip === '0.0.0.0') {
    throw new Error('Não foi possível obter o IP do telemóvel. Liga-te à mesma rede Wi-Fi da TV.');
  }
  const prefix = `${m[1]}.${m[2]}.${m[3]}.`;
  const hosts: string[] = [];
  for (let i = 1; i <= 254; i++) if (`${prefix}${i}` !== ip) hosts.push(`${prefix}${i}`);

  let done = 0;
  let next = 0;
  const worker = async () => {
    while (next < hosts.length && !shouldStop()) {
      const host = hosts[next++];
      const dev = await identify(host, 1200).catch(() => null);
      if (dev) onFound(dev);
      done++;
      onProgress(done, hosts.length);
    }
  };
  await Promise.all(Array.from({ length: 32 }, worker));
}
