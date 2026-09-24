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
//  lost its addressee there; the name was rewritten without the dash — the same report, the post-judge addendum, row С3.
//  2026-09-25 00:58 +03:00 · TWELVE mutants after epic CK 2.8, step CK5.2 (the ratchet of the door): M2 re-anchored to the new door
//  line, M6 grown to +130 lines (the template now stands at its build ceiling 1080, +63 no longer crossed the budget), M7–M12 one per
//  predicate of budgetRatchet() and its write; `--list` named the addressees, the judging run — all twelve red exactly on them, no
//  invisible mutant; report testcases/reports/2026-09-25_ck52-budget-ratchet.md.
//  2026-09-25 01:12 +03:00 · FIFTEEN mutants after step CK5.3 (the owner's declared archive): M13–M15 added, M2/M8/M12 gained the
//  archive gate asserts they now also redden; judging run — all fifteen red exactly on their named addressees; report
//  testcases/reports/2026-09-25_ck53-owner-archive.md]
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
    expect: ['приехавший канон (',
             'названное число собственных строк МЕНЬШЕ',
             'строка говорит ВСЛУХ, сколько строк приехало',
             'ВЫЧИЩЕН из базы'] },
  { name: 'M2 the door never closes (--gate-budgets always exits 0)',
    from: "  if (has('--gate-budgets')) {",
    to: "  if (false && has('--gate-budgets')) {",
    expect: ['зелёный прогон двери записал базу',
             '`check --gate-budgets` на превышении',
             'гейт печатает строку',
             'та же строка у STATUS',
             'итог гейта называет ЧИСЛО документов',
             'гейт называет верный ход',
             'первое закрытие без базы ЗАПИСЫВАЕТ',
             'база хранит ровно те',
             'СТОЯНИЕ выше бюджета',
             'УБЫВАНИЕ проходит',
             'база затягивается',
             'РОСТ останавливает',
             'выросший документ базу НЕ поднимает',
             'НОВЫЙ выход за бюджет',
             'новое превышение в базу не записывается',
             'ВЫЧИЩЕН из базы',
             'первое закрытие НОВОЙ версии',
             'нечитаемая база',
             'без дайджеста стоп остаётся'] },
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
             'английское тело с тремя кириллическими словами',
             // K14 (CK5.8): the English-count line is judged NEXT TO the mix line, so a run with no mix line reddens it too
             'жива и отдельна от строки о смеси'] },
  { name: 'M5 the owner-seeded branch is gone — one shape, one (wrong) sentence',
    from: "basis: OWNER_SEEDED.includes(doc) ? 'owner-seeded' : 'translated' };",
    to: "basis: 'translated' };",
    expect: ['назван СВОИМ по построению',
             'owner-seeded документ НЕ называется переводом'] },
  // M6 — the mutant the session-67 judge ran (J2) and the suite could NOT see: the SHIPPED template grows past its
  // budget. Arrived lines are no longer counted for the project, so nothing on a fresh deployment warned any more —
  // the payload-growth guard was lost in the move to own lines, and the payload stands exactly on the limit.
  // Since 2.8 the template stands at its build CEILING (1080 of 1200, guard 5j of tools/check-framework.mjs), so +63 no longer
  // crosses the budget; +130 does — the suite's payload-growth guard is the second line behind the build's ceiling.
  { name: 'M6 the shipped AGENT_GUIDE template grows past its budget (+130 lines in the bundle copy; judge finding F2)',
    file: 'KAIF-CORE-BUNDLE.md',
    fn: (bundle) => {
      const head = bundle.indexOf('\n> **FILE: `AGENT_GUIDE.md`**');
      const open = head < 0 ? -1 : bundle.indexOf(FENCE, head);
      const close = open < 0 ? -1 : bundle.indexOf('\n' + FENCE, open + FENCE.length);
      if (close < 0) return bundle;                                  // block not found → "did NOT apply"
      const extra = Array.from({ length: 130 }, (_, i) => `inflated shipped line ${i + 1} — mutant`).join('\n');
      return bundle.slice(0, close) + '\n' + extra + bundle.slice(close);
    },
    expect: ['в ПОСТАВЛЕННОМ виде внутри своего бюджета'] },
  // M7–M11 — the RATCHET of the door (2.8, epic CK, step CK5.2): one mutant per predicate of budgetRatchet() and of its write.
  { name: 'M7 a standstill above budget passes (industry ratchet, not fork (e))',
    from: '    if (o.own < before) verdicts.push(',
    to: '    if (o.own <= before) verdicts.push(',
    expect: ['СТОЯНИЕ выше бюджета'] },
  { name: 'M8 a new overflow is free (no base line → pass)',
    from: "    if (before === undefined) { verdicts.push({ ...o, pass: false,",
    to: "    if (before === undefined) { verdicts.push({ ...o, pass: true,",
    expect: ['`check --gate-budgets` на превышении',
             'гейт печатает строку',
             'та же строка у STATUS',
             'итог гейта называет ЧИСЛО документов',
             'гейт называет верный ход',
             'НОВЫЙ выход за бюджет',
             'без дайджеста стоп остаётся'] },
  { name: 'M9 a version change never re-records the debt (an update\'s growth is punished)',
    from: '  const fresh = !base || base.version !== version;',
    to: '  const fresh = !base;',
    expect: ['первое закрытие НОВОЙ версии'] },
  { name: 'M12 the first gate of the ratchet stops instead of recording the debt',
    from: "    if (fresh) { docs[o.doc] = o.own; verdicts.push({ ...o, pass: true,",
    to: "    if (fresh) { docs[o.doc] = o.own; verdicts.push({ ...o, pass: false,",
    expect: ['первое закрытие без базы ЗАПИСЫВАЕТ',
             'первое закрытие НОВОЙ версии',
             'объявленный архив с дайджестом проходит дверь'] },
  { name: 'M10 the base never tightens after a shrink',
    from: '    docs[o.doc] = Math.min(before, o.own);',
    to: '    docs[o.doc] = before;',
    expect: ['база затягивается',
             'выросший документ базу НЕ поднимает'] },
  // M13–M15 — the owner's declared ARCHIVE (2.8, epic CK, step CK5.3; origin issue #84 p. 1).
  { name: 'M13 a digest need not name its archive',
    from: "readFileSync(arch.digest, 'utf8').includes(doc);",
    to: "true;",
    expect: ['дайджест, который не называет свой архив'] },
  { name: 'M14 the archive declaration is ignored (the archive is judged as a document)',
    from: '    const arch = archiveOf(doc);',
    to: '    const arch = null;',
    expect: ['объявленный архив с дайджестом проходит дверь',
             'объявление без слова владельца называется вслух',
             'дайджест, который не называет свой архив',
             'без дайджеста стоп остаётся'] },
  { name: 'M15 the marker schema accepts an archive that is not a core document',
    from: '        if (!(k in DOC_BUDGETS)) schemaIssues.push(',
    to: '        if (false) schemaIssues.push(',
    expect: ['архив, названный не документом ядра'] },
  // M16 — the measure of a file translated wholesale (2.8, epic CK, step CK5.4; origin issue #85 p. 2).
  { name: 'M16 the translated-wholesale warning no longer names the room the template left',
    from: "typeof templateLines[doc] === 'number' ?",
    to: "false ?",
    expect: ['переведённый целиком: строка называет длину шаблона'] },
  // M17 — the move-out address names its FILE and the command that creates it (2.8, epic CK, step CK5.5).
  { name: 'M17 the move-out address names no file again (the 2.7 wording)',
    from: "const MOVE_OUT_ADDRESS = 'HOUSE_RULES.md (no file yet: cp .kaif/_house-rules-template.md HOUSE_RULES.md) for local rules, routes and tools · the chronicle PROJECT_HISTORY.md · researches/';",
    to: "const MOVE_OUT_ADDRESS = 'the chronicle PROJECT_HISTORY.md · researches/ · a house-rules file';",
    expect: ['адрес выноса для документа НЕ-STATUS', 'гейт печатает строку'] },
  // M19/M20 — the entry cost of a chat in tokens (2.8, epic CK, step CK5.9 (a); origin issue #99): a wrong window changes the
  // share only; a line that never prints reddens both cases.
  { name: 'M19 the entry-cost share is taken of a 200k window while the line says 1M',
    from: 'MODEL_WINDOW_TOKENS = 1000000;',
    to: 'MODEL_WINDOW_TOKENS = 200000;',
    expect: ['`check` печатает строку стоимости входа'] },
  { name: 'M20 the entry-cost line never prints',
    from: 'if (entryCore.length) {',
    to: 'if (false) {',
    expect: ['`check` печатает строку стоимости входа',
             'строка называет «+ HOUSE_RULES.md», и число выросло на их вес'] },
  // M18 — the English-skills count speaks only with `i18n: translated` (2.8, epic CK, step CK5.8, K14).
  { name: 'M18 the English-skills line prints on every deployment again (the i18n flag ignored)',
    from: 'if (english && translatedWrapper) console.error(',
    to: 'if (english) console.error(',
    expect: ['у развёртывания без i18n строки'] },
  { name: 'M11 a gate with no debt writes no base file (so the next overflow is "first")',
    from: "    if (!existsSync(BUDGET_BASELINE) || readFileSync(BUDGET_BASELINE, 'utf8') !== body) writeFileSync(BUDGET_BASELINE, body);",
    to: "    if (Object.keys(next.docs).length && (!existsSync(BUDGET_BASELINE) || readFileSync(BUDGET_BASELINE, 'utf8') !== body)) writeFileSync(BUDGET_BASELINE, body);",
    expect: ['зелёный прогон двери записал базу',
             '`check --gate-budgets` на превышении',
             'гейт печатает строку',
             'та же строка у STATUS',
             'итог гейта называет ЧИСЛО документов',
             'гейт называет верный ход'] },
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
