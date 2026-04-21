import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const nextRoutesManifest = join(rootDir, ".next", "routes-manifest.json");
const rootRoutesManifest = join(rootDir, "routes-manifest.json");

if (!existsSync(nextRoutesManifest)) {
  console.error(
    "[vercel-routes-manifest-fallback] .next/routes-manifest.json was not found after next build."
  );
  process.exit(1);
}

copyFileSync(nextRoutesManifest, rootRoutesManifest);
console.log(
  "[vercel-routes-manifest-fallback] Copied .next/routes-manifest.json to project root."
);
