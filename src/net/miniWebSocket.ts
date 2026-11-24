import { concatBytes, openSocket, Sock, toBytes, utf8Decode, utf8Encode } from './socket';

/**
 * Cliente WebSocket mínimo (RFC 6455) sobre socket TCP/TLS.
 * Necessário porque o WebSocket nativo do React Native rejeita o
 * certificado auto-assinado das TVs Samsung (wss na porta 8002).
 */
export class MiniWebSocket {
  onmessage?: (text: string) => void;
  onclose?: () => void;

  private sock?: Sock;
  private buf: Uint8Array = new Uint8Array(0);
  private open = false;
  private fragments: Uint8Array[] = [];

  constructor(
    private host: string,
    private port: number,
    private path: string,
    private tls: boolean,
  ) {}

  async connect(timeoutMs = 5000): Promise<void> {
    const { socket } = await openSocket({
      host: this.host,
      port: this.port,
      tls: this.tls,
      timeoutMs,
    });
    this.sock = socket;

    const key = base64(randomBytes(16));
    const req =
      `GET ${this.path} HTTP/1.1\r\n` +
      `Host: ${this.host}:${this.port}\r\n` +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Key: ${key}\r\n` +
      'Sec-WebSocket-Version: 13\r\n\r\n';

    await new Promise<void>((resolve, reject) => {
      let handshakeDone = false;
      const timer = setTimeout(() => {
        if (!handshakeDone) {
          this.close();
          reject(new Error('Tempo esgotado no handshake WebSocket'));
        }
      }, timeoutMs);

      socket.on('data', (chunk) => {
        this.buf = concatBytes(this.buf, toBytes(chunk));
        if (!handshakeDone) {
          const end = indexOfHeaderEnd(this.buf);
          if (end < 0) return;
          const head = utf8Decode(this.buf.subarray(0, end));
          this.buf = this.buf.slice(end + 4);
          handshakeDone = true;
          clearTimeout(timer);
          if (!/^HTTP\/1\.[01] 101/.test(head)) {
            this.close();
            reject(new Error(`A TV recusou o WebSocket: ${head.split('\r\n')[0]}`));
            return;
          }
          this.open = true;
          resolve();
        }
        this.readFrames();
      });
      socket.on('error', (err) => {
        clearTimeout(timer);
        if (!handshakeDone) reject(err);
        this.handleClose();
      });
      socket.on('close', () => {
        clearTimeout(timer);
        if (!handshakeDone) reject(new Error('Ligação fechada pela TV'));
        this.handleClose();
      });
      socket.write(utf8Encode(req));
    });
  }

  get isOpen() {
    return this.open;
  }

  send(text: string) {
    if (!this.sock || !this.open) throw new Error('WebSocket fechado');
    this.sock.write(encodeFrame(0x1, utf8Encode(text)));
  }

  close() {
    if (this.sock) {
      try {
        if (this.open) this.sock.write(encodeFrame(0x8, new Uint8Array(0)));
      } catch {}
      try {
        this.sock.destroy();
      } catch {}
    }
    this.handleClose();
  }

  private handleClose() {
    const wasOpen = this.open;
    this.open = false;
    this.sock = undefined;
    if (wasOpen) this.onclose?.();
  }

  private readFrames() {
    for (;;) {
      const b = this.buf;
      if (b.length < 2) return;
      const fin = (b[0] & 0x80) !== 0;
      const opcode = b[0] & 0x0f;
      const masked = (b[1] & 0x80) !== 0;
      let len = b[1] & 0x7f;
      let off = 2;
      if (len === 126) {
        if (b.length < 4) return;
        len = (b[2] << 8) | b[3];
        off = 4;
      } else if (len === 127) {
        if (b.length < 10) return;
        len = 0;
        for (let i = 2; i < 10; i++) len = len * 256 + b[i];
        off = 10;
      }
      let mask: Uint8Array | undefined;
      if (masked) {
        if (b.length < off + 4) return;
        mask = b.subarray(off, off + 4);
        off += 4;
      }
      if (b.length < off + len) return;
      const payload = b.slice(off, off + len);
      if (mask) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
      this.buf = b.slice(off + len);

      if (opcode === 0x8) {
        this.close();
        return;
      } else if (opcode === 0x9) {
        this.sock?.write(encodeFrame(0xa, payload));
      } else if (opcode === 0x1 || opcode === 0x0) {
        this.fragments.push(payload);
        if (fin) {
          const text = utf8Decode(concatBytes(...this.fragments));
          this.fragments = [];
          this.onmessage?.(text);
        }
      }
    }
  }
}

function indexOfHeaderEnd(b: Uint8Array): number {
  for (let i = 0; i + 3 < b.length; i++) {
    if (b[i] === 13 && b[i + 1] === 10 && b[i + 2] === 13 && b[i + 3] === 10) return i;
  }
  return -1;
}

/** Trama de cliente (sempre mascarada). */
function encodeFrame(opcode: number, payload: Uint8Array): Uint8Array {
  const len = payload.length;
  let header: number[];
  if (len < 126) header = [0x80 | opcode, 0x80 | len];
  else if (len < 65536) header = [0x80 | opcode, 0x80 | 126, len >> 8, len & 0xff];
  else {
    header = [0x80 | opcode, 0x80 | 127, 0, 0, 0, 0];
    header.push((len >>> 24) & 0xff, (len >>> 16) & 0xff, (len >>> 8) & 0xff, len & 0xff);
  }
  const mask = randomBytes(4);
  const body = new Uint8Array(len);
  for (let i = 0; i < len; i++) body[i] = payload[i] ^ mask[i % 4];
  return concatBytes(new Uint8Array(header), mask, body);
}

function randomBytes(n: number): Uint8Array {
  const out = new Uint8Array(n);
  crypto.getRandomValues(out);
  return out;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function base64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const n = (a << 16) | (b << 8) | c;
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
    out += i + 1 < bytes.length ? B64[(n >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? B64[n & 63] : '=';
  }
  return out;
}
