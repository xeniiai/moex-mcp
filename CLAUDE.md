# CLAUDE.md

## Project Overview

MCP server for the Moscow Exchange (MOEX) ISS API, built in TypeScript. Exposes 20 tools for querying market data, history, indices, currency rates, dividends, and more.

## Architecture

**Vertical Slice + Hexagonal (Ports & Adapters)**

- `src/shared/ports/iss-client.port.ts` — Port interface for the ISS HTTP client
- `src/shared/adapters/iss-client.adapter.ts` — Adapter: fetch-based implementation
- `src/shared/pagination.ts` — Auto-pagination using cursor blocks (INDEX/TOTAL/PAGESIZE)
- `src/shared/formatter.ts` — Markdown table/key-value formatters for LLM output
- `src/features/<tool-name>/` — Each tool is a self-contained vertical slice:
  - `schema.ts` — Zod schema for input validation
  - `query.ts` — Business logic, depends only on `IssClientPort` (port)
  - `handler.ts` — MCP tool handler, wires schema + query + formatter
- `src/server.ts` — Registers all 20 tool handlers on the MCP server
- `src/index.ts` — Composition root: creates the adapter, injects into server, starts stdio transport

## Key Conventions

- **Dependencies flow inward**: query.ts depends on the port interface, never on the adapter
- **One slice = one tool**: adding/removing a tool only touches its own feature directory and server.ts registration
- **Defaults**: `engine="stock"`, `market="shares"` for the most common use case (Russian equities)
- **Response format**: All tools return markdown-formatted text for LLM readability
- **No external HTTP library**: Uses Node.js built-in `fetch`
- **ISS API params**: Every request appends `iss.meta=off&iss.json=extended` by default

## Build & Run

```bash
npm install
npm run build    # tsc → dist/
npm run dev      # tsx src/index.ts (development)
npm start        # node dist/index.js (production)
```

## ISS API Response Structure

The MOEX ISS API with `iss.json=extended` returns:
```
[
  { "charsetinfo": { "name": "utf-8" } },
  { "blockName": [ { ...row }, ... ], "block.cursor": [ { INDEX, TOTAL, PAGESIZE } ] }
]
```

The adapter (`IssClient.get()`) strips index 0 and returns index 1 directly.

## Pagination

Endpoints returning large datasets include a cursor block (e.g. `history.cursor`). The `fetchAllPages()` helper in `shared/pagination.ts` handles this automatically, incrementing `start` by `PAGESIZE` until all data is fetched or `maxRows` is reached. Max 50 pages as a safety limit.

## Testing

Test tools against the live API:
```bash
# Search
curl "https://iss.moex.com/iss/securities.json?q=SBER&iss.meta=off&iss.json=extended"

# Market data
curl "https://iss.moex.com/iss/engines/stock/markets/shares/securities/SBER.json?iss.meta=off&iss.json=extended"

# History with pagination
curl "https://iss.moex.com/iss/history/engines/stock/markets/shares/securities/SBER.json?from=2025-01-01&till=2025-03-01&iss.meta=off&iss.json=extended"
```
