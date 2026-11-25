import { Buffer } from 'buffer';
import TcpSocket from 'react-native-tcp-socket';

/** Subconjunto comum entre react-native-tcp-socket e o módulo `net`/`tls` do Node. */
export interface Sock {
  on(event: 'data', cb: (data: Uint8Array | string) => void): unknown;
  on(event: 'error', cb: (err: Error) => void): unknown;
  on(event: 'close', cb: (hadError?: boolean) => void): unknown;
  write(data: Uint8Array | string): unknown;
  destroy(): unknown;
}

export interface PeerCertificate {
  /** Módulo RSA em hexadecimal. */
  modulus: string;
  /** Expoente RSA em hexadecimal (com ou sem prefixo 0x). */
  exponent: string;
}

export interface OpenedSocket {
  socket: Sock;
  getPeerCertificate(): Promise<PeerCertificate>;
}

export interface OpenOptions {
  host: string;
  port: number;
  tls?: boolean;
  /** Certificado de cliente (PEM) para TLS mútuo. */
  cert?: string;
  /** Chave privada PKCS#8 (PEM) do certificado de cliente. */
  key?: string;
  timeoutMs?: number;
}

export type SocketFactory = (opts: OpenOptions) => Promise<OpenedSocket>;

/** O react-native-tcp-socket emite erros como texto; converte sempre para Error. */
export function toError(e: unknown, fallback = 'Erro de ligação'): Error {
  if (e instanceof Error) return e;
  const msg = typeof e === 'string' ? e : (e as any)?.message;
  return new Error(msg ? String(msg) : fallback);
}

function wrapNative(s: any): Sock {
  return {
    on: (event: string, cb: (...args: any[]) => void) =>
      s.on(event, event === 'error' ? (e: unknown) => cb(toError(e)) : cb),
    write: (d: Uint8Array | string) => s.write(d),
    destroy: () => s.destroy(),
  } as Sock;
}

const nativeFactory: SocketFactory = (opts) =>
  new Promise((resolve, reject) => {
    const timeoutMs = opts.timeoutMs ?? 5000;
    let settled = false;
    let sock: any;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try {
        sock?.destroy();
      } catch {}
      reject(new Error(`Tempo esgotado ao ligar a ${opts.host}:${opts.port}`));
    }, timeoutMs);

    const onReady = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        socket: wrapNative(sock),
        getPeerCertificate: async () => {
          const c = await sock.getPeerCertificate();
          return { modulus: String(c.modulus), exponent: String(c.exponent) };
        },
      });
    };

    const onError = (err: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        sock?.destroy();
      } catch {}
      reject(toError(err, `Falha ao ligar a ${opts.host}:${opts.port}`));
    };

    const base = { host: opts.host, port: opts.port, connectTimeout: timeoutMs };
    if (opts.tls) {
      const tlsOpts: any = { ...base, rejectUnauthorized: false };
      if (opts.cert && opts.key) {
        tlsOpts.cert = opts.cert;
        tlsOpts.key = opts.key;
        tlsOpts.certAlias = 'telecomando-cert';
        tlsOpts.keyAlias = 'telecomando-key';
      }
      sock = TcpSocket.connectTLS(tlsOpts, onReady);
    } else {
      sock = TcpSocket.createConnection(base, onReady);
    }
    sock.once('error', onError);
  });

let factory: SocketFactory = nativeFactory;

export function openSocket(opts: OpenOptions): Promise<OpenedSocket> {
  return factory(opts);
}

/** Permite substituir a implementação (ex.: testes em Node). */
export function setSocketFactory(f: SocketFactory) {
  factory = f;
}

export function toBytes(data: Uint8Array | string): Uint8Array {
  if (typeof data === 'string') {
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) out[i] = data.charCodeAt(i) & 0xff;
    return out;
  }
  return data;
}

export function concatBytes(...parts: Uint8Array[]): Uint8Array {
  let len = 0;
  for (const p of parts) len += p.length;
  const out = new Uint8Array(len);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

export function utf8Encode(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s, 'utf8'));
}

export function utf8Decode(b: Uint8Array): string {
  return Buffer.from(b).toString('utf8');
}

/** Testa se uma porta TCP está aberta. */
export async function probePort(host: string, port: number, timeoutMs = 1200): Promise<boolean> {
  try {
    const { socket } = await openSocket({ host, port, timeoutMs });
    socket.destroy();
    return true;
  } catch {
    return false;
  }
}
