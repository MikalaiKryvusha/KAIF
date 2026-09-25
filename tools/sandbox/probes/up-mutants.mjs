// tools/sandbox/probes/up-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of epic UP 2.8 (plans/122, criteria 14–15).
// Each mutant breaks ONE predicate of the new behaviour in a COPY of dist/KAIF-CORE.mjs (OS temp dir — never the tree, EXP-0077); the named
// suite runs against the copy through the KAIF_DIST seam and its red asserts are compared with the addressees named here BEFORE the run
// (EXP-0059). An anchor that does not match exactly once is a refusal, never a green (bug 122); a suite that died before its section
// proves nothing (budget-mutants, CK5.6).
// Run it after touching the UP blocks of framework/installer/KAIF-CORE.mjs or s18/s21/s27 (fresh dist first):
//   node tools/sandbox/probes/up-mutants.mjs          — ALONE, not beside the polygon (origin bug 109); no window, no sound.
// [TESTED: 2026-09-26 01:12:51 +03:00 · five mutants red exactly on their named addressees (4 · 1 · 2 · 1 · 1); the first two runs were BAD by
//  the probe itself (a suite closing line counted as an assert; s18 without the KAIF_DIST seam; the copy's manifest pinned the unmutated
//  core) — fixed; report testcases/reports/2026-09-26_up-update-loses-nothing.md]
import { readFileSync, writeFileSync, cpSync, rmSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const suite = (n) => join(REPO, 'tools', 'sandbox', n);
const MUTANTS = [
  { name: 'M1 the third state of a rename pair unbound (#72 — the delta of a section renamed in advance is lost again)', suite: 's27-rename-map.mjs', tag: '❌ ',
    from: "  for (const [o, n] of declared) if (!onDisk.has(o) && onDisk.has(n) && !renameFrom.has(n) && !renamedAhead.has(n)) renamedAhead.set(n, o);\n", to: '',
    expect: ['F1 нетронутое тело', 'F1 лог называет', 'F2 правленое тело', 'F2 лог НЕ пишет'] },
  { name: 'M2 the slot capture excludes < and > again (#73 — a fill with brackets reads as no fill)', suite: 's21-update-route.mjs', tag: '❌ ',
    from: '(?<${g}>[^\\\\n]+?)', to: '(?<${g}>[^\\\\n<>]+?)',
    expect: ['B7 (#73)'] },
  { name: 'M3 update-verify stops judging new sections (#92 — a section that never arrived verifies green)', suite: 's21-update-route.mjs', tag: '❌ ',
    from: "          console.error(`✖ a section of this release did not arrive: ${p} :: ${s} — the update delivered it (the previous template never had it, so its absence is not your deletion); merge it from the task, or restore it`);\n          missing++;\n",
    to: '',
    expect: ['D1 (#92): раздела, нового в 9.9, на диске нет', 'E: раздела, нового с 2.7, на диске нет'] },
  { name: 'M4 the previous proposal is dropped again (#92 — an unmerged proposal reads as the owner\'s deletion)', suite: 's21-update-route.mjs', tag: '❌ ',
    from: "    if (oldEIns && oldEIns.sha256 === normSha(modText(nm)) && prevProposed && prevProposed.has(nm.signature)) {", to: '    if (false) {',
    expect: ['D2 (#92): модуль, предложенный прошлым обновлением'] },
  { name: 'M5 a rehearsal record of another core binds again (N17)', suite: 's18-update-symmetries.mjs', tag: '❌ ',
    from: "  if (!r.core || (SELF_SHA && r.core !== SELF_SHA)) {", to: '  if (false) {',
    expect: ['U3в (N17)'] },
];

const root = mkdtempSync(join(tmpdir(), 'kaif-up-mutants-'));
let bad = 0;
for (const m of MUTANTS) {
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(REPO, 'dist'), dist, { recursive: true });
  const p = join(dist, 'KAIF-CORE.mjs');
  const src = readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  const hits = src.split(m.from).length - 1;
  if (hits !== 1) { bad++; console.log(`BAD ${m.name}\n    anchor matched ${hits} time(s) — the mutant did NOT apply`); continue; }
  writeFileSync(p, src.replace(m.from, m.to), 'utf8');
  // the copy's manifest pins the core by sha256 — re-pin it to the mutated core, or every install/update of the copy refuses (CK5.6)
  { const mp = join(dist, 'kaif-manifest.json'); const man = JSON.parse(readFileSync(mp, 'utf8')); man.sha256['KAIF-CORE.mjs'] = createHash('sha256').update(readFileSync(p)).digest('hex'); writeFileSync(mp, JSON.stringify(man, null, 2) + String.fromCharCode(10)); }
  let out = '';
  try { out = execFileSync(process.execPath, [suite(m.suite)], { cwd: REPO, env: { ...process.env, KAIF_DIST: dist }, stdio: 'pipe', maxBuffer: 1 << 27 }).toString(); }
  catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); }
  const red = out.split(/\r?\n/).filter((l) => l.startsWith(m.tag) && !/^❌ s\d+[^:]*: \d+ (red|из)|ПРОВАЛОВ|failure\(s\)/.test(l));   // each suite's own closing line is not an assert
  const died = out.includes('УСТАНОВОЧНЫЙ ШАГ УПАЛ') || /\n\s+at .*\.mjs:\d+:\d+\)?\n/.test(out) && !red.length;
  const verdict = !died && red.length === m.expect.length && m.expect.every((e) => red.some((r) => r.includes(e)));
  if (!verdict) bad++;
  console.log(`${verdict ? 'OK ' : 'BAD'} ${m.name}\n    ${m.suite}: red ${red.length} (named before the run: ${m.expect.length})${died ? ' — the suite DIED: proves nothing' : ''}`);
  for (const r of red) console.log('      ' + r.slice(0, 170));
}
rmSync(root, { recursive: true, force: true });
console.log(bad ? `\n❌ mutant proof FAILED: ${bad} of ${MUTANTS.length}` : `\n✅ ${MUTANTS.length} mutants red exactly on their named addressees, and only on them`);
process.exit(bad ? 1 : 0);
