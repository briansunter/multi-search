import { $ } from "bun";

await Bun.build({
  entrypoints: ["./src/cli.ts"],
  outdir: "./dist",
  target: "bun",
  minify: false,
  sourcemap: "external",
});

// Copy SearXNG docker-compose and config if they exist
const searxngCompose = new URL("providers/searxng/docker-compose.yml", import.meta.url);
const searxngConfig = new URL("providers/searxng/config/settings.yml", import.meta.url);

try {
  await $`mkdir -p dist/providers/searxng/config`;
  if (await Bun.file(searxngCompose).exists()) {
    await $`cp providers/searxng/docker-compose.yml dist/providers/searxng/`;
  }
  if (await Bun.file(searxngConfig).exists()) {
    await $`cp providers/searxng/config/settings.yml dist/providers/searxng/config/`;
  }
} catch {
  // Ignore copy failures - files might not exist in all environments
}

console.log("Build complete! Run with: bun dist/cli.js");
