---
name: generate-proxies
description: "List the user's QuantumProxies.io proxy plans and generate ready-to-use proxy strings (HTTP or SOCKS5, country/state/city/ISP/ASN targeting, rotating or sticky sessions), look up valid locations, and manage IP-authentication whitelists. Use when an agent needs proxy credentials for the user's own tools or scrapers."
metadata:
  publisher: QuantumProxies.io
  homepage: https://quantumproxies.io/
  version: "2026-10-07"
---

# Generate proxies with QuantumProxies.io

Proxy plans are bought by a human on https://app.quantumproxies.io (plan types: Residential Basic, Residential Premium, Residential Private, Mobile, Mobile V2, Datacenter, ISP, IPv6). Once a plan is active, the API and the MCP tools generate the connection strings.

## 1. Find the plan

- MCP: `list_proxies` (filters `active`, `planType`)
- REST: `GET https://api.quantumproxies.io/v1/public/proxies`

Each entry has the `orderId` used below, the plan type, bandwidth left and expiry. No active plan means nothing can be generated: send the user to the dashboard.

## 2. Generate strings

- MCP: `generate_proxies`
- REST: `POST https://api.quantumproxies.io/v1/public/proxies/generate`

```bash
curl -X POST 'https://api.quantumproxies.io/v1/public/proxies/generate' \
  -H 'Authorization: Bearer qp_live_YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"orderId":"ord_8c21","protocol":"http","format":"user:pass@host:port","quantity":5,"country":"us","rotation":"sticky","sessionTime":10}'
```

Parameters:

| Field | Values |
| --- | --- |
| `orderId` (required) | from step 1 |
| `protocol` | `http`, `socks5` |
| `format` | `user:pass@host:port`, `host:port:user:pass`, `http://user:pass@host:port`, `socks5://user:pass@host:port` |
| `quantity` | number of strings |
| `country` | lowercase ISO code (`us`), `all` for none |
| `state` / `city` | slugs from the location tree (Residential Premium, Mobile V2) |
| `isp` / `asn` | ISP code (Premium / Mobile V2) or `AS12345` (Basic / Datacenter) |
| `rotation` | `rotating` (new IP per request), `sticky` (same IP for `sessionTime` minutes), `static` (IPv6 only) |
| `filter` | `speed`, `speed-quality`, `quality` (Premium / Mobile V2 pool filter) |

The answer's `payload.proxies` is the list of strings, credentials included; `payload.bandwidthLeft` tells what remains. ISP plans may answer `202` with `pending: true` while they are provisioned: retry later.

Treat the strings as secrets: they carry the user's credentials.

## 3. Valid locations

- MCP: `proxy_locations` (`planType`, `level`: countries, states, cities, ASNs, or the full tree with ISP codes)
- Use it before targeting a state, city or ISP: the slugs differ by plan type.

## 4. IP authentication instead of user:pass

- MCP: `whitelist_ip` (`action`: add, list, remove; Mobile V2 also allocates ports with `ports_count`, `protocol`, geo and `sticky`/`ttl`)
- REST: `GET/POST/DELETE https://api.quantumproxies.io/v1/public/proxies/whitelist-ip` with `{"orderId", "ip"}`

## Extras

- `GET https://api.quantumproxies.io/v1/public/proxies/ip-info?ip=…` geolocates an IP (useful to verify an exit).
- Plan prices and bandwidth packages are on https://quantumproxies.io/pricing and change over time: do not quote prices from memory.
