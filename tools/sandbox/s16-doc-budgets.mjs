// s16-doc-budgets.mjs — песочница эпика CB «Бюджет канона» (2.7, `plans/95`; критерии 1–4) и его
// предка — бюджетов размера ядра перечитывания (2.5, эпик CN, шаг CN6; запрос поля 09). Свод один,
// потому что все четыре оси живут в ОДНОМ прогоне ОДНОЙ развёрнутой копии и три из них правят один
// и тот же `cmdCheck`: заводить второй свод значило бы разворачивать копию дважды ради соседних
// строк того же вывода (решение `[ИИ]`, `plans/95` → «Решения, принятые агентом без владельца»).
//
// Что проверяется (всё — на РАЗВЁРНУТОЙ копии из `dist`, не на исходнике: EXP-0010):
//   (1) БЮДЖЕТ ПО СОБСТВЕННЫМ СТРОКАМ (критерий 1): свежий деплой молчит · документ, раздутый
//       ПРИЕХАВШИМ каноном до превышения ОБЩЕГО числа строк, молчит — строки модулей, чья пара
//       (сигнатура, sha) совпала с развёрнутым срезом манифеста, в счёт не идут · раздутый
//       СОБСТВЕННЫМИ строками называется как `own lines N of budget ~M` с адресом выноса ПО
//       ДОКУМЕНТУ (у STATUS — летопись, у остальных — летопись · researches/ · дом. правила) ·
//       документ ВНЕ ядра перечитывания молчит при любом размере · код выхода 0 (совет, не отказ).
//   (2) СМЕСЬ ЯЗЫКОВ ПО ДОЛЕ ТОКЕНОВ (критерий 2): RU-навык с одним английским словом — не
//       назван · навык, где половина прозы английская, — назван как MIX с долей в процентах ·
//       английское тело с тремя кириллическими словами (форма, невидимая старому предикату
//       `re.test(body)`) — назван · токены в бэктиках и код-блоках не считаются (риск (б) плана).
//   (3) ПОРЯДОК ВЫВОДА `install` (критерий 3, вторая половина): строка успеха «deployed
//       mechanically» стоит РАНЬШЕ строки о неполном языковом пакете, а сама строка пакета несёт
//       указатель «что доложить» (`bugs/KAIF/` · `report` · issues истока).
//   (4) ГЕЙТ `check --gate-budgets` (критерий 4; тикет истока #71), ОБЕ его стороны: на
//       развёртывании внутри бюджетов — код 0 и тишина (гейт, краснеющий всегда, — сломанный
//       гейт) · на превышении — код 1 ИМЕННО от двери, а не от непонятого флага, и строка
//       `<документ>: own lines N of budget M → <адрес>` на каждом · без флага прежнее поведение
//       и код 0 · незнакомый флаг `check` по-прежнему ОТКАЗЫВАЕТ (bugs/33 не сломан).
//   (6) ХРАПОВИК двери (2.8, эпик CK, шаг CK5.2; тикет истока #84): зелёный прогон пишет пустую базу
//       `.kaif/budget-baseline.json` · первая дверь версии без базы записывает долг и пропускает · стояние,
//       рост и новое превышение останавливают · убывание проходит и затягивает базу · ушедший под бюджет
//       документ вычищен · смена версии переписывает долг · нечитаемая база — стоп с подсказкой.
//   (7) ОБЪЯВЛЕННЫЙ АРХИВ владельца (2.8, эпик CK, шаг CK5.3; тикет #84 п. 1): архив с дайджестом проходит
//       дверь, размер архива — справка · объявление без слова владельца названо · дайджест без имени архива и
//       пропавший дайджест архива не прикрывают · архив не из ядра — находка схемы маркера.
//   (5) ТРИ ЧЕСТНЫЕ ЗАПАСНЫЕ ВЕТКИ, каждая говорит о себе вслух: файл, переведённый ЦЕЛИКОМ (ни
//       одна сигнатура шаблона не выжила — риск (а) плана) · документ owner-seeded той же формы,
//       который проект пишет сам и переводом не является · среза модулей у файла нет вовсе. Во
//       всех трёх собственными считаются ВСЕ строки, и фраза называет, которая из трёх это.
//
// Красный доказан на ядре 2.6 швом `KAIF_DIST` (`git show v2.6:dist/…` в каталог ВНЕ репозитория)
// и ПЯТЬЮ мутантами ПРЕДИКАТОВ на копии `dist` (счёт собственных строк возвращает весь файл ·
// гейт никогда не закрывается · порог смеси 0 · порог смеси 1 · ветка owner-seeded убрана) —
// каждый мутант краснит СВОИ ассерты (отчёт прогона
// `testcases/reports/2026-09-18_canon-budget.md`).
// [TESTED: 2026-09-18 · зелёный в составе полигона; числа — цитата из собственной итоговой строки
//  свода (EXP-0025/EXP-0127), красные на 2.6 и на мутантах — в отчёте прогона]
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { failed, must } from '../lib/sandbox-run.mjs';
import { gate as budgetGate } from '../budget-gate.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Шов KAIF_DIST: свод судит РАЗВЁРНУТУЮ копию из dist; подставь старый dist — красный доказан.
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
// Корень прогона УНИКАЛЕН по построению (bugs/59) — через tempRoot, никогда фиксированным именем.
const ROOT = tempRoot('budgets', process.argv[2]);
const S = join(ROOT, 'deploy');
mkdirSync(join(S, '.kaif', 'install'), { recursive: true });

let failures = 0, asserts = 0;   // счёт ассертов печатает сам свод — число в отчёте есть цитата (EXP-0025)
const ok = (cond, name, extra = '') => {
  asserts++;
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-400)));
  if (!cond) failures++;
};
// stderr сливается в out и на зелёном коде тоже — предупреждения бюджетов идут в stderr (bugs/61:
// немых команд в своде нет, результат каждой судится внутри ok(...)).
const run = (args) => {
  try { return { code: 0, out: execSync(`node ${join(S, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd: S, stdio: 'pipe', maxBuffer: 64 * 1024 * 1024 }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd: S, args }); }
};
const lines = (doc) => readFileSync(join(S, doc), 'utf8').replace(/\r?\n$/, '').split(/\r?\n/).length;
// Раздувание СОБСТВЕННЫМИ строками: новый заголовок → новый модуль, которого нет в срезе
// манифеста, поэтому ВСЕ его строки собственные по построению (а не «последний модуль испорчен»).
const own = (doc, extra, head) => {
  const p = join(S, doc);
  const cur = readFileSync(p, 'utf8').replace(/\r?\n$/, '');
  const body = Array.from({ length: Math.max(0, extra - 2) }, (_, i) => `own line ${i + 1} — fixture`).join('\n');
  writeFileSync(p, `${cur}\n\n## ${head}\n\n${body}\n`);
};
const skill = (name, body) => {
  const d = join(S, '.claude', 'skills', name);
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'SKILL.md'), `---\nname: ${name}\ndescription: fixture\n---\n\n# ${name}\n\n${body}\n`, 'utf8');
};
const RU = 'Этот навык описывает порядок работы агента над задачей проекта и называет шаги ритуала подробно.';
const EN = 'This skill describes the order in which the agent works on a task and names the steps of the ritual.';

// ================================================================ (3) порядок вывода install
console.log('\n=== s16: установка с неполным языковым пакетом — успех РАНЬШЕ границы пакета ===');
ok(existsSync(join(DIST, 'KAIF-CORE-BUNDLE.md')) && existsSync(join(DIST, 'KAIF-CORE.mjs')),
   's16 фикстура: в dist есть бандл и ядро (иначе разворачивать нечего)', DIST);
cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(S, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(S, '.kaif', 'kaif-core.mjs'));
// Установка — установочный шаг (must): её вывод ЖЕ судится ассертами ниже, поэтому результат нужен.
const inst = must(run, 'install --lang ru');
ok(inst.code === 0, 's16 install --lang ru exit 0', inst.out.slice(-400));
const iSuccess = inst.out.indexOf('deployed mechanically');
const iPack = inst.out.indexOf('INCOMPLETE BY DESIGN');
ok(iSuccess >= 0 && iPack >= 0 && iSuccess < iPack,
   's16 критерий 3: строка успеха «deployed mechanically» стоит РАНЬШЕ строки о неполном пакете',
   `успех на позиции ${iSuccess}, пакет на ${iPack}`);
ok(/↳ WHAT TO REPORT:/.test(inst.out) && /bugs\/KAIF\//.test(inst.out) && /kaif-core\.mjs report/.test(inst.out),
   's16 критерий 3: предупреждение о пакете несёт указатель «что доложить» (bugs/KAIF/ + команда report + issues истока)', inst.out.slice(-600));
ok(/is not a defect — do not report it/.test(inst.out),
   's16 критерий 3: указатель называет и ГРАНИЦУ — сама неполнота пакета не дефект', inst.out.slice(-600));

// ================================================================ (1) бюджет по собственным строкам
console.log('\n=== s16: бюджет судится по СОБСТВЕННЫМ строкам проекта ===');
let r = run('check');
ok(r.code === 0, 's16 свежий деплой — check зелёный', r.out.slice(-400));
ok(!/against its budget|own lines/.test(r.out),
   's16 свежий деплой — check не печатает ни одного предупреждения о бюджете', r.out);
// СТРАЖ РОСТА ПОСТАВКИ (находка F2 судьи сессии 67). До эпика CB ассерт выше и был этим стражем: шаблон, выросший за
// бюджет, давал на свежем деплое строку «N lines against its budget». С переходом на СОБСТВЕННЫЕ строки приехавший
// канон в счёт не идёт — и ассерт разучился падать от роста поставки (мутант судьи: шаблон `AGENT_GUIDE.md` в копии
// бандла 1200 → 1263 строк → 44 из 44 зелёных; тот же мутант под прежним сводом и ядром — красный). А поставка стоит
// РОВНО на пределе (`AGENT_GUIDE.md` 1200 из 1200, `TESTING_FRAMEWORK.md` 300 из 300): ритуал перечитывания стоит
// O(ядра), и раз проекту приехавшее больше не считают, держать приехавшее в бюджете обязан ИСТОК. Судит та же дверь,
// что у истока (`tools/budget-gate.mjs` → `gate`), по ОБЩЕМУ числу строк развёрнутых документов и по таблице
// РАЗВЁРНУТОГО ядра; пропавший документ ядра перечитывания и нечитаемая таблица — тоже красные.
const shipped = budgetGate(S, readFileSync(join(S, '.kaif', 'kaif-core.mjs'), 'utf8'));
ok(shipped.code === 0,
   // имя без тире-разделителя: проба мутантов режет красную строку по первому « — », а адресат обязан уцелеть
   's16 страж роста поставки: на свежем деплое каждый из девяти документов ядра перечитывания в ПОСТАВЛЕННОМ виде внутри своего бюджета по ОБЩЕМУ числу строк',
   shipped.lines.join(' · '));
// Гейт, который краснеет ВСЕГДА, — сломанный гейт (TESTING_FRAMEWORK, гейт 6: «докажи, что было что
// мерить»). Обе стороны двери судятся: здесь — здоровое развёртывание, ниже — превышение.
const gateGreen = run('check --gate-budgets');
ok(gateGreen.code === 0 && !/own lines/.test(gateGreen.out) && /manifest satisfied/.test(gateGreen.out),
   's16 критерий 4: на развёртывании ВНУТРИ бюджетов гейт не закрывается — код 0 и ни одной строки о бюджете', gateGreen.out.slice(-400));
const BASE = join(S, '.kaif', 'budget-baseline.json');
const baseDocs = () => { try { return JSON.parse(readFileSync(BASE, 'utf8')).docs || {}; } catch { return null; } };
ok(existsSync(BASE) && baseDocs() && Object.keys(baseDocs()).length === 0,
   's16 храповик: зелёный прогон двери записал базу без долга (её наличие делает следующее превышение новым)', existsSync(BASE) ? readFileSync(BASE, 'utf8') : 'файла нет');
for (const doc of ['AGENT_GUIDE.md', 'STATUS.md'])
  ok(existsSync(join(S, doc)), `s16 фикстура: ${doc} развёрнут (иначе раздувать нечего)`);

// Приехавший канон в счёт НЕ идёт: делаем документ больше бюджета по ОБЩЕМУ числу строк, оставаясь
// под бюджетом по собственным. Это ровно боль поля — 1655 строк при 1200, из них 300 приехали.
const agBase = lines('AGENT_GUIDE.md');
own('AGENT_GUIDE.md', 200, 'Домашнее правило проекта A');
const agTotal = lines('AGENT_GUIDE.md');
r = run('check');
// Молчание судится по ЛЮБОЙ форме предупреждения о бюджете — и новой (`own lines`), и прежней
// (`N lines against its budget`): ассерт «нет новой строки» был бы зелёным на ядре 2.6, где стоит
// строка старая, то есть проходил бы по чужой причине (EXP-0127).
ok(r.code === 0 && agTotal > 1200 && agBase > 0 && !/AGENT_GUIDE\.md: (own lines|\d+ lines against)/.test(r.out),
   `s16 критерий 1: AGENT_GUIDE ${agTotal} строк при бюджете 1200, но приехавший канон (${agBase}) не считается — предупреждения НЕТ ни в какой форме`, r.out);

// Теперь раздуваем СОБСТВЕННЫМИ строками выше бюджета — предупреждение обязано назвать их число.
own('AGENT_GUIDE.md', 1200, 'Домашнее правило проекта B');
const agBig = lines('AGENT_GUIDE.md');
r = run('check');
const mOwn = r.out.match(/⚠ AGENT_GUIDE\.md: own lines (\d+) of budget ~1200/);
ok(r.code === 0 && Boolean(mOwn),
   `s16 критерий 1: раздутый СОБСТВЕННЫМИ строками AGENT_GUIDE (${agBig} на диске) назван как «own lines N of budget ~1200», код 0`, r.out);
ok(Boolean(mOwn) && Number(mOwn[1]) > 1200 && Number(mOwn[1]) < agBig,
   's16 критерий 1: названное число собственных строк МЕНЬШЕ числа строк на диске и больше бюджета',
   mOwn ? `own=${mOwn[1]} disk=${agBig}` : r.out);
// Строка не просто НЕСЁТ слово «arrived» — названное число обязано СХОДИТЬСЯ: собственные плюс
// приехавшие равны строкам на диске. Ассерт на одно слово был бы зелёным у мутанта, который
// считает все строки собственными и честно печатает «0 приехало» (проверено мутантом).
const mArr = r.out.match(/⚠ AGENT_GUIDE\.md: own lines (\d+) of budget ~1200 \((\d+) lines on disk, (\d+) of them arrived with KAIF and are not counted\)/);
ok(Boolean(mArr) && Number(mArr[3]) > 0 && Number(mArr[1]) + Number(mArr[3]) === Number(mArr[2]) && Number(mArr[2]) === agBig,
   's16 критерий 1: строка говорит ВСЛУХ, сколько строк приехало, и арифметика сходится (свои + приехавшие = строки на диске)',
   mArr ? `own=${mArr[1]} disk=${mArr[2]} arrived=${mArr[3]} wc=${agBig}` : r.out);
ok(/AGENT_GUIDE\.md: own lines[^\n]*move content OUT to the chronicle PROJECT_HISTORY\.md · researches\/ · a house-rules file/.test(r.out),
   's16 критерий 1: адрес выноса для документа НЕ-STATUS — летопись · researches/ · дом. правила', r.out);

own('STATUS.md', 300, 'Собственные записи проекта');
const stBig = lines('STATUS.md');
r = run('check');
ok(/⚠ STATUS\.md: own lines \d+ of budget ~200/.test(r.out),
   `s16 критерий 1: STATUS (${stBig} строк) назван собственными строками против бюджета 200`, r.out);
ok(/STATUS\.md: own lines[^\n]*move content OUT to the chronicle PROJECT_HISTORY\.md \(move closed history VERBATIM/.test(r.out),
   's16 критерий 1: у STATUS СВОЙ адрес выноса — летопись, дословным переносом (стрижка бонсая)', r.out);

// Документ ВНЕ ядра перечитывания — раздуваем сильнее любого бюджета, предупреждения быть не должно.
const outside = ['PROJECT_HISTORY.md', 'EXPERIENCE.md', 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md'].find((d) => existsSync(join(S, d)));
ok(Boolean(outside), 's16 фикстура: есть развёрнутый документ вне ядра перечитывания',
   'ни один из PROJECT_HISTORY / EXPERIENCE / INTERNAL_MAP не развёрнут');
if (outside) own(outside, 1500, 'Раздутый документ вне ядра');
r = run('check');
// Молчание — по ЛЮБОЙ форме предупреждения, и новой, и прежней (та же причина, что выше).
ok(Boolean(outside) && !new RegExp(`${String(outside).replace('.', '\\.')}: (own lines|\\d+ lines against)`).test(r.out),
   `s16 документ вне ядра (${outside}) раздут на 1500 строк — предупреждения нет ни в какой форме: бюджеты только у девятки`, r.out);
ok((r.out.match(/own lines \d+ of budget/g) || []).length === 2,
   's16 ровно два предупреждения — по одному на раздутый документ ядра', r.out);

// ================================================================ (4) гейт --gate-budgets
console.log('\n=== s16: `check --gate-budgets` — бюджет становится дверью ритуала закрытия ===');
const gate = run('check --gate-budgets');
// Код 1 сам по себе НЕ доказывает дверь: ядро, которое флага не знает, отказывает тем же кодом 1
// (bugs/33). Ассерт обязан отличать «дверь закрылась» от «флаг не понят» — иначе он зелен на ядре
// 2.6, где двери нет вовсе (найдено судьёй прогона; тот же класс, что EXP-0127).
ok(gate.code === 1 && !/unknown flag/.test(gate.out),
   's16 критерий 4: `check --gate-budgets` на превышении — код выхода 1 ИМЕННО от двери, а не от непонятого флага', gate.out.slice(-400));
ok(/✖ AGENT_GUIDE\.md: own lines \d+ of budget 1200 → the chronicle PROJECT_HISTORY\.md · researches\/ · a house-rules file/.test(gate.out),
   's16 критерий 4: гейт печатает строку `<документ>: own lines N of budget M → <адрес выноса>` (AGENT_GUIDE)', gate.out);
ok(/✖ STATUS\.md: own lines \d+ of budget 200 → the chronicle PROJECT_HISTORY\.md/.test(gate.out),
   's16 критерий 4: та же строка у STATUS — со СВОИМ адресом', gate.out);
ok(/✖ --gate-budgets: 2 document\(s\)/.test(gate.out),
   's16 критерий 4: итог гейта называет ЧИСЛО документов, из-за которых он закрыт', gate.out);
ok(/raising a budget is not the cure/.test(gate.out),
   's16 критерий 4: гейт называет верный ход — вынести, а не поднять число', gate.out);
r = run('check');
ok(r.code === 0 && /own lines \d+ of budget ~/.test(r.out),
   's16 критерий 4: БЕЗ флага поведение прежнее — предупреждение и код 0 (совет, не отказ)', r.out.slice(-400));
r = run('check --no-such-flag');
ok(r.code === 1 && /unknown flag for check: --no-such-flag/.test(r.out) && /refusing to run check/.test(r.out),
   's16 критерий 4: незнакомый флаг `check` по-прежнему ОТКАЗЫВАЕТ поимённо (bugs/33 не сломан)', r.out.slice(-400));

// ================================================================ (6) храповик убывающего долга (2.8, эпик CK, шаг CK5.2)
// Тикет истока #84: STATUS поля 447 строк при 200, убывающий с прошлого закрытия, останавливал каждое закрытие как свежее
// превышение. Дверь помнит СОБСТВЕННЫЕ строки документа выше бюджета на прошлом закрытии (`.kaif/budget-baseline.json`):
// проходит только убывание; рост, стояние (развилка (е) — слово владельца №75) и новый выход за бюджет останавливают; первый
// прогон двери версии записывает долг и пропускает; документ под бюджетом уходит из базы, сам файл остаётся.
console.log('\n=== s16: храповик — выше бюджета проходит только убывание ===');
const MARKER = join(S, '.kaif', 'kaif.json');
// убрать k последних строк файла — это строки последнего СОБСТВЕННОГО модуля (фикстура own() дописывает в конец)
const trim = (doc, k) => {
  const p = join(S, doc);
  const l = readFileSync(p, 'utf8').replace(/\r?\n$/, '').split(/\r?\n/);
  writeFileSync(p, l.slice(0, l.length - k).join('\n') + '\n');
};
const ownOf = (out, doc) => { const m = out.match(new RegExp(`${doc.replace('.', '\\.')}: own lines (\\d+) of budget`)); return m ? Number(m[1]) : null; };
if (existsSync(BASE)) unlinkSync(BASE);                    // первое закрытие после обновления: базы нет
r = run('check --gate-budgets');
ok(r.code === 0 && /↳ STATUS\.md: own lines \d+ of budget 200[^\n]*debt recorded in \.kaif\/budget-baseline\.json/.test(r.out)
   && /↳ AGENT_GUIDE\.md: own lines \d+ of budget 1200[^\n]*debt recorded/.test(r.out),
   's16 храповик: первое закрытие без базы ЗАПИСЫВАЕТ долг и проходит (код 0), строка называет файл базы', r.out.slice(-600));
const st0 = ownOf(r.out, 'STATUS.md'), ag0 = ownOf(r.out, 'AGENT_GUIDE.md');
ok(baseDocs() && baseDocs()['STATUS.md'] === st0 && baseDocs()['AGENT_GUIDE.md'] === ag0 && st0 > 200,
   's16 храповик: база хранит ровно те собственные строки, что напечатаны',
   JSON.stringify(baseDocs()) + ` st0=${st0} ag0=${ag0}`);

r = run('check --gate-budgets');                           // ничего не менялось с прошлого закрытия
ok(r.code === 1 && /✖ STATUS\.md: own lines \d+ of budget 200[^\n]*stood still at \d+ since the last closing/.test(r.out),
   's16 храповик: СТОЯНИЕ выше бюджета останавливает закрытие (слово владельца №75: энтропия должна убывать)', r.out.slice(-600));

trim('STATUS.md', 10); trim('AGENT_GUIDE.md', 5);          // закрытие вынесло строки из обоих
r = run('check --gate-budgets');
const st1 = ownOf(r.out, 'STATUS.md');
ok(r.code === 0 && st1 === st0 - 10 && /↳ STATUS\.md: [^\n]*shrinking \d+ → \d+ since the last closing/.test(r.out),
   's16 храповик: УБЫВАНИЕ проходит (код 0) и строка называет было → стало', r.out.slice(-600));
ok(baseDocs() && baseDocs()['STATUS.md'] === st1 && baseDocs()['AGENT_GUIDE.md'] === ag0 - 5,
   's16 храповик: база затягивается вслед за убыванием', JSON.stringify(baseDocs()) + ` st1=${st1}`);

own('STATUS.md', 20, 'Рост после закрытия');              // STATUS вырос, руководство вынесло ещё строку
trim('AGENT_GUIDE.md', 1);
r = run('check --gate-budgets');
ok(r.code === 1 && /✖ STATUS\.md: [^\n]*grew \d+ → \d+ since the last closing/.test(r.out) && /↳ AGENT_GUIDE\.md: [^\n]*shrinking/.test(r.out),
   's16 храповик: РОСТ останавливает закрытие, а соседний документ, который убывает, называется проходящим', r.out.slice(-600));
ok(baseDocs() && baseDocs()['STATUS.md'] === st1,
   's16 храповик: выросший документ базу НЕ поднимает — долг меряется от прежней точки', JSON.stringify(baseDocs()));

trim('STATUS.md', 22); trim('AGENT_GUIDE.md', 1);          // вернуть оба ниже базы
const BF = join(S, 'BUG_FIXING_FRAMEWORK.md');
const bfOriginal = existsSync(BF) ? readFileSync(BF, 'utf8') : null;
ok(bfOriginal !== null, 's16 фикстура: BUG_FIXING_FRAMEWORK.md развёрнут (кандидат в новое превышение)');
if (bfOriginal !== null) own('BUG_FIXING_FRAMEWORK.md', 400, 'Новый раздел проекта');
r = run('check --gate-budgets');
ok(r.code === 1 && /✖ BUG_FIXING_FRAMEWORK\.md: own lines \d+ of budget 300[^\n]*crossed its budget since the last closing — a new overflow is never free/.test(r.out),
   's16 храповик: НОВЫЙ выход за бюджет при действующей базе останавливает — бесплатного превышения нет', r.out.slice(-600));
ok(baseDocs() && baseDocs()['BUG_FIXING_FRAMEWORK.md'] === undefined,
   's16 храповик: новое превышение в базу не записывается — иначе следующий прогон пропустил бы его «убыванием»', JSON.stringify(baseDocs()));
if (bfOriginal !== null) writeFileSync(BF, bfOriginal);

const stNow = lines('STATUS.md');
trim('STATUS.md', 150);                                    // STATUS ушёл под бюджет по собственным строкам,
trim('AGENT_GUIDE.md', 1);                                 // руководство вынесло строку — иначе оно законно «стоит на месте»
r = run('check --gate-budgets');
ok(r.code === 0 && !/STATUS\.md: own lines/.test(r.out) && baseDocs() && baseDocs()['STATUS.md'] === undefined && baseDocs()['AGENT_GUIDE.md'] !== undefined,
   's16 храповик: документ, ушедший под бюджет, ВЫЧИЩЕН из базы, файл остаётся с остальным долгом', JSON.stringify(baseDocs()) + ` status ${stNow} → ${lines('STATUS.md')}`);

const marker = readFileSync(MARKER, 'utf8');
const mk = JSON.parse(marker.replace(/^\uFEFF/, ''));
writeFileSync(MARKER, JSON.stringify({ ...mk, version: `${mk.version}-fixture` }, null, 2) + '\n');
r = run('check --gate-budgets');                           // обновление сменило версию: долг переписывается один раз
ok(r.code === 0 && /↳ AGENT_GUIDE\.md: [^\n]*debt recorded in \.kaif\/budget-baseline\.json \(first gate of [^)]*-fixture\)/.test(r.out),
   's16 храповик: первое закрытие НОВОЙ версии переписывает базу и проходит — долг, сдвинутый обновлением, записан, а не наказан', r.out.slice(-600));
writeFileSync(MARKER, marker);

writeFileSync(BASE, '{ not json');
r = run('check --gate-budgets');
ok(r.code === 1 && /budget-baseline\.json is unreadable — restore it from git/.test(r.out),
   's16 храповик: нечитаемая база — никогда не бесплатный проход, строка называет, как восстановить', r.out.slice(-400));
unlinkSync(BASE);

// ================================================================ (7) объявленный архив владельца (2.8, эпик CK, шаг CK5.3)
// Тикет истока #84 п. 1: владелец поля решил, что его GOAL.md — дословный дописываемый АРХИВ его слов, а рабочий слой живёт в
// отдельном дайджесте; единственное лекарство двери — «вынеси» — ровно то, что его решение запрещает агенту. Маркер:
// "archives": { "<документ ядра>": "<дайджест>" | { "digest", "owner" } }; бюджет несёт дайджест, размер архива — справка.
console.log('\n=== s16: объявленный архив владельца судится по своему дайджесту ===');
const mkArch = readFileSync(MARKER, 'utf8');
const withArchives = (archivesValue) => {
  const m = JSON.parse(mkArch.replace(/^\uFEFF/, ''));
  writeFileSync(MARKER, JSON.stringify({ ...m, archives: archivesValue }, null, 2) + '\n');
};
own('GOAL.md', 400, 'Дословные слова владельца');               // архив владельца растёт дописыванием
writeFileSync(join(S, 'DIGEST.md'), `# Дайджест\n\nРабочий слой видения; полный текст владельца — GOAL.md (архив).\n\n- пункт 1\n- пункт 2\n`);
r = run('check');
ok(/⚠ GOAL\.md: own lines \d+ of budget ~300/.test(r.out),
   's16 архив: без объявления разросшийся GOAL.md судится как документ — строка превышения есть', r.out.slice(-600));
withArchives({ 'GOAL.md': { digest: 'DIGEST.md', owner: 'interview 017, Q3' } });
r = run('check --gate-budgets');
ok(r.code === 0 && /ℹ GOAL\.md: a declared archive of the owner \(\d+ lines — information, never a stop\); its digest DIGEST\.md carries the budget: \d+ of ~300/.test(r.out)
   && !/GOAL\.md: own lines/.test(r.out) && !/names no owner's word/.test(r.out),
   's16 архив: объявленный архив с дайджестом проходит дверь — размер архива справкой, бюджет несёт дайджест', r.out.slice(-600));
withArchives({ 'GOAL.md': 'DIGEST.md' });
r = run('check');
ok(/ℹ GOAL\.md: a declared archive[^\n]*the declaration names no owner's word/.test(r.out),
   's16 архив: объявление без слова владельца называется вслух — с готовой формой записи', r.out.slice(-600));
writeFileSync(join(S, 'DIGEST.md'), '# Дайджест\n\nРабочий слой без ссылки на полный текст.\n');
r = run('check');
ok(/ℹ GOAL\.md: declared an archive, but its digest DIGEST\.md does not name GOAL\.md — the archive is judged as a document/.test(r.out)
   && /⚠ GOAL\.md: own lines \d+ of budget ~300/.test(r.out),
   's16 архив: дайджест, который не называет свой архив, архива не прикрывает — строка превышения на месте', r.out.slice(-600));
withArchives({ 'GOAL.md': { digest: 'NO-SUCH-DIGEST.md', owner: 'interview 017, Q3' } });
r = run('check --gate-budgets');
ok(r.code === 1 && /digest NO-SUCH-DIGEST\.md is missing/.test(r.out) && /✖ GOAL\.md: own lines \d+ of budget 300/.test(r.out),
   's16 архив: без дайджеста стоп остаётся (тикет #84: «Without a digest the stop stays»)', r.out.slice(-600));
withArchives({ 'NOTES.md': 'DIGEST.md' });
r = run('check');
ok(r.code === 1 && /marker schema: archives names "NOTES\.md", which is not a document of the re-read core/.test(r.out),
   's16 архив: архив, названный не документом ядра, — находка схемы маркера', r.out.slice(-400));
writeFileSync(MARKER, mkArch);
if (existsSync(BASE)) unlinkSync(BASE);

// ================================================================ (2) смесь языков по доле токенов
console.log('\n=== s16: смесь языков судится по ДОЛЕ токенов чужой письменности ===');
// четыре фикстуры навыков в развёрнутой копии (язык развёртывания — ru)
skill('zz-localized', `${RU}\n\n${RU}\n\nОдно английское слово в прозе: README.\n`);
skill('zz-code-heavy', `${RU}\n\n${RU}\n\nКоманда: \`node .kaif/kaif-core.mjs check --gate-budgets\`, путь \`framework/installer/KAIF-CORE.mjs\`.\n\n\`\`\`bash\nnode .kaif/kaif-core.mjs install --lang ru\ngit commit -m "the whole English world lives inside this fence and must not be counted at all"\n\`\`\`\n`);
skill('zz-mixed', `${RU}\n\n${EN}\n\n${RU}\n\n${EN}\n`);
skill('zz-stray', `${EN}\n\n${EN}\n\n${EN}\n\nТри кириллических слова здесь.\n`);
const mix = run('check');
ok(mix.code === 0, 's16 смесь: check остаётся зелёным (предупреждение, не отказ)', mix.out.slice(-400));
ok(/⚠ language mix: \d+ of \d+ skills are a MIX/.test(mix.out),
   's16 критерий 2: появилась отдельная строка о СМЕСИ (прежняя строка про английские навыки — своя)', mix.out);
ok(/zz-mixed \((\d+) % foreign\)/.test(mix.out),
   's16 критерий 2: навык, где половина прозы английская, назван смесью С ДОЛЕЙ В ПРОЦЕНТАХ', mix.out);
const mShare = mix.out.match(/zz-mixed \((\d+) % foreign\)/);
ok(Boolean(mShare) && Number(mShare[1]) >= 35 && Number(mShare[1]) <= 70,
   's16 критерий 2: доля zz-mixed лежит около половины — порог назван константой ядра, не «есть вхождение»',
   mShare ? `${mShare[1]} %` : mix.out);
ok(!/zz-localized/.test(mix.out),
   's16 критерий 2: RU-навык с ОДНИМ английским словом — «локализован», не смесь (прежний предикат такую форму не видел вовсе: он краснел только при ПОЛНОМ отсутствии письменности владельца)', mix.out);
ok(!/zz-code-heavy/.test(mix.out),
   's16 критерий 2 (риск б): токены в бэктиках и код-блоках не считаются — RU-навык с командами не смесь', mix.out);
ok(/zz-stray \(9\d % foreign\)/.test(mix.out),
   's16 критерий 2: английское тело с тремя кириллическими словами — СМЕСЬ ~99 %, форма, невидимая старому `re.test(body)`', mix.out);
ok(/⚠ language mix: \d+ of \d+ skills are English \(language: ru\)/.test(mix.out),
   's16 смесь: прежняя строка «N of M skills are English» жива и отдельна (английский приход — политика, не дефект)', mix.out);

// ================================================================ (5) две честные запасные ветки
console.log('\n=== s16: файл переведён целиком · среза модулей нет — обе ветки говорят о себе вслух ===');
const PH = join(S, 'PHILOSOPHY.md');
ok(existsSync(PH), 's16 фикстура: PHILOSOPHY.md развёрнут (кандидат в «переведён целиком»)');
if (existsSync(PH)) {
  // перевод ЦЕЛИКОМ: ни одна сигнатура шаблона не выживает по построению (bugs/36, риск (а) плана)
  const translated = readFileSync(PH, 'utf8').split('\n')
    .map((l) => (/^#{1,3} /.test(l) ? `${l.match(/^#{1,3} /)[0]}Переведённый заголовок ${l.length}` : l)).join('\n');
  writeFileSync(PH, translated, 'utf8');
  own('PHILOSOPHY.md', 200, 'Свои страницы после перевода');
}
r = run('check');
ok(/⚠ PHILOSOPHY\.md: own lines \d+ of budget ~300[^\n]*translated wholesale — arrived canon cannot be told from your own lines, so every line counts as yours/.test(r.out),
   's16 риск (а): файл, переведённый целиком, считает собственными ВСЕ строки и ГОВОРИТ это (по-сигнатурное сравнение неприменимо)', r.out);
const phLines = lines('PHILOSOPHY.md');
const mPh = r.out.match(/⚠ PHILOSOPHY\.md: own lines (\d+) of budget/);
ok(Boolean(mPh) && Number(mPh[1]) === phLines,
   's16 риск (а): у переведённого целиком файла собственных строк РОВНО столько, сколько на диске',
   mPh ? `own=${mPh[1]} disk=${phLines}` : r.out);

// Та же ФОРМА (ни одна сигнатура шаблона не выжила) у документа, который проект пишет сам, —
// НЕ перевод: скелет owner-seeded документа переписывается целиком в каждом здоровом развёртывании.
// Найдено функциональным прогоном по копиям двух реальных развёртываний (STATUS · GOAL ·
// MASTER_PLAN · внешняя карта читались как «переведены целиком»); арифметика та же, фраза другая.
const MP = join(S, 'MASTER_PLAN.md');
ok(existsSync(MP), 's16 фикстура: MASTER_PLAN.md развёрнут (кандидат в owner-seeded)');
if (existsSync(MP)) {
  const rewritten = readFileSync(MP, 'utf8').split('\n')
    .map((l) => (/^#{1,3} /.test(l) ? `${l.match(/^#{1,3} /)[0]}Свой заголовок проекта ${l.length}` : l)).join('\n');
  writeFileSync(MP, rewritten, 'utf8');
  own('MASTER_PLAN.md', 350, 'Свои фазы');
}
r = run('check');
ok(/⚠ MASTER_PLAN\.md: own lines \d+ of budget ~300[^\n]*all of them yours — this is an owner-seeded document whose shipped skeleton the project wrote over/.test(r.out),
   's16 owner-seeded документ той же формы назван СВОИМ по построению, а не «переведённым целиком» (находка функционального прогона)', r.out);
ok(!/MASTER_PLAN\.md: own lines[^\n]*translated wholesale/.test(r.out),
   's16 owner-seeded документ НЕ называется переводом — одна форма, две причины, и они различены', r.out);

// среза модулей у развёртывания нет вовсе (манифест v1 / до-1.5 деплой) — тот же честный исход
const MAN = join(S, '.kaif', 'deploy-manifest.json');
ok(existsSync(MAN), 's16 фикстура: манифест развёртывания на месте (из него убирается срез модулей)');
if (existsSync(MAN)) {
  const m = JSON.parse(readFileSync(MAN, 'utf8').replace(/^\uFEFF/, ''));
  delete m.moduleShas;
  writeFileSync(MAN, JSON.stringify(m, null, 2) + '\n', 'utf8');
}
// Бандл ещё на диске, и `check` предпочитает его манифесту — убираем совсем, ровно как это делает
// `verify-final` на зелёном: так фикстура становится РЕАЛЬНЫМ состоянием «бандл прибран, срез
// манифеста — единственный источник», а не искусственным.
const BUN = join(S, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md');
if (existsSync(BUN)) unlinkSync(BUN);
r = run('check');
ok(/⚠ AGENT_GUIDE\.md: own lines \d+ of budget ~1200[^\n]*no deployed module cut for this file — every line counts as yours/.test(r.out),
   's16 среза модулей нет — все строки собственные, и строка говорит ПОЧЕМУ (запасная ветка, не тишина)', r.out);
const mNo = r.out.match(/⚠ AGENT_GUIDE\.md: own lines (\d+) of budget/);
ok(Boolean(mNo) && Number(mNo[1]) === lines('AGENT_GUIDE.md'),
   's16 без среза собственных строк РОВНО столько, сколько на диске',
   mNo ? `own=${mNo[1]} disk=${lines('AGENT_GUIDE.md')}` : r.out);

if (failures) { console.error(`\n❌ s16: ${failures} of ${asserts} check(s) failed`); process.exit(1); }
console.log(`\n✅ s16 doc-budgets: all ${asserts} checks green`);
