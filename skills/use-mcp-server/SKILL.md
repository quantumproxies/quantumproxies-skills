---
name: use-mcp-server
description: "Connect an MCP client (Claude, Cursor, ChatGPT, any MCP host) to the QuantumProxies.io MCP server: remote Streamable HTTP endpoint with OAuth 2.1 or API key, local npm package quantumproxies-mcp, tool presets, and the list of the 28 tools. Use when the user wants QuantumProxies.io tools inside an AI assistant instead of raw HTTP calls."
metadata:
  publisher: QuantumProxies.io
  homepage: https://quantumproxies.io/
  version: "2026-10-07"
---

# Use the QuantumProxies.io MCP server

The QuantumProxies.io MCP server exposes the Data API as 28 tools. It exists in two flavours that behave the same:

| Flavour | How to connect |
| --- | --- |
| Remote (Streamable HTTP) | `https://api.quantumproxies.io/mcp` |
| Local (stdio, npm) | `npx -y quantumproxies-mcp` with `QUANTUMPROXIES_API_KEY` set |

Product page and client-specific instructions: https://quantumproxies.io/mcp-server

## Remote server: authentication

- Without credentials the endpoint answers `401` with `WWW-Authenticate: Bearer resource_metadata="https://api.quantumproxies.io/.well-known/oauth-protected-resource/mcp", scope="mcp"`. An MCP client that supports the MCP authorization spec (OAuth 2.1) follows that metadata to the authorization server `https://app.quantumproxies.io` (`/.well-known/oauth-authorization-server`), registers dynamically (`client_id_metadata_document_supported: true`), opens the sign-in and consent screen, and obtains a token with PKCE (S256). Scope: `mcp`.
- Alternatively send an API key directly: `Authorization: Bearer qp_live_YOUR_API_KEY` (keys are created on https://app.quantumproxies.io after signing up). The OAuth token is never forwarded to the API: the server resolves it to the key of that grant.

Example client configuration (Claude Desktop / Cursor style `mcpServers`):

```json
{
  "mcpServers": {
    "quantumproxies": { "url": "https://api.quantumproxies.io/mcp" }
  }
}
```

## Local server (npm)

```json
{
  "mcpServers": {
    "quantumproxies": {
      "command": "npx",
      "args": ["-y", "quantumproxies-mcp"],
      "env": { "QUANTUMPROXIES_API_KEY": "qp_live_YOUR_API_KEY" }
    }
  }
}
```

`QUANTUMPROXIES_TOOLS` selects a preset to keep the tool list short: `lite` (search_and_read only), `web` (scrape, search, search_and_read), `research` (web + map, batch, batch_status), `collectors`, `proxies`, or a comma-separated list of tool names.

## The 28 tools

| Group | Tool | What it does |
| --- | --- | --- |
| Scrape | `scrape` | One URL to clean Markdown, HTML or text (PDF and Office documents too) through a residential IP with a real-browser TLS fingerprint. Optional CSS, preset or AI extraction, `mode: summary`, browser actions. |
| Search | `search` | Structured Google, Bing or DuckDuckGo results across 17 verticals (web, images, news, shopping, maps, jobs, flights, hotels, lens and more). `render: true` adds AI Overview, People Also Ask and Knowledge Graph. |
| Search | `search_and_read` | Search, fetch the top organic pages as clean Markdown and return numbered citation-ready sources plus one token-bounded `context` string for the prompt. |
| Search | `search_bulk` | Async multi-page SERP pagination with merged organic results and page-one AI and zero-click enrichments. Returns a job id. |
| Search | `search_bulk_status` | Poll a bulk search job; `since` returns only the pages collected after the previous poll. |
| Map & Crawl | `map` | Fast URL discovery from sitemaps and homepage links, no full crawl: up to `limit` URLs plus a site-wide total and a per-section summary; `group_by: path` for the tree. |
| Map & Crawl | `crawl` | Start an async breadth-first crawl from a seed URL, every page converted to Markdown. Depth control, include and exclude globs. Returns a job id. |
| Map & Crawl | `crawl_status` | Poll a crawl job for progress and the pages gathered so far. The `since` cursor and `include_content` keep polls light. |
| Batch | `batch` | Scrape up to 1,000 URLs asynchronously with shared options; `mode: summary` for metadata-only items. Returns a job id. |
| Batch | `batch_status` | Poll a batch job incrementally with the `since` cursor; page content only with `include_content`. |
| Unlock | `unlock` | Web Unlocker: replay any HTTP request (method, headers, body) through a residential exit, retry on a fresh IP, escalate a blocked GET to a real browser. A still-blocked page comes back flagged, never as a silent 200. |
| AI visibility | `ai_visibility` | Can ChatGPT, Claude, Perplexity, Google AI Overview and Bing Copilot read and cite a page? On-page audit scored per pillar with blockers, evidence and fixes, plus an optional citation panel that asks the engines. |
| SEO | `seo_audit` | Fetch a URL as a no-JS bot and fully rendered, return both SEO views plus the diff (JS-only content, changed title or description, missing canonical) and bot-facing meta (robots, Open Graph, JSON-LD). |
| Collectors | `list_collectors` | Catalog of the ready-made Collectors (slug, category, price per delivered row, required input), or one collector's full schema and example with `slug`. |
| Collectors | `run_collector` | Run a Collector by slug with a semantic input (keyword + location, place id, product id, domain) instead of URLs. Short runs return rows inline, long runs a `run_id`. |
| Collectors | `collector_run_status` | Poll a collector run by `run_id`; rows as JSON or CSV, billed per delivered row only. |
| Datasets | `create_dataset` | Prompt-driven structured dataset collection with columns, sources, budget and row limits. Returns a job id. |
| Datasets | `dataset_status` | Poll a dataset job: rows so far, cost, and signed CSV and JSON downloads when done. |
| Parser presets | `generate_parser` | Learn the CSS selectors of a page layout once with an LLM and get back a deterministic parser to reuse for free. |
| Parser presets | `save_parser_preset` | Store a generated parser as a named preset that `scrape` runs by `preset_id`, with optional self-healing. |
| Parser presets | `list_parser_presets` | List this account's parser presets with their ids. |
| Parser presets | `parser_preset_stats` | Health of one preset: success rate, recent runs, empty fields, whether it needs healing. |
| Parser presets | `heal_parser_preset` | Regenerate a preset's selectors after the site layout changed (`force` heals a healthy one). |
| Proxies | `list_proxies` | Your proxy services of every type (Residential Basic, Premium and Private, Mobile, Mobile V2, Datacenter, ISP, IPv6) with bandwidth left, expiry and the `orderId` used to generate. |
| Proxies | `generate_proxies` | Ready-to-use proxy strings (credentials included) from any active plan: country, state, city, ISP or ASN targeting, rotating or sticky sessions, HTTP or SOCKS5, several output formats. |
| Proxies | `proxy_locations` | Valid geo-targeting values per plan type: countries, states, cities, ASNs, or the full location tree with ISP codes. |
| Proxies | `whitelist_ip` | Add, list or remove IP-auth whitelist entries for the plans that support it, including the Mobile V2 IP-auth proxy list. |
| Feedback | `report` | Send feedback to the team from inside the agent: a bug, a missing feature or collector, a question. Works without an API key. |

`report` works without a key: use it to send a bug, a missing feature or a question to the team from inside the agent.

## Good practice

- Prefer `search_and_read` for "find and summarise" tasks (one call, citation-ready sources), `scrape` for one known URL, `batch` for many URLs, `map` before `crawl` to size a site.
- Every billable result carries `usage.cost_usd`; read `GET /scraper/billing` (or ask the user) before large jobs.
- Only fetch pages the user is permitted to access.
