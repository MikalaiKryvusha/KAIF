// sandboxes2.mjs — песочницы Фазы 5.3 (модульный update). Сценарии из полевых отчётов:
// NDim (локализованный модуль переживает ДВА цикла обновления), KPOT (по-модульный мердж:
// апстримный модуль заменён, локальный сохранён, диффы только там, где апстрим менял),
// конвенции owner-шаблонов, i18n: translated, пин-тест сплиттеров ядра и сборки.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { splitModules, joinModules } from '../module-map-lib.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(REPO, 'dist');
const ROOT = resolve(process.argv[2] || join(tmpdir(), 'kaif-sbx-modular'));
rmSync(ROOT, { recursive: true, force: true });
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const run = (cwd, args) => {
  try { return { code: 0, out: execSync(`node ${join(cwd, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};
const seed = (dir) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  cpSync(join(DIST, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};

// ---- препарирование апстрима v9.9: правим модули ВНУТРИ блоков бандла --------------------
const FENCE = '`'.repeat(6);
function editBundleModule(bundleText, filePath, moduleIndex, mutate) {
  const re = new RegExp('(^> \\*\\*FILE: `' + filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n)([\\s\\S]*?)(\\n' + FENCE + ')', 'm');
  const m = bundleText.match(re);
  if (!m) throw new Error('block not found: ' + filePath);
  const content = m[2] + '\n';
  const mods = splitModules(content);
  mutate(mods[moduleIndex]);
  const rebuilt = joinModules(mods);
  return bundleText.replace(re, m[1] + rebuilt.replace(/\n$/, '') + m[3]);
}
const SRC = join(ROOT, 'src-9.9'); mkdirSync(SRC);
let bundle = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
// PHILOSOPHY.md: модуль [2] — апстримная правка (для NDim-сценария);
// pause/SKILL.md: модуль [2] — апстримная правка (KPOT: локальная правка будет в модуле [1]);
// EXPERIENCE.md (owner): модуль [0] — смена конвенции шаблона.
const philMods = splitModules((bundle.match(new RegExp('> \\*\\*FILE: `PHILOSOPHY\\.md`[^]*?' + FENCE + '\\w*\\n([^]*?)\\n' + FENCE, 'm')) || [])[1] + '\n');
bundle = editBundleModule(bundle, 'PHILOSOPHY.md', 2, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (philosophy)'));
bundle = editBundleModule(bundle, '.claude/skills/pause/SKILL.md', 2, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (pause)'));
bundle = editBundleModule(bundle, 'EXPERIENCE.md', 0, (m) => m.lines.push('', 'TEMPLATE CONVENTION CHANGE 9.9'));
writeFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), bundle);
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(SRC, 'KAIF-CORE.mjs'));
const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
man.version = '9.9';
man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md')));
writeFileSync(join(SRC, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
// v9.10 поверх 9.9 — второй цикл (контент тот же, версия выше)
const SRC2 = join(ROOT, 'src-9.10'); mkdirSync(SRC2);
cpSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), join(SRC2, 'KAIF-CORE-BUNDLE.md'));
cpSync(join(SRC, 'KAIF-CORE.mjs'), join(SRC2, 'KAIF-CORE.mjs'));
const man2 = { ...man, version: '9.10' };
writeFileSync(join(SRC2, 'kaif-manifest.json'), JSON.stringify(man2, null, 2) + '\n');

// ---------------------------------------------------------------- S5: установка + NDim + KPOT
console.log('\n=== S5: v2-манифест · NDim (локализация живёт 2 цикла) · KPOT (по-модульный мердж) ===');
const S5 = join(ROOT, 's5'); mkdirSync(S5); seed(S5);
let r = run(S5, 'install --lang ru');
ok(r.code === 0, 'S5 install --lang ru exit 0', r.out);
const dm0 = JSON.parse(readFileSync(join(S5, '.kaif', 'deploy-manifest.json'), 'utf8'));
ok(dm0.manifestVersion === 2 && dm0.templateShas && dm0.moduleShas && Object.keys(dm0.moduleShas).length > 40,
   'S5 манифест v2: templateShas + moduleShas на месте (' + Object.keys(dm0.moduleShas || {}).length + ' md-файлов)');

// NDim: локализуем ТЕЛО модуля [1] PHILOSOPHY.md (заголовок цел), апстрим в 9.9 менял модуль [2]
const PHIL = join(S5, 'PHILOSOPHY.md');
let phil = readFileSync(PHIL, 'utf8');
const pm = splitModules(phil);
pm[1].lines = [pm[1].lines[0], '', 'Это переведённый владельцем текст модуля — русская локализация.', ''];
writeFileSync(PHIL, joinModules(pm));
// KPOT: локальная правка модуля [1] в pause/SKILL.md (апстрим менял [2])
const PAUSE = join(S5, '.claude/skills/pause/SKILL.md');
const pz = splitModules(readFileSync(PAUSE, 'utf8'));
pz[1].lines.push('', 'LOCAL PROJECT EDIT (pause module 1)');
writeFileSync(PAUSE, joinModules(pz));
// owner-контент: EXPERIENCE.md наполняем владельческим
writeFileSync(join(S5, 'EXPERIENCE.md'), '# EXPERIENCE\n\nOWNER CONTENT — MUST SURVIVE\n');

// M2 (plans/49): развёртывание ДО эпохи reports/ (симуляция: сносим README) обязано
// ПОЛУЧИТЬ директорию обновлением — «update доносит существующим»
rmSync(join(S5, 'reports'), { recursive: true, force: true });

r = run(S5, `update --source ${SRC}`);
ok(r.code === 0, 'S5 update →9.9 exit 0', r.out);
ok(existsSync(join(S5, 'reports', 'README.md')), 'S5 update доносит reports/README существующему развёртыванию');
phil = readFileSync(PHIL, 'utf8');
ok(phil.includes('русская локализация'), 'NDim: локализованный модуль ПЕРЕЖИЛ update №1');
ok(phil.includes('UPSTREAM ADDITION 9.9 (philosophy)'), 'NDim: апстримный модуль того же файла заменён механически');
const pauseTxt = readFileSync(PAUSE, 'utf8');
ok(pauseTxt.includes('LOCAL PROJECT EDIT'), 'KPOT: локально правленный модуль сохранён');
ok(pauseTxt.includes('UPSTREAM ADDITION 9.9 (pause)'), 'KPOT: апстримный модуль того же файла заменён механически');
ok(readFileSync(join(S5, 'EXPERIENCE.md'), 'utf8').includes('OWNER CONTENT — MUST SURVIVE'), 'owner-контент нетронут');
const task = readFileSync(join(S5, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(task.includes('owner-conventions') && task.includes('EXPERIENCE.md'), 'конвенция owner-шаблона всплыла пунктом задания');
ok(!/merge-modules[^\n]*PHILOSOPHY\.md/.test(task), 'локализованный модуль БЕЗ апстрим-правки не шумит в задаче (KPOT F2: «делать нечего» не показывается)');
ok(/UPSTREAM ADDITION 9\.9 \(pause\)/.test(pauseTxt) && !/merge-modules[^\n]*pause/.test(task), 'pause: апстрим-модуль влит, локальный не требует мержа — файла нет в merge-modules');

// M3 (plans/50, критерии 3 и 6, красным-вперёд): задание обновления НЕСЁТ обязательный пункт
// полевого отчёта (скелет шаблона C — researches/18 §8) с именем файла, пиненным на ЦЕЛЕВУЮ
// версию; скелет — секции с якорями, не полное тело (риск 1 плана 50: пункт ≤ 30 строк —
// грабля NDim «352 строки задания, полезных 80»).
const frS = task.indexOf('- **field-report**');
const frE = task.indexOf('When done, run:', frS);
const frBlock = frS >= 0 && frE > frS ? task.slice(frS, frE) : '';
ok(frBlock.includes('reports/KAIF_UPDATES/') && frBlock.includes('_KAIF_9.9_UPDATE_REPORT.md') &&
   /judge verdict/i.test(frBlock), 'M3: задание update несёт пункт field-report со скелетом шаблона C (файл пинен на 9.9)');
ok(frBlock !== '' && frBlock.split('\n').length <= 30,
   'M3: пункт field-report ≤ 30 строк (скелет, не полное тело)', String(frBlock.split('\n').length));

// цикл №2 — 9.9 → 9.10 (тот же контент): локализация обязана пережить И ЕГО (класс NDim F1).
// Задание цикла №1 сбрасываем СОЗНАТЕЛЬНО: с bugs/25 update отказывает поверх неотработанного
// задания (fail-closed), а этот свод стережёт локализацию, не дисциплину заданий (её стережёт s07/T9).
rmSync(join(S5, 'KAIF_UPDATE_TASK.md'), { force: true });
r = run(S5, `update --source ${SRC2}`);
ok(r.code === 0, 'S5 update →9.10 exit 0', r.out);
phil = readFileSync(PHIL, 'utf8');
ok(phil.includes('русская локализация'), '🔴 ГЛАВНОЕ: локализованный модуль пережил ВТОРОЙ цикл (класс bugs/12-F1 мёртв)');
ok(phil.includes('UPSTREAM ADDITION 9.9 (philosophy)'), 'апстримная правка не потерялась во втором цикле');

// ---------------------------------------------------------------- S6: диффы там, где апстрим менял ЛОКАЛЬНО правленный модуль
console.log('\n=== S6: конфликт (локальная правка + апстрим в ОДНОМ модуле) → дифф в задаче ===');
const S6 = join(ROOT, 's6'); mkdirSync(S6); seed(S6);
run(S6, 'install');
const P6 = join(S6, 'PHILOSOPHY.md');
const p6 = splitModules(readFileSync(P6, 'utf8'));
p6[2].lines.push('', 'LOCAL EDIT in the SAME module upstream changes'); // тот же модуль [2], что менял 9.9
writeFileSync(P6, joinModules(p6));
r = run(S6, `update --source ${SRC}`);
ok(r.code === 0, 'S6 update exit 0', r.out);
const p6txt = readFileSync(P6, 'utf8');
ok(p6txt.includes('LOCAL EDIT in the SAME module'), 'S6 конфликтный модуль НЕ перезаписан');
ok(!p6txt.includes('UPSTREAM ADDITION 9.9 (philosophy)'), 'S6 апстрим-версия конфликтного модуля не наложена молча');
const task6 = readFileSync(join(S6, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(task6.includes('merge-modules') && task6.includes('PHILOSOPHY.md') && task6.includes('```diff') &&
   task6.includes('+ UPSTREAM ADDITION 9.9 (philosophy)') && task6.includes('- LOCAL EDIT in the SAME module'),
   'S6 задача несёт по-модульный дифф «твоя версия → новый шаблон»');

// ---------------------------------------------------------------- S7: i18n translated — переведённое не трогается
// Семантика флага пере-резана эпиком B 2.1 (bugs/20 K2): флаг защищает ПО-ФАЙЛОВО и только файлы,
// реально несущие письменность владельца; чисто-EN файлы продолжают обновляться механически.
// Свод стережёт защитную половину: ЛОКАЛИЗОВАННЫЙ файл под флагом не меняется на диске.
// (Аналитическая половина — диффы в задании, EN-файлы под флагом — стережётся s07-translated.)
console.log('\n=== S7: маркер i18n: translated — переведённый файл не заменяется ===');
const S7 = join(ROOT, 's7'); mkdirSync(S7); seed(S7);
run(S7, 'install --lang ru');
const mk = JSON.parse(readFileSync(join(S7, '.kaif', 'kaif.json'), 'utf8'));
mk.i18n = 'translated';
writeFileSync(join(S7, '.kaif', 'kaif.json'), JSON.stringify(mk, null, 2) + '\n');
// файл «несёт письменность владельца»: русская локализация тела модуля (заголовки целы)
const PH7 = join(S7, 'PHILOSOPHY.md');
const ph7 = splitModules(readFileSync(PH7, 'utf8'));
ph7[1].lines.push('', 'Русская локализация тела модуля — файл переведён владельцем.');
writeFileSync(PH7, joinModules(ph7));
r = run(S7, `update --source ${SRC}`);
ok(r.code === 0 && r.out.includes('mechanical replacement disabled'), 'S7 i18n: translated признан, замены выключены для переведённого', r.out);
ok(!readFileSync(PH7, 'utf8').includes('UPSTREAM ADDITION'), 'S7 переведённый файл не заменён и не дополнен молча (dry-run)');
ok(readFileSync(PH7, 'utf8').includes('Русская локализация тела модуля'), 'S7 локализация владельца цела');

// ---------------------------------------------------------------- S8: пин сплиттеров (ядро == библиотека сборки)
console.log('\n=== S8: пин-тест — modules-команда ядра против dist/kaif-module-map.json ===');
const coreOut = JSON.parse(execSync(`node ${join(DIST, 'KAIF-CORE.mjs')} modules --bundle ${join(DIST, 'KAIF-CORE-BUNDLE.md')}`, { stdio: 'pipe' }).toString());
const libMap = JSON.parse(readFileSync(join(DIST, 'kaif-module-map.json'), 'utf8'));
let pinMismatch = 0;
ok(coreOut.moduleCount === libMap.moduleCount, `S8 счётчики модулей равны (${coreOut.moduleCount} vs ${libMap.moduleCount})`);
for (const [p, mods] of Object.entries(libMap.files)) {
  const c = coreOut.files[p];
  if (!c || c.length !== mods.length) { pinMismatch++; continue; }
  for (let i = 0; i < mods.length; i++)
    if (c[i].signature !== mods[i].signature || c[i].sha256 !== mods[i].sha256 || c[i].class !== mods[i].class) { pinMismatch++; break; }
}
ok(pinMismatch === 0, 'S8 сплиттер ядра == сплиттер сборки (сигнатуры, sha, классы всех 517 модулей)', String(pinMismatch));

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ все песочницы 5.3 зелёные'}`);
process.exit(failures ? 1 : 0);
