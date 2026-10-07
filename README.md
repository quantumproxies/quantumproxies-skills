# QuantumProxies.io Agent Skills

Agent Skills for QuantumProxies.io: proxies, web scraping, search, crawling, Collectors and datasets for Claude, Codex, Cursor and any agent that reads SKILL.md.

An [Agent Skill](https://agentskills.io/specification) is a folder with a `SKILL.md`
file: a short, instruction-level guide the agent loads only when the task needs it.
These five teach an agent how to use QuantumProxies.io correctly, with the real endpoints,
tool names and parameters, so it stops guessing.

| Skill | What it teaches |
| --- | --- |
| [`use-data-api`](skills/use-data-api/SKILL.md) | Call the REST Data API: authentication, response envelope, async jobs, references |
| [`use-mcp-server`](skills/use-mcp-server/SKILL.md) | Connect any MCP client: hosted OAuth endpoint or local npm package, tool presets |
| [`scrape-to-markdown`](skills/scrape-to-markdown/SKILL.md) | One URL to clean Markdown or structured fields; batch, map and crawl for many |
| [`generate-proxies`](skills/generate-proxies/SKILL.md) | Proxy strings from your plans: geo-targeting, sticky sessions, IP whitelists |
| [`find-business-leads`](skills/find-business-leads/SKILL.md) | Business lists and datasets: Collectors, AI Places Finder, dataset builder |

The same files are published by the site itself at
`https://quantumproxies.io/.well-known/agent-skills/index.json` (Agent Skills discovery index);
this repository is the installable mirror. `scripts/verify.mjs` checks that
the two are byte-identical.

## Install

With the [`skills` CLI](https://github.com/vercel-labs/skills) (Claude Code,
Codex, Cursor, Gemini CLI, OpenCode, Copilot and 70+ other agents):

```bash
npx skills add quantumproxies/quantumproxies-skills
# or straight from the site, no GitHub needed:
npx skills add https://quantumproxies.io
```

Add `-g` to install for every project, `-a claude-code` to target one agent,
`--skill use-mcp-server` to pick a single skill.

With the GitHub CLI (`gh` 2.90 or newer):

```bash
gh skill install quantumproxies/quantumproxies-skills
```

### Claude Code

As a plugin (the repository is also a plugin marketplace):

```
/plugin marketplace add quantumproxies/quantumproxies-skills
/plugin install quantumproxies@quantumproxies-skills
```

Or by hand: copy `skills/<name>` into `~/.claude/skills/` (every project) or
into `.claude/skills/` of a project. Claude Code loads `SKILL.md` from there
on its own.

```bash
git clone https://github.com/quantumproxies/quantumproxies-skills
mkdir -p ~/.claude/skills && cp -r quantumproxies-skills/skills/* ~/.claude/skills/
```

### Codex, Cursor, Gemini CLI, OpenCode, Amp and others

These agents read `.agents/skills/` (project) and `~/.agents/skills/` (user);
copy the same folders there, or let `npx skills add` do it.

### Claude.ai

Zip one `skills/<name>` folder and upload it under **Customize > Skills > Upload a skill**.

## Credentials

The skills call QuantumProxies.io with an API key (`qp_live_…`) created on the
dashboard after a free sign-up: https://app.quantumproxies.io/register. Put it in the
`QUANTUMPROXIES_API_KEY` environment variable, or connect the hosted MCP server with
OAuth and skip the key altogether. How credentials work, written for agents:
https://quantumproxies.io/auth.md

## References

- API reference: https://quantumproxies.io/docs/ (OpenAPI: https://quantumproxies.io/docs/openapi.json, Markdown: https://quantumproxies.io/docs/llms.txt)
- MCP server: https://quantumproxies.io/mcp-server/ (hosted endpoint and the `quantumproxies-mcp` npm package)
- Auth for agents: https://quantumproxies.io/auth.md
- Discovery index: https://quantumproxies.io/.well-known/agent-skills/index.json

## Contributing

Skills are generated from the site's published copies; open an issue for a
wrong parameter or a missing workflow and it is fixed at the source. Pull
requests that edit `skills/` directly are overwritten on the next sync.

## License

MIT, see [LICENSE](LICENSE). Use of the QuantumProxies.io service itself is governed by
https://quantumproxies.io/terms/.
