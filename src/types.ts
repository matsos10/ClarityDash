export type Protocol = 'samsung' | 'androidtv' | 'roku' | 'sony';

export interface TvDevice {
  id: string;
  name: string;
  ip: string;
  protocol: Protocol;
  /** Samsung: token devolvido pela TV depois de aceitar o pedido (porta 8002). */
  token?: string;
  /** Samsung: a TV exige ligação segura (wss na porta 8002). */
  secure?: boolean;
  /** Android TV / Google TV e Sony: emparelhamento concluído. */
  paired?: boolean;
  /** Sony: identificador desta app registado na TV. */
  clientId?: string;
  /** Sony: PIN usado no registo (permite renovar a sessão). */
  pin?: string;
  /** Sony: cookie de autenticação devolvido pela TV. */
  authCookie?: string;
}

export type RemoteKey =
  | 'POWER'
  | 'SOURCE'
  | 'HOME'
  | 'BACK'
  | 'MENU'
  | 'INFO'
  | 'GUIDE'
  | 'UP'
  | 'DOWN'
  | 'LEFT'
  | 'RIGHT'
  | 'OK'
  | 'VOL_UP'
  | 'VOL_DOWN'
  | 'MUTE'
  | 'CH_UP'
  | 'CH_DOWN'
  | 'PLAY'
  | 'PAUSE'
  | 'STOP'
  | 'REWIND'
  | 'FAST_FORWARD'
  | 'RED'
  | 'GREEN'
  | 'YELLOW'
  | 'BLUE'
  | 'NUM_0'
  | 'NUM_1'
  | 'NUM_2'
  | 'NUM_3'
  | 'NUM_4'
  | 'NUM_5'
  | 'NUM_6'
  | 'NUM_7'
  | 'NUM_8'
  | 'NUM_9';

export type ConnectionStatus = 'idle' | 'connecting' | 'waiting_tv' | 'connected' | 'error';

export interface TvRemote {
  connect(): Promise<void>;
  send(key: RemoteKey): Promise<void>;
  supports(key: RemoteKey): boolean;
  disconnect(): void;
}

export const PROTOCOL_LABEL: Record<Protocol, string> = {
  samsung: 'Samsung (Tizen)',
  androidtv: 'TCL (Android TV / Google TV)',
  roku: 'TCL (Roku TV)',
  sony: 'Sony (Bravia)',
};
