// tools/sandbox/probes/resume-scope-red.mjs — a PROBE (not a polygon suite): the three checks of decision #143 (2.9 — the KAIF owner,
// rendered from Russian: "the entry skill tells you wrong"; a session answered "how much is left?" and started the plan's next item by
// itself) proved RED on the v2.8 behaviour, so their green on HEAD means something (TESTING_FRAMEWORK gate 5; EXP-0016 — the proof lives
// in the repository, not in a scratchpad).
//   (1) guard 5r of tools/check-framework.mjs — on a COPY of the tracked tree (assets and PDFs left out), control: no `5r:` line;
//       mutant: the shipped /resume and /refresh-context put back to their v2.8 text — exactly SIX `5r:` lines (four missing lines of the
//       scope rule, the bare v2.8 exit, the refresh-context scope);
//   (2) suite s14 against the v2.8 dist (seam KAIF_DIST) — the case «s14 resume-word (№143)» is red;
//   (3) suite s21 against the v2.8 dist — the two «E (№143)» cases are red (the update to "now" leaves the old skill and hook on disk).
// The suites also redden their other 2.9 cases on v2.8 — expected; this probe judges only the named addressees.
// usage: node tools/sandbox/probes/resume-scope-red.mjs        (≈ 1 min; run it alone)
// [TESTED: 2026-10-14 09:31:11 · guard 5r: control 0, v2.8 skills 6; s14 on the v2.8 dist — the №143 case red (1 of 1);
//  s21 on the v2.8 dist — both E (№143) cases red (2 of 2); report testcases/reports/2026-10-14_resume-scope-143.md]
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const TAG = 'v2.8';
const SKILLS = ['framework/skills/resume/SKILL.md', 'framework/skills/refresh-context/SKILL.md'];
const RUN_TIMEOUT_MS = 600000;
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const node = (args, cwd, env = process.env) => {
  const r = spawnSync(process.execPath, args, { cwd, env, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
};
const show = (p) => execFileSync('git', ['show', TAG + ':' + p], { maxBuffer: 1 << 27 });

// (1) guard 5r on copies of the tracked tree
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\0')
  .filter((f) => f && !f.startsWith('assets/') && !/\.(pdf|png|jpe?g|gif|webp)$/i.test(f));
const copyTree = () => {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-143-'));
  for (const f of files) { mkdirSync(dirname(join(dir, f)), { recursive: true }); copyFileSync(f, join(dir, f)); }
  return dir;
};
const lines5r = (out) => out.split(/\r?\n/).filter((l) => /5r: /.test(l)).map((l) => l.trim());
const cDir = copyTree();
const c = node(['tools/check-framework.mjs'], cDir);
const c5r = lines5r(c.out);
say(c5r.length === 0, `guard 5r — control copy: ${c5r.length} line(s) «5r:» (exit ${c.code})`);
for (const l of c5r) console.log('    ' + l.slice(0, 200));
rmSync(cDir, { recursive: true, force: true });
const mDir = copyTree();
for (const s of SKILLS) writeFileSync(join(mDir, s), show(s));
const m = node(['tools/check-framework.mjs'], mDir);
const m5r = lines5r(m.out);
say(m5r.length === 6 && m5r.some((l) => /refresh-context/.test(l)) && m5r.some((l) => /the v2\.8 Step 2/.test(l)),
  `guard 5r — the shipped /resume and /refresh-context of ${TAG}: ${m5r.length} line(s) «5r:» (expected 6)`);
for (const l of m5r) console.log('    ' + l.slice(0, 200));
rmSync(mDir, { recursive: true, force: true });

// (2)(3) suites against the v2.8 dist
const d28 = mkdtempSync(join(tmpdir(), 'kaif-143-dist-'));
for (const f of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs', 'KAIF-FULL.md', 'KAIF.md', 'kaif-manifest.json', 'kaif-module-map.json'])
  writeFileSync(join(d28, f), show('dist/' + f));
const env28 = { ...process.env, KAIF_DIST: d28 };
const redLines = (out) => out.split(/\r?\n/).filter((l) => /^\s*❌/.test(l)).map((l) => l.trim());
for (const [suite, addressees] of [
  ['tools/sandbox/s14-refresh-hooks.mjs', ['s14 resume-word (№143)']],
  ['tools/sandbox/s21-update-route.mjs', ['E (№143): после update', 'E (№143): после update']],
]) {
  const r = node([suite], process.cwd(), env28);
  const red = redLines(r.out);
  const hits = red.filter((l) => addressees.some((a) => l.includes(a)));
  say(r.code !== 0 && hits.length === addressees.length,
    `${suite} on the ${TAG} dist: exit ${r.code}, red ${red.length}, of them the named №143 addressees ${hits.length} of ${addressees.length}`);
  for (const l of hits) console.log('    ' + l.slice(0, 200));
  if (!red.length) console.log(r.out.split(/\r?\n/).slice(-12).join('\n'));
}
rmSync(d28, { recursive: true, force: true });
console.log(bad ? `✖ ${bad} BAD` : `✅ guard 5r and the №143 cases of s14 and s21 are red on ${TAG} exactly where named; the control copy is silent`);
process.exit(bad ? 1 : 0);
