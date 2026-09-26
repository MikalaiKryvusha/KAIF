// tools/sandbox/probes/tb-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of the tester's-report genre of
// kaif-testrun-lint (2.8, epic TB, plans/124 TB1–TB2; criteria 27–28 of plans/117; origin issue #105). Each mutant breaks ONE rule of
// a COPY of framework/tools/kaif-testrun-lint.mjs; the copy's own selftest must go red exactly on the named case(s), and the
// s25-shaped report (the same fixture the polygon walks on the deployed copy) must change its answer:
//   control — the module as it is → selftest OK; every fixture answers as s25 expects;
//   M1 the section is not checked (missing-section never fires)        → the report without «Expected result» passes;
//   M2 the hunt minimum lowered to 2                                    → «not reproduced» with two variants passes;
//   M3 the hunt table's header row counted as a variant                 → «not reproduced» with two variants passes;
//   M4 the lines rule of the first edition (the separator «·» counted) → the unfilled template C passes its lines;
//   M5 the steps-not-a-path rule off                                    → «I do not remember the exact steps» passes;
//   M6 «not reproduced» never read                                      → «not reproduced» without any hunt passes;
//   M7 the hunt's own rows read as the verdict                          → REPRODUCED after two tries is judged a short hunt.
// Addressees are named before the run; an anchor that does not match exactly once is a refusal, never a green.
// usage: node tools/sandbox/probes/tb-mutants.mjs      (no window, no sound; writes only under the OS temp directory)
// [TESTED: 2026-09-26 03:58:13 +03:00 · control green, 7 of 7 mutants red on their addressees; the first run (03:57:49) was BAD by MY
//  mutant M4 (single backslashes — the copy's regex threw), fixed before counting; report testcases/reports/2026-09-26_tb1-tester-report-and-hunt.md]
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = readFileSync(join(REPO, 'framework', 'tools', 'kaif-testrun-lint.mjs'), 'utf8').replace(/\r\n/g, '\n');
const SKILL = readFileSync(join(REPO, 'framework', 'skills', 'report-bug', 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');
const TPL_C = (/### Template C[\s\S]*?```markdown\n([\s\S]*?)```/.exec(SKILL) || [])[1] || '';
const root = mkdtempSync(join(tmpdir(), 'kaif-tb-mutants-'));
let bad = 0;

// The fixtures — the shapes s25 walks on the deployed copy, built from the SAME template C.
const FILL = {
  'Description': 'In the cart, a second tap on «Pay» does nothing once the first payment was cancelled.',
  'Steps to reproduce': '1. Open the cart with one item.\n2. Tap «Pay», then cancel on the payment screen.\n3. Tap «Pay» again.',
  'Expected result': 'The payment screen opens again (requirement CART-12).',
  'Actual result': 'Nothing happens; the console shows `TypeError: order is null`.',
};
const fillC = (over = {}) => {
  const fill = { ...FILL, ...over };
  let out = TPL_C.replace(/^# <[^\n]*$/m, '# The Pay button does not answer a second tap')
    .replace(/^\*\*Build:\*\*[^\n]*$/m, '**Build:** 2.8.1 (a1b2c3d) · **Environment:** Android 14, stage, a fresh account · **Evidence:** `pay.mp4`');
  for (const [head, body] of Object.entries(fill)) {
    const re = new RegExp(`^## ${head}\\n[\\s\\S]*?(?=^## |(?![\\s\\S]))`, 'm');
    out = body === null ? out.replace(re, '') : out.replace(re, `## ${head}\n${body}\n\n`);
  }
  return out;
};
const HUNT = (rows) => `\n## Reproduction hunt\n\n| # | variant (axis: value) | outcome |\n|---|---|---|\n${rows.join('\n')}\n`;
const ROW = (i, out) => `| ${i} | timing and races: variant ${i} | ${out} |`;
const withStatus = (s) => s.replace(/^(\*\*Build:\*\*[^\n]*)$/m, '$1\n**Status:** not reproduced after the variants below');
const FIX = {
  filled: [fillC(), 0],
  unfilled: [TPL_C, 1],
  'no-expected': [fillC({ 'Expected result': null }), 1],
  'no-steps': [fillC({ 'Steps to reproduce': 'I do not remember the exact steps, but it happened after a cancel.' }), 1],
  'hunt-2': [withStatus(fillC()) + HUNT([ROW(1, 'not reproduced'), ROW(2, 'not reproduced')]), 1],
  'hunt-3': [withStatus(fillC()) + HUNT([1, 2, 3].map((i) => ROW(i, 'not reproduced'))), 0],
  'hunt-none': [withStatus(fillC()), 1],
  'found-on-2nd': [fillC() + HUNT([ROW(1, 'not reproduced'), ROW(2, 'reproduced')]), 0],
};
const run = (bin, args) => {
  try { return { code: 0, out: execFileSync(process.execPath, [bin, ...args], { cwd: root, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: `${e.stdout || ''}${e.stderr || ''}` }; }
};
for (const [name, [text]] of Object.entries(FIX)) writeFileSync(join(root, `${name}.md`), text);

// mutant = { name, from, to, red: [selftest cases that must turn ✗], flips: [fixtures whose answer must change] }
const MUTANTS = [
  { name: 'M1 missing-section never fires', from: "{ id: 'missing-section', test: (b) => b.missing.length > 0,", to: "{ id: 'missing-section', test: (b) => false,",
    red: ['en bug: mutation missing-section', 'ru bug: mutation missing-section'], flips: ['no-expected'] },
  { name: 'M2 the hunt minimum lowered to 2', from: 'export const HUNT_MIN = 3;', to: 'export const HUNT_MIN = 2;',
    red: ['en bug: mutation hunt-too-short', 'ru bug: mutation hunt-too-short'], flips: ['hunt-2'] },
  { name: 'M3 the hunt header row counted', from: "const huntText = stripScaffold(fields.hunt || '');", to: "const huntText = fields.hunt || '';",
    red: ['en bug: mutation hunt-too-short', 'ru bug: mutation hunt-too-short'], flips: ['hunt-2'] },
  { name: 'M4 the first edition of the lines rule', from: String.raw`const missingLines = kw.lines.filter((label) => !/[\p{L}\p{N}]/u.test(lineValue(label) || ''));`,
    to: String.raw`const missingLines = kw.lines.filter((label) => !new RegExp(` + '`' + String.raw`\\*\\*` + '${label}' + String.raw`:?\\*\\*:?\\s*[^\\s*<]` + '`' + ", 'iu').test(bare));",
    red: ['en bug: the lines row with placeholders only', 'ru bug: the lines row with placeholders only'], flips: [] , unfilledKeepsSections: true },
  { name: 'M5 steps-not-a-path off', from: "test: (b) => b.has('steps') && !NUMBERED_ITEM.test(b.text('steps')),", to: 'test: (b) => false,',
    red: ['en bug: mutation steps-not-a-path', 'ru bug: mutation steps-not-a-path'], flips: ['no-steps'] },
  { name: 'M6 «not reproduced» never read', from: 'const notRepro = Object.values(BUG_KEYWORDS).some(', to: 'const notRepro = false && Object.values(BUG_KEYWORDS).some(',
    red: ['en bug: mutation hunt-too-short', 'ru bug: mutation hunt-too-short'], flips: ['hunt-2', 'hunt-none'] },
  { name: "M7 the hunt's own rows read as the verdict", from: "if (cur !== 'hunt' && !fence) outside += l + '\\n';", to: "if (!fence) outside += l + '\\n';",
    red: ['en bug: REPRODUCED after two tries', 'ru bug: REPRODUCED after two tries'], flips: ['found-on-2nd'] },
];

const judge = (name, src, m) => {
  const bin = join(root, `${name.split(' ')[0]}.mjs`);
  writeFileSync(bin, src);
  const st = run(bin, ['selftest']);
  const red = st.out.split('\n').filter((l) => /^\s*✗ /.test(l)).map((l) => l.replace(/^\s*✗ /, ''));
  const answers = Object.fromEntries(Object.keys(FIX).map((f) => [f, run(bin, ['bug', `${f}.md`])]));
  const flipped = Object.keys(FIX).filter((f) => answers[f].code !== FIX[f][1]);
  let ok;
  if (!m) ok = st.code === 0 && red.length === 0 && flipped.length === 0;
  else {
    const redOk = st.code === 1 && m.red.every((a) => red.some((l) => l.startsWith(a))) && red.every((l) => m.red.some((a) => l.startsWith(a)));
    const flipOk = m.flips.every((f) => flipped.includes(f)) && flipped.every((f) => m.flips.includes(f));
    // M4: the unfilled template still fails on its empty sections (exit 1) — its lines verdict is the change, read from the output
    const linesOk = !m.unfilledKeepsSections || !/missing-line/.test(answers.unfilled.out);
    ok = redOk && flipOk && linesOk;
  }
  if (!ok) bad++;
  console.log(`${ok ? 'OK ' : 'BAD'} ${name} — selftest exit ${st.code}, red ${red.length}${flipped.length ? ` · answers changed: ${flipped.join(', ')}` : ''}`);
  for (const l of red.slice(0, 4)) console.log(`      ✗ ${l.slice(0, 150)}`);
};

try {
  if (!TPL_C) { bad++; console.log('BAD template C not found in framework/skills/report-bug/SKILL.md'); }
  judge('control the module as it is', SRC, null);
  for (const m of MUTANTS) {
    const n = SRC.split(m.from).length - 1;
    if (n !== 1) { bad++; console.log(`BAD ${m.name} — anchor matched ${n} time(s)`); continue; }
    judge(m.name, SRC.replace(m.from, () => m.to), m);
  }
} finally { rmSync(root, { recursive: true, force: true }); }
if (bad) { console.log(`\n❌ tb-mutants: ${bad} BAD`); process.exit(1); }
console.log(`\n✅ tb-mutants: control green, ${MUTANTS.length} mutants red exactly on their named addressees`);
