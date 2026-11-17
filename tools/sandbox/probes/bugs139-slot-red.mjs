// tools/sandbox/probes/bugs139-slot-red.mjs — a PROBE (not a polygon suite): guard 5za of tools/check-framework.mjs (version KAIF 2.10, epic
// UB; origin bugs/139 · ideas/32 p. 14 — an instruction slot closed or opened in the middle of a line is misread by the core; the form lives
// in tools/lib/slot-form.mjs) proved RED on the texts before the fix, so its green on this tree means something (TESTING_FRAMEWORK gate 5).
// Every run works on a COPY of the tracked tree (assets and pictures left out); the expected counts are named before the run:
//   control  — no `5za:` line;
//   mutant A — the five files of revision 6fa213d (before the fix): exactly FIVE lines — /end-chat-soft step 3 (closed mid-line), /release
//              step 2 (opened mid-line), AGENT_GUIDE.md test harness (closed mid-line), KAIF_REFERENCE.md archaeology form (a code span
//              «`<!--» broken by a line end), the team constitution template (opened mid-line);
//   mutant B — a mention closed on its own line («(`<PROJECT> X.Y`)») and a one-line slot appended to framework/skills/autoloop/SKILL.md:
//              still none (the guard never judges a mention).
// usage: node tools/sandbox/probes/bugs139-slot-red.mjs        (≈ 15 s; run it alone)
import { writeFileSync, appendFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const REV = '6fa213d';
const MUTATED = ['framework/skills/end-chat-soft/SKILL.md', 'framework/skills/release/SKILL.md', 'framework/AGENT_GUIDE.md',
  'framework/KAIF_REFERENCE.md', 'framework/skills/team-deployment/references/team-constitution-template.md'];
const NAMED = ['framework/skills/end-chat-soft/SKILL.md:117', 'framework/skills/release/SKILL.md:105', 'framework/AGENT_GUIDE.md:529',
  'framework/KAIF_REFERENCE.md:127', 'framework/skills/team-deployment/references/team-constitution-template.md:116'];
const RUN_TIMEOUT_MS = 300000;
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\0')
  .filter((f) => f && !f.startsWith('assets/') && !/\.(pdf|png|jpe?g|gif|webp)$/i.test(f));
const NEW_FILES = ['tools/lib/slot-form.mjs'];   // the step's own new file, not yet tracked
const copyTree = () => {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-bugs139-'));
  for (const f of new Set([...files, ...NEW_FILES])) { mkdirSync(dirname(join(dir, f)), { recursive: true }); copyFileSync(f, join(dir, f)); }
  return dir;
};
const lines5za = (dir) => {
  const r = spawnSync(process.execPath, ['tools/check-framework.mjs'], { cwd: dir, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  return ((r.stdout || '') + (r.stderr || '')).split(/\r?\n/).filter((l) => /5za: /.test(l)).map((l) => l.trim());
};
for (const [name, prep, want] of [
  ['control', () => {}, 0],
  ['mutant A — the five files of ' + REV, (dir) => { for (const f of MUTATED) writeFileSync(join(dir, f), execFileSync('git', ['show', REV + ':' + f], { maxBuffer: 1 << 26 })); }, 5],
  ['mutant B — a mention and a one-line slot', (dir) => appendFileSync(join(dir, 'framework/skills/autoloop/SKILL.md'),
    '\nThe release is named (`<PROJECT> X.Y`) here.\n`<One line of the project\'s own.>`\n'), 0],
]) {
  const dir = copyTree();
  try {
    prep(dir);
    const got = lines5za(dir);
    // judge of session 103 (finding 7): the five lines are named, not only counted — each of the five files at its line
    const named = want ? NAMED.every((n) => got.some((l) => l.includes(n))) : true;
    say(got.length === want && named, name + ': ' + got.length + ' line(s) «5za:» (named ' + want + (want ? ', at the five places' : '') + ')'
      + (got.length ? ' — ' + got.map((l) => l.slice(5, 90)).join(' | ') : ''));
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
console.log(bad ? `✖ ${bad} BAD` : '✅ guard 5za is red on exactly the five slots before the fix and silent on this tree and on a mention');
process.exit(bad ? 1 : 0);
