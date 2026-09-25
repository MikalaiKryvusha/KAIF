#!/usr/bin/env node
// tools/sync-walker.mjs — ONE safe tree walker, seven copies (2.8, epic SC; origin #77 · Q-R1′; plans/123 SC1).
// The source is the KAIF-WALK block of framework/installer/KAIF-CORE.mjs. A deployed tool module cannot import the core (the same
// reason as the token-rates pair, check-framework 5k), so every tool module that walks the tree carries a byte-identical copy of
// the block. This file does two things and nothing else:
//   node tools/sync-walker.mjs            — writes the core's block into every module in WALKER_COPIES (inserts it after the
//                                           module's imports the first time, with the spawnSync import it needs)
//   import { walkerDrift } …              — check-framework 5l judges the copies against the core (a drifted or missing copy is
//                                           named; the build refuses it)
// [TESTED: 2026-09-26 · wrote the six copies (then re-synced after each block edit); the build's check-framework OK with 5l silent;
//  5l --selftest four answers; report testcases/reports/2026-09-26_sc1-one-safe-walker.md]
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const CORE_PATH = 'framework/installer/KAIF-CORE.mjs';
export const WALKER_COPIES = ['kaif-provenance', 'kaif-canon-lint', 'kaif-requirements-lint', 'kaif-guard-lint', 'kaif-attribution-lint',
  'kaif-scenario-lint'].map((n) => `framework/tools/${n}.mjs`);
const BEGIN = '// ── KAIF-WALK:BEGIN';
const END = '// ── KAIF-WALK:END';

// the block, LF-normalized, from its BEGIN line through its END line — or null when the text has none
export function walkerBlock(text) {
  const t = String(text).replace(/\r\n/g, '\n');
  const a = t.indexOf(BEGIN), b = t.indexOf(END);
  if (a < 0 || b < a) return null;
  return t.slice(a, t.indexOf('\n', b) < 0 ? t.length : t.indexOf('\n', b));
}

// 5l: every copy equals the core's block; returns the findings (empty = in agreement)
export function walkerDrift(coreText, copies) {
  const src = walkerBlock(coreText);
  if (!src) return [`walker (SC 2.8): ${CORE_PATH} carries no KAIF-WALK block — the source of the one tree walker is gone`];
  const out = [];
  for (const [path, text] of Object.entries(copies)) {
    const blk = text == null ? null : walkerBlock(text);
    if (!blk) out.push(`walker (SC 2.8): ${path} carries no KAIF-WALK block — run: node tools/sync-walker.mjs`);
    else if (blk !== src) out.push(`walker (SC 2.8): ${path} — its KAIF-WALK block drifted from the core's (one walker, seven copies) — run: node tools/sync-walker.mjs`);
  }
  return out;
}

function sync() {
  const src = walkerBlock(readFileSync(join(ROOT, CORE_PATH), 'utf8'));
  if (!src) { console.error(`✖ ${CORE_PATH} carries no KAIF-WALK block`); process.exit(1); }
  for (const rel of WALKER_COPIES) {
    const p = join(ROOT, rel);
    const raw = readFileSync(p, 'utf8');
    const eol = raw.includes('\r\n') ? '\r\n' : '\n';
    let t = raw.replace(/\r\n/g, '\n');
    const old = walkerBlock(t);
    if (old) t = t.replace(old, () => src);
    else {
      const lines = t.split('\n');
      let last = -1;
      for (let i = 0; i < Math.min(lines.length, 150); i++) if (/^import .* from 'node:[a-z_]+';$/.test(lines[i])) last = i;
      if (last < 0) { console.error(`✖ ${rel}: no top-level import to anchor the block after`); process.exit(1); }
      const need = /from 'node:child_process';/.test(t) ? [] : ["import { spawnSync } from 'node:child_process';"];
      lines.splice(last + 1, 0, ...need, '', ...src.split('\n'));
      t = lines.join('\n');
    }
    if (!/\bspawnSync\b[^\n]*from 'node:child_process'/.test(t)) { console.error(`✖ ${rel}: imports child_process without spawnSync — add it by hand`); process.exit(1); }
    const next = t.replace(/\n/g, eol);
    if (next !== raw) { writeFileSync(p, next); console.log(`synced ${rel}`); } else console.log(`in agreement ${rel}`);
  }
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) sync();
