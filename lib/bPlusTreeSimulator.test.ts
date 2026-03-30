import { describe, expect, it } from "vitest";
import {
  getSearchPath,
  simulateBPlusTree,
  treeToLevels,
  type BPlusTreeConfig,
} from "./bPlusTreeSimulator";

describe("simulateBPlusTree", () => {
  const config: BPlusTreeConfig = {
    maxLeafKeys: 3,
    maxInternalKeys: 3,
  };

  it("builds expected shape for insertion sequences", () => {
    const cases = [
      {
        name: "single split produces one internal root",
        input: [10, 20, 5, 30],
        expectedLevels: [[[20]], [[5, 10], [20, 30]]],
      },
      {
        name: "multiple splits produce two-level tree",
        input: [10, 20, 5, 30, 40, 50, 60],
        expectedLevels: [[[20, 40]], [[5, 10], [20, 30], [40, 50, 60]]],
      },
      {
        name: "duplicate keys are skipped",
        input: [10, 10, 5, 5, 20],
        expectedLevels: [[[5, 10, 20]]],
      },
    ];

    cases.forEach(({ input, expectedLevels }) => {
      const result = simulateBPlusTree(input, config);
      expect(treeToLevels(result.finalTree)).toEqual(expectedLevels);
    });
  });

  it("generates one step per input plus initial state", () => {
    const input = [8, 3, 12, 3];
    const result = simulateBPlusTree(input, config);
    expect(result.steps).toHaveLength(input.length + 1);
  });
});

describe("getSearchPath", () => {
  it("returns expected route from root to leaf", () => {
    const cases = [
      {
        key: 5,
        expected: [
          [20, 40],
          [5, 10],
        ],
      },
      {
        key: 33,
        expected: [
          [20, 40],
          [20, 30],
        ],
      },
      {
        key: 77,
        expected: [
          [20, 40],
          [40, 50, 60],
        ],
      },
    ];

    const result = simulateBPlusTree([10, 20, 5, 30, 40, 50, 60], {
      maxLeafKeys: 3,
      maxInternalKeys: 3,
    });

    cases.forEach(({ key, expected }) => {
      expect(getSearchPath(result.finalTree, key)).toEqual(expected);
    });
  });
});
