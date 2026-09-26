// tools/sandbox/probes/sc-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of epic SC 2.8 (plans/123, criteria 16–18).
// Each mutant breaks ONE predicate of the new behaviour in a COPY of dist/KAIF-CORE.mjs (OS temp dir — never the tree, EXP-0077); the
// named suite runs against the copy through the KAIF_DIST seam and its red asserts are compared with the addressees named here BEFORE
// the run (EXP-0059). An anchor that does not match exactly once is a refusal, never a green (bug 122); a suite that died before its
// section proves nothing (budget-mutants, CK5.6).
// Run it after touching the KAIF-WALK block or the scan of framework/installer/KAIF-CORE.mjs, or s29 (fresh dist first):
//   node tools/sandbox/probes/sc-mutants.mjs          — ALONE, not beside the polygon (origin bug 109); no window, no sound.
// [TESTED: 2026-09-26 08:59:59 → 09:04:39 +03:00 · nineteen mutants red exactly on their named addressees (M19 — the record label of the
//  other language faces, C14; M6 · M14 addressees widened by C14); report testcases/reports/2026-09-26_rl2-record-labels-all-faces.md]
// [TESTED: 2026-09-26 02:44:27 +03:00 · twelve mutants (SC1 M1–M5 · SC2 M6–M12) red exactly on their named addressees; report
//  testcases/reports/2026-09-26_sc2-claim-is-a-pair.md]
// [TESTED: 2026-09-26 01:43:34 +03:00 · five mutants red exactly on their named addressees (2 · 1 · 1 · 1 · 2) on the first run;
//  report testcases/reports/2026-09-26_sc1-one-safe-walker.md]
import { readFileSync, writeFileSync, cpSync, rmSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const suite = (n) => join(REPO, 'tools', 'sandbox', n);
const S = 's29-scanners.mjs';
const MUTANTS = [
  { name: 'M13 the read side throws again (SC4 F1 — an unreadable file ended update in a stack trace after the marker was written)', suite: S, tag: '❌ ',
    from: '  try { return readFileSync(p, \'utf8\'); }\n  catch (e) {', to: '  try { return readFileSync(p, \'utf8\'); }\n  catch (e) { throw e;',
    expect: ['W4a: stale-claims', 'W4b: update →9.9 с нечитаемым файлом'] },
  { name: 'M1 the catch swallows a broken link again (#77 · Q-R1′ — a skipped path goes uncounted and unnamed)', suite: S, tag: '❌ ',
    from: "    try { st = statSync(p); } catch (e) { skipped.push(`${p} (${e.code || 'unreadable'})`); return; }\n",
    to: '    try { st = statSync(p); } catch (e) { return; }\n',
    expect: ['W1: пункт называет «skipped 2»', 'W2: пункт называет «skipped 2»'] },
  { name: 'M2 nested copies are walked again (#77 — twenty copies take the cap, the real README is hidden)', suite: S, tag: '❌ ',
    from: "  const nested = (p) => /(^|\\/)\\.claude\\/worktrees(\\/|$)/.test(base === '.' ? p : p.slice(base.length + 1));\n", to: '  const nested = (p) => false;\n',
    expect: ['W2: настоящий README назван'] },
  { name: 'M3 an unreadable directory is swallowed again (#77 — a walk that could not see part of the tree reads as clean)', suite: S, tag: '❌ ',
    from: '    try { ents = readdirSync(dir, { withFileTypes: true }); } catch (e) { failed.push(`${dir} (${e.code || e.message})`); return; }\n',
    to: '    try { ents = readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }\n',
    expect: ['W3a'] },
  { name: 'M4 every directory git could not open reads as a broken link (a permission denial is skipped, not failed)', suite: S, tag: '❌ ',
    from: '(/no such file/i.test(m[2]) ? skipped : failed)', to: 'skipped',
    expect: ['W3b'] },
  { name: 'M5 the scan drops the walk\'s lines (the item says nothing about what it could not see)', suite: S, tag: '❌ ',
    from: '  hits.push(...walkNotes(tree));\n', to: '',
    // W4a/W4b (SC4) judge the same walk line for an unreadable FILE — added to the addressees after the first run of 04:22 named them
    expect: ['W1: пункт называет «skipped 2»', 'W2: пункт называет «skipped 2»', 'W4a: stale-claims', 'W4b: update →9.9 с нечитаемым файлом'] },
  // ── SC2 (criterion 17): the claim is judged as a pair ──
  { name: 'M6 any dated line is skipped again (#75 — the deployment record dated inside a parenthesis goes unnamed)', suite: S, tag: '❌ ',
    from: "      if (!recordRow && /\\b\\d{4}-\\d{2}/.test(isProse ? scan.replace(/(?<!\\])\\([^)]*\\)/g, '') : line.replace(/\\s(?:\\/\\/|#).*$/, ''))) continue;", to: "      if (/\\b\\d{4}-\\d{2}/.test(line)) continue;",
    // SC4 part B: the record rows (C8 · C9) and the dated script pin (C10) fall silent with every dated line again;
    // RL2 (D-F2): the record rows of the eight other language faces (C14) with them
    expect: ['C1 (#75)', 'C8 (F3)', 'C9 (F3)', 'C10 (F3)', 'C14 (D-F2)'] },
  { name: 'M7 a script pin needs the framework word within 16 characters again (#91)', suite: S, tag: '❌ ',
    from: ' || (namesKaif ? older.find((v) => scriptPin(v, scan, readsMarker)) : undefined)', to: '',
    // SC4 part B: every script pin of C10 and C12 is named by the same predicate
    expect: ['C2 (#91)', 'C10 (F3)', 'C12 (F4)'] },
  { name: 'M8 any version near the framework word is a claim again (N3 — the product version is named)', suite: S, tag: '❌ ',
    from: 'if (r && pairGap(r[1])) return true; }', to: 'if (r) return true; }',
    expect: ['C3 (N3)'] },
  { name: 'M9 a parenthesis wrapped onto the next line is not stripped again (N4 · K-R4)', suite: S, tag: '❌ ',
    from: "      if (isProse) judged = judged.replace(/^[^(]*?\\)/, '').replace(/(?<!\\])\\([^)]*$/, '');\n", to: '',
    expect: ['C4 (N4)'] },
  { name: 'M10 the codename before the word reads as another name again (a real README claim is lost)', suite: S, tag: '❌ ',
    from: 'if (r && pairGap(r[1], true) && !productBefore(text.slice(0, m.index))) return true; }', to: 'if (r && pairGap(r[1]) && !productBefore(text.slice(0, m.index))) return true; }',
    expect: ['C5:'] },
  { name: 'M11 only the first framework word of a line is judged again (an overlapping pair is swallowed)', suite: S, tag: '❌ ',
    from: '    for (const m of text.matchAll(/kaif|каиф/gi)) {', to: '    for (const m of [...text.matchAll(/kaif|каиф/gi)].slice(0, 1)) {',
    expect: ['C6:'] },
  { name: 'M12 any `version` identifier makes a pin again (an XML attribute is named)', suite: S, tag: '❌ ',
    from: '    return (PIN_ID.test(text) && new RegExp(lit).test(text))', to: '    return (/version/i.test(text) && new RegExp(lit).test(text))',
    // SC4 part B: KAIF_REQUIRED carries no word «version» — the bare-version predicate misses it
    expect: ['C7:', 'C12 (F4)'] },
  // ── SC4 part B (the judge of epic SC): each new rule broken once ──
  { name: 'M14 the record row is a journal again when a cell carries a date (F3 — the real field row stays silent)', suite: S, tag: '❌ ',
    from: "      const recordRow = isProse && /^\\s*\\|/.test(line) && RECORD_LABEL.test(line.split('|')[1].replace(/[*_`]/g, '').trim());", to: '      const recordRow = false;',
    expect: ['C8 (F3)', 'C9 (F3)', 'C14 (D-F2)'] },
  { name: 'M15 a trailing comment\'s date silences a script pin again (F3)', suite: S, tag: '❌ ',
    from: " : line.replace(/\\s(?:\\/\\/|#).*$/, ''))) continue;", to: ' : line)) continue;',
    expect: ['C10 (F3)'] },
  { name: 'M16 the marker of a row excuses the row below again (F5)', suite: S, tag: '❌ ',
    from: '(i > 0 && !/^\\s*\\|/.test(lines[i - 1]) && /KAIF-VERSION-OK/i.test(lines[i - 1]))', to: '(i > 0 && /KAIF-VERSION-OK/i.test(lines[i - 1]))',
    expect: ['C11 (F5)'] },
  { name: 'M17 a `.version` asserted in a script reading kaif.json is no pin again (F4)', suite: S, tag: '❌ ',
    from: '    const readsMarker = namesKaif && /kaif\\.json/i.test(text);', to: '    const readsMarker = false;',
    expect: ['C12 (F4)'] },
  { name: 'M18 a product name before the version is no longer read (F6)', suite: S, tag: '❌ ',
    from: '  const productBefore = (before) => {', to: '  const productBefore = (before) => { return false;',
    expect: ['C13 (F6)'] },
  // ── RL2 (court RL 2.8, D-F2): the record label of the other language faces ──
  { name: 'M19 the record label is known only in English and Russian again (D-F2 — a dated record row of eight faces is silent)', suite: S, tag: '❌ ',
    from: '  const RECORD_LABEL = { test: (label) => RECORD_LABEL_FORMS.test(label) || RECORD_LABELS.includes(label.toLowerCase()) };',
    to: '  const RECORD_LABEL = { test: (label) => RECORD_LABEL_FORMS.test(label) };',
    expect: ['C14 (D-F2)'] },
];

const root = mkdtempSync(join(tmpdir(), 'kaif-sc-mutants-'));
let bad = 0;
for (const m of MUTANTS) {
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(REPO, 'dist'), dist, { recursive: true });
  const p = join(dist, 'KAIF-CORE.mjs');
  const src = readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  const hits = src.split(m.from).length - 1;
  if (hits !== 1) { bad++; console.log(`BAD ${m.name}\n    anchor matched ${hits} time(s) — the mutant did NOT apply`); continue; }
  writeFileSync(p, src.replace(m.from, m.to), 'utf8');
  // the copy's manifest pins the core by sha256 — re-pin it to the mutated core, or every install/update of the copy refuses (CK5.6)
  { const mp = join(dist, 'kaif-manifest.json'); const man = JSON.parse(readFileSync(mp, 'utf8')); man.sha256['KAIF-CORE.mjs'] = createHash('sha256').update(readFileSync(p)).digest('hex'); writeFileSync(mp, JSON.stringify(man, null, 2) + String.fromCharCode(10)); }
  let out = '';
  try { out = execFileSync(process.execPath, [suite(m.suite)], { cwd: REPO, env: { ...process.env, KAIF_DIST: dist }, stdio: 'pipe', maxBuffer: 1 << 27 }).toString(); }
  catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); }
  const red = out.split(/\r?\n/).filter((l) => l.startsWith(m.tag) && !/^❌ s\d+[^:]*: \d+ red/.test(l));   // the suite's own closing line is not an assert
  const died = out.includes('УСТАНОВОЧНЫЙ ШАГ УПАЛ') || /\n\s+at .*\.mjs:\d+:\d+\)?\n/.test(out) && !red.length;
  const verdict = !died && red.length === m.expect.length && m.expect.every((e) => red.some((r) => r.includes(e)));
  if (!verdict) bad++;
  console.log(`${verdict ? 'OK ' : 'BAD'} ${m.name}\n    ${m.suite}: red ${red.length} (named before the run: ${m.expect.length})${died ? ' — the suite DIED: proves nothing' : ''}`);
  for (const r of red) console.log('      ' + r.slice(0, 170));
}
rmSync(root, { recursive: true, force: true });
console.log(bad ? `\n❌ mutant proof FAILED: ${bad} of ${MUTANTS.length}` : `\n✅ ${MUTANTS.length} mutants red exactly on their named addressees, and only on them`);
process.exit(bad ? 1 : 0);
