// kimi-hooks-form.mjs — the form of a Kimi Code `[[hooks]]` entry, in ONE place (bugs/145; plans/143 KA1).
// Read by the build guard 5zb (tools/check-framework.mjs) and by the probe tools/sandbox/probes/bugs145-matcher-red.mjs.
//
// What Kimi Code does with an entry (researches/50 §6, read from the harness source, MoonshotAI/kimi-code 83e4dde and the installed
// @moonshot-ai/kimi-code 2.7.2 dist/main.mjs):
//   · the section schema is strict — only `event` · `matcher` · `command` · `timeout` (1..600); ONE invalid entry drops the WHOLE hooks
//     section with a log line only (app/config/configService.ts:761-771);
//   · `matcher` is an UNANCHORED regular expression: `try { return new RegExp(pattern).test(value) } catch { return false }`
//     (features/externalHooks/internal/matchHooks.ts:129-136) — an invalid one («*», the Claude Code spelling of «all tools») matches NOTHING,
//     silently; an empty or absent matcher matches everything.
// [TESTED: 2026-11-21 · probe tools/sandbox/probes/bugs145-matcher-red.mjs — the fragment of 9263794: 5 findings, all «*»; this tree: 0;
//  synthetic entries (unknown key · unknown event · timeout 0 · unclosed group) — one finding each]

export const KIMI_HOOK_EVENTS = ['PreToolUse', 'PostToolUse', 'PostToolUseFailure', 'PermissionRequest', 'PermissionResult', 'UserPromptSubmit',
  'UserPromptQueued', 'TurnStarted', 'Stop', 'StopFailure', 'Interrupt', 'SessionStart', 'SessionEnd', 'SessionHeartbeat', 'SubagentStart',
  'SubagentStop', 'TaskStarted', 'PreCompact', 'PostCompact', 'Notification'];   // features/externalHooks/internal/types.ts:3-24
const KEYS = new Set(['event', 'matcher', 'command', 'timeout']);

// a TOML basic string «"…"» → its value (the escapes a hook line can carry); null when the value is not a basic string
function basicString(raw) {
  const m = /^"((?:[^"\\]|\\.)*)"\s*(?:#.*)?$/.exec(raw.trim());
  if (!m) return null;
  return m[1].replace(/\\(["\\nt])/g, (_, c) => ({ n: '\n', t: '\t' }[c] || c));
}

// (text of a TOML file) → [{ line, problem }] for every `[[hooks]]` entry Kimi would refuse or never fire
export function kimiHookFindings(text) {
  const out = [];
  let entry = null;
  const close = () => {
    if (!entry) return;
    if (!entry.keys.has('event')) out.push({ line: entry.line, problem: 'an entry without «event»' });
    if (!entry.keys.has('command')) out.push({ line: entry.line, problem: 'an entry without «command»' });
    entry = null;
  };
  String(text).split(/\r?\n/).forEach((raw, i) => {
    const n = i + 1, s = raw.trim();
    if (!s || s.startsWith('#')) return;
    if (/^\[\[hooks\]\]\s*(?:#.*)?$/.test(s)) { close(); entry = { line: n, keys: new Set() }; return; }
    if (s.startsWith('[')) { close(); return; }   // another table: the hooks entry ended
    if (!entry) return;
    const kv = /^([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*(.*)$/.exec(s);
    if (!kv) { out.push({ line: n, problem: `a line Kimi's TOML schema cannot read: «${s}»` }); return; }
    const [, key, value] = kv;
    entry.keys.add(key);
    if (!KEYS.has(key)) { out.push({ line: n, problem: `the key «${key}» — Kimi accepts only event · matcher · command · timeout, and ONE such entry drops every hook` }); return; }
    if (key === 'timeout') {
      const t = Number(value.replace(/#.*$/, '').trim());
      if (!Number.isInteger(t) || t < 1 || t > 600) out.push({ line: n, problem: `timeout «${value.trim()}» — an integer 1..600` });
      return;
    }
    const str = basicString(value);
    if (str === null) { out.push({ line: n, problem: `«${key}» is not a quoted string` }); return; }
    if (key === 'event' && !KIMI_HOOK_EVENTS.includes(str)) out.push({ line: n, problem: `the event «${str}» — not one of Kimi's ${KIMI_HOOK_EVENTS.length}` });
    if (key === 'matcher') {
      try { new RegExp(str); } catch (e) {
        out.push({ line: n, problem: `matcher «${str}» is not a regular expression (${e.message}) — Kimi then fires the hook on NOTHING, silently; omit the matcher to match every tool` });
      }
    }
  });
  close();
  return out;
}

// CLI: `node tools/lib/kimi-hooks-form.mjs <config.toml> …` — each finding as «<file>:<line> — <problem>»; exit 1 on any, 0 when clean
// (e.g. the owner's ~/.kimi-code/config.toml after a merge of the fragment).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const same = (a, b) => resolve(a).toLowerCase() === resolve(b).toLowerCase();   // Windows: the drive letter comes in either case
if (process.argv[1] && same(process.argv[1], fileURLToPath(import.meta.url))) {
  let n = 0;
  for (const f of process.argv.slice(2)) for (const x of kimiHookFindings(readFileSync(f, 'utf8'))) { console.log(`${f}:${x.line} — ${x.problem}`); n++; }
  console.log(n ? `kimi-hooks-form: ${n} finding(s)` : `kimi-hooks-form: clean (${process.argv.slice(2).length} file(s))`);
  process.exit(n ? 1 : 0);
}
