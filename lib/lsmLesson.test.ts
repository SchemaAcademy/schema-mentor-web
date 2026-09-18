import { describe, expect, it } from "vitest";
import { buildLsmLesson, lsmStats } from "./lsmLesson";

describe("LSM teaching model", () => {
  it("flushes a full ordered memtable and compacts the newest value", () => {
    const frames = buildLsmLesson(
      [
        { key: "b", value: "2" },
        { key: "a", value: "1" },
        { key: "c", value: "4" },
        { key: "a", value: "3" },
        { key: "d", value: "5" },
        { key: "e", value: "6" },
      ],
      3,
    );
    expect(frames.some((frame) => frame.phase === "freeze")).toBe(true);
    const result = frames.at(-1)!;
    expect(result.title).toContain("Compaction 完成");
    expect(result.state.level0).toHaveLength(1);
    expect(result.state.level0[0].entries).toEqual([
      { key: "a", value: "3", sequence: 4 },
      { key: "b", value: "2", sequence: 1 },
      { key: "c", value: "4", sequence: 3 },
      { key: "d", value: "5", sequence: 5 },
      { key: "e", value: "6", sequence: 6 },
    ]);
    expect(lsmStats(result.state)).toEqual({
      memtable: 0,
      files: 1,
      diskRecords: 5,
    });
  });
  it("does not compact when only one file exists", () => {
    expect(
      buildLsmLesson(
        [
          { key: "a", value: "1" },
          { key: "b", value: "2" },
        ],
        2,
      ).some((frame) => frame.phase === "compact"),
    ).toBe(false);
  });
});
