#!/usr/bin/env node
// context-window.mjs — the "the window speaks in four steps: 75 · 80 · 85 · 92" hook (KAIF 2.10, epic PT; origin ticket #188 and
// its comment — two field deployments carried their own budget hook; optional refresh-hooks module, deployed to .kaif/hooks/).
// Claude Code events: UserPromptSubmit · PostToolUse · PreToolUse (matcher Skill — the closing gate, below).
//
// What it does: reads the session's last main-thread usage from the transcript (input + cache_creation + cache_read tokens — the vendor's
// own formula for «used», code.claude.com/docs/en/statusline) and, once per step (re-armed after a compaction), puts ONE line into the
// agent's context — the four steps of the KAIF owner (decision №161 of the origin, interview 049 Q1, rendered from Russian: «at 75 % the
// agent gets a warning that the end of the context window is near; at 80 % the hook orders bringing the work to a logical cut; at 85 % it
// requires starting the soft closure of the chat; at 92 % it requires finishing the soft closure quickly if it is running, or starts the
// forced closure»):
//   warnPct (default 75)  — a WARNING only: keep the normal pace, keep STATUS.md fresh, tell the owner once by voice. The line carries no
//                           closing word — a field agent read «finish to a cut — at 75 % it is time to close» at 70 % as the closure itself
//                           and stopped taking work with 30 % of the window left (the owner: «you close too early»);
//   cutPct (default 80)   — bring the work in hand to a logical cut; no new heavy task;
//   closePct (default 85) — start /end-chat-soft, the current work finished to its cut first; never a forced closure at this step;
//   forcePct (default 92) — finish the running soft closure quickly, or start /end-chat-force.
// A step jumped over is not said: one line, the highest step reached. A project that sets only closePct gets the others at the owner's
// spacing around it (−10 · −5 · +7); a derived step that does not climb above the step before it is dropped. A field session saw a 1M
// window auto-compact at ≈ 89 % (887 621 tokens, origin #188) — the 92 % step may never come there; a project whose sessions compact
// earlier sets its own steps. After a compaction the steps re-arm (keptLevels).
// The window size: no hook event carries it (vendor hooks reference); the rule — the project's `.kaif/kaif.json` → `contextWindow.tokens`
// wins; else `CLAUDE_CODE_DISABLE_1M_CONTEXT=1` → 200 000; else the model of the record: a `[1m]` suffix, or a family the vendor runs
// with 1M by default (Fable 5 and later, Sonnet 5 and later, Haiku 5.5, Opus 4.7 and later — code.claude.com/docs/en/model-config) →
// 1 000 000; else 200 000 — and never less than the usage seen (used > 200 000 ⇒ the window is 1 000 000).
// Thresholds: `contextWindow.warnPct` · `contextWindow.closePct` — the owner states them; state per session in .kaif/context-window.json.
// It blocks ONE thing (the closing gate, PreToolUse · matcher Skill): a closing skill — /end-chat-soft or /end-chat-force — called while the
// window is below closePct and without the owner's word in the skill's args (`owner: «<his words asking to close>»`) is denied with the
// measured share; the agent keeps working. Origin: the source's session 100 closed «by the window» at 53 % by feeling, and a field deployment
// carried the same gate after closing at 68 % «by the feeling of the limit» (its owner: you closed the chat too early again — fix the hook);
// nothing to measure (no transcript, no usage) — the gate does not block. It never stops a turn otherwise. Any internal error → exit 0
// silently. Lines are English: the agent reads them.
// [TESTED: 2026-11-17 · the gate, `--measure` and `--alive` — hygiene: --selftest all ok, mutants G1–G6 of tools/sandbox/probes/gate-close-mutant.mjs
//  red on exactly their cases, s14 on the deployed hook; functional: `--measure` and `--alive` LIVE in a session whose hooks the agent system
//  withheld (54 %, exit 1 · «NOT running … by session id», exit 1); the gate at a live skill call — NOT observed: the origin's folder had no
//  trust (bugs/138); the judge of session 101 refuted the first gate (a «/end-chat-soft» name passed) — report testcases/reports/2026-11-17_close-gate.md]
// [TESTED: 2026-11-06 13:15 +03:00 · functional — `tools/sandbox/probes/pt6-context-window.mjs` on the origin's own live transcript (session 97,
//  claude-opus-5-5, 680 700 tokens → the 1M window by the vendor's rule, 68 %): the defaults 80 / 85 — silence; the project's 60 / 65 —
//  the «finish to a logical cut, then /end-chat-soft» line; hygiene — --selftest 9/9, mutant «cache_read not counted» red on exactly the
//  usage case (probe tools/sandbox/probes/pt6-context-window-mutant.mjs); report testcases/reports/2026-11-06_s97-polygon-scenario-lint.md rows 35–36; judge of session 97 —
//  the subagent guard and the windowOf edges added after; LIVE 2026-11-06 14:14 — the origin's session 97 crossed 80 % and got the line
//  «the window is 80 % full (800395 of 1000000 tokens). A WARNING only — keep working…» with no closing word (report row 47);
//  ≈ 2026-11-06 15:35 (session 98, judge of epics PT6 · HC10): the re-arm after a compaction and the voice at 80 % — hygiene only
//  (--selftest 12/12, four mutants each red on its case; report testcases/reports/2026-11-06_s98-judge-debt-mm-tk10.md); a live
//  compaction re-arm — NOT observed]
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, openSync, readSync, fstatSync, closeSync, readdirSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const STATE = join('.kaif', 'context-window.json');
const DEPLOYMENT = join('.kaif', 'kaif.json');
const TAIL_BYTES = 4 * 1024 * 1024;    // the last records of the transcript — the usage of the newest main-thread answer lives there
const SESSIONS_KEPT = 20;
export const DEFAULTS = { warnPct: 75, cutPct: 80, closePct: 85, forcePct: 92 };   // decision №161 of the origin
const KINDS = ['warn', 'cut', 'close', 'force'];
// The steps of a project — pure: (thresholds) → [{ kind, at }] climbing. A number the project set is kept as set; a missing one is derived
// from closePct at the owner's spacing; a derived step at or below the step before it is dropped (a project 70 / 75 — warning 70, closing
// 75, forced 82, no separate cut step: the closing line already says «finish to the cut first»).
export function levelsOf(cfg = {}) {
  const own = (k) => (Number(cfg[k]) > 0 ? Number(cfg[k]) : null);
  const close = own('closePct') ?? DEFAULTS.closePct;
  const want = [['warn', own('warnPct'), close - 10], ['cut', own('cutPct'), close - 5], ['close', close, close], ['force', own('forcePct'), close + 7]];
  const out = [];
  for (const [kind, set, derived] of want) {
    if (set === null && out.length && derived <= out[out.length - 1].at) continue;
    out.push({ kind, at: set ?? derived });
  }
  return out.sort((a, b) => a.at - b.at || KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind));
}
export const SMALL = 200000, LARGE = 1000000;

// The window size by the vendor's rule (see the header); `seen` — the largest usage observed in this session.
export function windowOf({ model = '', env = {}, tokens = null, seen = 0 } = {}) {
  if (Number(tokens) > 0) return Number(tokens);   // the project's own word wins, the floor included (judge of session 97, finding 6)
  const w = env.CLAUDE_CODE_DISABLE_1M_CONTEXT === '1' ? SMALL : /\[1m\]/i.test(model) || bigByDefault(model) ? LARGE : SMALL;
  return seen > w && w === SMALL ? LARGE : w;
}
function bigByDefault(model) {
  const m = String(model).toLowerCase().match(/claude-(fable|sonnet|haiku|opus)-(\d+)(?:-(\d{1,2})(?!\d))?/);
  if (!m) return false;
  const fam = m[1], maj = Number(m[2]), min = m[3] ? Number(m[3]) : 0;
  if (fam === 'fable') return maj >= 5;
  if (fam === 'sonnet') return maj >= 5;
  if (fam === 'haiku') return maj > 5 || (maj === 5 && min >= 5);
  if (fam === 'opus') return maj > 4 || (maj === 4 && min >= 7);
  return false;
}
export const usedOf = (u) => (u ? (Number(u.input_tokens) || 0) + (Number(u.cache_creation_input_tokens) || 0) + (Number(u.cache_read_input_tokens) || 0) : 0);

// The newest main-thread assistant record with usage, from the transcript's tail.
export function lastUsage(text) {
  const lines = String(text).split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i].includes('"usage"')) continue;
    try {
      const r = JSON.parse(lines[i]);
      // a `<synthetic>` record (the client's own line, zero usage) is no answer of the model — it read «0 %» on session 100 (judge of session 101)
      if (r.type === 'assistant' && !r.isSidechain && r.message && r.message.usage && r.message.model !== '<synthetic>' && usedOf(r.message.usage) > 0)
        return { used: usedOf(r.message.usage), model: String(r.message.model || '') };
    } catch { /* a torn line at the cut of the tail */ }
  }
  return null;
}
const atOf = (L, kind) => (L.find((l) => l.kind === kind) || {}).at;
export const LINES = {
  warn: (pct, used, win) => `KAIF context: the window is ${pct} % full (${used} of ${win} tokens). A WARNING only — the end of the window ` +
    'is near: keep working at your normal pace and keep STATUS.md fresh; tell the owner once by voice that the window is at ' + pct + ' %.',
  cut: (pct, used, win, L) => `KAIF context: the window is ${pct} % full (${used} of ${win} tokens). The step of ${atOf(L, 'cut')} %: bring the ` +
    'work in hand to a logical cut — finish the current step, run it, commit it green; take no new heavy task.' +
    (atOf(L, 'close') ? ` The soft closure comes at ${atOf(L, 'close')} %.` : ''),
  close: (pct, used, win, L) => `KAIF context: the window is ${pct} % full (${used} of ${win} tokens). The step of ${atOf(L, 'close')} %: start ` +
    'the soft closure now — /end-chat-soft; first finish the current work to its logical cut if it is not there. Never a forced closure at this step.',
  force: (pct, used, win, L) => `KAIF context: the window is ${pct} % full (${used} of ${win} tokens). The step of ${atOf(L, 'force')} %: if ` +
    'the soft closure is running — finish it quickly, the essentials first (STATUS.md, the farewell, commit and push); if it is not — ' +
    'start /end-chat-force now.',
};
// Judge of session 97 (finding 4): Claude Code fires this hook on a SUBAGENT's tool calls too, under the parent's session and transcript.
// Observed live (origin session 97, a temporary logging hook): a subagent's event carries `agent_id` and `agent_type`, the main thread's
// does not. (A first guard looked the call up in the transcript — the CLI writes the record AFTER PostToolUse, so it silenced the main
// thread of every headless session; the probe tools/sandbox/probes/mm3-live-knowledge.mjs caught it.)
export const fromSubagent = (ev) => Boolean(ev && ev.agent_id);
// Re-arming (judge of epics PT6 · HC10, session 98, finding 3): a level said stays said only while the window is still at or above it —
// after a compaction (auto or /compact) the usage falls, and the 80 / 85 lines must come again when the window refills; pure.
export const keptLevels = (used, win, said = []) => { const pct = win > 0 ? Math.floor((used / win) * 100) : 0; return said.filter((l) => l <= pct); };
// The decision — pure: (used, window, thresholds, levels already said) → { line, level } or null
// A step is said once: only steps ABOVE the highest one already said this fill of the window count (a state written by the 80 / 85
// edition — [80, 85] — says nothing lower after the update); of those reached, ONE line — the highest; every reached step is marked said.
export function decide(used, win, cfg, said = []) {
  const pct = win > 0 ? Math.floor((used / win) * 100) : 0;
  const L = levelsOf(cfg || {}), top = Math.max(-1, ...said.filter((l) => l <= pct));
  const due = L.filter((l) => l.at <= pct && l.at > top);
  if (!due.length) return null;
  const hi = due[due.length - 1];   // levelsOf climbs: the last reached step is the highest
  return { level: hi.at, levels: [...new Set(due.map((l) => l.at))], kind: hi.kind, line: LINES[hi.kind](pct, used, win, L) };
}

// The closing gate — pure: (event, used, window, thresholds) → the hook's deny answer or null. A closing skill below closePct passes only
// with the owner's own words in its args; a subagent never closes the chat, so its calls are not judged.
export const OWNER_WORD = /owner:\s*[«"“][^»"”]+[»"”]/;
export function closeGate(ev, used, win, cfg = {}) {
  if (!ev || ev.hook_event_name !== 'PreToolUse' || ev.tool_name !== 'Skill' || fromSubagent(ev)) return null;
  const ti = ev.tool_input || {};
  // the name as Claude Code runs it (judge of session 101): it trims the name and drops a leading «/», a plugin or folder prefix ends at «:» —
  // so «/end-chat-soft», « end-chat-soft» and «a/b:end-chat-soft» are the same call. Words after the name: Claude Code looks the whole string
  // up and would not run such a skill (re-judge, N1); the gate still reads them as args — the safe direction, nothing passes by them
  const [name, ...rest] = String(ti.skill || ti.name || '').trim().replace(/^\/+/, '').split(/\s+/);
  const m = /^(?:[^\s:]+:)?end-chat-(soft|force)$/.exec(name || '');
  if (!m || OWNER_WORD.test(`${ti.args || ''} ${rest.join(' ')}`) || !(used > 0) || !(win > 0)) return null;
  const closePct = Number(cfg.closePct) > 0 ? Number(cfg.closePct) : DEFAULTS.closePct;
  const pct = Math.floor((used / win) * 100);
  if (pct >= closePct) return null;
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason:
    `KAIF context: the window is ${pct} % full (${used} of ${win} tokens) — below the closing level ${closePct} %: it is too early to close ` +
    `the chat by the window; keep working. Closing at the owner's word — pass his words verbatim in the skill's args: owner: «<his words>».` } };
}

// The agent's own measurement (session 101, bugs/138): an agent system may withhold the project's hooks and skills from a session (Claude Code
// 2.1.326 in a folder without trust) — then the closing skills' step 0 measures the window by hand: `--measure [<transcript.jsonl>]`. Without a
// path — the newest transcript of this project in the vendor's store, ~/.claude/projects/<the project path, every non-alphanumeric → '-'>/.
// Exit 0 — at or above the closing level · 1 — below it, too early to close by the window · 2 — nothing to measure.
export const slugOf = (p) => String(p).replace(/[^A-Za-z0-9]/g, '-');
const SLUG_MAX = 200;   // the vendor cuts a longer folder name to 200 characters and appends «-<hash>» (judge of session 101, read in claude.exe)
// This session's transcript: the agent's own session id (CLAUDE_CODE_SESSION_ID — present in the agent's commands on Windows and macOS) names
// it; without one — the newest transcript of the project (two live chats of one folder: the other one may be measured — said in the output).
export function transcriptOf(root, home = homedir(), sid = process.env.CLAUDE_CODE_SESSION_ID || '') {
  const base = join(home, '.claude', 'projects'), slug = slugOf(resolve(root));
  let dir = join(base, slug);
  if (!existsSync(dir) && slug.length > SLUG_MAX) {
    // case-blind: a drive letter comes upper- or lower-case by the shell (re-judge, N3); Windows paths do not tell case apart
    const pre = (slug.slice(0, SLUG_MAX) + '-').toLowerCase();
    try { const hit = readdirSync(base).find((d) => d.toLowerCase().startsWith(pre)); if (hit) dir = join(base, hit); } catch { /* no store */ }
  }
  if (sid && existsSync(join(dir, sid + '.jsonl'))) return { path: join(dir, sid + '.jsonl'), id: sid, by: 'session id' };
  try {
    const p = readdirSync(dir).filter((f) => f.endsWith('.jsonl')).map((f) => join(dir, f)).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
    return p ? { path: p, id: basename(p, '.jsonl'), by: 'the newest transcript of the project' } : null;
  } catch { return null; }
}
// Do this project's hooks run in this session? (session 101, bugs/138: Claude Code gives a folder without trust none of its hooks, skills or
// CLAUDE.md; wired is not running.) This hook records every session it runs in from its first prompt (UserPromptSubmit · PostToolUse; since
// bugs/142 — before it, only with a measurement, and the first tool call read «NOT running») — no record of this session = the hooks do not
// run here. Pure: (state, id) → { code, line }.
export function aliveLine(state, id) {
  if (state && state[id]) return { code: 0, line: `KAIF hooks: running in this session (${id}) — the context-window hook recorded it at ${state[id].at}.` };
  return { code: 1, line: `KAIF hooks: NOT running in this session (${id}) — wired, yet the agent system ran none of them. Tell the owner first: ` +
    'Claude Code gives a folder without trust none of its hooks, skills or CLAUDE.md — reload the VS Code window and answer its window ' +
    '«Trust this folder in Claude Code?» with «Trust folder», then a new chat.' };
}
export function measureLine(used, win, cfg = {}) {
  const closePct = Number(cfg.closePct) > 0 ? Number(cfg.closePct) : DEFAULTS.closePct;
  const pct = Math.floor((used / win) * 100), may = pct >= closePct;
  return { pct, closePct, may, line: `KAIF context: the window is ${pct} % full (${used} of ${win} tokens); the closing level is ${closePct} % — ` +
    (may ? 'the window may close the chat.' : 'too early to close the chat by the window: keep working.') };
}

function projectRoot(cwd) {
  for (let d = resolve(cwd || '.'); ;) {
    if (existsSync(join(d, DEPLOYMENT))) return d;
    const up = dirname(d);
    if (up === d) return resolve(cwd || '.');
    d = up;
  }
}
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8').replace(/^\uFEFF/, '')); } catch { return null; } };
function tailOf(p) {
  const fd = openSync(p, 'r');
  try {
    const size = fstatSync(fd).size, n = Math.min(size, TAIL_BYTES), buf = Buffer.alloc(n);
    readSync(fd, buf, 0, n, size - n);
    return buf.toString('utf8');
  } finally { closeSync(fd); }
}

if (process.argv[2] === '--selftest') {
  let bad = 0; const ok = (c, n) => { if (!c) { bad++; console.log('  x ' + n); } else console.log('  v ' + n); };
  const cfg = {};
  // the four steps of decision №161 (interview 049, Q1): 75 · 80 · 85 · 92
  ok(decide(749000, LARGE, cfg) === null, '74 % — silence');
  const w = decide(750000, LARGE, cfg);
  ok(w && w.level === 75 && w.kind === 'warn' && !/clos|wrap|finish|end-chat|stop|cut/i.test(w.line) && /tell the owner once by voice/.test(w.line),
    '75 % — a warning without a closing word, told to the owner by voice (№161; interview 047, Q6 = B)');
  ok(decide(790000, LARGE, cfg, [75]) === null, '79 % after the 75 % line — silence (once per step)');
  const u = decide(800000, LARGE, cfg, [75]);
  ok(u && u.level === 80 && u.kind === 'cut' && /logical cut/.test(u.line) && /no new heavy task/.test(u.line) && !/end-chat/.test(u.line)
    && /soft closure comes at 85 %/.test(u.line), '80 % — bring the work to a logical cut, no closing skill yet (№161)');
  const c = decide(851000, LARGE, cfg, [75, 80]);
  ok(c && c.level === 85 && c.kind === 'close' && /logical cut/.test(c.line) && /\/end-chat-soft/.test(c.line) && /Never a forced/.test(c.line),
    '85 % — start /end-chat-soft, the work finished to its cut first (№161)');
  const f = decide(921000, LARGE, cfg, [75, 80, 85]);
  ok(f && f.level === 92 && f.kind === 'force' && /finish it quickly/.test(f.line) && /\/end-chat-force/.test(f.line)
    && decide(950000, LARGE, cfg, [75, 80, 85, 92]) === null, '92 % — finish the soft closure quickly or start /end-chat-force; then silence (№161)');
  { const j = decide(860000, LARGE, cfg, []), old = decide(860000, LARGE, cfg, [80, 85]);
    ok(j && j.level === 85 && j.kind === 'close' && j.levels.join() === '75,80,85' && old === null,
      'a jump 50 % → 86 % says ONE line, the highest step, and marks the lower said; a state of the 80 / 85 edition says nothing lower'); }
  { const p = { warnPct: 70, closePct: 75 }, L = levelsOf(p).map((l) => l.kind + l.at).join(' ');
    ok(L === 'warn70 close75 force82' && decide(140000, SMALL, p).kind === 'warn' && decide(150000, SMALL, p, [70]).kind === 'close'
      && levelsOf({}).map((l) => l.at).join() === '75,80,85,92' && levelsOf({ closePct: 90 }).map((l) => l.at).join() === '80,85,90,97',
      'the project\'s own steps (70 / 75 → warning 70 · closing 75 · forced 82, no cut step) and the owner\'s spacing around its closePct'); }
  { const kept = keptLevels(200000, LARGE, [75, 80, 85]), again = decide(750000, LARGE, cfg, keptLevels(750000, LARGE, kept));
    ok(kept.length === 0 && keptLevels(870000, LARGE, [75, 80, 85]).length === 3 && again && again.level === 75,
      'after a compaction (87 % → 20 %) the levels re-arm: the 75 % warning comes again when the window refills'); }
  const rec = (u, side = false) => JSON.stringify({ type: 'assistant', isSidechain: side, message: { model: 'claude-opus-5-5', usage: u } });
  const t = [rec({ input_tokens: 2, cache_read_input_tokens: 780000, cache_creation_input_tokens: 2600 }), rec({ input_tokens: 9, cache_read_input_tokens: 10 }, true)].join('\n');
  const lu = lastUsage(t);
  ok(lu && lu.used === 782602 && lu.model === 'claude-opus-5-5', 'usage = input + cache_creation + cache_read of the last MAIN-thread answer (a subagent\'s is skipped)');
  ok(windowOf({ model: 'claude-opus-5-5' }) === LARGE && windowOf({ model: 'claude-opus-4-6' }) === SMALL && windowOf({ model: 'claude-opus-4-6[1m]' }) === LARGE
    && windowOf({ model: 'claude-haiku-5-5' }) === LARGE && windowOf({ model: 'claude-sonnet-4-6' }) === SMALL && windowOf({ model: 'claude-fable-5-1' }) === LARGE,
    'window: the vendor\'s 1M families (Opus 4.7+, Sonnet 5+, Haiku 5.5, Fable 5+) and the [1m] suffix → 1 000 000; others → 200 000');
  ok(windowOf({ model: 'claude-opus-5-5', env: { CLAUDE_CODE_DISABLE_1M_CONTEXT: '1' } }) === SMALL && windowOf({ model: 'x', tokens: 500000 }) === 500000
    && windowOf({ model: 'claude-opus-4-6', seen: 300000 }) === LARGE, 'window: the env switch, the project\'s tokens, and the floor «used > 200 000 ⇒ 1 000 000»');
  ok(windowOf({ model: 'claude-opus-5-5', tokens: 200000, seen: 300000 }) === 200000 && windowOf({ model: 'claude-haiku-5-20261001' }) === SMALL,
    'window: the project\'s tokens win over the floor; a date suffix is not a minor version (judge of session 97)');
  ok(fromSubagent({ hook_event_name: 'PostToolUse', agent_id: 'a1', agent_type: 'general-purpose' }) && !fromSubagent({ hook_event_name: 'PostToolUse' }),
    'a subagent\'s tool call (the event carries agent_id) — silence; the main agent\'s call — judged');
  { // the closing gate (session 100: closed «by the window» at 53 % by feeling)
    const sk = (skill, args = '', extra = {}) => ({ hook_event_name: 'PreToolUse', tool_name: 'Skill', tool_input: { skill, args }, ...extra });
    const d53 = closeGate(sk('end-chat-soft'), 531383, LARGE, cfg);
    ok(d53 && d53.hookSpecificOutput.permissionDecision === 'deny' && /53 % full/.test(d53.hookSpecificOutput.permissionDecisionReason)
      && /too early/.test(d53.hookSpecificOutput.permissionDecisionReason) && /owner: «/.test(d53.hookSpecificOutput.permissionDecisionReason),
      'gate: /end-chat-soft at 53 % without the owner\'s word — denied with the measured share and the way out');
    ok(closeGate(sk('end-chat-force'), 600000, LARGE, cfg) && closeGate(sk('kaif:end-chat-soft'), 600000, LARGE, cfg),
      'gate: /end-chat-force below the level and a plugin-prefixed name — denied too');
    ok(closeGate(sk('end-chat-soft', 'owner: «close the chat now»'), 531383, LARGE, cfg) === null && closeGate(sk('end-chat-soft'), 851000, LARGE, cfg) === null
      && closeGate(sk('end-chat-soft'), 150000, SMALL, { closePct: 75 }) === null,
      'gate: the owner\'s word in the args, 85 % and the project\'s own lower level — pass');
    ok(closeGate(sk('resume'), 100, LARGE, cfg) === null && closeGate({ ...sk('end-chat-soft'), tool_name: 'Read' }, 100, LARGE, cfg) === null
      && closeGate({ ...sk('end-chat-soft'), hook_event_name: 'PostToolUse' }, 100, LARGE, cfg) === null
      && closeGate(sk('end-chat-soft', '', { agent_id: 'a1' }), 100, LARGE, cfg) === null && closeGate(sk('end-chat-soft'), 0, LARGE, cfg) === null,
      'gate: another skill, another tool, another event, a subagent, nothing measured — no gate');
  }
  { // the agent's own measurement (session 101: hooks withheld from an untrusted folder — the closing step 0 measures by hand)
    const m53 = measureLine(531383, LARGE, cfg), m86 = measureLine(860000, LARGE, cfg), m75 = measureLine(150000, SMALL, { closePct: 75 });
    ok(!m53.may && /53 % full/.test(m53.line) && /too early/.test(m53.line) && m86.may && /may close/.test(m86.line) && m75.may,
      'measure: 53 % — too early; 86 % and the project\'s own lower level — may close');
    ok(slugOf('d:\\work\\ai_sandbox\\KAIF') === 'd--work-ai-sandbox-KAIF' && slugOf('/home/u/my.proj') === '-home-u-my-proj',
      'measure: the vendor\'s transcript folder name — every non-alphanumeric of the project path becomes «-»');
  }
  { // judge of session 101: the skill name as Claude Code runs it, and a `<synthetic>` record is no answer
    const sk = (skill, args = '') => ({ hook_event_name: 'PreToolUse', tool_name: 'Skill', tool_input: { skill, args } });
    ok(['/end-chat-soft', ' end-chat-soft', '/end-chat-force', 'a/b:end-chat-soft', '/end-chat-soft  '].every((n) => closeGate(sk(n), 531383, LARGE, cfg))
      && closeGate(sk('/end-chat-soft owner: «close the chat now»'), 531383, LARGE, cfg) === null,
      'gate: «/end-chat-soft», a padded name, «/end-chat-force», a folder prefix — denied; the owner\'s word after the name — pass');
    const rec = (model, input, read) => JSON.stringify({ type: 'assistant', message: { model, usage: { input_tokens: input, cache_read_input_tokens: read, cache_creation_input_tokens: 0 } } });
    const lu = lastUsage([rec('claude-opus-5-5', 42, 586000), rec('<synthetic>', 0, 0)].join('\n'));
    ok(lu && lu.used === 586042 && lu.model === 'claude-opus-5-5', 'measure: a `<synthetic>` zero-usage record at the tail is skipped — the last MODEL answer counts');
  }
  { // session 101 (bugs/138): wired is not running — this session's record in the hook's state
    const st = { 'sess-a': { said: [], seen: 1, at: '2026-11-17T12:00:00.000Z' } };
    const a0 = aliveLine(st, 'sess-a'), a1 = aliveLine(st, 'sess-b');
    ok(a0.code === 0 && /running in this session/.test(a0.line) && a1.code === 1 && /NOT running/.test(a1.line) && /Trust folder/.test(a1.line),
      'alive: this session recorded — exit 0; not recorded — exit 1 naming the owner\'s action «Trust folder»');
  }
  { // bugs/142: the hook itself, run as Claude Code runs it, records a session from its FIRST prompt — a transcript with no model answer
    // yet, or no transcript file yet; a subagent's event records nothing
    const dir = mkdtempSync(join(tmpdir(), 'kaif-cw-first-'));
    try {
      mkdirSync(join(dir, '.kaif'), { recursive: true }); writeFileSync(join(dir, DEPLOYMENT), '{}');
      const tp = join(dir, 'first.jsonl');
      writeFileSync(tp, JSON.stringify({ type: 'user', message: { role: 'user', content: 'resume' } }) + '\n');
      const run = (ev) => spawnSync(process.execPath, [fileURLToPath(import.meta.url)], { input: JSON.stringify(ev),
        env: { ...process.env, CLAUDE_PROJECT_DIR: dir }, encoding: 'utf8', timeout: 20000 });
      run({ hook_event_name: 'UserPromptSubmit', session_id: 'first-a', transcript_path: tp, cwd: dir });
      run({ hook_event_name: 'UserPromptSubmit', session_id: 'first-b', transcript_path: join(dir, 'not-yet.jsonl'), cwd: dir });
      run({ hook_event_name: 'PostToolUse', session_id: 'sub-c', agent_id: 'x1', transcript_path: tp, cwd: dir });
      const st = readJson(join(dir, STATE)) || {};
      ok(aliveLine(st, 'first-a').code === 0 && aliveLine(st, 'first-b').code === 0 && !st['sub-c'],
        'alive from the first prompt (bugs/142): no model answer yet, no transcript yet — recorded; a subagent\'s event — not');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  console.log(bad ? `selftest: ${bad} FAIL` : 'selftest: all ok');
  process.exit(bad ? 1 : 0);
}

if (process.argv[2] === '--alive') {   // never reads stdin: a hand command, not an event
  const root = process.env.CLAUDE_PROJECT_DIR || projectRoot(process.cwd());
  const marker = readJson(join(root, DEPLOYMENT)) || {};
  if (marker.hooks === 'off') { console.log('KAIF hooks: off by the owner\'s word (.kaif/kaif.json "hooks": "off") — nothing to judge.'); process.exit(2); }
  const wired = ['settings.json', 'settings.local.json'].some((f) => {
    const s = readJson(join(root, '.claude', f));
    return JSON.stringify((s && s.hooks && s.hooks.PostToolUse) || []).includes('context-window.mjs');
  });
  if (!wired) { console.log('KAIF hooks: the context-window hook is not wired on PostToolUse in .claude/settings.json — nothing to judge.'); process.exit(2); }
  const t = transcriptOf(root);
  if (!t) { console.log(`KAIF hooks: no transcript of this project in the vendor's store (${root}) — nothing to judge.`); process.exit(2); }
  const a = aliveLine(readJson(join(root, STATE)) || {}, t.id);
  console.log(`${a.line} (session by ${t.by})`);
  process.exit(a.code);
}

if (process.argv[2] === '--measure') {
  const root = process.env.CLAUDE_PROJECT_DIR || projectRoot(process.cwd());
  let tp = process.argv[3] || '';
  let by = 'the path given';   // said in the output: two live chats of one folder must not be mixed up silently (re-judge, N2)
  if (!tp) { const t = transcriptOf(root); tp = t ? t.path : ''; by = t ? t.by : by; }   // this session's transcript, else the project's newest
  const lu = tp && existsSync(tp) ? lastUsage(tailOf(tp)) : null;
  if (!lu) { console.log(`KAIF context: nothing to measure (${tp || 'no transcript found for ' + root}) \u2014 the window cannot close the chat; only the owner's word can.`); process.exit(2); }
  const marker = readJson(join(root, DEPLOYMENT)) || {};
  const cw = (marker.contextWindow && typeof marker.contextWindow === 'object') ? marker.contextWindow : {};
  const m = measureLine(lu.used, windowOf({ model: lu.model, env: process.env, tokens: cw.tokens, seen: lu.used }), cw);
  console.log(`${m.line} (transcript by ${by}: ${tp})`);
  process.exit(m.may ? 0 : 1);
}

try {
  const ev = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, '') || '{}');
  // bugs/142 (2.10): the session's PRESENCE is recorded on every event of the main thread from its first prompt — even before the transcript
  // holds a model answer with usage, or exists at all. The record used to come only with a measurement, so the first tool call of a session
  // ran `--alive` before any record could exist and said «NOT running» while the hooks ran. The levels are still judged only by a measurement.
  // [TESTED: 2026-11-18 · functional — tools/sandbox/probes/bugs142-first-prompt-alive.mjs: this hook run as Claude Code runs it on a first
  //  prompt (a transcript without a model answer · no transcript yet) — both sessions «--alive exit 0»; the HEAD hook — both «exit 1»; the
  //  source's live session — `--alive` exit 0; hygiene — the selftest case «alive from the first prompt», mutants G7 · G8 red on exactly it;
  //  the first call of a NEW chat — not observed (the DONE condition of bugs/142); report testcases/reports/2026-11-18_bugs141-142-decision-name-and-alive.md]
  if (typeof ev.session_id === 'string' && ev.session_id && !fromSubagent(ev)) {
    const root = process.env.CLAUDE_PROJECT_DIR || projectRoot(ev.cwd);
    const marker = readJson(join(root, DEPLOYMENT)) || {};
    const cw = (marker.contextWindow && typeof marker.contextWindow === 'object') ? marker.contextWindow : {};
    const lu = ev.transcript_path && existsSync(ev.transcript_path) ? lastUsage(tailOf(ev.transcript_path)) : null;
    const id = ev.session_id, all = readJson(join(root, STATE)) || {};
    const st = all[id] || { said: [], seen: 0 };
    let d = null;
    if (lu) {
      st.seen = Math.max(st.seen || 0, lu.used);
      const win = windowOf({ model: lu.model, env: process.env, tokens: cw.tokens, seen: st.seen });
      const gate = closeGate(ev, lu.used, win, cw);
      if (gate) { process.stdout.write(JSON.stringify(gate)); process.exit(0); }
      if (ev.hook_event_name === 'PreToolUse') process.exit(0);   // the gate's event says nothing else — the levels speak on the others
      st.said = keptLevels(lu.used, win, st.said || []);
      d = decide(lu.used, win, cw, st.said);
      if (d) st.said = [...new Set([...st.said, ...d.levels])];
    } else if (ev.hook_event_name === 'PreToolUse') process.exit(0);   // nothing to measure: the gate does not block; presence comes on the others
    all[id] = { ...st, at: new Date().toISOString() };
    const ids = Object.keys(all).sort((a, b) => String(all[b].at).localeCompare(String(all[a].at))).slice(0, SESSIONS_KEPT);
    const kept = {}; for (const k of ids) kept[k] = all[k];
    const p = join(root, STATE); mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p + '.tmp', JSON.stringify(kept)); renameSync(p + '.tmp', p);
    if (d) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: ev.hook_event_name, additionalContext: d.line } }));
  }
} catch { /* a hook never breaks the session */ }
process.exit(0);
