// tools/sandbox/probes/invisible-characters.mjs — a PROBE (not a polygon suite): the inventory and the ready move of
// origin bug 122. Walks every TRACKED text file (`git ls-files`) and reports invisible FORMAT and CONTROL characters sitting
// INSIDE a file body — a byte-order mark at offset 0 of a file is a file property and is not this class. The class: an
// agent types the escape of such a character into the JSON parameter of an edit tool, the tool layer decodes it, and the
// file receives the REAL character; `replace(/^<that character>/, '')` then reads to the eye, to a diff and to a review as
// `replace(/^/, '')`, and whoever retypes the line "as seen" turns the strip into a no-op without a single suite reddening.
// The character set and the scanner live in ONE place — tools/lib/invisible-chars.mjs — shared with the build guard
// (tools/check-framework.mjs); this file carries none of the characters it hunts.
// Run:   node tools/sandbox/probes/invisible-characters.mjs              (inventory; exit 1 while SOURCE zones carry any)
//        node tools/sandbox/probes/invisible-characters.mjs --summary    (counts by zone only)
//        node tools/sandbox/probes/invisible-characters.mjs --fix <file.mjs> […]
//                       the READY MOVE the build guard names: every such character in the named JavaScript sources is
//                       replaced by its six-character ASCII escape (behaviour is byte-for-byte the same: inside a regex
//                       or a string literal the escape means the character). Named files only, .mjs/.js only — in a
//                       DOCUMENT the intended text is a human's call (a word boundary typed as backslash-b is two
//                       visible characters there, not an escape), so documents are reported and never rewritten.
// Read-only unless --fix is given; raises no window and no sound.
// [TESTED: 2026-09-18 12:23 +03:00 · inventory run on the origin — 877 tracked text files, 66 characters inside bodies:
//  61 × U+FEFF · 2 × U+0000 · 2 × U+0007 · 1 × U+00AD; 39 in source zones (framework/installer 5 · framework/tools 20 ·
//  tools 14); the six sites the session had just written read 6 before their normalisation and 0 after — report
//  testcases/reports/2026-09-18_hooks-optin-smoke.md, runs 8 and 11.
//  2026-09-18 14:13 -> 14:57 +03:00 · the --fix mode on the origin: 39 characters in 20 sources -> ASCII escapes, every
//  file "still parses"; after the rebuild the inventory reads 0 characters in 886 tracked files and the run exits 0; the
//  move itself is proved on copies by invisible-fix-proof.mjs (14 of 14) and its four addressed mutants — report
//  testcases/reports/2026-09-18_invisible-characters.md, runs 2-5, 11 and 16]
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanText, normalizeSource, label } from '../../lib/invisible-chars.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const TEXT_FILE = /\.(mjs|js|json|md|yml|yaml|txt|ps1|sh|html|css|svg)$/i;
const SOURCE_ZONE = /^(framework|tools)\//;               // what the build guard gates; dist/ is a generated mirror of it

const fixAt = process.argv.indexOf('--fix');
if (fixAt !== -1) {
  const targets = process.argv.slice(fixAt + 1);
  if (!targets.length) { console.error('usage: --fix <file.mjs> […]'); process.exit(2); }
  let refused = 0;
  for (const f of targets) {
    if (!/\.(mjs|js)$/i.test(f)) { refused++; console.log(`✖ ${f}: not a JavaScript source — a document is never rewritten by this tool (fix it by hand, by meaning)`); continue; }
    const p = resolve(REPO, f);
    const before = readFileSync(p, 'utf8');
    const { text, replaced } = normalizeSource(before);
    if (replaced) writeFileSync(p, text, 'utf8');
    const left = scanText(readFileSync(p, 'utf8')).length;   // read what was written back, by code point
    // The escape MEANS the character only inside a string or a regular-expression literal. In bare code (where a
    // byte-order mark is mere whitespace) it is a syntax error — so the rewritten file must still PARSE, or the
    // original bytes go back and the site is refused: the ready move of a build guard must not be able to break a build.
    const parses = !replaced || spawnSync(process.execPath, ['--check', p], { windowsHide: true }).status === 0;
    if (!parses) writeFileSync(p, before, 'utf8');
    console.log(parses
      ? `${left ? '✖' : '✅'} ${f}: ${replaced} character(s) → ASCII escape · left after the write: ${left} · still parses (node --check)`
      : `✖ ${f}: REFUSED and RESTORED — with the escapes in place the file no longer parses (a character outside a string or a regex literal): fix that site by hand`);
    if (left || !parses) refused++;
  }
  process.exit(refused ? 1 : 0);
}

const files = execFileSync('git', ['ls-files', '-z'], { cwd: REPO, maxBuffer: 1 << 28 }).toString().split('\0').filter((f) => TEXT_FILE.test(f));
const hits = [];
for (const f of files) {
  let text; try { text = readFileSync(resolve(REPO, f), 'utf8'); } catch { continue; }
  for (const h of scanText(text)) hits.push({ f, ...h });
}
const zoneOf = (f) => (f.startsWith('framework/') ? f.split('/').slice(0, 2).join('/') : f.split('/')[0]);
const byZone = {};
for (const h of hits) byZone[zoneOf(h.f)] = (byZone[zoneOf(h.f)] || 0) + 1;
if (!process.argv.includes('--summary')) for (const h of hits) console.log(`${h.f}:${h.line}:${h.col} ${label(h.code)} :: ${h.text}`);
console.log(`\nscanned ${files.length} tracked text files · invisible characters inside bodies: ${hits.length}`);
for (const [z, n] of Object.entries(byZone).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${z}`);
const source = hits.filter((h) => SOURCE_ZONE.test(h.f)).length;
console.log(source ? `\n❌ ${source} in source zones (framework/ · tools/) — the ready move: node tools/sandbox/probes/invisible-characters.mjs --fix <file.mjs> …` : '\n✅ source zones carry none');
process.exit(source ? 1 : 0);
