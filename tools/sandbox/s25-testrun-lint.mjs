// s25-testrun-lint.mjs — песочница отчёта прогона и оси «/resume покрывает ядро» (2.7, эпик TR, plans/104;
// тикет origin #59 — слово владельца-QA: «ТЕСТИРОВАНИЯ НЕ БЫЛО»). Две половины, оба ответа на каждой:
// (1) линтер формы отчёта — selftest модуля зелёный (EN + RU, мутация N ← ровно правило N, незаполненный
//     шаблон красный) · чистый отчёт в каталоге по дате → exit 0 · плохой каталог (поле убрано · поле пустое ·
//     отчёт вне каталога · прогоны прозой · «найдено» прозой · вердикт прозой) → exit 1 с именами правил ·
//     дом без reports/ → SKIPPED (exit 3, класс bugs/34: «не судилось» ≠ «чисто») · дом из .kaif/kaif.json →
//     testdocs читается;
// (2) РАЗВЁРНУТАЯ копия (EXP-0010) — шаблон .kaif/_testrun-report-template.md и модуль
//     .kaif/tools/kaif-testrun-lint.mjs приехали установкой · check свежего деплоя про /resume молчит · копия,
//     у которой из /resume убран буллет GOAL.md, → check печатает предупреждение с именем GOAL.md и остаётся
//     зелёным (совет, не отказ) · линтер в копии без дома → SKIPPED · незаполненная копия шаблона в каталоге →
//     exit 1. Красный доказан на ядре 2.6 швом KAIF_DIST (dist коммитится: `git show v2.6:dist/…`).
// [TESTED: 2026-09-12 · отдельный прогон на свежем dist — «✅ s25 testrun-lint: all 27 checks green» (счёт печатает
//  сам свод); в составе полигона — «all 24 suites green»; КРАСНЫЙ доказан: `KAIF_DIST=<git show v2.6:dist/…> node
//  tools/sandbox/s25-testrun-lint.mjs` → «❌ s25: 7 of 28 check(s) failed» — свод доходит до вердикта, все семь красных
//  адресованы отсутствующей фиче (шаблон · модуль · предупреждения «1 of the 9» и «4 of the 9» · развёрнутый линтер ·
//  копия шаблона · линт копии), 21 зелёный; отчёт прогона истока — testcases/reports/2026-09-12_polygon-2.7-TR.md]
import { writeFileSync, readFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { failed } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Шов KAIF_DIST: свод судит РАЗВЁРНУТУЮ копию из dist; подставь старый dist — красный доказан (s23:21).
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
// Корень прогона УНИКАЛЕН по построению (bugs/59) — через tempRoot, никогда фиксированным именем.
const ROOT = tempRoot('testrunlint', process.argv[2]);
for (const d of ['.kaif/tools', 'good/testcases/reports', 'bad/testcases/reports', 'nohome/testcases', 'marker/.kaif', 'marker/qa/reports', 'deploy/.kaif/install'])
  mkdirSync(join(ROOT, d), { recursive: true });

let failures = 0, asserts = 0;   // счёт ассертов печатает сам свод — число в отчёте есть цитата (EXP-0025)
const ok = (cond, name, extra = '') => {
  asserts++;
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
// Результат каждой команды судится внутри ok(...) — немых команд в своде нет (bugs/61).
const runLint = (args, cwd = ROOT, bin = join(ROOT, '.kaif', 'tools', 'kaif-testrun-lint.mjs')) => {
  try { return { code: 0, out: execSync(`node ${bin} ${args} 2>&1`, { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd, args }); }
};
cpSync(join(REPO, 'framework', 'tools', 'kaif-testrun-lint.mjs'), join(ROOT, '.kaif', 'tools', 'kaif-testrun-lint.mjs'));
cpSync(join(REPO, 'framework', 'templates', '_testrun-report-template.md'), join(ROOT, '.kaif', '_testrun-report-template.md'));

// ---------------------------------------------------------------- (1) линтер формы отчёта
console.log('\n=== s25: отчёт прогона — линтер формы ===');
let r = runLint('selftest');
ok(r.code === 0 && /selftest OK/.test(r.out), 's25 selftest — каждое правило красное ровно на своей мутации, EN + RU', r.out);
ok(/7 rules × 2 languages/.test(r.out), 's25 selftest — семь правил × два языка сосчитаны', r.out);
ok(/✓ the shipped template, unfilled → exactly \[empty-field\] naming all seven fields/.test(r.out) && /✓ the template with only Runs filled → \[empty-field\] naming the other six/.test(r.out),
   's25 selftest — незаполненный шаблон поставки → empty-field на все семь полей; только «Прогоны» заполнены → остальные шесть названы', r.out);

const CLEAN = `# Test run report — polygon 2.7

**Created:** 2026-09-12 11:20 +03:00 · **Run by:** the agent · **Version/build:** 2.7

## 1. Work

The polygon of the deploy/update machinery against \`plans/104\` criteria 7–8; case set — the 24 suites of \`tools/sandbox-suite.mjs\`.

## 2. Contour

Machinery \`KAIF-CORE.mjs\` + tool modules; stand — a clean checkout, Node v24, Windows 11; no production involved.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-09-12 11:05 +03:00 | \`npm run test:core\` | 0 — all 24 suites green |

## 4. Checks

| Case | Status | Observation |
|---|---|---|
| s25 linter half | pass | selftest OK, bad fixture exit 1 |

## 5. Found

- none

## 6. Traces

- the polygon log: \`run.log\` in the session scratchpad

## 7. Verdict

pass — every suite green on the first run after the build.
`;
writeFileSync(join(ROOT, 'good', 'testcases', 'reports', '2026-09-12_polygon.md'), CLEAN);
r = runLint('check', join(ROOT, 'good'));
ok(r.code === 0 && /testrun-lint OK — 1 report\(s\)/.test(r.out), 's25 чистый отчёт в каталоге по дате — линтер ЗЕЛЁНЫЙ (exit 0)', r.out);

// --- КРАСНЫЙ ДОКАЗАН: шесть отчётов, по одной мутации критерия на каждый (поле убрано · поле пустое ·
//     отчёт вне каталога · прогоны прозой · «найдено» прозой · вердикт прозой)
const section = (n, key, body) => `## ${n}. ${key}\n\n${body}\n\n`;
const mutate = (fn) => CLEAN.split(/^(?=## )/m).map(fn).join('');
const BAD = join(ROOT, 'bad', 'testcases', 'reports');
writeFileSync(join(BAD, '2026-09-12_missing.md'), mutate((s) => /^## 2\. Contour/.test(s) ? '' : s));
writeFileSync(join(BAD, '2026-09-12_empty.md'), mutate((s) => /^## 2\. Contour/.test(s) ? section(2, 'Contour', '<the stand it ran on>') : s));
writeFileSync(join(BAD, 'smoke.md'), CLEAN);
writeFileSync(join(BAD, '2026-09-12_runs-prose.md'), mutate((s) => /^## 3\. Runs/.test(s) ? section(3, 'Runs', 'Ran the polygon twice this morning, both times green.') : s));
writeFileSync(join(BAD, '2026-09-12_found-prose.md'), mutate((s) => /^## 5\. Found/.test(s) ? section(5, 'Found', 'We looked at the output and everything seemed fine.') : s));
writeFileSync(join(BAD, '2026-09-12_verdict-prose.md'), mutate((s) => /^## 7\. Verdict/.test(s) ? section(7, 'Verdict', 'Everything went well, no worries.') : s));
r = runLint('check', join(ROOT, 'bad'));
ok(r.code === 1, 's25 плохой каталог — линтер КРАСНЫЙ (exit 1)', r.out);
ok(/7 finding\(s\) in 6 report\(s\)/.test(r.out), 's25 плохой каталог — 7 находок в 6 отчётах (прогоны прозой дают две: нет команды и нет момента)', r.out);
for (const [file, id] of [['2026-09-12_missing.md', 'missing-field'], ['2026-09-12_empty.md', 'empty-field'], ['smoke.md', 'outside-catalog'],
                          ['2026-09-12_runs-prose.md', 'runs-no-command'], ['2026-09-12_runs-prose.md', 'runs-no-moment'],
                          ['2026-09-12_found-prose.md', 'found-not-explicit'], ['2026-09-12_verdict-prose.md', 'verdict-not-named']])
  ok(new RegExp(`${file.replace('.', '\\.')} — ${id}:`).test(r.out), `s25 плохой каталог — ${file} назван правилом ${id}`, r.out);
ok(/missing field\(s\): Contour/.test(r.out), 's25 плохой каталог — убранное поле названо по имени (Contour)', r.out);

// --- SKIPPED: дом без каталога reports/ — «не судилось» ≠ «чисто»
r = runLint('check', join(ROOT, 'nohome'));
ok(r.code === 3 && /SKIPPED/.test(r.out) && /an unwritten report is invisible/.test(r.out), 's25 дом без reports/ — SKIPPED (exit 3) с границей вслух', r.out);

// --- дом из маркера: .kaif/kaif.json → testdocs
writeFileSync(join(ROOT, 'marker', '.kaif', 'kaif.json'), JSON.stringify({ framework: 'KAIF', version: '2.7', testdocs: 'qa' }));
writeFileSync(join(ROOT, 'marker', 'qa', 'reports', '2026-09-12_polygon.md'), CLEAN);
r = runLint('check', join(ROOT, 'marker'));
ok(r.code === 0 && /qa\/reports\//.test(r.out), 's25 дом читается из .kaif/kaif.json → testdocs («qa»)', r.out);

// ---------------------------------------------------------------- (2) развёрнутая копия
console.log('\n=== s25: развёрнутая копия — шаблон, модуль, ось «/resume покрывает ядро» ===');
const S = join(ROOT, 'deploy');
const runCore = (args) => {
  try { return { code: 0, out: execSync(`node ${join(S, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd: S, stdio: 'pipe' }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd: S, args }); }
};
cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(S, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(S, '.kaif', 'kaif-core.mjs'));
r = runCore('install');
ok(r.code === 0, 's25 install exit 0', r.out.slice(-400));
ok(existsSync(join(S, '.kaif', '_testrun-report-template.md')), 's25 шаблон отчёта прогона приехал: .kaif/_testrun-report-template.md');
ok(existsSync(join(S, '.kaif', 'tools', 'kaif-testrun-lint.mjs')), 's25 модуль приехал: .kaif/tools/kaif-testrun-lint.mjs');
r = runCore('check');
ok(r.code === 0, 's25 свежий деплой — check зелёный', r.out.slice(-400));
ok(!/\/resume does not name/.test(r.out) && !/names .* missing on disk/.test(r.out), 's25 свежий деплой — про /resume ни слова (все девять названы)', r.out);
// мутация на КОПИИ: из /resume уходит буллет GOAL.md → предупреждение называет его; код остаётся 0
const RESUME = join(S, '.claude', 'skills', 'resume', 'SKILL.md');
ok(existsSync(RESUME) && /^- `GOAL\.md`/m.test(readFileSync(RESUME, 'utf8')), 's25 фикстура: развёрнутый /resume несёт буллет `GOAL.md`');
writeFileSync(RESUME, readFileSync(RESUME, 'utf8').split(/\r?\n/).filter((l) => !/^- `GOAL\.md`/.test(l)).join('\n'));
r = runCore('check');
ok(r.code === 0, 's25 /resume без GOAL.md — check остаётся зелёным (совет, не отказ)', r.out.slice(-400));
ok(/⚠ \/resume does not name 1 of the 9 re-read core documents: GOAL\.md/.test(r.out), 's25 /resume без GOAL.md — предупреждение называет документ и счёт «1 of the 9»', r.out);
// фикстура критерия 8 plans/100 — «5 из 9»: убираем ещё три буллета → предупреждение называет ЧЕТЫРЕ документа
const FOUR = ['GOAL.md', 'PHILOSOPHY.md', 'REQUIREMENTS_FRAMEWORK.md', 'PROJECT_STRUCTURE_EXTERNAL_MAP.md'];
writeFileSync(RESUME, readFileSync(RESUME, 'utf8').split(/\r?\n/).filter((l) => !/^- `(PHILOSOPHY|REQUIREMENTS_FRAMEWORK|PROJECT_STRUCTURE_EXTERNAL_MAP)\.md`/.test(l)).join('\n'));
r = runCore('check');
ok(r.code === 0 && /⚠ \/resume does not name 4 of the 9 re-read core documents: /.test(r.out) &&
   FOUR.every((d) => new RegExp(`does not name 4 of the 9[^\\n]*${d.replace('.', '\\.')}`).test(r.out)),
   's25 /resume «5 из 9» (фикстура критерия 8) — предупреждение называет четыре документа поимённо, код 0', r.out);
// линтер в копии: дома нет → SKIPPED; незаполненная копия шаблона в каталоге → exit 1
const DEPLOYED_LINT = join(S, '.kaif', 'tools', 'kaif-testrun-lint.mjs');
r = runLint('check', S, DEPLOYED_LINT);
ok(r.code === 3 && /SKIPPED/.test(r.out), 's25 копия без дома отчётов — линтер SKIPPED (exit 3)', r.out);
mkdirSync(join(S, 'testcases', 'reports'), { recursive: true });
// шаблона в копии может не быть (старое ядро) — свод доходит до вердикта, а не падает исключением (каверза судьи)
const TPL = join(S, '.kaif', '_testrun-report-template.md');
if (existsSync(TPL)) cpSync(TPL, join(S, 'testcases', 'reports', '2026-09-12_unfilled.md'));
else ok(false, 's25 копия шаблона в каталог — шаблона в развёрнутой копии нет, копировать нечего');
r = runLint('check', S, DEPLOYED_LINT);
ok(r.code === 1 && /empty field\(s\): Work, Contour, Runs, Checks, Found, Traces, Verdict/.test(r.out),
   's25 незаполненная копия шаблона в каталоге — линтер красный, empty-field называет все семь полей (плейсхолдеры — не содержание)', r.out);

if (failures) { console.error(`\n❌ s25: ${failures} of ${asserts} check(s) failed`); process.exit(1); }
console.log(`\n✅ s25 testrun-lint: all ${asserts} checks green`);
