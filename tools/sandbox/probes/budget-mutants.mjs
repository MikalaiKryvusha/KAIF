// tools/sandbox/probes/budget-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of suite s16 after
// epic CB 2.7 (canon budget by the project's OWN lines · the --gate-budgets door · the language mix by token share).
// Five mutants of the PREDICATES of the new behaviour — never of a constant the suite sets itself (EXP-0139, lesson 5) —
// and a sixth of the SHIPPED TEMPLATE (the bundle) are applied to a COPY of dist/ in the OS temp dir (never to the tree, EXP-0077); the suite runs against the
// copy through the KAIF_DIST seam, and the red assert lines are compared with the addressees named here BEFORE the run
// (EXP-0059): mutant M → exactly these asserts go red, and only they. A mutant whose anchor does not match EXACTLY ONCE
// is a refusal, never a green (origin bug 122: a needle that silently did not apply proves nothing).
// Born in the scratchpad of the epic's subagent (session 66) as cb-mutants.mjs; brought into the repository by the
// integrator so the proof outlives the session (EXP-0016).
// Run it after touching the budget block of framework/installer/KAIF-CORE.mjs or s16:   node tools/sandbox/probes/budget-mutants.mjs
// Needs a FRESH dist (rebuild first); runs the suite once per mutant (six today) — run it ALONE, not beside the polygon (origin bug 109).
// Raises no window and no sound. `--list` prints the red asserts of every mutant without judging (to re-name addressees
// after the suite changes).
// [TESTED: 2026-09-18 12:43 +03:00 · run on the origin after the merge of the epic's branch, alone: `--list` named the
//  addressees (3 · 5 · 2 · 4 · 2 — the same counts the subagent reported at 11:57), then the judging run — five mutants red
//  exactly on their 16 named asserts and only on them, no invisible mutant; report testcases/reports/2026-09-18_canon-budget.md,
//  the integrator's addendum.
//  2026-09-18 14:46 +03:00 · SIX mutants after the session judge's finding F2 (M6 is the judge's own mutant — the shipped
//  template grown past its budget — which the suite had passed 44/44): red 3 · 5 · 2 · 4 · 2 · 1 on 17 named asserts; the
//  first run of M6 (14:45) was an honest BAD — this runner cuts a red line at its first " — ", and the new assert's name
//  lost its addressee there; the name was rewritten without the dash — the same report, the post-judge addendum, row С3]
import { readFileSync, writeFileSync, cpSync, rmSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SUITE = join(REPO, 'tools', 'sandbox', 's16-doc-budgets.mjs');
const LIST_ONLY = process.argv.includes('--list');
const FENCE = '``````';                                   // the bundle wraps every embedded file in a six-backtick fence

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
  // M6 — the mutant the session-67 judge ran (J2) and the suite could NOT see: the SHIPPED template grows past its
  // budget. Arrived lines are no longer counted for the project, so nothing on a fresh deployment warned any more —
  // the payload-growth guard was lost in the move to own lines, and the payload stands exactly on the limit.
  { name: 'M6 the shipped AGENT_GUIDE template grows past its budget (+63 lines in the bundle copy; judge finding F2)',
    file: 'KAIF-CORE-BUNDLE.md',
    fn: (bundle) => {
      const head = bundle.indexOf('\n> **FILE: `AGENT_GUIDE.md`**');
      const open = head < 0 ? -1 : bundle.indexOf(FENCE, head);
      const close = open < 0 ? -1 : bundle.indexOf('\n' + FENCE, open + FENCE.length);
      if (close < 0) return bundle;                                  // block not found → "did NOT apply"
      const extra = Array.from({ length: 63 }, (_, i) => `inflated shipped line ${i + 1} — mutant`).join('\n');
      return bundle.slice(0, close) + '\n' + extra + bundle.slice(close);
    },
    expect: ['в ПОСТАВЛЕННОМ виде внутри своего бюджета'] },
];

const root = mkdtempSync(join(tmpdir(), 'kaif-budget-mutants-'));
let bad = 0;
for (const m of MUTANTS) {
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(REPO, 'dist'), dist, { recursive: true });
  const p = join(dist, m.file || 'KAIF-CORE.mjs');                 // the core by default; M6 mutates the bundle
  const src = readFileSync(p, 'utf8');
  let next;
  if (m.fn) {
    next = m.fn(src);
    if (next === src) { bad++; console.log(`BAD ${m.name}\n    the mutation function changed nothing — the mutant did NOT apply; re-anchor it to the current bundle`); continue; }
  } else {
    const hits = src.split(m.from).length - 1;
    if (hits !== 1) { bad++; console.log(`BAD ${m.name}\n    anchor matched ${hits} time(s) — the mutant did NOT apply; re-anchor it to the current core`); continue; }
    next = src.replace(m.from, m.to);
  }
  writeFileSync(p, next, 'utf8');
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
