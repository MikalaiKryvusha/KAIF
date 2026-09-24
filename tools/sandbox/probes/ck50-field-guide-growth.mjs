// tools/sandbox/probes/ck50-field-guide-growth.mjs — a PROBE (not a polygon suite): the input of fork (b) of epic CK 2.8
// (plans/118, step CK5.0 — how much room a delivery template must leave under its size budget). For each field deployment
// named on the command line it reads AGENT_GUIDE.md and the deployed module cut in .kaif/deploy-manifest.json and prints
// what the budget gate counts as the project's OWN lines, with the same splitter and the same arrived-pair rule as
// ownLines() in framework/installer/KAIF-CORE.mjs: a disk module whose (sha256, signature) pair is in the deployed cut
// ARRIVED; every other module is own — an EDITED template module (its signature is in the cut or the template) or a
// LOCAL module the template never had. A file with no template signature left is TRANSLATED WHOLESALE: every line is own.
//
// The number that decides the fork is G — the growth of the edited template modules over their template length, the
// H1 title module and "Notes from the human" left out (the H1 is renamed in every deployment; since 2.8 the notes are
// rules with a provenance line and standing project rules go to the house-rules file). A wholesale-translated guide
// then counts   template × TRANSLATION_LINE_RATIO + G   own lines, and the probe prints that sum for each ceiling in
// CEILINGS against the budget: whether a deployment of the SAME shape, translated wholesale, would pass the gate.
//
// Run:   node tools/sandbox/probes/ck50-field-guide-growth.mjs <deployment dir> …   [--ref v2.7]
//        --ref — the git ref of the template the deployments were deployed from (default v2.7).
// Reads the deployments' files and git objects only; writes nothing; raises no window and no sound.
// [TESTED: 2026-09-25 00:20 +03:00 · run over the four 2.7 field deployments on this machine, exit 0, with and without
//  --ref; the printed module rows add up to own independently of the subtraction (858 + 257 = 1115, 489 + 31 = 520); a
//  clean-instance judge re-ran the core's own splitModules()/ownLines() on the same trees and got the same numbers; the first
//  run dropped the first directory when --ref was absent (filter excluded index 0) — fixed, re-run; report
//  testcases/reports/2026-09-25_ck50-field-guide-growth.md]
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// The budget of AGENT_GUIDE.md — source: DOC_BUDGETS in framework/installer/KAIF-CORE.mjs (read, not copied, below).
const CORE = 'framework/installer/KAIF-CORE.mjs';
// Lines of a translated copy per template line — source: researches/33 §4, the origin's seven pairs "EN template →
// Russian copy or language pack" measured ×0.99–1.04 in lines; the upper bound is taken.
const TRANSLATION_LINE_RATIO = 1.04;
// The candidate ceilings of fork (b), template ≤ budget × ceiling — source: plans/118 CK5.0 options A (25 % reserve) and B (10 %).
const CEILINGS = [0.8, 0.9];
const NOTES_SIGNATURE = '## Notes from the human';
// The modules whose PROJECT FACTS leave the guide in 2.8 (plans/118 CK5.0а): the tables of the harness, the tools and the
// environment dossier go to the house-rules skeleton, the push recipe goes to its routes and recipes, the goal paragraph and
// the architecture map are a pointer to GOAL.md and the two maps they duplicated. G' is G without their growth — what a
// deployment of the same shape keeps in the guide after the update's hand merge. Signature PREFIXES, as the template spells them.
const MOVED_IN_2_8 = ['### Environment dossier', '## Goal of the project', '## Architecture', '## Test harness',
  '## Push / GitHub authentication', '## Tools'];

const args = process.argv.slice(2);
const refAt = args.indexOf('--ref');
const REF = refAt >= 0 ? args[refAt + 1] : 'v2.7';
const dirs = args.filter((a, i) => refAt < 0 || (i !== refAt && i !== refAt + 1));
if (!dirs.length) { console.error('usage: node tools/sandbox/probes/ck50-field-guide-growth.mjs <deployment dir> … [--ref v2.7]'); process.exit(2); }

const budgetMatch = readFileSync(CORE, 'utf8').match(/'AGENT_GUIDE\.md':\s*\{\s*budget:\s*(\d+)/);
if (!budgetMatch) { console.error(`cannot read the AGENT_GUIDE.md budget from DOC_BUDGETS in ${CORE}`); process.exit(2); }
const BUDGET = Number(budgetMatch[1]);

const normEol = (s) => s.replace(/\r\n/g, '\n');
const sha = (s) => createHash('sha256').update(normEol(s)).digest('hex');
// the core's splitter, verbatim in behaviour: a module runs from one #..### heading outside a fence to the next
function splitModules(content) {
  const mods = []; let cur = { signature: '<preamble>', lines: [] }; let inFence = false;
  for (const line of content.split('\n')) {
    if (/^(`{3,}|~{3,})/.test(line.trim())) inFence = !inFence;
    if (!inFence && /^#{1,3} /.test(line)) { mods.push(cur); cur = { signature: line, lines: [] }; }
    cur.lines.push(line);
  }
  mods.push(cur);
  return mods.filter((m) => m.signature !== '<preamble>' || m.lines.join('').length > 0);
}
const bodyLines = (m, last) => m.lines.length - (last && m.lines[m.lines.length - 1] === '' ? 1 : 0);

const tplText = normEol(execFileSync('git', ['show', `${REF}:framework/AGENT_GUIDE.md`], { encoding: 'utf8' }));
const tpl = splitModules(tplText);
const tplLines = tplText.replace(/\n$/, '').split('\n').length;
const tplBySig = new Map(tpl.map((m, i) => [m.signature, bodyLines(m, i === tpl.length - 1)]));
console.log(`template ${REF}:framework/AGENT_GUIDE.md — ${tplLines} lines, ${tpl.length} modules; budget ${BUDGET} (DOC_BUDGETS)`);

for (const dir of dirs) {
  const raw = normEol(readFileSync(`${dir}/AGENT_GUIDE.md`, 'utf8'));
  const total = raw.replace(/\n$/, '').split('\n').length;
  const disk = splitModules(raw);
  const cut = (JSON.parse(readFileSync(`${dir}/.kaif/deploy-manifest.json`, 'utf8')).moduleShas || {})['AGENT_GUIDE.md'] || [];
  const judged = cut.filter((e) => e.signature !== '<preamble>');
  const diskSigs = new Set(disk.map((d) => d.signature));
  console.log(`\n== ${dir}: ${total} lines on disk, ${disk.length} modules, deployed cut ${cut.length}`);
  if (!cut.length) { console.log('   no deployed cut — every line counts as own (no-cut)'); continue; }
  if (judged.length && !judged.some((e) => diskSigs.has(e.signature))) {
    console.log('   TRANSLATED WHOLESALE — every line counts as own; G cannot be split by signature (headings are translated)');
    continue;
  }
  const pairs = new Set(cut.map((e) => e.sha256 + e.signature));
  const cutSigs = new Set(cut.map((e) => e.signature));
  let arrived = 0; const edited = []; const local = [];
  disk.forEach((m, i) => {
    const n = bodyLines(m, i === disk.length - 1);
    if (pairs.has(sha(m.lines.join('\n')) + m.signature)) { arrived += n; return; }
    const t = tplBySig.get(m.signature);
    (cutSigs.has(m.signature) || t !== undefined ? edited : local).push({ sig: m.signature, n, t });
  });
  console.log(`   arrived ${arrived} · own ${total - arrived}`);
  let g = 0, gMoved = 0, editedLines = 0, localLines = 0;
  for (const e of edited) {
    editedLines += e.n;
    const counted = e.t !== undefined && e.sig !== NOTES_SIGNATURE;
    const moves = counted && MOVED_IN_2_8.some((p) => e.sig.startsWith(p));
    if (counted) g += e.n - e.t;
    if (moves) gMoved += e.n - e.t;
    console.log(`   edited ${String(e.n).padStart(4)} (template ${e.t === undefined ? '  -' : String(e.t).padStart(3)})${counted ? `  ${e.n - e.t >= 0 ? '+' : ''}${e.n - e.t}` : '  (not in G)'}${moves ? '  [moves in 2.8]' : ''}  ${e.sig.slice(0, 72)}`);
  }
  for (const e of local) { localLines += e.n; console.log(`   local  ${String(e.n).padStart(4)}                 (not in G)  ${e.sig.slice(0, 72)}`); }
  // an INDEPENDENT sum, not own = total − arrived restated: the module rows printed above must add up to own
  console.log(`   rows add up: edited ${editedLines} + local ${localLines} = ${editedLines + localLines} ${editedLines + localLines === total - arrived ? '= own ✓' : `≠ own ${total - arrived} ✗`}`);
  const gAfter = g - gMoved;
  console.log(`   G = ${g >= 0 ? '+' : ''}${g} lines of growth in edited template modules (H1 and "${NOTES_SIGNATURE.slice(3)}" left out); G' after the 2.8 moves = ${gAfter >= 0 ? '+' : ''}${gAfter}`);
  for (const [label, growth] of [['G', g], ["G'", gAfter]]) for (const c of CEILINGS) {
    const t = Math.floor(BUDGET * c);
    const own = Math.round(t * TRANSLATION_LINE_RATIO) + growth;
    console.log(`   ${label.padEnd(2)} same shape translated wholesale, template at ${c} × ${BUDGET} = ${t}: ${t} × ${TRANSLATION_LINE_RATIO} + ${growth} = ${own} → ${own <= BUDGET ? `passes, ${BUDGET - own} lines to spare` : `STOPS, ${own - BUDGET} over`}`);
  }
}
