// tools/sandbox/probes/hc3-moved-pointers-red.mjs — a PROBE (not a polygon suite): guard 5w of tools/check-framework.mjs (version KAIF
// 2.10, epic HC, step HC3; origin issue #119, second case — pointers at `AGENT_GUIDE.md` for rows 2.8 moved to HOUSE_RULES.md, in the forms
// guard 5s did not see) proved RED on the v2.9 texts, so its green means something (TESTING_FRAMEWORK gate 5; EXP-0016).
//   control: a COPY of the tracked tree (assets and PDFs left out) — no `5w:` line;
//   mutant:  the same copy with the v2.9 BUG_FIXING_FRAMEWORK template and the v2.9 /code-revision, /autoloop, /resume skills — exactly
//            FOUR lines, named before the run: one per file.
// usage: node tools/sandbox/probes/hc3-moved-pointers-red.mjs        (≈ 20 s; run it alone)
import { writeFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const TAG = 'v2.9';
const MUTATED = ['framework/BUG_FIXING_FRAMEWORK.md', 'framework/skills/code-revision/SKILL.md', 'framework/skills/autoloop/SKILL.md',
  'framework/skills/resume/SKILL.md'];
const RUN_TIMEOUT_MS = 300000;
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\0')
  .filter((f) => f && !f.startsWith('assets/') && !/\.(pdf|png|jpe?g|gif|webp)$/i.test(f));
const copyTree = () => {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-119-'));
  for (const f of files) { mkdirSync(dirname(join(dir, f)), { recursive: true }); copyFileSync(f, join(dir, f)); }
  return dir;
};
const lines5w = (dir) => {
  const r = spawnSync(process.execPath, ['tools/check-framework.mjs'], { cwd: dir, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  return ((r.stdout || '') + (r.stderr || '')).split(/\r?\n/).filter((l) => /5w: /.test(l)).map((l) => l.trim());
};
const cDir = copyTree();
const c = lines5w(cDir);
say(c.length === 0, `guard 5w — control copy: ${c.length} line(s) «5w:»`);
for (const l of c) console.log('    ' + l.slice(0, 200));
rmSync(cDir, { recursive: true, force: true });
const mDir = copyTree();
for (const p of MUTATED) writeFileSync(join(mDir, p), execFileSync('git', ['show', `${TAG}:${p}`], { maxBuffer: 1 << 27 }));
const m = lines5w(mDir);
say(m.length === MUTATED.length && MUTATED.every((p) => m.some((l) => l.includes(p + ':'))),
  `guard 5w — the ${TAG} texts: ${m.length} line(s) «5w:» (expected ${MUTATED.length}, one per file)`);
for (const l of m) console.log('    ' + l.slice(0, 200));
rmSync(mDir, { recursive: true, force: true });
console.log(bad ? `✖ ${bad} BAD` : `✅ guard 5w is red on the ${TAG} texts exactly where named; the control copy is silent`);
process.exit(bad ? 1 : 0);
