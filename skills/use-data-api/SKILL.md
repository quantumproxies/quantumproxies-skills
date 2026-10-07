---
name: use-data-api
description: "Call the QuantumProxies.io Data API (REST, https://api.quantumproxies.io/v1): authenticate with an API key, read the response envelope, run async jobs, and find the OpenAPI and Markdown references. Use when an agent needs to scrape, search, crawl, unlock, run collectors, build datasets or manage proxies over plain HTTP."
metadata:
  publisher: QuantumProxies.io
  homepage: https://quantumproxies.io/
  version: "2026-10-07"
---

# Use the QuantumProxies.io Data API

The Data API is a REST API at `https://api.quantumproxies.io/v1`. The same API also answers on `https://app.quantumproxies.io/api/v1` (no short aliases there). Every endpoint is also available as an MCP tool (see the `use-mcp-server` skill).

## Authentication

- Create a free account at https://app.quantumproxies.io/register, then create a key on the dashboard's API keys page. Keys look like `qp_live_` followed by 64 hex characters.
- Send the key only in the header: `Authorization: Bearer qp_live_YOUR_API_KEY`. There is no `x-api-key` fallback and keys are never read from the query string.
- `401` means the key is disabled, expired or unknown (or the account is banned). `402`/`429` relate to balance and rate limits; the exact meaning of every status code is in the docs ("Errors and status codes").

## Response envelope

Every JSON answer has the same shape:

```json
{ "type": "response", "message": "…", "payload": { … }, "pagination": { } }
```

Errors use `"type": "error"` with a `message`. Billable calls add `payload.usage` with `cost_usd`, `free_usd` and `paid_usd` so you can account for spend per call.

## Endpoints (48 operations)

| Area | Operations |
| --- | --- |
| Scrape | `POST /scraper/extract` (one URL to Markdown/HTML/text, CSS or AI extraction) |
| Search | `POST /scraper/serp` (Google, Bing, DuckDuckGo, 17 verticals), `POST /scraper/serp/bulk` + `GET/DELETE /scraper/serp/bulk/{jobId}` |
| Map & crawl | `POST /scraper/map`, `POST /scraper/crawl` + `GET/DELETE /scraper/crawl/{jobId}` |
| Batch | `POST /scraper/batch` (up to 1,000 URLs) + `GET/DELETE /scraper/batch/{jobId}` |
| Web Unlocker | `POST /scraper/unlock`, `GET /scraper/unlock/ca` |
| AI extraction | `POST /scraper/ai`, `POST /scraper/places-ai`, `POST /scraper/shopping-ai`, `POST /scraper/ai-visibility`, `POST /scraper/seo-audit` |
| Collectors | `GET /scraper/collectors`, `GET /scraper/collectors/{slug}`, `POST /scraper/collectors/{slug}/run`, `GET /scraper/collectors/runs`, `GET /scraper/collectors/runs/{runId}` |
| Datasets | `GET/POST /scraper/datasets`, `GET/DELETE /scraper/datasets/{jobId}`, `GET …/download`, `PATCH/DELETE …/record` |
| Parser presets | `POST /scraper/parser/generate`, `GET/POST /scraper/parser/presets`, `GET/PUT/DELETE /scraper/parser/presets/{id}`, `POST …/heal`, `GET …/stats` |
| Proxies | `GET /public/proxies`, `POST /public/proxies/generate`, `GET /public/proxies/ip-info`, `GET/POST/DELETE /public/proxies/whitelist-ip` |
| Account | `GET /scraper/usage`, `GET /scraper/billing`, `GET /mcp/trial-config` |

First call to make:

```bash
curl -X POST 'https://api.quantumproxies.io/v1/scraper/extract' \
  -H 'Authorization: Bearer qp_live_YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com/pricing","format":"markdown","country":"us"}'
```

## Async jobs

Crawl, batch, bulk search, datasets and long collector runs answer at once with a job id and a `payload.statusUrl`. Poll that URL (`GET`) until `status` is `completed`/`done`; pass `since` (the previous poll's cursor) to receive only new items. `DELETE` on the same URL cancels the job. Jobs accept an optional `webhook` URL that receives the finished result by POST.

## Limits, balance and prices

- Rate limits are per API key and depend on the account tier; `GET /scraper/billing` returns your tier, the limit per minute, the balance and your price list (`prices_usd`), plus the free monthly allowance (`free_monthly_usd`, `free_remaining_usd`). Do not hard-code prices: read them from that endpoint or from the docs.
- `GET /scraper/usage` gives per-day usage and cost.
- Buying credit or a proxy plan is a human action on https://app.quantumproxies.io (balance, PayPal, card or crypto); the API never takes payment details.

## References

- Interactive reference: https://quantumproxies.io/docs/
- OpenAPI 3.1 (with code samples in cURL, Python, Node.js, PHP): https://quantumproxies.io/docs/openapi.json (YAML: https://quantumproxies.io/docs/openapi.yaml)
- Markdown for agents: https://quantumproxies.io/docs/llms.txt (index), https://quantumproxies.io/docs/index.md (whole reference), per section: https://quantumproxies.io/docs/data-api.md, https://quantumproxies.io/docs/ai.md, https://quantumproxies.io/docs/collectors-datasets.md, https://quantumproxies.io/docs/proxies.md, https://quantumproxies.io/docs/account.md
- Use the data only for pages and purposes the end user is permitted to access; see https://quantumproxies.io/terms/ and the acceptable-use policy linked from it.
