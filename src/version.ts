import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Injected at build time by tsup from package.json; undefined when run with tsx. */
declare const __SDK_VERSION__: string | undefined;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Default when package.json is not found (e.g. in tests). */
const FALLBACK_VERSION = "1.0.0";

/**
 * Load version from package.json at runtime (used when not built, e.g. pnpm cli / tsx).
 */
function loadVersion(): string {
    const candidates = [
        path.join(__dirname, "..", "package.json"),
        path.join(__dirname, "..", "..", "package.json"),
    ];
    for (const pkgPath of candidates) {
        try {
            if (existsSync(pkgPath)) {
                const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version?: string };
                return pkg.version ?? FALLBACK_VERSION;
            }
        } catch {
            // continue
        }
    }
    return FALLBACK_VERSION;
}

/** Single source of truth: package.json. In build, tsup injects it; in dev, we read from disk. */
export const SDK_VERSION = typeof __SDK_VERSION__ !== "undefined" ? __SDK_VERSION__ : loadVersion();
