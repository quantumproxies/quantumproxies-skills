#!/usr/bin/env node
// Checks that every skills/<name>/SKILL.md here is byte-identical to the copy
// the site publishes (sha256 digest in https://quantumproxies.io/.well-known/agent-skills/index.json).
//   node scripts/verify.mjs
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = "https://quantumproxies.io/.well-known/agent-skills/index.json";
const res = await fetch(INDEX, { headers: { "user-agent": "quantumproxies-skills/verify" } });
if (!res.ok) throw new Error(`${INDEX}: HTTP ${res.status}`);
const { skills } = await res.json();
let bad = 0;
for (const s of skills) {
  const local = readFileSync(join(ROOT, "skills", s.name, "SKILL.md"));
  const digest = "sha256:" + createHash("sha256").update(local).digest("hex");
  const ok = digest === s.digest;
  if (!ok) bad++;
  console.log(`${ok ? "ok " : "DIFF"} ${s.name}`);
}
if (bad) {
  console.error(`${bad} skill(s) differ from the published copies`);
  process.exit(1);
}
