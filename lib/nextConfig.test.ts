import nextConfig from "../next.config";
import { describe, expect, it } from "vitest";

describe("next.config", () => {
  it.each([
    {
      name: "sets turbopack root",
      value: nextConfig.turbopack?.root,
      matcher: (v: unknown) => typeof v === "string" && v.length > 0,
    },
  ])("$name", ({ value, matcher }) => {
    expect(matcher(value)).toBe(true);
  });
});
