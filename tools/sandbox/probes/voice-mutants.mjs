// tools/sandbox/probes/voice-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of suite s26's writing-selection
// asserts (2.8, epic CK, step CK5.9 (b) — a bare `kaif-voice-lint load` prints the portrait's writing sections, `--all` the whole,
// the summary names every section left out with a ready ASCII `--sections` regex). Six mutants of the PREDICATES of the new
// behaviour are applied to the module's FILE block inside a COPY of dist/KAIF-CORE-BUNDLE.md in the OS temp dir (never to the tree,
// EXP-0077); s26 runs against the copy through the KAIF_DIST seam (its sections (2) and (3) judge the DEPLOYED module), and the red
// assert lines are compared with the addressees named here BEFORE the run (EXP-0059): mutant M → exactly these asserts go red, and
// only they. A mutant whose anchor does not match EXACTLY ONCE is a refusal, never a green (origin bug 122); a suite that did not
// reach its verdict line proves nothing (EXP-0158) and is BAD.
// Run it after touching `load` of framework/tools/kaif-voice-lint.mjs or s26:   node tools/sandbox/probes/voice-mutants.mjs
// Needs a FRESH dist (rebuild first); runs the suite once per mutant (six) — run it ALONE, not beside the polygon (origin bug 109).
// Raises no window and no sound. `--list` prints the red asserts of every mutant without judging (to re-name addressees).
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

const MUTANTS = [
  { name: 'M1 a bare load prints the whole portrait (the writing selection never runs)',
    from: '  } else if (!ALL) {', to: '  } else if (false && !ALL) {',
    expect: [SKELETON, BODY, SUMMARY, LEFT, REGEX] },
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
];

const root = mkdtempSync(join(tmpdir(), 'kaif-voice-mutants-'));
let bad = 0;
for (const m of MUTANTS) {
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(REPO, 'dist'), dist, { recursive: true });
  const p = join(dist, 'KAIF-CORE-BUNDLE.md');                    // the module rides in the bundle as a FILE block
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
