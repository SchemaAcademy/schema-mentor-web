import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Bitcask, BITCASK_HEADER_SIZE } from "./bitcask";

async function makeTempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "bitcask-test-"));
}

describe("Bitcask", () => {
  let dataDir: string | undefined;

  afterEach(async () => {
    if (dataDir) {
      await rm(dataDir, { recursive: true, force: true });
      dataDir = undefined;
    }
  });

  it("put and getValue round-trip for string and buffer payloads", async () => {
    dataDir = await makeTempDir();
    const store = await Bitcask.open(dataDir);

    const cases = [
      { key: "hello", value: "world", expected: "world" },
      { key: "bin", value: Buffer.from([0, 255, 1]), expected: Buffer.from([0, 255, 1]) },
    ];

    for (const { key, value, expected } of cases) {
      await store.put(key, value);
      const got = await store.getValue(key);
      expect(got).toBeDefined();
      if (Buffer.isBuffer(expected)) {
        expect(got).toEqual(expected);
      } else {
        expect(got?.toString("utf8")).toBe(expected);
      }
    }

    await store.close();
  });

  it("returns undefined for missing keys", async () => {
    dataDir = await makeTempDir();
    const store = await Bitcask.open(dataDir);
    expect(await store.getValue("nope")).toBeUndefined();
    await store.close();
  });

  it("rejects empty values (tombstone encoding)", async () => {
    dataDir = await makeTempDir();
    const store = await Bitcask.open(dataDir);
    await expect(store.put("k", "")).rejects.toThrow(/empty value/);
    await store.close();
  });

  it("delete removes key from keydir and getValue", async () => {
    dataDir = await makeTempDir();
    const store = await Bitcask.open(dataDir);
    await store.put("x", "1");
    expect(store.has("x")).toBe(true);
    await store.delete("x");
    expect(store.has("x")).toBe(false);
    expect(await store.getValue("x")).toBeUndefined();
    await store.close();
  });

  it("delete on missing key is a no-op", async () => {
    dataDir = await makeTempDir();
    const store = await Bitcask.open(dataDir);
    await store.delete("ghost");
    await store.close();
  });

  it("last put wins after sequential replay", async () => {
    dataDir = await makeTempDir();
    let store = await Bitcask.open(dataDir);
    await store.put("k", "a");
    await store.put("k", "b");
    expect((await store.getValue("k"))?.toString("utf8")).toBe("b");
    await store.close();

    store = await Bitcask.open(dataDir);
    expect((await store.getValue("k"))?.toString("utf8")).toBe("b");
    await store.close();
  });

  it("reopens empty store and supports new writes", async () => {
    dataDir = await makeTempDir();
    let store = await Bitcask.open(dataDir);
    await store.close();

    store = await Bitcask.open(dataDir);
    await store.put("fresh", "1");
    expect((await store.getValue("fresh"))?.toString("utf8")).toBe("1");
    await store.close();
  });

  it("throws on truncated log tail", async () => {
    dataDir = await makeTempDir();
    const store = await Bitcask.open(dataDir);
    await store.put("ok", "v");
    await store.close();

    const { readFile, writeFile } = await import("node:fs/promises");
    const activePath = path.join(dataDir, "active.data");
    const raw = await readFile(activePath);
    await writeFile(activePath, raw.subarray(0, raw.length - 1));

    await expect(Bitcask.open(dataDir)).rejects.toThrow(/truncated/);
  });

  it("table-driven multi-key isolation", async () => {
    dataDir = await makeTempDir();
    const store = await Bitcask.open(dataDir);

    const table: { key: string; value: string }[] = [
      { key: "a", value: "1" },
      { key: "b", value: "2" },
      { key: "c", value: "3" },
    ];

    for (const row of table) {
      await store.put(row.key, row.value);
    }

    for (const row of table) {
      expect((await store.getValue(row.key))?.toString("utf8")).toBe(row.value);
    }

    await store.close();
  });

  it("exports stable header size constant", () => {
    expect(BITCASK_HEADER_SIZE).toBe(12);
  });

  it("listKeys returns sorted keys from keydir", async () => {
    dataDir = await makeTempDir();
    const store = await Bitcask.open(dataDir);
    const table = [
      { key: "z", value: "1" },
      { key: "a", value: "2" },
      { key: "m", value: "3" },
    ];
    for (const row of table) {
      await store.put(row.key, row.value);
    }
    expect(store.listKeys()).toEqual(["a", "m", "z"]);
    await store.close();
  });
});
