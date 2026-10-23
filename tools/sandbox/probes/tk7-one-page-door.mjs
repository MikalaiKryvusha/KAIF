// tools/sandbox/probes/tk7-one-page-door.mjs — a PROBE (not a polygon suite): step TK7 (a) of version KAIF 2.10 (origin #169 · #165, I48) on
// the REAL door — the shipped generator's CLI, run the way an agent runs it, in a throw-away project (never the origin's own decisions folder):
//   (1) a LIVE lock of another document (a sleeping node child) → `<doc> --no-open --silent` exits 3 with «Another page is open», no lock left;
//   (2) the child killed (a lock of a process that is gone) → the same command raises the page («Page is up») and ends on `--timeout 2`;
//   (3) `<doc> --timeout 60` (a window would open) → refused before any page, exit 3, nothing served.
// No window, no sound: --no-open --silent and quietEnv(). Red on the 2.9 generator by construction (it has no such refusal) — the mutants of
// tk7-contour-mutants.mjs prove the cases red one by one. usage: node tools/sandbox/probes/tk7-one-page-door.mjs [<contour dir>]  (≈ 15 s)
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { quietEnv } from '../../lib/sandbox-run.mjs';

const GEN = resolve(process.argv[2] || join('framework', 'tools', 'contour'), 'review.mjs');
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const root = mkdtempSync(join(tmpdir(), 'kaif-tk7-door-'));
mkdirSync(join(root, '.kaif'), { recursive: true });
mkdirSync(join(root, 'interviews', 'decisions'), { recursive: true });
writeFileSync(join(root, '.kaif', 'kaif.json'), JSON.stringify({ framework: 'KAIF', version: '2.10', language: 'en', contour: { projectName: 'Probe' } }) + '\n');
const DOC = 'interviews/interview_901_probe.md';
writeFileSync(join(root, DOC), '# Interview #901 — probe\n\n> **Created:** 2026-09-01\n> **Status:** awaiting\n\n### Q1. Which one?\n\n'
  + '<!-- archaeology: n/a — probe -->\n\n- **A)** one\n- **B)** two\n\n**Answer:**\n');
const door = (args) => spawnSync(process.execPath, [GEN, DOC, ...args], { cwd: root, env: quietEnv({ KAIF_VOICE_TOOL: '' }), encoding: 'utf8', timeout: 60000 });
const sleeper = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 120000)'], { stdio: 'ignore' });
const LOCK = join(root, 'interviews', 'decisions', 'interview_902_other.lock');
writeFileSync(LOCK, JSON.stringify({ pid: sleeper.pid, url: 'http://127.0.0.1:1/', doc: 'interviews/interview_902_other.md' }) + '\n');

const r1 = door(['--no-open', '--silent']);
const out1 = (r1.stdout || '') + (r1.stderr || '');
const locks1 = readdirSync(join(root, 'interviews', 'decisions')).filter((f) => f.endsWith('.lock'));
say(r1.status === 3 && /Another page is open: http:\/\/127\.0\.0\.1:1\/ \(interviews\/interview_902_other\.md/.test(out1) && !/Page is up/.test(out1)
  && locks1.length === 1, '(1) live page of another document → exit ' + r1.status + ', «' + ((out1.match(/Another page is open[^\n]*/) || [''])[0]).slice(0, 110) + '…», locks ' + locks1.join(','));

sleeper.kill();
await new Promise((r) => setTimeout(r, 500));
const r2 = door(['--no-open', '--silent', '--timeout', '2']);
const out2 = (r2.stdout || '') + (r2.stderr || '');
say(/Page is up: http:\/\/127\.0\.0\.1:\d+\//.test(out2) && !/Another page is open/.test(out2) && r2.status !== 3,
  '(2) a lock of a process that is gone → the page rises (exit ' + r2.status + ', «' + ((out2.match(/Outcome:[^\n]*/) || [''])[0]).slice(0, 80) + '»)');

const r3 = door(['--timeout', '60']);
const out3 = (r3.stdout || '') + (r3.stderr || '');
say(r3.status === 3 && /--timeout raises the owner's window on a timer — refused before any page/.test(out3) && !/Page is up/.test(out3),
  '(3) --timeout on a page with a window → exit ' + r3.status + ', refused before any page');

rmSync(root, { recursive: true, force: true });
console.log(bad ? `✖ ${bad} BAD` : '✅ the real door: one page at a time, a dead lock does not block, no window on a timer');
process.exit(bad ? 1 : 0);
