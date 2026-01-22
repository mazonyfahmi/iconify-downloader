import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/cli.ts"],
    format: ["cjs"],
    outDir: "dist",
    splitting: false,
    sourcemap: false,
    clean: true,
    target: "node20",
    dts: false,
    minify: true,
    shims: false,
  },
  {
    entry: ["src/main.ts"],
    format: ["esm", "cjs"],
    outDir: "dist",
    splitting: false,
    sourcemap: false,
    clean: false,
    target: "node20",
    dts: true,
    minify: true,
    shims: false,
  },
]);
