// tools/sandbox/probes/voice-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of suite s26's writing-selection
// asserts (2.8, epic CK, step CK5.9 (b) — a bare `kaif-voice-lint load` prints the portrait's writing sections, `--all` the whole,
// the summary names every section left out with a ready ASCII `--sections` regex; 2.8 epic VO — the genre labels and §1). Thirteen mutants of the PREDICATES of the new
// behaviour are applied to the module's FILE block inside a COPY of dist/KAIF-CORE-BUNDLE.md in the OS temp dir (never to the tree,
// EXP-0077); s26 runs against the copy through the KAIF_DIST seam (its sections (2) and (3) judge the DEPLOYED module), and the red
// assert lines are compared with the addressees named here BEFORE the run (EXP-0059): mutant M → exactly these asserts go red, and
// only they. A mutant whose anchor does not match EXACTLY ONCE is a refusal, never a green (origin bug 122); a suite that did not
// reach its verdict line proves nothing (EXP-0158) and is BAD.
// Run it after touching `load` of framework/tools/kaif-voice-lint.mjs or s26:   node tools/sandbox/probes/voice-mutants.mjs
// Needs a FRESH dist (rebuild first); runs the suite once per mutant (thirteen) — run it ALONE, not beside the polygon (origin bug 109).
// Raises no window and no sound. `--list` prints the red asserts of every mutant without judging (to re-name addressees).
// [TESTED: 2026-09-25 16:10 +03:00 · alone, on a fresh dist: all THIRTEEN red exactly on their named addressees — M13 (the hand-over ignores the item)
//  proves the strengthened control assert of s26 (5), which on the old form judged a replaced portrait and could fail on no mutation.
// [TESTED: 2026-09-25 16:07 +03:00 · alone, on a fresh dist: all TWELVE red exactly on their named addressees (M9–M12 — the core predicates of the owner-voice
//  replacement, in dist/KAIF-CORE.mjs); the first run of the twelve was an honest BAD of M11 — its broken recognition also keeps recheck
//  refusing after the replacement (the hand-over assert, added after the eleven-mutant run), named since; testcases/reports/2026-09-25_vo3-portrait-replace.md]
// [TESTED: 2026-09-25 15:39 +03:00 · alone, on a fresh dist: all EIGHT red exactly on their named addressees (7 · 2 · 3 · 1 · 1 · 5 · 2 · 5); the first run of
//  the eight was an honest BAD of M1 — its selection-off also reddens the two load asserts of the new section (4), named since; testcases/reports/2026-09-25_vo2-genre-labels.md]
// [TESTED: 2026-09-25 10:57 +03:00 · alone, on a fresh dist: all six red exactly on their named addressees (5 · 2 · 3 · 1 · 1 · 5), no
//  invisible mutant; the first run (10:56) was an honest BAD of the runner itself — the red names were compared with their «❌ »
//  prefix, and M2's one-line anchor also stands in kaif-requirements-lint.mjs (matched twice → refused, as designed); report
//  testcases/reports/2026-09-25_ck59b-portrait-writing-sections.md]
import { readFileSync, writeFileSync, cpSync, rmSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SUITE = join(REPO, 'tools', 'sandbox', 's26-voice-lint.mjs');
const LIST_ONLY = process.argv.includes('--list');

// The addressees — the leading words of s26's assert names (a red line is cut at its first " — ").
const SKELETON = 's26 развёрнутый load скелета (2.8)';
const BODY = 's26 голая загрузка печатает голову и разделы для письма';
const SUMMARY = 's26 итог голой загрузки называет строки';
const LEFT = 's26 итог называет каждый оставленный раздел';
const REGEX = 's26 каждая напечатанная команда раздела ASCII';
const ALL = 's26 load --all печатает весь портрет';
const BOTH = 's26 load --all вместе с --sections';
const GENRE_ESSAY = 's26 check --genre essay';
const GENRE_TICKET = 's26 check --genre ticket';
const GENRE_BARE = 's26 голая загрузка: §1 грузится';
const GENRE_LOAD = 's26 load --genre essay';
const OV_FOREIGN = 's26 update: чужой портрет';
const OV_MERGE = 's26 checkpoint owner-voice-core на слиянии';
const OV_CURRENT = 's26 update: портрет уже равен слепку релиза';
const OV_HANDOVER = 's26 передача: задание прежнего ядра без пункта';
const OV_HANDOVER_AFTER = 's26 передача: после замены recheck свежего ядра проходит';
const OV_HANDOVER_CONTROL = 's26 передача: у задания с пунктом owner-voice-core recheck отказ не повторяет';

const MUTANTS = [
  { name: 'M1 a bare load prints the whole portrait (the writing selection never runs)',
    from: '  } else if (!ALL) {', to: '  } else if (false && !ALL) {',
    expect: [SKELETON, BODY, SUMMARY, LEFT, REGEX, GENRE_LOAD, GENRE_BARE] },
  { name: 'M2 --all is not recognised',
    // two lines: the one-line anchor also stands in kaif-requirements-lint.mjs, and a mutant there would prove nothing here
    from: "const WARN = argv.includes('--warn');\nconst ALL = argv.includes('--all');", to: "const WARN = argv.includes('--warn');\nconst ALL = false;",
    expect: [ALL, BOTH] },
  { name: 'M3 the summary never names the sections it left out',
    from: '  if (!left.length) return;', to: '  if (true) return;',
    expect: [SKELETON, LEFT, REGEX] },
  { name: 'M4 the ready regex is the raw title (Cyrillic through a shell)',
    from: "  const shape = '^' + [...title].map((c) => (/[A-Za-z0-9 ]/.test(c) ? c : '.')).join('');", to: "  const shape = '^' + title;",
    expect: [REGEX] },
  { name: 'M5 no end anchor (two titles whose second words are equally long load together)',
    from: "  return { sel: shape + '$', also: hits(shape + '$') - 1 };", to: '  return { sel: shape, also: 0 };',
    expect: [REGEX] },
  { name: 'M6 subsections are not writing sections (the recon\'s first rule: «2-С» and «6Б» dropped)',
    from: '(?:-?[A-Za-zА-Яа-яЁё]|\\.\\d+)*)[.)]', to: ')[.)]',
    expect: [SKELETON, BODY, SUMMARY, LEFT, REGEX] },
  // 2.8, epic VO, step VO2 (plans/120): the genre labels of §8 rows and §1 among the writing sections
  { name: 'M7 genre labels are ignored (every row judges every genre — origin ticket #102 back)',
    from: '  if (!genre || !rule.labels || !rule.labels.length) return true;', to: '  if (true) return true;',
    expect: [GENRE_ESSAY, GENRE_TICKET] },
  { name: 'M8 §1 is not a writing section (the portrait\'s own "how to read" / order of work left out)',
    from: "export const WRITING_SECTIONS = ['0', '1', '2', '5', '6', '7'];", to: "export const WRITING_SECTIONS = ['0', '2', '5', '6', '7'];",
    expect: [BODY, SUMMARY, LEFT, REGEX, GENRE_BARE] },
  // 2.8, epic VO, step VO3 (plans/120): the owner-voice snapshot sync of the CORE (dist/KAIF-CORE.mjs, not the bundle)
  { name: 'M9 the markers are not checked (every portrait is taken for a consumer — another owner\'s portrait gets the item)', file: 'KAIF-CORE.mjs',
    from: '  const marker = pin.markers.find((m) => text.includes(m));', to: '  const marker = pin.markers[0];',
    expect: [OV_FOREIGN] },
  { name: 'M10 the checkpoint does not compare the sha (a merge passes for a replacement)', file: 'KAIF-CORE.mjs',
    from: '    if (got !== want) die(', to: '    if (false) die(',
    expect: [OV_MERGE] },
  { name: 'M11 a portrait already equal to the snapshot is not recognised (it gets the item anyway)', file: 'KAIF-CORE.mjs',
    from: '  if (tail !== null && lfSha256(tail) === pin.sha256) {', to: '  if (false) {',
    expect: [OV_CURRENT, OV_HANDOVER_AFTER] },
  { name: 'M12 the hand-over at recheck is gone (a task of the previous core leaves a 1.x portrait in place — the field route 2.7 → 2.8)', file: 'KAIF-CORE.mjs',
    from: "    if (tag === 'KAIF-UPDATE' && !task.includes('kaif-core.mjs checkpoint owner-voice-core')) {", to: '    if (false) {',
    expect: [OV_HANDOVER] },
  { name: 'M13 the hand-over ignores the item (recheck refuses on the voice even where the task carries owner-voice-core)', file: 'KAIF-CORE.mjs',
    from: "    if (tag === 'KAIF-UPDATE' && !task.includes('kaif-core.mjs checkpoint owner-voice-core')) {", to: "    if (tag === 'KAIF-UPDATE') {",
    expect: [OV_HANDOVER_CONTROL] },
];

const root = mkdtempSync(join(tmpdir(), 'kaif-voice-mutants-'));
let bad = 0;
for (const m of MUTANTS) {
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(REPO, 'dist'), dist, { recursive: true });
  const p = join(dist, m.file || 'KAIF-CORE-BUNDLE.md');          // a module rides in the bundle as a FILE block; the core is its own artifact
  const src = readFileSync(p, 'utf8');
  const hits = src.split(m.from).length - 1;
  if (hits !== 1) { bad++; console.log(`BAD ${m.name}\n    anchor matched ${hits} time(s) — the mutant did NOT apply; re-anchor it to the current module`); continue; }
  writeFileSync(p, src.replace(m.from, m.to), 'utf8');
  let out = '';
  try { out = execFileSync(process.execPath, [SUITE], { cwd: REPO, env: { ...process.env, KAIF_DIST: dist }, stdio: 'pipe', maxBuffer: 1 << 26 }).toString(); }
  catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); }
  const red = out.split(/\r?\n/).filter((l) => l.startsWith('❌ s26 ')).map((l) => l.slice('❌ '.length).split(' — ')[0]);
  const died = !/check\(s\) failed|checks green/.test(out) || out.includes('УСТАНОВОЧНЫЙ ШАГ УПАЛ');   // no verdict line = a partial run
  if (LIST_ONLY) { console.log(`### ${m.name} — red ${red.length}${died ? ' — ⚠ the suite did not reach its verdict: the list is partial' : ''}`); for (const r of red) console.log('    ' + r.slice(0, 200)); continue; }
  const verdict = !died && red.length > 0 && red.length === m.expect.length && m.expect.every((e) => red.some((r) => r.startsWith(e)));
  if (died) console.log('    the suite did not reach its verdict line — this mutant proves nothing');
  if (!verdict) bad++;
  console.log(`${verdict ? 'OK ' : 'BAD'} ${m.name}\n    red ${red.length} (named before the run: ${m.expect.length})`);
  for (const r of red) console.log('      ' + r.slice(0, 190));
}
rmSync(root, { recursive: true, force: true });
if (LIST_ONLY) process.exit(0);
console.log(bad ? `\n❌ mutant proof FAILED: ${bad} of ${MUTANTS.length}` : `\n✅ ${MUTANTS.length} mutants red exactly on their named addressees, and only on them — no invisible mutant`);
process.exit(bad ? 1 : 0);
