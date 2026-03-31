/**
 * Normalizes BASE_PATH for Next.js static export on GitHub Pages.
 * Result is empty for the site root, or a path with a leading slash and no trailing slash.
 */
export function normalizeBasePath(raw: string | undefined): string {
  if (raw == null || raw === "" || raw === "/") {
    return "";
  }
  const trimmed = raw.trim();
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const noTrailing = withLeading.replace(/\/+$/, "");
  return noTrailing === "/" ? "" : noTrailing;
}
