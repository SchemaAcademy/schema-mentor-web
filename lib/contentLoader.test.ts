import { describe, expect, it } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadMdxDocumentsFromDir } from "./contentLoader";

function buildValidMdxDocument(overrides?: Record<string, string>): string {
  const base = {
    id: "bptree-split-lab",
    title: "B+Tree Node Split Lab",
    summary: "Simulate split and parent propagation.",
    domain: "storage",
    contentType: "lab",
    difficulty: "intermediate",
    tags: "[b+tree, split]",
    prerequisites: "[bptree-intro]",
    estimatedMinutes: "30",
  };

  const merged = { ...base, ...(overrides ?? {}) };

  return `---
id: ${merged.id}
title: ${merged.title}
summary: ${merged.summary}
domain: ${merged.domain}
contentType: ${merged.contentType}
difficulty: ${merged.difficulty}
tags: ${merged.tags}
prerequisites: ${merged.prerequisites}
estimatedMinutes: ${merged.estimatedMinutes}
---
Body content.
`;
}

async function writeFileEnsuringDir(
  filePath: string,
  content: string,
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

describe("loadMdxDocumentsFromDir", () => {
  const cases = [
    {
      name: "recursively loads valid mdx files",
      files: {
        "course/a.mdx": buildValidMdxDocument({ id: "course-1" }),
        "labs/sub/b.mdx": buildValidMdxDocument({
          id: "lab-1",
          contentType: "lab",
          difficulty: "advanced",
          tags: "[lsm, wal]",
          prerequisites: "[lsm-intro, wal-basics]",
        }),
        "ignore/readme.txt": "not mdx",
      },
      expectedIds: ["course-1", "lab-1"],
    },
    {
      name: "throws when mdx file has no frontmatter",
      files: {
        "bad/no-frontmatter.mdx": `# Just a title\n\nBody only.\n`,
      },
      expectedErrorContains: "missing frontmatter opening delimiter '---'",
    },
    {
      name: "throws when mdx metadata fails validation",
      files: {
        "bad/invalid-metadata.mdx": buildValidMdxDocument({
          id: "invalid-1",
          tags: "[]",
          prerequisites: "[]",
          estimatedMinutes: "0",
        }),
      },
      expectedErrorContains: "tags must include at least one non-empty string",
    },
  ];

  cases.forEach(({ name, files, expectedIds, expectedErrorContains }) => {
    it(name, async () => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "schemamentor-content-"));

      try {
        const entries = Object.entries(files);

        await Promise.all(
          entries.map(([relPath, content]) => {
            const full = path.join(tmpDir, relPath);
            return writeFileEnsuringDir(full, content);
          }),
        );

        if (expectedIds) {
          const docs = await loadMdxDocumentsFromDir(tmpDir);
          const actualIds = docs.map((d) => d.metadata.id).sort();
          expect(actualIds).toEqual([...expectedIds].sort());
        } else if (expectedErrorContains) {
          await expect(loadMdxDocumentsFromDir(tmpDir)).rejects.toThrowError(
            expectedErrorContains,
          );
        } else {
          throw new Error("Test case missing expected assertions");
        }
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });
  });
});

