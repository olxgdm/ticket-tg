import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { build, context } from "esbuild";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, "dist");
const publicDirectory = resolve(projectRoot, "public");
const watch = process.argv.includes("--watch");

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });
await cp(publicDirectory, outputDirectory, { recursive: true });

const buildOptions = {
  bundle: true,
  entryPoints: [resolve(projectRoot, "src/background.ts")],
  format: "iife",
  logLevel: "info",
  outfile: resolve(outputDirectory, "background.js"),
  platform: "browser",
  sourcemap: watch,
  target: "chrome120",
};

if (watch) {
  const buildContext = await context(buildOptions);
  await buildContext.watch();
  console.log("Watching extension source files. Reload the extension in Chrome after changes.");
} else {
  await build(buildOptions);
}
