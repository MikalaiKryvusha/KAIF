// tools/sandbox/probes/ub5-sweep-red.mjs — a PROBE (not a polygon suite): guard 5y of tools/check-framework.mjs (version KAIF 2.10, epic UB,
// step UB5; origin bugs/79 — a sweeping `git add -A` carried two owner files into origin; the form lives in tools/lib/sweep-stage.mjs)
// proved RED on the texts before UB5 and on the forms the UB5 judge (session 102, finding 4) wrote into a copy, so its green on this tree
// means something (TESTING_FRAMEWORK gate 5; EXP-0016 — the proof lives in the repository). Every run works on a COPY of the tracked tree
// (assets and PDFs left out); the expected counts are named before the run:
//   control  — no `5y:` line;
//   mutant A — the five files of revision 3057175: exactly FIVE lines — the core's default <COMMIT_COMMAND>, the two closing skills, the
//              slot's example in framework/_intro.md and /release step 6 («git commit -am», the judge's finding 5);
//   mutant B — fourteen orders appended to framework/skills/autoloop/SKILL.md (the backticked «`git add -A`, then `git commit`» style
//              one field deployment wrote, a bash-block line, a wrapped clause, --all, «.», commit -a/-am, a «;» chain; and the
//              re-judgment's forms: a conditional with «no» before the order, -u, commit --all, -a after the message, «.» before a comma)
//              and four legal lines (a negation right before the command ×2, --amend, «git add .gitignore»): exactly FOURTEEN lines;
//   mutant C — two lines appended to framework/_intro.md: an example order (flagged) and a sentence ABOUT the defect (legal): exactly ONE.
// usage: node tools/sandbox/probes/ub5-sweep-red.mjs        (≈ 10 s; run it alone)
import { writeFileSync, appendFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const REV = '3057175';
const MUTATED = ['framework/installer/KAIF-CORE.mjs', 'framework/skills/end-chat-soft/SKILL.md', 'framework/skills/end-chat-force/SKILL.md',
  'framework/_intro.md', 'framework/skills/release/SKILL.md'];
const INJECT_SKILL = 'framework/skills/autoloop/SKILL.md';
const ORDERS = [
  'Otherwise: `git add -A`, then `git commit -m "<msg>"`, then `git push`.',
  'git add -A',
  'Otherwise: git add -A,',
  'Stage it all with git add --all before the commit.',
  'git add . && git commit -m "wip"',
  'then run git commit -am "wip: parking"',
  'git commit -a -m "release"',
  'Run `git add -A; git commit -m x`.',
  '  git add --all',
  // the re-judgment of UB5 (session 102, finding 3): a conditional with «no» before the order, -u, --all of commit, -a after the message,
  // «.» before a comma
  'If the project has no commit tool: `git add -A`, then `git commit -m "<msg>"`.',
  'git add -u',
  'git commit --all -m "x"',
  'git commit -m "x" -a',
  'Stage with git add ., then commit.',
];
const LEGAL = ['Never `git add -A` here — stage each file by name.', 'Use git commit --amend only on your own last commit.',
  'git add .gitignore first, then the tool.', 'Name the files, not `git add -A`.'];
const DOC = ['Example: `git add -A && git commit -m "<msg>"`.', 'A sweeping `git add -A` in a skill is a second commit route.'];
const RUN_TIMEOUT_MS = 300000;
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\0')
  .filter((f) => f && !f.startsWith('assets/') && !/\.(pdf|png|jpe?g|gif|webp)$/i.test(f));
// the working tree's own new files of this step (not yet tracked) travel too — the guard reads tools/lib/sweep-stage.mjs
const NEW_FILES = ['tools/lib/sweep-stage.mjs'];
const copyTree = () => {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-ub5-'));
  for (const f of new Set([...files, ...NEW_FILES])) { mkdirSync(dirname(join(dir, f)), { recursive: true }); copyFileSync(f, join(dir, f)); }
  return dir;
};
const lines5y = (dir) => {
  const r = spawnSync(process.execPath, ['tools/check-framework.mjs'], { cwd: dir, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  return ((r.stdout || '') + (r.stderr || '')).split(/\r?\n/).filter((l) => /5y: /.test(l)).map((l) => l.trim());
};
const run = (name, mutate, check) => {
  const dir = copyTree();
  try { mutate(dir); const got = lines5y(dir); check(got); for (const l of got) console.log('    ' + l.slice(0, 200)); }
  finally { rmSync(dir, { recursive: true, force: true }); }
};

run('control', () => {}, (got) => say(got.length === 0, `guard 5y — control copy: ${got.length} line(s) «5y:» (expected 0)`));
run('A', (dir) => { for (const p of MUTATED) writeFileSync(join(dir, p), execFileSync('git', ['show', `${REV}:${p}`], { maxBuffer: 1 << 27 })); },
  (got) => say(got.length === MUTATED.length && MUTATED.every((p) => got.some((l) => l.includes(p + ':'))),
    `guard 5y — mutant A, the five files of ${REV}: ${got.length} line(s) (expected ${MUTATED.length}, one per file)`));
run('B', (dir) => appendFileSync(join(dir, INJECT_SKILL), '\n' + [...ORDERS, ...LEGAL].join('\n') + '\n'),
  (got) => say(got.length === ORDERS.length && got.every((l) => l.includes(INJECT_SKILL + ':')),
    `guard 5y — mutant B, ${ORDERS.length} orders + ${LEGAL.length} legal lines in ${INJECT_SKILL}: ${got.length} line(s) (expected ${ORDERS.length})`));
run('C', (dir) => appendFileSync(join(dir, 'framework/_intro.md'), '\n' + DOC.join('\n') + '\n'),
  (got) => say(got.length === 1 && got[0].includes('framework/_intro.md:'),
    `guard 5y — mutant C, an example order + a sentence about the defect in framework/_intro.md: ${got.length} line(s) (expected 1)`));

console.log(bad ? `❌ ${bad} run(s) off their addressees` : '✅ guard 5y: silent on this tree, red exactly on the named texts and forms');
process.exit(bad ? 1 : 0);
