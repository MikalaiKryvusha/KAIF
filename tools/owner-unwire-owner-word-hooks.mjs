#!/usr/bin/env node
// tools/owner-unwire-owner-word-hooks.mjs — the OWNER's one-shot hand: unwire the two mid-turn owner-word hooks
// (pretool-owner-word.mjs · stop-owner-answer.mjs) from this repository's .claude/settings.json.
//
// WHY. The owner's verdict on origin issue #144 (2026-10-14, KARTUN chat, verbatim): «Убрать это!!!! ИЗ КАИФ НАХУЙ УБРАТ!» —
// the forced stop on every short remark and the «⏩» line go out of KAIF 2.9. The agent may not edit its own harness settings
// (the auto-mode classifier refuses it as [Self-Modification], observed 2026-10-16 08:52 +03:00, session 80) — the owner runs this.
//
// Usage (the OWNER, from the repository root):   node tools/owner-unwire-owner-word-hooks.mjs
//   --file <path>  another settings file (a copy for a dry check)
// Every other hook, key and the file's one-line "args" arrays stay as they were; a repeat run changes nothing.
// [TESTED: 2026-10-16 · run by the owner on this repository: «- PreToolUse → pretool-owner-word.mjs · - Stop → stop-owner-answer.mjs ·
//  2 hook entries unwired»; `git diff .claude/settings.json` — exactly the two entries gone, other hooks and one-line "args" kept]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const RETIRED = ['pretool-owner-word.mjs', 'stop-owner-answer.mjs'];
const args = process.argv.slice(2);
const fi = args.indexOf('--file');
const file = resolve(fi >= 0 && args[fi + 1] ? args[fi + 1] : '.claude/settings.json');
if (!existsSync(file)) { console.error(`✗ ${file} not found — nothing to unwire`); process.exit(1); }

const raw = readFileSync(file, 'utf8');
const settings = JSON.parse(raw.replace(/^﻿/, ''));
const removed = [];
const retiredIn = (h) => RETIRED.find((s) => [h && h.command, ...((h && h.args) || [])].join(' ').includes(s));
for (const [event, groups] of Object.entries(settings.hooks || {})) {
  const kept = [];
  for (const g of groups) {
    const hooks = (g.hooks || []).filter((h) => { const s = retiredIn(h); if (s) removed.push(`${event} → ${s}`); return !s; });
    if (hooks.length) kept.push({ ...g, hooks });
  }
  if (kept.length) settings.hooks[event] = kept; else delete settings.hooks[event];
}
if (!removed.length) { console.log(`= ${file}: neither hook is wired — file untouched`); process.exit(0); }

// one-line arrays of strings back to one line — the file's own style
let text = JSON.stringify(settings, null, 2).replace(/\[\n\s*("(?:[^"\\\n]|\\.)*"(?:,\n\s*"(?:[^"\\\n]|\\.)*")*)\n\s*\]/g,
  (all, body) => '[' + body.split(/,\n\s*/).join(', ') + ']') + '\n';
if (raw.includes('\r\n')) text = text.replace(/\n/g, '\r\n');
writeFileSync(file, text);
for (const r of removed) console.log(`- ${r}`);
console.log(`✅ ${file}: ${removed.length} hook entr${removed.length === 1 ? 'y' : 'ies'} unwired; restart the agent session (VS Code: reload the window) so the harness reads the file again`);
