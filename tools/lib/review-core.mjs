#!/usr/bin/env node
// review-core.mjs — ЯДРО интерактивного контура (фаза K5, plans/48 шаг 2; роль C1 «lib/review-core»).
// [TESTED: 2026-08-07 · селфтест «четыре лица — один хеш», полночь тихих часов, разбор, рендер]
//
// Одна библиотека ОБЕИМ сторонам (C3/C7: страница и гейт зовут одни и те же функции —
// «четыре лица — один хеш», checkApproval один на всех). Ноль внешних зависимостей.
// Построено по вендоренному контракту /owner-reviews:
//   C3 — normalize: BOM → CRLF/CR в LF → срез хвостовых пробелов/пустых строк → ровно один \n;
//        hash = sha256(normalize). Самотест: четыре лица одного текста дают ОДИН хеш.
//   C4 — пять правил разбора живого текста (линейка --- закрывает блок · контрвопрос не ответ ·
//        варианты многострочны · истина закрытости — СТАТУС документа · \p{L} с флагом u).
//   C6/I2 — ответ пишется в ТРИ места с производными именами; ответ владельца неприкосновенен —
//        новый текст только датированным дополнением; общий комментарий — датированным блоком в КОНЕЦ.
//   C7/I4 — checkApproval: отказ на любое сомнение, никогда не бросает; гейт fail-closed.
//   I6  — тихие часы с окном ЧЕРЕЗ ПОЛНОЧЬ (наивное from<=now<=to молчит днём и орёт ночью).
//   I22/I23 — провенанс в двух представлениях (ISO машине · локальное время словами человеку).
//   I24 — рендер вырезает HTML-комментарии ВНЕ код-блоков (внутри fenced — это контент).
//   P8  — markdown-мини-рендер, ноль зависимостей, экранирование ПЕРВЫМ действием.

import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

// ── Константы проекта (никаких магических значений) ────────────────────────────────────────
export const PROJECT_NAME = 'KAIF'; // P9: имя проекта в шапке страницы — владелец ведёт несколько проектов
export const OWNER_NAME = 'Mikalai Kryvusha (KOT KRINIK)'; // P4: вопрос «кто отвечает» убран, ЗАПИСЬ by остаётся
export const DECISIONS_DIR = 'interviews/decisions'; // машинная память решений (коммитится)
export const ARCHIVE_DIR = 'interviews/decisions/archive'; // копии «никогда не перезаписываются»
// Тихих часов в ЭТОМ репозитории НЕТ — слово владельца (интервью №008, Q1, 2026-08-07):
// «в проекте KAIF тихих часов нет». Канонический дефолт КОНТРАКТА (23:00–09:00, I6) остаётся
// нормой для развёртываемых проектов — здесь выключено осознанно, зов звучит всегда.
export const QUIET_FROM = null;
export const QUIET_TO = null;

// ── C3: нормализация и хеш — одна функция обеим сторонам ───────────────────────────────────
export function normalize(s) {
  return String(s)
    .replace(/^﻿/, '')        // BOM
    .replace(/\r\n?/g, '\n')       // CRLF и одиночный CR → LF
    .replace(/[ \t\n]+$/, '')      // хвост пробельного мусора и пустых строк
    + '\n';                        // ровно один финальный перевод строки
}
export const bodyHash = (s) => createHash('sha256').update(normalize(s), 'utf8').digest('hex');
export const sha256hex = (s) => createHash('sha256').update(s, 'utf8').digest('hex');

// ── I22/I23: провенанс в двух представлениях ───────────────────────────────────────────────
const RU_MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
export function provenance(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const offMin = -now.getTimezoneOffset();
  const off = (offMin >= 0 ? '+' : '-') + pad(Math.floor(Math.abs(offMin) / 60)) + ':' + pad(Math.abs(offMin) % 60);
  const atHuman = `${now.getDate()} ${RU_MONTHS[now.getMonth()]} ${now.getFullYear()}, ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())} (${off})`; // локальное время словами — человеку
  return { at: now.toISOString(), atHuman };
}

// ── I6: тихие часы — окно пересекает полночь ───────────────────────────────────────────────
export function inQuietHours(now = new Date(), from = QUIET_FROM, to = QUIET_TO) {
  if (!from || !to) return false; // окно не задано — тихих часов нет (№008 Q1)
  const mins = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const n = now.getHours() * 60 + now.getMinutes();
  const f = mins(from), t = mins(to);
  return f <= t ? (n >= f && n < t) : (n >= f || n < t); // вторая ветвь — окно через полночь
}

// ── Метаданные документа (контракт имён): fenced-блок в голове документа ───────────────────
// ```owner-review\n title: … \n kind: … \n artifacts:\n  - id: …\n    target: …\n    format: …\n    body_file: …\n```
export function parseMetaBlock(md) {
  const m = normalize(md).match(/^```owner-review\n([\s\S]*?)\n```/m);
  if (!m) return null;
  const meta = { artifacts: [] };
  let cur = null;
  for (const raw of m[1].split('\n')) {
    const art = raw.match(/^\s*-\s+id:\s*(.+)$/u);
    if (art) { cur = { id: art[1].trim() }; meta.artifacts.push(cur); continue; }
    const kv = raw.match(/^(\s*)([\w_]+):\s*(.*)$/u);
    if (!kv) continue;
    if (kv[1].length > 0 && cur) cur[kv[2]] = kv[3].trim();
    else if (kv[2] !== 'artifacts') meta[kv[2]] = kv[3].trim();
  }
  return meta;
}

// ── Статус документа (C4, правило 4: истина закрытости — СТАТУС, не заполненность полей) ───
//
// bugs/70. Прежде закрытость искалась ГОЛЫМ СЛОВОМ по первым тридцати строкам, и проверка шла
// ПЕРВОЙ. Отсюда два ложных зелёных, оба воспроизведены фикстурами ниже:
//   · отрицание невидимо — «Status: пока НЕ ОТВЕЧЕНО» и «no ANSWERS RECEIVED yet» давали closed;
//   · посторонняя ✅ в шапке («задача T12 ✅ закрыта вчера») перебивала явное «🟡 awaiting».
// А `closed` принудительно ставит `answered = true` ВСЕМ вопросам с пустым `**Answer:**` — то есть
// «Ждут ответа: 0» становилось ложным зелёным, и вопрос владельцу мог потеряться молча.
//
// Форма фикса — та, что уже требуют собственные нормы контура: G10 «ищи синтаксис с двоеточием,
// НИКОГДА не голое слово» и G6 «распознавание строится ОТРИЦАТЕЛЬНО». Поэтому:
//   1) маркер ищется ТОЛЬКО в СТРОКЕ СТАТУСА (`> Status:` / `> **Статус:**`) — разметка, не слово;
//   2) документ по умолчанию ЖИВОЙ: закрытым его делает только явная разметка без отрицания.
// Проверено по корпусу ПЕРЕД правкой: все 17 живых интервью несут строку статуса — ложных
// красных фикс не порождает.
const STATUS_LINE_RE = /^\s*>?\s*\*{0,2}(?:Status|Статус)\s*:?\*{0,2}\s*(.*)$/imu;
const STATUS_CLOSED_RE = /✅|🟢|STATUS:\s*DONE|ANSWERS\s+RECEIVED|ОТВЕЧЕНО/iu;
const STATUS_WAITING_RE = /🟡|awaiting|ждёт\s+ответ|ожидает\s+ответ/iu;
// ⚠️ Границы слова — ЛУКАРАУНДЫ по свойству Unicode, а не `\b`: в JS `\b` считает словом только
// [A-Za-z0-9_], поэтому `\bне` на кириллице не срабатывает вовсе (родня EXP-0032). Первая
// редакция этого регэкспа была написана с `\b`, и собственная фикстура тут же её опровергла.
const STATUS_NEGATION_RE = /(?<!\p{L})не\s*отвечен|неотвечен|(?<!\p{L})пока\s+не(?!\p{L})|(?<!\p{L})ещё\s+не(?!\p{L})|\bno\b[^.]{0,40}\byet\b|\bnot\b[^.]{0,40}\banswer/iu;

export function docStatus(md) {
  const head = normalize(md).split('\n').slice(0, 30).join('\n');
  const m = head.match(STATUS_LINE_RE);
  if (!m) return 'none';                                 // строки статуса нет — документ ЖИВОЙ
  const line = m[1];
  if (STATUS_NEGATION_RE.test(line)) return 'waiting';   // отрицание сильнее галочки
  if (STATUS_CLOSED_RE.test(line)) return 'closed';
  if (STATUS_WAITING_RE.test(line)) return 'waiting';
  return 'none';
}

// ── C4: разбор вопросов живого текста ──────────────────────────────────────────────────────
const QUESTION_HEADING_RE = /^(#{2,4})\s+((Q|В)\d+)\.?\s*(.*)$/u;
// bugs/53: скобка модификатора ДОПУСКАЕТ ОДИН УРОВЕНЬ ВЛОЖЕННОСТИ. Прежний `[^)]*` обрывался на
// первой закрывающей скобке, а метка времени канона T8 несёт смещение в скобках —
// «(дополнение, 8 августа 2026, 06:48 (+03:00))». Итог был бесшумным и злым: ответ владельца
// ЗАПИСЫВАЛСЯ в документ, но не РАСПОЗНАВАЛСЯ — очередь и страж вопросов продолжали считать
// вопрос неотвеченным, то есть работа человека существовала на диске и не существовала для
// системы. Класс: формат метки поменяли в одном месте, а её ЧИТАТЕЛЬ остался прежним.
const ANSWER_LABEL_RE = /^\s*\*{0,2}(?:Answer|Ответ(?:\s+владельца)?)\s*(?:\((?<mod>(?:[^()]|\([^()]*\))*)\))?\s*:\*{0,2}\s*(?<rest>.*)$/iu;
const COUNTER_LABEL_RE = /встречн\p{L}*\s+вопрос|counter-?question/iu; // правило 2: контрвопрос — НЕ ответ
const COMMENT_LABEL_RE = /^\s*\*{0,2}Комментарий\s+владельца/iu; // комментарий — НЕ текст ответа (пилот 008)
const TARGET_LABEL_RE = /^\s*\*{0,2}Адресат\s+ответа\s*:?\*{0,2}\s*(.*)$/iu;
// Рекомендация агента живёт прозой («Рекомендация агента: C…»), а выбирать человек будет КНОПКУ.
// Переводить букву из абзаца в кнопку глазами — работа, которую обязана делать машина; просьба
// владельца дословно: «я хочу видеть рекомендованный вариант в вариантах ответа» (2026-08-08 07:40).
const RECOMMEND_RE = /(?:Рекомендация\s+агента|Agent'?s?\s+recommendation)\s*[:—–-]?\s*\*{0,2}([A-ZА-Я])\b/u;
const OPTION_START_RE = /^\s*-\s+\*\*([A-ZА-Я])\)/u;
// ВТОРАЯ легальная форма варианта — СТРОКА ТАБЛИЦЫ (bugs/51). Полевой факт: таблица
// «Вариант | Что означает | Цена» — естественная запись развилки, и её выбрали ДВА независимых
// автора подряд (интервью №012 и №013); парсер знал только список, возвращал ноль вариантов, и
// страница молча отдавала текстовое поле вместо радиокнопок — «зелёное без содержания».
// Признак строки-варианта, узкий по построению: ячейка-буква (одна A–Z/А–Я, опционально жирная,
// опционально с точкой или скобкой) + хотя бы одна содержательная ячейка справа. Шапка
// («Вариант») и разделитель (`---`) под него не подходят и отсеиваются сами.
// Клетка буквы может нести ПОМЕТКУ В СКОБКАХ — «| **A** (рекомендация агента) |». Форма
// прижилась в живых интервью, а парсер её не знал и вариант молча выбрасывал: в опубликованном
// №016 автор написал четыре варианта, страница показала три, и потерялся ровно тот, что был
// рекомендацией. Скобка — единственное расширение: `[^|]*` пропустил бы обычную строку данных
// («| A very long name | …»), а развилка от таблицы данных только этим и отличается.
const OPTION_ROW_RE = /^\s*\|\s*\*{0,2}([A-ZА-Я])[.)]?\*{0,2}(?:\s*\([^)]*\))?\s*\|(.+)$/u;
const isOptionLine = (line) => OPTION_START_RE.test(line) || OPTION_ROW_RE.test(line);

export function parseQuestions(md) {
  const lines = normalize(md).split('\n');
  const closed = docStatus(md) === 'closed';
  const questions = [];
  let cur = null, curLevel = 0, inFence = false;

  const flush = () => { if (cur) { finishQuestion(cur, closed); questions.push(cur); cur = null; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; if (cur) cur.body.push(line); continue; }
    if (inFence) { if (cur) cur.body.push(line); continue; }
    const qh = line.match(QUESTION_HEADING_RE);
    const anyHeading = line.match(/^(#{1,6})\s/);
    // Правило 1: блок закрывает не только следующий заголовок, но и горизонтальная линейка ---
    if (/^---\s*$/.test(line)) { flush(); continue; }
    if (qh) { flush(); cur = { id: qh[2], title: qh[4].trim(), line: i + 1, body: [] }; curLevel = qh[1].length; continue; }
    if (anyHeading && anyHeading[1].length <= curLevel) { flush(); continue; }
    if (cur) cur.body.push(line);
  }
  flush();
  return questions;
}

// Таблица вариантов (bugs/51) разбирается ДО построчного цикла — одним решением на весь блок,
// чтобы радиокнопки и проза карточки видели одно и то же: строки, ставшие вариантами, из прозы
// исчезают, иначе таблица показалась бы дважды. Порог «≥2 строки-варианта в одном непрерывном
// блоке» отсекает случайную таблицу данных, у которой первая ячейка — одна буква: развилка с
// одним вариантом не развилка, а таблица с одной буквенной строкой — почти наверняка данные.
const MIN_TABLE_OPTIONS = 2;
function scanOptionTables(body) {
  const lines = new Set();
  const options = [];
  let run = [];
  const flushRun = () => {
    const rows = run.filter((r) => r.m);
    if (rows.length >= MIN_TABLE_OPTIONS) {
      for (const r of run) lines.add(r.j);                    // весь блок, включая шапку и разделитель
      for (const r of rows) {
        const cells = r.m[2].replace(/\|\s*$/, '').split('|').map((c) => c.trim()).filter(Boolean);
        options.push({ letter: r.m[1], lines: [], row: cells });
      }
    }
    run = [];
  };
  for (let j = 0; j < body.length; j++) {
    if (/^\s*\|/.test(body[j])) { run.push({ j, m: body[j].match(OPTION_ROW_RE) }); continue; }
    flushRun();
  }
  flushRun();
  return { lines, options };
}

function finishQuestion(q, docClosed) {
  const table = scanOptionTables(q.body);
  q.optionTableLines = table.lines;   // читает и карточка страницы — разбор один на всех
  q.options = [...table.options];
  q.answers = [];      // все распознанные поля ответа (текст может быть многострочным ниже метки)
  q.target = null;
  let curOpt = null;
  let targetOpen = false;   // поле «Адресат ответа:» открыто — следующая строка с отступом его продолжает
  for (let j = 0; j < q.body.length; j++) {
    const line = q.body[j];
    const opt = line.match(OPTION_START_RE);
    if (opt) {
      // Правило 3: вариант МНОГОСТРОЧЕН — собираем пункт с продолжениями по отступу,
      // только потом ищем закрывающие ** (метку варианта).
      curOpt = { letter: opt[1], lines: [line] };
      q.options.push(curOpt);
      continue;
    }
    if (q.optionTableLines.has(j)) { curOpt = null; continue; } // таблица разобрана до цикла
    if (curOpt && /^\s{2,}\S/.test(line)) { curOpt.lines.push(line); continue; }
    curOpt = null;
    // АДРЕСАТОВ У ВОПРОСА МОЖЕТ БЫТЬ НЕСКОЛЬКО (круг R2, ось G). Прежде каждая следующая строка
    // «Адресат ответа:» ЗАТИРАЛА предыдущую, а список, завёрнутый на вторую строку, терялся
    // целиком — поле читается построчно. В живых интервью многоадресными оказались ВСЕ поля,
    // и страж разноса числил ноль долга там, где второй адресат ответа не получал.
    // Копим, а не перезаписываем; разделитель — перевод строки, чтобы разбор адресов ниже видел
    // каждую строку целиком.
    const t = line.match(TARGET_LABEL_RE);
    if (t) { const v = t[1].trim(); q.target = q.target ? q.target + '\n' + v : v; targetOpen = true; continue; }
    // Продолжение поля: строка с отступом сразу под меткой — часть того же перечня адресатов.
    if (targetOpen && /^\s{2,}\S/.test(line)) { q.target += '\n' + line.trim(); continue; }
    targetOpen = false;
    const a = line.match(ANSWER_LABEL_RE);
    if (a && !COUNTER_LABEL_RE.test(line)) {
      let text = (a.groups.rest || '').trim();
      if (!text) { // текст ответа может лежать первой непустой строкой ниже метки
        for (let k = j + 1; k < q.body.length; k++) {
          const nl = q.body[k].trim();
          if (!nl) continue;
          // ПОЛЕВОЙ БАГ пилота 008: «Комментарий владельца» ниже пустого Answer читался как
          // текст ответа — вопрос ложно закрывался, а G3 ложно кричал «статус протух».
          if (ANSWER_LABEL_RE.test(q.body[k]) || TARGET_LABEL_RE.test(q.body[k]) ||
              isOptionLine(q.body[k]) || COMMENT_LABEL_RE.test(q.body[k])) break;
          text = nl; break;
        }
      }
      q.answers.push({ line: j, text, followUp: Boolean(a.groups.mod) });
    }
  }
  for (const o of q.options) {
    if (o.row) {
      // Табличная форма. БУКВА ОБЯЗАНА ОСТАТЬСЯ В ТЕКСТЕ варианта: у списочной формы она видна
      // сама собой («- **A)** …»), а здесь жила в отдельной ячейке — и, склеив только остальные
      // ячейки, я стирал её с экрана. Полевой отказ владельца, 2026-08-08 ≈07:00 +03:00: «как мне
      // предлагаешь выбирать варианты, если они не именованы?» — рекомендация «вариант C» не
      // ложится ни на одну кнопку, когда у кнопок нет имён (bugs/51, вторая итерация).
      o.label = o.letter + ')';
      o.text = '**' + o.letter + ')** ' + o.row.join(' — ');
      continue;
    }
    const full = o.lines.join('\n');
    const label = full.match(/\*\*([^*]+)\*\*/u); // закрывающие ** ищем ПОСЛЕ сборки пункта
    o.label = label ? label[1].trim() : o.letter + ')';
    o.text = full.replace(/^\s*-\s+/, '');
  }
  // Буква рекомендации берётся из прозы вопроса и вешается на САМ вариант (страница рисует чип).
  // Ищем только среди строк ВНЕ вариантов: внутри текста варианта слово «рекомендация» может
  // встретиться как часть довода, и это не объявление выбора.
  const proseLines = q.body.filter((l, j) => !q.optionTableLines.has(j) && !OPTION_START_RE.test(l));
  const rec = proseLines.join('\n').match(RECOMMEND_RE);
  q.recommended = rec && q.options.some((o) => o.letter === rec[1]) ? rec[1] : null;
  q.answered = docClosed || q.answers.some((a) => a.text); // правило 4
}

// ── P8 + I24: markdown-мини-рендер (экранирование — ПЕРВОЕ действие) ───────────────────────
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function inline(s) {
  // порядок: код-спаны раньше прочего, чтобы разметка внутри них осталась буквальной
  return s
    .replace(/`([^`]+)`/g, (_, c) => '<code>' + c + '</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\p{L}\d])\*([^*]+)\*(?!\*)/gu, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}
export function renderMd(md) {
  const src = normalize(md).split('\n');
  const out = [];
  let inFence = false, fenceBuf = [], listOpen = false, quoteOpen = false, tableBuf = [];
  const closeList = () => { if (listOpen) { out.push('</ul>'); listOpen = false; } };
  const closeQuote = () => { if (quoteOpen) { out.push('</blockquote>'); quoteOpen = false; } };
  const flushTable = () => {
    if (!tableBuf.length) return;
    const rows = tableBuf.map((r) => r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim()));
    let html = '<table>';
    rows.forEach((cells, ri) => {
      if (ri === 1 && cells.every((c) => /^:?-{2,}:?$/.test(c))) return;
      const tag = ri === 0 ? 'th' : 'td';
      html += '<tr>' + cells.map((c) => '<' + tag + '>' + inline(escapeHtml(c)) + '</' + tag + '>').join('') + '</tr>';
    });
    out.push(html + '</table>');
    tableBuf = [];
  };
  for (const raw of src) {
    if (/^\s*```/.test(raw)) {
      if (inFence) { out.push('<pre><code>' + escapeHtml(fenceBuf.join('\n')) + '</code></pre>'); fenceBuf = []; }
      inFence = !inFence;
      continue;
    }
    if (inFence) { fenceBuf.push(raw); continue; } // внутри fenced комментарии — контент (I24)
    const line = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/[ \t]+$/, ''); // I24: срез HTML-комментариев вне кода
    if (/^\s*\|.*\|\s*$/.test(line)) { closeList(); closeQuote(); tableBuf.push(line); continue; }
    flushTable();
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { closeList(); closeQuote(); out.push(`<h${h[1].length}>` + inline(escapeHtml(h[2])) + `</h${h[1].length}>`); continue; }
    if (/^---+\s*$/.test(line)) { closeList(); closeQuote(); out.push('<hr>'); continue; }
    const q = line.match(/^>\s?(.*)$/);
    if (q) { closeList(); if (!quoteOpen) { out.push('<blockquote>'); quoteOpen = true; } out.push('<p>' + inline(escapeHtml(q[1])) + '</p>'); continue; }
    closeQuote();
    const li = line.match(/^\s*[-*+]\s+(.*)$/);
    if (li) { if (!listOpen) { out.push('<ul>'); listOpen = true; } out.push('<li>' + inline(escapeHtml(li[1])) + '</li>'); continue; }
    closeList();
    if (line.trim()) out.push('<p>' + inline(escapeHtml(line)) + '</p>');
  }
  flushTable(); closeList(); closeQuote();
  return out.join('\n');
}

// ── C6/I2: запись решения в ТРИ места с производными именами ───────────────────────────────
export function decisionPaths(root, docPath) {
  const base = basename(docPath).replace(/\.md$/u, '');
  return {
    decision: resolve(root, DECISIONS_DIR, base + '.decision.json'),
    archive: (at) => resolve(root, ARCHIVE_DIR, base + '--' + at.replace(/[:.]/g, '-') + '.json'),
  };
}

export function recordDecision(root, docPath, payload, now = new Date()) {
  const { at, atHuman } = provenance(now);
  const abs = resolve(root, docPath);
  const record = {
    kind: payload.kind || 'interview',
    document: docPath.replace(/\\/g, '/'),
    by: payload.by || OWNER_NAME, // P4: сервер штампует by — вопрос убран, запись остаётся
    at, atHuman,
    comment: payload.comment || '',
    ...(payload.answers ? { answers: payload.answers } : {}),
    ...(payload.artifacts ? { artifacts: payload.artifacts } : {}),
  };

  // Место 1: обратно в исходный md (следующая сессия читает документ).
  const src = readFileSync(abs, 'utf8');
  const eol = /\r\n/.test(src) ? '\r\n' : '\n';
  const lines = src.replace(/^﻿/, '').split(/\r?\n/);
  const questions = parseQuestions(src);
  const prov = `<!-- owner-review: by ${record.by} · ${atHuman} -->`;
  // ПОЛЕВОЙ БАГ пилота 008: вставка комментария сдвигает строки НИЖЕ себя, и позиции следующих
  // вопросов протухают (хвост Q4 уехал в строку варианта D). Лечение по классу: вопросы
  // обрабатываются СНИЗУ ВВЕРХ — сплайсы не трогают ещё не обработанные позиции выше.
  // Документ владельца не трогается, когда писать в него нечего (класс «сообщение»: пометка
  // «прочитано» без комментария — легальная запись БЕЗ единой правки текста). Пустая перезапись
  // выглядит безобидно, но срезает BOM и штампует mtime чужому файлу.
  let touched = false;
  const entries = Object.entries(payload.answers || {})
    .map(([qid, ans]) => ({ qid, ans, q: questions.find((x) => x.id === qid) }))
    .filter((e) => e.q)
    .sort((a, b) => b.q.line - a.q.line);
  for (const { ans, q } of entries) {
    const answerText = [ans.choice ? ans.choice + ')' : '', ans.text || ''].filter(Boolean).join(' — ').trim();
    const qStart = q.line; // 1-based строка заголовка вопроса
    // Комментарий — ПЕРВЫМ (в конец блока): сплайс ниже строки ответа её не сдвигает.
    if (ans.comment) {
      lines.splice(qStart + q.body.length, 0, '', `**Комментарий владельца (${atHuman}):** ${ans.comment} ${prov}`, '');
      touched = true;
    }
    // «Только комментарий» — НЕ ответ: поле Answer не трогаем, вопрос остаётся открытым (пилот 008).
    if (!answerText) continue;
    const emptyAns = q.answers.find((a) => !a.text);
    touched = true;
    if (emptyAns !== undefined) {
      lines[qStart + emptyAns.line] = lines[qStart + emptyAns.line].replace(/\s*$/, '') + ' ' + answerText + ' ' + prov;
    } else {
      // Ответ владельца НЕПРИКОСНОВЕНЕН: новый текст — только датированным дополнением (I2)
      const lastAns = q.answers[q.answers.length - 1];
      const insertAt = lastAns ? qStart + lastAns.line + 1 : qStart + q.body.length;
      lines.splice(insertAt, 0, '', `**Answer (дополнение, ${atHuman}):** ${answerText} ${prov}`);
    }
  }
  if (record.comment) { // общий комментарий — датированным блоком в КОНЕЦ файла (C6)
    while (lines.length && lines[lines.length - 1] === '') lines.pop();
    lines.push('', '---', '', `**Комментарий владельца (${atHuman}):** ${record.comment} ${prov}`, '');
    touched = true;
  }
  if (touched) writeFileSync(abs, lines.join(eol), 'utf8');

  // Место 2: <база>.decision.json рядом (машинная проверка перед отправкой).
  const p = decisionPaths(root, docPath);
  mkdirSync(resolve(root, ARCHIVE_DIR), { recursive: true });
  writeFileSync(p.decision, JSON.stringify(record, null, 2) + '\n', 'utf8');
  // Место 3: копия в архиве решений — никогда не перезаписывается (имя несёт время).
  writeFileSync(p.archive(at), JSON.stringify(record, null, 2) + '\n', 'utf8');
  return record;
}

export function readDecision(root, docPath) {
  const p = decisionPaths(root, docPath).decision;
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, '')); } catch { return null; }
}

// ── C7/I4: гейт отправки — одна функция обеим сторонам, никогда не бросает ─────────────────
export function checkApproval(root, docPath, artifactId) {
  try {
    const decision = readDecision(root, docPath);
    if (!decision) return { ok: false, reason: 'решения нет — вычитка не проводилась' };
    const art = (decision.artifacts || {})[artifactId];
    if (!art) return { ok: false, reason: `артефакт «${artifactId}» не объявлен в решении` };
    if (art.status !== 'approved') return { ok: false, reason: `статус артефакта — «${art.status}», не approved` };
    const meta = parseMetaBlock(readFileSync(resolve(root, docPath), 'utf8'));
    const decl = (meta && meta.artifacts.find((a) => a.id === artifactId)) || null;
    if (!decl || !decl.body_file) return { ok: false, reason: 'артефакт не объявлен в метаблоке документа или без body_file' };
    const bodyPath = resolve(root, decl.body_file); // T10: resolve, не join
    if (!existsSync(bodyPath)) return { ok: false, reason: `тело артефакта отсутствует: ${decl.body_file}` };
    const actual = bodyHash(readFileSync(bodyPath, 'utf8'));
    if (actual !== art.sha256) return { ok: false, reason: 'текст изменился после одобрения — одобрение НЕДЕЙСТВИТЕЛЬНО (I3)' };
    return { ok: true, reason: 'approved, хеш совпал' };
  } catch (e) {
    return { ok: false, reason: 'неожиданная ошибка проверки: ' + e.message }; // любое сомнение = отказ
  }
}

// ── Селфтест ядра (QA-блок 1) ──────────────────────────────────────────────────────────────
function selftest() {
  let n = 0, bad = 0;
  const ok = (cond, name) => { n++; if (!cond) { bad++; console.log('✗ ' + name); } else console.log('✓ ' + name); };

  // C3: четыре лица — один хеш
  const base = 'Строка один\nСтрока два\n';
  const faces = ['﻿' + base, base.replace(/\n/g, '\r\n'), base + '\n\n', base.replace(/\n$/, '')];
  ok(new Set(faces.map(bodyHash)).size === 1, 'нормализация: четыре лица (BOM/CRLF/хвост/без \\n) — один хеш');
  ok(bodyHash('другой текст') !== bodyHash(base), 'нормализация: другой текст — другой хеш');

  // I6: тихие часы через полночь
  const at = (h, m) => new Date(2026, 7, 7, h, m);
  ok(inQuietHours(at(23, 30), '23:00', '09:00') && inQuietHours(at(3, 0), '23:00', '09:00'), 'тихие часы: 23:30 и 03:00 внутри окна 23:00–09:00');
  ok(!inQuietHours(at(12, 0), '23:00', '09:00'), 'тихие часы: полдень вне окна через полночь');
  ok(inQuietHours(at(13, 0), '12:00', '14:00') && !inQuietHours(at(15, 0), '12:00', '14:00'), 'тихие часы: обычное окно без полуночи');

  // C4: разбор — линейка закрывает блок; контрвопрос не ответ; многострочный вариант; статус решает
  const fx = '# Interview #099\n\n> Status: **🟡 awaiting**\n\n### Q1. Вопрос?\n\n- **A) (Рекомендовано)** первая строка\n  вторая строка варианта\n- **B)** короткий\n\n**Answer:**\n\n---\nхвост после линейки\n\n### Q2. Второй?\n\n**Встречный вопрос:** а вам зачем?\n\n**Answer:** А\n';
  const qs = parseQuestions(fx);
  ok(qs.length === 2, 'разбор: два вопроса');
  ok(qs[0].options.length === 2 && qs[0].options[0].text.includes('вторая строка'), 'разбор: вариант собран многострочно (правило 3)');
  ok(!qs[0].answered, 'разбор: пустой Answer не отвечен, линейка закрыла блок (правило 1)');
  ok(qs[1].answered && qs[1].answers.length === 1, 'разбор: контрвопрос не посчитан ответом (правило 2)');
  ok(parseQuestions(fx.replace('🟡 awaiting', '✅ ANSWERS RECEIVED'))[0].answered, 'разбор: закрытый статус закрывает и пустой вопрос (правило 4)');
  const fxc = '# I\n\n> Status: **🟡 awaiting**\n\n### Q1. Вопрос?\n\n**Answer:**\n\n**Комментарий владельца (сегодня):** только мысль, не ответ\n';
  ok(!parseQuestions(fxc)[0].answered, 'разбор: комментарий владельца ниже пустого Answer — НЕ ответ (пилот 008)');

  // bugs/70: закрытость — РАЗМЕТКА, не голое слово; отрицание сильнее галочки; документ без
  // строки статуса ЖИВОЙ по умолчанию. Каждая форма из карточки бага — своей фикстурой, обеими
  // сторонами (краснеет на дефекте · молчит на законном).
  const head70 = (statusLine, extra = '') =>
    `# Interview #090\n\n${statusLine}\n${extra}\n### Q1. Вопрос?\n\n- **A)** раз\n- **B)** два\n\n**Answer:**\n`;
  ok(docStatus(head70('> Status: пока НЕ ОТВЕЧЕНО, ждём владельца')) !== 'closed',
     'статус: отрицание «НЕ ОТВЕЧЕНО» в строке статуса НЕ закрывает документ (bugs/70)');
  ok(docStatus(head70('> Status: неотвечено')) !== 'closed',
     'статус: слитное «неотвечено» НЕ закрывает документ (bugs/70)');
  ok(docStatus(head70('> Status: no ANSWERS RECEIVED yet')) !== 'closed',
     'статус: «no … yet» НЕ закрывает документ (bugs/70)');
  ok(docStatus(head70('> **Status:** 🟡 awaiting the owner\'s answers',
                      '\n> Справка: задача T12 ✅ закрыта вчера, к этому вопросу отношения не имеет.\n')) === 'waiting',
     'статус: посторонняя ✅ в шапке НЕ перебивает явное «🟡 awaiting» (bugs/70)');
  ok(docStatus(head70('> Status: ✅ ОТВЕЧЕНО 2026-08-09 11:00 +03:00')) === 'closed',
     'статус: законное закрытие строкой статуса — по-прежнему closed (молчание на «не трогать»)');
  ok(docStatus('# I\n\n### Q1. Вопрос?\n\n**Answer:**\n') === 'none',
     'статус: документ без строки статуса — ЖИВОЙ по умолчанию (G6, отрицательное распознавание)');
  ok(!parseQuestions(head70('> Status: пока НЕ ОТВЕЧЕНО, ждём владельца'))[0].answered,
     'разбор: при отрицании в статусе пустой Answer остаётся НЕОТВЕЧЕННЫМ (иначе «Ждут ответа: 0» — ложный зелёный)');

  // P8/I24: рендер — экранирование первым, комментарии вне кода вырезаны, в коде сохранены
  const html = renderMd('# Заголовок <b>\n\nтекст <!-- секрет --> дальше\n\n```\nвнутри <!-- контент -->\n```\n');
  ok(html.includes('&lt;b&gt;'), 'рендер: экранирование — первое действие');
  ok(!html.includes('секрет') && html.includes('внутри &lt;!-- контент --&gt;'), 'рендер: комментарий вне кода вырезан, в коде остался (I24)');

  // Метаблок
  const meta = parseMetaBlock('```owner-review\ntitle: Черновик\nkind: outbound draft\nartifacts:\n  - id: msg1\n    target: github · issue 2\n    format: markdown\n    body_file: tools/.review-tmp/msg1.md\n```\nтело');
  ok(meta && meta.kind === 'outbound draft' && meta.artifacts[0].body_file === 'tools/.review-tmp/msg1.md', 'метаблок: kind и артефакт с body_file разобраны');

  // C6: запись БЕЗ единой правки (пометка «прочитано» без комментария — класс «сообщение», I37)
  // не имеет права трогать документ владельца: пустая перезапись срезала бы BOM и штампанула mtime.
  const tdir = mkdtempSync(join(tmpdir(), 'kaif-core-'));
  const before = '﻿# Отчёт\r\n\r\nтело сообщения\r\n';
  writeFileSync(join(tdir, 'notice.md'), before, 'utf8');
  recordDecision(tdir, 'notice.md', { kind: 'notice', comment: '' });
  ok(readFileSync(join(tdir, 'notice.md'), 'utf8') === before,
    'запись без ответов и комментария НЕ трогает документ владельца (побайтно, с BOM и CRLF)');
  recordDecision(tdir, 'notice.md', { kind: 'notice', comment: 'прочитал' });
  ok(readFileSync(join(tdir, 'notice.md'), 'utf8').includes('прочитал'),
    'запись С комментарием документ трогает — датированный блок на месте');

  // bugs/70 (найдено попутно, класс bugs/64): селфтест ПЕЧАТАЛ красный и выходил кодом 0 — а свод
  // `s12` судит его именно по коду возврата, то есть красный селфтест ядра контура проходил бы
  // гейт зелёным. Молчаливый ноль на красном — то же самое, что ложный `[TESTED]`.
  if (bad) { console.error(`СЕЛФТЕСТ КРАСНЫЙ: ${bad} из ${n}`); process.exit(1); }
  console.log(`селфтест ядра зелёный: ${n} проверок`);
  if (bad) process.exit(1);
}

// T9: исполняемся только прямым запуском, не импортом
if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) {
  if (process.argv.includes('--selftest')) selftest();
  else console.log('review-core: библиотека контура; запуск проверок — --selftest');
}
