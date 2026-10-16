// tools/sandbox/probes/wh5-live-first-prompt.mjs — a PROBE (not a polygon suite): the functional run of WH5 (2.9, plans/132 «Следом»;
// origin tickets #143 §2.2 · #145 §2.1) — two field installs reported that the refresh timer wired by `wire-hooks` answered the owner's
// FIRST prompt after the install with «no refresh witness found»: nobody had stamped the witness. Since WH5 the `study` item of the
// install task orders the stamp and its tick checks it. Suite s14 proves the tick on a deployed copy; this probe walks the field route
// with a LIVE agent session — the real Claude Code CLI, headless, reading the project's own .claude/settings.json — so the hook is fired
// by the harness, not by a test.
//   route — a fresh git project → KAIF installed by THIS build's core (`install`, the step the loader hands over to) → `wire-hooks`
//           (the task's item) → CONTROL: a live prompt with no witness on disk — the timer MUST fire (an observation that cannot fail
//           proves nothing) → the `study` item done the way the agent does it (the witness written as the item says, then
//           `checkpoint study`) → a live prompt — the timer MUST be silent.
//   observation — `claude -p … --output-format stream-json --verbose --include-hook-events --setting-sources project`: the stream's
//           hook events for UserPromptSubmit are read for the timer's order «KAIF context refresh (timer: …)». `--setting-sources
//           project` keeps the operator's own user-level hooks out of the stand; auth works normally.
//   Predictions, written before the first run (2026-10-16, session 82): CONTROL — the order with «no refresh witness found this session»;
//   after `study` — no timer order at all; `checkpoint study` exit 0.
// The live sessions cost two short model calls (`--model haiku`). The child gets no CLAUDE* variables of this session (a nested session
// must not inherit its parent's session identity). Git identity — by the environment only (bugs/124). The run folder is removed on OK and
// kept (path printed) on BAD. Run it alone (≈ 1–2 min).
// usage: node tools/sandbox/probes/wh5-live-first-prompt.mjs [--keep]
// [TESTED: 2026-10-16 10:58:55 → 10:59:04 · this build: ALL OK — CONTROL fired «no refresh witness found this session», after study both
//  UserPromptSubmit hooks ran with exit 0 and no order; against the build before WH5 (KAIF_DIST = dist of a81cc95, 10:58:45 → 10:58:55)
//  exactly the 2 BAD predicted — the item does not order the witness, and the live first prompt after study gets the timer's order;
//  report testcases/reports/2026-10-16_wh5-live-first-prompt.md]
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
// KAIF_DIST — the seam of the suites: the build that plays «this build» (the red proof runs the probe against a build before the fix)
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
const KEEP = process.argv.includes('--keep');
const RUN_TIMEOUT_MS = 300000;
const LIVE_TIMEOUT_MS = 240000;
const LIVE_MODEL = 'haiku';
const LIVE_PROMPT = 'Reply with the single word: ok';
const TIMER_ORDER = /KAIF context refresh \(timer: ([^)]*)\)/;
// The real CLI binary (claude.cmd only forwards to it); an operator without it gets a named refusal, not a green line.
const CLAUDE_EXE = process.env.KAIF_CLAUDE_EXE
  || join(process.env.APPDATA || '', 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe');
const ROOT = mkdtempSync(join(tmpdir(), 'kaif-wh5-live-'));
const ENV = { ...process.env, KAIF_VOICE_TOOL: '', GIT_OPTIONAL_LOCKS: '0',
  GIT_AUTHOR_NAME: 'kaif-probe', GIT_AUTHOR_EMAIL: 'probe@localhost', GIT_COMMITTER_NAME: 'kaif-probe', GIT_COMMITTER_EMAIL: 'probe@localhost' };
delete ENV.KAIF_VOICE;
// the nested session starts clean: no session id, entrypoint or messaging socket of the parent
for (const k of Object.keys(ENV)) if (/^CLAUDE/i.test(k)) delete ENV[k];

let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const info = (line) => console.log('    ' + line);
const tail = (s, n = 6) => String(s).split(/\r?\n/).filter(Boolean).slice(-n).join(' | ').slice(0, 600);
const git = (cwd, ...a) => spawnSync('git', a, { cwd, env: ENV, encoding: 'utf8' });
const core = (cwd, args) => {
  const r = spawnSync(process.execPath, [join(cwd, '.kaif', 'kaif-core.mjs'), ...args], { cwd, env: ENV, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  return { code: r.status, all: (r.stdout || '') + (r.stderr || '') };
};

// One live prompt in the project: the harness reads .claude/settings.json and fires the wired hooks itself. Returns the timer orders
// found in the UserPromptSubmit hook events, the count of those events, and whether the session ended with a result.
const live = (cwd, label) => {
  const r = spawnSync(CLAUDE_EXE, ['-p', LIVE_PROMPT, '--output-format', 'stream-json', '--verbose', '--include-hook-events',
    '--setting-sources', 'project', '--model', LIVE_MODEL], { cwd, env: ENV, encoding: 'utf8', timeout: LIVE_TIMEOUT_MS, maxBuffer: 1 << 26 });
  writeFileSync(join(ROOT, `live-${label}.jsonl`), (r.stdout || '') + '\n--- stderr ---\n' + (r.stderr || ''));
  const events = (r.stdout || '').split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  // `hook_response` carries the hook's exit code and stdout — a response with exit 0 and an empty stdout is a hook that RAN and was silent
  const responses = events.filter((e) => e.subtype === 'hook_response' && e.hook_event === 'UserPromptSubmit');
  const orders = responses.map((e) => (String(e.output || e.stdout || '').match(TIMER_ORDER) || [])[1]).filter(Boolean);
  const result = events.find((e) => e.type === 'result');
  return { code: r.status, err: r.stderr || '', hookEvents: responses.length, allExit0: responses.every((e) => e.exit_code === 0), orders,
    result: result ? String(result.result || '').slice(0, 80) : null };
};

if (!existsSync(CLAUDE_EXE)) { console.log(`REFUSED: the Claude Code CLI is not at ${CLAUDE_EXE} (KAIF_CLAUDE_EXE names another) — no live session, no verdict`); process.exit(2); }

// ---- a fresh git project, KAIF installed by this build's core
const P = join(ROOT, 'proj'); mkdirSync(join(P, '.kaif', 'install'), { recursive: true });
writeFileSync(join(P, 'README.md'), '# demo\n\nA small project the probe installs KAIF into.\n');
git(P, 'init', '-q'); git(P, 'add', '-A'); git(P, 'commit', '-qm', 'init');
copyFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(P, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
copyFileSync(join(DIST, 'KAIF-CORE.mjs'), join(P, '.kaif', 'kaif-core.mjs'));
let r = core(P, ['install', '--agents', 'claude-code']);
say(r.code === 0, `install by this build's core exits 0 — ${tail(r.all, 2)}`);
const MK = join(P, '.kaif', 'refresh-marker.json');
say(!existsSync(MK), 'right after install there is no refresh witness on disk (the state the field reported)');
r = core(P, ['wire-hooks']);
const settings = existsSync(join(P, '.claude', 'settings.json')) ? readFileSync(join(P, '.claude', 'settings.json'), 'utf8') : '';
say(r.code === 0 && /prompt-refresh-timer\.mjs/.test(settings), `wire-hooks wires the refresh timer into .claude/settings.json — ${tail(r.all, 2)}`);

// ---- CONTROL: no witness → the live session's first prompt gets the timer's order
let s = live(P, 'control');
info(`control session: exit ${s.code} · UserPromptSubmit hook events ${s.hookEvents} · result ${JSON.stringify(s.result)}${s.code ? ' · ' + tail(s.err, 3) : ''}`);
say(s.code === 0 && s.hookEvents === 2 && s.orders.some((o) => /no refresh witness found/.test(o)),
    `CONTROL: with no witness the harness fires the timer on the first prompt — «${s.orders[0] || 'no order seen'}»`);

// ---- the study item, the way the agent does it: re-read the nine, write the witness as the item says, tick
const task = () => readFileSync(join(P, 'KAIF_ADAPTATION_TASK.md'), 'utf8');
// the agent does what the item says and nothing more: the witness is written only when the item orders it (on a build before WH5 the
// item does not, the agent writes nothing — exactly the field's route — and the live prompt below shows the timer firing)
const ordered = /stamp the refresh witness `\.kaif\/refresh-marker\.json`/.test(task());
say(ordered, 'the install task\'s study item orders the refresh witness');
const NINE = ['GOAL.md', 'AGENT_GUIDE.md', 'PHILOSOPHY.md', 'REQUIREMENTS_FRAMEWORK.md', 'TESTING_FRAMEWORK.md', 'BUG_FIXING_FRAMEWORK.md',
  'STATUS.md', 'MASTER_PLAN.md', 'PROJECT_STRUCTURE_EXTERNAL_MAP.md'];
say(NINE.every((d) => existsSync(join(P, d))), 'the nine re-read-core documents are deployed (the agent re-reads them)');
if (ordered) writeFileSync(MK, JSON.stringify({ at: new Date().toISOString(), docs: NINE, trigger: 'ritual:install' }, null, 2) + '\n');
r = core(P, ['checkpoint', 'study']);
say(r.code === 0 && /KAIF-ADAPT: study done/.test(task()), `checkpoint study ticks (witness ${ordered ? 'written as ordered' : 'not ordered, not written'}) — ${tail(r.all, 2)}`);

// ---- the owner's first prompt after the install: the timer is silent
s = live(P, 'after-study');
info(`after-study session: exit ${s.code} · UserPromptSubmit hook events ${s.hookEvents} · result ${JSON.stringify(s.result)}${s.code ? ' · ' + tail(s.err, 3) : ''}`);
// two UserPromptSubmit hooks are wired (the timer and the resume word): both must have RUN (exit 0) — silence of a hook that never ran
// would prove nothing
say(s.code === 0 && s.hookEvents === 2 && s.allExit0 && s.orders.length === 0,
    `after study the first live prompt gets no timer order (hooks that ran: ${s.hookEvents}, all exit 0: ${s.allExit0}; orders: ${s.orders.length ? s.orders.join(' / ') : 'none'})`);

console.log(bad ? `\nFAILED: ${bad} BAD — the run folder is kept: ${ROOT}` : '\nALL OK — the timer fires without the witness and is silent after the study item, in a live session');
if (!bad && !KEEP) rmSync(ROOT, { recursive: true, force: true }); else if (!bad) console.log(`kept: ${ROOT}`);
process.exit(bad ? 1 : 0);
