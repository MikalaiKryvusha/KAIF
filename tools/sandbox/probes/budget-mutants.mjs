// tools/sandbox/probes/budget-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of suite s16 after
// epic CB 2.7 (canon budget by the project's OWN lines · the --gate-budgets door · the language mix by token share).
// Five mutants of the PREDICATES of the new behaviour — never of a constant the suite sets itself (EXP-0139, lesson 5) —
// are applied to a COPY of dist/KAIF-CORE.mjs in the OS temp dir (never to the tree, EXP-0077); the suite runs against the
// copy through the KAIF_DIST seam, and the red assert lines are compared with the addressees named here BEFORE the run
// (EXP-0059): mutant M → exactly these asserts go red, and only they. A mutant whose anchor does not match EXACTLY ONCE
// is a refusal, never a green (origin bug 122: a needle that silently did not apply proves nothing).
// Born in the scratchpad of the epic's subagent (session 66) as cb-mutants.mjs; brought into the repository by the
// integrator so the proof outlives the session (EXP-0016).
// Run it after touching the budget block of framework/installer/KAIF-CORE.mjs or s16:   node tools/sandbox/probes/budget-mutants.mjs
// Needs a FRESH dist (rebuild first); runs the suite five times — run it ALONE, not beside the polygon (origin bug 109).
// Raises no window and no sound. `--list` prints the red asserts of every mutant without judging (to re-name addressees
// after the suite changes).
// [TESTED: 2026-09-18 12:43 +03:00 · run on the origin after the merge of the epic's branch, alone: `--list` named the
//  addressees (3 · 5 · 2 · 4 · 2 — the same counts the subagent reported at 11:57), then the judging run — five mutants red
//  exactly on their 16 named asserts and only on them, no invisible mutant; report testcases/reports/2026-09-18_canon-budget.md,
//  the integrator's addendum]
import { readFileSync, writeFileSync, cpSync, rmSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SUITE = join(REPO, 'tools', 'sandbox', 's16-doc-budgets.mjs');
const LIST_ONLY = process.argv.includes('--list');

const MUTANTS = [
  { name: 'M1 own-lines returns EVERY line (the arrived cut is ignored)',
    from: "  return { total, own: Math.max(0, total - arrived), arrived, basis: 'cut' };",
    to: "  return { total, own: total, arrived, basis: 'cut' };",
    expect: ['приехавший канон (1200) не считается',
             'названное число собственных строк МЕНЬШЕ',
             'строка говорит ВСЛУХ, сколько строк приехало'] },
  { name: 'M2 the door never closes (--gate-budgets always exits 0)',
    from: "  if (has('--gate-budgets') && overBudget.length) {",
    to: "  if (false && has('--gate-budgets') && overBudget.length) {",
    expect: ['`check --gate-budgets` на превышении',
             'гейт печатает строку',
             'та же строка у STATUS',
             'итог гейта называет ЧИСЛО документов',
             'гейт называет верный ход'] },
  { name: 'M3 mix threshold 0 — every localized skill reads as a mix',
    from: '  const LANGUAGE_MIX_FOREIGN_SHARE = 0.35;',
    to: '  const LANGUAGE_MIX_FOREIGN_SHARE = 0;',
    expect: ['RU-навык с ОДНИМ английским словом',
             'токены в бэктиках и код-блоках не считаются'] },
  { name: 'M4 mix threshold above 1 — no body is ever a mix',
    from: '  const LANGUAGE_MIX_FOREIGN_SHARE = 0.35;',
    to: '  const LANGUAGE_MIX_FOREIGN_SHARE = 1.0001;',
    expect: ['появилась отдельная строка о СМЕСИ',
             'назван смесью С ДОЛЕЙ В ПРОЦЕНТАХ',
             'доля zz-mixed лежит около половины',
             'английское тело с тремя кириллическими словами'] },
  { name: 'M5 the owner-seeded branch is gone — one shape, one (wrong) sentence',
    from: "basis: OWNER_SEEDED.includes(doc) ? 'owner-seeded' : 'translated' };",
    to: "basis: 'translated' };",
    expect: ['назван СВОИМ по построению',
             'owner-seeded документ НЕ называется переводом'] },
];

const root = mkdtempSync(join(tmpdir(), 'kaif-budget-mutants-'));
let bad = 0;
for (const m of MUTANTS) {
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(REPO, 'dist'), dist, { recursive: true });
  const p = join(dist, 'KAIF-CORE.mjs');
  const src = readFileSync(p, 'utf8');
  const hits = src.split(m.from).length - 1;
  if (hits !== 1) { bad++; console.log(`BAD ${m.name}\n    anchor matched ${hits} time(s) — the mutant did NOT apply; re-anchor it to the current core`); continue; }
  writeFileSync(p, src.replace(m.from, m.to), 'utf8');
  let out = '';
  try { out = execFileSync(process.execPath, [SUITE], { cwd: REPO, env: { ...process.env, KAIF_DIST: dist }, stdio: 'pipe', maxBuffer: 1 << 26 }).toString(); }
  catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); }
  const red = out.split(/\r?\n/).filter((l) => l.startsWith('❌ s16 ')).map((l) => l.split(' — ')[0]);
  if (LIST_ONLY) { console.log(`### ${m.name} — red ${red.length}`); for (const r of red) console.log('    ' + r.slice(0, 200)); continue; }
  const verdict = red.length > 0 && red.length === m.expect.length && m.expect.every((e) => red.some((r) => r.includes(e)));
  if (!verdict) bad++;
  console.log(`${verdict ? 'OK ' : 'BAD'} ${m.name}\n    red ${red.length} (named before the run: ${m.expect.length})`);
  for (const r of red) console.log('      ' + r.slice(0, 190));
}
rmSync(root, { recursive: true, force: true });
if (LIST_ONLY) process.exit(0);
console.log(bad ? `\n❌ mutant proof FAILED: ${bad} of ${MUTANTS.length}` : `\n✅ ${MUTANTS.length} mutants red exactly on their named addressees, and only on them — no invisible mutant`);
process.exit(bad ? 1 : 0);
