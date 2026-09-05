#!/usr/bin/env node
// s12-k5-contour-canon.mjs — свод канона интерактивного контура (фаза K5, plans/48 шаг 5, критерий 4).
// [TESTED: 2026-08-07 · прогон в составе полигона + внутреннее красное доказательство ростера]
// [TESTED: 2026-09-05 · якоря контракта контура (2.6, IC): 25 проверок зелёные; красное доказательство —
//  RU-копия с заменой INTERACTIVE_CONTOUR_SPEC.md → _CUT (на копии, восстановлена побайтно) даёт 1 красный
//  ассерт и exit 1]
//
// Механизация сессионных греп-скриптов фаз K3/K4 («all C1-C13 + T1-T11 + DEF1-DEF8 present in
// dist section», «all G1-G13 + QA1-QA7 present») — смертный скретчпад = смертная верификация
// (EXP-0016). Свод стережёт ПРИСУТСТВИЕ СЛОЁВ вендоренного контракта в обеих поставках:
//   1) dist-секция навыка /owner-reviews в dist/KAIF-FULL.md (payload EN — то, что едет в поле);
//   2) RU-зеркало обвязки .claude/skills/owner-reviews/SKILL.md (попозиционная синхронность слоёв).
// Ростер: серии I · P · G · T · C · QA · DEF + якорные строки (M8 «RENDER IS NOT YET A SHOW»,
// блок red-proof, заголовки секций). Границы серий и их счёт живут В МАССИВЕ ниже и печатаются
// итоговой строкой прогона — прозой здесь не дублируются: рукописный счёт в шапке протухает
// молча ровно тем же дрейфом, который свод и стережёт (bugs/68; EXP-0025). Плюс селфтесты
// инструментов контура — быстрые, без браузера; плюс проверка, что приёмка контура ВЫЗЫВАЕТСЯ
// ритуалами (bugs/69). Полный QA-прогон в живом браузере — отдельная команда
// node tools/verify-contour.mjs (тяжёлый, гоняется на приёмке, не на каждой сборке).
//
// Красное доказательство свода (страж, который ни разу не краснел, ничего не доказывает):
// внутренняя мутация — ростер прогоняется по копии dist-секции с ВЫРЕЗАННЫМ I8 и обязан
// найти пропажу; не нашёл — весь свод красный.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
let PASS = 0, FAIL = 0;
const check = (name, cond, detail = '') => {
  if (cond) PASS++; else { FAIL++; console.log('  ✗ ' + name + (detail ? ' — ' + detail : '')); }
};

// ── Ростер слоёв: [префикс токена, число позиций, конструктор регэкспа] ────────────────────
const LAYERS = [
  ['I', 43, (n) => new RegExp('\\*\\*I' + n + '\\.')], // I37/I38 — класс «сообщение» (задача T10); I39 — протухшая очередь (bugs/108, 2.5); I40–I43 — факт «показан», возраст, условие выхода, «кто заблокирован» (issue #47, 2.6 OQ)
  ['P', 9, (n) => new RegExp('\\*\\*P' + n + '\\*\\*')],
  ['G', 13, (n) => new RegExp('\\*\\*G' + n + '\\.')],
  ['T', 11, (n) => new RegExp('\\*\\*T' + n + '\\s*\\(')], // «**T1 (browser).» — скобка отсекает T1/T10-коллизию
  ['C', 13, (n) => new RegExp('\\*\\*C' + n + '\\.')],
  ['QA', 7, (n) => new RegExp('\\*\\*QA' + n + '\\.')],
  ['DEF', 8, (n) => new RegExp('\\|\\s*DEF' + n + '\\s*\\|')],
];
const rosterScan = (text) => {
  const missing = [];
  for (const [prefix, count, mk] of LAYERS)
    for (let n = 1; n <= count; n++)
      if (!mk(n).test(text)) missing.push(prefix + n);
  return missing;
};
const ROSTER_TOTAL = LAYERS.reduce((s, [, c]) => s + c, 0);

// ── 1. Dist-секция навыка (payload EN) ─────────────────────────────────────────────────────
const full = readFileSync(join(ROOT, 'dist', 'KAIF-FULL.md'), 'utf8');
const MARK = '> **FILE: `.claude/skills/owner-reviews/SKILL.md`**';
const start = full.indexOf(MARK);
check('dist/KAIF-FULL.md несёт FILE-блок навыка owner-reviews', start >= 0);
const next = full.indexOf('> **FILE: `', start + MARK.length);
const distSection = start >= 0 ? full.slice(start, next > 0 ? next : undefined) : '';

const missEn = rosterScan(distSection);
check('dist-секция: все ' + ROSTER_TOTAL + ' позиций слоёв I/P/G/T/C/QA/DEF на месте',
  missEn.length === 0, 'пропали: ' + missEn.join(', '));
for (const [anchor, name] of [
  ['RENDER IS NOT YET A SHOW', 'M8: строка рендера'],
  ['Red proof, guard by guard', 'блок red-proof'],
  ['The executable build contract (C1', 'заголовок секции контракта'],
  ['Platform traps (T1', 'заголовок каталога ловушек'],
  ['Canonical defaults (DEF1', 'заголовок таблицы дефолтов'],
  ['Guard norms (G1', 'заголовок норм стражей'],
  ['The acceptance checklist (QA1', 'заголовок чек-листа приёмки'],
  // 2.6, эпик IC (plans/93 критерий 1): навык называет одностраничный контракт контура поставки —
  // «запусти отгружаемый генератор, а не строй контур»; без этой строки поле снова строит контур по соседу
  ['INTERACTIVE_CONTOUR_SPEC.md', 'IC (2.6): контракт контура .kaif/INTERACTIVE_CONTOUR_SPEC.md назван в навыке'],
]) check('dist-секция: ' + name, distSection.includes(anchor));

// ── 1а. Контракт контура едет поставкой (2.6, эпик IC): бандл несёт FILE-блок страницы, и обе копии
//        /interview зовут предполёт по ней (plans/93 критерий 1 — механизирован здесь, а не грепом сессии)
const bundle = readFileSync(join(ROOT, 'dist', 'KAIF-CORE-BUNDLE.md'), 'utf8');
check('бандл несёт FILE-блок .kaif/INTERACTIVE_CONTOUR_SPEC.md (контракт контура, bundle-only)',
  bundle.includes('> **FILE: `.kaif/INTERACTIVE_CONTOUR_SPEC.md`**'));
for (const rel of ['framework/skills/interview/SKILL.md', '.claude/skills/interview/SKILL.md'])
  check(rel + ': шаг предполёта ссылается на INTERACTIVE_CONTOUR_SPEC.md',
    readFileSync(join(ROOT, rel), 'utf8').includes('INTERACTIVE_CONTOUR_SPEC.md'));

// ── 2. RU-зеркало обвязки (попозиционная синхронность слоёв) ───────────────────────────────
const ru = readFileSync(join(ROOT, '.claude', 'skills', 'owner-reviews', 'SKILL.md'), 'utf8');
const missRu = rosterScan(ru);
check('RU-зеркало: все ' + ROSTER_TOTAL + ' позиций слоёв на месте', missRu.length === 0,
  'пропали: ' + missRu.join(', '));
check('RU-зеркало: строка M8 (каноническая, не переводится)', ru.includes('RENDER IS NOT YET A SHOW'));
check('RU-зеркало: блок red-proof', ru.includes('Доказательство красным, страж за стражем'));
check('RU-зеркало: контракт контура .kaif/INTERACTIVE_CONTOUR_SPEC.md назван (2.6, IC)', ru.includes('INTERACTIVE_CONTOUR_SPEC.md'));

// ── 3. Красное доказательство ростера: вырезанный I8 обязан быть найден ────────────────────
const mutated = distSection.replace(/\*\*I8\./, '**I8-CUT.');
const missMut = rosterScan(mutated);
check('красное доказательство: ростер ЛОВИТ вырезанный I8 на мутированной копии',
  missMut.length === 1 && missMut[0] === 'I8', 'нашёл: ' + missMut.join(', '));

// ── 4. Селфтесты инструментов контура (быстрые, без браузера) ──────────────────────────────
const run = (label, args) => {
  try { execFileSync(process.execPath, args.map((a) => join(ROOT, a) === a ? a : a), { cwd: ROOT, stdio: 'pipe', timeout: 30000 }); return true; }
  catch { return false; }
};
// Список — источник истины И для прогона, И для счётчика в итоговой строке (EXP-0025: число
// селфтестов прозой протухает молча; здесь оно вычисляется из того же массива).
const TOOL_SELFTESTS = [
  ['селфтест ядра контура зелёный', ['tools/lib/review-core.mjs', '--selftest']],
  ['селфтест стража места вопросов зелёный (6 мутаций)', ['tools/questions-guard.mjs', '--selftest']],
  ['самопроверка падучести QA-счёта зелёная (мутация Б краснит)', ['tools/verify-contour.mjs', '--selfcheck']],
  // Класс «сообщение» (I37/I38, задача T10): машина состояний пометки и порядок групп в пачке —
  // то, чего не видно ни на скриншоте, ни в ростере контракта.
  ['селфтест класса «сообщение» зелёный (пометка · повтор · порядок групп)', ['tools/review.mjs', '--selftest']],
  // 2.6, эпик IC (plans/93 IC3): отгружаемый генератор контура — предполёт красный на «вариантах абзацами»,
  // три лица, записи, факт показа; полная приёмка на развёрнутой копии — свод s22.
  ['селфтест отгружаемого генератора контура зелёный (framework/tools/contour)', ['framework/tools/contour/review.mjs', '--selftest']],
];
for (const [label, args] of TOOL_SELFTESTS) check(label, run(label, args));

// ── 5. Приёмка контура СТОИТ В РИТУАЛАХ (bugs/69) ──────────────────────────────────────────
// Норма, чей сигнал никто не читает, эквивалентна отсутствию нормы: намеренный красный G7
// сработал ТРИЖДЫ за двое суток и не был увиден никем, потому что прогон не вызывался ниоткуда.
// Здесь стерегутся ПОЛНЫЕ формы команд: короткое вхождение зеленело бы от простого упоминания
// инструмента в прозе (`BUG_FIXING_FRAMEWORK.md` → Стражи).
const RITUAL_CALLS = [
  ['/end-chat-soft зовёт дешёвую половину приёмки контура',
    '.claude/skills/end-chat-soft/SKILL.md', 'node tools/verify-contour.mjs --etalon-only'],
  ['/end-chat-soft называет верный ход при красном (пересмотр эталона, не слепая перезапись)',
    '.claude/skills/end-chat-soft/SKILL.md', 'node tools/verify-contour.mjs --write-etalon'],
  ['/release зовёт ПОЛНЫЙ приёмочный прогон контура',
    '.claude/skills/release/SKILL.md', '**ПОЛНЫЙ приёмочный прогон контура — здесь и обязателен:** `node tools/verify-contour.mjs`'],
];
for (const [label, rel, needle] of RITUAL_CALLS) {
  check(label, readFileSync(join(ROOT, rel), 'utf8').includes(needle), `нет строки в ${rel}: ${needle}`);
}

// ── Итог (счёт печатает сам свод — EXP-0025) ───────────────────────────────────────────────
if (FAIL) { console.error(`s12: ${FAIL} of ${PASS + FAIL} checks FAILED`); process.exit(1); }
console.log(`s12 contour canon: all ${PASS} checks green (roster ${ROSTER_TOTAL} positions × dist EN + RU mirror, red-proof, ${TOOL_SELFTESTS.length} tool selftests)`);
