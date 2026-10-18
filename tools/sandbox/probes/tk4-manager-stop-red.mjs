// tools/sandbox/probes/tk4-manager-stop-red.mjs — a PROBE (not a polygon suite): the three «manager stop» pairs of tools/check-framework.mjs
// (version KAIF 2.10, epic TK, step TK4, origin ticket #137 — rule 8 of the team constitution gave the Manager the stop signal and rule 9
// took the force from every message; a worktree seat worked past "close now") proved RED on the v2.9 texts, so their green means something
// (TESTING_FRAMEWORK gate 5; EXP-0016).
//   control: a COPY of the tracked tree (assets and PDFs left out) — no `pair "manager stop` line;
//   mutant:  the same copy with the v2.9 constitution template of both layers and the v2.9 framework/AGENT_GUIDE.md — exactly FIVE lines,
//            named before the run: two fragments of the payload template, two of the wrapper template, one of the guide.
// usage: node tools/sandbox/probes/tk4-manager-stop-red.mjs        (≈ 20 s; run it alone)
import { writeFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const TAG = 'v2.9';
const MUTATED = ['framework/skills/team-deployment/references/team-constitution-template.md',
  '.claude/skills/team-deployment/references/team-constitution-template.md', 'framework/AGENT_GUIDE.md'];
const EXPECTED = 5;
const RUN_TIMEOUT_MS = 300000;
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\0')
  .filter((f) => f && !f.startsWith('assets/') && !/\.(pdf|png|jpe?g|gif|webp)$/i.test(f));
const copyTree = () => {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-137-'));
  for (const f of files) { mkdirSync(dirname(join(dir, f)), { recursive: true }); copyFileSync(f, join(dir, f)); }
  return dir;
};
const managerLines = (dir) => {
  const r = spawnSync(process.execPath, ['tools/check-framework.mjs'], { cwd: dir, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  return ((r.stdout || '') + (r.stderr || '')).split(/\r?\n/).filter((l) => /pair "manager stop/.test(l)).map((l) => l.trim());
};
const cDir = copyTree();
const c = managerLines(cDir);
say(c.length === 0, `«manager stop» pairs — control copy: ${c.length} line(s)`);
for (const l of c) console.log('    ' + l.slice(0, 220));
rmSync(cDir, { recursive: true, force: true });
const mDir = copyTree();
for (const p of MUTATED) writeFileSync(join(mDir, p), execFileSync('git', ['show', `${TAG}:${p}`], { maxBuffer: 1 << 27 }));
const m = managerLines(mDir);
say(m.length === EXPECTED, `«manager stop» pairs — the ${TAG} templates and guide: ${m.length} line(s) (expected ${EXPECTED})`);
for (const l of m) console.log('    ' + l.slice(0, 220));
rmSync(mDir, { recursive: true, force: true });
console.log(bad ? `✖ ${bad} BAD` : `✅ the «manager stop» pairs are red on the ${TAG} texts exactly where named; the control copy is silent`);
process.exit(bad ? 1 : 0);
