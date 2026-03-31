import { describe, expect, it } from "vitest";
import { BitcaskMemory } from "./bitcaskMemory";

describe("BitcaskMemory", () => {
  it("put/getUtf8 round-trip", () => {
    const cases = [
      { key: "a", value: "one" },
      { key: "b", value: "你好" },
    ];

    const store = new BitcaskMemory();
    for (const { key, value } of cases) {
      store.put(key, value);
      expect(store.getValueUtf8(key)).toBe(value);
    }
  });

  it("delete removes key", () => {
    const store = new BitcaskMemory();
    store.put("x", "1");
    store.delete("x");
    expect(store.getValueUtf8("x")).toBeUndefined();
    expect(store.has("x")).toBe(false);
  });

  it("replay rebuilds keydir from log", () => {
    const store = new BitcaskMemory();
    store.put("k", "v");
    store.replay();
    expect(store.getValueUtf8("k")).toBe("v");
  });

  it("last put wins for same key", () => {
    const store = new BitcaskMemory();
    store.put("k", "a");
    store.put("k", "b");
    expect(store.getValueUtf8("k")).toBe("b");
  });

  it("listKeys is sorted", () => {
    const store = new BitcaskMemory();
    const table = [
      { key: "z", value: "1" },
      { key: "a", value: "2" },
      { key: "m", value: "3" },
    ];
    for (const row of table) {
      store.put(row.key, row.value);
    }
    expect(store.listKeys()).toEqual(["a", "m", "z"]);
  });

  it("rejects empty value", () => {
    const store = new BitcaskMemory();
    expect(() => store.put("k", "")).toThrow(/empty value/);
  });
});
