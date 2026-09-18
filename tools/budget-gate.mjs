#!/usr/bin/env node
// tools/budget-gate.mjs — ДВЕРЬ бюджета ядра перечитывания ДЛЯ ИСТОКА (2.7, эпик CB, критерий 4 plans/95; тикет #71).
//
// ЗАЧЕМ. В развёрнутом проекте дверь — `node .kaif/kaif-core.mjs check --gate-budgets`. У ИСТОКА эта команда
// неисполнима по построению: здесь лежит ИСХОДНИК фреймворка, а не его развёртывание (нет ни `.kaif/kaif-core.mjs`,
// ни `.kaif/deploy-manifest.json`; проба 2026-09-18 11:07 — смерть на `MISSING or empty: .kaif/…` задолго до блока
// бюджетов). Ритуал закрытия чата предлагал истоку сверять девять пар чисел ГЛАЗАМИ — ровно та форма обязательства,
// которая не исполняется (AGENT_GUIDE → «Форма обязательства»; PHILOSOPHY → «Код прежде когниции»).
//
// ЧТО ДЕЛАЕТ. Числа и адреса выноса берёт из ОДНОГО места — таблицы `DOC_BUDGETS` ядра поставки
// (`framework/installer/KAIF-CORE.mjs`), разбором текста: ядро — CLI с побочными эффектами, импортировать его нельзя.
// У истока каждая строка документа — собственная (приехавшего канона здесь нет), поэтому число собственных строк —
// это число строк файла (как `wc -l`). Документ выше бюджета → строка `✖ <документ>: own lines N of budget M → <адрес>`
// и код 1. Таблица не нашлась или в ней не девять строк → код 2 и названный ход: инструмент, который не смог
// прочитать свою истину, не имеет права зеленеть.
//
// Команды:  node tools/budget-gate.mjs             — дверь (код 0 · 1 · 2)
//           node tools/budget-gate.mjs --selftest  — оба ответа и отказ на потерянной таблице, на временном дереве
// Лечение красного — ВЫНОС (летопись · researches/ · HOUSE_RULES.md), никогда не поднятие числа: на это охотится судья
// (охота «Budget raised instead of content moved»).
//
// @guard origin-budget-gate
// THREAT:         документ ядра перечитывания ИСТОКА вырос выше бюджета, и закрытие чата уехало мимо: дверь поставки у
//                 истока не исполняется вовсе (исходник, не развёртывание), а сверка девяти пар чисел глазами — не носитель
// PROVED-AGAINST: девять документов НАЗВАННОЙ ревизии 3d57c09 (экспорт `git show` во временное дерево) под текущей
//                 таблицей — код 1 и четыре строки: STATUS 300/200 · MASTER_PLAN 404/300 · TESTING_FRAMEWORK 304/300 ·
//                 AGENT_GUIDE 1314/1200; селфтест — оба ответа на границе (10/10 зелёный, 11/10 красный), свой и общий
//                 адрес выноса, пропавший документ (находка), нечитаемая и усохшая таблица (код 2)
// GAP:            дверь читает ТО число, которое лежит в таблице, — поднятое число она примет (охота судьи, не машина);
//                 таблица разбирается текстом: смена формы строки даёт код 2, а не тихий зелёный, но чинится руками здесь
// ON-REAL-PATH:   NOT YET — команда прогнана на живом дереве истока 2026-09-18 12:36 +03:00 («9 documents … within
//                 budget (closest: STATUS.md 200/200)», числа сверены с `wc -l`); В РИТУАЛЕ закрытия чата ещё не исполнялась
// [TESTED: 2026-09-18 12:36 +03:00 · функциональный прогон путём ритуала закрытия у истока: команда на живом дереве —
//  зелёная, девять чисел прочитаны против `wc -l`; красное — на девяти документах ревизии 3d57c09 под текущей таблицей
//  (код 1, четыре названных документа с адресами); селфтест 6/6 — отчёт testcases/reports/2026-09-18_canon-budget.md,
//  дополнение интегратора]
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CORE_REL = 'framework/installer/KAIF-CORE.mjs';
const EXPECTED_DOCS = 9;          // ядро перечитывания — девять документов (AGENT_GUIDE → таксономия, ярус 1)
const EXIT_OVER = 1, EXIT_NO_TABLE = 2;

/** Таблица бюджетов из текста ядра: [{ doc, budget, overflowTo }]. Пустой массив = таблица не прочитана. */
export function readBudgets(coreText) {
  const shared = (coreText.match(/const MOVE_OUT_ADDRESS = '([^']*)';/) || [])[1] || '';
  const open = coreText.indexOf('const DOC_BUDGETS = {');
  if (open < 0) return [];
  const body = coreText.slice(open, coreText.indexOf('\n};', open));
  return [...body.matchAll(/^\s*'([^']+\.md)':\s*\{\s*budget:\s*(\d+),\s*overflowTo:\s*(?:'([^']*)'|MOVE_OUT_ADDRESS)\s*\}/gm)]
    .map((m) => ({ doc: m[1], budget: Number(m[2]), overflowTo: m[3] !== undefined ? m[3] : shared }));
}

/** Число строк файла, как его печатает `wc -l` для файла с завершающим переводом строки. */
const lineCount = (path) => { const l = readFileSync(path, 'utf8').split(/\r?\n/); if (l[l.length - 1] === '') l.pop(); return l.length; };

/** Суд: { code, lines[] } для дерева `root` и текста ядра. Отсутствующий документ — находка, а не пропуск. */
export function gate(root, coreText) {
  const rows = readBudgets(coreText);
  if (rows.length !== EXPECTED_DOCS)
    return { code: EXIT_NO_TABLE, lines: [`✖ budget table not read: ${rows.length} row(s) of ${EXPECTED_DOCS} in ${CORE_REL} — the table moved or changed shape; fix readBudgets() in tools/budget-gate.mjs (a gate that cannot read its numbers never passes)`] };
  const lines = []; let over = 0, closest = null;
  for (const { doc, budget, overflowTo } of rows) {
    const p = join(root, doc);
    if (!existsSync(p)) { over++; lines.push(`✖ ${doc}: MISSING — a document of the re-read core is not in the tree`); continue; }
    const n = lineCount(p);
    if (n > budget) { over++; lines.push(`✖ ${doc}: own lines ${n} of budget ${budget} → ${overflowTo}`); }
    if (!closest || budget - n < closest.left) closest = { doc, n, budget, left: budget - n };
  }
  if (over) lines.push(`❌ budget gate: ${over} document(s) over budget — MOVE content to the named address and run again; raising a budget is not the cure`);
  else lines.push(`✅ budget gate OK — ${rows.length} documents of the re-read core within budget (closest: ${closest.doc} ${closest.n}/${closest.budget})`);
  return { code: over ? EXIT_OVER : 0, lines };
}

function selftest() {
  const root = mkdtempSync(join(tmpdir(), 'kaif-budget-gate-'));
  let bad = 0;
  const ok = (c, name) => { console.log((c ? '  ✓ ' : '  ✗ ') + name); if (!c) bad++; };
  const names = ['STATUS.md', 'GOAL.md', 'MASTER_PLAN.md', 'PROJECT_STRUCTURE_EXTERNAL_MAP.md', 'PHILOSOPHY.md', 'TESTING_FRAMEWORK.md', 'BUG_FIXING_FRAMEWORK.md', 'REQUIREMENTS_FRAMEWORK.md', 'AGENT_GUIDE.md'];
  const core = "const MOVE_OUT_ADDRESS = 'shared address';\nconst DOC_BUDGETS = {\n" +
    names.map((n, i) => `  '${n}': { budget: 10, overflowTo: ${i === 0 ? "'status address'" : 'MOVE_OUT_ADDRESS'} },`).join('\n') + '\n};\n';
  mkdirSync(root, { recursive: true });
  const fill = (n, count) => writeFileSync(join(root, n), Array.from({ length: count }, (_, i) => 'line ' + i).join('\n') + '\n');
  names.forEach((n) => fill(n, 10));
  let r = gate(root, core);
  ok(r.code === 0 && /9 documents/.test(r.lines.join('\n')), 'nine documents exactly ON budget (10/10) → green, code 0');
  fill('STATUS.md', 11);
  r = gate(root, core);
  ok(r.code === EXIT_OVER && r.lines.some((l) => l.includes('STATUS.md: own lines 11 of budget 10 → status address')), 'one line over → code 1, the line names the document, both numbers and ITS OWN address');
  fill('STATUS.md', 10); fill('GOAL.md', 12);
  r = gate(root, core);
  ok(r.code === EXIT_OVER && r.lines.some((l) => l.includes('GOAL.md: own lines 12 of budget 10 → shared address')), 'a document without its own address gets the SHARED address');
  fill('GOAL.md', 10); rmSync(join(root, 'PHILOSOPHY.md'));
  r = gate(root, core);
  ok(r.code === EXIT_OVER && r.lines.some((l) => l.includes('PHILOSOPHY.md: MISSING')), 'a missing core document is a finding, not a skip');
  r = gate(root, core.replace('const DOC_BUDGETS = {', 'const DOC_BUDGET_TABLE = {'));
  ok(r.code === EXIT_NO_TABLE, 'a table that cannot be read → code 2, never green');
  r = gate(root, core.replace("  'GOAL.md': { budget: 10, overflowTo: MOVE_OUT_ADDRESS },\n", ''));
  ok(r.code === EXIT_NO_TABLE, 'eight rows instead of nine → code 2 (a silently shrunk table is not a pass)');
  rmSync(root, { recursive: true, force: true });
  if (bad) { console.error(`✖ budget-gate selftest: ${bad} failed`); process.exit(1); }
  console.log('✅ budget-gate selftest OK — both answers, the missing document and the unreadable table');
}

// Файл — и дверь, и модуль (`gate`/`readBudgets` переиспользуются пробами): CLI исполняется ТОЛЬКО при прямом запуске,
// иначе импорт молча прогонял бы дверь и печатал в чужой вывод (тот же ход, что у `tools/sandbox-mute-guard.mjs`).
const IS_CLI = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (IS_CLI && process.argv.includes('--selftest')) selftest();
else if (IS_CLI) {
  const r = gate(REPO, readFileSync(join(REPO, CORE_REL), 'utf8'));
  for (const l of r.lines) console.log(l);
  process.exitCode = r.code;   // не process.exit(): вывод в конвейер на Windows асинхронный (EXP-0139, урок 3)
}
