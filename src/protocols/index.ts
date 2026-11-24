import { TvDevice, TvRemote } from '../types';
import { AndroidTvRemote } from './androidtv/remote';
import { RokuRemote } from './roku';
import { SamsungRemote } from './samsung';

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
  }
}
