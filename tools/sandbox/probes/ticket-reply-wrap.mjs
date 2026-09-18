#!/usr/bin/env node
// tools/sandbox/probes/ticket-reply-wrap.mjs — do the ticket reply drafts carry HARD-WRAPPED prose?
//
// WHY. GitHub renders a single newline inside an issue comment as a line break (the release body does the same —
// EXP-0071), so a draft wrapped at ~120 characters "for the repository" arrives in the tracker as ragged text. The rule
// already stands in the canon (`/release` 6.9: "learn the carrier's line-break rule BEFORE writing"), and still 13 of
// the 18 reply drafts of 2.7 were wrapped when they reached the publishing step (session 69). A rule the writer knows
// and does not follow is a job for a check, not for a sterner paragraph.
//
// Usage:
//   node tools/sandbox/probes/ticket-reply-wrap.mjs [dir]          # count wrapped joins per <N>.md; exit 1 if any
//   node tools/sandbox/probes/ticket-reply-wrap.mjs [dir] --fix    # join wrapped prose into one line per paragraph
//                                                                  # or list item; prints the word count before/after
// `dir` defaults to reports/release_<major.minor of version.json>. Fenced code, tables, headings, quotes and list-item
// starts are never joined.
// [TESTED: 2026-09-18 17:32 +03:00 · session 69, THIS file: on reports/release_2.7 (fixed) → "no wrapped prose", exit 0;
//  red on copies of the drafts before the fix (`git show a05de51:reports/release_2.7/66.md`, 54.md) → "66.md: 33 wrapped
//  join(s)", exit 1. The fix itself (13 of 18 drafts, word counts equal in every file) ran from the scratchpad twin of this
//  logic at ≈ 17:18. Report: testcases/reports/2026-09-18_release-2.7.md, run 21]
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const args = process.argv.slice(2);
const fix = args.includes('--fix');
const v = JSON.parse(readFileSync(join(ROOT, 'version.json'), 'utf8'));
const dir = resolve(ROOT, args.find((a) => !a.startsWith('--')) || join('reports', 'release_' + v.major + '.' + v.minor));
if (!existsSync(dir)) { console.log('SKIPPED — no drafts directory ' + dir); process.exit(3); }

const isTable = (l) => /^\s*\|/.test(l);
const isFence = (l) => /^\s*(```|~~~)/.test(l);
const isItemStart = (l) => /^\s*([-*+]|\d+[.)])\s+/.test(l);
const isHeading = (l) => /^\s*#/.test(l);
const isQuote = (l) => /^\s*>/.test(l);
/** A pair of consecutive non-empty prose lines is a wrap — the carrier would show a break there. */
function wraps(text) {
  const lines = text.split('\n'); let fence = false; let n = 0;
  for (let i = 1; i < lines.length; i++) {
    if (isFence(lines[i - 1])) fence = !fence;
    if (fence) continue;
    const a = lines[i - 1], b = lines[i];
    if (a.trim() && b.trim() && !isTable(a) && !isTable(b) && !isFence(b) && !isItemStart(b) && !isHeading(a) && !isHeading(b) && !isQuote(b)) n++;
  }
  return n;
}
function unwrap(text) {
  const out = []; let fence = false;
  for (const l of text.split('\n')) {
    if (isFence(l)) { fence = !fence; out.push(l); continue; }
    if (fence) { out.push(l); continue; }
    const prev = out.length ? out[out.length - 1] : '';
    const join = l.trim() && prev.trim() && !isTable(l) && !isTable(prev) && !isItemStart(l) && !isHeading(l) && !isHeading(prev) && !isQuote(l) && !isFence(prev);
    if (join) out[out.length - 1] = prev.replace(/\s+$/, '') + ' ' + l.trim(); else out.push(l);
  }
  return out.join('\n');
}
const words = (s) => s.split(/\s+/).filter(Boolean).length;
let total = 0;
for (const f of readdirSync(dir).filter((x) => /^\d+\.md$/.test(x)).sort((a, b) => parseInt(a, 10) - parseInt(b, 10))) {
  const p = join(dir, f); const t = readFileSync(p, 'utf8'); const n = wraps(t);
  if (fix && n) {
    const u = unwrap(t);
    if (words(u) !== words(t)) { console.error(f + ': word count changed ' + words(t) + ' -> ' + words(u) + ' — NOT written'); process.exitCode = 1; continue; }
    writeFileSync(p, u); console.log(f + ': ' + n + ' -> ' + wraps(u) + ' wrapped joins (words ' + words(u) + ')');
  } else { console.log(f + ': ' + n + ' wrapped join(s)'); total += n; }
}
if (!fix) { console.log(total ? 'WRAPPED: ' + total + ' join(s) — run with --fix before publishing' : 'no wrapped prose'); process.exit(total ? 1 : 0); }
