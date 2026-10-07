---
name: find-business-leads
description: "Build lists of businesses and structured datasets with QuantumProxies.io: run ready-made Collectors (Google Maps places and other verticals) by keyword and location, use the AI Places Finder, or describe the dataset in a prompt and let the dataset builder gather and filter rows, billed per delivered row. Use when an agent needs company lists with phone, website, address or other fields."
metadata:
  publisher: QuantumProxies.io
  homepage: https://quantumproxies.io/
  version: "2026-10-07"
---

# Find business leads and build datasets with QuantumProxies.io

Three ways, from the most deterministic to the most flexible.

## A. Collectors (ready-made, semantic input, billed per delivered row)

1. Browse the catalog: MCP `list_collectors` (optional `category`, or `slug` for one collector's full input schema and example) or `GET https://api.quantumproxies.io/v1/scraper/collectors`. Each collector has a `slug`, a category (for example Local & Maps), the unit it bills (`place`, `row`, …) and the required input.
2. Run one: MCP `run_collector` with `slug` and `input`, or REST:

```bash
curl -X POST 'https://api.quantumproxies.io/v1/scraper/collectors/google_maps_places/run' \
  -H 'Authorization: Bearer qp_live_YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"query":"pizza restaurants","location":"Brooklyn, NY","country":"us","max_results":20}'
```

   Short runs answer `200` with `payload.results` inline (name, rating, reviews, address, phone, website, coordinates for places). Long runs, or `"async": true`, answer `202` with `run_id` and `statusUrl`.
3. Poll: MCP `collector_run_status` (`run_id`, `format: csv` for a file) or `GET https://api.quantumproxies.io/v1/scraper/collectors/runs/{runId}` (`?format=csv`). `payload.cost` shows the rows billed; partial runs are flagged with `partial: true`.

## B. AI Places Finder (natural language)

`POST https://api.quantumproxies.io/v1/scraper/places-ai` with `{"task":"find every car repair shop in Naples","country":"it","max_enrich":10}`. The planner writes the search queries, de-duplicates, and with `enrich: true` fills phone, website, hours and address from each business's knowledge panel (`max_enrich` caps those lookups). Billed on tokens plus lookups; `payload.usage.cost_usd` says how much.

## C. Dataset builder (prompt-driven, any vertical)

- MCP: `create_dataset` then `dataset_status`
- REST: `POST https://api.quantumproxies.io/v1/scraper/datasets`

```bash
curl -X POST 'https://api.quantumproxies.io/v1/scraper/datasets' \
  -H 'Authorization: Bearer qp_live_YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Car rental companies in Bologna with phone and website","columns":[{"name":"company","type":"string"},{"name":"phone","type":"phone"},{"name":"website","type":"url"}],"country":"it","limits":{"max_rows":50,"max_cost_usd":3}}'
```

- `columns` is optional (the planner infers them); `sources` holds domain allow/deny lists; `limits` (`max_rows`, `max_pages`, `max_cost_usd`) bounds the spend; `webhook` receives the finished dataset.
- Poll `GET https://api.quantumproxies.io/v1/scraper/datasets/{jobId}` (`since` cursor, `mode=summary` for progress only). When `status` is `completed`, `payload.files` carries signed CSV and JSON download links; `GET …/download` fetches a file. Off-target rows are dropped (`progress.dropped_offtarget`).

## Choosing

- Known vertical with a collector: use A (cheapest per row, deterministic schema).
- "Find all X in Y" in one sentence, small lists: B.
- Custom columns, several sources, cross-checks: C. Always set `limits.max_cost_usd`; read `GET /scraper/billing` for balance and prices instead of assuming them.
- Personal data: collect only what the user has a lawful basis to process; see https://quantumproxies.io/terms/ and the acceptable-use policy.
