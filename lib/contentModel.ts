export type Domain = "storage" | "ai-infra";
export type ContentType = "course" | "lab";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export type ContentMetadata = {
  id: string;
  title: string;
  summary: string;
  domain: Domain;
  contentType: ContentType;
  difficulty: Difficulty;
  tags: string[];
  prerequisites: string[];
  estimatedMinutes: number;
};

export type ContentDocument = {
  metadata: ContentMetadata;
  body: string;
};

type ValidationSuccess<T> = {
  ok: true;
  data: T;
};

type ValidationFailure = {
  ok: false;
  errors: string[];
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

const DOMAIN_VALUES: Domain[] = ["storage", "ai-infra"];
const CONTENT_TYPE_VALUES: ContentType[] = ["course", "lab"];
const DIFFICULTY_VALUES: Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

function parseScalar(raw: string): string | number | boolean {
  const value = raw.trim();

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseValue(raw: string): unknown {
  const value = raw.trim();

  if (value.startsWith("[") && value.endsWith("]")) {
    const body = value.slice(1, -1).trim();

    if (!body) {
      return [];
    }

    return body.split(",").map((item) => {
      return String(parseScalar(item));
    });
  }

  return parseScalar(value);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFrontmatter(source: string): ValidationResult<Record<string, unknown>> {
  if (!source.startsWith("---")) {
    return {
      ok: false,
      errors: ["missing frontmatter opening delimiter '---'"],
    };
  }

  const lines = source.split(/\r?\n/);
  const endLine = lines.findIndex((line, index) => index > 0 && line.trim() === "---");

  if (endLine === -1) {
    return {
      ok: false,
      errors: ["missing frontmatter closing delimiter '---'"],
    };
  }

  const metadataLines = lines.slice(1, endLine);
  const metadata: Record<string, unknown> = {};
  const errors: string[] = [];

  metadataLines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      errors.push(`invalid frontmatter line ${index + 2}: '${line}'`);
      return;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1);

    if (!key) {
      errors.push(`empty frontmatter key at line ${index + 2}`);
      return;
    }

    metadata[key] = parseValue(rawValue);
  });

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    data: metadata,
  };
}

function validateString(
  source: Record<string, unknown>,
  key: string,
  errors: string[],
): string | undefined {
  const value = source[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${key} must be a non-empty string`);
    return undefined;
  }

  return value.trim();
}

function validateStringArray(
  source: Record<string, unknown>,
  key: string,
  errors: string[],
): string[] | undefined {
  const value = source[key];

  if (!Array.isArray(value)) {
    errors.push(`${key} must be an array of strings`);
    return undefined;
  }

  const normalized = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);

  if (normalized.length === 0) {
    errors.push(`${key} must include at least one non-empty string`);
    return undefined;
  }

  return normalized;
}

function validateEnum<T extends string>(
  value: unknown,
  key: string,
  options: T[],
  errors: string[],
): T | undefined {
  if (typeof value !== "string" || !options.includes(value as T)) {
    errors.push(`${key} must be one of: ${options.join(", ")}`);
    return undefined;
  }

  return value as T;
}

export function validateContentMetadata(input: unknown): ValidationResult<ContentMetadata> {
  if (!isObjectRecord(input)) {
    return {
      ok: false,
      errors: ["metadata must be an object"],
    };
  }

  const errors: string[] = [];
  const id = validateString(input, "id", errors);
  const title = validateString(input, "title", errors);
  const summary = validateString(input, "summary", errors);
  const domain = validateEnum(input.domain, "domain", DOMAIN_VALUES, errors);
  const contentType = validateEnum(
    input.contentType,
    "contentType",
    CONTENT_TYPE_VALUES,
    errors,
  );
  const difficulty = validateEnum(
    input.difficulty,
    "difficulty",
    DIFFICULTY_VALUES,
    errors,
  );
  const tags = validateStringArray(input, "tags", errors);
  const prerequisites = validateStringArray(input, "prerequisites", errors);
  const estimatedMinutes = input.estimatedMinutes;

  if (
    typeof estimatedMinutes !== "number" ||
    !Number.isFinite(estimatedMinutes) ||
    estimatedMinutes <= 0
  ) {
    errors.push("estimatedMinutes must be a positive number");
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    data: {
      id: id as string,
      title: title as string,
      summary: summary as string,
      domain: domain as Domain,
      contentType: contentType as ContentType,
      difficulty: difficulty as Difficulty,
      tags: tags as string[],
      prerequisites: prerequisites as string[],
      estimatedMinutes: estimatedMinutes as number,
    },
  };
}

export function parseMdxContentDocument(source: string): ValidationResult<ContentDocument> {
  const frontmatterResult = parseFrontmatter(source);

  if (!frontmatterResult.ok) {
    return frontmatterResult;
  }

  const lines = source.split(/\r?\n/);
  const endLine = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  const body = lines.slice(endLine + 1).join("\n").trim();

  const metadataResult = validateContentMetadata(frontmatterResult.data);

  if (!metadataResult.ok) {
    return metadataResult;
  }

  return {
    ok: true,
    data: {
      metadata: metadataResult.data,
      body,
    },
  };
}
