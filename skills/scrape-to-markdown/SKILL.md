---
name: scrape-to-markdown
description: "Turn any web page into clean Markdown, HTML or text with QuantumProxies.io: choose the fetch engine, keep only the relevant section of a large page, extract structured fields with CSS selectors or an AI prompt, and scale to many URLs with batch, map and crawl. Use when an agent needs page content it cannot fetch itself (JavaScript, blocks, geo-restricted pages)."
metadata:
  publisher: QuantumProxies.io
  homepage: https://quantumproxies.io/
  version: "2026-10-07"
---

# Scrape a page to Markdown with QuantumProxies.io

One URL in, clean Markdown out, fetched from a residential IP with a real-browser TLS fingerprint. Works for HTML pages, PDFs and Office documents.

- MCP tool: `scrape`
- REST: `POST https://api.quantumproxies.io/v1/scraper/extract` (`Authorization: Bearer qp_live_YOUR_API_KEY`)

```bash
curl -X POST 'https://api.quantumproxies.io/v1/scraper/extract' \
  -H 'Authorization: Bearer qp_live_YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com/pricing","format":"markdown","country":"us","extract":{"title":"h1","price":".price"}}'
```

The result is the envelope `{type, message, payload}`; the page content is in `payload` in the requested `format`, metadata (title, description, canonical, status, engine, bytes) in `payload.metadata`, structured fields in `payload.data`, AI output in `payload.ai.data`.

## Choosing how the page is fetched

| Option | Values | When |
| --- | --- | --- |
| `engine` | `auto` (default), `tls`, `fetch`, `render` | `auto` tries plain HTTP with a Chrome TLS profile and escalates to a headless browser only on JavaScript-only pages or a block. `tls` never renders: what a crawler without JavaScript sees (right for SEO checks). `render` always uses the browser. |
| `country` | ISO code, e.g. `us`, `it` | Proxy exit country for geo-specific content. |
| `content_mode` (REST: `contentMode`) | `smart` (default), `article`, `full` | `smart` drops nav/footer/cookie chrome; `article` keeps the Readability main article; `full` the whole body. |
| `format` | `markdown`, `html`, `text` | `formats` returns several at once under `payload.formats`. |
| `mode` | `summary` | Metadata only, no content: use it to audit pages cheaply. |
| `actions` | list of `{click}`, `{clickText}`, `{type}`, `{scroll}`, `{wait}`, `{waitForSelector}` | Dismiss a consent wall or submit a form before capture (forces render). |

## Reading big pages without spending the whole token budget (MCP tool)

- `query`: keep only the sections relevant to a question (BM25 over blocks, headings preserved); `highlights: N` adds the N best passages.
- `max_tokens`: cap the Markdown at a section boundary and note what was omitted.
- `links_mode: "strip"` or `"footnote"` on link-dense pages; `images_mode: "alt"`.
- `chunk: {by: "heading" | "sentence" | "tokens", size, overlap}` segments the output for RAG ingestion; `frontmatter: true` prepends title/url/canonical/date.
- `include_links: true` returns the de-duplicated absolute links for the next hop.

## Structured extraction

- `extract`: `{ "field": "css selector" }` or `{ "field": { "selector", "attr", "all", "fns" } }`. `fns` is a transform pipeline (`amount_from_string`, `trim`, `lower`, `{regex_search: "pat"}`, `{join: ","}`, `length`, `unique`, `max`, …), so a price comes back as a number.
- `ai_prompt` + optional `ai_schema` (JSON Schema): the LLM turns the page into JSON (billed with token markup, see `GET /scraper/billing`).
- Reusable layouts: `generate_parser` learns the selectors once, `save_parser_preset` stores them, then `scrape` with `preset_id` runs them for free and `parser_preset_stats` / `heal_parser_preset` keep them working when the site changes.
- SPAs: `app_state: true` mines the page's hydration state (`__NEXT_DATA__`, Nuxt, JSON islands); `xhr: true` records the page's own API calls and `fetch_resource: "/api/products"` returns that JSON instead of the HTML.

## Many pages

- `map` (`POST /scraper/map`): URL discovery from sitemaps and homepage links, with a per-section summary; `search` filters by substring, `group_by: "path"` returns the tree.
- `batch` (`POST /scraper/batch`): up to 1,000 URLs with shared options, `mode: "summary"` for metadata only; poll with `batch_status` / `GET /scraper/batch/{jobId}` and the `since` cursor.
- `crawl` (`POST /scraper/crawl`): breadth-first from a seed URL with `depth`, `limit`, `include`/`exclude` globs; poll with `crawl_status`.
- `unlock` (`POST /scraper/unlock`): replay any HTTP request (method, headers, body) through a residential exit with retries on a fresh IP and escalation to a real browser; a still-blocked page comes back flagged, never as a silent 200.

Only scrape pages the user is permitted to access and respect the target site's terms.
