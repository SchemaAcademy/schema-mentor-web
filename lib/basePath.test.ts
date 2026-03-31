import { describe, expect, it } from "vitest";
import { normalizeBasePath } from "./basePath";

describe("normalizeBasePath", () => {
  const cases: { name: string; input: string | undefined; want: string }[] = [
    { name: "undefined means root", input: undefined, want: "" },
    { name: "empty string means root", input: "", want: "" },
    { name: "slash only means root", input: "/", want: "" },
    { name: "preserves simple path", input: "/my-repo", want: "/my-repo" },
    { name: "adds leading slash", input: "my-repo", want: "/my-repo" },
    { name: "strips trailing slashes", input: "/my-repo/", want: "/my-repo" },
    { name: "strips multiple trailing slashes", input: "/a/b///", want: "/a/b" },
    { name: "trims whitespace", input: "  /x  ", want: "/x" },
  ];

  it.each(cases)("$name", ({ input, want }) => {
    expect(normalizeBasePath(input)).toBe(want);
  });
});
