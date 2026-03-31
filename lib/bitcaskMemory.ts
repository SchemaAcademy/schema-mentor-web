import { BITCASK_HEADER_SIZE, type KeydirEntry } from "./bitcaskFormat";

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

function writeHeaderBE(timestamp: number, keyLen: number, valueLen: number): Uint8Array {
  const buf = new ArrayBuffer(BITCASK_HEADER_SIZE);
  const view = new DataView(buf);
  view.setUint32(0, timestamp, false);
  view.setUint32(4, keyLen, false);
  view.setUint32(8, valueLen, false);
  return new Uint8Array(buf);
}

function readHeaderBE(
  log: Uint8Array,
  pos: number,
): { timestamp: number; keyLen: number; valueLen: number } {
  const view = new DataView(log.buffer, log.byteOffset + pos, BITCASK_HEADER_SIZE);
  return {
    timestamp: view.getUint32(0, false),
    keyLen: view.getUint32(4, false),
    valueLen: view.getUint32(8, false),
  };
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf8", { fatal: false });

/**
 * In-memory Bitcask-style store (same record layout as {@link ./bitcask}).
 * Safe for the browser and for `output: "export"` static builds.
 */
export class BitcaskMemory {
  private log = new Uint8Array(0);

  private readonly keydir = new Map<string, KeydirEntry>();

  private appendPos = 0;

  /** UTF-8 string value (POC UI uses text payloads). */
  getValueUtf8(key: string): string | undefined {
    const entry = this.keydir.get(key);
    if (!entry) {
      return undefined;
    }
    const slice = this.log.subarray(entry.valuePos, entry.valuePos + entry.valueSize);
    return textDecoder.decode(slice);
  }

  put(key: string, value: string): void {
    if (value.length === 0) {
      throw new Error("bitcask: empty value is not supported (reserved for tombstones)");
    }

    const keyBytes = textEncoder.encode(key);
    const valBytes = textEncoder.encode(value);
    const timestamp = (Date.now() / 1000) | 0;

    const header = writeHeaderBE(timestamp, keyBytes.length, valBytes.length);
    const record = concatBytes(header, keyBytes, valBytes);
    const start = this.appendPos;
    this.log = new Uint8Array(concatBytes(this.log, record));
    const valuePos = start + BITCASK_HEADER_SIZE + keyBytes.length;
    this.appendPos += record.length;

    this.keydir.set(key, {
      valuePos,
      valueSize: valBytes.length,
      timestamp,
    });
  }

  delete(key: string): void {
    if (!this.keydir.has(key)) {
      return;
    }

    const keyBytes = textEncoder.encode(key);
    const timestamp = (Date.now() / 1000) | 0;
    const header = writeHeaderBE(timestamp, keyBytes.length, 0);
    const record = concatBytes(header, keyBytes);
    this.log = new Uint8Array(concatBytes(this.log, record));
    this.appendPos += record.length;

    this.keydir.delete(key);
  }

  has(key: string): boolean {
    return this.keydir.has(key);
  }

  listKeys(): string[] {
    return [...this.keydir.keys()].sort((a, b) => a.localeCompare(b));
  }

  getLogByteLength(): number {
    return this.log.length;
  }

  /** Rebuild keydir from the current log (same semantics as disk replay). */
  replay(): void {
    this.keydir.clear();
    let pos = 0;
    const size = this.log.length;

    while (pos < size) {
      if (pos + BITCASK_HEADER_SIZE > size) {
        throw new Error(`bitcask: truncated header at offset ${pos}`);
      }

      const { timestamp, keyLen, valueLen } = readHeaderBE(this.log, pos);
      const bodyLen = keyLen + valueLen;

      if (pos + BITCASK_HEADER_SIZE + bodyLen > size) {
        throw new Error(`bitcask: truncated record at offset ${pos}`);
      }

      const keySlice = this.log.subarray(
        pos + BITCASK_HEADER_SIZE,
        pos + BITCASK_HEADER_SIZE + keyLen,
      );
      const keyStr = textDecoder.decode(keySlice);

      if (valueLen === 0) {
        this.keydir.delete(keyStr);
      } else {
        const valuePos = pos + BITCASK_HEADER_SIZE + keyLen;
        this.keydir.set(keyStr, { valuePos, valueSize: valueLen, timestamp });
      }

      pos += BITCASK_HEADER_SIZE + bodyLen;
    }

    this.appendPos = size;
  }
}
