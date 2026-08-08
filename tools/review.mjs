#!/usr/bin/env node
// review.mjs — страница вычитки, сервер, сигнал, очередь (фаза K5, plans/48 шаги 2–3; роль C1 «review»).
// [TESTED: 2026-08-07 · живой пилот + QA-прогон verify-contour]
//
// ⚠️ T7 (ловушка платформы): внутри шаблонных строк этого файла НЕ ДОЛЖНО БЫТЬ обратных
// кавычек — бэктик в теле страницы роняет модуль синтаксической ошибкой В ДРУГОМ месте.
// JS страницы написан одинарными кавычками и конкатенацией; в текстах — только «ёлочки».
//
// Инварианты контракта, живущие здесь:
//   I1  — md источник, HTML производное; I5 — сигнал ПОСЛЕ поднявшейся страницы;
//   I6  — тихие часы поверх всего (autoloop → тихие часы → настройка), окно через полночь;
//   I7  — очередь — ФАЙЛ СОСТОЯНИЯ (queue.json), живые документы не переносятся;
//   I8  — записанное решение ЗАВЕРШАЕТ контур; очередь не пуста → перезапуск пачки — долг АГЕНТА;
//   I9  — ожидание без таймаута (дефолт 0; --timeout N — только автоматизация, терпимая ТИШИНА);
//   I10/I11/I12/I13 — громкий отказ · спасательный круг · черновик в браузере · пульс /alive;
//   I14 — обратный пульс: маячок /closed (быстрый путь) + тишина-вахта 3 мин, два страйка (T5);
//   I25 — три исхода в логе; I26/I27 — окно --app=, автозакрытие — попытка; I29/I30 — замок/порт;
//   I31 — запускать ОТСЛЕЖИВАЕМОЙ фоновой задачей; I32 — зов не блокирует контур (async-цепочка);
//   I33/I34 — писки 880/660/990 через звуковую карту ПЕРВЫМИ, доставка не доказывается exit-кодом;
//   I35/I36 — голос честно падает на системный; текст в синтезатор ФАЙЛОМ, команда ASCII;
//   I37 — класс «сообщение» (--notice): зовёт как вопрос, но ответа не ждёт; пометка «прочитано» —
//        ШТАТНЫЙ исход (код 0), а не «закрыто без ответа»;
//   I38 — доставлено = ЯВНАЯ пометка человека; без пометки сообщение НЕ доставлено и повторно
//        показывается в каждой следующей пачке (повторная доставка — долг агента);
//   M8  — рендер без показа печатает «RENDER IS NOT YET A SHOW» + готовую команду открытия.

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { join, resolve, basename, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readdirSync } from 'node:fs';
import {
  PROJECT_NAME, DECISIONS_DIR, normalize, bodyHash, provenance, inQuietHours,
  parseMetaBlock, parseQuestions, docStatus, renderMd, recordDecision,
} from './lib/review-core.mjs';

// ── Константы (канонические дефолты DEF; конверт владельца — отступать только его словом) ──
const ALIVE_INTERVAL_MS = 15000;      // DEF4: пульс страница→сервер, конверт 10–60 с
const AUTOCLOSE_DELAY_MS = 2000;      // DEF2: попытка window.close() после записи
const AUTOCLOSE_RESERVE_MS = 2000;    // DEF2: запас на отказ закрытия → честная просьба
const SERVER_DEATH_MS = 2500;         // DEF3: смерть сервера после записи (окно успевает уйти)
const BEACON_RELOAD_GRACE_MS = 3000;  // DEF6/T3: ~3 с после маячка — отличить перезагрузку от закрытия
const SILENCE_THRESHOLD_MS = 180000;  // DEF6: порог тишины 3 мин (фон-вкладки троттлятся, T4)
const SILENCE_TICK_MS = 15000;        // DEF5: вахта тишины тикает каждые 15 с
const SILENCE_STRIKES_TO_DIE = 2;     // DEF6/T5: два страйка против сна машины
const BEEP_DEADLINE_MS = 8000;        // DEF7: жёсткий срок дочернего вызова писка
const VOICE_TIMEOUT_MS = 60000;       // DEF7: таймаут голоса (первый холодный зов ~11 с — писки прикрывают)
// Голос — ВЫНЕСЕННЫЙ вердикт владельца (не переспрашивается): движок Silero v5 ru, голос eugene —
// «звучит по-человечески, а не роботом» (вердикт зафиксирован в NDim tools/review.mjs, движок —
// общий «рот» МАШИНЫ в KLAS, I36: тяжёлый TTS принадлежит машине, проект зовёт готовую команду).
const VOICE_TOOL = process.env.KAIF_VOICE_TOOL || 'F:\\KLAS\\tools\\voice-say.mjs';
const VOICE_NAME = process.env.KAIF_VOICE || 'eugene';
const SAPI_VOICE = process.env.KAIF_SAPI_VOICE || 'Microsoft Irina Desktop'; // фолбэк-голос доноров (NDim/Unliminium)
const WINDOW_SIZE = '1100,900';       // DEF8
const EXIT_DECIDED = 0, EXIT_CLOSED = 2, EXIT_INTERRUPTED = 130; // I25: три исхода
const QUEUE_FILE = 'interviews/decisions/queue.json'; // I7: очередь — файл состояния
const TMP_DIR = 'tools/.review-tmp';
// Класс «сообщение» (I37/I38; идея 21 → задача T10). Строки — именованные константы: их
// стережёт селфтест, и совпадение по случайной подстроке недопустимо (норма стражей).
const KIND_NOTICE = 'notice';                             // машинное имя класса в очереди и записи
const NOTICE_KIND_LABEL = 'сообщение';                    // человеку — на языке владельца
const NOTICE_READ_LABEL = 'ОК, прочитано';                // ЯВНАЯ пометка (слово владельца, №009 Q1)
const NOTICE_GROUP_TITLE = 'Сообщения — ответа не ждут';  // заголовок группы ПОД вопросами (№009 Q2)
const NOTICE_NO_ANSWER_NOTE = 'ответа не ждёт';           // и в фразе зова, и в чипсе страницы

// ── Фраза зова — ЧИСТАЯ функция (её содержание стережёт селфтест, а не наблюдение на слух) ──
// Человек решает «идти сейчас или после дела» ДО чтения страницы, поэтому фраза называет КЛАСС
// и ЧИСЛА. Сообщения зовут так же громко, как вопросы (№009 Q3 = B) — различает не громкость,
// а слова «ответа не ждёт».
export function callPhrase(ctx) {
  if (ctx.notice) // строка класса — ИЗ константы: у чипса страницы и у голоса одна правда
    return 'Криник, ' + NOTICE_KIND_LABEL + ' КАИФ: «' + ctx.title + '» — ' +
      NOTICE_NO_ANSWER_NOTE + ', только прочитать. Страница открыта.';
  if (ctx.batch) {
    const parts = ['документов ' + ctx.nDocs, 'вопросов без ответа ' + ctx.nQuestions];
    if (ctx.nNotices > 0) parts.push('сообщений непрочитанных ' + ctx.nNotices);
    return 'Криник, накопилось в КАИФ: ' + parts.join(', ') + '. Страница открыта.';
  }
  return 'Криник, ' + ctx.kind + ' «' + ctx.title + '» ждёт вычитки' +
    (ctx.nWait ? ': вопросов без ответа ' + ctx.nWait : '') + '. Страница открыта.';
}

// ── Сигнал (C8/I33): писк → консоль → голос; тихие часы поверх всего (I6) ──────────────────
export function signalCall(root, rawPhrase, { quiet = inQuietHours(), log = console.log } = {}) {
  // Звено «баннер» = строка в консоли (без OS-уведомлений) — принято владельцем: интервью №008, Q2.
  log('СИГНАЛ: ' + rawPhrase); // C8: простой текст в консоль — exit-код не доказывает, что человек услышал
  // Разметка в голос не уходит (урок KLAS bugs/14: markdown утекал в речь).
  const phrase = rawPhrase.replace(/[*_`#>[\]()«»]/g, ' ').replace(/\s{2,}/g, ' ').trim();
  if (quiet) { log('Тихие часы (I6) — писк и голос подавлены; страница поднята молча.'); return; }
  // Писки — через звуковую карту (I34), команда ASCII, жёсткий срок DEF7; затем — голос.
  const beep = spawn('powershell.exe',
    ['-NoProfile', '-Command', '[console]::beep(880,160);[console]::beep(660,160);[console]::beep(990,260)'],
    { stdio: 'ignore', timeout: BEEP_DEADLINE_MS });
  beep.on('exit', () => {
    // Голос: сначала Silero (вердикт владельца — eugene; node-argv без шелла, кодировка не
    // искажается), при недоступности «рта» машины — честный фолбэк на системный SAPI (I35).
    const sapiFallback = () => {
      const dir = resolve(root, TMP_DIR);
      mkdirSync(dir, { recursive: true });
      const phraseFile = join(dir, 'call-phrase.txt');
      writeFileSync(phraseFile, '﻿' + phrase, 'utf8'); // UTF-8 с BOM — PS5.1 читает кодировку по BOM
      spawn('powershell.exe', ['-NoProfile', '-Command',
        'Add-Type -AssemblyName System.Speech; ' +
        '$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; ' +
        "try { $s.SelectVoice('" + SAPI_VOICE.replace(/'/g, "''") + "') } catch {}; " +
        "$s.Speak([IO.File]::ReadAllText('" + phraseFile.replace(/\\/g, '\\\\').replace(/'/g, "''") + "'))"],
        { stdio: 'ignore', timeout: VOICE_TIMEOUT_MS }).on('error', () => {});
    };
    try {
      const silero = spawn(process.execPath, [VOICE_TOOL, phrase, '--play', '--voice', VOICE_NAME],
        { stdio: 'ignore', timeout: VOICE_TIMEOUT_MS });
      silero.on('exit', (code) => { if (code !== 0) sapiFallback(); });
      silero.on('error', sapiFallback);
    } catch { sapiFallback(); }
  });
  beep.on('error', () => {}); // сигнал никогда не роняет контур (I32)
}

// ── Очередь (I7): файл состояния; живые документы остаются на местах ───────────────────────
export function readQueue(root) {
  const p = resolve(root, QUEUE_FILE);
  if (!existsSync(p)) return [];
  try { return JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, '')); } catch { return []; }
}
export function writeQueue(root, items) {
  mkdirSync(resolve(root, DECISIONS_DIR), { recursive: true });
  writeFileSync(resolve(root, QUEUE_FILE), JSON.stringify(items, null, 2) + '\n', 'utf8');
}
const relDoc = (root, docPath) => relative(root, resolve(root, docPath)).replace(/\\/g, '/');
export const isNoticeItem = (item) => item.kind === KIND_NOTICE; // позиции без kind — вопросы (легаси)

export function enqueue(root, docPath, { kind = 'question' } = {}) {
  const items = readQueue(root);
  const rel = relDoc(root, docPath);
  const found = items.find((i) => i.doc === rel);
  if (found) {
    // Повторный зов сообщения по тому же документу — НОВАЯ доставка: пометка «прочитано»
    // снимается, иначе агент не смог бы сообщить дважды по одному живому отчёту (I38).
    if (kind === KIND_NOTICE) {
      found.kind = KIND_NOTICE;
      delete found.readAt;
      found.addedAt = provenance().at;
      writeQueue(root, items);
    }
    return items;
  }
  items.push({ doc: rel, kind, addedAt: provenance().at });
  writeQueue(root, items);
  return items;
}

// I38: пометка «прочитано» — ЕДИНСТВЕННОЕ доказательство доставки; живёт в файле состояния
// очереди, а не в теле документа (тело — контент владельца, пометка — состояние контура).
export function markNoticeRead(root, docPath, now = new Date()) {
  const items = readQueue(root);
  const item = items.find((i) => i.doc === relDoc(root, docPath) && isNoticeItem(i));
  if (!item) return false;
  item.readAt = provenance(now).at;
  writeQueue(root, items);
  return true;
}

// Непрочитанные сообщения: копятся в той же очереди (№009 Q2), показываются отдельной группой.
export function pendingNotices(root) {
  return readQueue(root)
    .filter((i) => isNoticeItem(i) && !i.readAt && existsSync(resolve(root, i.doc)))
    .map((i) => ({ doc: i.doc, addedAt: i.addedAt }));
}

// Все документы с неотвеченными ВОПРОСАМИ: скан interviews/ (живые документы на местах) + очередь.
// Сообщения сюда не попадают ни одним путём — у них своя группа (иначе отчёт-сообщение,
// положенный в interviews/, показался бы дважды и в чужом классе).
export function pendingDocs(root) {
  const noticeDocs = new Set(readQueue(root).filter(isNoticeItem).map((i) => i.doc));
  const seen = new Set();
  const out = [];
  const push = (rel) => {
    if (seen.has(rel) || noticeDocs.has(rel) || !existsSync(resolve(root, rel))) return;
    seen.add(rel);
    const md = readFileSync(resolve(root, rel), 'utf8');
    const qs = parseQuestions(md);
    const unanswered = qs.filter((q) => !q.answered);
    // `questions` — полное число вопросов документа: по нему отличается «владелец ещё не ответил»
    // от «ответил, а статус не обновлён» (долг АГЕНТА, его ловит questions-guard). Витрине
    // владельца нужно первое, стражу — оба.
    if (unanswered.length > 0 || docStatus(md) === 'waiting')
      out.push({ doc: rel, unanswered: unanswered.length, questions: qs.length });
  };
  const ivDir = resolve(root, 'interviews');
  if (existsSync(ivDir))
    for (const f of readdirSync(ivDir).filter((x) => /^interview_\d+.*\.md$/.test(x)).sort())
      push('interviews/' + f);
  for (const item of readQueue(root)) if (!isNoticeItem(item)) push(item.doc);
  return out;
}

// ── Сборка страниц (I1: только из документов) ──────────────────────────────────────────────
export function buildPage(root, docPath) {
  const md = readFileSync(resolve(root, docPath), 'utf8');
  const meta = parseMetaBlock(md);
  const rel = relative(root, resolve(root, docPath)).replace(/\\/g, '/');
  const kind = (meta && meta.kind) ||
    (rel.startsWith('interviews/') ? 'интервью' : rel.startsWith('homeworks/') ? 'домашка' : 'документ');
  const title = (meta && meta.title) || (normalize(md).match(/^#\s+(.+)$/m) || [])[1] || basename(docPath);
  const parsed = parseQuestions(md);
  // Карточка несёт ВСЁ тело вопроса (расширенная мета: происхождение, что питает/блокирует —
  // слово владельца, пилот 008), кроме вариантов и полей ответа — те интерактивны.
  const proseOf = (q) => {
    const keep = [];
    let inOpt = false;
    for (let j = 0; j < q.body.length; j++) {
      const line = q.body[j];
      // Строки таблицы вариантов (bugs/51) уже стали радиокнопками — из прозы их убирает ТОТ ЖЕ
      // разбор, что их и нашёл: два независимых детектора разошлись бы, и таблица показалась бы дважды.
      if (q.optionTableLines && q.optionTableLines.has(j)) { inOpt = false; continue; }
      if (/^\s*-\s+\*\*[A-ZА-Я]\)/u.test(line)) { inOpt = true; continue; }
      if (inOpt && /^\s{2,}\S/.test(line)) continue;
      inOpt = false;
      if (/^\s*\*{0,2}(?:Answer|Ответ(?:\s+владельца)?)\s*(?:\([^)]*\))?\s*:/iu.test(line)) continue;
      if (/^\s*\*{0,2}Адресат\s+ответа\s*:/iu.test(line)) continue; // уходит в мета-строку
      keep.push(line);
    }
    return renderMd(keep.join('\n'));
  };
  const questions = parsed.map((q) => ({
    doc: rel, id: q.id, title: q.title, answered: q.answered, target: q.target,
    bodyHtml: proseOf(q),
    recommended: q.recommended,
    options: q.options.map((o) => ({ letter: o.letter, html: renderMd(o.text), recommended: o.letter === q.recommended })),
    // I24 в узле показа (класс NDim bug 112 — «просочились некрасивые комментарии», пилот 008):
    // провенанс-маркер живёт в md, но НИКОГДА не показывается человеку.
    existing: q.answers.filter((a) => a.text)
      .map((a) => a.text.replace(/<!--[\s\S]*?-->/g, '').trim()).filter(Boolean),
  }));
  const docHash = bodyHash(md);
  // Полевые правки пилота 008 (слово владельца, 2026-08-07):
  // 1) блоки вопросов ВЫРЕЗАЮТСЯ из текстового рендера — интерактивные карточки ниже
  //    остаются единственной формой вопросов (дубль текстом сбивал с толку);
  // 2) шапка несёт наглядную сводку «отвечено / ждут вас».
  const normLines = normalize(md).split('\n');
  const drop = new Set();
  for (const q of parsed)
    for (let i = q.line - 1; i <= q.line - 1 + q.body.length && i < normLines.length; i++) drop.add(i);
  normLines.forEach((l, i) => { if (/^#{1,3}\s+(QUESTIONS|Вопросы)\b/iu.test(l)) drop.add(i); });
  const body = renderMd(normLines.filter((_, i) => !drop.has(i)).join('\n'));
  const nAns = questions.filter((q) => q.answered).length;
  const nWait = questions.length - nAns;
  const summary = questions.length
    ? ' <span class="tag done">отвечено ' + nAns + '</span>' +
      (nWait ? ' <span class="tag you">ждут вас ' + nWait + '</span>' : ' <span class="tag done">все отвечены</span>')
    : '';
  const html = pageShell({
    title, kind,
    heading: '<span class="kind">' + kind + '</span><span>' + esc(title) + '</span>' + summary,
    main: '<div class="doc">' + body + '</div><h2>Вопросы</h2>' +
      (questions.map((q) => qCard(q)).join('\n') ||
        '<p>Вопросов в документе нет — можно оставить общий комментарий.</p>') +
      docCommentBlock(rel),
    questions,
  });
  return { html, questions, docHash, kind, title, rel };
}

// Заголовок документа: метаблок → первый H1 → имя файла (одна лестница на все формы страниц).
function docTitle(md, docPath, meta = parseMetaBlock(md)) {
  return (meta && meta.title) || (normalize(md).match(/^#\s+(.+)$/m) || [])[1] || basename(docPath);
}

// I37: страница-СООБЩЕНИЕ — тело документа целиком, поле комментария и ЯВНАЯ пометка «прочитано».
// Вопросов здесь нет по построению: класс существует ровно для того, чтобы ничего не спрашивать.
export function buildNoticePage(root, docPath) {
  const md = readFileSync(resolve(root, docPath), 'utf8');
  const rel = relDoc(root, docPath);
  const title = docTitle(md, docPath);
  const html = pageShell({
    title, kind: NOTICE_KIND_LABEL,
    heading: '<span class="kind">' + NOTICE_KIND_LABEL + '</span><span>' + esc(title) + '</span>' +
      ' <span class="tag notice">' + NOTICE_NO_ANSWER_NOTE + '</span>',
    main: '<div class="doc">' + renderMd(md) + '</div>' + noticeCommentBlock(rel),
    questions: [], notices: [rel], noticeDoc: rel,
  });
  return { html, questions: [], docHash: bodyHash(md), kind: NOTICE_KIND_LABEL, title, rel };
}

// Пачечная страница «Накопилось N» (I7): карточка на документ, ссылка = имя документа;
// запись по ОДНОМУ документу закрывает контур (I8) — остаток пачки перезапускает агент.
// Сообщения (I37) идут ОТДЕЛЬНОЙ ГРУППОЙ СТРОГО ПОД вопросами: вопросы блокируют работу,
// сообщения нет — порядок на странице и есть это различие, показанное человеку (№009 Q2).
export function buildQueuePage(root, docs, notices = pendingNotices(root)) {
  const groups = docs.map(({ doc }) => {
    const page = buildPage(root, doc);
    const pending = page.questions.filter((q) => !q.answered);
    return { doc, title: page.title, kind: page.kind, pending };
  });
  const total = groups.reduce((s, g) => s + g.pending.length, 0);
  const questionsMain = groups.map((g) =>
    '<section class="group"><h2>' + esc(g.title) + ' <small class="kind">' + esc(g.doc) + '</small></h2>' +
    (g.pending.map((q) => qCard(q)).join('\n') || '<p>Неотвеченных вопросов нет — документ ждёт статусом.</p>') +
    docCommentBlock(g.doc) +
    '<p><button type="button" class="savedoc" data-doc="' + esc(g.doc) + '">Записать решения по этому документу</button></p>' +
    '</section>').join('\n<hr>\n');
  const noticesMain = notices.length
    ? '\n<hr>\n<h2 class="noticehead">' + NOTICE_GROUP_TITLE + ' (' + notices.length + ')</h2>\n' +
      notices.map(({ doc }) => {
        const md = readFileSync(resolve(root, doc), 'utf8');
        return '<section class="group notice"><h3>' + esc(docTitle(md, doc)) +
          ' <small class="kind">' + esc(doc) + '</small></h3>' +
          '<div class="doc">' + renderMd(md) + '</div>' + noticeCommentBlock(doc) +
          '<p><button type="button" class="savedoc" data-doc="' + esc(doc) + '">' +
          NOTICE_READ_LABEL + '</button></p></section>';
      }).join('\n<hr>\n')
    : '';
  const questions = groups.flatMap((g) => g.pending);
  const counts = docs.length + notices.length + ' документ(ов) · ' + total + ' неотвеченных вопрос(ов)' +
    (notices.length ? ' · ' + notices.length + ' непрочитанных сообщени(й)' : '');
  const html = pageShell({
    title: 'Накопилось: ' + counts,
    kind: 'очередь',
    heading: '<span class="kind">очередь</span><span>Накопилось: ' + counts + '</span>',
    main: questionsMain + noticesMain, questions, batch: true,
    notices: notices.map((n) => n.doc),
  });
  return { html, questions, total, notices: notices.length };
}

// ── ВХОДНАЯ СТРАНИЦА ОЧЕРЕДИ: только карточки (bugs/52, форма задана владельцем) ────────────
// Постановка владельца дословно (чат 2026-08-08 ≈07:08 +03:00): «Должна быть входная страница -
// которая показывает документы только в виде карточек - из неё я кликаю по карточке документа и
// открываю обычное интервью интерактивное в отдельном браузере».
// Почему прежняя форма (все документы одной простынёй) была неверна не только на вкус: запись по
// одному документу закрывала ОКНО ЦЕЛИКОМ, унося с экрана ещё не отвеченные документы, а очистка
// черновиков шла по ключу всей пачки — набранное по соседним документам стиралось. Карточки
// разводят документы по отдельным окнам, и работа человека перестаёт зависеть от чужого исхода.
export function buildIndexPage(root, docs, notices = []) {
  const card = (rel, kindLabel, pendingLabel, cls) => {
    const md = readFileSync(resolve(root, rel), 'utf8');
    const meta = parseMetaBlock(md);
    return '<a class="card ' + cls + '" href="/d/' + encodeURIComponent(rel) + '" target="_blank" rel="noopener">' +
      '<span class="ckind">' + esc(kindLabel) + '</span>' +
      '<span class="ctitle">' + esc((meta && meta.title) || docTitle(md, rel)) + '</span>' +
      '<span class="cmeta">' + esc(rel) + '</span>' +
      '<span class="cpend">' + esc(pendingLabel) + '</span>' +
      '<span class="cgo">открыть →</span></a>';
  };
  const qCards = docs.map((d) => card(d.doc, 'интервью', d.unanswered > 0
    ? d.unanswered + ' вопрос(ов) без ответа' : 'ждёт статусом', 'wait'));
  const nCards = notices.map((n) => card(n.doc, NOTICE_KIND_LABEL, 'не прочитано', 'notice'));
  const total = docs.reduce((s, d) => s + d.unanswered, 0);
  const counts = (docs.length + notices.length) + ' документ(ов) · ' + total + ' неотвеченных вопрос(ов)' +
    (notices.length ? ' · ' + notices.length + ' непрочитанных сообщени(й)' : '');
  const main = '<div class="cards">' + qCards.join('\n') +
    (nCards.length ? '<h2 class="noticehead">' + NOTICE_GROUP_TITLE + ' (' + nCards.length + ')</h2>' + nCards.join('\n') : '') +
    '</div>' +
    (qCards.length + nCards.length === 0 ? '<p>Очередь пуста — отвечать нечего.</p>' : '');
  const html = pageShell({
    title: 'Накопилось: ' + counts,
    kind: 'очередь',
    heading: '<span class="kind">очередь</span><span>Накопилось: ' + counts + '</span>',
    main, questions: [], index: true,
  });
  return { html, questions: [], total, notices: notices.length };
}

const esc = (s) => String(s).replace(/</g, '&lt;');
const docCommentBlock = (rel) =>
  '<h3>Комментарий по документу целиком</h3>' + // P7: легитимный исход вычитки сам по себе
  '<p><textarea data-draft data-doc="' + esc(rel) + '" name="doccomment:' + esc(rel) + '" rows="3" ' +
  'placeholder="Можно без ответов — просто сказать"></textarea></p>';

// I37: у сообщения поле комментария НЕОБЯЗАТЕЛЬНО — заполненное уходит в документ вместе с
// пометкой, пустое законно (нажатая кнопка «ОК, прочитано» и есть пометка, №009 Q1).
const noticeCommentBlock = (rel) =>
  '<h3>Комментарий (по желанию)</h3>' +
  '<p><textarea data-draft data-doc="' + esc(rel) + '" name="doccomment:' + esc(rel) + '" rows="3" ' +
  'placeholder="Можно ничего не писать — достаточно пометки «' + NOTICE_READ_LABEL + '»"></textarea></p>';

function qCard(q) {
  // Язык интерфейса = язык владельца (слово владельца, пилот 008): интервью на русском —
  // чипсы состояний на русском; английские метки поверх русского текста — не user-friendly.
  const tag = q.answered ? '<span class="tag done">отвечено</span>'
    : '<span class="tag wait">без ответа</span> <span class="tag you">ждёт вас</span>';
  // Закрытые вопросы НЕ сворачиваются: варианты остаются полностью, как были, карточка
  // уводится в серый (слово владельца, пилот 008); выбранный вариант помечен, поля выключены.
  const chosenLetter = q.answered && q.existing[0]
    ? (q.existing[0].match(/^([A-ZА-Я])\)/u) || [])[1] || null : null;
  // Рекомендация видна НА варианте: человек не переводит букву из абзаца в кнопку глазами.
  const opts = q.options.map((o) =>
    '<label class="opt' + (o.recommended ? ' rec' : '') + '"><input type="radio" ' +
    (q.answered ? 'disabled' + (o.letter === chosenLetter ? ' checked' : '')
      : 'data-draft') +
    ' name="choice:' + esc(q.doc) + ':' + q.id + '" value="' + o.letter + '">' +
    '<div>' + (o.recommended ? '<span class="tag rec">рекомендую</span> ' : '') + o.html + '</div></label>').join('');
  const existing = q.existing.map((t) => '<p><strong>Ответ:</strong> ' + esc(t) + '</p>').join('');
  // У отвеченного вопроса остаётся поле комментария (слово владельца, пилот 009): дописать
  // мысль по уже решённому можно всегда; сам ответ неприкосновенен — комментарий ляжет
  // датированным блоком в конец вопроса.
  const inputs = q.answered
    ? '<p class="addcomment"><textarea data-draft name="comment:' + esc(q.doc) + ':' + q.id + '" rows="2" placeholder="Дополнить комментарием — ваш ответ останется как есть"></textarea></p>'
    : '<p><input type="text" data-draft name="text:' + esc(q.doc) + ':' + q.id + '" placeholder="Свой вариант или текст ответа"></p>' +
      '<p><textarea data-draft name="comment:' + esc(q.doc) + ':' + q.id + '" rows="2" placeholder="Комментарий"></textarea></p>';
  const meta = q.target
    ? '<div class="qmeta">Адресат ответа: ' + esc(q.target).replace(/`/g, '') + '</div>' : '';
  return '<section class="qcard' + (q.answered ? ' done' : '') + '">' +
    '<div><strong>' + q.id + '.</strong> ' + esc(q.title) + ' ' + tag + '</div>' +
    (q.bodyHtml ? '<div class="qbody">' + q.bodyHtml + '</div>' : '') + meta +
    existing + opts + inputs + '</section>';
}

function pageShell({ title, kind, heading, main, questions, batch = false, notices = [], noticeDoc = null, index = false }) {
  const qjson = JSON.stringify(questions).replace(/</g, '\\u003c');
  const cfg = JSON.stringify({
    batch, index, aliveMs: ALIVE_INTERVAL_MS, closeMs: AUTOCLOSE_DELAY_MS, reserveMs: AUTOCLOSE_RESERVE_MS,
    notices, // I37: документы этого класса шлют пометку «прочитано», а не ответы
    // Ключ черновиков — ПО ДОКУМЕНТУ, никогда по пачке (bugs/52): общий ключ означал, что запись
    // одного документа стирает набранное по соседним.
    draftKey: 'owner-review:' + ((questions[0] && questions[0].doc) || noticeDoc || (index ? 'index' : title)),
  }).replace(/</g, '\\u003c');
  // P5: обе темы через prefers-color-scheme, цвета — переменные; контраст заложен в парах.
  const css = `
  :root { --bg:#f7f7f5; --card:#ffffff; --ink:#1d1d1f; --muted:#6b6b70; --line:#d9d9de;
    --wait:#d97706; --done:#16a34a; --you:#2563eb; --danger:#dc2626; --accent:#2563eb;
    --tagink:#0b1020; --tagwait:#fbbf24; --tagdone:#4ade80; --tagyou:#93c5fd; --tagrec:#86efac;
    --recbg:rgba(22,163,74,.10); }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#17171a; --card:#212126; --ink:#ececf0; --muted:#a0a0a8; --line:#3a3a42;
      --wait:#f59e0b; --done:#22c55e; --you:#60a5fa; --danger:#f87171; --accent:#60a5fa;
      --tagink:#0b1020; --tagwait:#f59e0b; --tagdone:#22c55e; --tagyou:#60a5fa; } }
  * { box-sizing:border-box } body { margin:0; background:var(--bg); color:var(--ink);
    font:15px/1.55 system-ui, "Segoe UI", sans-serif; }
  header { position:sticky; top:0; background:var(--card); border-bottom:1px solid var(--line);
    padding:10px 20px; display:flex; gap:12px; align-items:baseline; z-index:5; flex-wrap:wrap }
  header .project { font-weight:700; color:var(--accent) } .kind { color:var(--muted) }
  main { max-width:900px; margin:0 auto; padding:16px 20px 120px }
  .doc { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:8px 22px; overflow-x:auto }
  .doc pre { background:var(--bg); border:1px solid var(--line); border-radius:8px; padding:10px; overflow-x:auto }
  .doc code { background:var(--bg); padding:1px 4px; border-radius:4px }
  .doc table { border-collapse:collapse; margin:8px 0 } .doc th,.doc td { border:1px solid var(--line); padding:4px 8px }
  .doc blockquote { border-left:3px solid var(--line); margin:8px 0; padding:2px 12px; color:var(--muted) }
  .qcard { background:var(--card); border:1px solid var(--line); border-left:5px solid var(--wait);
    border-radius:10px; padding:12px 16px; margin:14px 0 } /* P1: полоса состояния 5px */
  /* Закрытый вопрос виден целиком, но в сером; затемняются ДЕТИ, а не карточка — иначе поле
     доп-комментария наследует тусклость (баг пилота 009: «текст серый — нужно яркий белый»). */
  .qcard.done { border-left-color:var(--done) }
  .qcard.done > * { opacity:.72 }
  .qcard.done .addcomment { opacity:1 }
  /* Чипы: ТЁМНЫЕ чернила на ярком фоне. Белым по светло-зелёному/голубому цифры не читаются —
     замерено, а не прикинуто: белый на фоне тёмной темы давал 2.15–2.54 при норме WCAG 4.5 для
     мелкого текста; тёмные чернила дают 7.4–11.3 на всех шести фонах обеих тем. Фоны чипов —
     СВОИ токены, а не семантические --wait/--done/--you: те же цвета нужны насыщенными для
     полос и рамок, а под мелкий текст должны быть светлее. Оплачено словами владельца:
     «плохой контраст, я не вижу цифр» (2026-08-08 07:38). */
  .tag { font-size:12px; padding:2px 8px; border-radius:99px; color:var(--tagink); font-weight:600 }
  .tag.wait { background:var(--tagwait) } .tag.done { background:var(--tagdone) } .tag.you { background:var(--tagyou) }
  .tag.rec { background:var(--tagrec) }
  .opt.rec { background:var(--recbg); border-radius:10px; padding:6px 10px; margin-left:-10px }
  /* I37: сообщение — свой чип и своя группа; полоса слева нейтральная (не «ждёт вас») */
  .tag.notice { background:var(--muted) }
  .noticehead { margin-top:28px; padding-top:10px; border-top:2px solid var(--line) }
  .group.notice { border-left:5px solid var(--muted); border-radius:10px; padding-left:14px }
  /* Полевые правки пилота 008: радио большие и выразительные; текст варианта на одной линии
     с кнопкой (маргины абзацев внутри флекса роняли текст ниже кнопки — «вёрстка разъехалась») */
  /* Входная страница очереди (bugs/52): карточка — крупная кликабельная цель, а не ссылка-строка;
     статус ожидания виден без открытия документа. */
  .lead { color:var(--muted); margin:0 0 18px }
  .cards { display:grid; gap:14px }
  .card { display:grid; gap:6px; padding:18px 20px; background:var(--card); border:1px solid var(--line);
    border-left:6px solid var(--wait); border-radius:12px; text-decoration:none; color:var(--ink) }
  .card:hover { border-color:var(--accent); border-left-color:var(--accent) }
  .card.notice { border-left-color:var(--you) }
  .ckind { font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted) }
  .ctitle { font-size:19px; font-weight:600; line-height:1.35 }
  .cmeta { font-size:13px; color:var(--muted); font-family:ui-monospace,Consolas,monospace }
  .cpend { font-size:14px; color:var(--wait); font-weight:600 }
  .card.notice .cpend { color:var(--you) }
  .cgo { font-size:14px; color:var(--accent) }
  .opt { display:flex; gap:12px; align-items:flex-start; margin:10px 0; cursor:pointer }
  .opt input[type=radio] { width:22px; height:22px; flex:0 0 auto; margin-top:0;
    accent-color:var(--accent); cursor:pointer }
  .opt div p { margin:2px 0 }
  .qbody p { margin:6px 0 }
  .qmeta { font-size:13px; color:var(--muted); margin:6px 0 }
  textarea, input[type=text] { width:100%; background:var(--bg); color:var(--ink);
    border:1px solid var(--line); border-radius:8px; padding:8px; font:inherit }
  .bar { position:fixed; bottom:0; left:0; right:0; background:var(--card); border-top:1px solid var(--line);
    padding:10px 20px; display:flex; gap:14px; align-items:center; justify-content:center;
    text-align:center } /* центрировано — слово владельца, пилот 008 (2026-08-07) */
  .bar #status { flex:0 1 auto }
  button { background:var(--accent); color:#fff; border:0; border-radius:8px; padding:9px 18px;
    font:inherit; cursor:pointer } button:disabled { opacity:.5; cursor:default }
  button.ghost { background:transparent; color:var(--accent); border:1px solid var(--accent) }
  #status { flex:0 1 auto } .err { color:var(--danger); font-weight:600 } .okmsg { color:var(--done); font-weight:600 }
  #rescue { display:none; border:2px solid var(--danger); border-radius:10px; padding:12px; margin:14px 0 }
  #banner { display:none; position:sticky; top:46px; background:var(--danger); color:#fff;
    padding:8px 20px; font-weight:600; z-index:6 }`;

  // JS страницы — одинарные кавычки и конкатенация, НИ ОДНОГО бэктика (T7).
  const js = [
    "var CFG=" + cfg + ";var QS=" + qjson + ";",
    "var $=function(s){return document.querySelector(s)};",
    "function status(msg,cls){var s=$('#status');s.textContent=msg;s.className=cls||''}",
    // I12: черновик в браузере — каждое поле в localStorage, восстановление с заметкой
    "var DK=CFG.draftKey+':';",
    "function saveDraft(el){try{localStorage.setItem(DK+el.name,el.type==='radio'?(el.checked?el.value:''):el.value)}catch(e){}}",
    "function restoreDraft(){var n=0;var els=document.querySelectorAll('[data-draft]');",
    " for(var i=0;i<els.length;i++){var el=els[i];var v=null;try{v=localStorage.getItem(DK+el.name)}catch(e){}",
    "  if(v===null||v==='')continue;",
    "  if(el.type==='radio'){if(el.value===v&&!el.checked){el.checked=true;n++}}else if(!el.value){el.value=v;n++}}",
    " if(n>0)status('Подхвачен черновик: '+n+' полей(я) восстановлено из браузера','okmsg')}",
    // P3: радио, очищаемое вторым кликом. ПОЛЕВОЙ БАГ пилота 008 («тысячу раз чинили»):
    // нативная активация label-обёртки ДУБЛИРУЕТ click — второй клик снимал и тут же ставил
    // обратно. Лечение по классу: активацию берём на себя на pointerdown с preventDefault —
    // нативной активации (и дубля) не существует вовсе. Клик по самому полю переключает
    // (второй СНИМАЕТ); клик по тексту выбирает, но не снимает (label-target skipped).
    "document.addEventListener('pointerdown',function(e){var lab=e.target&&e.target.closest?e.target.closest('label.opt'):null;",
    " if(!lab)return;var inp=lab.querySelector('input[type=radio]');if(!inp||inp.disabled)return;",
    " e.preventDefault();var was=inp.checked;",
    " if(e.target===inp){inp.checked=!was}else if(!was){inp.checked=true}",
    " saveDraft(inp)});",
    "document.addEventListener('input',function(e){if(e.target&&e.target.hasAttribute&&e.target.hasAttribute('data-draft'))saveDraft(e.target)});",
    // Сбор ответов по документу (пачка шлёт свой doc; одиночная страница — единственный)
    "function fieldVal(name){var el=document.getElementsByName(name)[0];return el?el.value:''}",
    "function collect(doc){var answers={};for(var i=0;i<QS.length;i++){var q=QS[i];",
    " if(q.doc!==doc)continue;",
    " var com=fieldVal('comment:'+doc+':'+q.id);",
    // отвеченный вопрос отдаёт ТОЛЬКО дополнительный комментарий — ответ неприкосновенен
    " if(q.answered){if(com.trim())answers[q.id]={choice:'',text:'',comment:com.trim()};continue}",
    " var chosen='';var rs=document.getElementsByName('choice:'+doc+':'+q.id);",
    " for(var j=0;j<rs.length;j++)if(rs[j].checked)chosen=rs[j].value;",
    " var own=fieldVal('text:'+doc+':'+q.id);",
    " if(chosen||own.trim()||com.trim())answers[q.id]={choice:chosen,text:own.trim(),comment:com.trim()}}",
    " return {doc:doc,answers:answers,comment:fieldVal('doccomment:'+doc)}}",
    // I10/I11: громкий отказ + спасательный круг; кнопка снова активна, текст возвращается человеку
    "function rescue(payload,msg){status('ОШИБКА ЗАПИСИ: '+msg,'err');var r=$('#rescue');r.style.display='block';",
    " $('#rescuetext').value=JSON.stringify(payload,null,2);enableButtons(true)}",
    "function enableButtons(on){var bs=document.querySelectorAll('button');",
    " for(var i=0;i<bs.length;i++)bs[i].disabled=!on}",
    "var saved=false,closeTimer=null,lastPayload=null;",
    // I37: сообщение помечается прочитанным и БЕЗ единого заполненного поля — пустая пометка
    // здесь законна, поэтому проверка «нечего записывать» её не касается.
    "function isNotice(doc){var n=CFG.notices||[];for(var i=0;i<n.length;i++)if(n[i]===doc)return true;return false}",
    "function doSave(doc){var p=collect(doc);if(isNotice(doc))p.read=true;lastPayload=p;",
    " if(!p.read&&Object.keys(p.answers).length===0&&!(p.comment||'').trim()){status('Нечего записывать: ни ответа, ни комментария','err');return}",
    " enableButtons(false);status('Записываю…');",
    " fetch('/decide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)})",
    " .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})})",
    " .then(function(res){if(!res.ok||!res.j.ok){rescue(p,res.j.reason||'сервер отказал');return}",
    "  saved=true;status('Записано: '+res.j.written+'. Окно закроется само…','okmsg');",
    "  try{var ks=[];for(var i=0;i<localStorage.length;i++)ks.push(localStorage.key(i));",
    "   for(var k=0;k<ks.length;k++)if(ks[k].indexOf(DK)===0)localStorage.removeItem(ks[k])}catch(e){}",
    // I27/DEF2: автозакрытие — ПОПЫТКА; отказ → честное «закройте меня»; отменяется pagehide
    "  setTimeout(function(){window.close();closeTimer=setTimeout(function(){",
    "   status('Браузер не дал закрыть окно — закройте его, пожалуйста, сами','err')},CFG.reserveMs)},CFG.closeMs)})",
    " .catch(function(e){rescue(p,String(e))})}",
    "document.addEventListener('click',function(e){var t=e.target;",
    " if(t&&t.classList&&t.classList.contains('savedoc'))doSave(t.getAttribute('data-doc'));",
    " if(t&&t.id==='retry'&&lastPayload)doSave(lastPayload.doc)});",
    "var single=$('#save');if(single)single.addEventListener('click',function(){doSave(single.getAttribute('data-doc'))});",
    "var cp=$('#copybtn');if(cp)cp.addEventListener('click',function(){var t=$('#rescuetext');t.select();",
    " try{document.execCommand('copy');status('Скопировано в буфер','okmsg')}catch(e){status('Выделите и скопируйте вручную','err')}});",
    // I13/DEF4: пульс страница→сервер — о смерти сервера человек узнаёт СРАЗУ и вслух
    "function pulse(){fetch('/alive').then(function(r){if(!r.ok)throw 0;$('#banner').style.display='none'})",
    " .catch(function(){var b=$('#banner');b.style.display='block';",
    "  b.textContent='СЕРВЕР КОНТУРА НЕДОСТУПЕН — ответ НЕ уйдёт. Черновик сохранён в браузере; скопируйте текст (кнопка ниже) или перезапустите контур.';",
    "  var r=$('#rescue');r.style.display='block';",
    "  if(lastPayload)$('#rescuetext').value=JSON.stringify(lastPayload,null,2);enableButtons(true)})}",
    "setInterval(pulse,CFG.aliveMs);pulse();",
    // I14/DEF6: закрытие страницы — СОБЫТИЕ для сервера (быстрый путь — маячок)
    // Маячок называет РОЛЬ окна (bugs/52): контур завершает закрытие ВХОДНОЙ страницы, а закрытое
    // окно документа — обычное событие внутри сессии, а не её конец.
    "window.addEventListener('pagehide',function(){if(closeTimer)clearTimeout(closeTimer);",
    " try{navigator.sendBeacon('/closed',(CFG.index?'index':'doc')+':'+(saved?'saved':'unsaved'))}catch(e){}});",
    // Входная страница перечитывается при возврате фокуса — отвеченный документ уходит с неё сам,
    // и человеку не нужно догадываться, обновилась ли очередь.
    "if(CFG.index)window.addEventListener('focus',function(){location.reload()});",
    "restoreDraft();",
  ].join('\n');

  const singleDoc = !batch && questions[0] ? questions[0].doc : null;
  // Одиночное сообщение: в липкой полосе — та самая ЯВНАЯ пометка (длинный отчёт прокручивают,
  // и кнопка обязана оставаться на виду); в пачке кнопка своя у каждого сообщения.
  // Полоса говорит человеку о ЕГО действии и его последствиях — и молчит про устройство контура.
  // Пояснения агента о собственной машинерии (пути файлов, коды инвариантов, «как это устроено»)
  // на рабочем экране владельца запрещены: это не его забота и не его словарь. Слова, оплатившие
  // правило: «нахуя мне в моём рабочем инструменте твои вот такие высеры?» (2026-08-08 07:35).
  // Полоса витрины пуста, но присутствует в DOM: через неё говорят ошибки записи.
  const saveBar = index
    ? '<div class="bar" style="display:none"><div id="status"></div></div>'
    : noticeDoc
      ? '<div class="bar"><button id="save" type="button" data-doc="' + esc(noticeDoc) + '">' + NOTICE_READ_LABEL + '</button>' +
        '<div id="status">Без пометки сообщение придёт снова.</div></div>'
      : '<div class="bar"><button id="save" type="button" data-doc="' + esc(singleDoc || '') + '">Записать решение</button>' +
        '<div id="status"></div></div>';

  return '<!doctype html>\n<html lang="ru"><head><meta charset="utf-8">' +
    '<title>' + PROJECT_NAME + ' · ' + esc(title) + '</title>' +
    '<link rel="icon" href="data:,"><style>' + css + '</style></head><body>' +
    '<header><span class="project">' + PROJECT_NAME + '</span>' + heading + '</header>' + // P9
    '<div id="banner"></div><main>' + main +
    '<div id="rescue"><p class="err">Запись не прошла — ваш текст ниже, он не потерян.</p>' +
    '<textarea id="rescuetext" rows="8"></textarea>' +
    '<p><button class="ghost" id="copybtn" type="button">Скопировать</button> ' +
    '<button class="ghost" id="retry" type="button">Повторить запись</button></p></div>' +
    '</main>' + saveBar + '<script>' + js + '</script></body></html>';
}

// ── Окно (DEF8: Edge → Chrome → вкладка с честной просьбой) ────────────────────────────────
function openWindow(url) {
  const tryApp = (exe) => spawnSync('cmd.exe',
    ['/c', 'start', '', exe, '--app=' + url, '--window-size=' + WINDOW_SIZE],
    { stdio: 'ignore', timeout: BEEP_DEADLINE_MS }).status === 0;
  if (tryApp('msedge')) return 'edge --app';
  if (tryApp('chrome')) return 'chrome --app';
  spawnSync('cmd.exe', ['/c', 'start', '', url], { stdio: 'ignore', timeout: BEEP_DEADLINE_MS });
  console.log('Окно-приложение поднять не удалось — открыл обычной вкладкой; закройте её, пожалуйста, сами (DEF8).');
  return 'tab';
}

// ── Замок «один документ — одно окно» (I29) ────────────────────────────────────────────────
const lockPath = (root, key) => resolve(root, DECISIONS_DIR, key.replace(/\.md$/u, '') + '.lock');
function checkLock(root, key) {
  const p = lockPath(root, key);
  if (!existsSync(p)) return null;
  try {
    const lock = JSON.parse(readFileSync(p, 'utf8'));
    process.kill(lock.pid, 0); // жив ли процесс (не убивает)
    return lock;
  } catch { rmSync(p, { force: true }); return null; } // протухший замок — снимаем
}

// ── Сервер: поднять → показать → позвать → ждать → записать → умереть (I8) ─────────────────
export function serveContour(root, { docPath = null, batch = false, notice = false }, opts = {}) {
  const { open = true, signal = true, timeoutMs = 0, log = console.log } = opts; // I9: дефолт 0 — без таймаута
  return new Promise((resolveP) => {
    // В режиме очереди корневая страница — ВХОДНАЯ (карточки); тела документов живут на /d/<rel>.
    // Витрина владельца показывает то, что ждёт ЕГО: документ, где он уже ответил на все вопросы,
    // уходит с неё сразу — иначе он приглашён отвечать дважды. Документ без вопросов, но со
    // статусом «ждёт», остаётся: его ожидание адресовано именно человеку.
    const forOwner = () => pendingDocs(root).filter((d) => !(d.questions > 0 && d.unanswered === 0));
    const build = () => batch ? buildIndexPage(root, forOwner(), pendingNotices(root))
      : notice ? buildNoticePage(root, docPath) : buildPage(root, docPath);
    // Страница одного документа внутри режима очереди: класс определяет файл состояния, а не URL.
    const buildDoc = (rel) => (readQueue(root).some((i) => i.doc === rel && isNoticeItem(i))
      ? buildNoticePage(root, rel) : buildPage(root, rel));
    const first = build();
    const lockKey = batch ? '_queue' : basename(docPath);
    const held = checkLock(root, lockKey);
    if (held) {
      log('Уже открыто этим контуром: ' + held.url + ' (pid ' + held.pid + ') — второе окно не поднимаю (I29).');
      resolveP({ outcome: 'already-open', url: held.url, exitCode: EXIT_DECIDED });
      return;
    }
    let outcome = null, beaconTimer = null, lastAlive = Date.now(), strikes = 0;
    const startedAt = Date.now();
    // I38: у сообщения «закрыто без пометки» — это НЕ отказ и НЕ отсутствие ответа, а НЕ
    // ДОСТАВЛЕНО; исход обязан называть это своим именем, иначе лог врёт следующей сессии.
    const noticeMode = notice && !batch;
    const unreadOutcome = () => (noticeMode ? 'notice left unread' : 'page closed without an answer');
    const unreadSuffix = noticeMode
      ? ' Сообщение НЕ доставлено (нет пометки «' + NOTICE_READ_LABEL + '», I38) — повторю в следующей пачке.'
      : '';
    const server = createServer((req, res) => {
      const ok = (obj) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
      if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(build().html); // I1: всегда свежая сборка из md
      } else if (req.method === 'GET' && batch && req.url.startsWith('/d/')) {
        // Документ отдельным окном (bugs/52). Путь принимается ТОЛЬКО из текущей очереди —
        // иначе адресная строка стала бы способом прочитать любой файл репозитория.
        const rel = decodeURIComponent(req.url.slice('/d/'.length));
        const allowed = pendingDocs(root).some((d) => d.doc === rel) ||
          pendingNotices(root).some((n) => n.doc === rel);
        if (!allowed) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Документа нет в очереди: ' + rel); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(buildDoc(rel).html);
      } else if (req.method === 'GET' && req.url === '/alive') {
        lastAlive = Date.now(); strikes = 0;
        if (beaconTimer) { clearTimeout(beaconTimer); beaconTimer = null; } // страница вернулась (T3)
        ok({ ok: true });
      } else if (req.method === 'POST' && req.url === '/decide') {
        let body = '';
        req.on('data', (c) => { body += c; });
        req.on('end', () => {
          try { // I10: любой отказ — громкий, с причиной на страницу
            const payload = JSON.parse(body);
            const doc = batch ? payload.doc : relative(root, resolve(root, docPath)).replace(/\\/g, '/');
            // Класс определяет СЕРВЕР по файлу состояния (клиентскому флагу верим только как
            // подсказке): пометка сообщения не должна зависеть от того, что прислала страница.
            const asNotice = (notice && !batch) || readQueue(root).some((i) => i.doc === doc && isNoticeItem(i));
            if (asNotice) { // I37: пометка «прочитано» — ШТАТНЫЙ исход, код 0
              const record = recordDecision(root, doc, { kind: KIND_NOTICE, comment: payload.comment });
              markNoticeRead(root, doc); // I38: доставка доказывается пометкой, и только ею
              const withComment = record.comment ? ' + комментарий' : '';
              ok({ ok: true, written: NOTICE_KIND_LABEL + ' прочитано: ' + doc + withComment });
              outcome = 'notice read';
              const restN = pendingNotices(root).length;
              log('Исход: ' + NOTICE_KIND_LABEL + ' прочитано (' + doc + ', by ' + record.by + withComment +
                ') — завершаю контур (I8).' +
                (restN > 0 ? ' Непрочитанных сообщений осталось: ' + restN + ' — перезапуск пачки за агентом.' : ''));
              setTimeout(finish, SERVER_DEATH_MS, EXIT_DECIDED);
              return;
            }
            const record = recordDecision(root, doc, { answers: payload.answers, comment: payload.comment });
            const nAns = Object.keys(record.answers || {}).length;
            const rest = batch ? pendingDocs(root).filter((d) => d.unanswered > 0).length : 0;
            // ПАЧКА НЕ ЗАКРЫВАЕТСЯ НА ПЕРВОМ ЖЕ ДОКУМЕНТЕ (bugs/52). Полевой отказ владельца
            // 2026-08-08 ≈07:05 +03:00: «я нажал запись решений по документу — закрылся весь
            // браузер, а там ещё ниже вопросы были». Прежняя ветка завершала контур ВСЕГДА и
            // перекладывала перезапуск на агента — со стороны человека это выглядит как исчезнувшее
            // окно посреди работы, то есть ровно то, чего вектор цели 2.2 обещает не допускать.
            // Теперь: остались документы с неотвеченными вопросами → сервер ЖИВЁТ, страница
            // перечитывается и показывает остаток; контур завершается, когда отвечать больше нечего.
            ok({ ok: true, written: doc + ' + decision.json + архив (' + nAns + ' ответ(ов))', more: rest, doc });
            outcome = 'decision recorded';
            if (rest > 0) {
              log('Записано: ' + doc + ' (' + nAns + ' ответов, by ' + record.by +
                '). В очереди осталось документов: ' + rest + ' — страница ОСТАЁТСЯ открытой, контур ждёт.');
              outcome = null;  // контур не завершён: исход ещё впереди
              return;
            }
            log('Исход: решение записано (' + doc + ', ' + nAns + ' ответов, by ' + record.by +
              ') — очередь пуста, завершаю контур (I8).');
            setTimeout(finish, SERVER_DEATH_MS, EXIT_DECIDED); // DEF3: окно успевает закрыться
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, reason: String(e.message || e) }));
            log('ОШИБКА записи решения (страница показала спасательный круг): ' + e.message);
          }
        });
      } else if (req.method === 'POST' && req.url === '/closed') {
        let body = '';
        req.on('data', (c) => { body += c; });
        req.on('end', () => {
          ok({ ok: true });
          if (outcome) return; // уже записано — смерть по расписанию DEF3
          // bugs/52: в режиме очереди контур завершает только закрытие ВХОДНОЙ страницы. Окно
          // документа закрывается штатно (после записи или без неё) и сессию не оканчивает —
          // иначе человек, закрывший одно интервью, терял бы всю очередь.
          if (batch && !String(body).startsWith('index')) {
            log('Окно документа закрыто — входная страница очереди остаётся, контур ждёт.');
            return;
          }
          if (beaconTimer) clearTimeout(beaconTimer);
          beaconTimer = setTimeout(() => { // T3: ~3 с — вернётся ли страница после перезагрузки
            outcome = unreadOutcome();
            log('Исход: страница закрыта без ответа — завершаю контур (I14, быстрый путь маячка).' + unreadSuffix);
            finish(EXIT_CLOSED);
          }, BEACON_RELOAD_GRACE_MS);
        });
      } else { res.writeHead(404); res.end(); }
    });
    // I14/DEF6: тишина-вахта — терпение живо, пока жива страница; два страйка против сна (T5)
    const watch = setInterval(() => {
      if (outcome) return;
      if (Date.now() - lastAlive > SILENCE_THRESHOLD_MS) {
        strikes += 1; // первый страйк — только подозрение; решает второй, тиком позже
        if (strikes >= SILENCE_STRIKES_TO_DIE) {
          outcome = unreadOutcome();
          log('Исход: страница молчит дольше порога (' + (SILENCE_THRESHOLD_MS / 60000) + ' мин, два страйка) — завершаю контур (I14, тишина-вахта).' + unreadSuffix);
          finish(EXIT_CLOSED);
        }
      } else strikes = 0;
      if (timeoutMs > 0 && Date.now() - startedAt > timeoutMs) { // DEF5: только автоматизация
        outcome = unreadOutcome();
        log('Исход: терпимая ТИШИНА исчерпана (--timeout, только для автоматизации; это не дедлайн на раздумья) — завершаю.' + unreadSuffix);
        finish(EXIT_CLOSED);
      }
    }, SILENCE_TICK_MS);
    const finish = (code) => {
      clearInterval(watch);
      rmSync(lockPath(root, lockKey), { force: true });
      server.close(() => resolveP({ outcome, exitCode: code }));
      setTimeout(() => resolveP({ outcome, exitCode: code }), 1000).unref();
    };
    process.once('SIGINT', () => { // I25: третий исход — прерван человеком
      outcome = 'interrupted by the human';
      log('Исход: прерван человеком (SIGINT).');
      finish(EXIT_INTERRUPTED);
    });
    server.listen(0, '127.0.0.1', () => { // I30: свободный порт, никогда фиксированный
      const url = 'http://127.0.0.1:' + server.address().port + '/';
      mkdirSync(resolve(root, DECISIONS_DIR), { recursive: true });
      writeFileSync(lockPath(root, lockKey), JSON.stringify({ pid: process.pid, url, startedAt: provenance().at }) + '\n', 'utf8');
      log('Страница поднята: ' + url + (batch ? ' (очередь)' : ' (' + first.title + ')'));
      if (open) log('Окно: ' + openWindow(url)); // показ — действие агента (I15)
      if (signal) { // I5: зов — ПОСЛЕ поднявшейся страницы; I32: не блокирует контур
        const nWait = first.questions ? first.questions.filter((q) => !q.answered).length : 0;
        signalCall(root, callPhrase({
          batch, notice: noticeMode, kind: first.kind, title: first.title, nWait,
          nDocs: batch ? pendingDocs(root).length + (first.notices || 0) : 1,
          nQuestions: first.total || 0, nNotices: first.notices || 0,
        }), { log });
      }
      serveContour._onUp && serveContour._onUp(url); // хук для QA-прогона
    });
  });
}

// ── Селфтест класса «сообщение» (I37/I38) — машина состояний и порядок групп ────────────────
// Стережёт ровно то, что нельзя увидеть глазами на живой странице: пометка «прочитано» как
// ШТАТНЫЙ исход, отсутствие пометки как «не доставлено», и позицию группы сообщений ПОД
// вопросами (порядок доказывается индексом в HTML, а не впечатлением от скриншота).
export function selftest() {
  let n = 0, bad = 0;
  const ok = (cond, name) => { n++; if (!cond) { bad++; console.log('✗ ' + name); } else console.log('✓ ' + name); };
  const root = mkdtempSync(join(tmpdir(), 'kaif-notice-'));
  mkdirSync(join(root, 'interviews'), { recursive: true });
  mkdirSync(join(root, 'reports'), { recursive: true });
  const IV = 'interviews/interview_001_selftest.md';
  writeFileSync(join(root, IV),
    '# Interview #001 — свод\n\n> Status: **🟡 awaiting**\n\n### Q1. Вопрос?\n\n' +
    '- **A) (Рекомендовано)** первый\n- **B)** второй\n\n**Answer:**\n', 'utf8');
  const NOTICE = 'reports/notice_selftest.md';
  writeFileSync(join(root, NOTICE), '# Отчёт ночного цикла\n\nЗакрыто три пункта беклога.\n', 'utf8');

  // 1. Регистрация сообщения: своя группа, и НИ ОДНОГО пересечения с классом вопросов
  enqueue(root, NOTICE, { kind: KIND_NOTICE });
  ok(pendingNotices(root).length === 1, 'сообщение зарегистрировано и числится непрочитанным');
  ok(!pendingDocs(root).some((d) => d.doc === NOTICE), 'сообщение НЕ попадает в группу вопросов');
  ok(pendingDocs(root).some((d) => d.doc === IV), 'документ с вопросом по-прежнему виден как вопрос');

  // 2. Форма страницы сообщения: пометка есть, выбора вариантов нет по построению
  const page = buildNoticePage(root, NOTICE);
  ok(page.html.includes(NOTICE_READ_LABEL), 'страница-сообщение несёт пометку «' + NOTICE_READ_LABEL + '»');
  ok(!page.html.includes('type="radio"'), 'страница-сообщение не предлагает выбор варианта (ответа не ждёт)');
  ok(page.html.includes('Закрыто три пункта беклога'), 'тело сообщения отрисовано (читать есть что)');

  // 3. Порядок групп: сообщения СТРОГО ПОД вопросами (№009 Q2)
  const q = buildQueuePage(root, pendingDocs(root));
  const lastCard = q.html.lastIndexOf('class="qcard');
  const noticeHead = q.html.indexOf(NOTICE_GROUP_TITLE);
  ok(lastCard >= 0 && noticeHead > lastCard, 'в пачке группа сообщений идёт ПОД последней карточкой вопроса');
  ok(q.notices === 1 && q.total === 1, 'пачка считает оба класса раздельно (вопросов 1, сообщений 1)');

  // 4. Пометка «прочитано» — штатный исход; без пометки сообщение остаётся недоставленным (I38)
  ok(markNoticeRead(root, NOTICE) === true, 'пометка «прочитано» проставлена');
  ok(pendingNotices(root).length === 0, 'прочитанное сообщение уходит из очереди повторной доставки');
  ok(readQueue(root).some((i) => i.doc === NOTICE && i.readAt), 'пометка доказуема полем readAt в файле состояния');
  enqueue(root, NOTICE, { kind: KIND_NOTICE }); // новый повод сообщить по тому же документу
  ok(pendingNotices(root).length === 1, 'повторный зов по тому же документу снимает старую пометку');

  // 5. Фраза зова называет класс и числа (человек решает «идти сейчас?» ДО чтения страницы)
  ok(callPhrase({ notice: true, title: 'Отчёт' }).includes(NOTICE_NO_ANSWER_NOTE),
    'фраза сообщения говорит «' + NOTICE_NO_ANSWER_NOTE + '»');
  const batchPhrase = callPhrase({ batch: true, nDocs: 2, nQuestions: 1, nNotices: 1 });
  ok(batchPhrase.includes('вопросов без ответа 1') && batchPhrase.includes('сообщений непрочитанных 1'),
    'фраза пачки называет ОБА числа раздельно');
  ok(!callPhrase({ batch: true, nDocs: 1, nQuestions: 3, nNotices: 0 }).includes('сообщений'),
    'без сообщений фраза пачки о них не заикается');

  rmSync(root, { recursive: true, force: true });
  console.log(bad ? 'СЕЛФТЕСТ КРАСНЫЙ: ' + bad + ' из ' + n : 'селфтест класса «сообщение» зелёный: ' + n + ' проверок');
  if (bad) process.exit(1);
}

// ── Точка входа (T9) ───────────────────────────────────────────────────────────────────────
if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) {
  const args = process.argv.slice(2);
  const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
  const docPath = args.find((a) => !a.startsWith('--') && a !== opt('--timeout'));
  const root = process.cwd();
  const opts = {
    open: !args.includes('--no-open'),
    signal: !args.includes('--silent'),
    timeoutMs: Number(opt('--timeout') || 0) * 1000, // I9: дефолт 0 — терпение машины бесконечно
  };
  const asNotice = args.includes('--notice'); // I37: класс «сообщение»
  if (args.includes('--selftest')) { selftest(root); process.exit(0); }
  if (args.includes('--enqueue')) { // I7: очередь — файл состояния; документ остаётся на месте
    if (!docPath) { console.error('usage: node tools/review.mjs --enqueue <документ.md> [--notice]'); process.exit(1); }
    const items = enqueue(root, docPath, { kind: asNotice ? KIND_NOTICE : 'question' });
    console.log('В очереди: ' + items.length + ' поз.' + (asNotice ? ' (' + NOTICE_KIND_LABEL + ')' : '') +
      ' — покажется пачкой: node tools/review.mjs --queue');
    process.exit(0);
  }
  if (args.includes('--queue')) { // пачечная страница «Накопилось N» — зов ОДИН раз на пачку (I7)
    const docs = pendingDocs(root);
    const notices = pendingNotices(root);
    if (docs.length === 0 && notices.length === 0) {
      console.log('Неотвеченных вопросов и непрочитанных сообщений нет — очередь пуста, страница не нужна.');
      process.exit(0);
    }
    serveContour(root, { batch: true }, opts).then((r) => process.exit(r.exitCode));
  } else if (asNotice) { // сообщение: зарегистрировать в очереди И показать сейчас (I37/I38)
    if (!docPath) { console.error('usage: node tools/review.mjs <документ.md> --notice'); process.exit(1); }
    enqueue(root, docPath, { kind: KIND_NOTICE }); // без пометки останется в очереди на повтор
    serveContour(root, { docPath, notice: true }, opts).then((r) => process.exit(r.exitCode));
  } else if (args.includes('--no-serve')) { // C9: «собрать и выйти» — иначе синхронный вызывающий виснет
    if (!docPath) { console.error('usage: node tools/review.mjs <документ.md> --no-serve'); process.exit(1); }
    const page = buildPage(root, docPath);
    const outDir = resolve(root, TMP_DIR);
    mkdirSync(outDir, { recursive: true });
    const out = join(outDir, basename(docPath).replace(/\.md$/u, '') + '.html');
    writeFileSync(out, page.html, 'utf8');
    console.log('Рендер записан: ' + out);
    console.log('RENDER IS NOT YET A SHOW'); // M8: напоминание в точке соблазна отдать путь
    console.log('Показ — действие: node tools/review.mjs ' + docPath);
    process.exit(0);
  } else if (docPath) {
    serveContour(root, { docPath }, opts).then((r) => process.exit(r.exitCode));
  } else {
    console.error('usage: node tools/review.mjs <документ.md> [--no-serve|--silent|--no-open|--timeout N]\n' +
      '       node tools/review.mjs <документ.md> --notice   (сообщение: ответа не ждёт, ждёт пометки «' + NOTICE_READ_LABEL + '»)\n' +
      '       node tools/review.mjs --queue | --enqueue <документ.md> [--notice] | --selftest\n' +
      'Запускать ОТСЛЕЖИВАЕМОЙ фоновой задачей (I31): голый & харнесс не отслеживает — уведомление не придёт.');
    process.exit(1);
  }
}
