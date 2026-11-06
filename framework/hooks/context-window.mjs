#!/usr/bin/env node
// context-window.mjs — the "the window warns at 80 %, the soft closure starts at 85 %" hook (KAIF 2.10, epic PT; origin ticket #188 and
// its comment — two field deployments carried their own budget hook; optional refresh-hooks module, deployed to .kaif/hooks/).
// Claude Code events: UserPromptSubmit · PostToolUse.
//
// What it does: reads the session's last main-thread usage from the transcript (input + cache_creation + cache_read tokens — the vendor's
// own formula for «used», code.claude.com/docs/en/statusline) and, once per level and session, puts ONE line into the agent's context:
//   warnPct (default 80)  — a WARNING only: keep the normal pace, keep STATUS.md fresh, tell the owner once by voice. The line carries no
//                           closing word — a field agent read «finish to a cut — at 75 % it is time to close» at 70 % as the closure itself
//                           and stopped taking work with 30 % of the window left (the owner: «you close too early»);
//   closePct (default 85) — finish the current work to a logical cut, THEN start /end-chat-soft; never a forced closure (the owner's word
//                           of the second deployment: at 85 % — finish to a cut, then the soft closure; no forced closure at any level);
//   every 5 % above closePct — the same order once more (90 · 95), the auto-compaction of a 1M window comes at ≈ 967 K.
// The window size: no hook event carries it (vendor hooks reference); the rule — the project's `.kaif/kaif.json` → `contextWindow.tokens`
// wins; else `CLAUDE_CODE_DISABLE_1M_CONTEXT=1` → 200 000; else the model of the record: a `[1m]` suffix, or a family the vendor runs
// with 1M by default (Fable 5 and later, Sonnet 5 and later, Haiku 5.5, Opus 4.7 and later — code.claude.com/docs/en/model-config) →
// 1 000 000; else 200 000 — and never less than the usage seen (used > 200 000 ⇒ the window is 1 000 000).
// Thresholds: `contextWindow.warnPct` · `contextWindow.closePct` — the owner states them; state per session in .kaif/context-window.json.
// It never blocks and never stops a turn. Any internal error → exit 0 silently. Lines are English: the agent reads them.
// [TESTED: 2026-11-06 13:15 +03:00 · functional — `tools/sandbox/probes/pt6-context-window.mjs` on the origin's own live transcript (session 97,
//  claude-opus-5-5, 680 700 tokens → the 1M window by the vendor's rule, 68 %): the defaults 80 / 85 — silence; the project's 60 / 65 —
//  the «finish to a logical cut, then /end-chat-soft» line; hygiene — --selftest 9/9, mutant «cache_read not counted» red on exactly the
//  usage case (probe tools/sandbox/probes/pt6-context-window-mutant.mjs); report testcases/reports/2026-11-06_s97-polygon-scenario-lint.md rows 35–36; judge of session 97 —
//  the subagent guard and the windowOf edges added after; NOT YET: the 80 % line seen live in a session that crossed it]
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, openSync, readSync, fstatSync, closeSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const STATE = join('.kaif', 'context-window.json');
const DEPLOYMENT = join('.kaif', 'kaif.json');
const TAIL_BYTES = 4 * 1024 * 1024;    // the last records of the transcript — the usage of the newest main-thread answer lives there
const SESSIONS_KEPT = 20;
export const DEFAULTS = { warnPct: 80, closePct: 85, step: 5 };
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
      if (r.type === 'assistant' && !r.isSidechain && r.message && r.message.usage) return { used: usedOf(r.message.usage), model: String(r.message.model || '') };
    } catch { /* a torn line at the cut of the tail */ }
  }
  return null;
}
export const LINES = {
  warn: (pct, used, win) => `KAIF context: the window is ${pct} % full (${used} of ${win} tokens). A WARNING only — keep working at your ` +
    'normal pace and keep STATUS.md fresh; tell the owner once by voice that the window is at ' + pct + ' %.',
  close: (pct, used, win) => `KAIF context: the window is ${pct} % full (${used} of ${win} tokens). Finish the current work to a logical cut, ` +
    'then start /end-chat-soft — the soft closure, never a forced one.',
};
// Judge of session 97 (finding 4, observed): Claude Code fires this hook on a SUBAGENT's tool calls too, under the parent's session id
// and transcript — a line meant for the main agent landed in a subagent's context. A subagent's calls live in its own transcript
// (`subagents/agent-*.jsonl`); the main thread's tool_use ids are in the session transcript. So a PostToolUse whose tool_use_id is not
// among the main thread's ids in the transcript tail is a subagent's call — silence (a lagging transcript costs one silent event, never a
// wrong line). An event without tool_use_id is judged as before.
export function mainThreadCall(text, toolUseId) {
  if (!toolUseId) return true;
  const needle = '"id":"' + toolUseId + '"';
  for (const line of String(text).split('\n')) {
    if (!line.includes(needle)) continue;
    try { const r = JSON.parse(line); if (r.type === 'assistant' && !r.isSidechain) return true; } catch { /* torn line */ }
  }
  return false;
}
// The decision — pure: (used, window, thresholds, levels already said) → { line, level } or null
export function decide(used, win, cfg, said = []) {
  const warnPct = Number(cfg.warnPct) > 0 ? Number(cfg.warnPct) : DEFAULTS.warnPct;
  const closePct = Number(cfg.closePct) > 0 ? Number(cfg.closePct) : DEFAULTS.closePct;
  const pct = win > 0 ? Math.floor((used / win) * 100) : 0;
  let level = null;
  if (pct >= closePct) level = closePct + Math.floor((pct - closePct) / DEFAULTS.step) * DEFAULTS.step;
  else if (pct >= warnPct) level = warnPct;
  if (level === null || said.includes(level)) return null;
  return { level, line: level >= closePct ? LINES.close(pct, used, win) : LINES.warn(pct, used, win) };
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
  ok(decide(790000, LARGE, cfg) === null, '79 % — silence');
  const w = decide(800000, LARGE, cfg);
  ok(w && w.level === 80 && !/clos|wrap|finish|end-chat|stop/i.test(w.line), '80 % — a warning without a closing word');
  ok(decide(820000, LARGE, cfg, [80]) === null, '82 % after the 80 % line — silence (once per level)');
  const c = decide(851000, LARGE, cfg, [80]);
  ok(c && c.level === 85 && /logical cut/.test(c.line) && /\/end-chat-soft/.test(c.line) && /never a forced/.test(c.line), '85 % — finish to a cut, then /end-chat-soft');
  ok(decide(905000, LARGE, cfg, [80, 85]).level === 90 && decide(905000, LARGE, cfg, [80, 85, 90]) === null, '90 % — the order once more, then silence');
  ok(decide(150000, SMALL, { warnPct: 70, closePct: 75 }).level === 75, 'the project\'s own thresholds (70 / 75) are honoured');
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
  const tr = [JSON.stringify({ type: 'assistant', isSidechain: false, message: { content: [{ type: 'tool_use', id: 'toolu_MAIN' }] } })].join('\n');
  ok(mainThreadCall(tr, 'toolu_MAIN') && !mainThreadCall(tr, 'toolu_SUB') && mainThreadCall(tr, undefined),
    'a subagent\'s tool call (its id not in the main thread) — silence; the main agent\'s call and an event without an id — judged');
  console.log(bad ? `selftest: ${bad} FAIL` : 'selftest: all ok');
  process.exit(bad ? 1 : 0);
}

try {
  const ev = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, '') || '{}');
  if (ev.transcript_path && existsSync(ev.transcript_path)) {
    const root = process.env.CLAUDE_PROJECT_DIR || projectRoot(ev.cwd);
    const marker = readJson(join(root, DEPLOYMENT)) || {};
    const cw = (marker.contextWindow && typeof marker.contextWindow === 'object') ? marker.contextWindow : {};
    const tail = tailOf(ev.transcript_path), lu = lastUsage(tail);
    if (lu && (ev.hook_event_name !== 'PostToolUse' || mainThreadCall(tail, ev.tool_use_id))) {
      const id = String(ev.session_id || 'no-session'), all = readJson(join(root, STATE)) || {};
      const st = all[id] || { said: [], seen: 0 };
      st.seen = Math.max(st.seen || 0, lu.used);
      const win = windowOf({ model: lu.model, env: process.env, tokens: cw.tokens, seen: st.seen });
      const d = decide(lu.used, win, cw, st.said || []);
      if (d) st.said = [...(st.said || []), d.level];
      all[id] = { ...st, at: new Date().toISOString() };
      const ids = Object.keys(all).sort((a, b) => String(all[b].at).localeCompare(String(all[a].at))).slice(0, SESSIONS_KEPT);
      const kept = {}; for (const k of ids) kept[k] = all[k];
      const p = join(root, STATE); mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p + '.tmp', JSON.stringify(kept)); renameSync(p + '.tmp', p);
      if (d) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: ev.hook_event_name, additionalContext: d.line } }));
    }
  }
} catch { /* a hook never breaks the session */ }
process.exit(0);
