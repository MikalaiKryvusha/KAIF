// tools/sandbox/probes/up-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of epic UP 2.8 (plans/122, criteria 14–15).
// Each mutant breaks ONE predicate of the new behaviour in a COPY of dist/KAIF-CORE.mjs (OS temp dir — never the tree, EXP-0077); the named
// suite runs against the copy through the KAIF_DIST seam and its red asserts are compared with the addressees named here BEFORE the run
// (EXP-0059). An anchor that does not match exactly once is a refusal, never a green (bug 122); a suite that died before its section
// proves nothing (budget-mutants, CK5.6).
// Run it after touching the UP blocks of framework/installer/KAIF-CORE.mjs or s18/s21/s27 (fresh dist first):
//   node tools/sandbox/probes/up-mutants.mjs          — ALONE, not beside the polygon (origin bug 109); no window, no sound.
// [TESTED: 2026-09-26 02:20:15 +03:00 · UP6: fourteen mutants (M1–M5 · J3 · M6–M13) red exactly on their named addressees; the first
//  run of the fourteen was BAD 2 by MY predictions (J3 cannot redden E2 — E2 judges the line, not the count; M7 lets the flag judge
//  the field route too, so E2 is legitimately red) — addressees corrected with the reasons; report testcases/reports/2026-09-26_up6-judge-fixes.md]
// [TESTED: 2026-09-26 01:12:51 +03:00 · five mutants red exactly on their named addressees (4 · 1 · 2 · 1 · 1); the first two runs were BAD by
//  the probe itself (a suite closing line counted as an assert; s18 without the KAIF_DIST seam; the copy's manifest pinned the unmutated
//  core) — fixed; report testcases/reports/2026-09-26_up-update-loses-nothing.md]
import { readFileSync, writeFileSync, cpSync, rmSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const suite = (n) => join(REPO, 'tools', 'sandbox', n);
const MUTANTS = [
  { name: 'M1 the third state of a rename pair unbound (#72 — the delta of a section renamed in advance is lost again)', suite: 's27-rename-map.mjs', tag: '❌ ',
    from: "  for (const [o, n] of declared) if (!onDisk.has(o) && onDisk.has(n) && !renameFrom.has(n) && !renamedAhead.has(n)) renamedAhead.set(n, o);\n", to: '',
    expect: ['F1 нетронутое тело', 'F1 лог называет', 'F2 правленое тело', 'F2 лог НЕ пишет'] },
  { name: 'M2 the slot capture excludes < and > again (#73 — a fill with brackets reads as no fill)', suite: 's21-update-route.mjs', tag: '❌ ',
    from: '(?<${g}>[^\\\\n]+?)', to: '(?<${g}>[^\\\\n<>]+?)',
    expect: ['B7 (#73)'] },
  { name: 'M3 update-verify stops judging new sections (#92 — a section that never arrived verifies green)', suite: 's21-update-route.mjs', tag: '❌ ',
    from: "          console.error(`✖ a section of this release did not arrive: ${p} :: ${s} — the update delivered it (the previous template never had it, so its absence is not your deletion); merge it from the task, or restore it`);\n          missing++;\n",
    to: '',
    expect: ['N1 (#92): раздела, нового в 9.9, на диске нет', 'E: раздела, нового с 2.7, на диске нет', 'E2 (F7)'] },
  { name: 'M4 the previous proposal is dropped again (#92 — an unmerged proposal reads as the owner\'s deletion)', suite: 's21-update-route.mjs', tag: '❌ ',
    from: "    if (oldEIns && oldEIns.sha256 === normSha(modText(nm)) && prevProposed && prevProposed.has(nm.signature)) {", to: '    if (false) {',
    expect: ['N2 (#92): модуль, предложенный прошлым обновлением'] },
  { name: 'M5 a rehearsal record of another core binds again (N17)', suite: 's18-update-symmetries.mjs', tag: '❌ ',
    from: "  if (!r.core || (SELF_SHA && r.core !== SELF_SHA)) {", to: '  if (false) {',
    expect: ['U3в (N17)'] },
  // ── UP6 (court 2026-09-26): one mutant per fix ──
  { name: 'J3 update-verify names the missing section but does not COUNT it (court F6 — the red was never guarded)', suite: 's21-update-route.mjs', tag: '❌ ',
    from: "          missing++;\n        }\n      }\n    }\n  } catch { /* an unreadable receipt is named by its own gate */ }", to: "        }\n      }\n    }\n  } catch { /* an unreadable receipt is named by its own gate */ }",
    expect: ['N1 (#92): раздела, нового в 9.9, на диске нет', 'E: раздела, нового с 2.7, на диске нет'] },   // E2 asserts the line, not the count
  { name: 'M6 a rename on a translated file logs «replaced» again (R1 — Q-R4)', suite: 's27-rename-map.mjs', tag: '❌ ',
    from: "(dryRun ? 'upstream delta in the task (i18n: translated) — nothing replaced on disk' : 'replaced')", to: "'replaced'",
    expect: ['G (Q-R4)'] },
  { name: 'M7 the deployment flag judges every file again (R2 — an English file on an i18n deployment goes unchecked)', suite: 's21-update-route.mjs', tag: '❌ ',
    from: '    if (trKnown) return trList.has(p);\n', to: '    return deployTranslated;\n',
    expect: ['N3 (R2)', 'E2 (F7)'] },   // the flag decides EVERY file here — the field route of E2 included
  { name: 'M8 the render oracle is gone (R3 — no deployed form of a file for a hand merge)', suite: 's21-update-route.mjs', tag: '❌ ',
    from: "  const renderPath = val('--render');\n", to: '  const renderPath = null;\n',
    expect: ['N4 (R3)', 'N4: рендер файла, которого выпуск не везёт'] },
  { name: 'M9 an ignored automatic record of another core stays on disk (F4)', suite: 's21-update-route.mjs', tag: '❌ ',
    from: '      try { unlinkSync(path); } catch { /* already gone */ }\n      log(`⚠ rehearsal record', to: '      log(`⚠ rehearsal record',
    expect: ['A2b (F4)'] },
  { name: 'M10 the bootstrap loads the rehearsal AFTER the backup and the journal again (F5)', suite: 's21-update-route.mjs', tag: '❌ ',
    edits: [['  const earlyRehearsal = legacyOld ? loadRehearsal(legacyOld.version, meta.version) : null;\n', ''],
            ['      rehearsal = earlyRehearsal;\n', '      rehearsal = loadRehearsal(legacyOld.version, meta.version);\n']],
    expect: ['A5 (F5)'] },
  { name: 'M11 a derived fill may carry a known slot token again (F15 — the exact garbage guard)', suite: 's21-update-route.mjs', tag: '❌ ',
    from: '    if (v && v.trim() && !slotsIn(v).length) out[slot] = v;', to: '    if (v && v.trim()) out[slot] = v;',
    expect: ['B8 (F15)'] },
  { name: 'M12 the core counts H1 as a new section again (F8 — a filled project name reads as a missing section)', suite: 's21-update-route.mjs', tag: '❌ ',
    from: "s !== '<preamble>' && !/^# /.test(s) && !oldSigs.has(s)", to: "s !== '<preamble>' && !oldSigs.has(s)",
    expect: ['B6b (F8)'] },
  { name: 'M13 the field route falls back to the deployment flag again (F7 — an English file reads as translated)', suite: 's21-update-route.mjs', tag: '❌ ',
    from: '    if (!deployTranslated || !okOnDisk(p)) return false;\n', to: '    if (deployTranslated) return true;\n    if (!okOnDisk(p)) return false;\n',
    expect: ['E2 (F7)'] },
];

const root = mkdtempSync(join(tmpdir(), 'kaif-up-mutants-'));
let bad = 0;
for (const m of MUTANTS) {
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(REPO, 'dist'), dist, { recursive: true });
  const p = join(dist, 'KAIF-CORE.mjs');
  const src = readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  const pairs = m.edits || [[m.from, m.to]];   // a mutant may carry several [from, to] pairs — each must match exactly once
  const miss = pairs.map(([f]) => src.split(f).length - 1).find((h) => h !== 1);
  if (miss !== undefined) { bad++; console.log(`BAD ${m.name}\n    an anchor matched ${miss} time(s) — the mutant did NOT apply`); continue; }
  writeFileSync(p, pairs.reduce((t, [f, to]) => t.replace(f, () => to), src), 'utf8');
  // the copy's manifest pins the core by sha256 — re-pin it to the mutated core, or every install/update of the copy refuses (CK5.6)
  { const mp = join(dist, 'kaif-manifest.json'); const man = JSON.parse(readFileSync(mp, 'utf8')); man.sha256['KAIF-CORE.mjs'] = createHash('sha256').update(readFileSync(p)).digest('hex'); writeFileSync(mp, JSON.stringify(man, null, 2) + String.fromCharCode(10)); }
  let out = '';
  try { out = execFileSync(process.execPath, [suite(m.suite)], { cwd: REPO, env: { ...process.env, KAIF_DIST: dist }, stdio: 'pipe', maxBuffer: 1 << 27 }).toString(); }
  catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); }
  const red = out.split(/\r?\n/).filter((l) => l.startsWith(m.tag) && !/^❌ s\d+[^:]*: \d+ (red|из)|ПРОВАЛОВ|failure\(s\)/.test(l));   // each suite's own closing line is not an assert
  const died = out.includes('УСТАНОВОЧНЫЙ ШАГ УПАЛ') || /\n\s+at .*\.mjs:\d+:\d+\)?\n/.test(out) && !red.length;
  const verdict = !died && red.length === m.expect.length && m.expect.every((e) => red.some((r) => r.includes(e)));
  if (!verdict) bad++;
  console.log(`${verdict ? 'OK ' : 'BAD'} ${m.name}\n    ${m.suite}: red ${red.length} (named before the run: ${m.expect.length})${died ? ' — the suite DIED: proves nothing' : ''}`);
  for (const r of red) console.log('      ' + r.slice(0, 170));
}
rmSync(root, { recursive: true, force: true });
console.log(bad ? `\n❌ mutant proof FAILED: ${bad} of ${MUTANTS.length}` : `\n✅ ${MUTANTS.length} mutants red exactly on their named addressees, and only on them`);
process.exit(bad ? 1 : 0);
