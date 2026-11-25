import { TvDevice, TvRemote } from '../types';
import { startPairing as startAndroidTvPairing, AndroidTvRemote } from './androidtv/remote';
import { RokuRemote } from './roku';
import { SamsungRemote } from './samsung';
import { SonyRemote, startSonyPairing } from './sony';

export { NotPairedError } from './errors';

export interface RemoteCallbacks {
  onDeviceUpdate: (patch: Partial<TvDevice>) => void;
  onWaitingForTv: () => void;
  onDisconnect: () => void;
}

export function createRemote(device: TvDevice, cb: RemoteCallbacks): TvRemote {
  switch (device.protocol) {
    case 'samsung':
      return new SamsungRemote(device, (token) => cb.onDeviceUpdate({ token }), cb.onWaitingForTv, cb.onDisconnect);
    case 'androidtv':
      return new AndroidTvRemote(device, cb.onDisconnect);
    case 'roku':
      return new RokuRemote(device);
    case 'sony':
      return new SonyRemote(device, cb.onDeviceUpdate);
  }
}

/** Emparelhamento com código mostrado na TV. */
export interface PairingFlow {
  title: string;
  hint: string;
  placeholder: string;
  codeLength: number;
  numeric: boolean;
  /** Envia o código; devolve os dados a guardar no dispositivo. */
  finish(code: string): Promise<Partial<TvDevice>>;
  close(): void;
}

export function needsPairing(device: TvDevice) {
  return (device.protocol === 'androidtv' || device.protocol === 'sony') && !device.paired;
}

/**
 * Inicia o emparelhamento. Devolve `patch` quando a TV aceitou sem código
 * (só acontece em algumas Sony) ou `flow` para pedir o código ao utilizador.
 */
export async function startPairing(
  device: TvDevice,
): Promise<{ flow?: PairingFlow; patch?: Partial<TvDevice> }> {
  if (device.protocol === 'sony') {
    const p = await startSonyPairing(device);
    if (p.done) return { patch: p.done };
    return {
      flow: {
        title: 'Registar na TV Sony',
        hint: 'Introduz o PIN de 4 dígitos que aparece no ecrã da TV.',
        placeholder: '0000',
        codeLength: 4,
        numeric: true,
        finish: (code) => p.finish(code),
        close: () => {},
      },
    };
  }
  const session = await startAndroidTvPairing(device.ip);
  return {
    flow: {
      title: 'Emparelhar com a TV',
      hint: 'Introduz o código de 6 caracteres que aparece no ecrã da TV.',
      placeholder: 'A1B2C3',
      codeLength: 6,
      numeric: false,
      finish: async (code) => {
        await session.finish(code);
        return { paired: true };
      },
      close: () => session.close(),
    },
  };
}
