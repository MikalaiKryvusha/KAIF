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
// Kimi addition (bugs/150, decisions №166–167): Kimi steps are 70 · 75 · 80 · 90 % of the compaction point. A soft entry never
// satisfies force; after force only STATUS/FAREWELL, date and git/commit handover commands pass. PostCompact rearms measurement,
// but compaction is an incident, not acceptance. A hard auto-compaction prohibition belongs to the engine (`auto_compact = false`).
// The window size: no hook event carries it (vendor hooks reference); the rule — the project's `.kaif/kaif.json` → `contextWindow.tokens`
// wins; else `CLAUDE_CODE_DISABLE_1M_CONTEXT=1` → 200 000; else the model of the record: a `[1m]` suffix, or a family the vendor runs
// with 1M by default (Fable 5 and later, Sonnet 5 and later, Haiku 5.5, Opus 4.7 and later — code.claude.com/docs/en/model-config) →
// 1 000 000; else 200 000 — and never less than the usage seen (used > 200 000 ⇒ the window is 1 000 000).
// Thresholds: `contextWindow.warnPct` · `cutPct` · `closePct` · `forcePct` — the project states them (levelsOf); state per session in .kaif/context-window.json.
// It blocks ONE thing (the closing gate, PreToolUse · matcher Skill): a closing skill — /end-chat-soft or /end-chat-force — called while the
// window is below closePct and without the owner's word in the skill's args (`owner: «<his words asking to close>»`) is denied with the
// measured share; the agent keeps working. Origin: the source's session 100 closed «by the window» at 53 % by feeling, and a field deployment
// carried the same gate after closing at 68 % «by the feeling of the limit» (its owner: you closed the chat too early again — fix the hook);
// nothing to measure (no transcript, no usage) — the gate does not block. The Claude branch never stops a turn otherwise; Kimi's repeated
// closure refusal is the named exception above. Any internal error → exit 0 silently. Lines are English: the agent reads them.
// [TESTED: 2026-11-22 · bugs/150 hygiene only — closureRequirement boundaries, repeated PreToolUse, closure entry, owner-prompt re-arm,
//  PostCompact reset, forced level; mutants K4/K5 red on exactly their cases; deployed hook green in s14. Live refill after the fix: NOT observed]
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
export const KIMI_DEFAULTS = { warnPct: 70, cutPct: 75, closePct: 80, forcePct: 90 };   // decision №167 of the origin
export const kimiThresholds = (cfg = {}) => ({ ...KIMI_DEFAULTS, ...cfg });
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
export const kimiUsedOf = (u) => (u ? (Number(u.inputOther) || 0) + (Number(u.inputCacheCreation) || 0) + (Number(u.inputCacheRead) || 0) : 0);
// The session's model is not always known to the hook (Kimi's measured record carries none): then Kimi's own `default_model` (a top-level
// key, before the first table) names it — without it the window fell to the generic 1 000 000 floor (session 104, a real Kimi wire).
export function kimiDefaultModel(configText) {
  const m = /^\s*default_model\s*=\s*"([^"]+)"/m.exec(String(configText).split(/^\[/m)[0]);   // the text before the first table
  return m ? m[1] : '';
}
export function kimiConfiguredWindow(model, configText) {
  const names = new Set([String(model || ''), String(model || '').split('/').pop()].filter(Boolean));
  for (const section of String(configText).split(/(?=^\[)/m)) {
    const header = /^\[models\."([^"]+)"\]/.exec(section);
    if (!header || ![...names].some((name) => header[1] === name || header[1].endsWith('/' + name))) continue;
    const m = /^\s*max_context_size\s*=\s*(\d+)\s*$/m.exec(section);
    if (m) return Number(m[1]);
  }
  return null;
}

// Kimi compacts the context BY ITSELF before every step once used ≥ ratio · window OR used + reserved ≥ window (agent-core-v2
// fullCompaction/strategy.ts:18-28, 118-134; the same code in the installed 2.7.2 bundle): ratio = [loop_control] compaction_trigger_ratio
// (0.5..0.99, default 0.85), reserved = [loop_control] reserved_context_size (default 50 000). The KAIF steps under Kimi are counted against
// that point, not the whole window — the cut and the soft closure come before stock Kimi's compaction. This hook only reads the
// trigger; the later hard prohibition (decision №168) belongs to the engine's `auto_compact = false`, not to observation-only PreCompact. Pure: (window, Kimi config text) → the token count where Kimi compacts.
export const KIMI_COMPACTION = { ratio: 0.85, reserved: 50000 };
export function kimiCompactionPoint(win, configText = '') {
  const lc = String(configText).split(/(?=^\[)/m).find((s) => /^\[loop_control\]\s*$/m.test(s.split('\n')[0])) || '';
  const num = (k) => { const m = new RegExp(`^\\s*${k}\\s*=\\s*([0-9._]+)\\s*(?:#.*)?$`, 'm').exec(lc); return m ? Number(m[1].replaceAll('_', '')) : null; };
  const r = num('compaction_trigger_ratio'), res = num('reserved_context_size');
  const ratio = r !== null && r >= 0.5 && r <= 0.99 ? r : KIMI_COMPACTION.ratio;
  const reserved = res !== null && res >= 0 ? res : KIMI_COMPACTION.reserved;
  let point = Math.floor(win * ratio);
  if (reserved > 0 && reserved < win) point = Math.min(point, win - reserved);
  return point;
}

// [NOT-TESTED: 2026-11-21 15:22 +03:00 the script was proven by events fed to it directly (s14); Kimi itself never ran its PostToolUse entry —
//  the fragment's matcher was «*» (bugs/145); the live run is plans/143 KA9] Kimi's display count is a record of its own.
export function lastKimiContext(text) {
  const lines = String(text).split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!/token_counting\.measured|usage\.record|context\.apply_compaction/.test(lines[i])) continue;
    try {
      const r = JSON.parse(lines[i]);
      if (r.agentId !== 'main') continue;
      if (r.type === 'context.apply_compaction') return null;
      if (r.type === 'token_counting.measured' && Number(r.tokens) > 0) return { used: Number(r.tokens), model: '' };
      if (r.type === 'usage.record' && kimiUsedOf(r.usage) > 0) return { used: kimiUsedOf(r.usage), model: String(r.model || '') };
    } catch { /* a torn line at the cut of the tail */ }
  }
  return null;
}

export function kimiWireOf(id, home = process.env.KIMI_CODE_HOME || join(homedir(), '.kimi-code')) {
  const base = join(home, 'sessions');
  const ids = id.startsWith('session_') ? [id] : [id, `session_${id}`];
  try {
    for (const workdir of readdirSync(base)) {
      for (const session of ids) {
        const p = join(base, workdir, session, 'agents', 'main', 'wire.jsonl');
        if (existsSync(p)) return p;
      }
    }
  } catch { /* no Kimi session store */ }
  return '';
}

// A hand command may lack the agent's session id (observed in Kimi's VS Code tools): use the newest session of THIS project,
// never a newer-looking record of the other agent system. The output names this fallback; simultaneous chats remain ambiguous.
export function latestKimiSession(root, home = process.env.KIMI_CODE_HOME || join(homedir(), '.kimi-code')) {
  const base = join(home, 'sessions'), same = (a, b) => {
    const x = resolve(a), y = resolve(b);
    return process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y;
  };
  let found = null;
  try {
    for (const workdir of readdirSync(base)) {
      for (const id of readdirSync(join(base, workdir))) {
        const dir = join(base, workdir, id), wire = join(dir, 'agents', 'main', 'wire.jsonl'), state = readJson(join(dir, 'state.json'));
        if (!state || !state.cwd || !same(state.cwd, root) || !existsSync(wire)) continue;
        const mtimeMs = statSync(wire).mtimeMs;
        if (!found || mtimeMs > found.mtimeMs || (mtimeMs === found.mtimeMs && id > found.id)) found = { id, path: wire, mtimeMs };
      }
    }
  } catch { /* no Kimi session store */ }
  return found;
}
function kimiFallbackId(root, home) {
  const marker = readJson(join(root, DEPLOYMENT)) || {};
  if (!Array.isArray(marker.agents) || !marker.agents.includes('kimi-code')) return '';
  const k = latestKimiSession(root, home);
  if (!k) return '';
  const t = transcriptOf(root);
  return !t || k.mtimeMs >= statSync(t.path).mtimeMs ? k.id : '';
}
// With no system id, a newer Claude transcript must not become evidence for an existing Kimi session. Claude-only projects keep their route.
function kimiFallbackConflict(root, home) {
  const marker = readJson(join(root, DEPLOYMENT)) || {};
  if (!Array.isArray(marker.agents) || !marker.agents.includes('kimi-code')) return null;
  const k = latestKimiSession(root, home), t = transcriptOf(root);
  return k && t && k.mtimeMs < statSync(t.path).mtimeMs ? { kimi: k.id, claude: t.id } : null;
}

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
export function closingCall(ev) {
  if (!ev || ev.hook_event_name !== 'PreToolUse' || ev.tool_name !== 'Skill' || fromSubagent(ev)) return null;
  const ti = ev.tool_input || {};
  // the name as Claude Code runs it (judge of session 101): it trims the name and drops a leading «/», a plugin or folder prefix ends at «:» —
  // so «/end-chat-soft», « end-chat-soft» and «a/b:end-chat-soft» are the same call. Words after the name: Claude Code looks the whole string
  // up and would not run such a skill (re-judge, N1); the gate still reads them as args — the safe direction, nothing passes by them
  const [name, ...rest] = String(ti.skill || ti.name || '').trim().replace(/^\/+/, '').split(/\s+/);
  const m = /^(?:[^\s:]+:)?end-chat-(soft|force)$/.exec(name || '');
  return m ? { kind: m[1], args: `${ti.args || ''} ${rest.join(' ')}` } : null;
}
export function closeGate(ev, used, win, cfg = {}) {
  const call = closingCall(ev);
  if (!call || OWNER_WORD.test(call.args) || !(used > 0) || !(win > 0)) return null;
  const closePct = Number(cfg.closePct) > 0 ? Number(cfg.closePct) : DEFAULTS.closePct;
  const pct = Math.floor((used / win) * 100);
  if (pct >= closePct) return null;
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason:
    `KAIF context: the window is ${pct} % full (${used} of ${win} tokens) — below the closing level ${closePct} %: it is too early to close ` +
    `the chat by the window; keep working. Closing at the owner's word — pass his words verbatim in the skill's args: owner: «<his words>».` } };
}

// bugs/150: a one-time order is not a closure contour. Above the threshold ordinary work is refused on EVERY Kimi PreToolUse until the
// matching closing skill is entered; a new owner prompt re-arms the requirement, and only PostCompact clears it for the same chat.
export function closureRequirement(used, win, cfg = {}) {
  if (!(used > 0) || !(win > 0)) return null;
  const pct = Math.floor((used / win) * 100), L = levelsOf(cfg);
  if (pct >= atOf(L, 'force')) return 'force';
  if (pct >= atOf(L, 'close')) return 'soft';
  return null;
}
export const closureSatisfied = (required, closing) => required === 'force' ? closing === 'force' : required === 'soft' ? Boolean(closing) : true;
const FORCE_FILES = new Set(['status.md', 'farewell_message_from_the_previous_chat.md']);
export function forceClosureTool(ev) {
  if (!ev || ev.hook_event_name !== 'PreToolUse') return false;
  const input = ev.tool_input || {};
  if (['Read', 'Write', 'Edit'].includes(ev.tool_name)) {
    return FORCE_FILES.has(basename(String(input.path || '').replaceAll('\\', '/')).toLowerCase());
  }
  if (ev.tool_name !== 'Bash') return false;
  const command = String(input.command || '').trim();
  if (!command || /[;&|]/.test(command)) return false;
  return /^(?:git\s+(?:status|diff|log|add|commit|push)(?:\s|$)|node\s+tools\/commit\.mjs(?:\s|$)|date(?:\s|$))/.test(command);
}
export const FORCE_WORK_REFUSAL = 'KAIF force closure: only STATUS.md, FAREWELL_MESSAGE_FROM_THE_PREVIOUS_CHAT.md, date and the git/commit commands of the handover are allowed. Ordinary work is refused; finish /skill:end-chat-force now.';
export function closureDemand(kind, used, win, cfg = {}) {
  const L = levelsOf(cfg), pct = Math.floor((used / win) * 100), lineKind = kind === 'soft' ? 'close' : kind;
  return LINES[lineKind](pct, used, win, L).replaceAll('/end-chat-soft', '/skill:end-chat-soft').replaceAll('/end-chat-force', '/skill:end-chat-force') +
    ' Ordinary work is refused until this closing skill is entered; after entering it, finish the closure and take no new task.';
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
  ok(kimiUsedOf({ inputOther: 1243, inputCacheRead: 302080, inputCacheCreation: 0, output: 1542 }) === 303323,
    'Kimi usage = inputOther + inputCacheCreation + inputCacheRead; output is not counted');
  ok(kimiConfiguredWindow('kimi-code/k3.1-pro', '[models."kimi-code/k3.1-pro"]\nmax_context_size = 1048576\n') === 1048576
    && kimiConfiguredWindow('k3', '[models."kimi-code/k3"]\nmax_context_size = 262144\n') === 262144,
    'Kimi window: max_context_size is read for the full alias or its model name');
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
  { // Kimi emits the display count during a turn, before Stop; a compaction invalidates every older count.
    const usage = JSON.stringify({ type: 'usage.record', agentId: 'main', model: 'kimi-code/k3.1-pro', usage: { inputOther: 5486, inputCacheRead: 891014, inputCacheCreation: 0 } });
    const measured = JSON.stringify({ type: 'token_counting.measured', agentId: 'main', tokens: 891655 });
    const compacted = JSON.stringify({ type: 'context.apply_compaction', agentId: 'main', tokensAfter: 23531 });
    const lu = lastKimiContext([usage, measured].join('\n'));
    ok(lu && lu.used === 891655 && lastKimiContext([usage, measured, compacted].join('\n')) === null,
      'Kimi: token_counting.measured wins; records before a compaction are stale');

    // Kimi's own compaction point (№164, D1): 0.85 · window or window − 50 000, whichever is lower; [loop_control] moves it
    ok(kimiCompactionPoint(1048576, '') === 891289 && kimiCompactionPoint(262144, '') === 212144
      && kimiCompactionPoint(1048576, '[loop_control]\ncompaction_trigger_ratio = 0.95\n') === 996147
      && kimiCompactionPoint(1048576, '[loop_control]\nreserved_context_size = 0\n') === 891289
      && kimiCompactionPoint(1048576, '[models."x"]\nreserved_context_size = 900000\n') === 891289,
      'Kimi compaction point: min(0.85 · W, W − 50 000); compaction_trigger_ratio and reserved_context_size are read from [loop_control] only');
    { const cfgK = 'default_model = "kimi-code/k3.1-pro"\n\n[models."kimi-code/k3.1-pro"]\nmax_context_size = 1048576\n';
      ok(kimiDefaultModel(cfgK) === 'kimi-code/k3.1-pro' && kimiConfiguredWindow(kimiDefaultModel(cfgK), cfgK) === 1048576
        && kimiDefaultModel('[models."x"]\ndefault_model = "y"\n') === '',
        'Kimi window without a known model: default_model (top level only) names it — 1 048 576, not the generic floor'); }
    { const good = '[thinking]\neffort = "high"\n\n[[hooks]]\nevent = "PostToolUse"\ncommand = "node .kaif/hooks/context-window.mjs --kimi"\n',
        star = good + '\n[[hooks]]\nevent = "PostToolUse"\nmatcher = "*"\ncommand = "node .kaif/hooks/knowledge-moment.mjs --kimi"\n'
          + '\n[[hooks]]\nevent = "Notification"\nmatcher = "*"\ncommand = "terminal-notifier"\n';
      const a = kimiWiring(good), b = kimiWiring(star), c = kimiWiring('[[hooks]]\nevent = "Stop"\ncommand = "node other.mjs"\n');
      ok(a.wired && a.star === 0 && b.wired && b.star === 1 && !c.wired,
        `Kimi wiring (KA4): the window hook found in config.toml; a KAIF entry with matcher "*" counted, the owner's own entry not — ${JSON.stringify({ a, b, c })}`);
      const d = kimiWiring('[[hooks]]\nevent = "PostToolUse"\ncommand = "node \\"C:/Users/o/.kimi-code/kaif/kimi-hook.mjs\\" context-window.mjs --kimi"\n');
      ok(d.wired, `Kimi wiring (KA2): an entry routed through the dispatcher kimi-hook.mjs counts as the window hook — ${JSON.stringify(d)}`); }

    const dir = mkdtempSync(join(tmpdir(), 'kaif-cw-kimi-'));
    try {
      const home = join(dir, 'home'), root = join(dir, 'project');
      mkdirSync(join(root, '.kaif'), { recursive: true });
      writeFileSync(join(root, DEPLOYMENT), JSON.stringify({ contextWindow: { tokens: 1048576 } }));
      const tp = join(home, 'sessions', 'wd_test', 'session_live', 'agents', 'main', 'wire.jsonl');
      const at = (n) => JSON.stringify({ type: 'token_counting.measured', agentId: 'main', tokens: n });
      mkdirSync(dirname(tp), { recursive: true }); writeFileSync(tp, usage + '\n' + at(760000) + '\n');
      const run = (event, extra = {}) => spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--kimi'], {
        input: JSON.stringify({ hook_event_name: event, session_id: 'session_live', cwd: root, ...extra }),
        env: { ...process.env, KIMI_CODE_HOME: home }, encoding: 'utf8', timeout: 20000 });
      const kThresholds = kimiThresholds();
      ok(levelsOf(kThresholds).map((l) => l.at).join() === '70,75,80,90'
        && decide(623902, 891289, kThresholds) === null && decide(623903, 891289, kThresholds).kind === 'warn'
        && decide(668466, 891289, kThresholds, [70]) === null && decide(668467, 891289, kThresholds, [70]).kind === 'cut'
        && decide(713031, 891289, kThresholds, [70, 75]) === null && decide(713032, 891289, kThresholds, [70, 75]).kind === 'close'
        && decide(802160, 891289, kThresholds, [70, 75, 80]) === null && decide(802161, 891289, kThresholds, [70, 75, 80]).kind === 'force',
        'Kimi steps (№167): 70 / 75 / 80 / 90 %; minimum tokens 623903 / 668467 / 713032 / 802161, one token below stays below');
      ok(closureRequirement(713031, 891289, kThresholds) === null && closureRequirement(713032, 891289, kThresholds) === 'soft'
        && closureRequirement(802160, 891289, kThresholds) === 'soft' && closureRequirement(802161, 891289, kThresholds) === 'force'
        && closureSatisfied('soft', 'soft') && closureSatisfied('soft', 'force') && !closureSatisfied('force', 'soft') && closureSatisfied('force', 'force'),
        'Kimi closure requirement: close 80 %, force 90 %; a soft entry never satisfies force');
      // 760 000 of Kimi's point 891 289 = 85 % — the soft closure, found on PostToolUse (whose text reaches nobody in Kimi)
      const post = run('PostToolUse'), pre = run('PreToolUse', { tool_name: 'Read' }), again = run('PreToolUse', { tool_name: 'Read' });
      ok(post.status === 0 && post.stdout === '' && pre.status === 2 && /\/skill:end-chat-soft/.test(pre.stderr)
        && /85 % full \(760000 of 891289 tokens\)/.test(pre.stderr) && /The step of 80 %/.test(pre.stderr)
        && again.status === 2 && /Ordinary work is refused/.test(again.stderr),
      `Kimi closure latch at 85 %: every ordinary PreToolUse is refused until the soft closure is entered — ${JSON.stringify({ post: post.stdout, pre: pre.stderr.slice(0, 200), again: again.stderr.slice(0, 200) })}`);
      const enter = run('PreToolUse', { tool_name: 'Skill', tool_input: { skill: 'end-chat-soft' } });
      const closureWork = run('PreToolUse', { tool_name: 'Read' });
      ok(enter.status === 0 && closureWork.status === 0,
        'Kimi closure latch: entering end-chat-soft opens the tools of the closure itself');
      const newPrompt = run('UserPromptSubmit', { prompt: 'resume\nnew work' });
      const rearmed = run('PreToolUse', { tool_name: 'Read' });
      ok(newPrompt.status === 0 && /\/skill:end-chat-soft/.test(newPrompt.stdout) && rearmed.status === 2,
        'Kimi closure latch: a new owner prompt re-arms an unfinished closure instead of allowing new work');
      run('PreToolUse', { tool_name: 'Skill', tool_input: { skill: 'end-chat-soft' } });
      writeFileSync(tp, usage + '\n' + at(760000) + '\n' + compacted + '\n');
      const pc = run('PostCompact'), stale = run('PostToolUse'), quiet = run('PreToolUse', { tool_name: 'Read' });
      writeFileSync(tp, usage + '\n' + at(760000) + '\n' + compacted + '\n' + at(670000) + '\n');
      const refill = run('PostToolUse'), prompt = run('UserPromptSubmit', { prompt: 'go on' });
      ok(pc.stdout === '' && stale.stdout === '' && quiet.status === 0 && refill.stdout === ''
        && /75 % full \(670000 of 891289 tokens\)/.test(prompt.stdout) && /logical cut/.test(prompt.stdout) && /soft closure comes at 80 %/.test(prompt.stdout),
        `Kimi after a compaction: old counts and the closure latch stay cleared; a fresh 75 % of the point waits and is said on the next prompt — ${JSON.stringify({ pc: pc.stdout, stale: stale.stdout, prompt: prompt.stdout.slice(0, 200) })}`);
      const stop = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--kimi'], {
        input: JSON.stringify({ hook_event_name: 'Stop', session_id: 'session_stop', cwd: root, usage: { inputOther: 760000, inputCacheRead: 0, inputCacheCreation: 0 } }),
        env: { ...process.env, KIMI_CODE_HOME: home }, encoding: 'utf8', timeout: 20000 });
      ok(stop.status === 2 && /\/skill:end-chat-soft/.test(stop.stderr), 'Kimi Stop at 85 % of the point: exit 2 — a continuation turn with the soft closure');
      const forceUsage = { inputOther: 825330, inputCacheRead: 0, inputCacheCreation: 0 };
      const softUsage = { inputOther: 760000, inputCacheRead: 0, inputCacheCreation: 0 };
      const softEscalation = run('PreToolUse', { tool_name: 'Skill', tool_input: { skill: 'end-chat-soft' }, usage: softUsage, session_id: 'session_escalate' });
      const escalation = run('PreToolUse', { tool_name: 'Read', usage: forceUsage, session_id: 'session_escalate' });
      const wrongSoft = run('PreToolUse', { tool_name: 'Skill', tool_input: { skill: 'end-chat-soft' }, usage: forceUsage, session_id: 'session_escalate' });
      const forceEscalation = run('PreToolUse', { tool_name: 'Skill', tool_input: { skill: 'end-chat-force' }, usage: forceUsage, session_id: 'session_escalate' });
      ok(softEscalation.status === 0 && escalation.status === 2 && /\/skill:end-chat-force/.test(escalation.stderr)
        && wrongSoft.status === 2 && forceEscalation.status === 0,
        'Kimi soft-to-force escalation: a prior soft entry and another soft call do not open ordinary work at 92 %');
      const forceStop = run('Stop', { session_id: 'session_force', usage: forceUsage });
      const forcePre = run('PreToolUse', { tool_name: 'Read', usage: forceUsage, session_id: 'session_force' });
      const forceEnter = run('PreToolUse', { tool_name: 'Skill', tool_input: { skill: 'end-chat-force' }, usage: forceUsage, session_id: 'session_force' });
      const statusRead = run('PreToolUse', { tool_name: 'Read', tool_input: { path: 'STATUS.md' }, usage: forceUsage, session_id: 'session_force' });
      const ordinaryRead = run('PreToolUse', { tool_name: 'Read', tool_input: { path: 'README.md' }, usage: forceUsage, session_id: 'session_force' });
      const gitStatus = run('PreToolUse', { tool_name: 'Bash', tool_input: { command: 'git status --short' }, usage: forceUsage, session_id: 'session_force' });
      const build = run('PreToolUse', { tool_name: 'Bash', tool_input: { command: 'node tools/build-framework.mjs' }, usage: forceUsage, session_id: 'session_force' });
      ok(forceStop.status === 2 && /\/skill:end-chat-force/.test(forceStop.stderr) && forcePre.status === 2 && forceEnter.status === 0,
        'Kimi closure latch at 92 %: Stop and ordinary work require end-chat-force; entering it passes');
      ok(statusRead.status === 0 && gitStatus.status === 0 && ordinaryRead.status === 2 && build.status === 2
        && /only STATUS\.md/.test(ordinaryRead.stderr) && /Ordinary work is refused/.test(build.stderr),
        'Kimi post-force contour: STATUS and git handover pass; README and build are refused');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  console.log(bad ? `selftest: ${bad} FAIL` : 'selftest: all ok');
  process.exit(bad ? 1 : 0);
}

// Kimi (plans/143 KA4 of the origin): use KIMI_CODE_SESSION_ID where the command environment carries it; the VS Code tool environment was
// observed without it, so the newest session of this project is the named fallback (bugs/147). Kimi's hooks are wired in the user-level
// ~/.kimi-code/config.toml, never in .claude/settings.json — `--alive` and `--measure` judge Kimi by Kimi's files.
// Pure: (config text) → { wired, star } — is the window hook wired, and how many KAIF entries carry the matcher Kimi never fires (bugs/145).
// [TESTED: 2026-11-21 · selftest case «Kimi wiring (KA4)»; functional — `--alive` / `--measure` with KIMI_CODE_SESSION_ID of two REAL Kimi
//  sessions of the origin on the owner's machine: the recorded one exit 0, the unrecorded one exit 1 with Kimi's action; --measure read the
//  real wire (447 025 tokens); report testcases/reports/2026-11-21_ki-ka1-ka3-kimi-hooks-and-window.md]
export function kimiWiring(configText) {
  const entries = String(configText).split(/^\[\[hooks\]\][ \t]*\r?$/m).slice(1).map((e) => e.split(/^\[/m)[0]);
  const ours = entries.filter((e) => /\.kaif[\\/]hooks[\\/]|kimi-hook\.mjs/.test(e));   // a hand merge, or `wire-hooks --kimi` (the dispatcher, KA2)
  return { wired: ours.some((e) => /context-window\.mjs/.test(e) && /^\s*event\s*=\s*"(?:PostToolUse|UserPromptSubmit|Stop)"/m.test(e)),
    star: ours.filter((e) => /^\s*matcher\s*=\s*"\*"/m.test(e)).length };
}
const kimiIds = (sid) => [...new Set([sid, sid.startsWith('session_') ? sid.slice(8) : `session_${sid}`])];
const handRoot = process.env.CLAUDE_PROJECT_DIR || projectRoot(process.cwd());
const handKimiHome = process.env.KIMI_CODE_HOME || join(homedir(), '.kimi-code');
const handKimiId = process.env.KIMI_CODE_SESSION_ID || (!process.env.CLAUDE_CODE_SESSION_ID && ['--alive', '--measure'].includes(process.argv[2]) ? kimiFallbackId(handRoot, handKimiHome) : '');
const handKimiBy = process.env.KIMI_CODE_SESSION_ID ? 'session id' : 'the newest Kimi session of the project';
const handConflict = !process.env.KIMI_CODE_SESSION_ID && !process.env.CLAUDE_CODE_SESSION_ID && !handKimiId && ['--alive', '--measure'].includes(process.argv[2])
  ? kimiFallbackConflict(handRoot, handKimiHome) : null;
if (handConflict) {
  console.log(`KAIF session: ambiguous without an agent session id — Kimi ${handConflict.kimi} is older than Claude ${handConflict.claude}; ` +
    'neither is evidence for the current session. Set KIMI_CODE_SESSION_ID (Kimi) or CLAUDE_CODE_SESSION_ID (Claude), or use the newest session.');
  process.exit(2);
}
if (handKimiId && (process.argv[2] === '--alive' || process.argv[2] === '--measure')) {
  const sid = handKimiId, root = handRoot, home = handKimiHome;
  let configText = '';
  try { configText = readFileSync(join(home, 'config.toml'), 'utf8'); } catch { /* no Kimi config */ }
  const marker = readJson(join(root, DEPLOYMENT)) || {};
  const cw = (marker.contextWindow && typeof marker.contextWindow === 'object') ? marker.contextWindow : {};
  if (process.argv[2] === '--alive') {
    if (marker.hooks === 'off') { console.log('KAIF hooks: off by the owner\'s word (.kaif/kaif.json "hooks": "off") — nothing to judge.'); process.exit(2); }
    const w = kimiWiring(configText);
    if (!w.wired) { console.log(`KAIF hooks: the context-window hook is not wired in ${join(home, 'config.toml')} (Kimi) — nothing to judge.`); process.exit(2); }
    if (w.star) console.log(`KAIF hooks: ${w.star} KAIF hook entr${w.star === 1 ? 'y' : 'ies'} in Kimi's config carr${w.star === 1 ? 'ies' : 'y'} matcher "*" — Kimi never fires ${w.star === 1 ? 'it' : 'them'} (bugs/145); remove the matcher line.`);
    const st = readJson(join(root, STATE)) || {}, id = kimiIds(sid).find((k) => st[k]);
    if (id) { console.log(`KAIF hooks: running in this Kimi session (${id}) — the context-window hook recorded it at ${st[id].at} (session by ${handKimiBy}).`); process.exit(0); }
    console.log(`KAIF hooks: NOT running in this Kimi session (${sid}) — wired in ${join(home, 'config.toml')}, yet no hook recorded the session (session by ${handKimiBy}). ` +
      'Kimi reads hooks when a session starts: run /reload or start a new session; `kimi doctor config` names an entry that drops the whole hooks section.');
    process.exit(1);
  }
  const tp = kimiIds(sid).map((k) => kimiWireOf(k)).find(Boolean) || '';
  const lu = tp ? lastKimiContext(tailOf(tp)) : null;
  if (!lu) { console.log(`KAIF context: nothing to measure (no Kimi wire for session ${sid}) — the window cannot close the chat; only the owner's word can.`); process.exit(2); }
  const st = (readJson(join(root, STATE)) || {})[kimiIds(sid).find((k) => (readJson(join(root, STATE)) || {})[k]) || ''] || {};
  const full = windowOf({ tokens: cw.tokens || kimiConfiguredWindow(st.model || lu.model || kimiDefaultModel(configText), configText), seen: lu.used });
  const point = kimiCompactionPoint(full, configText);
  const m = measureLine(lu.used, point, kimiThresholds(cw));
  console.log(`${m.line.replace('the window is', `the room before Kimi's own compaction (it compacts at ${point} of ${full} tokens) is`)} (Kimi wire: ${tp}; session by ${handKimiBy})`);
  process.exit(m.may ? 0 : 1);
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

if (process.argv[2] === '--kimi') {
  try {
    const ev = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, '') || '{}');
    if (typeof ev.session_id !== 'string' || !ev.session_id || fromSubagent(ev)) process.exit(0);
    const root = projectRoot(ev.cwd || process.cwd());
    if (!existsSync(join(root, DEPLOYMENT))) process.exit(0);
    const marker = readJson(join(root, DEPLOYMENT)) || {};
    const cw = (marker.contextWindow && typeof marker.contextWindow === 'object') ? marker.contextWindow : {};
    const cfg = kimiThresholds(cw);
    const id = ev.session_id, all = readJson(join(root, STATE)) || {};
    const st = all[id] || { said: [], seen: 0 };
    if (typeof ev.model === 'string' && ev.model) st.model = ev.model;
    const evn = ev.hook_event_name;
    if (evn === 'PostCompact') { st.said = []; st.seen = 0; delete st.pending; delete st.closing; }
    if (evn === 'UserPromptSubmit') delete st.closing;
    const direct = kimiUsedOf(ev.usage);
    const tp = kimiWireOf(id);
    const observed = tp ? lastKimiContext(tailOf(tp)) : null;
    const measured = evn === 'PostCompact' ? 0 : direct || (observed ? observed.used : 0);
    const used = measured || st.seen || 0;
    let configured = null, configText = '';
    try {
      const configHome = process.env.KIMI_CODE_HOME || join(homedir(), '.kimi-code');
      configText = readFileSync(join(configHome, 'config.toml'), 'utf8');
      configured = kimiConfiguredWindow(st.model || kimiDefaultModel(configText), configText);
    } catch { /* no readable Kimi config — the generic floor and Kimi's default trigger apply */ }
    const full = windowOf({ tokens: cw.tokens || configured, seen: Math.max(st.seen || 0, used) });
    const win = kimiCompactionPoint(full, configText);   // the steps count up to Kimi's own compaction (№164, D1)
    const gate = closeGate(ev, used, win, cfg);
    if (gate) { process.stdout.write(JSON.stringify(gate)); process.exit(0); }
    let d = null;
    if (measured > 0 && evn !== 'PreToolUse') {
      st.seen = Math.max(st.seen || 0, measured);
      st.said = keptLevels(measured, win, st.said || []);
      d = decide(measured, win, cfg, st.said);
      if (d) {
        d = { ...d, line: d.line.replaceAll('/end-chat-soft', '/skill:end-chat-soft').replaceAll('/end-chat-force', '/skill:end-chat-force')
          .replace('the window is', `the room before Kimi's own compaction (it compacts at ${win} of ${full} tokens) is`) };
        st.said = [...new Set([...st.said, ...d.levels])];
      }
    }
    const required = closureRequirement(used, win, cfg), closing = closingCall(ev);
    if (closing && (!required || closureSatisfied(required, closing.kind))) { st.closing = closing.kind; delete st.pending; }
    const demand = required && !closureSatisfied(required, st.closing) ? closureDemand(required, used, win, cfg) : '';
    const forceRestriction = st.closing === 'force' && evn === 'PreToolUse' && !closing && !forceClosureTool(ev);
    // Delivery (researches/50 §6): Kimi gives the model a hook's text on UserPromptSubmit only, and a PreToolUse or Stop block carries its
    // reason into the context; PostToolUse, PostCompact and a Stop that does not block reach nobody. A step found there waits as `pending`.
    // Above a closing level the refusal is NOT one-time (bugs/150): every ordinary call gets it until the closing skill is entered.
    const stopBlocks = evn === 'Stop' && (demand || (d && (d.kind === 'close' || d.kind === 'force')));
    if (d && evn !== 'UserPromptSubmit' && !stopBlocks && !demand) st.pending = d.line;
    if (stopBlocks || (d && evn === 'UserPromptSubmit') || demand) delete st.pending;
    let say = evn === 'UserPromptSubmit' ? demand || (d ? d.line : '') : '';
    let block = evn === 'Stop' ? demand || (stopBlocks ? d.line : '') : '';
    if (!d && !demand && st.pending && evn === 'UserPromptSubmit') { say = st.pending; delete st.pending; }
    if (forceRestriction) block = FORCE_WORK_REFUSAL;
    else if (demand && evn === 'PreToolUse') block = demand;
    else if (!d && st.pending && evn === 'PreToolUse') { block = `${st.pending} (KAIF delivered this before your tool call; the call was not run — repeat it after you have read this.)`; delete st.pending; }
    all[id] = { ...st, at: new Date().toISOString() };
    const ids = Object.keys(all).sort((a, b) => String(all[b].at).localeCompare(String(all[a].at))).slice(0, SESSIONS_KEPT);
    const kept = {}; for (const k of ids) kept[k] = all[k];
    const p = join(root, STATE); mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p + '.tmp', JSON.stringify(kept)); renameSync(p + '.tmp', p);
    if (block) { console.error(block); process.exit(2); }
    if (say) process.stdout.write(say);
  } catch { /* a hook never breaks the session */ }
  process.exit(0);
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
