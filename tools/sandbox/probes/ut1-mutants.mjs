// tools/sandbox/probes/ut1-mutants.mjs — a PROBE (not a polygon suite): the mutants of epic UT1 (2.9, criterion 16 — the update task
// names the places of the project's texts that still build on a retired or moved thing). Each mutant is a copy of dist/ with ONE
// break in KAIF-CORE.mjs (the manifest pin re-taken), suite s04 is run against it through the KAIF_DIST seam, and the failed S14d/UT1
// cases must be EXACTLY the addressees named here before the run (EXP-0169: a red elsewhere, or a mutation that does not apply, is BAD;
// a suite that dies is BAD — EXP-0158).
//   M1 — the upstream-verbatim filter and the records skip removed → delivered lines and records become places.
//   M2 — the window conditions of a move removed → a pointer to the section itself (no table word) becomes a place.
// Run it alone (≈ 1 min). usage: node tools/sandbox/probes/ut1-mutants.mjs [--list]
// [TESTED: 2026-10-16 11:39:54 → 11:40:38 +03:00 · «2 mutants red exactly on their named addressees» — M1 on its three, M2 on its one;
//  report testcases/reports/2026-10-16_ut1-withdrawn-places.md]
import { cpSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DIST = join(REPO, 'dist');
const SUITE = join(REPO, 'tools', 'sandbox', 's04-anon-legacy.mjs');
const SUITE_TIMEOUT_MS = 600000;
const A_NAMES = 'S14d/UT1 (критерий 16): пункт задания НАЗЫВАЕТ два места';
const A_NOT = 'S14d/UT1: не места';
const A_LEFT = 'S14d/UT1: после правки агента';
const A_C16 = 'S14d/UT1 критерий 16:';
const MUTANTS = [
  { id: 'M1', what: 'the upstream-verbatim filter and the records skip removed', addressees: [A_NAMES, A_NOT, A_LEFT],
    edits: [['if (hit.length && !upstream.has(line.trim()))', 'if (hit.length)'],
            ['if (!/\\.mdc?$/i.test(f) || WITHDRAWN_SKIP.test(f)) continue;', 'if (!/\\.mdc?$/i.test(f) || /^\\.kaif\\//.test(f)) continue;']] },
  { id: 'M2', what: 'the window conditions of a move removed', addressees: [A_C16],
    edits: [['q.re.test(line) && (!q.notWith || (f !== q.notWith && !win().includes(q.notWith))) && (!q.ctx || q.ctx.test(win()))', 'q.re.test(line)']] },
];
if (process.argv.includes('--list')) { for (const m of MUTANTS) console.log(`${m.id} — ${m.what} → ${m.addressees.join(' · ')}`); process.exit(0); }

const ROOT = mkdtempSync(join(tmpdir(), 'kaif-ut1-mutants-'));
let bad = 0;
for (const m of MUTANTS) {
  const d = join(ROOT, m.id); cpSync(DIST, d, { recursive: true });
  const p = join(d, 'KAIF-CORE.mjs');
  let t = readFileSync(p, 'utf8');
  const missing = m.edits.filter(([a]) => !t.includes(a));
  if (missing.length) { bad++; console.log(`BAD ${m.id}: the mutation did not apply — the source changed; re-anchor the probe`); continue; }
  for (const [a, b] of m.edits) t = t.replace(a, () => b);
  writeFileSync(p, t);
  const man = JSON.parse(readFileSync(join(d, 'kaif-manifest.json'), 'utf8'));
  if (man.sha256 && man.sha256['KAIF-CORE.mjs']) man.sha256['KAIF-CORE.mjs'] = createHash('sha256').update(readFileSync(p)).digest('hex');
  writeFileSync(join(d, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
  const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, KAIF_DIST: d, KAIF_VOICE_TOOL: '' }, encoding: 'utf8', timeout: SUITE_TIMEOUT_MS, maxBuffer: 1 << 27 });
  const out = (r.stdout || '') + (r.stderr || '');
  if (!/ПРОВАЛОВ|все песочницы/.test(out)) { bad++; console.log(`BAD ${m.id}: DIED — the suite did not reach its summary (exit ${r.status})`); continue; }
  const red = out.split(/\r?\n/).filter((l) => l.startsWith('❌ ') && !/ПРОВАЛОВ/.test(l));
  const wanted = m.addressees.every((a) => red.some((l) => l.includes(a)));
  const foreign = red.filter((l) => !m.addressees.some((a) => l.includes(a)));
  const good = wanted && !foreign.length;
  if (!good) bad++;
  console.log(`${good ? 'OK ' : 'BAD'} ${m.id} (${m.what}): red ${red.length}${wanted ? '' : ' — an addressee stayed green'}${foreign.length ? ' — foreign red: ' + foreign.map((l) => l.slice(2, 90)).join(' | ') : ''}`);
}
console.log(bad ? `\nFAILED: ${bad} of ${MUTANTS.length} — the run folder is kept: ${ROOT}` : `\n${MUTANTS.length} mutants red exactly on their named addressees, and only on them`);
if (!bad) rmSync(ROOT, { recursive: true, force: true });
process.exit(bad ? 1 : 0);
