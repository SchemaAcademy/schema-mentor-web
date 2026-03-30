import { describe, expect, it } from "vitest";
import { classifyWriteAmplification } from "./storageLesson";

describe("classifyWriteAmplification", () => {
  it("returns expected bucket for each ratio", () => {
    const cases = [
      { ratio: 0.9, expected: "invalid" },
      { ratio: 1, expected: "excellent" },
      { ratio: 2, expected: "excellent" },
      { ratio: 2.1, expected: "good" },
      { ratio: 5, expected: "good" },
      { ratio: 7.5, expected: "needs_tuning" },
      { ratio: 10, expected: "needs_tuning" },
      { ratio: 12, expected: "poor" },
    ];

    cases.forEach(({ ratio, expected }) => {
      expect(classifyWriteAmplification(ratio)).toBe(expected);
    });
  });
});
