import { promises as fs } from "node:fs";
import path from "node:path";
import type { ContentDocument } from "./contentModel";
import { parseMdxContentDocument } from "./contentModel";

export type LoadedMdxDocument = ContentDocument & {
  sourcePath: string;
};

async function walkMdxFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const nested = await walkMdxFiles(fullPath);
      files.push(...nested);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
}

function formatSourcePath(sourcePath: string): string {
  return sourcePath.replaceAll(path.sep, "/");
}

export async function loadMdxDocumentsFromDir(
  contentDir: string,
): Promise<LoadedMdxDocument[]> {
  const mdxFiles = await walkMdxFiles(contentDir);
  mdxFiles.sort((a, b) => a.localeCompare(b));

  const results: LoadedMdxDocument[] = [];

  for (const filePath of mdxFiles) {
    const source = await fs.readFile(filePath, "utf8");
    const parsed = parseMdxContentDocument(source);

    if (!parsed.ok) {
      const rel = formatSourcePath(path.relative(process.cwd(), filePath));
      throw new Error(
        `Invalid content document at '${rel}': ${parsed.errors.join("; ")}`,
      );
    }

    results.push({
      ...parsed.data,
      sourcePath: formatSourcePath(filePath),
    });
  }

  return results;
}

