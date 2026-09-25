// tools/sandbox/probes/ow6-contour-mutants.mjs — a PROBE (not a polygon suite): the OW6 selftest cases of the shipped contour (2.8, the
// KAIF owner's word — answers are saved one at a time in every project; the stale-tab gap of a neighbour field project), proved on COPIES
// of framework/tools/contour/ in the OS temp dir (never the tree, EXP-0077). A mutant that kills the live server reddens every live case
// AFTER the point it breaks — those are its named addressees; each mutant must redden exactly them, and only them.
// usage: node tools/sandbox/probes/ow6-contour-mutants.mjs
// [TESTED: 2026-09-25 19:40:02, again 20:05:56 on the final selftest · five mutants red exactly on their named cases (two named after an honest BAD); report testcases/reports/2026-09-25_ow6-partial-save-revision.md]
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const SRC = 'framework/tools/contour';
const LIVE_AFTER_PARTIAL = ['a partial save (Q1 of three)', 'a save of the OLD revision', 'the same save repeated', 'the second partial save MERGES', 'the LAST answer ends'];
const M = [
  ['a save closes the contour (the norm №126 revokes)', 'review.mjs', '            if (left > 0) { // OW6', '            if (false) { // OW6', LIVE_AFTER_PARTIAL],
  ['revision check removed (the stale-tab gap)', 'review.mjs', '            if (payload.rev !== revNow) {', '            if (false) {',
    ['a save of the OLD revision', 'the same save repeated', 'the second partial save MERGES']], // the last answer still ends the contour — not its case
  ['merge removed', 'core.mjs', "  if (prev && payload.rev && prev.revAfter === payload.rev && (prev.kind || 'interview') === record.kind) {",
    "  if (false) {", ['the second record of the same page MERGES', 'the second partial save MERGES']],
  ['draft carried over by number (no fingerprint)', 'review.mjs', `"function dkey(n){var h=qhOf(n);return DK+n+(h?'#'+h:'')}",`,
    `"function dkey(n){return DK+n}",`, ['a draft key carries its question']],
  ['the page does not re-read itself after a partial save', 'review.mjs', "location.reload();return}\",", "status(fmt(TX.left,{n:res.j.left}),'okmsg');return}\",",
    ['a partial save re-reads the page']],
];
let bad = 0;
for (const [name, file, from, to, exp] of M) {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-ow6-mut-'));
  cpSync(SRC, dir, { recursive: true });
  const f = join(dir, file);
  const s = readFileSync(f, 'utf8');
  if (s.split(from).length !== 2) { console.log(`BAD ${name}: anchor did not apply (${s.split(from).length - 1}x)`); bad++; rmSync(dir, { recursive: true, force: true }); continue; }
  writeFileSync(f, s.replace(from, () => to));
  const r = spawnSync(process.execPath, [join(dir, 'review.mjs'), '--selftest'], { encoding: 'utf8', cwd: dir, timeout: 180000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const red = out.split(/\r?\n/).filter((l) => /^\s*x /.test(l));
  const died = !/SELFTEST RED: \d+ of \d+|contour selftest green/.test(out);   // EXP-0158: a mutant that kills the run proves nothing
  const good = !died && r.status !== 0 && red.length === exp.length && exp.every((a) => red.some((l) => l.includes(a)));
  if (!good) bad++;
  console.log(`${good ? 'OK ' : 'BAD'} ${name} — exit ${r.status}, red lines: ${red.length}${died ? ' · DIED (no SELFTEST line)' : ''}`);
  for (const l of red) console.log('    ' + l.trim().slice(0, 150));
  rmSync(dir, { recursive: true, force: true });
}
console.log(bad ? `✖ ${bad} BAD` : `✅ ${M.length} mutants red exactly on their named cases, and only on them`);
process.exit(bad ? 1 : 0);
