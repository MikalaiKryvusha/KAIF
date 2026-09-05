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
//   G4  — (2.6, issue #47) ждущее интервью, НИ РАЗУ не показанное владельцу дольше порога, — нарушение;
//         факт показа — карта контура interviews/decisions/shown.json (I40).
//   G5  — (2.6, поправка автора к #47) вопрос владельцу ПРОЗОЙ вне interviews/: обращение к владельцу
//         и «?» в конце строки, вне цитат/кода/таблиц; действует ВПЕРЁД от даты документа.
//   G6  — (2.6, №98) живой вопрос без четырёхстрочного сценария Ситуация · Действие · Результат ·
//         Проверка — владелец как заказчик не понимает предмет; действует вперёд от даты интервью.
//
// Запуск:  node tools/questions-guard.mjs            — прогон по репозиторию (exit 1 на новом)
//          node tools/questions-guard.mjs --selftest — мутации на временной фикстуре
//          node tools/questions-guard.mjs --write-baseline — снять базовую линию долга (однократно)
//          node tools/questions-guard.mjs --root <dir> [--baseline <file>] — прогон по чужому корню (фикстуры)

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, rmSync, utimesSync } from 'node:fs';
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

// G4 (issue #47, 2.6): факт показа читается из карты контура (I40); возраст — mtime файла интервью
// (эвристика, названная вслух: правка сегодня = живой документ; нетронутый неделями — тот самый
// класс: 48 дней, ~40 сессий, «он лежит давно без моего даже малейшего представления, что есть
// некий вопрос»). Порог — сутки: свежее интервью ещё не успело подняться страницей.
const SHOWN_FILE = 'interviews/decisions/shown.json';
const NEVER_SHOWN_DAYS = 1;
const DAY_MS = 86400000;
// G5/G6 действуют ВПЕРЁД — по первой ISO-дате в шапке документа (первые 12 строк); документ без
// даты не доказуемо новый и не судится: историю не переписываем, ратчет не раздуваем (порог задаёт
// сам документ — тот же приём, что у оси меток времени doc-header-lint).
const FORWARD_SINCE = '2026-09-05';
const HEAD_LINES = 12;
// G5: обращение к владельцу — узкая примета (владел-/автор-/owner), только вместе с «?» в конце
// строки ПОСЛЕ снятия цитат «…», "…" и код-спанов: цитата слов владельца с вопросом — не вопрос ему.
const OWNER_ADDRESS_RE = /(?:владел\p{L}*|автор\p{L}*|\bowner\b)/iu;
const QUOTED_RE = /«[^»]*»|"[^"]*"|`[^`]*`/gu;
// G6 (№98): четыре строки-ключа на языке проекта (сценарная форма REQUIREMENTS_FRAMEWORK).
const SCENARIO_KEYS = [
  /^\s*(?:-\s*)?(?:Ситуация|Situation)\./mu, /^\s*(?:-\s*)?(?:Действие|Action)\./mu,
  /^\s*(?:-\s*)?(?:Результат|Result)\./mu, /^\s*(?:-\s*)?(?:Проверка|Check)\./mu,
];
// Законный отказ от сценария — ОБЪЯВЛЕННЫЙ, с причиной (например, вопрос-имя: класс «вкус»).
const NO_SCENARIO_MARK = /<!--\s*questions-guard:no-scenario\s+\S/u;
const readShownMap = (root) => {
  const p = resolve(root, SHOWN_FILE);
  if (!existsSync(p)) return {};
  try { return JSON.parse(stripBom(readFileSync(p, 'utf8'))); } catch { return {}; }
};
const headDate = (lines) => (lines.slice(0, HEAD_LINES).join('\n').match(/\b(\d{4}-\d{2}-\d{2})\b/) || [])[1] || null;
const isForward = (lines) => { const d = headDate(lines); return Boolean(d) && d >= FORWARD_SINCE; };

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
    const g5 = isForward(lines); // G5 судит только документы, датированные не раньше FORWARD_SINCE
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
      if (isQueueHeading || isAddress) { hits.push(mkHit(root, p, i, line, false)); continue; }
      // G5: вопрос владельцу ПРОЗОЙ — обращение + «?» в конце строки; цитаты, таблицы, блок-цитаты
      // и заголовки молчат (поправка автора к #47: вопрос жил под строкой статуса в bugs/39 и ни
      // одной примете заголовка не соответствовал).
      if (g5 && !/^\s*[>|#]/.test(line)) {
        const bare = content.replace(QUOTED_RE, '').trim();
        if (/\?$/u.test(bare) && OWNER_ADDRESS_RE.test(bare)) hits.push({ ...mkHit(root, p, i, line, false), prose: true });
      }
    }
  }
  return hits;
}
// Ключ долга считается по строке БЕЗ html-комментариев. Комментарий — это то, чем строку
// ОБЪЯСНЯЮТ, а не то, чем она является: пока ключ включал его, дописанная будущей сессией пометка
// меняла sha1, и давно известный долг воскресал «новым нарушением». Так и вышло — соседняя ось
// (`bugs/76`) пометила четыре чекбокса закрытого эпика причиной, и страж вопросов объявил один из
// них новым. Ратчет, наказывающий за документирование строки, учит её не документировать.
const debtText = (line) => line.replace(/<!--[^]*?-->/g, '').trim();
const mkHit = (root, p, i, line, emptyReason) => ({
  file: rel(root, p),
  line: i + 1,
  text: line.trim(),
  key: rel(root, p) + '#' + sha1(debtText(line)),
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

// Ось «вопрос ОТПРАВЛЯЕТ в документ» (bugs/83). Слово владельца дословно, страница контура
// 2026-08-09 13:45 +03:00: «покажи мне этот порядок в контексте задаваемого вопроса! не отправляй
// меня капаться в MD документах! Тысячу раз об этом просил! Открытый вопрос должен быть
// достаточен для моего понимания решаемого вопроса!»
//
// Канон уже требовал этого для АРТЕФАКТОВ («Показ — это действие, а не ссылка»), а вопрос — не
// артефакт, и правило до него не дотягивалось: агент писал «в `researches/18` перечислены цели…»
// и считал, что показал. Урок, прожитый владельцем много раз и записанный текстом, обязан стать
// механизмом — иначе он повторится (EXP-0079).
//
// Стережётся ФОРМА отправки, а не обобщение (EXP-0074): глагол-указатель РЯДОМ с адресом
// документа в одной строке. Ссылка-провенанс рядом с приведённой цитатой при этом законна и
// молчит — она не отправляет, а подтверждает.
const SEND_VERB = /(?:см\.|смотри|перечислен\S*|описан\S*|приведён\S*|приведен\S*|изложен\S*|живут\s+в|живёт\s+в|лежит\s+в|лежат\s+в|находится\s+в|находятся\s+в)/iu;
const DOC_REF = /`?(?:plans|bugs|ideas|researches|interviews|homeworks|reports)\/[\w.\-]+`?|`[\w.\-]+\.md`/u;
const sendsToDoc = (body) => (body || []).some((l) => {
  if (/^\s*\|/.test(l)) return false;            // клетки таблицы вариантов — это уже содержание
  return SEND_VERB.test(l) && DOC_REF.test(l);
});

// ── Проверка 2: интервью — неотвеченные (отчёт), протухший статус (G3), обратное плечо (I20/I21) ──
// Разбор — единым парсером ядра (C4, все пять правил; «комментарий ≠ ответ» — пилот 008).
function parseInterview(root, p) {
  const md = readLines(p).join('\n');
  const name = rel(root, p);
  const num = (name.match(/interview_(\d+)/) || [])[1] || null;
  const st = docStatus(md);
  const questions = parseQuestions(md).map((q) => ({
    // Адресат ответа — ПЕРЕЧЕНЬ, а не один документ (круг R2, ось G): ядро копит все строки
    // поля через перевод строки, и каждая строка судится отдельно. Прежде поле было одной
    // строкой, а разбор адреса брал в ней ПЕРВОЕ вхождение пути — второй и третий адресат
    // разноса не получали и числились нулём долга.
    id: q.id, answered: q.answered,
    targets: q.target ? q.target.split('\n').map((s) => s.trim()).filter(Boolean) : [],
    // Ось «вопрос ОТВЕЧАЕМ» (bugs/62): сколько вариантов ПАРСЕР увидел в этом вопросе — ровно
    // столько радиокнопок нарисует страница. Не «сколько букв написал автор»: буквы, набранные
    // формой, которой парсер не знает, для владельца не существуют.
    options: q.options.length,
    // Ось «вариант ПОТЕРЯН» (bugs/81): сколько буквенных строк таблицы НАПИСАЛ АВТОР. Прежняя
    // проверка сравнивала увиденное парсером с НУЛЁМ — а это прокси: свойство здесь «каждая
    // написанная буква доехала до радиокнопки», и частичная потеря его нарушает, оставаясь
    // невидимой. В опубликованном №016 автор написал четыре варианта, владелец увидел три.
    // bugs/104 (№019): жирная метка буквы законна и с пометкой в скобках ДО закрытия жирного —
    // «**A (Рекомендация)**»; та же скобка, что у парсера и у приметы verify-contour, — три
    // счётчика одной грамматики двигаются одним движением, иначе оси-сверки слепнут согласованно.
    authoredRows: (q.body || []).filter((l) => /^\s*\|\s*\*\*[A-ZА-Я](?:\s*\([^)]*\))?\*\*/u.test(l)).length,
    // Явный отказ от вариантов — законный ход, но ОБЪЯВЛЕННЫЙ (см. OPEN_MARK ниже).
    open: OPEN_MARK.test(q.body ? q.body.join('\n') : ''),
    sendsToDoc: sendsToDoc(q.body),
    // G6 (№98): в теле вопроса есть все четыре строки сценария — или объявленный отказ с причиной.
    scenario: SCENARIO_KEYS.every((re) => re.test((q.body || []).join('\n'))),
    noScenario: NO_SCENARIO_MARK.test((q.body || []).join('\n')),
  }));
  const lines = readLines(p);
  return { file: name, num, closed: st === 'closed', waiting: st === 'waiting', questions,
    forward: isForward(lines), ageDays: Math.floor((Date.now() - statSync(p).mtimeMs) / DAY_MS) };
}

function scanInterviews(root) {
  const dir = join(root, INTERVIEWS_DIR);
  // unresolvedTargets — СПРАВКА, не нарушение: адрес назван, но ни во что не разрешается.
  const out = { unanswered: [], stale: [], propagation: [], unanswerable: [], unresolvedTargets: [], neverShown: [] };
  if (!existsSync(dir)) return out;
  const files = readdirSync(dir).filter((f) => /^interview_\d+.*\.md$/.test(f)).sort();
  const shown = readShownMap(root); // I40: карта показов контура

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

    // G4 (issue #47): ждущий документ, которого владелец НИ РАЗУ не видел, старше порога — нарушение.
    // Единица — документ; ключ долга стабилен, чтобы ратчет не воскрешал его каждым прогоном.
    if (iv.waiting && empty.length > 0 && !shown[iv.file] && iv.ageDays >= NEVER_SHOWN_DAYS)
      out.neverShown.push({ file: iv.file, days: iv.ageDays, key: iv.file + '#never-shown' });

    // G3: статус «ждёт» при нуле пустых полей = протух.
    if (iv.waiting && iv.questions.length > 0 && empty.length === 0)
      out.stale.push({ file: iv.file, key: iv.file + '#stale' });

    // bugs/62: живой вопрос обязан быть ОТВЕЧАЕМЫМ в один клик — или объявить себя свободным.
    //
    // bugs/70: ось скоупится СОБСТВЕННЫМ свойством вопроса (поле `**Answer:**` пусто), а не чужим
    // предикатом `iv.waiting`. Прежде один и тот же прогон в одном проходе называл вопрос ждущим
    // (строка выше, `out.unanswered`) и НЕ проверял его (здесь) — две правды об одном вопросе.
    // Дыра была достижима интервью без строки статуса: контур уже показывает его владельцу без
    // радиокнопок, а страж молчит. Скоуп теперь ровно тот же, что у отчёта «Ждут ответа».
    for (const q of empty) {
      // Потеря ЧАСТИ вариантов судится раньше полного нуля: ноль — частный случай потери, и
      // именно поэтому прежняя ось его одна и ловила. Скоуп тот же, что у отчёта «Ждут ответа»:
      // у отвеченного вопроса потеря уже история, и краснеть на ней вечно — шум (bugs/70).
      if (!q.open && q.authoredRows > q.options) {
        out.unanswerable.push({ file: iv.file, q: q.id, options: q.options, authored: q.authoredRows,
          key: `${iv.file}#${q.id}#lost-options` });
        continue;
      }
      if (q.open || q.options >= MIN_OPTIONS) continue;
      out.unanswerable.push({ file: iv.file, q: q.id, options: q.options,
        key: `${iv.file}#${q.id}#unanswerable` });
    }
    // bugs/83: вопрос обязан быть САМОДОСТАТОЧЕН. Скоуп тот же — живые вопросы: переписывать
    // прошлые интервью задним числом нельзя (append-only), а держать перед владельцем можно
    // только то, что он ещё не решил.
    for (const q of empty) {
      if (q.sendsToDoc) out.unanswerable.push({ file: iv.file, q: q.id, sends: true,
        key: `${iv.file}#${q.id}#sends-to-doc` });
      // G6 (№98): живой вопрос без сценария «что владелец увидит» — заказчик не понимает предмет
      // (bugs/111: два вопроса вернулись словом «не понимаю проблему»). Вперёд от даты интервью.
      if (iv.forward && !q.scenario && !q.noScenario) out.unanswerable.push({ file: iv.file, q: q.id,
        noScenario: true, key: `${iv.file}#${q.id}#no-scenario` });
    }

    if (!iv.num) continue;
    const NUM_SRC = `(?:интервью|interview)[_\\s#№]*0*${Number(iv.num)}(?!\\d)`;
    const numRe = new RegExp(NUM_SRC, 'iu'); // используется эвристикой I21 — её поведение не меняем

    for (const q of iv.questions.filter((x) => x.answered)) {
      if (q.targets.length > 0) {
        // I20: КАЖДЫЙ объявленный адресат цитирует «интервью №NNN, QN».
        // «Каждый» здесь буквально: в одной строке поля адресов может быть названо несколько
        // документов («`ideas/22` (шапка «Вовне») и `plans/26` §1»), и прежде разбор брал ПЕРВОЕ
        // вхождение пути, а остальные молча выпадали из проверки. В живом дереве многоадресными
        // оказались все одиннадцать полей, поэтому дыра покрывала весь корпус (круг R2, ось G).
        const addresses = [];
        for (const tgt of q.targets) {
          for (const m of tgt.matchAll(/([\p{L}\d_./-]+\/[\p{L}\d_.-]+|[A-Z_]+\.md)/gu)) {
            if (!addresses.some((a) => a.path === m[1])) addresses.push({ path: m[1], tgt });
          }
        }
        for (const { path: addrPath, tgt } of addresses) {
          const hint = addrPath.replace(/\.md$/, '');
          let docs = corpus.filter((c) => c.file.startsWith(hint));
          // Адресат может быть КОДОВЫМ файлом вне корпуса скана (tools/*.mjs — пилот 008):
          // читаем его с диска напрямую — цитата «интервью №NNN, QN» живёт и в комментариях кода.
          if (docs.length === 0 && existsSync(resolve(root, addrPath)))
            docs = [{ file: addrPath, text: readLines(resolve(root, addrPath)).join('\n') }];
          // АДРЕС, КОТОРЫЙ НИ ВО ЧТО НЕ РАЗРЕШАЕТСЯ, — НЕ АДРЕС. Примета пути ловит и пару
          // констант в скобках («константы QUIET_FROM/QUIET_TO»), и слэш внутри прозы; требовать
          // цитату от несуществующего документа значит красить гейт там, где риска нет, — а гейт,
          // краснеющий без риска, отключают (EXP-0080). Молчать о таком тоже нельзя: это либо
          // опечатка в адресе, либо адресат, которого ещё не создали. Поэтому — отдельной
          // справочной строкой, не нарушением.
          if (docs.length === 0) {
            out.unresolvedTargets.push({ file: iv.file, q: q.id, addr: addrPath, line: tgt,
              why: 'такого документа нет' });
            continue;
          }
          // МАШИННЫЙ ФАЙЛ ДАННЫХ прозаической цитаты не несёт по своей природе: базовая линия
          // стража — массив записей долга, и «интервью №NNN, QN» вписать туда некуда. Требовать
          // от него цитату значит краснеть там, где исполнить требование нельзя, — и такой гейт
          // обходят, а не чинят. Разнос сюда судится глазами, и страж говорит это вслух.
          if (/\.(?:json|lock|csv|svg|png|jpe?g|pdf)$/i.test(addrPath)) {
            out.unresolvedTargets.push({ file: iv.file, q: q.id, addr: addrPath, line: tgt,
              why: 'машинный файл данных — прозаической цитаты не несёт' });
            continue;
          }
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
              file: iv.file, q: q.id, target: addrPath,
              // Ключ долга — ПО АДРЕСУ, а не по тексту всей строки: иначе два адресата одной
              // строки делили бы один ключ, и второй долг был бы невидим ратчету по построению.
              key: iv.file + '#' + q.id + '#' + sha1(addrPath),
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
    ...place.map((h) => ({ ...h, kind: h.emptyReason ? 'маркер с ПУСТОЙ причиной'
      : h.prose ? 'вопрос владельцу ПРОЗОЙ вне interviews/ (G5)' : 'место вопросов' })),
    ...iv.stale.map((s) => ({ ...s, kind: 'STATUS ПРОТУХ (G3)', text: 'статус «ждёт» при нуле пустых полей' })),
    ...iv.neverShown.map((s) => ({ ...s, kind: 'ЖДЁТ И НИ РАЗУ НЕ ПОКАЗАН (G4, issue #47)',
      text: `документ ждёт владельца ${s.days} дн. без единой записи показа (interviews/decisions/shown.json). `
          + 'Напечатать очередь ≠ донести вопрос: подними страницей (node tools/review.mjs --queue) или, задав в чате, '
          + 'запиши факт (node tools/review.mjs --mark-shown <док> --transport чат); мёртвый документ закрой статусом' })),
    ...iv.propagation.map((d) => ({ ...d, kind: 'разнос не выполнен (I20)', text: `${d.q} → ${d.target}` })),
    // bugs/62: вопрос, который владелец не может ОТВЕТИТЬ в один клик. Отказ называет верный ход
    // (семейство 12) — обе легальные формы варианта и законный выход «свободный вопрос».
    ...iv.unanswerable.map((u) => (u.noScenario
      ? { ...u, kind: 'вопрос БЕЗ СЦЕНАРИЯ (G6, №98)',
          text: `${u.q}: ни одного четырёхстрочного сценария «что владелец увидит». Слово владельца: `
              + '«Я просил описывать требования поведенческими сценариями, и ты сам этим не пользуешься… '
              + 'приносишь мне какие-то технические пояснения, которые я не понимаю, как заказчик». Добавь под '
              + 'вариант строки Ситуация · Действие · Результат · Проверка — или объяви отказ с причиной: '
              + '<!-- questions-guard:no-scenario причина -->' }
      : u.sends
      ? { ...u, kind: 'вопрос ОТПРАВЛЯЕТ в документ (bugs/83)',
          text: `${u.q}: предмет решения лежит за ссылкой, а не в вопросе. Слово владельца: `
              + '«не отправляй меня капаться в MD документах! Открытый вопрос должен быть достаточен '
              + 'для моего понимания решаемого вопроса!» Приведи предмет В ВОПРОСЕ — таблицей, '
              + 'списком, цитатой' }
      : u.authored !== undefined
      ? { ...u, kind: 'вариант ПОТЕРЯН (bugs/81)',
          text: `${u.q}: автор написал буквенных строк — ${u.authored}, парсер увидел — ${u.options}; `
              + `${u.authored - u.options} вариант(ов) для владельца НЕ СУЩЕСТВУЕТ. Приведи клетку буквы `
              + 'к известной форме: | **A** | … | или | **A** (пометка) | … |' }
      : { ...u, kind: 'вопрос НЕОТВЕЧАЕМ (bugs/62)',
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
  // Справка, а не нарушение: страж НАЗЫВАЕТ адреса, которых не нашёл, вместо того чтобы молча
  // их пропустить. Молчаливый пропуск сделал бы охват уже объявленного, а красный на паре
  // констант в скобках — ложной тревогой (норма G9: ложная тревога опаснее пропуска).
  if ((iv.unresolvedTargets || []).length) {
    log(`— Адресаты, не разрешённые в документ: ${iv.unresolvedTargets.length} (справка, не нарушение)`);
    for (const u of iv.unresolvedTargets) log(`  · ${u.file} ${u.q} → «${u.addr}» — ${u.why}`);
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

  // G4/G5/G6 (2.6, issue #47 и №98) — шесть мутаций, каждая с предсказанием.
  const SCEN = '- Ситуация. Проект в состоянии `X`.\n- Действие. Агент запускает `cmd`.\n- Результат. Печатается `1`.\n- Проверка. `cmd` → `1`.\n';
  const IV_NEW = (extra) => '# Interview #095\n\n> Status: **🟡 awaiting**\n> Created: 2026-09-05\n\n### Q1. Вопрос?\n\n' +
    '| Вариант | Что означает |\n|---|---|\n| **A** | раз |\n| **B** | два |\n\n' + extra + '\n**Answer:**\n';
  const threeDaysAgo = new Date(Date.now() - 3 * DAY_MS);
  mut('ждёт и НИ РАЗУ не показан 3 дня (G4) → красный', 'нарушение «ЖДЁТ И НИ РАЗУ НЕ ПОКАЗАН»',
    () => { w('interviews/interview_095_x.md', IV_NEW(SCEN)); utimesSync(join(box, 'interviews/interview_095_x.md'), threeDaysAgo, threeDaysAgo); },
    true, 'НИ РАЗУ НЕ ПОКАЗАН');
  mut('ждёт, показан пачкой (G4) → зелёный', '0 нарушений: запись в shown.json гасит ось',
    () => { w('interviews/interview_095_x.md', IV_NEW(SCEN)); utimesSync(join(box, 'interviews/interview_095_x.md'), threeDaysAgo, threeDaysAgo);
      mkdirSync(join(box, 'interviews/decisions'), { recursive: true });
      w('interviews/decisions/shown.json', JSON.stringify({ 'interviews/interview_095_x.md': { at: new Date().toISOString(), transport: 'пачка' } })); },
    false, '');
  mut('вопрос владельцу ПРОЗОЙ в plans/ (G5) → красный', 'нарушение «вопрос владельцу ПРОЗОЙ вне interviews/»',
    () => w('plans/95_x.md', '# План 95 — тест\n\n> **Создан:** 2026-09-05\n\nВладелец, какой из двух вариантов берём?\n'),
    true, 'ПРОЗОЙ');
  mut('цитата слов владельца с «?» (G5) → зелёный', '0 нарушений: вопрос внутри «…» — цитата, не обращение',
    () => w('plans/95_x.md', '# План 95 — тест\n\n> **Создан:** 2026-09-05\n\nСлово владельца дословно: «какой из двух вариантов берём?» — ответ ниже.\n'),
    false, '');
  mut('живой вопрос БЕЗ сценария в интервью от 2026-09-05 (G6) → красный', 'нарушение «вопрос БЕЗ СЦЕНАРИЯ»',
    () => w('interviews/interview_095_x.md', IV_NEW('')), true, 'БЕЗ СЦЕНАРИЯ');
  mut('объявленный отказ от сценария с причиной (G6) → зелёный', '0 нарушений: маркер no-scenario с причиной',
    () => w('interviews/interview_095_x.md', IV_NEW('<!-- questions-guard:no-scenario вопрос-имя, класс «вкус» -->\n')), false, '');

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
  // Ратчет G2: КОММЕНТАРИЙ, дописанный к строке известного долга, не воскрешает её «новой».
  // Ключ считался по всему тексту строки, поэтому пометка соседней оси (`bugs/76`) превращала
  // давний долг в новое нарушение — страж наказывал ровно за документирование строки.
  mut('комментарий к строке известного долга → зелёный', 'ратчет узнаёт ту же строку: 0 новых нарушений',
    () => {
      const DEBT = '# План\n\n- [ ] Отчёт владельцу: катить сейчас или ждать релиза — его решение.\n';
      w('plans/01_test.md', DEBT);
      runGuard({ root: box, baselinePath: join(box, 'baseline.json'), writeBaseline: true, log: noop });
      w('plans/01_test.md', DEBT.replace('его решение.',
        'его решение. <!-- closed-ok: решено самим релизом, история append-only -->'));
    },
    false, '');

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
  // bugs/81: ЧАСТИЧНАЯ потеря вариантов. Ноль — лишь частный случай, и прежняя ось ловила только
  // его: клетка буквы с пометкой в скобках выпадала из разбора молча, и владелец не видел ровно
  // рекомендованный вариант. Оба ответа мутанта (EXP-0059): красный на форме, которой парсер не
  // знает, и МОЛЧАНИЕ на пометке в скобках, которую он теперь знает.
  mut('вариант ПОТЕРЯН (bugs/81) → красный', 'автор написал 3 буквы, парсер видит 2 — разница для владельца не существует',
    () => w('interviews/interview_092_test.md',
      '# Interview #092\n\n> Status: **🟡 awaiting the owner\'s answers**\n\n## Q1. Что делаем?\n\n'
      + '| Вариант | Что означает | Цена |\n|---|---|---|\n'
      + '| **A** — так себе форма | так | дёшево |\n| **B** | иначе | дорого |\n| **C** | третье | средне |\n\n**Answer:**\n'),
    true, 'ПОТЕРЯН');
  mut('пометка в скобках у буквы → зелёный', 'известная форма: | **A** (рекомендация агента) | — вариант доезжает',
    () => w('interviews/interview_092_test.md',
      '# Interview #092\n\n> Status: **🟡 awaiting the owner\'s answers**\n\n## Q1. Что делаем?\n\n'
      + '| Вариант | Что означает | Цена |\n|---|---|---|\n'
      + '| **A** (рекомендация агента) | так | дёшево |\n| **B** | иначе | дорого |\n\n**Answer:**\n'),
    false, '');
  // bugs/104: третья форма того же класса — пометка ВНУТРИ жирного. Красную сторону оси держит
  // мутация «вариант ПОТЕРЯН» выше; здесь — молчание на форме, которую все три счётчика одной
  // грамматики (парсер · примета verify-contour · authoredRows) теперь знают согласованно.
  mut('пометка ВНУТРИ жирного → зелёный', 'форма №019: | **A (Рекомендация)** | — вариант доезжает (bugs/104)',
    () => w('interviews/interview_092_test.md',
      '# Interview #092\n\n> Status: **🟡 awaiting the owner\'s answers**\n\n## Q1. Что делаем?\n\n'
      + '| Вариант | Что означает | Цена |\n|---|---|---|\n'
      + '| **A (Рекомендация)** | так | дёшево |\n| **B** | иначе | дорого |\n\n**Answer:**\n'),
    false, '');
  // bugs/83: вопрос, отправляющий владельца в документ. Фикстура — ДОСЛОВНО первая редакция Q2
  // интервью №017, на которой владелец и остановил агента.
  const OPTS = '| Вариант | Что означает | Цена |\n|---|---|---|\n| **A** | так | дёшево |\n| **B** | иначе | дорого |\n';
  mut('вопрос ОТПРАВЛЯЕТ в документ (bugs/83) → красный', 'предмет решения за ссылкой: «в `researches/18` перечислены цели…»',
    () => w('interviews/interview_092_test.md',
      '# Interview #092\n\n> Status: **🟡 awaiting the owner\'s answers**\n\n## Q1. Порядок целей — тот?\n\n'
      + 'В `researches/18` перечислены цели контура, и агент расставил их сам.\n\n' + OPTS + '\n**Answer:**\n'),
    true, 'ОТПРАВЛЯЕТ');
  mut('ссылка-провенанс рядом с приведённым содержанием → зелёный', 'ссылка подтверждает, а не отправляет',
    () => w('interviews/interview_092_test.md',
      '# Interview #092\n\n> Status: **🟡 awaiting the owner\'s answers**\n\n## Q1. Порядок целей — тот?\n\n'
      + 'Порядок целиком: 1) сохранность работы владельца · 2) правдивость заявлений · 3) решения владельца.\n'
      + 'Источник ранжирования — предложение агента, зафиксированное при закрытии эпика M.\n\n' + OPTS + '\n**Answer:**\n'),
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

  // ── Круг R2, ось G: у вопроса НЕСКОЛЬКО адресатов, и судится КАЖДЫЙ ──────────────────────
  // Прежде адресат физически не мог быть больше одного: каждая следующая строка «Адресат
  // ответа:» затирала предыдущую, а внутри строки разбор брал ПЕРВОЕ вхождение пути. В живом
  // дереве многоадресными оказались ВСЕ одиннадцать полей — то есть дыра покрывала весь корпус,
  // и долг разноса второго адресата числился нулём по построению.
  const IV_MULTI = '# Interview #093\n\n> Status: **✅ ANSWERS RECEIVED 2026-08-07**\n\n' +
    '### Q1. Вопрос?\n\n**Адресат ответа:** `plans/02` §1 и `plans/03` §2\n\n**Answer:** А\n';
  mut('ДВА адресата в ОДНОЙ строке, второй НЕ цитирует → красный (R2/ось G)',
    'долг разноса Q1 по второму адресату: первое вхождение пути больше не съедает остальные',
    () => {
      w('interviews/interview_093_test.md', IV_MULTI);
      w('plans/02_target.md', '# План 02\n\nПо ответу интервью №093, Q1 — делаем А.\n');
      w('plans/03_target.md', '# План 03\n\nПро другое, без цитаты.\n');
    },
    true, 'разнос');
  mut('ДВА адресата в одной строке, оба цитируют → зелёный (R2/ось G)', '0 нарушений',
    () => {
      w('interviews/interview_093_test.md', IV_MULTI);
      w('plans/02_target.md', '# План 02\n\nПо ответу интервью №093, Q1 — делаем А.\n');
      w('plans/03_target.md', '# План 03\n\nПо ответу интервью №093, Q1 — и здесь тоже.\n');
    },
    false, '');
  mut('ДВА адресата ДВУМЯ строками, первый НЕ цитирует → красный (R2/ось G)',
    'долг разноса Q1 по первому адресату: вторая строка поля больше не затирает первую',
    () => {
      w('interviews/interview_093_test.md',
        '# Interview #093\n\n> Status: **✅ ANSWERS RECEIVED 2026-08-07**\n\n### Q1. Вопрос?\n\n' +
        '**Адресат ответа:** `plans/02` §1\n**Адресат ответа:** `plans/03` §2\n\n**Answer:** А\n');
      w('plans/02_target.md', '# План 02\n\nПро другое, без цитаты.\n');
      w('plans/03_target.md', '# План 03\n\nПо ответу интервью №093, Q1 — делаем А.\n');
    },
    true, 'разнос');
  mut('адрес, не разрешающийся в документ → зелёный (R2/ось G)',
    '0 нарушений: пара констант в скобках — не адрес, красный на ней был бы ложной тревогой',
    () => {
      w('interviews/interview_093_test.md',
        '# Interview #093\n\n> Status: **✅ ANSWERS RECEIVED 2026-08-07**\n\n### Q1. Вопрос?\n\n' +
        '**Адресат ответа:** `plans/02` §1 (константы QUIET_FROM/QUIET_TO)\n\n**Answer:** А\n');
      w('plans/02_target.md', '# План 02\n\nПо ответу интервью №093, Q1 — делаем А.\n');
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
