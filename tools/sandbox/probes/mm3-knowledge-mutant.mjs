// MM3 (2.10), origin #160 — mutant proofs of the knowledge hook on COPIES (EXP-0077): each mutant breaks ONE part of the hook and must turn
// red exactly the selftest cases named for it BEFORE the run; the control copy stays green. A mutation whose text is not found prints DIED
// — a dead mutant proves nothing (EXP-0158).
//   M1 «agent-message not excluded»  — a subagent's hand-back read as the owner (live finding of session 97)
//   M2 «a subagent's call judged»    — the guard of the judge of session 97 removed
//   M3 «known never quoted»          — a source file the map names gets the «unknown» line (judge of epics MM · TK10, hunt 2)
//   M4 «unknown silent»              — a source file the maps never name gets no line (same hunt)
//   M5 «configs are code»            — package.json · *.yaml · *.toml order a map line again (finding 5)
//   M6 «generic base matched»        — index.mjs quotes the map line of another index.mjs (finding 5)
// Run: node tools/sandbox/probes/mm3-knowledge-mutant.mjs   (≈ 2 s)
// [TESTED: ≈ 2026-11-06 15:19 · control 0 red, six mutants each red exactly on its named cases; report testcases/reports/2026-11-06_s98-judge-debt-mm-tk10.md]
import { mkdtempSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const HOOK = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'framework', 'hooks', 'knowledge-moment.mjs');
const KNOWN = 'recall by association', UNKNOWN = 'a source file the maps never name', CONFIG = 'a config file', GENERIC = 'a generic name (index.mjs)';
const MUTANTS = [
  { name: 'agent-message not excluded', from: '|system-reminder|agent-message)', to: '|system-reminder)', addressees: ['a subagent hand-back'] },
  { name: "a subagent's call judged", from: 'export const fromSubagent = (ev) => Boolean(ev && ev.agent_id);', to: 'export const fromSubagent = (ev) => false;',
    addressees: ["a subagent's tool call"] },
  { name: 'known never quoted', from: 'hit ? LINES.known(rel, hit.doc, hit.excerpt) : LINES.unknown(rel)', to: 'LINES.unknown(rel)', addressees: [KNOWN, GENERIC] },
  { name: 'unknown silent', from: 'hit ? LINES.known(rel, hit.doc, hit.excerpt) : LINES.unknown(rel)', to: 'hit ? LINES.known(rel, hit.doc, hit.excerpt) : null',
    addressees: [UNKNOWN, GENERIC] },
  { name: 'configs are code', from: '|vue|svelte|html|css)$/i;', to: '|vue|svelte|html|css|json|ya?ml|toml)$/i;', addressees: [CONFIG] },
  { name: 'generic base matched', from: 'byBase = base.length >= 5 && !GENERIC_BASE.test(base)', to: 'byBase = base.length >= 5', addressees: [GENERIC] },
];
const run = (mut) => {
  const d = mkdtempSync(join(tmpdir(), 'kaif-mm3m-'));
  try {
    const f = join(d, 'hook.mjs'); copyFileSync(HOOK, f);
    if (mut) { const t = readFileSync(f, 'utf8'); if (!t.includes(mut.from)) return { err: 'mutation text not found' }; writeFileSync(f, t.split(mut.from).join(mut.to)); }
    const r = spawnSync(process.execPath, [f, '--selftest'], { encoding: 'utf8', timeout: 60000 });
    const out = r.stdout || '';
    return { status: r.status, xs: out.split('\n').filter((l) => l.startsWith('  x ')), reached: /selftest: /.test(out) };
  } finally { rmSync(d, { recursive: true, force: true }); }
};
const c = run(null);
let ok = c.status === 0 && c.xs.length === 0 && c.reached;
console.log(`${ok ? 'OK  ' : 'BAD '}control: exit ${c.status}, red ${c.xs.length}`);
for (const m of MUTANTS) {
  const r = run(m);
  if (r.err || !r.reached) { ok = false; console.log(`DIED ${m.name}: ${r.err || 'the selftest did not finish (exit ' + r.status + ')'} — this mutant proves nothing`); continue; }
  const good = r.status !== 0 && m.addressees.every((a) => r.xs.some((x) => x.includes(a))) && r.xs.every((x) => m.addressees.some((a) => x.includes(a)));
  if (!good) ok = false;
  console.log(`${good ? 'OK  ' : 'BAD '}${m.name}: exit ${r.status}, red ${r.xs.length} · addressees ${m.addressees.join(' · ')}`);
  for (const x of r.xs) console.log('     ' + x.slice(0, 140));
}
console.log(ok ? '✅ each mutant red on exactly its named cases' : '❌ mutant proof failed');
process.exit(ok ? 0 : 1);
