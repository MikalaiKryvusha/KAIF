#!/usr/bin/env node
// questions-guard.mjs — страж места вопросов интерактивного контура (фаза K5, plans/48 шаг 1).
// [TESTED: 2026-08-07 · селфтест 5 мутаций с предсказаниями + живой прогон по репо]
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
import { tmpdir } from 'node:os';

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

// Статусы интервью (эвристика по всей истории форматов: DONE / ОТВЕЧЕНО / ANSWERS RECEIVED / 🟡 awaiting).
const STATUS_CLOSED_RE = /✅|🟢|STATUS:\s*DONE|ANSWERS\s+RECEIVED|ОТВЕЧЕНО/iu;
const STATUS_WAITING_RE = /🟡|awaiting|ждёт\s+ответ|ожидает\s+ответ/iu;

// Вопрос и поля ответа внутри интервью.
const QUESTION_HEADING_RE = /^#{2,4}\s+(Q\d+|В\d+)\b/u;
const ANSWER_LABEL_RE = /^\s*\*{0,2}(?:Answer|Ответ(?:\s+владельца)?)\s*:?\*{0,2}\s*(.*)$/iu;
const TARGET_LABEL_RE = /^\s*\*{0,2}Адресат\s+ответа\s*:?\*{0,2}\s*(.*)$/iu;

// ── Утилиты ────────────────────────────────────────────────────────────────────────────────
const sha1 = (s) => createHash('sha1').update(s, 'utf8').digest('hex');
const stripBom = (s) => s.replace(/^﻿/, '');
const readLines = (p) => stripBom(readFileSync(p, 'utf8')).split(/\r?\n/); // CRLF-терпимо
const rel = (root, p) => relative(root, p).replace(/\\/g, '/');

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

// ── Проверка 2: интервью — неотвеченные (отчёт), протухший статус (G3), обратное плечо (I20/I21) ──
function parseInterview(root, p) {
  const lines = readLines(p);
  const name = rel(root, p);
  const num = (name.match(/interview_(\d+)/) || [])[1] || null;
  const head = lines.slice(0, 30).join('\n');
  const closed = STATUS_CLOSED_RE.test(head);
  const waiting = !closed && STATUS_WAITING_RE.test(head);

  // Вопросы: от заголовка QN до следующего заголовка того же/высшего уровня или горизонтальной
  // линейки --- (C4, правило 1: линейка тоже закрывает блок — иначе пустой вопрос «отвечен»).
  const questions = [];
  let cur = null;
  let inFence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; if (cur) cur.body.push(line); continue; }
    if (!inFence && (QUESTION_HEADING_RE.test(line) || /^#{1,3}\s/.test(line) || /^---\s*$/.test(line))) {
      if (cur) questions.push(cur);
      const qm = line.match(QUESTION_HEADING_RE);
      cur = qm ? { id: qm[1], body: [] } : null;
      continue;
    }
    if (cur) cur.body.push(line);
  }
  if (cur) questions.push(cur);

  for (const q of questions) {
    q.answered = false;
    q.targets = [];
    for (let j = 0; j < q.body.length; j++) {
      const t = q.body[j].match(TARGET_LABEL_RE);
      if (t) { q.targets.push(t[1]); continue; }
      const a = q.body[j].match(ANSWER_LABEL_RE);
      if (a) {
        // C4, правило 2: поле-«контрвопрос» ответом не считается; ответ = непустой текст
        // на строке метки или первой непустой строке ниже (до следующей метки/конца блока).
        let text = a[1].trim();
        if (!text) {
          for (let k = j + 1; k < q.body.length; k++) {
            const nl = q.body[k].trim();
            if (!nl) continue;
            if (ANSWER_LABEL_RE.test(q.body[k]) || TARGET_LABEL_RE.test(q.body[k])) break;
            text = nl;
            break;
          }
        }
        if (text) q.answered = true;
      }
      // C4, правило 3 (многострочный вариант ответа) покрыт сбором тела до следующей метки.
    }
    // C4, правило 4: истина о закрытости — СТАТУС ДОКУМЕНТА; в закрытом интервью вопрос без
    // распознанного поля ответа считается отвеченным иным форматом (историю не переписываем).
    if (closed) q.answered = true;
  }
  return { file: name, num, closed, waiting, questions };
}

function scanInterviews(root) {
  const dir = join(root, INTERVIEWS_DIR);
  const out = { unanswered: [], stale: [], propagation: [] };
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

    if (!iv.num) continue;
    const numRe = new RegExp(
      `(?:интервью|interview)[_\\s#№]*0*${Number(iv.num)}(?!\\d)`, 'iu');

    for (const q of iv.questions.filter((x) => x.answered)) {
      if (q.targets.length > 0) {
        // I20: каждый объявленный адресат цитирует «интервью №NNN, QN».
        for (const tgt of q.targets) {
          const m = tgt.match(/([\p{L}\d_./-]+\/[\p{L}\d_.-]+|[A-Z_]+\.md)/u);
          const hint = m ? m[1].replace(/\.md$/, '') : null;
          const docs = hint ? corpus.filter((c) => c.file.startsWith(hint)) : [];
          const cited = docs.some((c) => numRe.test(c.text) && c.text.includes(q.id));
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
  const box = join(tmpdir(), 'kaif-questions-guard-selftest');
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

  rmSync(box, { recursive: true, force: true });
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
