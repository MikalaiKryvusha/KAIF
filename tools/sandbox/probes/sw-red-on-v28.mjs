// tools/sandbox/probes/sw-red-on-v28.mjs — a PROBE (not a polygon suite): the light judge of epic SW (2.9, plans/130 SW6) re-runs the
// claim «the SW cases of s14 · s01 · s16 · s22 are green on this build and RED on v2.8». The cloud session 76 proved it against a v2.8 dist
// in its own scratchpad, which died with it (EXP-0016); this probe extracts the v2.8 dist from the tag and runs each suite through the
// seam KAIF_DIST. Its report (testcases/reports/2026-09-29_sw-delivered-wired.md, run 10) counted on Linux: s14 — all 13 SW2 cases red;
// s01 — 7 S9 cases; s16 — 2 SW4 + 3 SW2; s22 — the SW3 case. A suite also reddens its other 2.9 cases on v2.8 — expected; the probe
// judges the named SW addressees only: each suite must end red, with at least one SW addressee red, and prints the count beside the
// cloud's number. Run it alone (≈ 3 min).
// usage: node tools/sandbox/probes/sw-red-on-v28.mjs
// [TESTED: 2026-10-14 09:50:18 · Windows: s14 — 14 SW2 red, s01 — 8 S9, s16 — 5, s22 — 1, every suite exit 1 on v2.8; HEAD green
//  (polygon 28/28 09:41–09:47); plans/130 SW6 J-SW1; report testcases/reports/2026-10-14_sw-judge-start.md]
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TAG = 'v2.8';
const d28 = mkdtempSync(join(tmpdir(), 'kaif-sw-v28-'));
for (const f of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs', 'KAIF-FULL.md', 'KAIF.md', 'kaif-manifest.json', 'kaif-module-map.json'])
  writeFileSync(join(d28, f), execFileSync('git', ['show', `${TAG}:dist/${f}`], { maxBuffer: 1 << 27 }));
const SUITES = [
  ['tools/sandbox/s14-refresh-hooks.mjs', /s14 SW2/, 13],
  ['tools/sandbox/s01-field-fixes.mjs', /^❌ S9/, 7],
  ['tools/sandbox/s16-doc-budgets.mjs', /s16 SW4|lint-baselines|wire-hooks|SW2/, 5],
  ['tools/sandbox/s22-contour-shipped.mjs', /policy-changes/, 1],
];
let bad = 0;
for (const [suite, addr, cloud] of SUITES) {
  const t0 = new Date().toISOString();
  const r = spawnSync(process.execPath, [suite], { env: { ...process.env, KAIF_DIST: d28 }, encoding: 'utf8', timeout: 900000, maxBuffer: 1 << 26 });
  const out = (r.stdout || '') + (r.stderr || '');
  const red = out.split(/\r?\n/).filter((l) => /^\s*❌/.test(l)).map((l) => l.trim());
  const hits = red.filter((l) => addr.test(l));
  const good = r.status !== 0 && hits.length >= 1;
  if (!good) bad++;
  console.log(`${good ? 'OK ' : 'BAD'} ${suite} on the ${TAG} dist — exit ${r.status}, red ${red.length}, SW addressees red ${hits.length} (cloud run 10: ${cloud}) · ${t0}`);
  for (const l of hits) console.log('    ' + l.slice(0, 170));
  if (!red.length) console.log(out.split(/\r?\n/).slice(-10).join('\n'));
}
rmSync(d28, { recursive: true, force: true });
console.log(bad ? `✖ ${bad} BAD` : `✅ every SW suite is red on ${TAG} on its named SW cases`);
process.exit(bad ? 1 : 0);
