// tools/sandbox/probes/vo2-genre-parity.mjs — a PROBE (not a polygon suite): step VO2 of plans/120 (2.8, epic VO; criterion 25, origin
// ticket #102). A DIFFERENTIAL check of the genre labels: the shipped `kaif-voice-lint` and the tool of the owner's core storage
// (`voice-check.mjs` — the reference the genre names and the applicability rule were taken from) parse the SAME portrait; for every
// §8 row and each of the six genres both must say the same thing — the row judges this genre, or it is silent.
// usage: node tools/sandbox/probes/vo2-genre-parity.mjs [<portrait>] [<voice-check.mjs>] [<kaif-voice-lint.mjs under test>]
//        (defaults: AUTHOR_STYLOMETRY.md of this repo; d:/work/krinik_voice/tools/voice-check.mjs)
// NOTE: importing the shipped module runs its CLI (origin ticket #101 — step OW8 of plans/119 adds the direct-run guard); until then
// the probe imports a COPY of it in the OS temp dir with the trailing command dispatch cut off, and says so. (A first form faked
// argv to `selftest`: a mutant whose selftest failed exited the probe before its verdict — DIED, not a proof, EXP-0158.)
// [TESTED: 2026-09-25 15:39 +03:00 · session 74: the origin's snapshot of core 2.2 — 21 rows (16 labelled) × 6 genres = 126 verdicts, 0 disagreements;
//  red proved on a COPY of the module with the labels ignored (the M7 predicate) — 20 disagreements (15 [работа] rows × essay + the
//  [документ] row × 5 other genres), exit 1; the first two red runs were the probe's own defects (the module path read after argv was
//  faked; then a failing mutant selftest exited the probe — DIED), both fixed; report testcases/reports/2026-09-25_vo2-genre-labels.md]
import { readFileSync, existsSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const portraitPath = resolve(process.argv[2] || join(REPO, 'AUTHOR_STYLOMETRY.md'));
const refPath = resolve(process.argv[3] || 'd:/work/krinik_voice/tools/voice-check.mjs');
// read BEFORE argv is replaced for the import below (the first red run against a mutant copy said GOOD — the path came too late)
const modulePath = resolve(process.argv[4] || join(REPO, 'framework', 'tools', 'kaif-voice-lint.mjs'));
if (!existsSync(refPath)) { console.log(`reference tool not found: ${refPath} — the parity cannot be judged (exit 2)`); process.exit(2); }

const ref = await import(pathToFileURL(refPath).href);
const DISPATCH = "\nif (CMD === 'check') check();";
const src = readFileSync(modulePath, 'utf8');
if (src.split(DISPATCH).length !== 2) { console.log(`the command dispatch of ${modulePath} not found once — cannot import it quietly (exit 2)`); process.exit(2); }
const tmp = mkdtempSync(join(tmpdir(), 'kaif-genre-parity-'));
const quiet = join(tmp, 'kaif-voice-lint.quiet.mjs');
writeFileSync(quiet, src.slice(0, src.indexOf(DISPATCH)) + '\n');
let ours;
try { ours = await import(pathToFileURL(quiet).href); } finally { rmSync(tmp, { recursive: true, force: true }); }
console.log(`module under test: ${modulePath} — imported as a copy without its command dispatch (#101, OW8)`);

const text = readFileSync(portraitPath, 'utf8');
const theirs = ref.parseCore(text);
const mine = ours.parsePortrait(text).rules;
console.log(`portrait: ${portraitPath} · rows — shipped ${mine.length}, reference ${theirs.length} · genres: ${ours.GENRES.join(' ')}`);
if (JSON.stringify(ours.GENRES) !== JSON.stringify(ref.GENRES)) { console.log(`BAD — genre names differ: ${ref.GENRES.join(' ')}`); process.exit(1); }
if (mine.length !== theirs.length) { console.log('BAD — the two parsers see a different number of rows'); process.exit(1); }
let diff = 0, labelled = 0;
mine.forEach((r, i) => {
  if (r.labels.length) labelled++;
  for (const g of ours.GENRES) {
    const a = ours.applies(r, g), b = ref.applies(theirs[i], g);
    if (a !== b) { diff++; console.log(`  ✗ row ${i + 1} «${r.source.slice(0, 40)}» genre ${g}: shipped ${a}, reference ${b}`); }
  }
});
console.log(`rows ${mine.length} (labelled ${labelled}) × genres ${ours.GENRES.length} = ${mine.length * ours.GENRES.length} verdicts · disagreements ${diff}`);
console.log(diff ? 'BAD — the shipped linter and the storage tool disagree' : 'GOOD — every row judges the same genres in both tools');
process.exit(diff ? 1 : 0);
