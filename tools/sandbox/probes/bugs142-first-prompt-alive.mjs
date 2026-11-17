// tools/sandbox/probes/bugs142-first-prompt-alive.mjs — a PROBE (not a polygon suite): bugs/142 — `--alive` said «NOT running» in the FIRST
// tool call of a session whose hooks ran. The context-window hook (this build, or `--rev <git revision>` — taken by `git show` into a temporary
// folder) is run as Claude Code runs it: a JSON event on stdin, CLAUDE_PROJECT_DIR = a temporary project. Two first prompts — a transcript with
// no model answer yet, and a transcript path that does not exist yet — then the hook's own `--alive` judgement of each session from the state.
//   this build → both sessions recorded (exit 0);  the hook of HEAD before the fix → neither recorded — the defect reproduced (exit 1).
// Nothing of the repository is written; the temporary folder is removed.
// usage: node tools/sandbox/probes/bugs142-first-prompt-alive.mjs [--rev <git revision>]   (≈ 2 s)
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';


const REPO = resolve(new URL('../../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const at = process.argv.indexOf('--rev'), rev = at > 0 ? process.argv[at + 1] : null;
const work = mkdtempSync(join(tmpdir(), 'kaif-bugs142-'));
let code = 1;
try {
  let hook = join(REPO, 'framework', 'hooks', 'context-window.mjs');
  if (rev) {
    const s = spawnSync('git', ['show', rev + ':framework/hooks/context-window.mjs'], { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 24 });
    if (s.status !== 0) { console.log('✖ git show ' + rev + ' failed'); process.exit(2); }
    hook = join(work, 'context-window.mjs'); writeFileSync(hook, s.stdout);
  }
  const proj = join(work, 'project'); mkdirSync(join(proj, '.kaif'), { recursive: true }); writeFileSync(join(proj, '.kaif', 'kaif.json'), '{}');
  const tp = join(proj, 'first.jsonl');
  writeFileSync(tp, JSON.stringify({ type: 'user', message: { role: 'user', content: 'resume' } }) + '\n');
  const run = (ev) => spawnSync(process.execPath, [hook], { input: JSON.stringify(ev), env: { ...process.env, CLAUDE_PROJECT_DIR: proj }, encoding: 'utf8', timeout: 20000 });
  run({ hook_event_name: 'UserPromptSubmit', session_id: 'first-a', transcript_path: tp, cwd: proj });
  run({ hook_event_name: 'UserPromptSubmit', session_id: 'first-b', transcript_path: join(proj, 'not-yet.jsonl'), cwd: proj });
  const statePath = join(proj, '.kaif', 'context-window.json');
  const st = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : {};
  // the hook's own rule (aliveLine): a session is running when the state holds its record — the module is NOT imported here: importing it
  // runs its event block, which reads stdin and exits the process
  const a = { code: st['first-a'] ? 0 : 1 }, b = { code: st['first-b'] ? 0 : 1 };
  console.log('hook: ' + (rev ? 'revision ' + rev : 'this build'));
  console.log('first prompt, transcript without a model answer: recorded by the --alive rule ' + (a.code ? 'NO' : 'yes') + ' (exit ' + a.code
    + ') · first prompt, no transcript yet: recorded ' + (b.code ? 'NO' : 'yes') + ' (exit ' + b.code + ')');
  // judge of session 103 (finding 4): the REAL `--alive` command too — a temporary vendor store (HOME / USERPROFILE) holds the session's
  // first-prompt transcript under the project's slug, the project wires the hook on PostToolUse, the session id comes as Claude Code gives it
  const home = join(work, 'home'), slug = resolve(proj).replace(/[^A-Za-z0-9]/g, '-');
  mkdirSync(join(home, '.claude', 'projects', slug), { recursive: true });
  writeFileSync(join(home, '.claude', 'projects', slug, 'first-a.jsonl'), readFileSync(tp));
  mkdirSync(join(proj, '.claude'), { recursive: true });
  writeFileSync(join(proj, '.claude', 'settings.json'), JSON.stringify({ hooks: { PostToolUse: [{ matcher: '*', hooks: [{ type: 'command', command: 'node',
    args: ['context-window.mjs'] }] }] } }));
  const al = spawnSync(process.execPath, [hook, '--alive'], { env: { ...process.env, CLAUDE_PROJECT_DIR: proj, CLAUDE_CODE_SESSION_ID: 'first-a',
    USERPROFILE: home, HOME: home }, encoding: 'utf8', timeout: 20000 });
  console.log('the real --alive of session first-a: exit ' + al.status + ' · ' + String(al.stdout || '').trim().slice(0, 110));
  code = a.code === 0 && b.code === 0 && al.status === 0 ? 0 : 1;
  console.log(code === 0 ? '✅ the session is seen from its first prompt' : '✖ RED — a session whose hooks ran reads «NOT running» (bugs/142)');
} finally { rmSync(work, { recursive: true, force: true }); }
process.exit(code);
