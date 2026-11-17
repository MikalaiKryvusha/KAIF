// tools/sandbox/probes/farewell-by-hand-red.mjs — a PROBE (not a polygon suite): guard 5z of tools/check-framework.mjs (version KAIF 2.10;
// origin bugs/140 — the last words of a chat in a folder without trust never reached FAREWELL_MESSAGE_FROM_THE_PREVIOUS_CHAT.md, because the
// Stop hook was its only writer) proved RED on the skill texts before the fix, so its green on this tree means something (TESTING_FRAMEWORK
// gate 5; EXP-0016). Both runs work on a COPY of the tracked tree (assets and PDFs left out); the counts are named before the run:
//   control — no `5z:` line;
//   mutant  — the three skills of revision 7eebb9c (end-chat-soft, end-chat-force, resume): exactly THREE lines, one per skill.
// usage: node tools/sandbox/probes/farewell-by-hand-red.mjs        (≈ 10 s; run it alone)
import { writeFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const REV = '7eebb9c';
const MUTATED = ['framework/skills/end-chat-soft/SKILL.md', 'framework/skills/end-chat-force/SKILL.md', 'framework/skills/resume/SKILL.md'];
const RUN_TIMEOUT_MS = 300000;
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\0')
  .filter((f) => f && !f.startsWith('assets/') && !/\.(pdf|png|jpe?g|gif|webp)$/i.test(f));
const copyTree = () => {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-farewell-'));
  for (const f of files) { mkdirSync(dirname(join(dir, f)), { recursive: true }); copyFileSync(f, join(dir, f)); }
  return dir;
};
const lines5z = (dir) => {
  const r = spawnSync(process.execPath, ['tools/check-framework.mjs'], { cwd: dir, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  return ((r.stdout || '') + (r.stderr || '')).split(/\r?\n/).filter((l) => /5z: /.test(l)).map((l) => l.trim());
};
const run = (mutate, check) => {
  const dir = copyTree();
  try { mutate(dir); const got = lines5z(dir); check(got); for (const l of got) console.log('    ' + l.slice(0, 200)); }
  finally { rmSync(dir, { recursive: true, force: true }); }
};
run(() => {}, (got) => say(got.length === 0, `guard 5z — control copy: ${got.length} line(s) «5z:» (expected 0)`));
run((dir) => { for (const p of MUTATED) writeFileSync(join(dir, p), execFileSync('git', ['show', `${REV}:${p}`], { maxBuffer: 1 << 27 })); },
  (got) => say(got.length === MUTATED.length && MUTATED.every((p) => got.some((l) => l.includes(p))),
    `guard 5z — the three skills of ${REV}: ${got.length} line(s) (expected ${MUTATED.length}, one per skill)`));
console.log(bad ? `❌ ${bad} run(s) off their addressees` : '✅ guard 5z: silent on this tree, red exactly on the three skills before the fix');
process.exit(bad ? 1 : 0);
