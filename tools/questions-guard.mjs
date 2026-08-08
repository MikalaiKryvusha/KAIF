#!/usr/bin/env node
// questions-guard.mjs — страж места вопросов интерактивного контура (фаза K5, plans/48 шаг 1).
// [TESTED: 2026-08-07 · селфтест — все 6 мутаций сбылись по предсказанию (цитата вывода) + живой прогон по репо]
//
// Построен ПО собственному вендоренному контракту /owner-reviews (framework/skills/owner-reviews):
//   G1 — две узкие приметы (заголовок-очередь · адресация в начале строки), явные исключения
//        с причиной на строке; маркер с ПУСТОЙ причиной — сам нарушение; неотвеченное
//        интервью — ОТЧЁТ, не нарушение.
//   G2 — ratchet: унаследованный долг в базовой линии (ключ: файл + sha1 текста строки),
//        красное — только НОВОЕ; число долга печатается каждым прогоном и обязано убывать.
//   G3 — детектор протухшего статуса: статус «ждёт» при нуле пустых полей = STATUS STALE.
//   I20 — обратное плечо: у каждого ОТВЕЧЕННОГО вопроса объявленные адресаты цитируют
//        «интервью №NNN, QN»; сводка печатает ОБА плеча; единица — ВОПРОС, не файл.
//   I21 — старые интервью без поля адресата: эвристика «хотя бы одна цитата вне interviews/»,
//        без миграции; историю не переписываем.
//   C4(5) — распознавание букв только через \p{L} с флагом u (\w/\b — ASCII-only даже с u).
//   T9  — модуль импортируем без исполнения (гард точки входа).
//   G10 — селфтест мутациями с ПРЕДСКАЗАНИЕМ точного отказа до прогона.
//
// Запуск:  node tools/questions-guard.mjs            — прогон по репозиторию (exit 1 на новом)
//          node tools/questions-guard.mjs --selftest — мутации на временной фикстуре
//          node tools/questions-guard.mjs --write-baseline — снять базовую линию долга (однократно)
//          node tools/questions-guard.mjs --root <dir> [--baseline <file>] — прогон по чужому корню (фикстуры)

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, relative, resolve } from 'node:path'; // T10: resolve, не join, для внешних путей
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { tempRoot } from './lib/temp-root.mjs';
// Разбор интервью — ЕДИНЫМ парсером ядра (пилот 008: дубль парсера в страже разошёлся с ядром
// на «комментарий ≠ ответ» — класс «две истины» закрыт формой: один парсер обеим сторонам).
import { parseQuestions, docStatus } from './lib/review-core.mjs';

// ── Константы (никаких магических значений) ────────────────────────────────────────────────
// Скоуп скана — рабочие директории знаний обвязки + живой STATUS.md.
// Исключения С ПРИЧИНОЙ (G1: исключения только явные):
//   interviews/                 — ЗАКОННОЕ место вопросов (правило и существует ради него);
//   ideas/ai_agents_reports/, ideas/updade_kaif_field_reports/ — дословные полевые
//                                 первоисточники ЧУЖИХ проектов (неприкосновенны, шаг 15 чек-листа);
//   framework/, dist/, .claude/ — полезная нагрузка/генераты: текст правил и примеров
//                                 триггерит сам себя (T8 — не повторяй дословно то, чьё
//                                 отсутствие стережёшь);
//   PROJECT_HISTORY.md          — летопись append-only (историю не переписываем, I21).
const SCAN_DIRS = ['plans', 'researches', 'bugs', 'ideas', 'homeworks'];
const SCAN_FILES = ['STATUS.md'];
const EXCLUDE_SUBPATHS = ['ideas/ai_agents_reports', 'ideas/updade_kaif_field_reports'];
const INTERVIEWS_DIR = 'interviews';
const BASELINE_DEFAULT = 'tools/questions-guard.baseline.json';
const ADDRESS_WINDOW_CHARS = 40; // G1: адресация — в первых ~40 символах содержимого строки
// I20 (bugs/56): цитата разноса — ОДНА совместная примета «интервью №NNN, QN» в окне, а не два
// независимых теста существования по всему файлу. Окно снято ЗАМЕРОМ живых пар, не выведено из
// головы: у всех 11 пар (интервью 008–011) разрыв между номером и идентификатором вопроса — 1–2
// символа. 40 взято с запасом на законные вставки внутри цитаты («интервью №008 (контур K5), Q3»),
// оставаясь на два порядка уже прежнего «где угодно в файле».
const CITATION_WINDOW_CHARS = 40;

// Примета A (G1): ЗАГОЛОВОК-очередь вопросов владельцу. Узко: две компоненты в одной строке.
const QUEUE_HEADING_RE =
  /^#{1,6}\s.*(?:(?:ожида|жд)\p{L}*\s+(?:ответ\p{L}*\s+)?владельца|вопрос\p{L}*\s+(?:к\s+)?владельцу|открыт\p{L}+\s+вопрос\p{L}*.*владельц|awaits\s+the\s+owner|open\s+questions?\b.*(?:owner|human)|questions?\s+to\s+the\s+owner)/iu;

// Примета B (G1): адресация в НАЧАЛЕ строки (в окне первых символов, после маркеров списка/цитаты).
// G10: ищем синтаксис с двоеточием, не голое слово.
const ADDRESS_START_RE =
  /(?:❓|владельцу:|вопрос\s+владельцу:|спросить\s+владельца:|question\s+to\s+the\s+owner:)/iu;

// Исключение G1 (дословно из контракта): строка уже указывает на место вопросов.
const POINTS_TO_INTERVIEWS_RE = /interviews\/|интервью\s*№|interview\s*#/iu;

// Явное исключение стража: маркер с причиной на строке; пустая причина — само нарушение.
const ALLOW_MARKER_RE = /<!--\s*questions-guard:allow\s*(.*?)\s*-->/iu;

// ── Утилиты ────────────────────────────────────────────────────────────────────────────────
const sha1 = (s) => createHash('sha1').update(s, 'utf8').digest('hex');
const stripBom = (s) => s.replace(/^﻿/, '');
const readLines = (p) => stripBom(readFileSync(p, 'utf8')).split(/\r?\n/); // CRLF-терпимо
const rel = (root, p) => relative(root, p).replace(/\\/g, '/');
// Снять МЯГКИЙ перенос строки перед проверкой совместной приметы I20 (bugs/56): проза врапается,
// и врап не должен ослеплять стража — прецедент класса живёт в `tools/counters-guard.mjs`. Замер
// живого дерева: одна пара из одиннадцати (интервью 008 Q3 → `plans/48`) разорвана ровно так —
// «…ПОДТВЕРЖДЕНО: интервью» / «   №008, Q3 …», и жёсткое окно одной строки покрасило бы её зря.
// Схлопывается ТОЛЬКО продолжение (перенос, за которым идёт непустая строка) вместе с отступом и
// маркером цитаты; пустая строка остаётся границей абзаца, поэтому окно `[^\n]{0,N}` не
// перепрыгивает через абзацы.
const unwrap = (s) => s.replace(/\r?\n[ \t]*(?:>[ \t]*)?(?=\S)/g, ' ');

function* mdFiles(root) {
  for (const d of SCAN_DIRS) {
    const dir = join(root, d);
    if (!existsSync(dir)) continue;
    const stack = [dir];
    while (stack.length) {
      const cur = stack.pop();
      for (const name of readdirSync(cur).sort()) {
        const p = join(cur, name);
        const r = rel(root, p);
        if (EXCLUDE_SUBPATHS.some((e) => r === e || r.startsWith(e + '/'))) continue;
        if (statSync(p).isDirectory()) stack.push(p);
        else if (name.endsWith('.md')) yield p;
      }
    }
  }
  for (const f of SCAN_FILES) {
    const p = join(root, f);
    if (existsSync(p)) yield p;
  }
}

// ── Проверка 1: место вопросов (G1 + G2) ──────────────────────────────────────────────────
function scanPlaceOfQuestions(root) {
  const hits = []; // { file, line, text, key, emptyReason }
  for (const p of mdFiles(root)) {
    const lines = readLines(p);
    let inFence = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
      if (inFence) continue; // код-блоки — цитаты конвенции, не очереди (I24 по духу)

      // Явное исключение — маркер на строке; пустая причина = нарушение (G1).
      const allow = line.match(ALLOW_MARKER_RE);
      if (allow) {
        if (!allow[1]) hits.push(mkHit(root, p, i, line, true));
        continue;
      }
      if (POINTS_TO_INTERVIEWS_RE.test(line)) continue; // уже указывает на место вопросов

      const content = line.replace(/^[\s>*+-]+/u, ''); // мимо маркеров списка/цитаты
      const isQueueHeading = QUEUE_HEADING_RE.test(line);
      const isAddress = ADDRESS_START_RE.test(content.slice(0, ADDRESS_WINDOW_CHARS));
      if (isQueueHeading || isAddress) hits.push(mkHit(root, p, i, line, false));
    }
  }
  return hits;
}
const mkHit = (root, p, i, line, emptyReason) => ({
  file: rel(root, p),
  line: i + 1,
  text: line.trim(),
  key: rel(root, p) + '#' + sha1(line.trim()),
  emptyReason,
});

// Ось «вопрос ОТВЕЧАЕМ» (bugs/62). Контур обещает владельцу «фиксацию решений в один клик»; вопрос
// без разобранных вариантов это обещание молча нарушает — карточка рисуется, а выбрать нечем, и
// узнаёт об этом ВЛАДЕЛЕЦ на живой странице. Так было дважды: `bugs/51` (парсер не знал табличную
// форму) и `bugs/62` (агент написал варианты прозой, которой парсер не знает) — разные причины,
// один симптом, и не краснел никто: инструмент отрабатывал, гейты зеленели, вопросы считались.
// Страж меряет СВОЙСТВО «владелец может выбрать», а не прокси «вопрос существует».
// Скоуп — ЖИВЫЕ вопросы живых интервью: 28 вопросов закрытых интервью №002–007 написаны прозой до
// появления парсера, и красить историю страж не должен (тот же приём, что у оси меток времени в
// doc-header-lint — порог задаёт сам документ).
// Законный ход для вопроса без вариантов — ОБЪЯВИТЬ его свободным: маркер в теле вопроса.
const OPEN_MARK = /<!--\s*questions-guard:open\b/;
const MIN_OPTIONS = 2;   // один «вариант» — не выбор, а утверждение

// ── Проверка 2: интервью — неотвеченные (отчёт), протухший статус (G3), обратное плечо (I20/I21) ──
// Разбор — единым парсером ядра (C4, все пять правил; «комментарий ≠ ответ» — пилот 008).
function parseInterview(root, p) {
  const md = readLines(p).join('\n');
  const name = rel(root, p);
  const num = (name.match(/interview_(\d+)/) || [])[1] || null;
  const st = docStatus(md);
  const questions = parseQuestions(md).map((q) => ({
    id: q.id, answered: q.answered, targets: q.target ? [q.target] : [],
    // Ось «вопрос ОТВЕЧАЕМ» (bugs/62): сколько вариантов ПАРСЕР увидел в этом вопросе — ровно
    // столько радиокнопок нарисует страница. Не «сколько букв написал автор»: буквы, набранные
    // формой, которой парсер не знает, для владельца не существуют.
    options: q.options.length,
    // Явный отказ от вариантов — законный ход, но ОБЪЯВЛЕННЫЙ (см. OPEN_MARK ниже).
    open: OPEN_MARK.test(q.body ? q.body.join('\n') : ''),
  }));
  return { file: name, num, closed: st === 'closed', waiting: st === 'waiting', questions };
}

function scanInterviews(root) {
  const dir = join(root, INTERVIEWS_DIR);
  const out = { unanswered: [], stale: [], propagation: [], unanswerable: [] };
  if (!existsSync(dir)) return out;
  const files = readdirSync(dir).filter((f) => /^interview_\d+.*\.md$/.test(f)).sort();

  // Корпус для эвристики цитирования (I20/I21): все md вне interviews/ из скоупа + корневые доки.
  const corpus = [];
  for (const p of mdFiles(root)) corpus.push({ file: rel(root, p), text: readLines(p).join('\n') });
  for (const extra of ['MASTER_PLAN.md', 'AGENT_GUIDE.md']) {
    const p = join(root, extra);
    if (existsSync(p)) corpus.push({ file: extra, text: readLines(p).join('\n') });
  }

  for (const f of files) {
    const iv = parseInterview(root, join(dir, f));
    const empty = iv.questions.filter((q) => !q.answered);
    for (const q of empty) out.unanswered.push({ file: iv.file, q: q.id }); // ОТЧЁТ, не нарушение

    // G3: статус «ждёт» при нуле пустых полей = протух.
    if (iv.waiting && iv.questions.length > 0 && empty.length === 0)
      out.stale.push({ file: iv.file, key: iv.file + '#stale' });

    // bugs/62: живой вопрос обязан быть ОТВЕЧАЕМЫМ в один клик — или объявить себя свободным.
    if (iv.waiting) for (const q of empty) {
      if (q.open || q.options >= MIN_OPTIONS) continue;
      out.unanswerable.push({ file: iv.file, q: q.id, options: q.options,
        key: `${iv.file}#${q.id}#unanswerable` });
    }

    if (!iv.num) continue;
    const NUM_SRC = `(?:интервью|interview)[_\\s#№]*0*${Number(iv.num)}(?!\\d)`;
    const numRe = new RegExp(NUM_SRC, 'iu'); // используется эвристикой I21 — её поведение не меняем

    for (const q of iv.questions.filter((x) => x.answered)) {
      if (q.targets.length > 0) {
        // I20: каждый объявленный адресат цитирует «интервью №NNN, QN».
        for (const tgt of q.targets) {
          const m = tgt.match(/([\p{L}\d_./-]+\/[\p{L}\d_.-]+|[A-Z_]+\.md)/u);
          const hint = m ? m[1].replace(/\.md$/, '') : null;
          let docs = hint ? corpus.filter((c) => c.file.startsWith(hint)) : [];
          // Адресат может быть КОДОВЫМ файлом вне корпуса скана (tools/*.mjs — пилот 008):
          // читаем его с диска напрямую — цитата «интервью №NNN, QN» живёт и в комментариях кода.
          if (docs.length === 0 && hint && existsSync(resolve(root, m[1])))
            docs = [{ file: m[1], text: readLines(resolve(root, m[1])).join('\n') }];
          // bugs/56: было `numRe.test(text) && text.includes(q.id)` — ДВА независимых теста
          // существования по всему файлу. Номер интервью в одном абзаце и голое «QN» в другом —
          // в том числе оба из цитат ПОСТОРОННИХ интервью — зачитывали долг, которого никто не
          // отдавал; `includes('Q1')` вдобавок было истинно внутри «Q12». Спека (навык
          // `/owner-reviews`, I19) требует ОДНОЙ цитаты «интервью №NNN, QN» — совместной приметы,
          // а не двух токенов. Оба порядка следования законны; граница `(?![0-9])` убивает
          // подкласс «Q1 закрыт цитатой про Q12».
          const qSrc = `\\b${q.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![0-9])`;
          const jointRe = new RegExp(
            `${NUM_SRC}[^\\n]{0,${CITATION_WINDOW_CHARS}}?${qSrc}` +
            `|${qSrc}[^\\n]{0,${CITATION_WINDOW_CHARS}}?${NUM_SRC}`, 'iu');
          const cited = docs.some((c) => jointRe.test(unwrap(c.text)));
          if (!cited)
            out.propagation.push({
              file: iv.file, q: q.id, target: tgt,
              key: iv.file + '#' + q.id + '#' + sha1(tgt),
            });
        }
      }
    }
    // I21: у старого интервью (ни одного поля адресата во всём файле) — эвристика:
    // хотя бы одна цитата номера где угодно вне interviews/; единица здесь — файл.
    if (iv.closed && iv.questions.every((x) => x.targets.length === 0)) {
      const citedAnywhere = corpus.some((c) => numRe.test(c.text));
      if (!citedAnywhere)
        out.propagation.push({
          file: iv.file, q: '(эвристика I21)', target: 'вне interviews/',
          key: iv.file + '#i21',
        });
    }
  }
  return out;
}

// ── Прогон и вердикт ───────────────────────────────────────────────────────────────────────
export function runGuard({ root, baselinePath, writeBaseline = false, log = console.log }) {
  const place = scanPlaceOfQuestions(root);
  const iv = scanInterviews(root);

  const violations = [
    ...place.map((h) => ({ ...h, kind: h.emptyReason ? 'маркер с ПУСТОЙ причиной' : 'место вопросов' })),
    ...iv.stale.map((s) => ({ ...s, kind: 'STATUS ПРОТУХ (G3)', text: 'статус «ждёт» при нуле пустых полей' })),
    ...iv.propagation.map((d) => ({ ...d, kind: 'разнос не выполнен (I20)', text: `${d.q} → ${d.target}` })),
    // bugs/62: вопрос, который владелец не может ОТВЕТИТЬ в один клик. Отказ называет верный ход
    // (семейство 12) — обе легальные формы варианта и законный выход «свободный вопрос».
    ...iv.unanswerable.map((u) => ({ ...u, kind: 'вопрос НЕОТВЕЧАЕМ (bugs/62)',
      text: `${u.q}: парсер видит вариантов — ${u.options}; владельцу нечего выбрать. `
          + 'Запиши варианты СТРОКАМИ ТАБЛИЦЫ (| **A** | что означает | цена и риск |) или '
          + 'списком (- **A)** …), либо объяви вопрос свободным: <!-- questions-guard:open причина -->' })),
  ];

  if (writeBaseline) {
    const snap = violations.map((v) => ({ key: v.key, file: v.file, kind: v.kind, excerpt: (v.text || '').slice(0, 120) }));
    writeFileSync(baselinePath, JSON.stringify(snap, null, 2) + '\n', 'utf8');
    log(`Базовая линия снята: ${snap.length} унаследованных позиций → ${baselinePath}`);
    return { newViolations: [], inherited: snap.length, unanswered: iv.unanswered };
  }

  const baseline = existsSync(baselinePath)
    ? new Set(JSON.parse(stripBom(readFileSync(baselinePath, 'utf8'))).map((b) => b.key))
    : new Set();
  const inherited = violations.filter((v) => baseline.has(v.key));
  const fresh = violations.filter((v) => !baseline.has(v.key));

  // Сводка — ОБА плеча (I20): «ждут ответа» и «разнос-долг»; однокрылое «0 ждёт» — ложный зелёный.
  log(`— Ждут ответа: ${iv.unanswered.length} вопрос(ов)` +
    (iv.unanswered.length ? ' — ' + iv.unanswered.map((u) => `${u.file}:${u.q}`).join(', ') : ''));
  log(`— Долг (унаследовано, ratchet G2): ${inherited.length} из ${baseline.size} в базовой линии` +
    (baseline.size ? ` — обязан убывать` : ' — базовая линия не снята'));
  if (fresh.length) {
    log(`— НОВЫХ нарушений: ${fresh.length}`);
    for (const v of fresh) log(`  ✗ [${v.kind}] ${v.file}${v.line ? ':' + v.line : ''} — ${v.text}`);
  } else {
    log('— Новых нарушений: 0');
  }
  return { newViolations: fresh, inherited: inherited.length, unanswered: iv.unanswered };
}

// ── Селфтест: мутации с предсказанием (G10) на временной фикстуре (G5: правилам место на фикстуре) ──
function selftest() {
  // Корень фикстуры УНИКАЛЕН по построению (bugs/59); уборку держит сам помощник: зелёный
  // прогон каталог сносит, красный — ОСТАВЛЯЕТ и печатает путь.
  const box = tempRoot('questions-guard-selftest');
  const noop = () => {};
  let n = 0;
  const mut = (name, prediction, setup, expectRed, expectKind) => {
    rmSync(box, { recursive: true, force: true });
    mkdirSync(join(box, 'plans'), { recursive: true });
    mkdirSync(join(box, INTERVIEWS_DIR), { recursive: true });
    setup();
    const res = runGuard({ root: box, baselinePath: join(box, 'baseline.json'), log: noop });
    const red = res.newViolations.length > 0;
    const kindOk = !expectRed || res.newViolations.some((v) => v.kind.includes(expectKind));
    const ok = red === expectRed && kindOk;
    console.log(`${ok ? '✓' : '✗'} мутация ${++n} «${name}» — предсказание: ${prediction} — ` +
      (ok ? 'сбылось' : `ПРОВАЛ (red=${red}, kinds=${res.newViolations.map((v) => v.kind).join('|') || 'нет'})`));
    if (!ok) process.exitCode = 1;
  };
  const w = (relPath, text) => writeFileSync(join(box, relPath), text, 'utf8');

  // Три мутации G1 поимённо (контракт: new violation → red · маркер с причиной → green · пустая причина → red).
  mut('новое нарушение → красный', 'ровно 1 новое нарушение вида «место вопросов»',
    () => w('plans/01_test.md', '# План\n\n## Ожидает владельца\n\n- вопрос про X\n'),
    true, 'место вопросов');
  mut('маркер с причиной → зелёный', '0 нарушений',
    () => w('plans/01_test.md', '# План\n\n## Ожидает владельца <!-- questions-guard:allow сводка-указатель, вопросы в interviews/ -->\n'),
    false, '');
  mut('маркер с ПУСТОЙ причиной → красный', 'ровно 1 нарушение вида «пустая причина»',
    () => w('plans/01_test.md', '# План\n\n## Ожидает владельца <!-- questions-guard:allow -->\n'),
    true, 'ПУСТОЙ причиной');

  // G3: протухший статус — красный на полностью заполненной фикстуре со статусом «ждёт».
  mut('протухший статус (G3) → красный', 'нарушение «STATUS ПРОТУХ» на заполненном интервью со статусом «ждёт»',
    () => w('interviews/interview_090_test.md',
      '# Interview #090\n\n> Status: **🟡 awaiting the owner\'s answers**\n\n### Q1. Вопрос?\n\n**Answer:** А, так и делаем\n'),
    true, 'ПРОТУХ');

  // bugs/62: живой вопрос без разобранных вариантов — владельцу нечего нажать. Три мутации:
  // красный на прозе, зелёный на объявленном свободном вопросе, МОЛЧАНИЕ на закрытом интервью
  // (28 вопросов интервью №002–007 написаны прозой до появления парсера — история не красится).
  const PROSE_Q = '# Interview #092\n\n> Status: **🟡 awaiting the owner\'s answers**\n\n'
    + '## Q1. Что делаем?\n\n**A. Первый путь** — делаем так.\n\n**B. Второй путь** — делаем иначе.\n\n**Answer:**\n';
  mut('вопрос НЕОТВЕЧАЕМ (bugs/62) → красный', 'варианты прозой: парсер видит 0, радиокнопок нет',
    () => w('interviews/interview_092_test.md', PROSE_Q),
    true, 'НЕОТВЕЧАЕМ');
  mut('таблица вариантов → зелёный', '0 нарушений: рабочая форма даёт радиокнопки',
    () => w('interviews/interview_092_test.md',
      '# Interview #092\n\n> Status: **🟡 awaiting the owner\'s answers**\n\n## Q1. Что делаем?\n\n'
      + '| Вариант | Что означает | Цена |\n|---|---|---|\n| **A** | так | дёшево |\n| **B** | иначе | дорого |\n\n**Answer:**\n'),
    false, '');
  mut('объявленный свободный вопрос → зелёный', 'маркер questions-guard:open — законный ход',
    () => w('interviews/interview_092_test.md',
      '# Interview #092\n\n> Status: **🟡 awaiting the owner\'s answers**\n\n## Q1. Что делаем?\n\n'
      + '<!-- questions-guard:open ответ свободным текстом, вариантов нет по существу -->\n\nОпишите словами.\n\n**Answer:**\n'),
    false, '');
  // Фикстура ЗАКРЫТОГО интервью несёт объявленного адресата и файл, который его цитирует, — иначе
  // мутация краснела бы по ЧУЖОЙ оси (разнос I20: закрытый статус делает вопрос отвеченным, а
  // отвеченный без разноса — долг) и доказывала бы не то, что заявлено (грабля EXP-0057).
  mut('ЗАКРЫТОЕ интервью с вариантами прозой → зелёный', 'история не красится (скоуп — живые документы)',
    () => {
      w('interviews/interview_092_test.md',
        '# Interview #092\n\n> Status: **✅ ОТВЕЧЕНО 2026-08-08**\n\n## Q1. Что делаем?\n\n'
        + '**A. Первый путь** — делаем так.\n\n**B. Второй путь** — делаем иначе.\n\n'
        + '**Адресат ответа:** `plans/03` §1\n\n**Answer:** A\n');
      w('plans/03_target.md', '# План 03\n\nПо ответу интервью №092, Q1 — делаем А.\n');
    },
    false, '');

  // I20: разнос — удалить цитату из объявленного адресата → красный; с цитатой → зелёный.
  mut('обратное плечо (I20) → красный', 'долг разноса Q1 (адресат не цитирует интервью)',
    () => {
      w('interviews/interview_091_test.md',
        '# Interview #091\n\n> Status: **✅ ANSWERS RECEIVED 2026-08-07**\n\n### Q1. Вопрос?\n\n**Адресат ответа:** `plans/02` §1\n\n**Answer:** А\n');
      w('plans/02_target.md', '# План 02\n\nПро другое, без цитаты.\n');
    },
    true, 'разнос');
  mut('обратное плечо с цитатой → зелёный', '0 нарушений',
    () => {
      w('interviews/interview_091_test.md',
        '# Interview #091\n\n> Status: **✅ ANSWERS RECEIVED 2026-08-07**\n\n### Q1. Вопрос?\n\n**Адресат ответа:** `plans/02` §1\n\n**Answer:** А\n');
      w('plans/02_target.md', '# План 02\n\nПо ответу интервью №091, Q1 — делаем А.\n');
    },
    false, '');

  // bugs/56: три мутации СОВМЕСТНОЙ приметы. Прежняя проверка (два независимых теста существования
  // по всему файлу) проходила первые две из них зелёной — то есть зачитывала долг, которого никто
  // не отдавал. Третья — контрольная: страж, краснеющий на врапе, стерёг бы не то.
  const IV_091 = '# Interview #091\n\n> Status: **✅ ANSWERS RECEIVED 2026-08-07**\n\n### Q1. Вопрос?\n\n**Адресат ответа:** `plans/02` §1\n\n**Answer:** А\n';
  mut('адресат цитирует ЧУЖОЕ интервью с тем же id вопроса → красный (bugs/56)',
    'долг разноса Q1: номер СВОЕГО интервью и «Q1» есть, но врозь и из разных цитат',
    () => {
      w('interviews/interview_091_test.md', IV_091);
      w('plans/02_target.md', '# План 02\n\nПо ответу интервью №091 — общий абзац без идентификатора вопроса.\n\n' +
        'Отдельным абзацем, про ЧУЖОЕ решение: по ответу интервью №010 Q1 = B.\n');
    },
    true, 'разнос');
  mut('«Q1» закрыт цитатой про «Q12» → красный (bugs/56)',
    'долг разноса Q1: включение Q1 внутрь Q12 больше не считается цитатой',
    () => {
      w('interviews/interview_091_test.md', IV_091);
      w('plans/02_target.md', '# План 02\n\nПо ответу интервью №091, Q12 — делаем А.\n');
    },
    true, 'разнос');
  mut('цитата разорвана мягким переносом строки → зелёный (bugs/56)',
    '0 нарушений: врап прозы не имеет права ослеплять стража',
    () => {
      w('interviews/interview_091_test.md', IV_091);
      w('plans/02_target.md', '# План 02\n\n' +
        '3. Длинный пункт списка, где решение владельца подтверждено — ПОДТВЕРЖДЕНО: интервью\n' +
        '   №091, Q1 (перенос строки ровно как в живом `plans/48`).\n');
    },
    false, '');

  console.log(process.exitCode ? 'СЕЛФТЕСТ КРАСНЫЙ' : `селфтест зелёный: все ${n} мутаций сбылись по предсказанию`);
}

// ── Точка входа (T9: исполняемся только запуском, не импортом) ─────────────────────────────
if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) {
  const args = process.argv.slice(2);
  const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
  if (args.includes('--selftest')) {
    selftest();
  } else {
    const root = resolve(opt('--root') || process.cwd());
    const baselinePath = resolve(opt('--baseline') || join(root, BASELINE_DEFAULT));
    const res = runGuard({ root, baselinePath, writeBaseline: args.includes('--write-baseline') });
    if (res.newViolations.length > 0) {
      console.error(`КРАСНЫЙ: ${res.newViolations.length} новых нарушений места вопросов/разноса — ` +
        'исключение оформляй маркером <!' + '-- questions-guard:allow причина --' + '> с причиной на строке');
      process.exit(1);
    }
  }
}
