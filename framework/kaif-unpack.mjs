#!/usr/bin/env node
// kaif-unpack.mjs — KAIF mechanical unpacker (ships embedded inside KAIF.md).
// Unpacking the framework skeleton is NOT creative work: every file's exact
// canonical path and exact content are already in KAIF.md as FILE: blocks.
// This script extracts them verbatim — no interpretation, no renaming, no
// skipping — and validates completeness, so a model of ANY strength (including
// small-context local LLMs) gets a 100%-correct Stage-1 structure.
//
// Usage:
//   node kaif-unpack.mjs [KAIF.md]                 # unpack all FILE: blocks + validate
//   node kaif-unpack.mjs [KAIF.md] --check         # validate only (no writes)
//   node kaif-unpack.mjs [KAIF.md] --agent zoo-code # + translate skills to .roo/commands/
//   node kaif-unpack.mjs [KAIF.md] --anonymous     # anonymous install: skip origin-tied skills
//   --force                                        # overwrite existing non-empty files
//
// Exit code 0 = the manifest is 100% satisfied; non-zero = incomplete (fix and re-run).
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname } from 'node:path';

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : null; };
const SOURCE = args.find((a) => !a.startsWith('--') && a.endsWith('.md')) || 'KAIF.md';
const CHECK_ONLY = has('--check');
const FORCE = has('--force');
const ANON = has('--anonymous');
const AGENT = (val('--agent') || '').toLowerCase();

// Skills that bind the project to the KAIF origin — omitted on anonymous installs.
const ORIGIN_TIED = ['kaif-update', 'kaif-switch-origin', 'kaif-fork'];

// FILE: blocks are wrapped in 6-backtick fences by the KAIF build (built here,
// not written literally, so this script can itself live inside such a fence).
const FENCE = '`'.repeat(6);

if (!existsSync(SOURCE)) { console.error(`✖ source not found: ${SOURCE}`); process.exit(1); }
const text = readFileSync(SOURCE, 'utf8');

// Parse every embedded file: `> **FILE: \`path\`** …` + blank line + fenced block.
const blockRe = new RegExp(
  '^> \\*\\*FILE: `([^`]+)`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n([\\s\\S]*?)\\n' + FENCE + '\\s*$',
  'gm'
);
const manifest = []; // [{ path, content }]
for (let m; (m = blockRe.exec(text)); ) manifest.push({ path: m[1], content: m[2] + '\n' });
if (manifest.length === 0) { console.error('✖ no FILE: blocks found — is this the KAIF.md core?'); process.exit(1); }

const skillName = (p) => (p.match(/^\.claude\/skills\/([^/]+)\/SKILL\.md$/) || [])[1] || null;
const skipped = (p) => ANON && ORIGIN_TIED.includes(skillName(p) || '');
const okOnDisk = (p) => existsSync(p) && statSync(p).size > 0;

// --- write phase (unless --check) ------------------------------------------
if (!CHECK_ONLY) {
  for (const { path, content } of manifest) {
    if (skipped(path)) { console.log(`⊘ anonymous mode — skipped ${path}`); continue; }
    if (okOnDisk(path) && !FORCE) { console.log(`= kept existing ${path}`); continue; }
    mkdirSync(dirname(path) || '.', { recursive: true });
    writeFileSync(path, content);
    console.log(`+ wrote ${path}`);
  }

  // Zoo Code (ex-Roo Code) — mechanical skill translation, verified 2026-07-03:
  // .claude/skills/<name>/SKILL.md → .roo/commands/<name>.md (drop `name:`, keep
  // `description:` + body; the filename carries the command name), plus AGENTS.md
  // and .roo/rules/kaif.md so the key docs are auto-loaded.
  if (AGENT === 'zoo-code' || AGENT === 'roo-code') {
    mkdirSync('.roo/commands', { recursive: true });
    mkdirSync('.roo/rules', { recursive: true });
    for (const { path, content } of manifest) {
      const name = skillName(path);
      if (!name || skipped(path)) continue;
      const cmd = `.roo/commands/${name}.md`;
      if (okOnDisk(cmd) && !FORCE) { console.log(`= kept existing ${cmd}`); continue; }
      writeFileSync(cmd, content.replace(/^name:[^\n]*\n/m, ''));
      console.log(`+ wrote ${cmd}`);
    }
    if (!okOnDisk('AGENTS.md')) writeFileSync('AGENTS.md',
      '# Agent rules\n\nThis project is KAIF-wrapped. Before every task read `AGENT_GUIDE.md` (the canon), ' +
      '`STATUS.md` (current state), and think per `PHILOSOPHY.md`; debug per `BUG_FIXING_FRAMEWORK.md`.\n');
    if (!okOnDisk('.roo/rules/kaif.md')) writeFileSync('.roo/rules/kaif.md',
      '# KAIF\n\nRead `AGENT_GUIDE.md` before every task; keep `STATUS.md` current. ' +
      'Skills live in `.roo/commands/` (one `/command` per KAIF skill).\n');
  }
}

// --- validation phase (always runs) -----------------------------------------
let missing = 0;
for (const { path } of manifest) {
  if (skipped(path)) continue;
  if (!okOnDisk(path)) { console.error(`✖ MISSING or empty: ${path}`); missing++; }
}
if (AGENT === 'zoo-code' || AGENT === 'roo-code') {
  for (const { path } of manifest) {
    const name = skillName(path);
    if (name && !skipped(path) && !okOnDisk(`.roo/commands/${name}.md`)) {
      console.error(`✖ MISSING command: .roo/commands/${name}.md`); missing++;
    }
  }
}
const total = manifest.filter((f) => !skipped(f.path)).length;
if (missing) {
  console.error(`✖ INCOMPLETE: ${missing} of ${total} manifest entries missing — create them and re-run --check until 0.`);
  process.exit(1);
}
console.log(`✅ manifest satisfied: ${total} files present${ANON ? ' (anonymous mode)' : ''}${AGENT ? ` · agent: ${AGENT}` : ''}`);
