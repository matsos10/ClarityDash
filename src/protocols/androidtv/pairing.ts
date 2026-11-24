import forge from 'node-forge';
import { concatBytes, OpenedSocket, openSocket, toBytes } from '../../net/socket';
import { ClientIdentity } from './identity';
import { decode, fBytes, fMsg, fString, fVarint, frame, FrameReader, getNum } from './protobuf';

export const PAIRING_PORT = 6467;

const PROTOCOL_VERSION = 2;
const STATUS_OK = 200;
const ENCODING_HEXADECIMAL = 3;
const ROLE_INPUT = 1;

// Campos de PairingMessage (polo.proto)
const F_PAIRING_REQUEST = 10;
const F_PAIRING_REQUEST_ACK = 11;
const F_PAIRING_OPTION = 20;
const F_PAIRING_CONFIGURATION = 30;
const F_PAIRING_CONFIGURATION_ACK = 31;
const F_PAIRING_SECRET = 40;
const F_PAIRING_SECRET_ACK = 41;

const pairingMessage = (inner: Uint8Array) =>
  frame(concatBytes(fVarint(1, PROTOCOL_VERSION), fVarint(2, STATUS_OK), inner));

const hexEncoding = () => fMsg(1, fVarint(1, ENCODING_HEXADECIMAL), fVarint(2, 6));

function hexToBytes(hex: string): string {
  let h = hex.replace(/^0x/i, '');
  if (h.length % 2) h = '0' + h;
  return forge.util.hexToBytes(h);
}

/**
 * Calcula o segredo de emparelhamento:
 * SHA-256(módulo cliente, expoente cliente, módulo servidor, expoente servidor, código[2:]).
 * O primeiro byte do hash tem de coincidir com os 2 primeiros dígitos do código.
 */
export function computeSecret(
  client: { modulus: string; exponent: string },
  server: { modulus: string; exponent: string },
  code: string,
): Uint8Array {
  const md = forge.md.sha256.create();
  md.update(hexToBytes(client.modulus));
  md.update(hexToBytes(client.exponent));
  md.update(hexToBytes(server.modulus));
  md.update(hexToBytes(server.exponent));
  md.update(hexToBytes(code.slice(2)));
  const digest = md.digest().getBytes();
  const out = new Uint8Array(digest.length);
  for (let i = 0; i < digest.length; i++) out[i] = digest.charCodeAt(i);
  return out;
}

/**
 * Sessão de emparelhamento: liga à porta 6467, pede à TV para mostrar
 * um código de 6 caracteres e depois envia o segredo derivado desse código.
 */
export class PairingSession {
  private conn?: OpenedSocket;
  private waiters: { field: number; resolve: () => void; reject: (e: Error) => void }[] = [];
  private failure?: Error;

  constructor(
    private host: string,
    private identity: ClientIdentity,
    private clientName: string,
  ) {}

  /** Liga à TV e resolve quando o código já está a ser mostrado no ecrã. */
  async start(): Promise<void> {
    this.conn = await openSocket({
      host: this.host,
      port: PAIRING_PORT,
      tls: true,
      cert: this.identity.certPem,
      key: this.identity.keyPem,
      timeoutMs: 6000,
    });
    const reader = new FrameReader((m) => this.handle(m));
    this.conn.socket.on('data', (d) => reader.push(toBytes(d)));
    this.conn.socket.on('error', (e) => this.fail(e));
    this.conn.socket.on('close', () => this.fail(new Error('A TV fechou a ligação de emparelhamento')));

    this.write(fMsg(F_PAIRING_REQUEST, fString(1, 'atvremote'), fString(2, this.clientName)));
    await this.waitFor(F_PAIRING_REQUEST_ACK);
    this.write(fMsg(F_PAIRING_OPTION, hexEncoding(), fVarint(3, ROLE_INPUT)));
    await this.waitFor(F_PAIRING_OPTION);
    this.write(fMsg(F_PAIRING_CONFIGURATION, hexEncoding(), fVarint(2, ROLE_INPUT)));
    await this.waitFor(F_PAIRING_CONFIGURATION_ACK);
  }

  /** Envia o código mostrado na TV. */
  async finish(code: string): Promise<void> {
    const clean = code.trim().toUpperCase();
    if (!/^[0-9A-F]{6}$/.test(clean)) throw new Error('O código tem 6 caracteres (0-9, A-F).');
    if (!this.conn) throw new Error('Emparelhamento não iniciado');

    const server = await this.conn.getPeerCertificate();
    const secret = computeSecret(
      { modulus: this.identity.modulusHex, exponent: this.identity.exponentHex },
      server,
      clean,
    );
    if (secret[0] !== parseInt(clean.slice(0, 2), 16)) {
      throw new Error('Código incorreto. Confirma o código mostrado na TV.');
    }
    this.write(fMsg(F_PAIRING_SECRET, fBytes(1, secret)));
    await this.waitFor(F_PAIRING_SECRET_ACK);
    this.close();
  }

  close() {
    const c = this.conn;
    this.conn = undefined;
    try {
      c?.socket.destroy();
    } catch {}
  }

  private write(inner: Uint8Array) {
    this.conn?.socket.write(pairingMessage(inner));
  }

  private waitFor(field: number): Promise<void> {
    if (this.failure) return Promise.reject(this.failure);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('A TV não respondeu ao pedido de emparelhamento'));
      }, 15000);
      this.waiters.push({
        field,
        resolve: () => {
          clearTimeout(timer);
          resolve();
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        },
      });
    });
  }

  private handle(raw: Uint8Array) {
    const msg = decode(raw);
    const status = getNum(msg, 2);
    if (status !== STATUS_OK) {
      this.fail(new Error(status === 402 ? 'Código incorreto.' : `A TV rejeitou o emparelhamento (estado ${status}).`));
      return;
    }
    for (const w of [...this.waiters]) {
      if (msg.has(w.field)) {
        this.waiters.splice(this.waiters.indexOf(w), 1);
        w.resolve();
      }
    }
  }

  private fail(e: Error) {
    if (!this.failure) this.failure = e;
    const ws = this.waiters;
    this.waiters = [];
    ws.forEach((w) => w.reject(e));
  }
}
