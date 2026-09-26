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
// (3) эпик CL 2.7 (plans/107; тикет #62 — «25 tested» было 3): «Проверки» открываются двумя строками, и вердикт `pass`
//     без строки `Functional run:` или с `NONE` красен правилом pass-without-functional-run — в «плохом» каталоге два
//     таких отчёта, в «хорошем» — `NONE` под `partial` (законно), в развёрнутой копии — отчёт «одна гигиена, pass»
//     краснеет РАЗВЁРНУТЫМ линтером по имени (на ядре 2.6 правила нет — красный швом KAIF_DIST).
// (4) эпик FR 2.7 (plans/113; тикет #68 — сгенерированная конституция команды сохранила 5 правил §2 из 9, и ни один гейт
//     не сказал ни слова): ось `check` «конституция сохранила обязательства шаблона» на той же развёрнутой копии —
//     конституция из шаблона → тишина · вырезаны ровно те четыре правила, которые потеряло поле, → названы поимённо ·
//     переведённая (§2 из пяти пунктов) → сверка СЧЁТОМ вслух и НИ ОДНОЙ секции в потерях (заголовки по номеру) ·
//     удалённый `## 7.` → назван по номеру · маркер `<!-- constitution-ok: … -->` снимает ровно своё · конституции нет →
//     тишина. Красный доказан на ядре 2.6 (KAIF_DIST) и шестью мутантами блока на КОПИИ dist (скретчпад `fr-mutants.mjs`,
//     отчёт прогона): три ассерта «молчит»/«зелёный» на 2.6 зелены ПО ПОСТРОЕНИЮ — их держат мутанты, а не 2.6.
// (5) эпик TB 2.8 (plans/124; тикет #105): развёрнутые канон тестирования (шаги 6–7), шаблон C `/report-bug` и `bug <отчёт>` —
//     отчёт из приехавшего шаблона C: незаполненный 1 · заполненный 0 · без раздела 1 с именем · шаги прозой 1 · охота 2 → 1, 3 → 0,
//     без охоты 1 · по-русски 0 · нет файла 1. [TESTED: 2026-09-26 03:56:17 +03:00 · «all 74 checks green»; на 2.7 (KAIF_DIST)
//     «21 of 74» — все 11 проверок TB поимённо; первый прогон ≈ 03:55 — 1 красный, дефект линтера (разделитель «·» как значение
//     строки) — починен; отчёт testcases/reports/2026-09-26_tb1-tester-report-and-hunt.md]
// [TESTED: 2026-09-18 · отдельный прогон на свежем dist — «✅ s25 testrun-lint: all 45 checks green» (счёт печатает
//  сам свод; до FR — 37 при полном наборе, до CL — 27); КРАСНЫЙ доказан:
//  `KAIF_DIST=<git show v2.6:dist/…> node tools/sandbox/s25-testrun-lint.mjs` → «❌ s25: 16 of 45 check(s) failed» —
//  свод доходит до вердикта, красные адресованы отсутствующим фичам (шаблон · модуль · предупреждения «1 of the 9» и
//  «4 of the 9» · развёрнутый линтер · копия шаблона · линт копии · правило CL «одна гигиена, pass» · восемь ассертов FR);
//  отчёты прогона истока — testcases/reports/2026-09-12_polygon-2.7-TR.md · 2026-09-12_polygon-2.7-CL.md ·
//  2026-09-18_constitution-keeps-obligations.md]
import { writeFileSync, readFileSync, mkdirSync, cpSync, existsSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { failed, coreRunner } from '../lib/sandbox-run.mjs';

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
ok(/8 run-report rules and 5 bug-report rules × 2 languages/.test(r.out), 's25 selftest — восемь правил отчёта прогона и пять правил отчёта тестировщика × два языка сосчитаны (восьмое — pass-without-functional-run, эпик CL; пять — эпик TB)', r.out);
ok(/✓ en: "Functional run: NONE" under pass → exactly \[pass-without-functional-run\]/.test(r.out) && /✓ ru: "Functional run: NONE" under partial → clean/.test(r.out),
   's25 selftest — «NONE» под pass красный этим правилом, «NONE» под partial чистый (починено, не протестировано — честно)', r.out);
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

Hygiene: selftest 31/31 · s25 27/27
Functional run: the deployed copy under s25 — \`.kaif/kaif-core.mjs check\` and the deployed linter run as the user of the shipment, output READ

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
const section = (n, key, body) => `## ${n}. ${key}\n\n${body}\n\n`;
const mutate = (fn) => CLEAN.split(/^(?=## )/m).map(fn).join('');
// CL (#62): «починено, не протестировано» — `Functional run: NONE` под вердиктом `partial` — ЗАКОННЫЙ отчёт
writeFileSync(join(ROOT, 'good', 'testcases', 'reports', '2026-09-12_fixed-not-tested.md'),
  mutate((s) => /^## 4\. Checks/.test(s) ? section(4, 'Checks', 'Hygiene: unit 5/5 · selftest 14/14\nFunctional run: NONE')
              : /^## 7\. Verdict/.test(s) ? section(7, 'Verdict', 'partial — fixed, not tested: hygiene green, no functional run yet.') : s));
r = runLint('check', join(ROOT, 'good'));
ok(r.code === 0 && /testrun-lint OK — 2 report\(s\)/.test(r.out), 's25 чистые отчёты в каталоге по дате (полный · «NONE» под partial) — линтер ЗЕЛЁНЫЙ (exit 0)', r.out);

// --- КРАСНЫЙ ДОКАЗАН: восемь отчётов, по одной мутации критерия на каждый (поле убрано · поле пустое ·
//     отчёт вне каталога · прогоны прозой · «найдено» прозой · вердикт прозой · pass без строки функционального
//     прогона · pass при «NONE» — эпик CL, #62)
const BAD = join(ROOT, 'bad', 'testcases', 'reports');
writeFileSync(join(BAD, '2026-09-12_pass-no-functional.md'), mutate((s) => /^## 4\. Checks/.test(s) ? section(4, 'Checks', 'Hygiene: unit 5/5 · selftest 14/14 · mutation K4 2 red on target\n\n| Case | Status | Observation |\n|---|---|---|\n| unit | pass | 5/5 |') : s));
writeFileSync(join(BAD, '2026-09-12_pass-none.md'), mutate((s) => /^## 4\. Checks/.test(s) ? section(4, 'Checks', 'Hygiene: unit 5/5\nFunctional run: NONE') : s));
// каверза судьи CL: голая метка (или плейсхолдер шаблона) НАД заполненной таблицей — не заполненная строка
writeFileSync(join(BAD, '2026-09-12_pass-bare-label.md'), mutate((s) => /^## 4\. Checks/.test(s) ? section(4, 'Checks', 'Hygiene: unit 5/5\nFunctional run: <what was walked · on which contour · what was READ — or NONE>\n\n| Case | Status | Observation |\n|---|---|---|\n| unit | pass | 5/5 |') : s));
writeFileSync(join(BAD, '2026-09-12_missing.md'), mutate((s) => /^## 2\. Contour/.test(s) ? '' : s));
writeFileSync(join(BAD, '2026-09-12_empty.md'), mutate((s) => /^## 2\. Contour/.test(s) ? section(2, 'Contour', '<the stand it ran on>') : s));
writeFileSync(join(BAD, 'smoke.md'), CLEAN);
writeFileSync(join(BAD, '2026-09-12_runs-prose.md'), mutate((s) => /^## 3\. Runs/.test(s) ? section(3, 'Runs', 'Ran the polygon twice this morning, both times green.') : s));
writeFileSync(join(BAD, '2026-09-12_found-prose.md'), mutate((s) => /^## 5\. Found/.test(s) ? section(5, 'Found', 'We looked at the output and everything seemed fine.') : s));
writeFileSync(join(BAD, '2026-09-12_verdict-prose.md'), mutate((s) => /^## 7\. Verdict/.test(s) ? section(7, 'Verdict', 'Everything went well, no worries.') : s));
r = runLint('check', join(ROOT, 'bad'));
ok(r.code === 1, 's25 плохой каталог — линтер КРАСНЫЙ (exit 1)', r.out);
ok(/10 finding\(s\) in 9 report\(s\)/.test(r.out), 's25 плохой каталог — 10 находок в 9 отчётах (прогоны прозой дают две: нет команды и нет момента)', r.out);
for (const [file, id] of [['2026-09-12_missing.md', 'missing-field'], ['2026-09-12_empty.md', 'empty-field'], ['smoke.md', 'outside-catalog'],
                          ['2026-09-12_runs-prose.md', 'runs-no-command'], ['2026-09-12_runs-prose.md', 'runs-no-moment'],
                          ['2026-09-12_found-prose.md', 'found-not-explicit'], ['2026-09-12_verdict-prose.md', 'verdict-not-named'],
                          ['2026-09-12_pass-no-functional.md', 'pass-without-functional-run'], ['2026-09-12_pass-none.md', 'pass-without-functional-run'],
                          ['2026-09-12_pass-bare-label.md', 'pass-without-functional-run']])
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
// CL (#62): отчёт «одна гигиена, вердикт pass» в каталоге развёрнутой копии → РАЗВЁРНУТЫЙ линтер называет правило
// (на ядре 2.6 правила нет — красный доказан швом KAIF_DIST)
writeFileSync(join(S, 'testcases', 'reports', '2026-09-12_hygiene-pass.md'),
  mutate((s) => /^## 4\. Checks/.test(s) ? section(4, 'Checks', 'Hygiene: unit 5/5 · selftest 14/14 · mutation K4 2 red on target') : s));
r = runLint('check', S, DEPLOYED_LINT);
ok(r.code === 1 && /2026-09-12_hygiene-pass\.md — pass-without-functional-run: Verdict says pass while Checks carries no "Functional run:" line/.test(r.out),
   's25 развёрнутый линтер — «одна гигиена, вердикт pass» красный правилом pass-without-functional-run с именем строки (эпик CL, #62)', r.out);

// ---------------------------------- (5) отчёт тестировщика и охота за шагами (эпик TB 2.8, plans/124; тикет origin #105)
// Слово владельца-QA (#105): баг-репорт тестировщика — Описание · Шаги воспроизведения · Ожидаемый · Фактический, шаги — путь
// пользователя; «не воспроизвелось» — только после охоты за шагами. Свод судит РАЗВЁРНУТУЮ копию (та же, что выше): канон
// тестирования несёт шаги 6–7, навык /report-bug — шаблон C, и развёрнутый линтер `bug <отчёт>` отвечает оба ответа —
// на отчёте, собранном ИЗ приехавшего шаблона (шаблон и линтер обязаны говорить одними заголовками). Красный: ядро 2.7
// (KAIF_DIST) — шагов, шаблона и команды нет; мутанты правил — tools/sandbox/probes/tb-mutants.mjs.
console.log('\n=== s25: развёрнутая копия — отчёт тестировщика и охота за шагами (TB) ===');
const TF_TEXT = existsSync(join(S, 'TESTING_FRAMEWORK.md')) ? readFileSync(join(S, 'TESTING_FRAMEWORK.md'), 'utf8') : '';
ok(/^6\. \*\*Hunt the reproduction\*\*/m.test(TF_TEXT) && /lists at least\s+three variants tried/.test(TF_TEXT) &&
   /^7\. \*\*File defects in the defined shape\*\*/m.test(TF_TEXT) && /kaif-testrun-lint\.mjs bug <report>/.test(TF_TEXT),
   's25 развёрнутый канон тестирования — шаг 6 «Hunt the reproduction» (не меньше трёх вариантов) и шаг 7 с командой `bug`', TF_TEXT.slice(0, 200));
const RB_TEXT = existsSync(join(S, '.claude', 'skills', 'report-bug', 'SKILL.md')) ? readFileSync(join(S, '.claude', 'skills', 'report-bug', 'SKILL.md'), 'utf8') : '';
const TPL_C = (/### Template C[\s\S]*?```markdown\r?\n([\s\S]*?)```/.exec(RB_TEXT) || [])[1] || '';
ok(/^## Description$/m.test(TPL_C) && /^## Steps to reproduce$/m.test(TPL_C) && /^## Expected result$/m.test(TPL_C) &&
   /^## Actual result$/m.test(TPL_C) && /\*\*Build:\*\*/.test(TPL_C) && /\*\*Evidence:\*\*/.test(TPL_C),
   's25 развёрнутый /report-bug — шаблон C: четыре раздела и строки Build · Environment · Evidence', RB_TEXT.slice(0, 200));
const BUGS_DIR = join(S, 'testcases', 'bugs');
mkdirSync(BUGS_DIR, { recursive: true });
const runBug = (name, text) => { writeFileSync(join(BUGS_DIR, name), text); return runLint(`bug testcases/bugs/${name}`, S, DEPLOYED_LINT); };
// незаполненная копия шаблона C — плейсхолдеры не содержание: четыре пустых раздела и три строки названы
r = runBug('unfilled.md', TPL_C);
ok(r.code === 1 && /empty-section: empty section\(s\): Description, Steps to reproduce, Expected result, Actual result/.test(r.out) &&
   /missing-line: missing line\(s\): \*\*Build:\*\* · \*\*Environment:\*\* · \*\*Evidence:\*\*/.test(r.out),
   's25 незаполненная копия шаблона C — `bug` красный: четыре раздела пусты, три строки названы', r.out);
// заполненная копия шаблона C: тело каждого раздела заменяется по его заголовку — заголовки берутся ИЗ шаблона
const FILL = {
  'Description': 'In the cart, a second tap on «Pay» does nothing once the first payment was cancelled.',
  'Steps to reproduce': '1. Open the cart with one item.\n2. Tap «Pay», then cancel on the payment screen.\n3. Tap «Pay» again.',
  'Expected result': 'The payment screen opens again (requirement CART-12).',
  'Actual result': 'Nothing happens; the console shows `TypeError: order is null`.',
};
const fillC = (tpl, over = {}) => {
  const fill = { ...FILL, ...over };
  let out = tpl.replace(/^# <[^\n]*$/m, '# The Pay button does not answer a second tap')
    .replace(/^\*\*Build:\*\*[^\n]*$/m, '**Build:** 2.8.1 (a1b2c3d) · **Environment:** Android 14, Chrome 129, stage, a fresh account · **Evidence:** `cart-pay-2nd-tap.mp4`');
  for (const [head, body] of Object.entries(fill)) {
    const re = new RegExp(`^## ${head}\\r?\\n[\\s\\S]*?(?=^## |(?![\\s\\S]))`, 'm');
    out = body === null ? out.replace(re, '') : out.replace(re, `## ${head}\n${body}\n\n`);
  }
  return out;
};
const FILLED = fillC(TPL_C);
r = runBug('filled.md', FILLED);
ok(r.code === 0 && /testrun-lint bug OK — testcases\/bugs\/filled\.md: four sections, three lines, the steps a path$/m.test(r.out),
   's25 отчёт по шаблону C, заполненный, — `bug` зелёный (четыре раздела, три строки, шаги — путь)', r.out + FILLED.slice(0, 300));
r = runBug('no-expected.md', fillC(TPL_C, { 'Expected result': null }));
ok(r.code === 1 && /no-expected\.md — missing-section: missing section\(s\): Expected result — a tester's report is/.test(r.out) && !/empty-section|missing-line/.test(r.out),
   's25 отчёт без «## Expected result» — `bug` красный и называет пропавший раздел, ничего сверх', r.out);
// форма тикета #105: «точных шагов не помню» — шаги прозой, одна попытка
r = runBug('no-steps.md', fillC(TPL_C, { 'Steps to reproduce': 'I do not remember the exact steps, but it happened after a cancel.' }));
ok(r.code === 1 && /steps-not-a-path: Steps to reproduce is not a numbered list/.test(r.out),
   's25 шаги прозой («точных шагов не помню» — форма #105) — `bug` красный: шаги не путь пользователя', r.out);
// охота: «не воспроизвелось» с двумя вариантами — красный «меньше трёх»; с тремя — зелёный и счёт вслух; без охоты — 0 вариантов
const HUNT_HEAD = '## Reproduction hunt\n\n| # | variant (axis: value) | outcome |\n|---|---|---|\n';
const HUNT_ROWS = ['| 1 | data and state: an empty cart, then one item | not reproduced |',
  '| 2 | timing and races: the second tap within 300 ms | not reproduced |', '| 3 | account: accumulated, 40 past orders | not reproduced |'];
const notRepro = (rows) => FILLED.replace(/^(\*\*Build:\*\*[^\n]*)$/m, '$1\n**Status:** not reproduced after the variants below') +
  (rows === null ? '' : `\n${HUNT_HEAD}${rows.join('\n')}\n`);
r = runBug('hunt-2.md', notRepro(HUNT_ROWS.slice(0, 2)));
ok(r.code === 1 && /hunt-2\.md — hunt-too-short: .*lists 2 variant\(s\) — fewer than 3 tried/.test(r.out),
   's25 «не воспроизвелось» с двумя вариантами охоты — `bug` красный «меньше трёх»', r.out);
r = runBug('hunt-3.md', notRepro(HUNT_ROWS));
ok(r.code === 0 && /hunt-3\.md: four sections, three lines, the steps a path, a hunt of 3 variants/.test(r.out),
   's25 «не воспроизвелось» с тремя вариантами — `bug` зелёный, счёт вариантов вслух', r.out);
r = runBug('hunt-none.md', notRepro(null));
ok(r.code === 1 && /hunt-too-short: .*lists 0 variant\(s\)/.test(r.out),
   's25 «не воспроизвелось» без раздела охоты — `bug` красный: ноль вариантов', r.out);
// язык проекта: тот же отчёт по-русски — зелёный (ключевые слова обоих языков поставки)
r = runBug('ru.md', ['# Кнопка «Оплатить» не отвечает на второе нажатие', '',
  '**Сборка:** 2.8.1 (a1b2c3d) · **Окружение:** Android 14, стейдж, свежая учётная запись · **Улики:** запись экрана `pay.mp4`', '',
  '## Описание', 'Второе нажатие «Оплатить» после отмены ничего не делает.', '',
  '## Шаги воспроизведения', '1. Открыть корзину с одним товаром.', '2. Нажать «Оплатить» и отменить.', '3. Нажать «Оплатить» снова.', '',
  '## Ожидаемый результат', 'Экран оплаты открывается снова.', '', '## Фактический результат', 'Ничего не происходит.', ''].join('\n'));
ok(r.code === 0 && /ru\.md: four sections, three lines, the steps a path/.test(r.out), 's25 отчёт тестировщика по-русски — `bug` зелёный', r.out);
r = runLint('bug testcases/bugs/absent.md', S, DEPLOYED_LINT);
ok(r.code === 1 && /no such report: testcases\/bugs\/absent\.md/.test(r.out), 's25 `bug` на несуществующем файле — отказ с именем, не «OK»', r.out);
// суд TB3: F1 — любая форма «не воспроизвелось» (одна фраза на язык пропускала «не воспроизводится» без охоты — провал тикета #105);
// F7 — каталог вместо отчёта: отказ с именем, не трасса стека EISDIR; F2 — шаблон тест-кейсов больше не несёт старую форму шага 6
r = runBug('ru-form.md', notRepro([HUNT_ROWS[0]]).replace('**Status:** not reproduced after the variants below', '**Статус:** не воспроизводится'));
ok(r.code === 1 && /ru-form\.md — hunt-too-short: .*lists 1 variant\(s\)/.test(r.out),
  's25 «Статус: не воспроизводится» с одним вариантом — `bug` красный «меньше трёх» (форма, которую первая редакция пропускала)', r.out);
r = runLint('bug testcases/bugs', S, DEPLOYED_LINT);
ok(r.code === 1 && /testcases\/bugs is not a file/.test(r.out) && !/\n\s+at .*\.mjs:\d+|EISDIR/.test(r.out), 's25 `bug <каталог>` — отказ с именем, не трасса стека EISDIR', r.out);
const TC_TPL = existsSync(join(S, '.kaif', '_testcases-template.md')) ? readFileSync(join(S, '.kaif', '_testcases-template.md'), 'utf8') : '';
ok(/template C of `\/report-bug`/.test(TC_TPL) && !/steps to reproduce · expected vs\s+actual · severity\/priority/.test(TC_TPL),
  's25 развёрнутый шаблон тест-кейсов ведёт к шагам 6–7 и шаблону C, прежней формы шага 6 в нём нет', TC_TPL.slice(-400));

// --------------------------------- (4) ось «конституция сохранила обязательства шаблона» (эпик FR, plans/113)
// Тикет #68: сгенерированная конституция сохранила 5 правил §2 из 9 шаблонных — четыре правила
// («не перебивай занятого» · «не молчи о блокере/простое» · «помощь уважительно» · «какофония запрещена»)
// исчезли при генерации, и ни один гейт не сказал ни слова. Свод судит развёрнутую копию (та же, что выше).
console.log('\n=== s25: развёрнутая копия — ось «конституция сохранила обязательства шаблона» (FR) ===');
const CONST_TPL = join(S, '.claude', 'skills', 'team-deployment', 'references', 'team-constitution-template.md');
const CONST = join(S, 'TEAM_CONSTITUTION.md');
ok(existsSync(CONST_TPL), 's25 фикстура: шаблон конституции приехал установкой', CONST_TPL);
const tplText = existsSync(CONST_TPL) ? readFileSync(CONST_TPL, 'utf8') : '';
ok(/^6\. 🔴 \*\*A free seat asks for work\.\*\*/m.test(tplText),
   's25 фикстура: §2 шаблона несёт отдельный пункт 6 «A free seat asks for work» (эпик FR, #68)', tplText.slice(0, 200));
// строки ПРО КОНСТИТУЦИЮ отделяются от прочих предупреждений check (выше по своду живут предупреждения о /resume)
const constLines = (out) => out.split(/\r?\n/).filter((l) => /TEAM_CONSTITUTION\.md/.test(l));
// (а) конституция, скопированная из шаблона, — тишина
writeFileSync(CONST, tplText);
r = runCore('check');
ok(r.code === 0 && constLines(r.out).length === 0, 's25 конституция из шаблона — check молчит о ней (код 0)', r.out);
// (б) ФОРМА ПОЛЯ: вырезаны ровно те четыре правила §2, которые потеряла полевая генерация
const FIELD_LOST = ['Do not interrupt the busy.', 'Never stay silent about a blocker.', 'Help respectfully.', 'No cacophony.'];
const cutRules = (text, leads) => {
  const out = []; let drop = false;
  for (const l of text.split(/\r?\n/)) {
    const lead = /^[ \t]*\d+\.[ \t]+(?:[^\sA-Za-z*]+[ \t]*)?\*\*(.+?)\*\*/.exec(l);
    if (lead) drop = leads.includes(lead[1].trim());
    if (!drop) out.push(l);
  }
  return out.join('\n');
};
const cutText = cutRules(tplText, FIELD_LOST);
ok(FIELD_LOST.every((a) => !cutText.includes(a)) && cutText.includes('A free seat asks for work.'),
   's25 фикстура потери: четыре правила поля вырезаны, пункт 6 на месте', cutText.slice(0, 120));
writeFileSync(CONST, cutText);
r = runCore('check');
ok(r.code === 0, 's25 конституция с потерей — check остаётся ЗЕЛЁНЫМ (предупреждение, не отказ)', r.out.slice(-400));
ok(/⚠ TEAM_CONSTITUTION\.md lost 4 obligation\(s\) of the template: /.test(r.out) &&
   FIELD_LOST.every((a) => r.out.includes(`§2 "${a}"`)),
   's25 потеря формы поля — предупреждение называет ПОИМЁННО все четыре правила §2 (#68)', r.out);
ok(/restore them, or declare the omission beside the item with `<!-- constitution-ok: <why> -->` \(origin issue #68; template: \.claude\/skills\/team-deployment\/references\/team-constitution-template\.md\)/.test(r.out),
   's25 потеря — строка называет и лекарство, и объявленное исключение, и найденный шаблон', r.out);
// (б2) АДРЕСНОСТЬ починки fail-open (судья интеграции 2026-09-18, каверза К4): обязательство считается СОХРАНЁННЫМ,
// только когда стоит среди нумерованных пунктов §2 — документ, который УПОМИНАЕТ удалённые правила вне §2
// (приложение «что мы убрали»), всё равно называет их потерянными. Мутант `kept = (a) => doc.includes(a)`
// (сверка по всему тексту — та самая первая сборка) на этой фикстуре молчит → ассерт красный.
writeFileSync(CONST, cutText + '\n## Appendix — rules we dropped on purpose\n\n' + FIELD_LOST.map((a) => '- **' + a + '**').join('\n') + '\n');
r = runCore('check');
ok(r.code === 0 && /⚠ TEAM_CONSTITUTION\.md lost 4 obligation\(s\) of the template: /.test(r.out) && FIELD_LOST.every((a) => r.out.includes(`§2 "${a}"`)),
   's25 правила, УПОМЯНУТЫЕ вне §2 (приложение «что убрали»), всё равно названы потерянными — якорь ищется среди пунктов §2, не по всему тексту (К4)', r.out);
// (в) ПЕРЕВЕДЁННАЯ конституция: якоря не совпадут ни одним — сверка по СЧЁТУ, и ось говорит это вслух
const ruText = tplText.replace(/^## 2\. Communication regimen[\s\S]*?(?=^## 3\.)/m,
  '## 2. Reglament obshcheniya\n\n1. **Odno soobshchenie - odno delo.** ...\n2. **Forma postanovki** ...\n' +
  '3. **Forma otcheta** ...\n4. **Ne perebivay zanyatogo.** ...\n5. **Ne molchi o blokere.** ...\n\n');
writeFileSync(CONST, ruText);
r = runCore('check');
ok(r.code === 0 && /⚠ TEAM_CONSTITUTION\.md cannot match translated anchors: 10 expected in §2, 5 found — 5 obligation\(s\) of the template are missing/.test(r.out),
   's25 переведённая конституция — предупреждение СЧЁТОМ («10 expected in §2, 5 found»), код 0', r.out);
ok(/the template's own order: 1 "One message/.test(r.out) && /6 "A free seat asks for work\."/.test(r.out),
   's25 переведённая — ось печатает порядок шаблона, чтобы потерянное было чем восстановить', r.out);
ok(!/lost \d+ obligation\(s\) of the template/.test(r.out),
   's25 переведённая — ни одна СЕКЦИЯ не названа потерянной: заголовки сверяются по НОМЕРУ, который переживает перевод', r.out);
// (г) удалённый заголовок секции — назван по НОМЕРУ (номер переживает перевод, заголовок — нет)
writeFileSync(CONST, tplText.replace(/^## 7\. Machine resources — singletons and locks$/m, '## Machine resources'));
r = runCore('check');
ok(r.code === 0 && /lost 1 obligation\(s\) of the template: §7 "Machine resources — singletons and locks"/.test(r.out),
   's25 удалённый заголовок `## 7.` — назван по номеру и заголовку шаблона', r.out);
// (д) объявленное исключение владельца снимает РОВНО своё обязательство
writeFileSync(CONST, cutText + '\n<!-- constitution-ok: Do not interrupt the busy. — two seats, both the owner\'s own windows -->\n');
r = runCore('check');
ok(r.code === 0 && /lost 3 obligation\(s\) of the template: /.test(r.out) && !r.out.includes('§2 "Do not interrupt the busy."') &&
   r.out.includes('§2 "No cacophony."'),
   's25 маркер `constitution-ok` снимает ровно объявленное обязательство, остальные три названы', r.out);
// (е) конституции нет — тишина (ось нужна команде, а не одиночной сессии)
rmSync(CONST, { force: true });
r = runCore('check');
ok(r.code === 0 && constLines(r.out).length === 0, 's25 без TEAM_CONSTITUTION.md — ось молчит', r.out);

// ---------------------------------------------------------------- (5) скелет домашних правил (CK 2.8)
// Эпик CK 2.8 (plans/118, шаг CK4.5; тикеты origin #89/#90): у яруса 4 таксономии есть ФАЙЛ. На СВЕЖЕЙ развёрнутой копии
// (копия S выше изрезана мутантами /resume) — скелет приехал установкой; руководство, /fix-vision и /resume называют его;
// заполненная копия HOUSE_RULES.md переживает update побайтно (файл проекта — машинерия его не пишет), а скелет обновляется.
// update герметичен: coreRunner подставляет --baseline (bugs/109).
console.log('\n=== s25: развёрнутая копия — скелет домашних правил (CK 2.8) ===');
const SH = join(ROOT, 'deploy-hr');
mkdirSync(join(SH, '.kaif', 'install'), { recursive: true });
cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(SH, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(SH, '.kaif', 'kaif-core.mjs'));
const runHr = coreRunner(ROOT);
r = runHr(SH, 'install');
ok(r.code === 0, 's25 свежая копия для скелета — install exit 0', r.out.slice(-400));
const HR_TPL = join(SH, '.kaif', '_house-rules-template.md');
const HR_CP = 'cp .kaif/_house-rules-template.md HOUSE_RULES.md';
const readSh = (rel) => existsSync(join(SH, rel)) ? readFileSync(join(SH, rel), 'utf8') : '';
ok(existsSync(HR_TPL), 's25 скелет домашних правил приехал установкой: .kaif/_house-rules-template.md');
ok(readSh('.kaif/_house-rules-template.md').includes('[OWNER] <date and time> · <where the verbatim lives'),
   's25 скелет несёт форму правила владельца со строкой происхождения (раздел 1)');
ok(readSh('AGENT_GUIDE.md').includes(HR_CP), 's25 развёрнутое руководство (ярус 4) несёт команду копии скелета');
ok(readSh('.claude/skills/fix-vision/SKILL.md').includes(HR_CP), 's25 развёрнутый /fix-vision (шаг 3) несёт команду копии скелета');
ok(/^- \*\*If the project has one:\*\* `HOUSE_RULES\.md` — /m.test(readSh('.claude/skills/resume/SKILL.md')),
   's25 развёрнутый /resume называет HOUSE_RULES.md условным буллетом шага 1 (условие первым — ось ядра файла не требует)');
// копия по команде канона + одно правило владельца; затем update с версией выше — копия цела побайтно
const HR = join(SH, 'HOUSE_RULES.md');
if (existsSync(HR_TPL)) cpSync(HR_TPL, HR);
else writeFileSync(HR, '# House rules\n');
writeFileSync(HR, readFileSync(HR, 'utf8') + '\n### R2. Close every ticket with a short comment\n\n1. Write the comment.\n\n[OWNER] 2026-09-24 22:30 +03:00 · commit 1a2b3c4\n');
const hrBefore = readFileSync(HR);
r = runHr(SH, 'check');
// С 2.8 (эпик CK, шаг CK5.9) справочная строка цены входа НАЗЫВАЕТ файл — /resume его читает; жалобой она не является.
// Ассерт судит «ни одной жалобы на файл проекта», а строку цены — отдельно: она обязана его сосчитать.
const hrComplaints = r.out.split(/\r?\n/).filter((l) => !l.startsWith('ℹ entry cost:')).join('\n');
ok(r.code === 0 && !/HOUSE_RULES/.test(hrComplaints) && /ℹ entry cost:[^\n]*\+ HOUSE_RULES\.md/.test(r.out),
   's25 копия с HOUSE_RULES.md — check зелёный, жалоб на файл проекта нет, а строка цены входа его считает', r.out.slice(-400));
const SRC_HR = join(ROOT, 'src-hr-9.9'); mkdirSync(SRC_HR);
cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(SRC_HR, 'KAIF-CORE-BUNDLE.md'));
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(SRC_HR, 'KAIF-CORE.mjs'));
writeFileSync(join(SRC_HR, 'kaif-manifest.json'), JSON.stringify({ ...JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')), version: '9.9' }, null, 2) + '\n');
r = runHr(SH, `update --source ${SRC_HR}`);
ok(r.code === 0, 's25 update → 9.9 поверх копии с HOUSE_RULES.md — exit 0', r.out.slice(-400));
ok(readFileSync(HR).equals(hrBefore), 's25 update не тронул HOUSE_RULES.md — файл проекта цел побайтно');
ok(readSh('.kaif/_house-rules-template.md').includes(HR_CP), 's25 после update скелет на месте в .kaif/ — копия проекта и скелет живут раздельно');
// формы адреса строки происхождения: три формы подсказки скелета принимает РАЗВЁРНУТЫЙ линтер авторства; адрес «по памяти»
// и незаполненная копия краснеют (лёгкий судья CK4.5, находки 1–2: подсказка вела в две формы, на которых линтер краснел,
// а кавычки заглушки в окне ±2 строки зеленили любую строку)
const ATTR = join(SH, '.kaif', 'tools', 'kaif-attribution-lint.mjs');
ok(existsSync(ATTR), 's25 линтер авторства приехал установкой: .kaif/tools/kaif-attribution-lint.mjs');
const runAttr = (file) => {
  try { return { code: 0, out: execSync(`node ${ATTR} check ${file} 2>&1`, { cwd: SH, stdio: 'pipe' }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd: SH, args: file }); }
};
const hrTpl = readSh('.kaif/_house-rules-template.md');
const PROV_RE = /^\[OWNER\] <date and time> · <where the verbatim lives[^\n]*$/m;
ok(PROV_RE.test(hrTpl), 's25 фикстура: у скелета одна строка происхождения-заглушка');
const HR_PROBE = join(SH, 'HOUSE_RULES_PROBE.md');
for (const addr of ['commit 1a2b3c4', 'interview #034, Q1', 'decision #12']) {
  writeFileSync(HR_PROBE, hrTpl.replace(PROV_RE, `[OWNER] 2026-09-24 22:30 +03:00 · ${addr}`));
  r = runAttr('HOUSE_RULES_PROBE.md');
  ok(r.code === 0, `s25 заполненная копия с адресом «${addr}» — линтер авторства зелёный`, r.out.slice(-300));
}
writeFileSync(HR_PROBE, hrTpl.replace(PROV_RE, '[OWNER] 2026-09-24 22:30 +03:00 · I remember it from chat'));
r = runAttr('HOUSE_RULES_PROBE.md');
ok(r.code === 1, 's25 копия с адресом «по памяти» — линтер авторства красный', r.out.slice(-300));
writeFileSync(HR_PROBE, hrTpl);
r = runAttr('HOUSE_RULES_PROBE.md');
ok(r.code === 1, 's25 незаполненная копия скелета — линтер авторства красный (заглушка не адрес)', r.out.slice(-300));
rmSync(HR_PROBE, { force: true });

if (failures) { console.error(`\n❌ s25: ${failures} of ${asserts} check(s) failed`); process.exit(1); }
console.log(`\n✅ s25 testrun-lint: all ${asserts} checks green`);
