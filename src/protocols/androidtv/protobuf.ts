import { concatBytes, utf8Encode } from '../../net/socket';

/** Codificação protobuf mínima (apenas varint e length-delimited). */

export function varint(n: number): Uint8Array {
  const out: number[] = [];
  let v = n >>> 0;
  while (v >= 0x80) {
    out.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  out.push(v);
  return new Uint8Array(out);
}

export function fVarint(field: number, value: number): Uint8Array {
  return concatBytes(varint((field << 3) | 0), varint(value));
}

export function fBytes(field: number, value: Uint8Array): Uint8Array {
  return concatBytes(varint((field << 3) | 2), varint(value.length), value);
}

export function fString(field: number, value: string): Uint8Array {
  return fBytes(field, utf8Encode(value));
}

export const fMsg = (field: number, ...parts: Uint8Array[]) => fBytes(field, concatBytes(...parts));

export type Fields = Map<number, (number | Uint8Array)[]>;

function readVarint(b: Uint8Array, pos: number): [number, number] {
  let result = 0;
  let mul = 1;
  for (;;) {
    if (pos >= b.length) throw new Error('varint truncado');
    const byte = b[pos++];
    result += (byte & 0x7f) * mul;
    if ((byte & 0x80) === 0) break;
    mul *= 128;
  }
  return [result, pos];
}

export function decode(b: Uint8Array): Fields {
  const fields: Fields = new Map();
  let pos = 0;
  while (pos < b.length) {
    let key: number;
    [key, pos] = readVarint(b, pos);
    const field = Math.floor(key / 8);
    const wire = key & 7;
    let value: number | Uint8Array;
    if (wire === 0) {
      [value, pos] = readVarint(b, pos);
    } else if (wire === 2) {
      let len: number;
      [len, pos] = readVarint(b, pos);
      value = b.slice(pos, pos + len);
      pos += len;
    } else if (wire === 5) {
      value = b.slice(pos, pos + 4);
      pos += 4;
    } else if (wire === 1) {
      value = b.slice(pos, pos + 8);
      pos += 8;
    } else {
      throw new Error(`wire type ${wire} não suportado`);
    }
    const list = fields.get(field) ?? [];
    list.push(value);
    fields.set(field, list);
  }
  return fields;
}

export const getNum = (f: Fields, n: number): number | undefined => {
  const v = f.get(n)?.[0];
  return typeof v === 'number' ? v : undefined;
};

export const getMsg = (f: Fields, n: number): Fields | undefined => {
  const v = f.get(n)?.[0];
  return v instanceof Uint8Array ? decode(v) : undefined;
};

/**
 * Leitor de mensagens prefixadas com o tamanho em varint,
 * formato usado pelo protocolo Android TV Remote v2.
 */
export class FrameReader {
  private buf: Uint8Array = new Uint8Array(0);

  constructor(private onMessage: (msg: Uint8Array) => void) {}

  push(chunk: Uint8Array) {
    this.buf = concatBytes(this.buf, chunk);
    for (;;) {
      let len: number;
      let pos: number;
      try {
        [len, pos] = readVarint(this.buf, 0);
      } catch {
        return;
      }
      if (this.buf.length < pos + len) return;
      const msg = this.buf.slice(pos, pos + len);
      this.buf = this.buf.slice(pos + len);
      this.onMessage(msg);
    }
  }
}

export const frame = (msg: Uint8Array) => concatBytes(varint(msg.length), msg);
