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
  ok(existsSync(join(P, '.kaif', 'voice-marker.json')) && /"sections": "all"/.test(readFileSync(join(P, '.kaif', 'voice-marker.json'), 'utf8')), `s26 ${lang}: свидетель .kaif/voice-marker.json записан (sections: all)`);
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
writeFileSync(join(S, 'a.md'), STEPS.en);
r = existsSync(DEPLOYED_LINT) ? runLint('check a.md', S, DEPLOYED_LINT) : { code: -1, out: 'module absent' };
ok(r.code === 3 && /holds no rule — placeholders are not rules/.test(r.out), 's26 незаполненная копия скелета — развёрнутый линтер SKIPPED (exit 3): плейсхолдеры — не правила', r.out);
// одна заполненная строка в таблице копии → попадание с подсказкой; портрет изменился после загрузки → предупреждение «reload»
if (tpl) writeFileSync(join(S, 'AUTHOR_STYLOMETRY.md'), tpl.replace(/^\| `<second example:[^\n]*$/m, '| `\\b(Remember that\\|Note that)\\b` | stop | state the rule; the reader is not reminded | — |'));
r = existsSync(DEPLOYED_LINT) ? runLint('check a.md', S, DEPLOYED_LINT) : { code: -1, out: 'module absent' };
ok(r.code === 1 && /a\.md:7 — «Remember that» → state the rule; the reader is not reminded/.test(r.out), 's26 одна заполненная строка §8 в копии — попадание названо с подсказкой (exit 1)', r.out);
ok(/changed since it was last loaded/.test(r.out), 's26 портрет изменился после загрузки — предупреждение «reload» напечатано', r.out);

if (failures) { console.error(`\n❌ s26: ${failures} of ${asserts} check(s) failed`); process.exit(1); }
console.log(`\n✅ s26 voice-lint: all ${asserts} checks green`);
