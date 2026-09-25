// tools/sandbox/probes/fold-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of suite s28's fold asserts (2.8, epic
// CK, step CK5.7; origin issue #80 — a field journal printed 88 per-entry no-class warnings above the one line that mattered). The
// fold mutants of step CK5.7 lived in a session scratchpad and could not be re-run (finding 2 of the CK epic judge, session 74); this
// probe keeps them. Three mutants of the PREDICATES of the fold in framework/tools/kaif-experience-lint.mjs are applied to the module's
// FILE block inside a COPY of dist/KAIF-CORE-BUNDLE.md in the OS temp dir (never to the tree, EXP-0077); s28 runs against the copy
// through the KAIF_DIST seam (its deployed-copy section judges the fold), and the red assert lines are compared with the addressees
// named here BEFORE the run (EXP-0059). A mutant whose anchor does not match EXACTLY ONCE is a refusal; a suite that did not reach its
// verdict line proves nothing (EXP-0158).
// Run it after touching the no-class rule of the module or s28:   node tools/sandbox/probes/fold-mutants.mjs   (`--list` — no judging)
// Needs a FRESH dist (rebuild first); runs the suite three times — run it ALONE (origin bug 109). Raises no window and no sound.
// [TESTED: 2026-09-25 11:45 +03:00 · session 74, alone, on a fresh dist: all three red exactly on their named addressees (2 · 2 · 2 —
//  the s28 fold assert and the deployed module's own selftest), no invisible mutant; the first run (11:44) was an honest BAD — the
//  selftest addressee was not named, and F2 passed the fold assert because the unclassed entry above the first classed one was of a
//  LATER date (the date rule saved it, not the place); s28's fixture now puts it on the SAME day; report
//  testcases/reports/2026-09-25_ck6-epic-judge-fixes.md]
import { readFileSync, writeFileSync, cpSync, rmSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SUITE = join(REPO, 'tools', 'sandbox', 's28-experience-lint.mjs');
const LIST_ONLY = process.argv.includes('--list');

const FOLD = 's28 свёртка (CK5.7): 88 записей';
const VERBOSE = 's28 свёртка (CK5.7): --verbose';
const SELFTEST = 's28 РАЗВЁРНУТЫЙ модуль';   // the deployed module's own selftest has fold cases too — a second, independent addressee
const LEGACY_LINE = '    const legacy = first && !verbose ? bare.filter((e) => {';

const MUTANTS = [
  { name: 'F1 no fold at all (every pre-class failure entry warns by name again)',
    from: LEGACY_LINE, to: '    const legacy = false && first && !verbose ? bare.filter((e) => {', expect: [SELFTEST, FOLD] },
  { name: 'F2 the fold swallows the unclassed entry written AFTER the first classed one (a real warning hidden)',
    from: "      const beyond = direction === 'newest-first' ? i > edge : i < edge;", to: '      const beyond = true;', expect: [SELFTEST, FOLD] },
  { name: 'F3 --verbose is ignored (the fold cannot be opened)',
    from: LEGACY_LINE, to: '    const legacy = first ? bare.filter((e) => {', expect: [SELFTEST, VERBOSE] },
];

const root = mkdtempSync(join(tmpdir(), 'kaif-fold-mutants-'));
let bad = 0;
for (const m of MUTANTS) {
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(REPO, 'dist'), dist, { recursive: true });
  const p = join(dist, 'KAIF-CORE-BUNDLE.md');                    // the module rides in the bundle as a FILE block
  const src = readFileSync(p, 'utf8');
  const hits = src.split(m.from).length - 1;
  if (hits !== 1) { bad++; console.log(`BAD ${m.name}\n    anchor matched ${hits} time(s) — the mutant did NOT apply; re-anchor it to the current module`); continue; }
  writeFileSync(p, src.replace(m.from, m.to), 'utf8');
  let out = '';
  try { out = execFileSync(process.execPath, [SUITE], { cwd: REPO, env: { ...process.env, KAIF_DIST: dist }, stdio: 'pipe', maxBuffer: 1 << 26 }).toString(); }
  catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); }
  const red = out.split(/\r?\n/).filter((l) => l.startsWith('❌ s28 ')).map((l) => l.slice('❌ '.length).split(' — ')[0]);
  const died = !/check\(s\) failed|checks green/.test(out) || out.includes('УСТАНОВОЧНЫЙ ШАГ УПАЛ');
  if (LIST_ONLY) { console.log(`### ${m.name} — red ${red.length}${died ? ' — ⚠ the suite did not reach its verdict: the list is partial' : ''}`); for (const r of red) console.log('    ' + r.slice(0, 200)); continue; }
  const verdict = !died && red.length > 0 && red.length === m.expect.length && m.expect.every((e) => red.some((r) => r.startsWith(e)));
  if (died) console.log('    the suite did not reach its verdict line — this mutant proves nothing');
  if (!verdict) bad++;
  console.log(`${verdict ? 'OK ' : 'BAD'} ${m.name}\n    red ${red.length} (named before the run: ${m.expect.length})`);
  for (const r of red) console.log('      ' + r.slice(0, 190));
}
rmSync(root, { recursive: true, force: true });
if (LIST_ONLY) process.exit(0);
console.log(bad ? `\n❌ mutant proof FAILED: ${bad} of ${MUTANTS.length}` : `\n✅ ${MUTANTS.length} mutants red exactly on their named addressees, and only on them — no invisible mutant`);
process.exit(bad ? 1 : 0);
