// tools/sandbox/probes/tk1-opening-red.mjs — a PROBE (not a polygon suite): guard 5v of tools/check-framework.mjs (2.10, epic TK, origin
// ticket #156 — the KAIF owner, rendered from Russian: "do not say where the AI agent should start, let it decide itself") proved RED
// on the v2.9 texts, so its green on this tree means something (TESTING_FRAMEWORK gate 5; EXP-0016 — the proof lives in the repository).
//   control:  a COPY of the tracked tree (assets and PDFs left out) — no `5v:` line;
//   mutant 1: the same copy with framework/AGENT_GUIDE.md and tools/build-framework.mjs of v2.9 — exactly TWO `5v:` lines, named before
//             the run: the guide's rule «The owner's word mid-turn» item 2 and the builder's 2.9 note about the retired hook;
//   mutant 2: the copy with the TK judge's five rephrasings appended to framework/PHILOSOPHY.md — exactly FIVE `5v:` lines there.
// usage: node tools/sandbox/probes/tk1-opening-red.mjs        (≈ 20 s; run it alone)
import { writeFileSync, readFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const TAG = 'v2.9';
const MUTATED = ['framework/AGENT_GUIDE.md', 'tools/build-framework.mjs'];
const RUN_TIMEOUT_MS = 300000;
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\0')
  .filter((f) => f && !f.startsWith('assets/') && !/\.(pdf|png|jpe?g|gif|webp)$/i.test(f));
const copyTree = () => {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-156-'));
  for (const f of files) { mkdirSync(dirname(join(dir, f)), { recursive: true }); copyFileSync(f, join(dir, f)); }
  return dir;
};
const lines5v = (dir) => {
  const r = spawnSync(process.execPath, ['tools/check-framework.mjs'], { cwd: dir, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  return ((r.stdout || '') + (r.stderr || '')).split(/\r?\n/).filter((l) => /5v: /.test(l)).map((l) => l.trim());
};

const cDir = copyTree();
const c = lines5v(cDir);
say(c.length === 0, `guard 5v — control copy: ${c.length} line(s) «5v:»`);
for (const l of c) console.log('    ' + l.slice(0, 200));
rmSync(cDir, { recursive: true, force: true });

const mDir = copyTree();
for (const p of MUTATED) writeFileSync(join(mDir, p), execFileSync('git', ['show', `${TAG}:${p}`], { maxBuffer: 1 << 27 }));
const m = lines5v(mDir);
say(m.length === 2 && m.some((l) => l.includes('framework/AGENT_GUIDE.md:')) && m.some((l) => l.includes('tools/build-framework.mjs:')),
  `guard 5v — the ${TAG} guide and builder notes: ${m.length} line(s) «5v:» (expected 2: the guide's rule, the 2.9 note)`);
for (const l of m) console.log('    ' + l.slice(0, 200));
rmSync(mDir, { recursive: true, force: true });

// mutant 2: the five rephrasings the TK judge found passing the first regex (judge-tk.md, hunt 7), appended to a shipped template of the
// copy — exactly FIVE `5v:` lines, all in that file.
const REPHRASED = [
  "Start the answer with the owner's first words.",
  'Begin your reply with his words.',
  "Quote the owner's first words at the top.",
  "Lead the answer with the owner's words.",
  'Open the answer with his words.',
];
const R_FILE = 'framework/PHILOSOPHY.md';
const rDir = copyTree();
writeFileSync(join(rDir, R_FILE), readFileSync(join(rDir, R_FILE), 'utf8') + '\n' + REPHRASED.join('\n') + '\n');
const r = lines5v(rDir);
say(r.length === REPHRASED.length && r.every((l) => l.includes(`${R_FILE}:`)),
  `guard 5v — the judge's ${REPHRASED.length} rephrasings in ${R_FILE}: ${r.length} line(s) «5v:» (expected ${REPHRASED.length})`);
for (const l of r) console.log('    ' + l.slice(0, 200));
rmSync(rDir, { recursive: true, force: true });
console.log(bad ? `✖ ${bad} BAD` : `✅ guard 5v is red on the ${TAG} texts exactly where named; the control copy is silent`);
process.exit(bad ? 1 : 0);
