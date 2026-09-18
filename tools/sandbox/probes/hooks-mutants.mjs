// tools/sandbox/probes/hooks-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of the four axes that
// suite s14 gained on 2026-09-18 (origin bugs 118 #1 · 119 #3 · 121). Each mutant is applied to a COPY of dist/ in the OS
// temp dir (never to the tree — EXP-0077), the suite runs against the copy through the KAIF_DIST seam, and the red assert
// lines are compared with addressees NAMED BEFORE the run (EXP-0059): mutant M → exactly these asserts go red, and only they.
// A mutant that DID NOT APPLY is a refusal, never a green: that rule is what caught origin bug 122 — the needle was the
// ASCII escape of a byte-order mark, while the bundle carried the REAL invisible character an edit tool had decoded.
// Run it after touching framework/hooks/* or s14:   node tools/sandbox/probes/hooks-mutants.mjs
// Raises no window and no sound (s14 starts hidden shells with a closed stdin); needs a FRESH dist (rebuild first);
// runs the suite four times — run it ALONE, not beside the polygon (origin bug 109).
// [TESTED: 2026-09-18 12:12 +03:00 · run on the origin after the fix — four mutants, each red exactly on its named
//  addressees (2 · 1 · 1 · 1) and green elsewhere (85/86 of 87); the first run at 12:09 refused M4 with "mutation did not
//  apply" — report testcases/reports/2026-09-18_hooks-optin-smoke.md, runs 7 and 9]
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
