# Multi-Search

Unified, Bun-first search interface across multiple providers with credit tracking, pluggable strategies, and optional Docker-managed SearXNG.

## Highlights

- 🔍 Providers: Tavily, Brave, Linkup, SearXNG (local, Docker auto-start)
- 🤝 Single interface: shared types + CLI + programmatic API
- 💳 Credits: per-engine quotas with snapshots and low-credit warnings
- 🧠 Strategies: `all` (merge) or `first-success` (fastest win)
- ⚙️ Config: JSON or TypeScript (`defineConfig`), XDG-aware resolution
- 🐳 Auto-start: optional Docker lifecycle for local SearXNG

## Install & Run (Bun)

```bash
cd /path/to/multi-search
bun install

# CLI (direct)
bun run src/cli.ts "best TypeScript ORM 2025"

# Or link the bin
ln -s $(pwd)/src/cli.ts ~/.local/bin/multi-search
multi-search "llm observability" --json
```

## Usage

### Basic Search

```bash
multi-search "your search query"
```

### Options

```bash
multi-search "query" [options]

Options:
  --json                        Output results as JSON
  --engines engine1,engine2     Use specific engines
  --strategy all|first-success  Search strategy (default: all)
  --limit number                Max results per engine
  --include-raw                 Include raw provider responses
  --help, -h                    Show help
  health                        Run provider health checks (starts Docker-backed ones if needed)
```

### Examples

```bash
# Search with specific engines
multi-search "hawaii dev meetups" --engines tavily,brave --json

# Use first-success strategy (stop after first working provider)
multi-search "emerging web frameworks" --strategy first-success

# Limit results per provider
multi-search "rust async patterns" --limit 3

# Check credit status
multi-search credits
```

## Configuration

Resolution order (first wins):
1. Explicit path passed to CLI/API
2. `./multi-search.config.(ts|json)`
3. `$XDG_CONFIG_HOME/multi-search/config.(ts|json)` (or `~/.config/...`)

- Example config: see `docs/config/multi-search.config.json`
- Schema: `docs/config/config.schema.json` (generated from Zod)
- TS helper: `defineConfig`, `defineTavily`, `defineBrave`, `defineLinkup`, `defineSearchxng`

## Architecture (short)

- Config resolved and validated (`src/config`), plugins registered
- DI container bootstraps orchestrator, credit manager, provider registry (`src/bootstrap/container.ts`)
- Providers registered via plugins (`src/plugin`, `src/providers/*`)
- Orchestrator runs strategies (`src/core/strategy/*`) and aggregates results
- Docker-backed providers (SearXNG) use lifecycle manager with auto-start/health checks (`src/core/docker/*`)

## Output Formats

### Human-Readable (Default)

```
Query: "rust async patterns"
Found 15 results

============================================================
tavily (10 results)
============================================================

1. Async programming in Rust - Tokio
   https://tokio.rs/
   Score: 0.95
   Tokio is a runtime for writing reliable asynchronous applications with Rust.

2. Asynchronous Programming in Rust
   https://rust-lang.github.io/async-book/
   Score: 0.92
   A book explaining async/await in Rust...
```

### JSON (`--json`)

```json
{
  "query": "rust async patterns",
  "items": [
    {
      "title": "Async programming in Rust - Tokio",
      "url": "https://tokio.rs/",
      "snippet": "Tokio is a runtime...",
      "score": 0.95,
      "sourceEngine": "tavily"
    }
  ],
  "enginesTried": [
    {
      "engineId": "tavily",
      "success": true
    }
  ],
  "credits": [...]
}
```

## Search Strategies

### All (Default)

Queries all configured/enabled providers and combines results.

```bash
multi-search "topic" --strategy all
```

- Pro: Gets maximum coverage, see different perspectives
- Con: Uses more credits, slower
- Best for: Research, comparison, getting API formats

### First Success

Stops after the first provider returns results.

```bash
multi-search "topic" --strategy first-success
```

- Pro: Saves credits, faster
- Con: Misses results from other providers
- Best for: Quick lookups, production use

## Development

### Source layout

```
src/
├── app/                  # Public surface (bootstrap + API exports)
├── bootstrap/            # DI container wiring
├── config/               # Config types, schema, loaders
├── core/                 # Orchestrator, strategy, credits, docker helpers
├── plugin/               # Plugin registry and built-ins
├── providers/            # Provider implementations + shared helpers
├── tool/                 # CLI-facing tool + interfaces
└── cli.ts                # CLI entry
```

### Testing (Bun)

- All: `SKIP_DOCKER_TESTS=true bun test --preload ./test/setup.ts test/`
- Unit only: `bun run test:unit`
- Integration (Docker optional): `SKIP_DOCKER_TESTS=false bun run test:integration`
- Coverage: `SKIP_DOCKER_TESTS=true bun run test:coverage`

See `docs/testing/README.md` for suite layout.

## Troubleshooting

- Missing config: copy `docs/config/multi-search.config.json` to your project root (or place in XDG path)
- Missing API key: set `TAVILY_API_KEY`, `BRAVE_API_KEY`, `LINKUP_API_KEY`, `SEARXNG_API_KEY`
- SearXNG not healthy: ensure Docker is running, or disable/autoStart=false for that engine

## Environment Variables

- Required per enabled engine: `TAVILY_API_KEY`, `BRAVE_API_KEY`, `LINKUP_API_KEY`, `SEARXNG_API_KEY`
- Optional: `XDG_CONFIG_HOME`, `XDG_STATE_HOME`

## License

MIT
