// tools/sandbox/probes/cp-contour-mutants.mjs — a PROBE (not a polygon suite): the selftest cases of epic CP (2.9 — the owner's question
// page: origin tickets #123 · #124 · #125 · #127 · #109 · #121 R3 · ideas/31 p. 28), proved on COPIES of framework/tools/contour/ in the OS
// temp dir (never the tree, EXP-0077). Each mutant puts back ONE piece of the v2.8 behaviour; its addressees are named before the run, and
// it must redden exactly them, and only them (EXP-0169). Written in session 77 (2026-10-03): the cloud session 76 proved these cases with
// mutants in its own scratchpad, which died with it — a proof that lives only in a scratchpad is no proof the next session can re-run (EXP-0016).
// Out of reach here: CP1 «a second press clears the choice» is a page-script behaviour under real pointer events — its proof is
// `node tools/verify-contour.mjs` block 5, not this selftest.
// usage: node tools/sandbox/probes/cp-contour-mutants.mjs
// [TESTED: 2026-10-03 09:29:16 · six mutants red exactly on their named cases (two named after an honest BAD: a predicate's case not
//  yet in the list); report testcases/reports/2026-10-03_pr132-merge-linux-removal-stop-hook.md]
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const SRC = 'framework/tools/contour';
const L = "' + L + '"; // the letter-class splice of the regex sources below, kept literal
const M = [
  ['#127: option forms back to v2.8 (only «- **A)**» is an option)', 'core.mjs',
    "export const OPTION_START_RE = new RegExp('^\\\\s*-\\\\s+\\\\*\\\\*([" + L + "])(?:\\\\)|[:.](?![\\\\p{L}\\\\d])|\\\\s*\\\\([^)]*\\\\)\\\\s*[:.)]?|(?=\\\\*\\\\*))', 'u');",
    "export const OPTION_START_RE = new RegExp('^\\\\s*-\\\\s+\\\\*\\\\*([" + L + "])\\\\)', 'u');",
    ['CP #127: 3 questions × 4 options', 'CP #127: a bold letter alone']],
  ['ideas/31 p. 28: a label that closes its own bold hides the recommended letter again (v2.8 rule)', 'core.mjs',
    "const RECOMMEND_RE = new RegExp('(?:' + PARSER.recommendLabels + ')(?:\\\\s|[:—–-]|\\\\*){0,6}([" + L + "])(?![\\\\p{L}\\\\d])', 'u');",
    "const RECOMMEND_RE = new RegExp('(?:' + PARSER.recommendLabels + ')\\\\s*[:—–-]?\\\\s*\\\\*{0,2}([" + L + "])(?![\\\\p{L}\\\\d])', 'u');",
    ['CP ideas/31 p. 28']],
  ['#109 / #121 R3: the explicit closing word ignored', 'core.mjs',
    "  if (STATUS_CLOSED_WORD_RE.test(line)) return waitsUnnegated(line) || STATUS_PENDING_RE.test(line) ? 'waiting' : 'closed';",
    "  if (false) return 'closed';",
    ['CP #109/#121 R3', 'CP F5 (light judge)', 'CP F5 (light re-judge)']],
  ['#124: the reference axis switched off (a question «see above» opens again)', 'core.mjs',
    '  if (!date || date < REFERENCES_SINCE) return [];', '  return [];',
    ['CP #124: «see above»', 'CP F3 (light judge)', 'CP N2 (light re-judge)']],
  ['#123: a paragraph rendered line by line again (bold across a wrap stays raw)', 'core.mjs',
    "  const flushPara = () => { if (para.length) { out.push('<p>' + inline(escapeHtml(para.join('\\n'))) + '</p>'); para = []; } };",
    "  const flushPara = () => { if (para.length) { for (const l of para) out.push('<p>' + inline(escapeHtml(l)) + '</p>'); para = []; } };",
    ['CP #123: paragraph, list item and quote', 'CP #123: a wrapped option label opens']],
  ['#125 CP6: the waiter judges a lock by its existence again (v2.8 rule — a killed server reads as live)', 'review.mjs',
    "    try { process.kill(held.pid, 0); return 'live'; } catch (e) { return e.code === 'EPERM' ? 'live' : 'dead'; }",
    "    return 'live';",
    ["waiter: the page's server killed, its lock kept", "waiter: a dead server's lock at the start"]],
];
let bad = 0;
for (const [name, file, from, to, exp] of M) {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-cp-mut-'));
  cpSync(SRC, dir, { recursive: true });
  const f = join(dir, file);
  const s = readFileSync(f, 'utf8');
  if (s.split(from).length !== 2) { console.log(`BAD ${name}: anchor did not apply (${s.split(from).length - 1}x)`); bad++; rmSync(dir, { recursive: true, force: true }); continue; }
  writeFileSync(f, s.replace(from, () => to));
  const r = spawnSync(process.execPath, [join(dir, 'review.mjs'), '--selftest'], { encoding: 'utf8', cwd: dir, timeout: 300000 });
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
