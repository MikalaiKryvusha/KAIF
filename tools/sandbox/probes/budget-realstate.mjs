// tools/sandbox/probes/budget-realstate.mjs — a PROBE (not a polygon suite): the FUNCTIONAL run of epic CB 2.7 on REAL
// state. For every deployment directory given on the command line it copies the files that deployment's own manifest
// names into a temp tree (READ ONLY on the source: the sha256 of every source file is taken before and re-checked after),
// runs the NEW core's `check` and `check --gate-budgets` on the COPY, and reads the printed numbers back against numbers
// computed here from `wc -l` and the deployment's OWN `moduleShas`. Deployments are printed as PSEUDONYMS only
// (project B, project E, … — the owner's rule on project names); the paths live on the command line, never in this file.
// Two honest limits, printed by the run itself: a document both sides stay silent about is agreement of two silences, not
// the same evidence as a matched number; and the cross-check RE-IMPLEMENTS the algorithm, so it catches an assembly error
// in the core, never an error of the algorithm itself. Neither is the owner's path: that is a project that updated itself
// to 2.7 and ran its own `check` (the core guard's ON-REAL-PATH line says NOT YET until then).
// Born in the scratchpad of the epic's subagent (session 66) as cb-realstate.mjs; brought into the repository by the
// integrator so the run can be repeated (EXP-0016). The byte-order mark is stripped by CODE POINT, with no escape and no
// character in this source (origin bug 122).
// Run:   node tools/sandbox/probes/budget-realstate.mjs <deployment dir> [<deployment dir> …]      (needs a FRESH dist)
// Raises no window and no sound; writes only into the OS temp dir and prints where the traces are.
// [TESTED: 2026-09-18 11:02 and 11:04 +03:00 · by the epic's subagent, as cb-realstate.mjs, on copies of two field
//  deployments (243 files each; sources re-hashed after the run — 0 changed): 3 and 4 printed numbers matched the numbers
//  computed here, the other documents silent on both sides, 0 disagreements; the run found the "translated wholesale"
//  sentence printed for owner-seeded documents — fixed before the commit; report testcases/reports/2026-09-18_canon-budget.md,
//  runs 10 and 13. NOT re-run by the integrator after the move into the repository.]
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const CORE = join(REPO, 'dist', 'KAIF-CORE.mjs');
const stripBom = (s) => (s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s);
const readJson = (p) => JSON.parse(stripBom(readFileSync(p, 'utf8')));
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const lineCount = (p) => readFileSync(p, 'utf8').replace(/\r?\n$/, '').split(/\r?\n/).length;
const normEol = (s) => s.replace(/\r\n/g, '\n');
// The same module cut the core uses (heading to heading, fences respected) — re-implemented on purpose: see the header.
function splitModules(content) {
  const modules = [];
  let cur = { signature: '<preamble>', lines: [] };
  let inFence = false;
  for (const line of content.split('\n')) {
    if (/^(`{3,}|~{3,})/.test(line.trim())) inFence = !inFence;
    if (!inFence && /^#{1,3} /.test(line)) { modules.push(cur); cur = { signature: line, lines: [] }; }
    cur.lines.push(line);
  }
  modules.push(cur);
  return modules.filter((m) => m.signature !== '<preamble>' || m.lines.join('').length > 0);
}
const normSha = (t) => createHash('sha256').update(normEol(String(t))).digest('hex');
// An INDEPENDENT copy of the nine budgets, on purpose: the probe cross-checks the core, so it must not read the core's table.
const BUDGETS = { 'STATUS.md': 200, 'GOAL.md': 300, 'MASTER_PLAN.md': 300, 'PROJECT_STRUCTURE_EXTERNAL_MAP.md': 300,
  'PHILOSOPHY.md': 300, 'TESTING_FRAMEWORK.md': 300, 'BUG_FIXING_FRAMEWORK.md': 300, 'REQUIREMENTS_FRAMEWORK.md': 250, 'AGENT_GUIDE.md': 1200 };

const dirs = process.argv.slice(2);
if (!dirs.length) { console.error('usage: node tools/sandbox/probes/budget-realstate.mjs <deployment dir> [<deployment dir> …]'); process.exit(2); }
let disagreements = 0, touched = 0;
dirs.forEach((src, idx) => {
  const alias = 'deployment ' + (idx + 1);
  console.log(`\n================ ${alias}  (source: READ ONLY) ================`);
  const man = readJson(join(src, '.kaif', 'deploy-manifest.json'));
  const marker = readJson(join(src, '.kaif', 'kaif.json'));
  console.log(`v${marker.version} lang=${marker.language} i18n=${marker.i18n || '-'} · ${(man.paths || []).length} paths · ${(man.agents || []).length} agent artifacts`);

  const ROOT = mkdtempSync(join(tmpdir(), 'kaif-budget-real-'));
  const before = new Map();
  let copied = 0, absent = 0;
  for (const rel of [...(man.paths || []), ...(man.agents || []), '.kaif/kaif.json', '.kaif/deploy-manifest.json']) {
    const from = join(src, rel);
    if (!existsSync(from) || !statSync(from).isFile()) { absent++; continue; }
    before.set(rel, sha(from));
    const to = join(ROOT, rel);
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
    copied++;
  }
  console.log(`copied ${copied} file(s) into the temp tree, ${absent} named by the manifest and absent on disk`);
  copyFileSync(CORE, join(ROOT, '.kaif', 'kaif-core.mjs'));   // the core under test is OURS, never the project's

  const run = (args) => {
    try { return { code: 0, out: execFileSync(process.execPath, [join(ROOT, '.kaif', 'kaif-core.mjs'), ...args], { cwd: ROOT, stdio: 'pipe', maxBuffer: 1 << 26 }).toString() }; }
    catch (e) { return { code: e.status ?? 1, out: String(e.stdout || '') + String(e.stderr || '') }; }
  };

  console.log('\nexpected (computed here, from the line count and the deployment\'s own moduleShas):');
  const expected = {};
  for (const [doc, budget] of Object.entries(BUDGETS)) {
    const p = join(ROOT, doc);
    if (!existsSync(p)) continue;
    const total = lineCount(p);
    const cut = (man.moduleShas || {})[doc] || null;
    let ownL = total, basis = 'no-cut', arrived = 0;
    if (cut && cut.length) {
      const disk = splitModules(normEol(readFileSync(p, 'utf8')));
      const sigs = new Set(disk.map((d) => d.signature));
      const judged = cut.filter((e) => e.signature !== '<preamble>');
      if (judged.length && !judged.some((e) => sigs.has(e.signature))) basis = 'no template signature survives';
      else {
        const pairs = new Set(cut.map((e) => `${e.signature} ${e.sha256}`));
        disk.forEach((m, i) => {
          if (!pairs.has(`${m.signature} ${normSha(m.lines.join('\n'))}`)) return;
          let n = m.lines.length;
          if (i === disk.length - 1 && n && m.lines[n - 1] === '') n--;
          arrived += n;
        });
        ownL = Math.max(0, total - arrived); basis = 'cut';
      }
    }
    expected[doc] = { ownL, budget };
    console.log(`  ${doc.padEnd(36)} disk ${String(total).padStart(5)} · arrived ${String(arrived).padStart(5)} · own ${String(ownL).padStart(5)} / ${String(budget).padStart(4)}  ${ownL > budget ? 'OVER' : '    '}  [${basis}]`);
  }

  const r = run(['check']);
  console.log(`\n--- the NEW core, \`check\` on the copy: exit ${r.code}`);
  for (const l of r.out.split(/\r?\n/)) if (/budget|language mix/.test(l)) console.log('  ' + l.trim().slice(0, 300));
  const g = run(['check', '--gate-budgets']);
  console.log(`--- the NEW core, \`check --gate-budgets\` on the copy: exit ${g.code}`);
  for (const l of g.out.split(/\r?\n/)) if (/^✖ /.test(l)) console.log('  ' + l.trim().slice(0, 300));

  console.log('\n--- read back: printed vs computed (a matched NUMBER and a shared SILENCE are counted apart) ---');
  let matched = 0, silent = 0, disagree = 0;
  for (const [doc, e] of Object.entries(expected)) {
    const m = r.out.match(new RegExp('⚠ ' + doc.replace('.', '[.]') + ': own lines (\\d+) of budget ~(\\d+)'));
    if (e.ownL > e.budget) {
      if (m && Number(m[1]) === e.ownL && Number(m[2]) === e.budget) { matched++; console.log(`  NUMBER MATCHED  ${doc}: printed own ${m[1]} of ${m[2]} = computed`); }
      else { disagree++; console.log(`  MISMATCH        ${doc}: computed own ${e.ownL}/${e.budget}, printed ${m ? m[1] + '/' + m[2] : 'NOTHING'}`); }
    } else if (m) { disagree++; console.log(`  MISMATCH        ${doc}: computed under budget (own ${e.ownL}/${e.budget}) but the core warned`); }
    else { silent++; console.log(`  BOTH SILENT     ${doc}: computed own ${e.ownL} <= ${e.budget}, the core printed nothing`); }
  }
  console.log(`  printed numbers cross-checked: ${matched} · both-silent: ${silent} · disagreements: ${disagree}`);
  disagreements += disagree;

  let changed = 0;
  for (const [rel, s] of before) { const from = join(src, rel); if (!existsSync(from) || sha(from) !== s) changed++; }
  touched += changed;
  console.log(`\nsource files re-hashed after the run: ${before.size} · changed: ${changed}`);
  writeFileSync(join(ROOT, 'check.out'), r.out + '\n\n===== gate =====\n' + g.out);
  console.log(`traces: ${ROOT}`);
});
console.log(disagreements || touched ? `\n❌ disagreements ${disagreements} · source files changed ${touched}` : '\n✅ no disagreement between printed and computed numbers · no source file changed');
process.exit(disagreements || touched ? 1 : 0);
