// s26-voice-lint.mjs — песочница линтера голоса владельца (2.7, эпик VC, plans/105; тикет origin #61 —
// слово владельца: «сколько раз ты этот текст сравнивал с стилометрией владельца?» — ноль; постановка №112:
// пишет ПО стилометрии, с ней в рабочем кеше → независимая проверка → правит → только тогда написан → владельцу).
// Таблица §8 портрета — единственный источник паттернов; модуль своих не несёт. Оба ответа на каждой половине:
// (1) модуль — selftest зелёный (EN + RU) · `load` печатает портрет в контекст и оставляет свидетеля
//     .kaif/voice-marker.json (`--sections` — только совпавшие разделы; без значения или без совпадений — usage,
//     свидетель не пишется) · проект с портретом и таблицей §8: попадание названо строкой `sheet/steps.md:7 —
//     «Помни, что» → подсказка` (exit 1, критерий 2 plans/105 дословно) на EN- и RU-проекте · чистый файл exit 0 ·
//     `--warn` exit 0 с попаданиями, но свидетеля НЕ гасит · фенс невидим · файл, написанный ДО `load`, → «written
//     past the portrait» (exit 1) · без свидетеля — одна строка на прогон · §8 прозой → SKIPPED (exit 3, класс
//     bugs/34: «не судилось» ≠ «чисто») · портрета нет → SKIPPED и для `load`, и для `check` · путь портрета из
//     .kaif/kaif.json → voicePortrait; свидетель чужого портрета → находка · без файлов / чужая команда → usage (exit 2);
// (2) РАЗВЁРНУТАЯ копия (EXP-0010) — модуль .kaif/tools/kaif-voice-lint.mjs и скелет .kaif/_owner-voice-template.md с
//     формой §8 (команды + шапка таблицы) приехали установкой · незаполненная копия скелета как портрет → SKIPPED
//     (плейсхолдеры — не правила) · одна заполненная строка → попадание (и предупреждение «портрет изменился после
//     загрузки»). Красный доказан на ядре 2.6 швом KAIF_DIST (dist коммитится: `git show v2.6:dist/…`).
// [TESTED: 2026-09-12 · отдельный прогон на свежем dist — «✅ s26 voice-lint: all 47 checks green» (счёт печатает сам свод);
//  в составе полигона — «all 25 suites green»; КРАСНЫЙ доказан: `KAIF_DIST=<git show v2.6:dist/…> node
//  tools/sandbox/s26-voice-lint.mjs` → «❌ s26: 7 of 47 check(s) failed» — свод доходит до вердикта, все семь красных
//  адресованы отсутствующей фиче (модуль не приехал · скелет без команд · скелет без таблицы · развёрнутые load/check ×4),
//  40 зелёных; первый прогон свода поймал дефект модуля (счёт строк включал пустой хвост файла: «9 line(s)» на 8-строчном
//  листе), судья эпика — свидетель, отказывавший один раз на дерево, `--warn`, гасивший свидетеля, и пустой `--sections`,
//  писавший полного свидетеля, — всё починено до коммита; отчёт прогона истока — testcases/reports/2026-09-12_polygon-2.7-VC.md]
// (3) 2.8, эпик CK, шаг CK5.9 (б) — голая загрузка печатает разделы для письма (РАЗВЁРНУТЫЙ модуль из dist): тело равно нарезке,
//     итог называет строки и цену в токенах, каждый оставленный раздел назван, его готовая команда грузит ровно его, `--all` —
//     целиком, `--all` с `--sections` — usage; скелет поставки грузится разделами для письма.
// (4) 2.8, эпик VO, шаг VO2 — жанр у строк §8 на РАЗВЁРНУТОМ модуле: check --genre essay · ticket · document · без жанра · чужой
//     жанр; load --genre essay добавляет §3, голая загрузка грузит §1 (ТЕСТ ИЗМЕНЁН в (3): §1 — раздел для письма, plans/120 VO2).
// (5) 2.8, эпик VO, шаг VO3 — портрет-потребитель получает слепок релиза ЗАМЕНОЙ на развёрнутом ядре: пин в бандле; update пишет пункт
//     owner-voice-core копии с преамбулой; checkpoint отказывает до замены и на слиянии, принимает замену байт в байт; чужой и текущий — без пункта.
//     VO4 (судья эпика): пин — только публичные метки и первые строки обеих раскладок слепка; слияние НАД слепком (прежний портрет целиком выше)
//     — отказ контрольной точки и передачи; приватная копия портрета (называет приватное хранилище, не слепок) — без пункта, байт в байт;
//     раздел (4) — строка без метки жанра срабатывает при --genre.
// [TESTED: 2026-09-25 · «all 54 checks green»; на dist v2.7 швом KAIF_DIST — «7 of 54 check(s) failed», ровно новые ассерты;
//  шесть мутантов tools/sandbox/probes/voice-mutants.mjs красны ровно на адресатах; ТЕСТ ИЗМЕНЁН: ассерт голой загрузки раздела (1)
//  требует теперь строки «no writing section … the whole of it is loaded» — у его фикстуры пронумерованы только §8 и §9, и без этой
//  строки он проходил бы по чужой причине; отчёт — testcases/reports/2026-09-25_ck59b-portrait-writing-sections.md]
// [TESTED: 2026-09-25 15:39 +03:00 · «all 61 checks green»; на dist v2.7 швом KAIF_DIST — «14 of 61 check(s) failed»: 7 прежних (разделы для письма) и все
//  7 новых раздела (4); мутанты M7/M8 tools/sandbox/probes/voice-mutants.mjs красны ровно на адресатах; ТЕСТ ИЗМЕНЁН в (3): §1 «Как
//  читать» — раздел для письма (19 из 29 строк, оставлено 5) — plans/120 VO2, строка FORK; отчёт testcases/reports/2026-09-25_vo2-genre-labels.md]
// [TESTED: 2026-09-25 16:07 +03:00 · «all 71 checks green» (+10: раздел (5) — пин в бандле, пункт копии с преамбулой, отказ до замены и на слиянии, приём
//  замены, передача в recheck для задания прежнего ядра и контроль, чужой и текущий портрет без пункта); на dist v2.7 — «22 of 71»: 8 из 10 новых
//  красны, два ассерта передачи на ядре без неё зелены по построению — их красный дают мутанты M11 и M13 (исправлено 2026-09-25 17:19 +03:00: это число
//  прогона ДО переписки контрольного ассерта; после неё на v2.7 — «23 of 71», 9 из 10 новых, наблюдал судья VO4); M9–M13 красны ровно на адресатах; отчёт testcases/reports/2026-09-25_vo3-portrait-replace.md]
// [TESTED: 2026-09-25 17:19 +03:00 · «all 75 checks green» (+4 VO4: пин — публичные метки и обе раскладки; слияние над слепком — отказ контрольной точки и
//  передачи; приватная копия портрета — без пункта; строка без метки при --genre); на dist v2.7 — «27 of 75: раздел (4) — 8 из 8, раздел (5) — 12 из 13 (передача «после замены проходит» на ядре без неё зелёная по построению, её красный — M11), 7 прежних — выбор разделов»; мутанты voice-mutants.mjs — 17 из 17
//  на адресатах (M14–M17 новые); ТЕСТ ИЗМЕНЁН: ассерт чужого портрета ждёт новую строку лога «not derived from it (another owner's portrait or a
//  private copy)» — класс без меток теперь включает приватную копию; отчёт testcases/reports/2026-09-25_vo4-epic-judge-fixes.md]
import { writeFileSync, readFileSync, mkdirSync, cpSync, existsSync, readdirSync, statSync, utimesSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { failed, must, coreRunner } from '../lib/sandbox-run.mjs';
import { createHash } from 'node:crypto';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Шов KAIF_DIST: свод судит РАЗВЁРНУТУЮ копию из dist; подставь старый dist — красный доказан (s23:21).
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
// Корень прогона УНИКАЛЕН по построению (bugs/59) — через tempRoot, никогда фиксированным именем.
const ROOT = tempRoot('voicelint', process.argv[2]);
for (const d of ['.kaif/tools', 'en/sheet', 'ru/sheet', 'prose', 'none', 'marker/.kaif', 'marker/voice', 'deploy/.kaif/install'])
  mkdirSync(join(ROOT, d), { recursive: true });

let failures = 0, asserts = 0;   // счёт ассертов печатает сам свод — число в отчёте есть цитата (EXP-0025)
const ok = (cond, name, extra = '') => {
  asserts++;
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
const LINT = join(ROOT, '.kaif', 'tools', 'kaif-voice-lint.mjs');
// Результат каждой команды судится внутри ok(...) — немых команд в своде нет (bugs/61).
const runLint = (args, cwd, bin = LINT) => {
  try { return { code: 0, out: execSync(`node ${bin} ${args} 2>&1`, { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd, args }); }
};
cpSync(join(REPO, 'framework', 'tools', 'kaif-voice-lint.mjs'), LINT);
cpSync(join(REPO, 'framework', 'templates', '_owner-voice-template.md'), join(ROOT, '.kaif', '_owner-voice-template.md'));

// ---------------------------------------------------------------- (1) модуль: selftest, load, проекты с портретом
console.log('\n=== s26: линтер голоса — selftest, load и проекты с таблицей §8 ===');
let r = runLint('selftest', ROOT);
ok(r.code === 0 && /selftest OK/.test(r.out), 's26 selftest — каждый ответ доказан на фикстурах в памяти, EN + RU', r.out);
ok(/2 languages/.test(r.out), 's26 selftest — два языка поставки сосчитаны', r.out);
ok(/the shipped skeleton, unfilled → no-rules/.test(r.out) && !/✗ the shipped skeleton/.test(r.out), 's26 selftest — незаполненный скелет поставки разбирается в no-rules (строки-примеры — плейсхолдеры)', r.out);
ok(/✓ witness: written BEFORE the first load → finding/.test(r.out) && /✓ witness: written 90 min after the last load → finding/.test(r.out), 's26 selftest — свидетель: текст до первой загрузки и текст позже часа после последней — «written past the portrait»', r.out);

const PORTRAIT = {
  en: `# The Owner's Voice Portrait — Test Owner\n\n## 8. Machine heuristics\n\n| pattern | class | hint | legal exception |\n|---|---|---|---|\n| \`<regular expression>\` | \`<stop / positive>\` | \`<what to write instead>\` | \`<…>\` |\n| \`\\b(Remember that\\|Note that)\\b\` | stop | state the rule; the reader is not reminded | — |\n| \`/\\bjust\\b/i\` | stop | drop the softener | \`/^>/\` |\n\n## 9. Portrait journal\n`,
  ru: `# Портрет голоса владельца — тестовый\n\n## 8. Машинные эвристики\n\n| паттерн | класс | подсказка | законное исключение |\n|---|---|---|---|\n| \`<регулярное выражение>\` | \`<стоп>\` | \`<что писать вместо>\` | \`<…>\` |\n| \`\\b(Помни, что\\|Не забывай)\\b\` | стоп | правило называется, читателю не напоминают | — |\n| \`\\bты\\b\` | стоп | второе лицо в кодексе не звучит | \`/^>/\` |\n\n## 9. Журнал портрета\n`,
};
const STEPS = {
  en: 'Step 1. Roll.\nStep 2. Compare.\nStep 3. Pick the target.\nStep 4. Roll damage.\nStep 5. Apply.\nStep 6. Pass the turn.\nRemember that the target is the creature with the strictly highest roll.\nStep 8. Done.\n',
  ru: 'Шаг 1. Брось.\nШаг 2. Сравни.\nШаг 3. Выбери цель.\nШаг 4. Определи урон.\nШаг 5. Примени.\nШаг 6. Передай ход.\nПомни, что целью становится та, за которую выпало строго наибольшее значение.\nШаг 8. Готово.\n',
};
const HIT_LINE = {
  en: /sheet\/steps\.md:7 — «Remember that» → state the rule; the reader is not reminded/,
  ru: /sheet\/steps\.md:7 — «Помни, что» → правило называется, читателю не напоминают/,
};
const H1 = { en: /^# The Owner's Voice Portrait — Test Owner$/m, ru: /^# Портрет голоса владельца — тестовый$/m };
const CLEAN = { en: 'Step 1. Roll. The target is the creature with the strictly highest roll.\n', ru: 'Шаг 1. Брось. Целью становится та, за которую выпало строго наибольшее значение.\n' };
const FENCED = { en: '```\nRemember that\n```\nStep 1. Roll.\n', ru: '```\nПомни, что\n```\nШаг 1. Брось.\n' };
for (const lang of ['en', 'ru']) {
  const P = join(ROOT, lang);
  writeFileSync(join(P, 'AUTHOR_STYLOMETRY.md'), PORTRAIT[lang]);
  writeFileSync(join(P, 'early.md'), CLEAN[lang]);                     // написан ДО загрузки портрета — мимо портрета
  r = runLint('check early.md', P);
  ok(r.code === 1 && /written past the portrait — no load witness/.test(r.out), `s26 ${lang}: check без свидетеля загрузки — «written past the portrait — no load witness» (exit 1)`, r.out);
  r = runLint('check early.md --warn', P);
  ok(r.code === 1 && /never muted by --warn/.test(r.out), `s26 ${lang}: --warn НЕ гасит свидетеля (exit 1)`, r.out);
  r = runLint('load', P);
  ok(r.code === 0 && H1[lang].test(r.out) && /is now in your working context; witness \.kaif\/voice-marker\.json at /.test(r.out), `s26 ${lang}: load печатает портрет в контекст и оставляет свидетеля`, r.out);
  // 2.8 (CK5.9 б): голая загрузка — уже не «весь портрет», а разделы для письма; у этой фикстуры пронумерованы только §8 и §9,
  // поэтому она идёт запасным путём «целиком» — и ассерт требует, чтобы это было СКАЗАНО, иначе он проходил бы по чужой причине.
  ok(existsSync(join(P, '.kaif', 'voice-marker.json')) && /"sections": "all"/.test(readFileSync(join(P, '.kaif', 'voice-marker.json'), 'utf8')) && /no writing section \(.*\) is numbered in this portrait, so the whole of it is loaded/.test(r.out), `s26 ${lang}: свидетель записан; портрет без разделов для письма грузится целиком, и это сказано вслух (sections: all)`, r.out.slice(-400));
  writeFileSync(join(P, 'sheet', 'steps.md'), STEPS[lang]);            // написаны ПОСЛЕ загрузки — по портрету
  writeFileSync(join(P, 'clean.md'), CLEAN[lang]);
  writeFileSync(join(P, 'fenced.md'), FENCED[lang]);
  r = runLint('check sheet/steps.md', P);
  ok(r.code === 1, `s26 ${lang}: лист с попаданием — линтер КРАСНЫЙ (exit 1)`, r.out);
  ok(HIT_LINE[lang].test(r.out), `s26 ${lang}: попадание названо строкой, паттерном и подсказкой (sheet/steps.md:7 — «…» → подсказка)`, r.out);
  ok(/1 finding\(s\) in 1 file\(s\), 8 line\(s\) against AUTHOR_STYLOMETRY\.md §8 \(2 stop rule\(s\) · 0 positive\(s\)\)/.test(r.out), `s26 ${lang}: итог считает файлы, строки и правила из таблицы §8`, r.out);
  ok(/likeness is not judged/.test(r.out), `s26 ${lang}: граница «похожесть не судится — вердикт владельца» печатается`, r.out);
  r = runLint('check clean.md', P);
  ok(r.code === 0 && /voice-lint OK — 0 findings/.test(r.out) && /loaded 2026-/.test(r.out), `s26 ${lang}: чистый файл, написанный после загрузки, — линтер ЗЕЛЁНЫЙ (exit 0), момент загрузки назван`, r.out);
  r = runLint('check early.md', P);
  ok(r.code === 1 && /written past the portrait — the file was last written at/.test(r.out), `s26 ${lang}: файл, написанный ДО загрузки, — «written past the portrait» (exit 1) при чистых паттернах`, r.out);
  r = runLint('check sheet/steps.md --warn', P);
  ok(r.code === 0 && /warn mode\): 1 hit\(s\)/.test(r.out) && HIT_LINE[lang].test(r.out), `s26 ${lang}: --warn — попадание напечатано, код 0 (калибровка паттернов)`, r.out);
  r = runLint('check fenced.md', P);
  ok(r.code === 0 && /0 findings/.test(r.out), `s26 ${lang}: код-фенс невидим`, r.out);
}
// --- load --sections: только совпавшие разделы (голова портрета всегда едет); без совпадений и без значения — usage, свидетель не тронут
const EN = join(ROOT, 'en');
r = runLint('load --sections "^8"', EN);
ok(r.code === 0 && /## 8\. Machine heuristics/.test(r.out) && !/## 9\. Portrait journal/.test(r.out) && /sections: \^8/.test(r.out) && /2 load\(s\) on record/.test(r.out), 's26 load --sections "^8" — печатает голову и §8, без §9; свидетель помнит фильтр и историю загрузок', r.out);
const markerBefore = readFileSync(join(EN, '.kaif', 'voice-marker.json'), 'utf8');
r = runLint('load --sections "^zzz"', EN);
ok(r.code === 2 && /no H2 section of AUTHOR_STYLOMETRY\.md matches --sections/.test(r.out) && readFileSync(join(EN, '.kaif', 'voice-marker.json'), 'utf8') === markerBefore, 's26 load --sections без совпадений — usage (exit 2), свидетель не изменился', r.out);
r = runLint('load --sections', EN);
ok(r.code === 2 && /--sections needs a regex/.test(r.out), 's26 load --sections без значения — usage (exit 2)', r.out);

// --- SKIPPED: §8 прозой (грепы в фенсе, таблицы нет) — «не судилось» ≠ «чисто»
writeFileSync(join(ROOT, 'prose', 'AUTHOR_STYLOMETRY.md'), '# Portrait\n\n## 8. Machine heuristics\n\n≥10 grep patterns … graduate into a project guard.\n\n```\nrg -n "Remember that" rules/\n```\n');
writeFileSync(join(ROOT, 'prose', 'a.md'), STEPS.en);
r = runLint('check a.md', join(ROOT, 'prose'));
ok(r.code === 3 && /SKIPPED/.test(r.out) && /carries no pattern table/.test(r.out) && /prose only/.test(r.out),
   's26 §8 прозой — SKIPPED (exit 3): «§8 несёт не таблицу паттернов — линтеру нечего читать», с формой вслух', r.out);
// --- SKIPPED: портрета нет — и для check, и для load
writeFileSync(join(ROOT, 'none', 'a.md'), STEPS.en);
r = runLint('check a.md', join(ROOT, 'none'));
ok(r.code === 3 && /SKIPPED/.test(r.out) && /no portrait at AUTHOR_STYLOMETRY\.md/.test(r.out) && /likeness is not judged/.test(r.out),
   's26 без портрета — check SKIPPED (exit 3) с границей вслух', r.out);
r = runLint('load', join(ROOT, 'none'));
ok(r.code === 3 && /SKIPPED/.test(r.out) && /nothing to load/.test(r.out), 's26 без портрета — load SKIPPED (exit 3): загружать нечего', r.out);
// --- путь портрета из маркера: .kaif/kaif.json → voicePortrait — и для load, и для check; свидетель чужого портрета — находка
const M = join(ROOT, 'marker');
writeFileSync(join(M, '.kaif', 'kaif.json'), JSON.stringify({ framework: 'KAIF', version: '2.7', voicePortrait: 'voice/PORTRAIT.md' }));
writeFileSync(join(M, 'voice', 'PORTRAIT.md'), PORTRAIT.en);
r = runLint('load', M);
ok(r.code === 0 && /voice-lint load — voice\/PORTRAIT\.md/.test(r.out), 's26 load читает путь портрета из .kaif/kaif.json → voicePortrait', r.out);
writeFileSync(join(M, 'a.md'), STEPS.en);
r = runLint('check a.md', M);
ok(r.code === 1 && /against voice\/PORTRAIT\.md §8/.test(r.out) && !/no load witness/.test(r.out) && !/another portrait/.test(r.out), 's26 check судит по портрету из маркера, свидетель загрузки принят', r.out);
writeFileSync(join(M, 'voice', 'OTHER.md'), PORTRAIT.en);
writeFileSync(join(M, '.kaif', 'kaif.json'), JSON.stringify({ framework: 'KAIF', version: '2.7', voicePortrait: 'voice/OTHER.md' }));
r = runLint('check a.md', M);
ok(r.code === 1 && /load witness is for another portrait \(voice\/PORTRAIT\.md\)/.test(r.out), 's26 портрет переключён после загрузки — свидетель чужого портрета: находка (exit 1)', r.out);
// --- usage: без файлов и чужая команда — код 2, не «чисто» и не «пропущено»
r = runLint('check', EN);
ok(r.code === 2 && /usage/.test(r.out), 's26 check без файлов — usage (exit 2)', r.out);
r = runLint('bogus', EN);
ok(r.code === 2 && /usage/.test(r.out), 's26 неизвестная команда — usage (exit 2)', r.out);

// ---------------------------------------------------------------- (2) развёрнутая копия
console.log('\n=== s26: развёрнутая копия — модуль и скелет с формой §8 ===');
const S = join(ROOT, 'deploy');
const runCore = (args) => {
  try { return { code: 0, out: execSync(`node ${join(S, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd: S, stdio: 'pipe' }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd: S, args }); }
};
cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(S, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(S, '.kaif', 'kaif-core.mjs'));
r = runCore('install');
ok(r.code === 0, 's26 install exit 0', r.out.slice(-400));
const DEPLOYED_LINT = join(S, '.kaif', 'tools', 'kaif-voice-lint.mjs');
const DEPLOYED_TPL = join(S, '.kaif', '_owner-voice-template.md');
ok(existsSync(DEPLOYED_LINT), 's26 модуль приехал: .kaif/tools/kaif-voice-lint.mjs');
const tpl = existsSync(DEPLOYED_TPL) ? readFileSync(DEPLOYED_TPL, 'utf8') : '';
ok(/kaif-voice-lint\.mjs check/.test(tpl) && /kaif-voice-lint\.mjs load/.test(tpl), 's26 скелет приехал и называет обе команды — load (до первого слова) и check (§7A)');
ok(/^\| pattern \| class \| hint \| legal exception \|$/m.test(tpl), 's26 скелет §8 несёт таблицу «pattern · class · hint · legal exception»');
// незаполненная копия скелета как портрет — SKIPPED: плейсхолдеры не правила (свод доходит до вердикта и без файлов — каверза s25)
if (tpl) writeFileSync(join(S, 'AUTHOR_STYLOMETRY.md'), tpl);
else ok(false, 's26 копия скелета в портрет — скелета в развёрнутой копии нет, копировать нечего');
r = existsSync(DEPLOYED_LINT) ? runLint('load', S, DEPLOYED_LINT) : { code: -1, out: 'module absent' };
ok(r.code === 0 && /is now in your working context/.test(r.out), 's26 развёрнутый load — портрет (копия скелета) в контексте, свидетель записан', r.out);
const bodyOf = (out) => out.split('\n✅ voice-lint load')[0].replace(/\s*$/, '');
ok(r.code === 0 && /sections: writing/.test(r.out) && !/^## 8\. Machine heuristics/m.test(bodyOf(r.out)) && /^## 2-C\. The collocation lexicon/m.test(bodyOf(r.out)) && /«Corpus registry»/.test(r.out),
   's26 развёрнутый load скелета (2.8): разделы для письма со словником §2-C и без §8, реестр корпусов назван среди оставленных', r.out.slice(-700));
writeFileSync(join(S, 'a.md'), STEPS.en);
r = existsSync(DEPLOYED_LINT) ? runLint('check a.md', S, DEPLOYED_LINT) : { code: -1, out: 'module absent' };
ok(r.code === 3 && /holds no rule — placeholders are not rules/.test(r.out), 's26 незаполненная копия скелета — развёрнутый линтер SKIPPED (exit 3): плейсхолдеры — не правила', r.out);
// одна заполненная строка в таблице копии → попадание с подсказкой; портрет изменился после загрузки → предупреждение «reload»
if (tpl) writeFileSync(join(S, 'AUTHOR_STYLOMETRY.md'), tpl.replace(/^\| `<second example:[^\n]*$/m, '| `\\b(Remember that\\|Note that)\\b` | stop | state the rule; the reader is not reminded | — |'));
r = existsSync(DEPLOYED_LINT) ? runLint('check a.md', S, DEPLOYED_LINT) : { code: -1, out: 'module absent' };
ok(r.code === 1 && /a\.md:7 — «Remember that» → state the rule; the reader is not reminded/.test(r.out), 's26 одна заполненная строка §8 в копии — попадание названо с подсказкой (exit 1)', r.out);
ok(/changed since it was last loaded/.test(r.out), 's26 портрет изменился после загрузки — предупреждение «reload» напечатано', r.out);
// 2.8, тикет origin #107: GOAL.md установка записала ДО первой загрузки портрета, и агент его не трогал — это шаблон, а не текст,
// написанный мимо портрета; правленный файл с тем же старым временем записи по-прежнему судится свидетелем
{
  r = existsSync(DEPLOYED_LINT) ? runLint('check GOAL.md', S, DEPLOYED_LINT) : { code: -1, out: 'module absent' };
  ok(/GOAL\.md — byte-equal to what the deploy wrote/.test(r.out) && !/GOAL\.md — written past the portrait/.test(r.out),
     's26 (#107): нетронутый шаблон GOAL.md назван шаблоном («byte-equal to what the deploy wrote»), не «written past the portrait»', r.out.slice(-500));
  const GE = join(S, 'GOAL.md'), goalAt = statSync(GE).mtime;
  writeFileSync(join(S, 'GOAL-edited.md'), readFileSync(GE, 'utf8') + '\nThe owner wants a faster build.\n');
  utimesSync(join(S, 'GOAL-edited.md'), goalAt, goalAt);
  r = existsSync(DEPLOYED_LINT) ? runLint('check GOAL-edited.md', S, DEPLOYED_LINT) : { code: -1, out: 'module absent' };
  ok(r.code === 1 && /GOAL-edited\.md — written past the portrait/.test(r.out) && !/byte-equal to what the deploy wrote/.test(r.out),
     's26 (#107) контроль: правленный файл со старым временем записи — «written past the portrait» (свидетель не ослаблен)', r.out.slice(-500));
}

// ---------------------------------------------------------------- (3) 2.8: голая загрузка — разделы для письма (развёрнутая копия)
// Эпик CK 2.8, шаг CK5.9 (б); тикет #99 п. 3 — полевой портрет весил ~170k токенов и грузился целиком на каждую единицу. Судится
// РАЗВЁРНУТЫЙ модуль из dist: шов KAIF_DIST доводит до него и ядро 2.7 (красный), и мутанты tools/sandbox/probes/voice-mutants.mjs.
// Фикстура — форма полевых портретов: ненумерованные модули «Правила: …» (два с десятибуквенным вторым словом — готовой команде
// нужен якорь конца), словник «2-С» с КИРИЛЛИЧЕСКОЙ буквой, полевой подраздел пар «6Б», реестр корпусов без номера.
console.log('\n=== s26: голая загрузка — разделы для письма, --all, готовые команды разделов ===');
const W = join(ROOT, 'writing');
mkdirSync(W, { recursive: true });
const WP_HEAD = ['# Портрет голоса — тестовый, с разделами', 'связующая записка', ''];
const WP = [   // [заголовок, тело, раздел для письма?]
  ['Реестр корпусов', 'строки', false], ['0. Шесть запретов', 'запрет', true], ['1. Как читать', 'чтение', true],
  ['2. Портрет — регистр РАЗБОР', 'правило', true], ['Правила: Пунктуация и ритм', 'пунктуация', false],
  ['Правила: Морфология и грамматика', 'морфология', false], ['2-С. Словник', 'оборот', true],
  ['5. Анти-портрет', 'маркер', true], ['6. Пары ДО/ПОСЛЕ', 'пара', true], ['6Б. ДО/ПОСЛЕ, регистр ЛОР', 'пара лора', true],
  ['7. Чек-лист', 'проверка', true], ['8. Машинные эвристики', 'таблица', false], ['9. Журнал портрета', 'строка', false],
];
const cutOf = (keep) => WP_HEAD.concat(...WP.filter(keep).map(([t, b]) => ['## ' + t, b])).join('\n');
const WHOLE = cutOf(() => true), WRITING_CUT = cutOf(([, , w]) => w);
writeFileSync(join(W, 'AUTHOR_STYLOMETRY.md'), WHOLE + '\n');
// токены — те же две ставки, что у строки цены входа ядра, посчитанные здесь независимо
const tokS = (s) => { let a = 0, o = 0; for (const ch of s) { if (ch.charCodeAt(0) < 128) a++; else o++; } return a / 2.5 + o / 1.9; };
const kS = (t) => (t < 1000 ? `~${Math.round(t)}` : `~${Math.round(t / 1000)}k`);
const deployed = (args) => (existsSync(DEPLOYED_LINT) ? runLint(args, W, DEPLOYED_LINT) : { code: -1, out: 'module absent' });
const markerW = () => { try { return JSON.parse(readFileSync(join(W, '.kaif', 'voice-marker.json'), 'utf8')); } catch { return {}; } };
r = deployed('load');
ok(r.code === 0 && bodyOf(r.out) === WRITING_CUT, 's26 голая загрузка печатает голову и разделы для письма §0 · §1 · §2 · §2-С · §5 · §6 · §6Б · §7, без реестра, §8, §9 и модулей «Правила»', r.out.slice(-700));
ok(r.out.includes(`(19 of 29 line(s), sections: writing — the head and §0 · §1 · §2 · §2-С · §5 · §6 · §6Б · §7; ${kS(tokS(WRITING_CUT))} of ${kS(tokS(WHOLE))} tokens)`) && markerW().sections === 'writing' && markerW().lines === 19,
   's26 итог голой загрузки называет строки, разделы и цену в токенах (19 из 29 строк); свидетель sections writing', r.out.slice(-700));
const leftLines = r.out.split(/\r?\n/).filter((l) => /tokens  «.*» — --sections "/.test(l));
ok(/ℹ not loaded — 5 section\(s\)/.test(r.out) && /load --all/.test(r.out) && leftLines.length === 5 && WP.filter(([, , w]) => !w).every(([t]) => leftLines.some((l) => l.includes(`«${t}»`))),
   's26 итог называет каждый оставленный раздел с весом и командой и называет --all для всего портрета', r.out.slice(-900));
let exact = 0;
for (const l of leftLines) {
  const m = /«(.*)» — --sections "([^"]*)"/.exec(l);
  const one = m && /^[\x20-\x7e]+$/.test(m[2]) ? deployed(`load --sections "${m[2]}"`) : { code: -1, out: '' };
  const got = bodyOf(one.out).split('\n').filter((x) => x.startsWith('## ')).map((x) => x.slice(3));
  if (one.code === 0 && got.length === 1 && got[0] === m[1]) exact++;
}
ok(leftLines.length === 5 && exact === 5, `s26 каждая напечатанная команда раздела ASCII и грузит ровно свой раздел, оба модуля «Правила» тоже (${exact} of ${leftLines.length})`);
r = deployed('load --all');
ok(r.code === 0 && bodyOf(r.out) === WHOLE && markerW().sections === 'all' && /\(29 line\(s\), sections: all; /.test(r.out), 's26 load --all печатает весь портрет, 29 строк; свидетель sections all', r.out.slice(-500));
r = deployed('load --all --sections "^8"');
ok(r.code === 2 && /--all and --sections exclude each other/.test(r.out), 's26 load --all вместе с --sections: usage (exit 2), ничего не загружено', r.out);

// ---------------------------------------------------------------- (4) 2.8: жанр у строк §8 (развёрнутая копия)
// Эпик VO 2.8, шаг VO2 (plans/120); тикет истока #102 — на прозе владельца строки рабочих текстов давали 214 остановок из 217.
// Метка открывает подсказку строки; имена жанров и правило применимости — как у инструмента хранилища ядра (voice-check.mjs):
// [работа] — все жанры, кроме essay · [документ] — только document · [проза] — только essay · без метки — везде.
console.log('\n=== s26: жанр у строк §8 — check --genre, load --genre essay ===');
const G = join(ROOT, 'genre');
mkdirSync(G, { recursive: true });
writeFileSync(join(G, 'AUTHOR_STYLOMETRY.md'), ['# Портрет — жанры', '', '## 1. Как читать', 'чтение', '', '## 3. Свободная проза', 'регистр прозы', '',
  '## 8. Машинные эвристики', '', '| паттерн | класс | подсказка |', '|---|---|---|',
  '| `/\\bснова\\b/i` | stop | [работа] Автор пишет «вновь». |', '| `/\\bто есть\\b/i` | stop | [документ] Уточнение — скобкой. |',
  '| `/\\bнадеюсь, это поможет\\b/i` | stop | Рамки ассистента нет. |', ''].join('\n'));
const gd = (args) => (existsSync(DEPLOYED_LINT) ? runLint(args, G, DEPLOYED_LINT) : { code: -1, out: 'module absent' });
r = gd('load');
writeFileSync(join(G, 'essay.md'), 'Он снова вышел к морю, то есть к себе.\n');
r = gd('check essay.md --genre essay');
ok(r.code === 0 && !/«снова»/.test(r.out) && !/«то есть»/.test(r.out) && /genre essay: 2 rule\(s\) of other genres silent/.test(r.out),
   's26 check --genre essay: строки [работа] и [документ] молчат на эссе, итог называет две молчащие строки', r.out);
r = gd('check essay.md --genre ticket');
ok(r.code === 1 && /essay\.md:1 — «снова» → \[работа\]/.test(r.out) && !/«то есть»/.test(r.out),
   's26 check --genre ticket: строка [работа] называет попадание, строка [документ] молчит', r.out);
r = gd('check essay.md --genre document');
ok(r.code === 1 && /«снова»/.test(r.out) && /«то есть» → \[документ\]/.test(r.out), 's26 check --genre document: действуют обе метки', r.out);
// строка БЕЗ метки судит любой жанр (находка 8 судьи VO4: ассерта на это не было)
writeFileSync(join(G, 'frame.md'), 'Вот ответ. Надеюсь, это поможет.\n');
r = gd('check frame.md --genre essay');
ok(r.code === 1 && /«Надеюсь, это поможет»/i.test(r.out), 's26 check --genre essay: строка без метки жанра срабатывает и на эссе', r.out);
r = gd('check essay.md');
ok(r.code === 1 && /2 rule\(s\) of AUTHOR_STYLOMETRY\.md §8 carry a genre label/.test(r.out) && /«снова»/.test(r.out) && /«то есть»/.test(r.out),
   's26 check без --genre: судят все строки, как прежде, и прогон называет строки с меткой жанра', r.out);
r = gd('check essay.md --genre prose');
ok(r.code === 2 && /--genre is one of: document · ticket · comment · message · reply · essay/.test(r.out), 's26 check --genre с чужим именем: usage (exit 2)', r.out);
r = gd('load --genre essay');
ok(r.code === 0 && /## 3\. Свободная проза/.test(bodyOf(r.out)) && /sections: writing, genre essay/.test(r.out), 's26 load --genre essay: свободная проза §3 входит в разделы для письма', r.out.slice(-400));
r = gd('load');
ok(r.code === 0 && !/## 3\. Свободная проза/.test(bodyOf(r.out)) && /## 1\. Как читать/.test(bodyOf(r.out)), 's26 голая загрузка: §1 грузится, §3 — нет (он для эссе)', r.out.slice(-400));

// ---------------------------------------------------------------- (5) 2.8: портрет-потребитель получает слепок релиза заменой (развёрнутое ядро)
// Эпик VO 2.8, шаг VO3 (plans/120); тикет истока #103 — слово владельца: при обновлении на 2.8 «обновить ядро на новое, не мержем, а
// заменой». Бандл несёт пин слепка (sha256 · первая строка · ядро · метки происхождения); update узнаёт портрет-потребитель по меткам
// из БАНДЛА и пишет пункт owner-voice-core; контрольная точка сверяет часть слепка байт в байт. Чужой портрет и уже текущий — без пункта.
console.log('\n=== s26: обновление 2.8 — портрет-потребитель получает слепок релиза заменой ===');
const runC = coreRunner(ROOT);
const lfSha = (t) => createHash('sha256').update(String(t).replace(/\r\n/g, '\n'), 'utf8').digest('hex');
const BUNDLE_TEXT = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
const metaM = BUNDLE_TEXT.match(/\*\*FILE: `kaif-bundle-manifest\.json`\*\*[^\n]*\r?\n\r?\n`{6}json\r?\n([\s\S]*?)\r?\n`{6}/);
const PIN = metaM ? (JSON.parse(metaM[1]).ownerVoice || null) : null;
const SNAP = readFileSync(join(REPO, 'AUTHOR_STYLOMETRY.md'), 'utf8').replace(/\r\n/g, '\n');
const HEAD_1X = '# Портрет голоса владельца KAIF — публичный слепок правил';   // первая строка слепка раскладки 1.x (шаблон шапки генератора)
ok(PIN && PIN.sha256 === lfSha(SNAP) && PIN.head === SNAP.split('\n', 1)[0] && Array.isArray(PIN.markers) && PIN.markers.length > 0
   && !PIN.markers.includes('krinik_voice') && Array.isArray(PIN.heads) && PIN.heads.includes(PIN.head) && PIN.heads.includes(HEAD_1X),
   's26 бандл несёт пин слепка владельца: sha256 и первая строка — слепка истока, метки — только публичные, первые строки обеих раскладок слепка', JSON.stringify(PIN || {}).slice(0, 300));
const relDir = (dir, version) => {
  mkdirSync(dir, { recursive: true });
  for (const f of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs']) cpSync(join(DIST, f), join(dir, f));
  const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
  man.version = version;
  for (const f of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs']) man.sha256[f] = createHash('sha256').update(readFileSync(join(dir, f))).digest('hex');
  writeFileSync(join(dir, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
};
const FROM_V26 = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version;
const REL9 = join(ROOT, 'ov-rel-9.9'); relDir(REL9, '9.9');
const RELOLD = join(ROOT, 'ov-rel-old'); relDir(RELOLD, FROM_V26);
const deployC = (name, portrait) => {
  const d = join(ROOT, name);
  mkdirSync(join(d, '.kaif', 'install'), { recursive: true });
  cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(d, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  cpSync(join(DIST, 'KAIF-CORE.mjs'), join(d, '.kaif', 'kaif-core.mjs'));
  must(runC, d, 'install');   // установочный шаг: без развёртывания обновлять нечего
  writeFileSync(join(d, 'AUTHOR_STYLOMETRY.md'), portrait);
  return d;
};
const itemOf = (d) => { const t = existsSync(join(d, 'KAIF_UPDATE_TASK.md')) ? readFileSync(join(d, 'KAIF_UPDATE_TASK.md'), 'utf8') : ''; return (t.match(/^- \*\*owner-voice-core\*\* — [^\n]*/m) || [''])[0]; };
const LOCAL = '<!-- local preamble of this project: the body below is a copy of the stylometry-snapshot.mjs output -->\n<!-- /local -->\n';
// (а) копия старого слепка с локальной преамбулой
const PA = deployC('ov-consumer', LOCAL + '# Портрет голоса владельца KAIF — публичный слепок правил\n\n| **Версия ядра** | **krinik-stylometry 1.2** (объявлена ядром) |\n\nстарое правило\n');
const upA = must(runC, PA, `update --source ${REL9} --baseline ${RELOLD}`);
const itA = itemOf(PA);
ok(PIN && itA.includes(`its sha256 (LF) is ${PIN.sha256}`) && itA.includes(`from its first line «${PIN.head}»`) && /the core it carries: 1\.2/.test(itA) && itA.includes(`the snapshot of core ${PIN.core}`) && /REPLACE the snapshot, never merge it/.test(itA),
   's26 update: портрет-потребитель получает пункт owner-voice-core — пин, первая строка, «ядро 1.2 → новое», замена, а не слияние', itA || upA.out.slice(-600));
r = runC(PA, 'checkpoint owner-voice-core');
ok(r.code !== 0 && /has no line «/.test(r.out), 's26 checkpoint owner-voice-core до замены — отказ: строки слепка релиза в портрете нет', r.out.slice(-400));
writeFileSync(join(PA, 'AUTHOR_STYLOMETRY.md'), LOCAL + SNAP + 'строка, влитая слиянием\n');
r = runC(PA, 'checkpoint owner-voice-core');
ok(r.code !== 0 && /the release pins/.test(r.out), 's26 checkpoint owner-voice-core на слиянии вместо замены — отказ по sha256', r.out.slice(-400));
writeFileSync(join(PA, 'AUTHOR_STYLOMETRY.md'), LOCAL + SNAP);
r = runC(PA, 'checkpoint owner-voice-core');
ok(r.code === 0 && /equals the release snapshot byte for byte/.test(r.out), 's26 checkpoint owner-voice-core после замены (преамбула + слепок байт в байт) — принят', r.out.slice(-400));
// суд RL 2.8, A-F3: слепок, сохранённый с меткой кодировки (BOM) в начале файла, — тот же слепок: прежде первая строка с BOM не равнялась
// первой строке слепка, и отказ говорил «строки слепка нет», хотя она была
writeFileSync(join(PA, 'AUTHOR_STYLOMETRY.md'), String.fromCharCode(0xFEFF) + SNAP);
r = runC(PA, 'checkpoint owner-voice-core');
ok(r.code === 0 && /equals the release snapshot byte for byte/.test(r.out), 's26 checkpoint owner-voice-core (A-F3): слепок с BOM в начале файла — принят, не «строки нет»', r.out.slice(-400));
writeFileSync(join(PA, 'AUTHOR_STYLOMETRY.md'), LOCAL + SNAP);
// (д) слияние НАД слепком (форма судьи VO4): прежний портрет целиком оставлен выше слепка релиза — хвост от первой строки слепка равен
// пину, но локальная часть несёт первую строку публичного слепка прежней раскладки — это слияние, а не замена.
const OLD1X = LOCAL + HEAD_1X + '\n\n| **Версия ядра** | **krinik-stylometry 1.2** (объявлена ядром) |\n\nстарое правило\n';
writeFileSync(join(PA, 'AUTHOR_STYLOMETRY.md'), OLD1X + SNAP);
r = runC(PA, 'checkpoint owner-voice-core');
ok(r.code !== 0 && r.out.includes(`still carries «${HEAD_1X}»`), 's26 checkpoint owner-voice-core на слиянии НАД слепком (прежний портрет целиком выше) — отказ: локальная часть несёт первую строку слепка', r.out.slice(-400));
// (г) ПЕРЕДАЧА — у поля 2.7 → 2.8 задание пишет РАЗВЁРНУТОЕ, прежнее ядро (свежее подменяется в конце, EXP-0157), и пункта owner-voice-core
// в нём нет; отметку recheck ставит СВЕЖЕЕ ядро, и она отказывает, пока портрет-потребитель не заменён. Задание прежнего ядра моделируется
// заданием без пункта (приём s16, CK5.6).
const PD = deployC('ov-handover', LOCAL + '# Портрет голоса владельца KAIF — публичный слепок правил\n\n| **Версия ядра** | **krinik-stylometry 1.2** |\n');
must(runC, PD, `update --source ${REL9} --baseline ${RELOLD}`);
const TD = join(PD, 'KAIF_UPDATE_TASK.md');
writeFileSync(TD, readFileSync(TD, 'utf8').replace(/^- \*\*owner-voice-core\*\* — [^\n]*\n  When done, run: [^\n]*\n/m, ''));
r = runC(PD, 'checkpoint recheck');
ok(r.code !== 0 && /this task was written by the previous core, which had no owner-voice-core item/.test(r.out) && PIN && r.out.includes(PIN.sha256),
   's26 передача: задание прежнего ядра без пункта — recheck свежего ядра отказывает и печатает инструкцию с пином', r.out.slice(-500));
writeFileSync(join(PD, 'AUTHOR_STYLOMETRY.md'), LOCAL + SNAP);
r = runC(PD, 'checkpoint recheck');
ok(r.code === 0 && !/had no owner-voice-core item/.test(r.out), 's26 передача: после замены recheck свежего ядра проходит', r.out.slice(-500));
const PE = deployC('ov-with-item', LOCAL + '# Портрет голоса владельца KAIF — публичный слепок правил\n\n| **Версия ядра** | **krinik-stylometry 1.2** |\n');
must(runC, PE, `update --source ${REL9} --baseline ${RELOLD}`);
r = runC(PE, 'checkpoint recheck');
ok(itemOf(PE) !== '' && !/had no owner-voice-core item/.test(r.out), 's26 передача: у задания с пунктом owner-voice-core recheck отказ не повторяет (портрет ещё не заменён — его судит пункт)', r.out.slice(-500));
// слияние НАД слепком на маршруте передачи: узнавание не считает такой портрет текущим — recheck свежего ядра отказывает
const PF = deployC('ov-handover-merge', OLD1X);
must(runC, PF, `update --source ${REL9} --baseline ${RELOLD}`);
const TF = join(PF, 'KAIF_UPDATE_TASK.md');
writeFileSync(TF, readFileSync(TF, 'utf8').replace(/^- \*\*owner-voice-core\*\* — [^\n]*\n  When done, run: [^\n]*\n/m, ''));
writeFileSync(join(PF, 'AUTHOR_STYLOMETRY.md'), OLD1X + SNAP);
r = runC(PF, 'checkpoint recheck');
ok(r.code !== 0 && /this task was written by the previous core, which had no owner-voice-core item/.test(r.out), 's26 передача: слияние НАД слепком — recheck свежего ядра отказывает (узнавание не считает его текущим)', r.out.slice(-500));
// (б) чужой портрет — ни пункта, ни байта
const FOREIGN = '# Portrait of another owner\n\nrule one of that owner\n';
const PB = deployC('ov-foreign', FOREIGN);
const upB = must(runC, PB, `update --source ${REL9} --baseline ${RELOLD}`);
ok(itemOf(PB) === '' && readFileSync(join(PB, 'AUTHOR_STYLOMETRY.md'), 'utf8') === FOREIGN && /not derived from it \(another owner's portrait or a private copy\), left untouched/.test(upB.out),
   's26 update: чужой портрет (меток нет) — без пункта, файл байт в байт прежний, лог называет это', itemOf(PB) || upB.out.slice(-500));
// (е) приватная копия портрета владельца (судья VO4: развёртывание держит приватный портрет вне git и называет приватное хранилище, но
// не публичный слепок) — в списке потребителей ядра её нет: ни пункта, ни байта
const PRIVATE = '# Портрет голоса (приватная копия)\n\nисточник — приватное хранилище krinik_voice, рабочий слой и цитаты-доказательства\n';
const PH = deployC('ov-private', PRIVATE);
const upH = must(runC, PH, `update --source ${REL9} --baseline ${RELOLD}`);
ok(itemOf(PH) === '' && readFileSync(join(PH, 'AUTHOR_STYLOMETRY.md'), 'utf8') === PRIVATE && /not derived from it/.test(upH.out),
   's26 update: приватная копия портрета (называет приватное хранилище, не слепок) — без пункта, файл байт в байт прежний', itemOf(PH) || upH.out.slice(-500));
// (в) портрет уже текущий — без пункта
const PC = deployC('ov-current', SNAP);
const upC = must(runC, PC, `update --source ${REL9} --baseline ${RELOLD}`);
ok(itemOf(PC) === '' && /already carries this release's snapshot/.test(upC.out), 's26 update: портрет уже равен слепку релиза — без пункта', itemOf(PC) || upC.out.slice(-500));

// ---------------------------------------------------------------- (6) 2.8: модули поставки подключаются без побочного запуска (OW8)
// Эпик OW 2.8, шаг OW8 (plans/119); критерий 24 plans/117, тикет истока #101: инструмент проекта (поле — оценщик стилометрии) берёт у линтера
// голоса ту же грамматику портрета — импорт модуля печатал usage и запускал проверку всего проекта. Каждый модуль поставки с экспортом
// импортируется из ПУСТОГО каталога и печатает только «imported»; инструмент проекта, импортировавший parsePortrait и lintText, печатает
// только свою строку; команда линтера из терминала — прежняя сводка.
console.log('\n=== s26: модули поставки импортируются молча (OW8, #101) ===');
const TOOLS = join(S, '.kaif', 'tools');
const withExports = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => /\.mjs$/.test(f)).map((f) => join(dir, f)) : [])
  .filter((p) => /^export\s/m.test(readFileSync(p, 'utf8')));
const MODS = [...withExports(TOOLS), ...withExports(join(TOOLS, 'contour'))];
const EMPTY = join(ROOT, 'ow8-empty'); mkdirSync(EMPTY, { recursive: true });
ok(MODS.length >= 10, 's26 модулей поставки с экспортом — не меньше десяти (семь линтеров и три файла контура)', String(MODS.length));
for (const p of MODS) {
  const im = spawnSync(process.execPath, ['--input-type=module', '-e', `import(${JSON.stringify(pathToFileURL(p).href)}).then(() => console.log('imported'))`], { cwd: EMPTY, encoding: 'utf8' });
  ok(im.status === 0 && (im.stdout + im.stderr).trim() === 'imported', 's26 импорт модуля поставки молчит: ' + basename(p) + ' — только «imported», код 0 (OW8, #101)', 'exit ' + im.status + ': ' + (im.stdout + im.stderr).slice(0, 300));
}
writeFileSync(join(EMPTY, 'essay-check.mjs'), [
  `import { parsePortrait, lintText } from ${JSON.stringify(pathToFileURL(DEPLOYED_LINT).href)};`,
  `const portrait = parsePortrait(${JSON.stringify(readFileSync(join(S, 'AUTHOR_STYLOMETRY.md'), 'utf8'))});`,
  "const findings = lintText('essay.md', 'Он снова вышел к морю, то есть к себе.', portrait.rules || portrait);",
  "console.log('essay-check: ' + (Array.isArray(findings) ? findings.length : 0) + ' finding(s)');",
].join('\n'));
const tool = spawnSync(process.execPath, [join(EMPTY, 'essay-check.mjs')], { cwd: EMPTY, encoding: 'utf8' });
const toolLines = (tool.stdout + tool.stderr).split(/\r?\n/).filter((l) => l.trim());
ok(tool.status === 0 && toolLines.length === 1 && /^essay-check: \d+ finding\(s\)$/.test(toolLines[0]),
   's26 инструмент проекта берёт у линтера голоса parsePortrait и lintText — в выводе только его строка, ни usage, ни проверки проекта (OW8, #101)', (tool.stdout + tool.stderr).slice(0, 400));

if (failures) { console.error(`\n❌ s26: ${failures} of ${asserts} check(s) failed`); process.exit(1); }
console.log(`\n✅ s26 voice-lint: all ${asserts} checks green`);
