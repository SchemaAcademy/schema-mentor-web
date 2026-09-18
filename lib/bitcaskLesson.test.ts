import { describe, expect, it } from "vitest";
import { bitcaskStats, buildBitcaskLesson } from "./bitcaskLesson";

describe("Bitcask teaching model", () => {
  it("retains the newest record per key through compaction", () => {
    const frames = buildBitcaskLesson([
      { key: "theme", value: "light" },
      { key: "lang", value: "zh" },
      { key: "theme", value: "dark" },
    ]);
    const result = frames.at(-1)!;
    expect(result.title).toContain("合并完成");
    expect(result.state.log).toEqual([
      { offset: 0, key: "lang", value: "zh" },
      { offset: 1, key: "theme", value: "dark" },
    ]);
    expect(result.state.keydir.theme).toEqual({ offset: 1, value: "dark" });
    expect(bitcaskStats(result.state)).toEqual({
      records: 2,
      keys: 2,
      stale: 0,
    });
  });
  it("does not add a compaction frame with no stale records", () => {
    expect(
      buildBitcaskLesson([
        { key: "a", value: "1" },
        { key: "b", value: "2" },
      ]).some((frame) => frame.phase === "compact"),
    ).toBe(false);
  });
});
