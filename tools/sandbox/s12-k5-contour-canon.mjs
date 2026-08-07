#!/usr/bin/env node
// s12-k5-contour-canon.mjs — свод канона интерактивного контура (фаза K5, plans/48 шаг 5, критерий 4).
// [TESTED: 2026-08-07 · прогон в составе полигона + внутреннее красное доказательство ростера]
//
// Механизация сессионных греп-скриптов фаз K3/K4 («all C1-C13 + T1-T11 + DEF1-DEF8 present in
// dist section», «all G1-G13 + QA1-QA7 present») — смертный скретчпад = смертная верификация
// (EXP-0016). Свод стережёт ПРИСУТСТВИЕ СЛОЁВ вендоренного контракта в обеих поставках:
//   1) dist-секция навыка /owner-reviews в dist/KAIF-FULL.md (payload EN — то, что едет в поле);
//   2) RU-зеркало обвязки .claude/skills/owner-reviews/SKILL.md (попозиционная синхронность слоёв).
// Ростер: I1–I36 · P1–P9 · G1–G13 · T1–T11 · C1–C13 · QA1–QA7 · DEF1–DEF8 + якорные строки
// (M8 «RENDER IS NOT YET A SHOW», блок red-proof, заголовки секций). Плюс селфтесты инструментов
// контура (страж/ядро/QA-selfcheck) — быстрые, без браузера; полный QA-прогон в живом браузере —
// отдельная команда node tools/verify-contour.mjs (тяжёлый, гоняется на приёмке, не на каждой сборке).
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
  ['I', 36, (n) => new RegExp('\\*\\*I' + n + '\\.')],
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
]) check('dist-секция: ' + name, distSection.includes(anchor));

// ── 2. RU-зеркало обвязки (попозиционная синхронность слоёв) ───────────────────────────────
const ru = readFileSync(join(ROOT, '.claude', 'skills', 'owner-reviews', 'SKILL.md'), 'utf8');
const missRu = rosterScan(ru);
check('RU-зеркало: все ' + ROSTER_TOTAL + ' позиций слоёв на месте', missRu.length === 0,
  'пропали: ' + missRu.join(', '));
check('RU-зеркало: строка M8 (каноническая, не переводится)', ru.includes('RENDER IS NOT YET A SHOW'));
check('RU-зеркало: блок red-proof', ru.includes('Доказательство красным, страж за стражем'));

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
check('селфтест ядра контура зелёный', run('core', ['tools/lib/review-core.mjs', '--selftest']));
check('селфтест стража места вопросов зелёный (6 мутаций)', run('guard', ['tools/questions-guard.mjs', '--selftest']));
check('самопроверка падучести QA-счёта зелёная (мутация Б краснит)', run('qa', ['tools/verify-contour.mjs', '--selfcheck']));

// ── Итог (счёт печатает сам свод — EXP-0025) ───────────────────────────────────────────────
if (FAIL) { console.error(`s12: ${FAIL} of ${PASS + FAIL} checks FAILED`); process.exit(1); }
console.log(`s12 contour canon: all ${PASS} checks green (roster ${ROSTER_TOTAL} positions × dist EN + RU mirror, red-proof, 3 tool selftests)`);
