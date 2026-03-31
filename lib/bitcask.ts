import { promises as fs } from "node:fs";
import path from "node:path";

import { BITCASK_HEADER_SIZE, type KeydirEntry } from "./bitcaskFormat";

export { BITCASK_HEADER_SIZE, type KeydirEntry } from "./bitcaskFormat";

const ACTIVE_FILE = "active.data";

export class Bitcask {
  private readonly keydir = new Map<string, KeydirEntry>();

  private appendPos = 0;

  private constructor(
    private readonly filePath: string,
    private readonly handle: fs.FileHandle,
  ) {}

  static async open(dataDir: string): Promise<Bitcask> {
    await fs.mkdir(dataDir, { recursive: true });
    const filePath = path.join(dataDir, ACTIVE_FILE);
    const handle = await fs.open(filePath, "a+");
    const store = new Bitcask(filePath, handle);
    await store.reloadFromDisk();
    return store;
  }

  /** Rebuild keydir by scanning the log (used on open and for tests). */
  async reloadFromDisk(): Promise<void> {
    this.keydir.clear();
    const stat = await this.handle.stat();
    let pos = 0;

    while (pos < stat.size) {
      if (pos + BITCASK_HEADER_SIZE > stat.size) {
        throw new Error(
          `bitcask: truncated header at offset ${pos} in ${this.filePath}`,
        );
      }

      const header = Buffer.alloc(BITCASK_HEADER_SIZE);
      await this.handle.read(header, 0, BITCASK_HEADER_SIZE, pos);
      const timestamp = header.readUInt32BE(0);
      const keyLen = header.readUInt32BE(4);
      const valueLen = header.readUInt32BE(8);
      const bodyLen = keyLen + valueLen;

      if (pos + BITCASK_HEADER_SIZE + bodyLen > stat.size) {
        throw new Error(
          `bitcask: truncated record at offset ${pos} in ${this.filePath}`,
        );
      }

      const keyBuf = Buffer.alloc(keyLen);
      await this.handle.read(keyBuf, 0, keyLen, pos + BITCASK_HEADER_SIZE);

      const key = keyBuf.toString("utf8");

      if (valueLen === 0) {
        this.keydir.delete(key);
      } else {
        const valuePos = pos + BITCASK_HEADER_SIZE + keyLen;
        this.keydir.set(key, { valuePos, valueSize: valueLen, timestamp });
      }

      pos += BITCASK_HEADER_SIZE + bodyLen;
    }

    this.appendPos = stat.size;
  }

  /**
   * Reads the value for `key` from the append-only log via the in-memory keydir.
   */
  async getValue(key: string): Promise<Buffer | undefined> {
    const entry = this.keydir.get(key);
    if (!entry) {
      return undefined;
    }

    const buf = Buffer.alloc(entry.valueSize);
    const { bytesRead } = await this.handle.read(buf, 0, entry.valueSize, entry.valuePos);
    if (bytesRead !== entry.valueSize) {
      throw new Error(`bitcask: short read for key '${key}'`);
    }

    return buf;
  }

  async put(key: string, value: Buffer | string): Promise<void> {
    if (value.length === 0) {
      throw new Error("bitcask: empty value is not supported (reserved for tombstones)");
    }

    const keyBuf = Buffer.from(key, "utf8");
    const valBuf = Buffer.isBuffer(value) ? value : Buffer.from(value, "utf8");
    const timestamp = (Date.now() / 1000) | 0;

    const header = Buffer.alloc(BITCASK_HEADER_SIZE);
    header.writeUInt32BE(timestamp, 0);
    header.writeUInt32BE(keyBuf.length, 4);
    header.writeUInt32BE(valBuf.length, 8);

    await this.handle.write(header, 0, header.length, this.appendPos);
    this.appendPos += header.length;
    await this.handle.write(keyBuf, 0, keyBuf.length, this.appendPos);
    this.appendPos += keyBuf.length;
    const valuePos = this.appendPos;
    await this.handle.write(valBuf, 0, valBuf.length, this.appendPos);
    this.appendPos += valBuf.length;

    this.keydir.set(key, {
      valuePos,
      valueSize: valBuf.length,
      timestamp,
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.keydir.has(key)) {
      return;
    }

    const keyBuf = Buffer.from(key, "utf8");
    const timestamp = (Date.now() / 1000) | 0;

    const header = Buffer.alloc(BITCASK_HEADER_SIZE);
    header.writeUInt32BE(timestamp, 0);
    header.writeUInt32BE(keyBuf.length, 4);
    header.writeUInt32BE(0, 8);

    await this.handle.write(header, 0, header.length, this.appendPos);
    this.appendPos += header.length;
    await this.handle.write(keyBuf, 0, keyBuf.length, this.appendPos);
    this.appendPos += keyBuf.length;

    this.keydir.delete(key);
  }

  has(key: string): boolean {
    return this.keydir.has(key);
  }

  /** Sorted key list from the in-memory keydir (latest put per key). */
  listKeys(): string[] {
    return [...this.keydir.keys()].sort((a, b) => a.localeCompare(b));
  }

  async close(): Promise<void> {
    await this.handle.close();
  }
}
