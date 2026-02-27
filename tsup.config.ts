import { defineConfig } from "tsup";

export default defineConfig([
    {
        entry: ["src/index.ts"],
        format: ["esm"],
        dts: true,
        sourcemap: true,
        clean: true,
        outDir: "dist",
        platform: "node",
    },
    {
        entry: { index: "src/cli/index.ts" },
        format: ["cjs"],
        outDir: "dist/cli",
        banner: { js: "#!/usr/bin/env node" },
        sourcemap: false,
        platform: "node",
        noExternal: [/(.*)/],
    },
]);
