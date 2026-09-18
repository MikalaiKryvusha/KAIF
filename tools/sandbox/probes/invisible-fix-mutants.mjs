// tools/sandbox/probes/invisible-fix-mutants.mjs — a PROBE (not a polygon suite): addressed mutants of the `--fix` mode of
// tools/sandbox/probes/invisible-characters.mjs, judged by its proof (invisible-fix-proof.mjs). The addressees of every
// mutant are NAMED BEFORE THE RUN (EXP-0059); a mutation that does not apply is a REFUSAL of this script, not a green.
// Each mutant is applied to a COPY of the four files the proof needs, laid out like the repo in a unique OS-temp root.
//   M1 "no restore"       the line that writes the original bytes back is removed
//                         → case 2 "the original bytes are back"
//   M2 "no parse check"   the `node --check` verdict is forced true
//                         → case 2 "exit 1" · "the tool names the refusal" · "the original bytes are back"
//   M3 "documents too"    the .mjs/.js gate lets a document through
//                         → case 3 "a document is refused" ONLY: the document still comes back untouched, because the
//                           parse check refuses a Markdown file and restores it — two independent nets hold that line
//   M4 "both nets down"   M2 + M3 together
//                         → the three of M2, both of case 3 (now the document IS rewritten)
// First run, 2026-09-18 14:15 +03:00: M3 had been named with BOTH case-3 lines and reddened one — the second net was not
// in the prediction. The table above is the corrected one; M4 was added to prove that "the document is untouched" can fail.
// Run:   node tools/sandbox/probes/invisible-fix-mutants.mjs        (exit 0 = every mutant reddened exactly its addressees)
// [TESTED: 2026-09-18 14:16 +03:00 · run on the origin: four mutants red exactly on their named addressees (1 · 3 · 1 · 5),
//  exit 0; the first edition of the table (three mutants, 14:15) mis-named M3 and said so — report
//  testcases/reports/2026-09-18_invisible-characters.md, runs 7 and 8]
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const FILES = ['tools/lib/invisible-chars.mjs', 'tools/sandbox/probes/invisible-characters.mjs',
  'tools/sandbox/probes/invisible-fix-proof.mjs', 'framework/tools/contour/core.mjs'];
const NO_RESTORE = { from: "if (!parses) writeFileSync(p, before, 'utf8');", to: '/* mutant: no restore */' };
const NO_PARSE_CHECK = { from: "const parses = !replaced || spawnSync(process.execPath, ['--check', p], { windowsHide: true }).status === 0;", to: 'const parses = true;' };
const DOCUMENTS_TOO = { from: 'if (!/' + String.fromCharCode(92) + '.(mjs|js)$/i.test(f)) {', to: 'if (false) {' };
const CASE2 = ['case 2: exit 1', 'case 2: the tool names the refusal', 'case 2: the original bytes are back'];
const MUTANTS = [
  { id: 'M1 no restore', edits: [NO_RESTORE], addressees: ['case 2: the original bytes are back'] },
  { id: 'M2 no parse check', edits: [NO_PARSE_CHECK], addressees: CASE2 },
  { id: 'M3 documents too', edits: [DOCUMENTS_TOO], addressees: ['case 3: a document is refused'] },
  { id: 'M4 both nets down', edits: [NO_PARSE_CHECK, DOCUMENTS_TOO], addressees: [...CASE2, 'case 3: a document is refused', 'case 3: the document is untouched'] },
];

let bad = 0;
for (const m of MUTANTS) {
  const root = mkdtempSync(join(tmpdir(), 'kaif-invisible-fix-mutant-'));
  for (const f of FILES) { mkdirSync(dirname(join(root, f)), { recursive: true }); copyFileSync(join(REPO, f), join(root, f)); }
  const tool = join(root, 'tools/sandbox/probes/invisible-characters.mjs');
  let src = readFileSync(tool, 'utf8');
  const missing = m.edits.filter((e) => src.split(e.from).length !== 2);
  if (missing.length) { console.log(`REFUSED ${m.id}: ${missing.length} mutation anchor(s) do not occur exactly once`); bad++; continue; }
  for (const e of m.edits) src = src.replace(e.from, e.to);
  writeFileSync(tool, src, 'utf8');
  const r = spawnSync(process.execPath, [join(root, 'tools/sandbox/probes/invisible-fix-proof.mjs')], { encoding: 'utf8', windowsHide: true });
  const failed = r.stdout.split(/\r?\n/).filter((l) => l.startsWith('FAIL ')).map((l) => l.slice(5));
  const hit = m.addressees.filter((a) => failed.includes(a));
  const stray = failed.filter((f) => !m.addressees.includes(f));
  const good = r.status === 1 && hit.length === m.addressees.length && stray.length === 0;
  console.log(`${good ? 'OK  ' : 'FAIL'} ${m.id}: exit ${r.status} · addressees red ${hit.length}/${m.addressees.length}` +
    (stray.length ? ` · ALSO red, not named beforehand: ${stray.join(' | ')}` : ''));
  if (!good) { bad++; console.log(r.stdout); } else { try { rmSync(root, { recursive: true, force: true }); } catch { /* litter in temp is harmless */ } }
}
console.log(bad ? `\nFAILED: ${bad}` : '\nall four mutants reddened exactly their addressees');
process.exit(bad ? 1 : 0);
