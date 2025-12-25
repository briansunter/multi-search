import { $ } from "bun";

await Bun.build({
  entrypoints: ["./src/cli.ts"],
  outdir: "./dist",
  target: "bun",
  minify: false,
  sourcemap: "external",
});

// Copy only essential SearXNG files (docker-compose.yml and default config)
await $`mkdir -p dist/providers/searxng/config`;
await $`cp providers/searxng/docker-compose.yml dist/providers/searxng/`;
await $`cp providers/searxng/config/settings.yml dist/providers/searxng/config/`;

console.log("Build complete! Run with: bun dist/cli.js");
