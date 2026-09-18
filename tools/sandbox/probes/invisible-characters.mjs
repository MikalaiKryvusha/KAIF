// tools/sandbox/probes/invisible-characters.mjs — a PROBE (not a polygon suite): the runnable repro of origin bug 122.
// Walks every TRACKED text file (`git ls-files`) and reports invisible FORMAT characters sitting INSIDE a file body —
// a byte-order mark at offset 0 of a file is a file property and is not this class. The class: an agent types the escape
// of U+FEFF into the JSON parameter of an edit tool, the tool layer decodes it, and the file receives the REAL character;
// `replace(/^<that character>/, '')` then reads to the eye, to a diff and to a review as `replace(/^/, '')`, and whoever
// retypes the line "as seen" turns the strip into a no-op without a single suite reddening.
// The character set is built from CODE POINTS, so this file carries none of the characters it hunts.
// Run:   node tools/sandbox/probes/invisible-characters.mjs            (inventory; exit 1 while SOURCE zones carry any)
//        node tools/sandbox/probes/invisible-characters.mjs --summary  (counts by zone only)
// RED BY CONSTRUCTION until bug 122 is fixed (36 source sites on 2026-09-18); after the fix this walk becomes the body of
// the guard in tools/check-framework.mjs. Read-only; raises no window and no sound.
// [TESTED: 2026-09-18 12:14 +03:00 · run on the origin — 877 tracked text files, 62 characters inside bodies: 61 × U+FEFF
//  (36 source sites: framework/installer 5 · framework/tools 19 · tools 12; dist mirrors 24; one illustration in bugs/119)
//  and 1 × U+00AD in researches/13; the six sites this session had just written read 6 before the normalisation and 0 after —
//  report testcases/reports/2026-09-18_hooks-optin-smoke.md, runs 8 and 11]
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
// U+FEFF · zero-width space/joiners/marks · word joiner · soft hyphen · bidi embeddings and overrides · and the C0
// controls a source file never needs (everything below U+0020 except TAB, LF, CR) plus DEL: a NUL typed as an escape
// into a tool parameter arrives as a real byte exactly like the byte-order mark does, and turns the file "binary" for grep.
const C0_CONTROLS = Array.from({ length: 32 }, (_, c) => c).filter((c) => c !== 0x09 && c !== 0x0A && c !== 0x0D);
const CODE_POINTS = [0xFEFF, 0x200B, 0x200C, 0x200D, 0x200E, 0x200F, 0x2060, 0x00AD, 0x202A, 0x202B, 0x202C, 0x202D, 0x202E, 0x7F, ...C0_CONTROLS];
const TEXT_FILE = /\.(mjs|js|json|md|yml|yaml|txt|ps1|sh|html|css|svg)$/i;
const SOURCE_ZONE = /^(framework|tools)\//;               // what a guard would gate; dist/ is a generated mirror of it
const label = (c) => 'U+' + c.toString(16).toUpperCase().padStart(4, '0');

const files = execFileSync('git', ['ls-files', '-z'], { cwd: REPO, maxBuffer: 1 << 28 }).toString().split('\0').filter((f) => TEXT_FILE.test(f));
const hits = [];
for (const f of files) {
  let text; try { text = readFileSync(resolve(REPO, f), 'utf8'); } catch { continue; }
  text.split(/\r?\n/).forEach((line, i) => {
    for (let k = 0; k < line.length; k++) {
      const c = line.charCodeAt(k);
      if (!CODE_POINTS.includes(c) || (c === 0xFEFF && i === 0 && k === 0)) continue;
      hits.push({ f, line: i + 1, col: k + 1, c, text: [...line].map((ch) => (CODE_POINTS.includes(ch.charCodeAt(0)) ? '<' + label(ch.charCodeAt(0)) + '>' : ch)).join('').trim().slice(0, 120) });
    }
  });
}
const zoneOf = (f) => (f.startsWith('framework/') ? f.split('/').slice(0, 2).join('/') : f.split('/')[0]);
const byZone = {};
for (const h of hits) byZone[zoneOf(h.f)] = (byZone[zoneOf(h.f)] || 0) + 1;
if (!process.argv.includes('--summary')) for (const h of hits) console.log(`${h.f}:${h.line}:${h.col} ${label(h.c)} :: ${h.text}`);
console.log(`\nscanned ${files.length} tracked text files · invisible characters inside bodies: ${hits.length}`);
for (const [z, n] of Object.entries(byZone).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${z}`);
const source = hits.filter((h) => SOURCE_ZONE.test(h.f)).length;
console.log(source ? `\n❌ ${source} in source zones (framework/ · tools/) — origin bug 122 is open` : '\n✅ source zones carry none');
process.exit(source ? 1 : 0);
