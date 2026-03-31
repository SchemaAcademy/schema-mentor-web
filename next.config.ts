import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeBasePath } from "./lib/basePath";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const basePath = normalizeBasePath(process.env.BASE_PATH);

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: rootDir,
  },
};

export default nextConfig;
