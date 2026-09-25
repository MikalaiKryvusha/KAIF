// tools/sandbox/probes/hooks-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of the four axes that
// suite s14 gained on 2026-09-18 (origin bugs 118 #1 · 119 #3 · 121). Each mutant is applied to a COPY of dist/ in the OS
// temp dir (never to the tree — EXP-0077), the suite runs against the copy through the KAIF_DIST seam, and the red assert
// lines are compared with addressees NAMED BEFORE the run (EXP-0059): mutant M → exactly these asserts go red, and only they.
// A mutant that DID NOT APPLY is a refusal, never a green: that rule is what caught origin bug 122 — the needle was the
// ASCII escape of a byte-order mark, while the bundle carried the REAL invisible character an edit tool had decoded.
// Run it after touching framework/hooks/* or s14:   node tools/sandbox/probes/hooks-mutants.mjs
// Raises no window and no sound (s14 starts hidden shells with a closed stdin); needs a FRESH dist (rebuild first);
// runs the suite once per mutant (ten today) — run it ALONE, not beside the polygon (origin bug 109).
// [TESTED: 2026-09-25 17:43 +03:00 · TEN mutants after OW2 (M8 the imperative before the word dropped · M9 the heading exclusion dropped · M10 the stop
//  branch dropped): «10 mutants red exactly on their named addressees, and only on them»; report testcases/reports/2026-09-25_ow2-owner-word-mid-turn.md]
// [TESTED: 2026-09-18 12:12 +03:00 · run on the origin after the fix — four mutants, each red exactly on its named
//  addressees (2 · 1 · 1 · 1) and green elsewhere (85/86 of 87); the first run at 12:09 refused M4 with "mutation did not
//  apply" — report testcases/reports/2026-09-18_hooks-optin-smoke.md, runs 7 and 9.
//  2026-09-18 14:44 +03:00 · FIVE mutants after the session judge's finding F1 (M5 is the judge's own mutant, which the
//  suite had passed 87/87): red 2 · 1 · 1 · 1 · 1, green 86/87 of 88 — the same report, run 16]
import { readFileSync, writeFileSync, cpSync, rmSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const FENCE = '``````';                                   // the bundle wraps every embedded file in a six-backtick fence
const BOM_ESCAPE = String.fromCharCode(92) + 'uFEFF';     // built from code points: no tool layer can decode it on the way here

/** Replace inside ONE embedded FILE block of the bundle; throws when the block or the needle is not there. */
function mutateBlock(bundle, dest, fn) {
  const head = bundle.indexOf('> **FILE: `' + dest + '`**');
  if (head < 0) throw new Error('block not found: ' + dest);
  const open = bundle.indexOf(FENCE, head);
  const close = bundle.indexOf('\n' + FENCE, open + FENCE.length);
  const body = bundle.slice(open, close);
  const next = fn(body);
  if (next === body) throw new Error('mutation did not apply: ' + dest);
  return bundle.slice(0, open) + next + bundle.slice(close);
}
const swap = (s, a, b) => s.split(a).join('@@SWAP@@').split(b).join(a).split('@@SWAP@@').join(b);

const MUTANTS = [
  { name: 'M1 fragment: prompt-resume-word <-> stop-status-guard swapped (bug 118 #1)',
    dest: '.kaif/hooks/settings-fragment.json',
    fn: (b) => swap(b, 'prompt-resume-word.mjs', 'stop-status-guard.mjs'),
    expect: ['s14 ось пар settings-fragment.json:', 's14 ось пар: мутация фрагмента'] },
  { name: 'M2 timer: a malformed marker falls back to NOW instead of the file mtime (bug 121 #3)',
    dest: '.kaif/hooks/prompt-refresh-timer.mjs',
    fn: (b) => b.replace('if (Number.isNaN(at)) at = statSync(markerPath).mtimeMs;', 'if (Number.isNaN(at)) { statSync(markerPath); at = Date.now(); }'),
    expect: ['s14 таймер: битый JSON при СТАРОМ mtime'] },
  { name: 'M3 README: the POSIX redirect offered to the PowerShell reader again (bug 121 #1)',
    dest: '.kaif/hooks/README.md',
    fn: (b) => b.replace("'' | node .kaif/hooks/prompt-refresh-timer.mjs", 'node .kaif/hooks/prompt-refresh-timer.mjs < /dev/null'),
    expect: ['s14 проба README [powershell] строка 1:'] },
  { name: 'M4 resume-word: the byte-order-mark strip removed from ONE hook (bug 119 #3)',
    dest: '.kaif/hooks/prompt-resume-word.mjs',
    fn: (b) => b.replace("readFileSync(0, 'utf8').replace(/^" + BOM_ESCAPE + "/, '')", "readFileSync(0, 'utf8')"),
    expect: ['s14 BOM resume-word:'] },
  // M5 — the mutant the session-67 judge ran (J1) and the suite could NOT see: with a closed stdin the hook gets EOF at
  // once, so a line that lost its empty stdin still answers in the hidden run. Only the static assert reads the TEXT.
  { name: 'M5 README: the empty stdin dropped from the first line of BOTH blocks (bug 121 #1, judge finding F1)',
    dest: '.kaif/hooks/README.md',
    fn: (b) => {
      const sh = 'node .kaif/hooks/prompt-refresh-timer.mjs < /dev/null', ps = "'' | node .kaif/hooks/prompt-refresh-timer.mjs";
      if (!b.includes(sh) || !b.includes(ps)) return b;          // one needle missing → "mutation did not apply"
      return b.replace(sh, 'node .kaif/hooks/prompt-refresh-timer.mjs').replace(ps, 'node .kaif/hooks/prompt-refresh-timer.mjs');
    },
    expect: ['s14 проба README: каждая строка каждого блока даёт хуку stdin'] },
  // M6 and M7 — the two bypasses the delta judge of f4915af found in the FIRST edition of that static assert: a line that
  // looks like it feeds stdin and does not. The assert is now tied to the hook call itself; these two keep it so.
  { name: 'M6 README: the feed is COMMENTED OUT in the sh block (delta judge, finding 2)',
    dest: '.kaif/hooks/README.md',
    fn: (b) => b.replace('node .kaif/hooks/prompt-refresh-timer.mjs < /dev/null', 'node .kaif/hooks/prompt-refresh-timer.mjs # < /dev/null'),
    expect: ['s14 проба README: каждая строка каждого блока даёт хуку stdin'] },
  { name: 'M7 README: the hook stands on the LEFT of the pipe in the powershell block (delta judge, finding 2)',
    dest: '.kaif/hooks/README.md',
    fn: (b) => b.replace("'' | node .kaif/hooks/prompt-refresh-timer.mjs", 'node .kaif/hooks/prompt-refresh-timer.mjs | node -e "process.stdin.pipe(process.stdout)"'),
    expect: ['s14 проба README: каждая строка каждого блока даёт хуку stdin'] },
  // 2.8, epic OW, OW2 (criterion 5 of plans/117): the three new predicates of the leading-word hook.
  { name: 'M8 resume-word: the imperative before the word dropped ("execute resume" silent again — recon Q-R7)',
    dest: '.kaif/hooks/prompt-resume-word.mjs',
    fn: (b) => b.replace('(?:(?:run|do|execute|start|\\u0432\\u044b\\u043f\\u043e\\u043b\\u043d\\u0438|\\u0437\\u0430\\u043f\\u0443\\u0441\\u0442\\u0438|\\u0441\\u0434\\u0435\\u043b\\u0430\\u0439|\\u043d\\u0430\\u0447\\u043d\\u0438)\\s+)?', ''),
    expect: ['s14 resume-word: «выполни resume»'] },
  { name: 'M9 resume-word: the heading exclusion dropped (the Russian noun with a colon fires again — court D-F4)',
    dest: '.kaif/hooks/prompt-resume-word.mjs',
    fn: (b) => b.replace('(?!\\s*:)', ''),
    expect: ['s14 resume-word: «Резюме: …»'] },
  { name: 'M10 stop-word: the stop branch dropped (a leading stop reaches the model with no order)',
    dest: '.kaif/hooks/prompt-resume-word.mjs',
    fn: (b) => b.replace('if (prompt !== null && LEADING_STOP.test(prompt)) {', 'if (false) {'),
    expect: ['s14 stop-word: «стоп» первым словом', 's14 stop-word: «СТОП!»', 's14 stop-word: «stop, …»'] },
];

const root = mkdtempSync(join(tmpdir(), 'kaif-hooks-mutants-'));
let bad = 0;
for (const m of MUTANTS) {
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(REPO, 'dist'), dist, { recursive: true });
  const p = join(dist, 'KAIF-CORE-BUNDLE.md');
  writeFileSync(p, mutateBlock(readFileSync(p, 'utf8'), m.dest, m.fn));
  let out = '';
  try { out = execFileSync(process.execPath, [join(REPO, 'tools', 'sandbox', 's14-refresh-hooks.mjs')], { env: { ...process.env, KAIF_DIST: dist }, stdio: 'pipe' }).toString(); }
  catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); }
  const lines = out.split(/\r?\n/);
  const red = lines.filter((l) => l.startsWith('❌ s14'));
  const green = lines.filter((l) => l.startsWith('✅ s14')).length;
  const verdict = red.length === m.expect.length && m.expect.every((e) => red.some((r) => r.includes(e)));
  if (!verdict) bad++;
  console.log(`${verdict ? 'OK ' : 'BAD'} ${m.name}\n    red ${red.length} (named before the run: ${m.expect.length}) · green ${green}`);
  for (const r of red) console.log('      ' + r.slice(0, 170));
}
rmSync(root, { recursive: true, force: true });
console.log(bad ? `\n❌ mutant proof FAILED: ${bad} of ${MUTANTS.length}` : `\n✅ ${MUTANTS.length} mutants red exactly on their named addressees, and only on them`);
process.exit(bad ? 1 : 0);
