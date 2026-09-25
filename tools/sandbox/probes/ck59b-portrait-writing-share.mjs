// tools/sandbox/probes/ck59b-portrait-writing-share.mjs — a PROBE (not a polygon suite): the recon measure of step CK5.9 (b)
// (2.8, epic CK; criterion 21 of plans/117; origin issue #99 p. 3). It weighs the proposed DEFAULT selection of
// `kaif-voice-lint load` — the head (before the first H2) plus the H2 sections whose label's leading number is one of WRITING,
// with their lettered or dotted subsections (2-C, a Cyrillic 2-С, 6Б, 2.1 — the module's rule since the functional run of step
// CK5.9 (b)) — against the whole portrait, in lines and in tokens at the same two rates `check` prints the entry cost with
// (ASCII 2.5 characters per token, any other character 1.9). Read-only: it opens the files and prints; nothing is written.
// usage: node tools/sandbox/probes/ck59b-portrait-writing-share.mjs <portrait.md>…   (no argument → usage, exit 2)
// [TESTED: 2026-09-25 09:34 +03:00 · run over the voice portraits of three field deployments and of the origin, plus the shipped
//  skeleton: NDim ~37k of ~170k tokens (4.5×) · KAGO ~73k of ~223k (3.1×) · Unliminium ~17k of ~34k (2.0×) · origin ~37k of ~169k
//  (4.6×) · skeleton 73 of 170 lines, ~2k of ~5k tokens (2.4× in tokens); the numbers are recorded in plans/118, step CK5.9 (b).
//  Correction 2026-09-25 11:00 +03:00 (session 74): the Unliminium figure was WRONG — the first rule read only a Latin letter after the hyphen and
//  missed that portrait's lexicon «2-С», typed in Cyrillic; the functional run of the module (ck59b-load-field.mjs) found it; this
//  probe now cuts by the module's rule — the re-run is in testcases/reports/2026-09-25_ck59b-portrait-writing-sections.md]
import { readFileSync, existsSync } from 'node:fs';
const WRITING = ['0', '2', '5', '6', '7'];
const ASCII_CHARS_PER_TOKEN = 2.5, OTHER_CHARS_PER_TOKEN = 1.9;   // the same rates as the entry-cost line of `check` (KAIF-CORE.mjs)
const tok = (s) => { let a = 0, o = 0; for (const ch of s) { if (ch.charCodeAt(0) < 128) a++; else o++; } return a / ASCII_CHARS_PER_TOKEN + o / OTHER_CHARS_PER_TOKEN; };
const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node tools/sandbox/probes/ck59b-portrait-writing-share.mjs <portrait.md>…'); process.exit(2); }
for (const p of files) {
  if (!existsSync(p)) { console.log(`${p}: missing`); continue; }
  const lines = readFileSync(p, 'utf8').split(/\r?\n/);
  let keep = true; const out = []; const took = [];
  for (const l of lines) {
    const m = /^## (.+)$/.exec(l);
    if (m) { const num = (/^([0-9]+)(?:-?[A-Za-zА-Яа-яЁё]|\.[0-9]+)*[.)]\s/u.exec(m[1].trim()) || [])[1]; keep = WRITING.includes(num); if (keep) took.push(m[1].slice(0, 40)); }
    if (keep) out.push(l);
  }
  const all = tok(lines.join('\n')), sel = tok(out.join('\n'));
  console.log(`${p}: ${out.length} of ${lines.length} lines · ~${Math.round(sel / 1000)}k of ~${Math.round(all / 1000)}k tokens · ${(all / sel).toFixed(1)}× smaller · sections: ${took.join(' | ')}`);
}
