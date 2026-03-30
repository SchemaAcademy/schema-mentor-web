import { describe, expect, it } from "vitest";
import { parseMdxContentDocument, validateContentMetadata } from "./contentModel";

describe("validateContentMetadata", () => {
  const cases = [
      {
        name: "accepts valid course metadata",
        input: {
          id: "bptree-intro",
          title: "B+Tree Introduction",
          summary: "Understand page structure and query path.",
          domain: "storage",
          contentType: "course",
          difficulty: "beginner",
          tags: ["b+tree", "index"],
          prerequisites: ["disk-basics"],
          estimatedMinutes: 25,
        },
        expectedOk: true,
      },
      {
        name: "rejects missing required fields",
        input: {
          id: "",
          title: "LSM Compaction",
          summary: "Learn compaction strategy tradeoffs.",
          domain: "storage",
          contentType: "lab",
          difficulty: "intermediate",
          tags: ["lsm"],
          prerequisites: ["write-path"],
          estimatedMinutes: 20,
        },
        expectedOk: false,
        expectedErrors: ["id must be a non-empty string"],
      },
      {
        name: "rejects invalid enums",
        input: {
          id: "wal-basics",
          title: "WAL Basics",
          summary: "Replay and checkpoint flow.",
          domain: "database",
          contentType: "interactive",
          difficulty: "easy",
          tags: ["wal"],
          prerequisites: ["consistency"],
          estimatedMinutes: 15,
        },
        expectedOk: false,
        expectedErrors: [
          "domain must be one of: storage, ai-infra",
          "contentType must be one of: course, lab",
          "difficulty must be one of: beginner, intermediate, advanced",
        ],
      },
      {
        name: "rejects invalid list and number constraints",
        input: {
          id: "kv-cache-ttl",
          title: "KV Cache TTL",
          summary: "Evaluate cache invalidation policies.",
          domain: "ai-infra",
          contentType: "lab",
          difficulty: "advanced",
          tags: [],
          prerequisites: [],
          estimatedMinutes: 0,
        },
        expectedOk: false,
        expectedErrors: [
          "tags must include at least one non-empty string",
          "prerequisites must include at least one non-empty string",
          "estimatedMinutes must be a positive number",
        ],
      },
    ];

  cases.forEach(({ name, input, expectedOk, expectedErrors }) => {
    it(name, () => {
      const result = validateContentMetadata(input);
      expect(result.ok).toBe(expectedOk);

      if (!result.ok && expectedErrors) {
        expectedErrors.forEach((message) => {
          expect(result.errors).toContain(message);
        });
      }
    });
  });
});

describe("parseMdxContentDocument", () => {
  const cases = [
      {
        name: "parses valid mdx with frontmatter",
        source: `---
id: bptree-split-lab
title: B+Tree Node Split Lab
summary: Simulate split and parent propagation.
domain: storage
contentType: lab
difficulty: intermediate
tags: [b+tree, split]
prerequisites: [bptree-intro]
estimatedMinutes: 30
---
# B+Tree Split

Use controls to trigger leaf and internal node splits.
`,
        expectedOk: true,
      },
      {
        name: "rejects mdx without frontmatter",
        source: `# Title

No frontmatter exists here.
`,
        expectedOk: false,
        expectedErrors: ["missing frontmatter opening delimiter '---'"],
      },
      {
        name: "rejects mdx with invalid metadata",
        source: `---
id: wal-recovery
title: WAL Recovery
summary: Replay log records after crash.
domain: storage
contentType: course
difficulty: beginner
tags: []
prerequisites: []
estimatedMinutes: -5
---
Body
`,
        expectedOk: false,
        expectedErrors: [
          "tags must include at least one non-empty string",
          "prerequisites must include at least one non-empty string",
          "estimatedMinutes must be a positive number",
        ],
      },
    ];

  cases.forEach(({ name, source, expectedOk, expectedErrors }) => {
    it(name, () => {
      const result = parseMdxContentDocument(source);
      expect(result.ok).toBe(expectedOk);

      if (result.ok) {
        expect(result.data.body.length).toBeGreaterThan(0);
      }

      if (!result.ok && expectedErrors) {
        expectedErrors.forEach((message) => {
          expect(result.errors).toContain(message);
        });
      }
    });
  });
});
