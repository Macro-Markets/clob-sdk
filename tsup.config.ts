import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsup";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, "package.json"), "utf8")) as {
    version?: string;
};
const version = pkg.version ?? "0.0.0";

export default defineConfig([
    {
        entry: ["src/index.ts"],
        format: ["esm"],
        dts: true,
        sourcemap: true,
        clean: true,
        outDir: "dist",
        platform: "node",
        define: { __SDK_VERSION__: JSON.stringify(version) },
    },
    {
        entry: { index: "src/cli/index.ts" },
        format: ["esm"],
        outDir: "dist/cli",
        banner: { js: "#!/usr/bin/env node" },
        sourcemap: false,
        platform: "node",
        define: { __SDK_VERSION__: JSON.stringify(version) },
    },
]);
