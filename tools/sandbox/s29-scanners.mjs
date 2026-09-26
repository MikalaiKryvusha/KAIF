#!/usr/bin/env node
// tools/sandbox/s29-scanners.mjs — the scanners see the project as git sees it (2.8, epic SC, plans/123; criteria 16–18 of plans/117).
//
// W — ONE safe tree walker (SC1; origin #77 · Q-R1′). The field: twenty nested copies under `.claude/worktrees/*` took the whole
//     cap of the stale-claims scan and hid the real README; one broken link of a browser profile ended the walk inside a
//     `try {} catch {}` and the scan printed "no lines found"; `kaif-provenance check` died on the same link with a stack trace.
//   W1 (git mode) — a deployed project under git with 20 real worktrees and two broken links (a directory junction that sorts
//      BEFORE everything, the field's `.auth/profile`, and a file link): `update` names the real README's old claim, names no
//      path under `.claude/worktrees`, and the item says "skipped 2 unreadable path(s)"; `kaif-provenance check` exits 0 and
//      names the skipped paths.
//   W2 (no git) — the same tree without git (20 plain copies): the fallback walk skips the copies by name and names the link.
//   W3 (the block itself, the FAILED branch) — the KAIF-WALK block of the delivered core, run with an injected file system: an
//      unreadable directory (fallback walk) and git's "could not open directory … Permission denied" are FAILED and the
//      walk's line says "the scan is INCOMPLETE, not clean"; git's "No such file" is SKIPPED. A real permission denial IS
//      reproducible on the origin's machine from a PowerShell parent (`icacls <dir> /deny <user>:(OI)(CI)(RD)` → readdirSync
//      EPERM); processes started from Git Bash carry SeBackupPrivilege enabled and read through the deny. (Corrected 2026-09-26 03:53 +03:00
//      after the SC4 judge: this line said "not reproducible — the owner's account passes an icacls deny".)
//   W4 (the READ side — SC4 F1 · F7 · F8 · F9) — the delivered core and modules as REAL processes, the read deny injected at the fs
//      boundary by a preload: stale-claims and update name the unreadable file (no stack trace; update exit 0, its item names the
//      FAILED walk), kaif-provenance check names it, report refuses «INCOMPLETE» instead of «✅ no AI text awaits acceptance»,
//      guard-lint names it instead of skipping in silence; a project under .claude/worktrees/<agent>/ scanned by an absolute
//      root is judged, not «SKIPPED — nothing to scan».
//
// Red proof: `KAIF_DIST=<dist v2.7> node tools/sandbox/s29-scanners.mjs` — the 2.7 core walks the copies and stops at the link;
// mutants — tools/sandbox/probes/sc-mutants.mjs.
// [TESTED: 2026-09-26 01:42:55 +03:00 · 12 checks green (the first run: 1 red — a fixture defect, fixed); on v2.7 6 red by name
//  (01:43:15); report testcases/reports/2026-09-26_sc1-one-safe-walker.md]
// [TESTED: 2026-09-26 02:44:44 +03:00 · SC2 section C — 20 checks green; on v2.7 C1–C4 red by name (C5–C7 guard rules 2.7 never had —
//  their red is mutants M10–M12); three of them (C5 codename · C6 overlapping pair · C7 XML is no pin) came from the functional run on
//  four real trees, which found them as defects of the first cut; report testcases/reports/2026-09-26_sc2-claim-is-a-pair.md]
import { readFileSync, writeFileSync, mkdirSync, symlinkSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { tempRoot } from '../lib/temp-root.mjs';
import { must, coreRunner, hermeticArgs } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
const ROOT = tempRoot('scanners', process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-400)));
  if (!cond) failures++;
};
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const run = coreRunner(ROOT);
const copy = (a, b) => writeFileSync(b, readFileSync(a));
const seed = (dir) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  copy(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  copy(join(DIST, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};
const git = (cwd, ...a) => execFileSync('git', a, { cwd, stdio: 'pipe' }).toString();
// the upstream "9.9": the delivered bundle under a newer version, so every "KAIF 2.x" claim is OLD
const SRC99 = join(ROOT, 'src-9.9');
mkdirSync(SRC99);
copy(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(SRC99, 'KAIF-CORE-BUNDLE.md'));
copy(join(DIST, 'KAIF-CORE.mjs'), join(SRC99, 'KAIF-CORE.mjs'));
{ const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')); man.version = '9.9';
  man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(SRC99, 'KAIF-CORE-BUNDLE.md')));
  writeFileSync(join(SRC99, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n'); }

const CLAIM = 'This project runs on KAIF 2.7 and follows its canon.';
const README = `# Scanner fixture\n\n${CLAIM}\n`;
// the field's shape: a directory link that sorts BEFORE .claude and README.md (`.auth/profile` of a browser), and a file link
const brokenLinks = (dir) => {
  mkdirSync(join(dir, '.auth'), { recursive: true });
  symlinkSync(join(dir, 'no-such-profile'), join(dir, '.auth', 'profile'), process.platform === 'win32' ? 'junction' : 'dir');
  symlinkSync('no-such-note.md', join(dir, 'broken-note.md'), 'file');
};
const staleItem = (dir) => {
  // no task on disk (an update that died before writing it — the pre-fix W4b) is an empty item, never a crash of the suite
  if (!existsSync(join(dir, 'KAIF_UPDATE_TASK.md'))) return '';
  const ls = readFileSync(join(dir, 'KAIF_UPDATE_TASK.md'), 'utf8').split('\n');
  const i = ls.findIndex((l) => /\*\*stale-claims\*\*/.test(l));
  if (i < 0) return '';
  const j = ls.findIndex((l, k) => k > i && /^- (\[.\] )?\*\*[a-z-]+\*\*/.test(l));
  return ls.slice(i, j < 0 ? ls.length : j).join('\n');
};

// ---------------------------------------------------------------- W1: git mode — 20 worktrees and two broken links
console.log('\n=== W1 (#77 · Q-R1′): под git — 20 вложенных копий и две битые ссылки ===');
const W1 = join(ROOT, 'w1'); mkdirSync(W1); seed(W1);
must(run, W1, 'install');
writeFileSync(join(W1, 'README.md'), README);
git(W1, 'init', '-q'); git(W1, 'config', 'user.email', 'sbx@example.invalid'); git(W1, 'config', 'user.name', 'sbx');
git(W1, 'config', 'core.autocrlf', 'false');
git(W1, 'add', '-A'); git(W1, 'commit', '-qm', 'fixture');
for (let n = 1; n <= 20; n++) git(W1, 'worktree', 'add', '-q', `.claude/worktrees/w${String(n).padStart(2, '0')}`);
brokenLinks(W1);
let r = run(W1, `update --source ${SRC99}`);
ok(r.code === 0, 'W1 update →9.9 exit 0', r.out.slice(-300));
let item = staleItem(W1);
ok(item.includes('README.md:3'), 'W1: настоящая строка README.md названа (копии не съели лимит)', item.slice(0, 400));
ok(!item.includes('.claude/worktrees'), 'W1: ни одного пути под .claude/worktrees', item.split('\n').filter((l) => l.includes('worktrees')).slice(0, 3).join(' | '));
ok(/walk: skipped 2 unreadable path\(s\)/.test(item) && item.includes('.auth/profile') && item.includes('broken-note.md'),
  'W1: пункт называет «skipped 2» — обе битые ссылки поимённо', item.split('\n').filter((l) => l.includes('walk:')).join(' | ') || item.slice(-300));
let pv;
try { pv = { code: 0, out: execFileSync(process.execPath, [join(W1, '.kaif', 'tools', 'kaif-provenance.mjs'), 'check'], { cwd: W1, stdio: 'pipe' }).toString() }; }
catch (e) { pv = { code: e.status, out: String(e.stdout || '') + String(e.stderr || '') }; }
ok(pv.code === 0 && !/\n\s+at .*\.mjs:\d+/.test(pv.out), 'W1: kaif-provenance check — код 0, не стектрейс', `exit ${pv.code}: ${pv.out.slice(-300)}`);

// ---------------------------------------------------------------- W2: no git — 20 plain copies, the fallback walk
console.log('\n=== W2 (#77): без git — 20 копий каталогами, обход без git ===');
const W2 = join(ROOT, 'w2'); mkdirSync(W2); seed(W2);
must(run, W2, 'install');
writeFileSync(join(W2, 'README.md'), README);
for (let n = 1; n <= 20; n++) {
  const d = join(W2, '.claude', 'worktrees', `w${String(n).padStart(2, '0')}`);
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'README.md'), README);
}
brokenLinks(W2);
r = run(W2, `update --source ${SRC99}`);
ok(r.code === 0, 'W2 update →9.9 exit 0', r.out.slice(-300));
item = staleItem(W2);
ok(item.includes('README.md:3') && !item.includes('.claude/worktrees'), 'W2: настоящий README назван, копии пропущены по имени', item.slice(0, 400));
ok(/walk: skipped 2 unreadable path\(s\)/.test(item), 'W2: пункт называет «skipped 2» (обход без git)', item.split('\n').filter((l) => l.includes('walk:')).join(' | ') || item.slice(-300));

// ---------------------------------------------------------------- W3: the FAILED branch, on the block with an injected file system
console.log('\n=== W3 (#77): провал обхода — не «чисто» (блок доставленного ядра, подставная файловая система) ===');
const coreText = readFileSync(join(DIST, 'KAIF-CORE.mjs'), 'utf8').replace(/\r\n/g, '\n');
const a = coreText.indexOf('// ── KAIF-WALK:BEGIN'), b = coreText.indexOf('// ── KAIF-WALK:END');
ok(a >= 0 && b > a, 'W3: доставленное ядро несёт блок KAIF-WALK');
if (a >= 0 && b > a) {
  const make = (fs) => new Function('readdirSync', 'statSync', 'spawnSync', coreText.slice(a, b) + '\nreturn { kaifWalk, walkNotes };')(fs.readdirSync, fs.statSync, fs.spawnSync);
  const dirent = (name, dir) => ({ name, isDirectory: () => dir });
  const eacces = () => { const e = new Error('denied'); e.code = 'EACCES'; throw e; };
  // (a) no git; the directory `locked` cannot be read
  const noGit = make({
    spawnSync: () => ({ status: 128, stdout: '', stderr: 'fatal: not a git repository' }),
    readdirSync: (d) => (d === '.' ? [dirent('locked', true), dirent('README.md', false)] : eacces()),
    statSync: (p) => ({ isFile: () => p !== '.', isDirectory: () => p === '.' }),   // the root is a directory, the rest are files
  });
  let w = noGit.kaifWalk(['.']);
  let notes = noGit.walkNotes(w).join(' | ');
  ok(w.failed.length === 1 && w.failed[0].includes('locked') && /walk FAILED[^|]*INCOMPLETE, not clean/.test(notes) && w.files.includes('README.md'),
    'W3a: нечитаемый каталог (обход без git) — FAILED, строка «INCOMPLETE, not clean»', JSON.stringify(w) + ' ' + notes);
  // (b) git names a directory it could not open: "Permission denied" → failed; "No such file" → skipped
  const viaGit = (reason) => make({
    spawnSync: () => ({ status: 0, stdout: 'README.md\0', stderr: `warning: could not open directory 'secret/': ${reason}\n` }),
    readdirSync: () => [], statSync: () => ({ isFile: () => true, isDirectory: () => true }),
  });
  w = viaGit('Permission denied').kaifWalk(['.']);
  ok(w.failed.length === 1 && w.failed[0].startsWith('secret') && !w.skipped.length, 'W3b: git «Permission denied» — FAILED, не пропуск', JSON.stringify(w));
  w = viaGit('No such file or directory').kaifWalk(['.']);
  ok(w.skipped.length === 1 && w.skipped[0].startsWith('secret') && !w.failed.length, 'W3c: git «No such file» (битая ссылка) — SKIPPED с именем', JSON.stringify(w));
}

// ---------------------------------------------------------------- W4: the READ side — a real process, an unreadable file (SC4 F1 · F7 · F8 · F9)
// A read deny is not reproducible from the polygon's shell (Git Bash carries the backup privilege and reads through `icacls /deny`;
// from PowerShell the deny gives EPERM — probe 2026-09-26 03:52), so the deny is injected at the fs boundary of a REAL process: a
// preload (`node --import`) makes readFileSync / readdirSync throw EPERM for the named paths, the delivered core and modules run
// unchanged. Before the fix: `update` ended in an EPERM stack trace after the marker was written, `stale-claims` and the modules threw,
// `kaif-provenance report` printed «✅ no AI text awaits acceptance», guard-lint skipped the file in silence (SC4 judge, F1 · F7 · F8).
console.log('\n=== W4 (SC4 F1 · F7 · F8 · F9): нечитаемый файл — настоящий процесс, отказ чтения на границе ФС ===');
const PRELOAD = join(ROOT, 'deny-preload.mjs');
writeFileSync(PRELOAD, [
  "import { createRequire, syncBuiltinESMExports } from 'node:module';",
  "const fs = createRequire(import.meta.url)('node:fs');",
  "const names = (process.env.KAIF_TEST_UNREADABLE || '').split(',').filter(Boolean);",
  "const hit = (p) => { const s = String(p).split(String.fromCharCode(92)).join('/'); return names.some((n) => s === n || s.endsWith('/' + n)); };",
  "const deny = (p) => Object.assign(new Error(`EPERM: operation not permitted, open '${p}'`), { code: 'EPERM', syscall: 'open', path: String(p) });",
  "const { readFileSync, readdirSync } = fs;",
  "fs.readFileSync = function (p, ...a) { if (hit(p)) throw deny(p); return readFileSync.call(this, p, ...a); };",
  "fs.readdirSync = function (p, ...a) { if (hit(p)) throw deny(p); return readdirSync.call(this, p, ...a); };",
  'syncBuiltinESMExports();', ''].join('\n'));
const denied = (cwd, file, args, unreadable) => {
  try { return { code: 0, out: execFileSync(process.execPath, ['--import', pathToFileURL(PRELOAD).href, file, ...args],
    { cwd, stdio: 'pipe', env: { ...process.env, KAIF_TEST_UNREADABLE: unreadable } }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: String(e.stdout || '') + String(e.stderr || '') }; }
};
const STACK = /\n\s+at .*\.mjs:\d+|Node\.js v\d/;
const W4 = join(ROOT, 'w4'); mkdirSync(W4); seed(W4);
must(run, W4, 'install');
mkdirSync(join(W4, 'docs'), { recursive: true });
writeFileSync(join(W4, 'docs', 'locked.md'), 'This project runs on KAIF 2.6 — the unreadable copy.\n');
writeFileSync(join(W4, 'docs', 'open.md'), 'This project runs on KAIF 2.6 — the readable copy.\n');
mkdirSync(join(W4, 'canon'), { recursive: true });
writeFileSync(join(W4, 'canon', 'lore.md'), '[AI]a line the owner has not accepted[/AI]\n');
{ const kj = join(W4, '.kaif', 'kaif.json'); const m = JSON.parse(readFileSync(kj, 'utf8')); m.canonArtifacts = ['canon/lore.md']; writeFileSync(kj, JSON.stringify(m, null, 2) + '\n'); }
git(W4, 'init', '-q'); git(W4, 'config', 'user.email', 'sbx@example.invalid'); git(W4, 'config', 'user.name', 'sbx');
git(W4, 'config', 'core.autocrlf', 'false'); git(W4, 'add', '-A'); git(W4, 'commit', '-qm', 'fixture');
const W4CORE = join(W4, '.kaif', 'kaif-core.mjs');
r = denied(W4, W4CORE, ['stale-claims', '--from', '2.6', '--to', '9.9'], 'docs/locked.md');
ok(r.code === 1 && r.out.includes('docs/open.md:1') && /walk: the tree walk FAILED at docs\/locked\.md \(EPERM\)/.test(r.out) && !STACK.test(r.out),
  'W4a: stale-claims — нечитаемый файл назван строкой «walk FAILED … (EPERM)», читаемый назван, код 1, не стектрейс', `exit ${r.code}: ${r.out.slice(-400)}`);
r = denied(W4, W4CORE, hermeticArgs(ROOT, `update --source ${SRC99}`).split(' ').filter(Boolean), 'docs/locked.md');
item = staleItem(W4);
ok(r.code === 0 && !STACK.test(r.out) && /walk FAILED at docs\/locked\.md \(EPERM\)/.test(item) && item.includes('docs/open.md:1'),
  'W4b: update →9.9 с нечитаемым файлом — код 0, пункт stale-claims называет провал обхода и читаемую строку (прежде — стектрейс после записи маркера)', `exit ${r.code}: ${r.out.slice(-300)} || ${item.slice(0, 300)}`);
const W4MOD = (m) => join(W4, '.kaif', 'tools', `${m}.mjs`);
r = denied(W4, W4MOD('kaif-provenance'), ['check'], 'docs/locked.md');
ok(r.code === 1 && /walk FAILED at docs\/locked\.md \(EPERM\)/.test(r.out) && !STACK.test(r.out),
  'W4c: kaif-provenance check — нечитаемый файл назван, код 1, не стектрейс', `exit ${r.code}: ${r.out.slice(-300)}`);
r = denied(W4, W4MOD('kaif-provenance'), ['report'], 'canon/lore.md');
ok(r.code === 1 && /provenance report INCOMPLETE/.test(r.out) && !/no AI text awaits acceptance/.test(r.out),
  'W4d: kaif-provenance report — канон не прочитан: отказ «INCOMPLETE», никогда «✅ no AI text awaits acceptance» (F7)', `exit ${r.code}: ${r.out.slice(-300)}`);
r = denied(W4, W4MOD('kaif-guard-lint'), ['check', 'docs'], 'docs/locked.md');
ok(r.code === 1 && /walk FAILED at docs\/locked\.md \(EPERM\)/.test(r.out) && !STACK.test(r.out),
  'W4e: kaif-guard-lint — нечитаемый файл назван, а не пропущен молча, код 1 (F8)', `exit ${r.code}: ${r.out.slice(-300)}`);
// F9: a project that itself lives under .claude/worktrees/<agent>/, scanned by an ABSOLUTE root — its files are its own
const W4N = join(ROOT, 'w4n', '.claude', 'worktrees', 'agent', 'proj', 'plans');
mkdirSync(W4N, { recursive: true });
writeFileSync(join(W4N, 'plan.md'), '# Plan\n\n## Acceptance criteria\n\nThe system must be fast and user-friendly.\n');
r = denied(W4, W4MOD('kaif-requirements-lint'), ['check', W4N], '');
ok(r.code === 1 && /plan\.md:5/.test(r.out) && !/SKIPPED/.test(r.out),
  'W4f: проект под .claude/worktrees/<агент>/, абсолютный корень — его файлы судятся (находки названы), не «SKIPPED — nothing to scan» (F9)', `exit ${r.code}: ${r.out.slice(-300)}`);

// ---------------------------------------------------------------- C: a version claim is judged as a PAIR (SC2; origin #75 · #91 · N3 · N4)
console.log('\n=== C (#75 · #91 · N3 · N4): заявление о версии судится парой «KAIF ↔ версия», а не формой строки ===');
const TC = join(ROOT, 'c'); mkdirSync(TC); seed(TC);
must(run, TC, 'install');
const C1 = 'Версия KAIF 2.1 (релиз от 2026-07-31)';                         // the deployment record's line, dated only INSIDE the parenthesis
writeFileSync(join(TC, 'KAIF_FRAMEWORK.md'), readFileSync(join(TC, 'KAIF_FRAMEWORK.md'), 'utf8') + `\n${C1}\n`);
mkdirSync(join(TC, 'tools'), { recursive: true });
writeFileSync(join(TC, 'tools', 'kaif-gate.mjs'), "// the project's own KAIF gate: the update is finished when this pin moves\nconst EXPECTED_VERSION = '2.4';\n");
writeFileSync(join(TC, 'NOTES.md'), '# Notes\n\nМы строим KAIF и Acme Space 2.0 вместе.\n');   // the product's version beside the framework's word
writeFileSync(join(TC, 'RULES.md'), '# Rules\n\nThe rule arrived with this release (KAIF 2.6; origin issue #52; the\nfield owner asked for it) and stays.\n');   // a wrapped attribution
// three shapes the functional run on real trees taught (SC2, 2026-09-26): the release's codename BEFORE the word is no other name;
// a second framework word on the line is judged on its own (the first used to swallow it); an XML `version="1.0"` is no pin
writeFileSync(join(TC, 'DEPLOYED.md'), '# Deployed\n\nЗдесь развёрнута версия **2.1 «Strong KAIF»**.\n');
writeFileSync(join(TC, 'SEE.md'), '# See\n\nSee docs/kaif-notes: KAIF 2.2 is deployed here.\n');
writeFileSync(join(TC, 'tools', 'kaif-sheet.mjs'), "// draws the KAIF sheet\nwriteFileSync(out, '<?xml version=\"1.0\" encoding=\"UTF-8\"?>');\n");
// SC4 part B (the judge of epic SC: shapes the first cut left silent or named wrongly)
const C8 = '| **KAIF version** | 2.7 | deployed 2026-09-18 |';                                   // F3: the record row, the date in ANOTHER cell
const C9 = '| **Версия KAIF** | 2.7 — обновлено с 2.5 2026-09-18 (сессия 12) |';               // F3: the field's own row, the date outside parentheses
const C11A = '| First deployed | KAIF 1.2 <!-- KAIF-VERSION-OK: history --> |';                // F5: a row that carries its marker
const C11B = '| KAIF version | 2.7 |';                                                          // F5: …and the row below it, which does not
writeFileSync(join(TC, 'RECORD.md'), `# Record\n\n| Field | Value |\n|---|---|\n${C8}\n${C9}\n${C11A}\n${C11B}\n`);
writeFileSync(join(TC, 'tools', 'kaif-pin-dated.mjs'), "// the KAIF gate\nconst EXPECTED_VERSION = '2.3'; // pinned 2026-09-18 after the update\n");   // F3 in a script
writeFileSync(join(TC, 'tools', 'kaif-framework.mjs'), "// KAIF gate of the project\nexport const FRAMEWORK_VERSION = '2.3';\n");                 // F4
writeFileSync(join(TC, 'tools', 'kaif-marker.mjs'), "// reads .kaif/kaif.json\nconst marker = readJson('.kaif/kaif.json');\nassert.equal(marker.version, '2.3');\n");   // F4
writeFileSync(join(TC, 'tools', 'kaif-need.sh'), '# KAIF gate\nKAIF_REQUIRED="2.3"\n');                                            // F4
writeFileSync(join(TC, 'PRODUCT.md'), '# Product\n\nAcme Space 2.0 — KAIF-project of the team.\n\nThe Acme 2.0 KAIF plugin ships today.\n\nПродукт 2.0 на KAIF собран.\n');   // F6
r = run(TC, `update --source ${SRC99}`);
ok(r.code === 0, 'C update →9.9 exit 0', r.out.slice(-300));
item = staleItem(TC);
const kfLine = readFileSync(join(TC, 'KAIF_FRAMEWORK.md'), 'utf8').split('\n').findIndex((l) => l === C1) + 1;
ok(item.includes(`KAIF_FRAMEWORK.md:${kfLine} — ${C1}`) && item.includes('(asserts 2.1)'), 'C1 (#75): строка записи о развёртывании с датой ВНУТРИ скобки названа (asserts 2.1)', item.split('\n').filter((l) => /KAIF_FRAMEWORK/.test(l)).join(' | ').slice(0, 300));
ok(/tools\/kaif-gate\.mjs:2 — const EXPECTED_VERSION = '2\.4';/.test(item), 'C2 (#91): пин версии в скрипте проекта назван словарём кода (EXPECTED_VERSION)', item.split('\n').filter((l) => /kaif-gate/.test(l)).join(' | ') || item.slice(0, 300));
ok(!item.includes('NOTES.md'), 'C3 (N3): «KAIF и Acme Space 2.0» — версия продукта, НЕ заявление о KAIF', item.split('\n').filter((l) => /NOTES/.test(l)).join(' | '));
ok(!item.includes('RULES.md'), 'C4 (N4): атрибуция в скобке, перенесённой на вторую строку, НЕ заявление (обе строки)', item.split('\n').filter((l) => /RULES/.test(l)).join(' | '));
ok(item.includes('DEPLOYED.md:3'), 'C5: «2.1 «Strong KAIF»» — кодовое имя перед словом KAIF не чужое имя: заявление названо', item.split('\n').filter((l) => /DEPLOYED/.test(l)).join(' | ') || item.slice(0, 200));
ok(item.includes('SEE.md:3'), 'C6: второе слово KAIF в строке судится само (первое, «docs/kaif-notes», его не глотает)', item.split('\n').filter((l) => /SEE\.md/.test(l)).join(' | ') || item.slice(0, 200));
ok(!item.includes('kaif-sheet.mjs'), 'C7: `version="1.0"` в XML — не пин версии KAIF', item.split('\n').filter((l) => /kaif-sheet/.test(l)).join(' | '));

const cLines = (re) => item.split('\n').filter((l) => re.test(l)).join(' | ') || item.slice(0, 300);
ok(item.includes('RECORD.md:5 — ' + C8), 'C8 (F3): строка записи о развёртывании «| **KAIF version** | 2.7 | deployed <дата> |» названа — дата в другой ячейке не делает её журналом', cLines(/RECORD/));
ok(item.includes('RECORD.md:6 — ' + C9), 'C9 (F3): полевая строка «| **Версия KAIF** | 2.7 — обновлено с 2.5 <дата> (…) |» названа', cLines(/RECORD/));
ok(/tools\/kaif-pin-dated\.mjs:2 — const EXPECTED_VERSION = '2\.3';/.test(item), 'C10 (F3): пин с датой в хвостовом комментарии назван', cLines(/pin-dated/));
ok(!item.includes('RECORD.md:7') && item.includes('RECORD.md:8 — ' + C11B), 'C11 (F5): маркер строки таблицы прощает её саму и НЕ прощает строку ниже', cLines(/RECORD/));
ok(/tools\/kaif-framework\.mjs:2/.test(item) && /tools\/kaif-marker\.mjs:3/.test(item) && /tools\/kaif-need\.sh:2/.test(item),
  'C12 (F4): FRAMEWORK_VERSION · `.version` против старой версии в скрипте, читающем kaif.json · KAIF_REQUIRED — названы', cLines(/kaif-(framework|marker|need)/));
// (the codename in reverse order stays named — that is C5's own assert, not repeated here: one predicate, one addressee)
ok(!item.includes('PRODUCT.md'), 'C13 (F6): «Acme Space 2.0 — KAIF-…», «The Acme 2.0 KAIF plugin», «2.0 на KAIF» — версия продукта, не заявление', cLines(/PRODUCT/));

console.log(failures ? `\n❌ s29: ${failures} red` : '\n✅ s29: all green');
process.exit(failures ? 1 : 0);
