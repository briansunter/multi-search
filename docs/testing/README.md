## Testing guide (Bun)

Envs:
- `SKIP_DOCKER_TESTS=true` (default) skips Docker-backed suites.
- `SKIP_DOCKER_TESTS=false` enables SearXNG/Linkup integration paths (requires Docker).

Commands:
- All suites: `SKIP_DOCKER_TESTS=true bun test --preload ./test/setup.ts test/`
- Unit only: `bun run test:unit`
- Integration (Docker optional): `SKIP_DOCKER_TESTS=false bun run test:integration`
- Coverage: `SKIP_DOCKER_TESTS=true bun run test:coverage`
- Verbose: `DEBUG_TESTS=1 SKIP_DOCKER_TESTS=true bun run test:verbose`

Suite layout mirrors `src/` (previously in `test/README.md`):
- `test/unit/**` – small, isolated pieces (strategies, helpers, types)
- `test/core/**` – container, provider factory, orchestrator
- `test/providers/**` – provider implementations with mocks
- `test/integration/**` – end-to-end flows, optional Docker-backed providers
- `test/tool/**` – CLI/tool glue

Docker tips:
- Ensure Docker is running before `SKIP_DOCKER_TESTS=false`.
- For SearXNG, compose file lives at `providers/searxng/docker-compose.yml`.
- Health/auto-start paths are exercised in `test/integration/providers/searchxng.test.ts`.

