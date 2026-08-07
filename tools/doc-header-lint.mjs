#!/usr/bin/env node
// doc-header-lint.mjs — линтер шапки-меты документов знаний (эпик N, фаза N3, plans/53 шаг 2).
// [TESTED: 2026-08-07 · селфтест — 8 предсказанных находок на сломанной фикстуре (4 FULL + no-H1 +
// bugs-диалект + interview-диалект + корневой ярус), +1 под --all, чистые файлы молчат (цитата
// вывода в plans/53); живой прогон по репо — рабочий список массовой правки шага 3]
//
// Схема — решение в plans/53 («Решение по схеме»): каждый документ несёт линтуемую шапку-мету,
// по которой будущая сессия понимает документ, не читая тела. Четыре диалекта:
//   FULL (plans/ ideas/ researches/ homeworks/) — H1 первой строкой + blockquote-шапка сразу
//        после H1 с метками: **Создан:** (ISO-дата) · **Родитель:** · **Статус:** · **Вовне:**
//        (значение непустое на строке метки); опциональная **Наследники:** — формат, если есть.
//   BUGS (bugs/) — шапка шаблона /report-bug: **Status:** + **Version/build:** (родство/вовне —
//        секция ## Links шаблона; второй раз не канонизируем, DRY).
//   INTERVIEWS (interviews/) — диалект questions-guard: строки `> Topic:` + `> Status:` (G3
//        стережёт содержание статуса — здесь только наличие меток, две истины не плодим).
//   ROOT (корневые ключевые документы, рабочий список до канон-таксономии N4) — H1 первой
//        строкой + непустое самоописание до первого ##.
// Линтер КОНСУЛЬТИРУЕТ (exit 1 = есть находки), никогда не шлюз перед началом работы
// (антипаттерн DoR — критерий эпика 7).
//
// Запуск:  node tools/doc-header-lint.mjs             — живые документы (без _DONE_)
//          node tools/doc-header-lint.mjs --all       — включая DONE (advisory: ратчет ретрофита)
//          node tools/doc-header-lint.mjs --selftest  — красный доказан на сломанной фикстуре
//          node tools/doc-header-lint.mjs --root <dir> — прогон по чужому корню (фикстуры)

import { readFileSync, readdirSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// ── Константы (никаких магических значений) ────────────────────────────────────────────────
// Скоуп — top-level *.md рабочих директорий знаний; поддиректории (ideas/academic_style,
// ideas/*_reports, interviews/decisions, reports/KAIF_UPDATES) — коллекции спецартефактов,
// вне скоупа по построению.
const FULL_DIRS = ['plans', 'ideas', 'researches', 'homeworks'];
const BUGS_DIR = 'bugs';
const INTERVIEWS_DIR = 'interviews';
// Корневые ключевые документы (рабочий список N3; канон-таксономия — N4). Вне списка с причиной:
//   GOAL.md            — первоисточник владельца (неприкосновенен, чек-лист шаг 15);
//   KAIF_REFERENCE.md  — генерат (правится в framework/, стережёт check-framework);
//   README.md          — витрина, пара EN+RU со своим каноном (эпик J).
const ROOT_DOCS = [
  'AGENT_GUIDE.md', 'PHILOSOPHY.md', 'BUG_FIXING_FRAMEWORK.md', 'TESTING_FRAMEWORK.md',
  'REQUIREMENTS_FRAMEWORK.md', 'STATUS.md', 'MASTER_PLAN.md',
  'PROJECT_STRUCTURE_EXTERNAL_MAP.md', 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md',
  'KAIF_FRAMEWORK.md', 'EXPERIENCE.md', 'PROJECT_HISTORY.md', 'CLAUDE.md',
];
// Исключения файлов с причиной (явные, как у questions-guard):
//   README.md            — генераты payload (шаблоны framework/readmes/, правь источник);
//   ideas/07,12,13,14,17,18,19,20 — первоисточники владельца без H1 (неприкосновенны);
//   reports/             — дословные полевые артефакты чужих агентов + ответы; форму НАШИХ
//                          отчётов стерегут шаблоны заданий C/D (эпик M) — целиком вне скоупа.
const EXCLUDE_NAMES = new Set(['README.md']);
const OWNER_ORIGINALS = [
  /^ideas\/07_/, /^ideas\/12_/, /^ideas\/13_/, /^ideas\/14_/,
  /^ideas\/17_/, /^ideas\/18_/, /^ideas\/19_/, /^ideas\/20_/,
];
const DONE_RE = /_DONE_/i;
const HEADER_WINDOW = 5;   // blockquote-шапка обязана начаться в первых строках после H1
const HEAD_LINES = 25;     // диалектные метки ищем в голове файла, не по всему телу
const ISO_DATE_RE = /\b\d{4}-\d{2}-\d{2}\b/;

// Метки FULL-схемы: точные строки в точном регистре (EXP-0032: кириллица — без /i и диапазонов).
// Значение обязано начинаться на строке метки (конвенция фикс-схемы).
const FIELD_CREATED = 'Создан';
const FIELD_PARENT = 'Родитель';
const FIELD_STATUS = 'Статус';
const FIELD_OUTBOUND = 'Вовне';
const FIELD_HEIRS = 'Наследники'; // опциональная: линтуется формат, требовать нельзя

// ── Утилиты ────────────────────────────────────────────────────────────────────────────────
const stripBom = (s) => s.replace(/^﻿/, '');
const readLines = (p) => stripBom(readFileSync(p, 'utf8')).split(/\r?\n/); // CRLF-терпимо
const listMd = (dir) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith('.md')).map((e) => e.name).sort() : []);

// Регион шапки: непрерывный блок строк `>` , начавшийся в окне после H1.
function headerRegion(lines) {
  let start = -1;
  for (let i = 1; i < Math.min(lines.length, HEADER_WINDOW); i++) {
    if (/^>/.test(lines[i])) { start = i; break; }
    if (lines[i].trim() !== '') break; // первый непустой блок после H1 — не цитата → шапки нет
  }
  if (start < 0) return null;
  let end = start;
  while (end < lines.length && /^>/.test(lines[end])) end++;
  return lines.slice(start, end).join('\n');
}

// Метка FULL-схемы: `**Метка:** значение` — значение непустое на той же строке.
const labelRe = (name) => new RegExp('\\*\\*' + name + ':\\*\\*[ \\t]*\\S');
const labelPresentRe = (name) => new RegExp('\\*\\*' + name + ':\\*\\*');

function lintFull(relPath, lines, findings) {
  if (!/^# /.test(lines[0] || '')) { findings.push([relPath, 'нет H1 первой строкой (поле «Что это»)']); return; }
  const region = headerRegion(lines);
  if (!region) { findings.push([relPath, 'нет blockquote-шапки сразу после H1']); return; }
  if (!labelRe(FIELD_CREATED).test(region) || !ISO_DATE_RE.test(region.match(new RegExp('\\*\\*' + FIELD_CREATED + ':\\*\\*[^\\n]*'))?.[0] || '')) {
    findings.push([relPath, `поле **${FIELD_CREATED}:** отсутствует или без ISO-даты`]);
  }
  for (const f of [FIELD_PARENT, FIELD_STATUS, FIELD_OUTBOUND]) {
    if (!labelRe(f).test(region)) findings.push([relPath, `поле **${f}:** отсутствует или пусто`]);
  }
  // Опциональная метка: присутствует — значение обязано быть непустым.
  if (labelPresentRe(FIELD_HEIRS).test(region) && !labelRe(FIELD_HEIRS).test(region)) {
    findings.push([relPath, `поле **${FIELD_HEIRS}:** присутствует, но пусто`]);
  }
}

function lintBugs(relPath, lines, findings) {
  const head = lines.slice(0, HEAD_LINES).join('\n');
  if (!/^# /.test(lines[0] || '')) findings.push([relPath, 'нет H1 первой строкой']);
  if (!/\*\*Status:\*\*/.test(head)) findings.push([relPath, 'нет **Status:** (шапка шаблона /report-bug)']);
  if (!/\*\*Version\/build:\*\*/.test(head)) findings.push([relPath, 'нет **Version/build:** (шапка шаблона /report-bug)']);
}

function lintInterview(relPath, lines, findings) {
  const head = lines.slice(0, HEAD_LINES).join('\n');
  if (!/^# /.test(lines[0] || '')) findings.push([relPath, 'нет H1 первой строкой']);
  if (!/^>\s*(?:\*\*)?Topic:/m.test(head)) findings.push([relPath, 'нет `> Topic:` (диалект интервью)']);
  if (!/^>\s*(?:\*\*)?Status:/m.test(head)) findings.push([relPath, 'нет `> Status:` (диалект интервью)']);
}

function lintRoot(relPath, lines, findings) {
  if (!/^# /.test(lines[0] || '')) { findings.push([relPath, 'нет H1 первой строкой']); return; }
  const firstSection = lines.findIndex((l) => /^## /.test(l));
  const intro = lines.slice(1, firstSection < 0 ? lines.length : firstSection).join('').trim();
  if (!intro) findings.push([relPath, 'нет самоописания до первого ## (ярус корневых)']);
}

// ── Прогон ─────────────────────────────────────────────────────────────────────────────────
function run(root, { all = false } = {}) {
  const findings = [];
  let scanned = 0;
  const inScope = (rel) => {
    if (EXCLUDE_NAMES.has(rel.split('/').pop())) return false;
    if (OWNER_ORIGINALS.some((re) => re.test(rel))) return false;
    if (!all && DONE_RE.test(rel)) return false;
    return true;
  };
  for (const dir of FULL_DIRS) for (const f of listMd(join(root, dir))) {
    const rel = `${dir}/${f}`;
    if (!inScope(rel)) continue;
    scanned++; lintFull(rel, readLines(join(root, dir, f)), findings);
  }
  for (const f of listMd(join(root, BUGS_DIR))) {
    const rel = `${BUGS_DIR}/${f}`;
    if (!inScope(rel)) continue;
    scanned++; lintBugs(rel, readLines(join(root, BUGS_DIR, f)), findings);
  }
  for (const f of listMd(join(root, INTERVIEWS_DIR))) {
    const rel = `${INTERVIEWS_DIR}/${f}`;
    if (!inScope(rel)) continue;
    scanned++; lintInterview(rel, readLines(join(root, INTERVIEWS_DIR, f)), findings);
  }
  for (const f of ROOT_DOCS) {
    const p = join(root, f);
    if (!existsSync(p)) continue;
    scanned++; lintRoot(f, readLines(p), findings);
  }
  return { findings, scanned };
}

function report({ findings, scanned }) {
  for (const [file, msg] of findings) console.log(`  ${file} — ${msg}`);
  console.log(`doc-header-lint: scanned ${scanned}, findings ${findings.length}${findings.length ? '' : ' — all headers green'}`);
  return findings.length ? 1 : 0;
}

// ── Селфтест: красный доказан на сломанной фикстуре, зелёный — на чистой (G10) ─────────────
function selftest() {
  const fx = join(tmpdir(), 'kaif-doc-header-lint-fx');
  rmSync(fx, { recursive: true, force: true });
  for (const d of [...FULL_DIRS, BUGS_DIR, INTERVIEWS_DIR]) mkdirSync(join(fx, d), { recursive: true });
  // Сломанные (предсказание точных отказов ДО прогона):
  writeFileSync(join(fx, 'plans', '01_broken.md'),
    '# План 01 — сломанная шапка\n\n> **Создан:** без даты тут. **Статус:**\n\nтело\n');
  //   ожидаем: Создан без ISO-даты · Родитель отсутствует · Статус пусто (значение не на строке) · Вовне отсутствует = 4
  writeFileSync(join(fx, 'plans', '02_no_h1.md'), 'текст без заголовка\n');            // ожидаем: нет H1 = 1
  writeFileSync(join(fx, 'bugs', '03_bug_broken.md'), '# Bug 03 — без версии\n\n**Status:** OPEN\n'); // ожидаем: нет Version/build = 1
  writeFileSync(join(fx, 'interviews', 'interview_004_broken.md'), '# Interview 004\n\n> Topic: тема\n'); // ожидаем: нет Status = 1
  writeFileSync(join(fx, 'STATUS.md'), '# Статус\n## Сразу секция\n');                 // ожидаем: нет самоописания = 1
  // Чистые (не должны дать находок):
  writeFileSync(join(fx, 'plans', '05_clean.md'),
    '# План 05 — чистая шапка\n\n> **Создан:** 2026-08-07 · по слову владельца. **Родитель:** `plans/30`.\n> **Статус:** в работе. **Вовне:** —. **Наследники:** `plans/54`.\n\nтело\n');
  writeFileSync(join(fx, 'ideas', '06_DONE_closed.md'), 'без H1 — вне дефолтного скоупа\n'); // DONE: скипается без --all
  const expected = 8; // 4 + 1 + 1 + 1 + 1
  const res = run(fx, { all: false });
  console.log('— селфтест, сломанная фикстура —');
  report(res);
  if (res.findings.length !== expected) {
    console.error(`СЕЛФТЕСТ ПРОВАЛЕН: ожидали ${expected} находок, получили ${res.findings.length}`);
    process.exit(1);
  }
  const resAll = run(fx, { all: true }); // DONE-файл без H1 обязан дать +1 находку
  if (resAll.findings.length !== expected + 1) {
    console.error(`СЕЛФТЕСТ ПРОВАЛЕН (--all): ожидали ${expected + 1}, получили ${resAll.findings.length}`);
    process.exit(1);
  }
  rmSync(fx, { recursive: true, force: true });
  console.log(`selftest: ok — ${expected} предсказанных находок на сломанной фикстуре, +1 под --all, чистые файлы молчат`);
}

// ── Точка входа ────────────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes('--selftest')) { selftest(); }
else {
  const rootIdx = args.indexOf('--root');
  const root = rootIdx >= 0 ? args[rootIdx + 1] : process.cwd();
  process.exit(report(run(root, { all: args.includes('--all') })));
}
