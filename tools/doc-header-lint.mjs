#!/usr/bin/env node
// doc-header-lint.mjs — линтер шапки-меты И блока требований документов знаний
// (эпик N: шапка — фаза N3, plans/53 шаг 2; блок вектора цели + композиция со стоп-словарём —
// фаза N5, plans/55 шаги 1–2).
// [TESTED: 2026-08-07 · селфтест — 12 предсказанных находок на сломанной фикстуре (4 FULL +
// no-H1 + bugs-диалект ×2 + interview-диалект + корневой ярус + вектор/критерии ×2 + вектор
// идеи), +1 под --all, чистые файлы молчат, композиция со словарём находит подложенное
// стоп-слово (цитата вывода в plans/55); живой прогон по репо — 0 находок после ретрофитов N5]
//
// Схема шапки — решение в plans/53 («Решение по схеме»): каждый документ несёт линтуемую
// шапку-мету, по которой будущая сессия понимает документ, не читая тела. Четыре диалекта:
//   FULL (plans/ ideas/ researches/ homeworks/) — H1 первой строкой + blockquote-шапка сразу
//        после H1 с метками: **Создан:** (ISO-дата) · **Родитель:** · **Статус:** · **Вовне:**
//        (значение непустое на строке метки); опциональная **Наследники:** — формат, если есть.
//   BUGS (bugs/) — шапка шаблона /report-bug: **Status:** + **Version/build:** +
//        **Fix accepted when** (наблюдаемый критерий приёмки фикса — норма N2; родство/вовне —
//        секция ## Links шаблона; второй раз не канонизируем, DRY).
//   INTERVIEWS (interviews/) — диалект questions-guard: строки `> Topic:` + `> Status:` (G3
//        стережёт содержание статуса — здесь только наличие меток, две истины не плодим).
//   ROOT (корневые ключевые документы, канон-таксономия N4) — H1 первой
//        строкой + непустое самоописание до первого ##.
// Блок требований (N5): живые ЦЕЛЕВЫЕ документы нормо-эпохи (plans ≥ 26, ideas ≥ 21)
// открываются блоком «Вектор цели» (+ «Критерии приёмки» у планов) — REQUIREMENTS_FRAMEWORK;
// после структурных проверок линтер ГОНЯЕТ стоп-словарь payload-модуля
// kaif-requirements-lint по секциям требований plans/bugs/ideas (композиция: словарь живёт
// ТОЛЬКО в payload-модуле — здесь структура документов, там лексика требований; оговорка
// истока — модуль лежит в framework/tools/, собственного .kaif/tools/ исток не держит).
// Линтер КОНСУЛЬТИРУЕТ (exit 1 = есть находки, «поправь или оправдай на месте»), никогда не
// шлюз перед началом работы (антипаттерн DoR — критерий эпика 7).
//
// Запуск:  node tools/doc-header-lint.mjs             — живые документы (без _DONE_)
//          node tools/doc-header-lint.mjs --all       — включая DONE (advisory: ратчет ретрофита)
//          node tools/doc-header-lint.mjs --selftest  — красный доказан на сломанной фикстуре
//          node tools/doc-header-lint.mjs --root <dir> — прогон по чужому корню (фикстуры)

import { readFileSync, readdirSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, execFileSync } from 'node:child_process';
import { tempRoot } from './lib/temp-root.mjs';

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
// Метка bugs-диалекта из шаблона /report-bug (норма N2): канонический английский лейбл,
// греп-дружелюбный, как [TESTED]/DONE.
const FIELD_FIX_ACCEPTED = 'Fix accepted when';

// ── Блок «Вектор цели + Критерии приёмки» (N5, plans/55 критерий 1) ────────────────────────
// Скоуп — живые ЦЕЛЕВЫЕ документы обвязки: plans/ и ideas/ (баг несёт диалектное поле
// Fix accepted when; интервью и researches/homeworks — не целевые документы). Норма родилась
// фазой N2 (2026-08-07) и НЕ ретроактивна — закрытое прошлое не переписывается (тот же
// принцип, что T8), поэтому порог по номеру документа:
//   plans ≥ 26 — эпоха 2.2, все живые уже несут блок (обмер N5: 30/30);
//   ideas ≥ 21 — первая живая агентская идея, ретрофичена в N5.
// Файл без номера в имени (kaif_implementation_plan) — донормовый справочный, вне скоупа.
const GOAL_VECTOR_MIN = { plans: 26, ideas: 21 };
// Обе канонические формы блока: заголовок H2+ (де-факто конвенция планов 2.2, обмер N5) ИЛИ
// жирная метка в начале строки (форма шаблона /plan-task); EN-формы — шаблон /propose-idea.
// У идей отдельный блок критериев не требуется: шаблон складывает «как проверим» в сам
// Goal vector.
const VECTOR_RE = /^(?:#{2,6} .*(?:[Вв]ектор цели|Goal vector)|\*\*(?:Вектор цели|Goal vector))/m;
const CRITERIA_RE = /^(?:#{2,6} .*(?:[Кк]ритерии приёмки|[Гг]отово, когда|Acceptance criteria|[Dd]one when)|\*\*(?:Критерии приёмки|Acceptance criteria))/m;
// Payload-модуль стоп-словаря — композиция, не сращивание (решение N3 №7: здесь структура
// документов, там лексика требований); exit 3 модуля = «сканировать нечего», не находка.
const REQ_LINT_MODULE = join(dirname(fileURLToPath(import.meta.url)), '..', 'framework', 'tools', 'kaif-requirements-lint.mjs');
const DICT_TARGET_DIRS = ['plans', 'bugs', 'ideas'];
const EXIT_DICT_SKIPPED = 3;

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
  if (!head.includes('**' + FIELD_FIX_ACCEPTED)) {
    findings.push([relPath, `нет **${FIELD_FIX_ACCEPTED} (observable):** (норма N2, шаблон /report-bug)`]);
  }
}

// Целевой документ нормо-эпохи открывается блоком «Вектор цели» (+ «Критерии приёмки» у
// планов) — REQUIREMENTS_FRAMEWORK; проверка НАЛИЧИЯ блока, содержание судит словарь и судья.
function lintGoalVector(dir, relPath, lines, findings) {
  const min = GOAL_VECTOR_MIN[dir];
  if (!min) return;
  const num = relPath.match(/\/(\d+)_/);
  if (!num || Number(num[1]) < min) return;
  const body = lines.join('\n');
  if (!VECTOR_RE.test(body)) findings.push([relPath, 'нет блока «Вектор цели» (норма N2, REQUIREMENTS_FRAMEWORK)']);
  if (dir === 'plans' && !CRITERIA_RE.test(body)) {
    findings.push([relPath, 'нет блока «Критерии приёмки» (норма N2, REQUIREMENTS_FRAMEWORK)']);
  }
}

// Конвенция имён plans/ (задача T2, п. 9 идеи 20): эпик = `NN_EPIC_<имя>.md`, его операционный
// ребёнок называет родителя в СВОЁМ имени — `NN_epicMM_<фаза>_<имя>.md`. Проверка directory-level
// (не по файлу): у каждого ребёнка обязан существовать родитель MM, и родитель обязан быть
// эпиком. Обратную сторону («этот план — на самом деле эпик, а назван плоско») машина решить не
// может — по имени эпик не опознать, и выдумывать признак запрещено (правило трёх дверей).
// Скоуп задаёт САМ ПАТТЕРН: конвенция родилась в 2.2, старые планы её не используют и потому
// молчат — отдельный порог по номеру был бы константой без работы. DONE-тег терпится с обеих
// сторон пары (`NN_DONE_epicMM_…` ↔ `MM_DONE_EPIC_…`).
const PLAN_CHILD_RE = /^(\d+)_(?:DONE_)?epic(\d+)_/;
const planParentRe = (mm) => new RegExp('^' + mm + '_(?:DONE_)?EPIC_');
function lintPlanNaming(root, findings) {
  const files = listMd(join(root, 'plans'));
  let children = 0;
  for (const f of files) {
    const m = f.match(PLAN_CHILD_RE);
    if (!m) continue;
    children++;
    const mm = m[2];
    const parent = files.find((p) => p.startsWith(mm + '_'));
    if (!parent) {
      findings.push([`plans/${f}`, `имя ссылается на эпик ${mm}, но плана с номером ${mm} нет (конвенция T2)`]);
    } else if (!planParentRe(mm).test(parent)) {
      findings.push([`plans/${f}`, `родитель ${mm} — «${parent}», это не \`${mm}_EPIC_*\` (конвенция T2)`]);
    }
  }
  return children;
}

// ── Ось МЕТОК ВРЕМЕНИ (задача T8, решение владельца №49) ───────────────────────────────────
// «Метка должна иметь И ДАТУ И ВРЕМЯ — это КАНОН соглашений KAIF» (слово владельца дословно,
// принято 2026-08-07 ≈10:05 +03:00). Голая дата теряет порядок ВНУТРИ дня — а день ровно там,
// где решения проекта сталкиваются.
//
// Скоуп задаёт САМА МЕТКА, а не список файлов (по прецеденту оси имён T2):
//   ПРИМЕТА — узкий глагол принятия/фиксации/закрытия ВПЛОТНУЮ к дате (окно символов), причём
//     только в формах, помечающих ОДИН момент. Существительные («закрытие», «закрытии») не
//     метки, а проза о событии; МНОЖЕСТВЕННОЕ «закрыты» — сводка о НАБОРЕ, и требовать одно
//     время у четырёх закрытий бессмысленно: метка каждого стоит у него самого.
//   ПОРОГ — собственная дата метки. Канон действует ВПЕРЁД (плана 26 §7 п. 4: летопись
//     ретроспективно не переписывается), поэтому старые метки молчат по построению — без
//     базовой линии, которую надо вести и сокращать. Порог — СЛЕДУЮЩИЙ день после принятия:
//     метку датой самого дня принятия невозможно отличить от написанной за час ДО правила,
//     а страж, краснеющий на тексте, который правилу не подчинялся, — ложная тревога.
const CANON_STAMP_SINCE = '2026-08-08'; // канон принят 2026-08-07 10:09 +03:00 (решение №49)
const STAMP_WINDOW = 24;                // символов между глаголом и датой (вплотную, не «где-то в абзаце»)
// Глаголы — ПО ФОРМАМ, В КОТОРЫХ ПРАВИЛО РЕАЛЬНО НАРУШАЛИ (EXP-0074: обобщение ловит воздух).
// «снят» добавлен по живому экземпляру `ideas/24` — «✅ **Блокер снят 2026-08-08**» (bugs/67).
const STAMP_VERBS = '(?:принято|зафиксировано|закрыт(?:а|о)?|снят(?:а|о)?)';
// Время: допускается ДИАПАЗОН («07:13–07:20 +03:00») — замер по корпусу показал, что это живая и
// законная форма, а наивная примета объявляла её нарушением (класс ложной тревоги: страж, который
// красит верное, обесценивает свой красный).
const TIME_PART = '(\\s+\\d{2}:\\d{2}(?:\\s*[–—-]\\s*\\d{2}:\\d{2})?)';
const ZONE_PART = '(\\s*[+-]\\d{2}:\\d{2})';
// Группы: 1 промежуток · 2 честное «≈» · 3 дата · 4 время (возможно диапазон) · 5 зона.
const STAMP_RE = new RegExp(
  STAMP_VERBS + '(?![\\p{L}])' +
  '([^0-9\\n]{0,' + STAMP_WINDOW + '}?)' +
  '(≈\\s*)?(\\d{4}-\\d{2}-\\d{2})' + TIME_PART + '?' + ZONE_PART + '?', 'giu');

// ── Веха в поле «Статус:» — вторая законная форма метки (bugs/67) ──────────────────────────
// Канон называет меткой не только глагол: «решения, закрытия задач/фаз/багов, ВЕХИ В ПОЛЕ
// „Статус:“ документа, квитанции машинерии» (AGENT_GUIDE → канон T8). Доминирующая форма
// закрытия в этом репозитории БЕЗГЛАГОЛЬНА — `**Статус:** ✅ DONE 2026-08-09` — и старой примете
// была невидима по построению: 105 таких меток жили вне охвата.
//
// Скоуп — ЗНАЧЕНИЕ поля, а не вся строка. Диалект bugs пакует в одну строку три поля через «·»
// (`**Status:** ✅ DONE · **Version/build:** … · **When/context:** найден 2026-08-05`), и дата
// из `When/context:` меткой НЕ является: канон прямо исключает поля схемы. Замер по корпусу до
// правки: наивная примета «вся строка» дала 11 попаданий при ОДНОМ настоящем нарушении.
const STATUS_FIELD_RE = /^\s*(?:>|#{1,4})?\s*\*{0,2}(?:Статус|Status)\s*:?\*{0,2}\s*(.*)$/iu;
const FIELD_SEPARATOR = /\s+·\s+\*{0,2}\w/u;   // начало СЛЕДУЮЩЕГО поля в упакованной строке
const STATUS_DATE_RE = new RegExp('(\\d{4}-\\d{2}-\\d{2})' + TIME_PART + '?' + ZONE_PART + '?', 'gu');

// Изъятия — ровно те, что уже названы каноном, плюс одно, оплаченное этой же задачей.
// Канон требований формулирует принцип дословно: «Стоп-слово внутри цитаты, ❌-примера или
// названного оправдания легально — страж охотится на непроверяемые ТРЕБОВАНИЯ, а не на лексику».
// У оси меток такого изъятия не было, и первый же документ, ОПИСЫВАЮЩИЙ форму метки (`bugs/67`),
// стал ложным красным.
const FORMAT_TALK_RE = /ГГГГ-ММ-ДД|YYYY-MM-DD/u;      // строка говорит О ФОРМАТЕ, а не ставит метку
const EXEMPT_MARK_RE = /<!--\s*t8-ok\b/u;              // явное оправдание на месте, с причиной рядом

/** Строки внутри огороженных блоков кода — не проза документа, меток там нет. */
function fencedMask(lines) {
  const mask = new Array(lines.length).fill(false);
  let inFence = false;
  lines.forEach((l, i) => {
    if (/^\s*(```|~~~|``````)/.test(l)) { inFence = !inFence; mask[i] = true; return; }
    mask[i] = inFence;
  });
  return mask;
}

/** Дата внутри обратных кавычек — образец формата, а не метка момента. */
function insideCode(line, index) {
  const before = line.slice(0, index);
  return (before.match(/`/g) || []).length % 2 === 1;
}

function lintStamps(relPath, lines, findings) {
  const fenced = fencedMask(lines);
  const complain = (line, full, date, time, zone) => {
    if (date < CANON_STAMP_SINCE) return;           // история — не переписывается (канон вперёд)
    if (time && zone) return;
    const what = !time ? 'без времени' : 'со временем, но без смещения зоны';
    findings.push([relPath, `метка «${full.replace(/\s+/g, ' ').trim()}» — ${what} ` +
      `(канон T8: \`ГГГГ-ММ-ДД ЧЧ:ММ ±ЧЧ:ММ\`, локальное время владельца)`]);
  };

  // Ось 1 — глагол принятия/фиксации/закрытия вплотную к дате. Текст СКЛЕЕН, потому что метка
  // вправе перенестись на следующую строку («…РАЗРЕЗАНА НА ДВА КРУГА 2026-08-08\n23:10 +03:00»),
  // и врап документа не должен превращаться в находку.
  // Маркер блок-цитаты снимается перед склейкой: он разметка, а не часть метки. Иначе перенос
  // «…06:00\n> +03:00» читается как метка без зоны — ложный красный на ПОЛНОЙ метке (plans/62).
  const joinable = lines.filter((_, i) => !fenced[i]).map((l) => l.replace(/^\s*>\s?/, '')).join('\n');
  STAMP_RE.lastIndex = 0;
  let m;
  while ((m = STAMP_RE.exec(joinable))) {
    const [full, , , date, time, zone] = m;
    const lineStart = joinable.lastIndexOf('\n', m.index) + 1;
    const lineText = joinable.slice(lineStart, joinable.indexOf('\n', m.index) + 1 || undefined);
    if (FORMAT_TALK_RE.test(lineText) || EXEMPT_MARK_RE.test(lineText)) continue;
    if (insideCode(lineText, m.index - lineStart)) continue;
    complain(lineText, full, date, time, zone);
  }

  // Ось 2 — веха в ЗНАЧЕНИИ поля «Статус:».
  lines.forEach((line, i) => {
    if (fenced[i]) return;
    const fm = line.match(STATUS_FIELD_RE);
    if (!fm) return;
    if (FORMAT_TALK_RE.test(line) || EXEMPT_MARK_RE.test(line)) return;
    let value = fm[1];
    const cut = value.search(FIELD_SEPARATOR);       // отрезаем соседние поля упакованной строки
    if (cut >= 0) value = value.slice(0, cut);
    // Метка вправе перенестись на следующую строку — но склейка ТОЧНАЯ, а не «прихвати соседа»:
    // продолжение приклеивается, только если значение обрывается СРАЗУ ПОСЛЕ ДАТЫ, а следующая
    // строка НАЧИНАЕТСЯ со времени. Первая редакция клеила любую следующую строку и потому
    // вытаскивала дату из соседнего поля `When/context:` — двенадцать ложных красных на моих же
    // свежих баг-доках поймала первая же прогонка по корпусу.
    // Значение обрывается на дате ИЛИ на дате со временем — продолжение начинается со времени
    // или со смещения зоны. Обе формы переноса живые: «…2026-08-09\n> 06:00 +03:00» и
    // «…2026-08-09 06:00\n> +03:00».
    const endsMidStamp = /\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}(?:\s*[–—-]\s*\d{2}:\d{2})?)?\s*$/.test(value);
    const nextStartsStamp = /^\s*>?\s*(?:\d{2}:\d{2}|[+-]\d{2}:\d{2})/.test(lines[i + 1] || '');
    if (endsMidStamp && i + 1 < lines.length && !fenced[i + 1] && nextStartsStamp) {
      value += ' ' + String(lines[i + 1]).replace(/^\s*>\s?/, '');
    }
    STATUS_DATE_RE.lastIndex = 0;
    let d;
    while ((d = STATUS_DATE_RE.exec(value))) {
      const [full, date, time, zone] = d;
      if (insideCode(value, d.index)) continue;
      complain(line, full, date, time, zone);
    }
  });
}

// ── Ось ПРАВДИВОСТИ метки (bugs/78) ────────────────────────────────────────────────────────
// Две оси выше судят ФОРМУ: есть ли у метки дата, время и смещение зоны. Правдивость они не
// проверяют по построению — и дефект пришёл ровно оттуда: агент снял время пробой ОДИН раз в
// начале сессии и дальше подставлял правдоподобные значения. Все девять выдуманных меток были
// ИДЕАЛЬНО КАНОНИЧНЫ по форме, линтер печатал «findings 0», а нашёл расхождение ЧЕЛОВЕК —
// «на часах 10 частв, не понимаю, о каких 12 ты говоришь». Расхождение доросло до двух часов и
// попало в семь баг-доков, вердикт круга R1 и в САМО СВИДЕТЕЛЬСТВО освежения.
//
// Примета выбрана так, чтобы ложных срабатываний не было ПО ПОСТРОЕНИЮ, а не по подбору порога:
// **момент нельзя записать раньше, чем он наступил**. Метка, объявляющая время ПОЗЖЕ коммита,
// который эту строку внёс, невозможна физически — это либо выдумка, либо опечатка. Обратное
// направление законно и не судится вовсе: документ вправе описывать давно прошедший момент.
//
// Источник истины — АВТОРСКОЕ время коммита (`author-time`), а не коммиттерское: ребейз
// переписывает committer-date, и ось начала бы краснеть на честных метках после каждого
// `git pull --rebase` (в день письма этой оси их было два).
//
// Цена прогона — ОДИН `git blame` на файл, а не один `git log` на метку: у сотни меток второй
// вариант стоил бы сотню процессов.
const STAMP_FUTURE_TOLERANCE_MIN = 5;   // округление до минуты + расхождение часов машины и git
const NOT_COMMITTED = /^0{40}/;         // строка ещё не в истории — судить нечего, это не находка

/** Карта «номер строки → author-time (мс)» для файла. `null`, если git недоступен/файл вне истории. */
function blameTimes(root, relPath) {
  let out;
  try {
    out = execFileSync('git', ['blame', '--line-porcelain', '--', relPath],
      { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch { return null; }               // не git-дерево или файл не отслеживается — ось молчит
  const times = new Map();
  let line = 0, at = null, uncommitted = false;
  for (const row of out.split('\n')) {
    const head = row.match(/^([0-9a-f]{40}) \d+ (\d+)/);
    if (head) { line = Number(head[2]); at = null; uncommitted = NOT_COMMITTED.test(head[1]); continue; }
    if (row.startsWith('author-time ')) at = Number(row.slice(12)) * 1000;
    if (row.startsWith('\t') && at !== null && !uncommitted) times.set(line, at);
  }
  return times;
}

/** Найденные в файле метки: номер строки + объявленный момент. Только ПОЛНЫЕ метки (дата+время+зона). */
function stampMoments(lines) {
  const fenced = fencedMask(lines);
  const found = [];
  const FULL_STAMP = new RegExp('(\\d{4}-\\d{2}-\\d{2})\\s+(\\d{2}:\\d{2})\\s*([+-]\\d{2}:\\d{2})', 'g');
  lines.forEach((line, i) => {
    if (fenced[i]) return;
    if (FORMAT_TALK_RE.test(line) || EXEMPT_MARK_RE.test(line)) return;
    FULL_STAMP.lastIndex = 0;
    let m;
    while ((m = FULL_STAMP.exec(line))) {
      if (insideCode(line, m.index)) continue;
      const ms = Date.parse(`${m[1]}T${m[2]}:00${m[3]}`);
      if (!Number.isNaN(ms)) found.push({ n: i + 1, ms, text: m[0] });
    }
  });
  return found;
}

// РАТЧЕТ. Первый же прогон оси нашёл 58 меток в 29 файлах — задолженность прошлых сессий того же
// класса, что владелец поймал глазами. Чинить их сплошняком нельзя: канон различает *принято* и
// *зафиксировано*, а истинный момент ПРИНЯТИЯ по git не восстанавливается — известно лишь, что он
// не позже коммита. Подставить туда время коммита значило бы заменить одну выдумку другой.
// Поэтому известная задолженность фиксируется базовой линией и печатается ОДНОЙ строкой, а всё
// новое кричит поимённо: страж, который каждый прогон печатает 58 находок, учит оператора не
// смотреть — и следующая настоящая утонет в шуме (норма шума стража текстового правила).
// Базовая линия КОММИТИТСЯ (это долг проекта, а не состояние сессии) и только УМЕНЬШАЕТСЯ:
// разобрал метку — убери строку, вернуться она уже не сможет.
const STAMP_BASELINE = join(dirname(fileURLToPath(import.meta.url)), 'doc-header-lint.stamp-baseline.json');
const stampKey = (rel, text) => `${rel} :: ${text}`;

function loadStampBaseline() {
  try { return new Set(JSON.parse(readFileSync(STAMP_BASELINE, 'utf8')).known || []); }
  catch { return new Set(); }
}

function lintStampTruth(root, relPath, lines, findings, baseline, debt) {
  const stamps = stampMoments(lines);
  if (!stamps.length) return;
  const times = blameTimes(root, relPath);
  if (!times) return;                    // источника истины нет — ось честно молчит, а не зеленеет
  const tolerance = STAMP_FUTURE_TOLERANCE_MIN * 60 * 1000;
  for (const s of stamps) {
    const committed = times.get(s.n);
    if (committed === undefined) continue;             // строка ещё не закоммичена — не история
    if (s.ms <= committed + tolerance) continue;       // метка не в будущем — законно
    if (baseline && baseline.has(stampKey(relPath, s.text))) { debt.push(stampKey(relPath, s.text)); continue; }
    const aheadMin = Math.round((s.ms - committed) / 60000);
    findings.push([relPath, `метка «${s.text}» опережает СВОЙ коммит на ${aheadMin} мин ` +
      `(строка внесена ${new Date(committed).toISOString()}) — момент нельзя записать раньше, ` +
      `чем он наступил: сними время пробой \`date\` в тот же ход, что и запись (bugs/78, EXP-0078)`]);
  }
}

// ── Ось «закрытие против тела» (bugs/76) ───────────────────────────────────────────────────
// Закрытие фиксируется ШТАМПОМ В ШАПКЕ, а тело документа остаётся в состоянии «до». Дефект
// невидим при чтении диффа — он виден только при сверке заявления с телом, и именно поэтому его
// не поймал ни один прогон: `doc-header-lint` линтовал ФОРМУ шапки, а не её правдивость.
// Канон не запрещает снять критерий — он запрещает снять его МОЛЧА (легальная форма живёт рядом,
// в том же plans/26: T5.2 и T7 сняты видимой правкой строки).
//
// Примета узкая: документ ОБЪЯВЛЯЕТ себя закрытым И несёт незакрытые чекбоксы `- [ ]`.
// Изъятия названы, потому что оба — законные жанры, а не недосмотр:
//   · «Пул автономного беклога» и подобные списки-хранилища: незакрытый пункт там и есть
//     содержание, а не долг закрытого документа;
//   · строка с явной пометкой `<!-- closed-ok: причина -->` — то же изъятие на месте, что у оси
//     меток: правило текстового стража обязано иметь дверь для законного исключения.
const CLOSED_CLAIM_RE = /(?:✅\s*(?:DONE|ЗАКРЫТ|ЗАКРЫТА|ЗАКРЫТО)|^\s*\*\*Status:\*\*\s*✅)/u;
const OPEN_BOX_RE = /^\s*[-*]\s*\[ \]/;
const CLOSED_EXEMPT_RE = /<!--\s*closed-ok\b/u;
const BACKLOG_SECTION_RE = /(?:пул|беклог|backlog|задел|хвост|автономн)/iu;

function lintClosureVsBody(relPath, lines, findings) {
  const fenced = fencedMask(lines);
  const head = lines.slice(0, HEAD_LINES).join('\n');
  if (!CLOSED_CLAIM_RE.test(head)) return;          // документ себя закрытым не объявляет
  let section = '';
  let sectionExempt = false;
  const open = [];
  lines.forEach((line, i) => {
    if (fenced[i]) return;
    const h = line.match(/^#{1,6}\s+(.*)$/);
    // Изъятие принимается и НА ЗАГОЛОВКЕ — тогда оно накрывает секцию. Это нужно истории:
    // у закрытых до этой оси документов чекбоксы плана остались неотмеченными десятками, и
    // отмечать их задним числом значило бы УТВЕРЖДАТЬ за прошлые сессии то, чего не наблюдал.
    // Канон на этот случай отвечает append-only: поправка — новая запись, а не правка старой.
    if (h) { section = h[1]; sectionExempt = CLOSED_EXEMPT_RE.test(line); return; }
    if (!OPEN_BOX_RE.test(line)) return;
    if (CLOSED_EXEMPT_RE.test(line) || sectionExempt) return;
    if (BACKLOG_SECTION_RE.test(section)) return;   // список-хранилище: незакрытый пункт — содержание
    open.push(i + 1);
  });
  if (open.length) {
    findings.push([relPath, `документ объявляет себя ЗАКРЫТЫМ, а в теле ${open.length} невыполненн` +
      `${open.length === 1 ? 'ый пункт' : 'ых пунктов'} \`- [ ]\` (строки ${open.slice(0, 5).join(', ')}` +
      `${open.length > 5 ? ', …' : ''}) — снять критерий можно, снять его МОЛЧА нельзя (bugs/76): ` +
      'вычеркни пункт явной правкой с причиной или отметь `<!-- closed-ok: причина -->`']);
  }
}

// ── Ось «PENDING без СУДЬБЫ» (bugs/72) ───────────────────────────────────────────────────────
// Канон (`AGENT_GUIDE.md`): «Неразрешённые допущения (строки fable `PENDING:`) закрываются здесь
// же: каждое — подтверждено / опровергнуто / спрошено, ни одно не выпадает молча». Правило жило
// текстом, и шесть обязательств эпика M провисели два дня под формулировкой «вынесены в Фазу R» —
// АДРЕС выглядит судьбой, но приёмник о них не знал: слова PENDING в плане Фазы R не было вовсе.
//
// Стережётся ФОРМА маркера, а не слово (EXP-0074): `PENDING` вплотную к `:` или `→` — то есть
// живое обязательство, а не рассказ О КОНВЕНЦИИ. Слово в обратных кавычках, внутри кода и в
// строке-отрицании («PENDING нет») молчит по построению. Судьба ищется на самой строке и на
// следующей: пометка часто переносится по ширине.
const PENDING_MARK_RE = /(?<!`)\*?PENDING\*?\s*(?::|→)/u;
const PENDING_FATE_RE = /подтвержден|подтверждён|опроверг|спрошен|снят\S*\s+владельц|interviews\//iu;
const PENDING_DENIAL_RE = /PENDING[^\n]{0,40}(?:нет|не осталось)/iu;

function lintPendingFate(relPath, lines, findings) {
  const fenced = fencedMask(lines);
  const hits = [];
  lines.forEach((line, i) => {
    if (fenced[i] || insideCode(line, i)) return;
    if (!PENDING_MARK_RE.test(line) || PENDING_DENIAL_RE.test(line)) return;
    const near = [line, lines[i + 1] || ''].join(' ');
    if (PENDING_FATE_RE.test(near) || CLOSED_EXEMPT_RE.test(line)) return;
    hits.push(i + 1);
  });
  if (hits.length) {
    findings.push([relPath, `живых PENDING без СУДЬБЫ — ${hits.length} (строки ${hits.slice(0, 5).join(', ')}` +
      `${hits.length > 5 ? ', …' : ''}): у каждого обязана быть судьба — подтверждено / опровергнуто / ` +
      'спрошено (адрес интервью). «Вынесено в <фазу>» судьбой НЕ является: это адрес, и приёмник о ' +
      'нём может не знать (bugs/72)']);
  }
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
  const stampBaseline = loadStampBaseline();
  const stampDebt = [];
  let scanned = 0;
  const inScope = (rel) => {
    if (EXCLUDE_NAMES.has(rel.split('/').pop())) return false;
    if (OWNER_ORIGINALS.some((re) => re.test(rel))) return false;
    if (!all && DONE_RE.test(rel)) return false;
    return true;
  };
  // ОСЬ МЕТОК смотрит и в `_DONE_`-файлы, даже без `--all` (bugs/67). Причина не вкусовая:
  // `BUG_FIXING_FRAMEWORK.md` предписывает закрывать баг ОДНИМ действием — переименованием в
  // `NN_DONE_x.md` ВМЕСТЕ с секцией `## ✅ STATUS: DONE (дата + время)`. То есть метка закрытия
  // РОЖДАЕТСЯ уже вне дефолтного скоупа, и строка реестра пар, обещавшая сверять «метки в
  // plans/bugs/ideas/researches/interviews», по построению не смотрела в половину зеркала:
  // 114 документов из 199. Ось и так скоупится СОБСТВЕННОЙ датой метки, поэтому история молчит
  // без всякого фильтра имён.
  const inStampScope = (rel) => {
    if (EXCLUDE_NAMES.has(rel.split('/').pop())) return false;
    if (OWNER_ORIGINALS.some((re) => re.test(rel))) return false;
    return true;
  };
  // Ось меток идёт СВОИМ обходом, по своему скоупу; остальные оси — по прежнему.
  const stampPass = (rel, path) => {
    if (!inStampScope(rel)) return;
    if (inScope(rel)) return;                 // уже просканирован основным обходом
    const stampLines = readLines(path);
    lintStamps(rel, stampLines, findings);
    lintStampTruth(root, rel, stampLines, findings, stampBaseline, stampDebt);
    lintClosureVsBody(rel, stampLines, findings);
    lintPendingFate(rel, stampLines, findings);
  };
  for (const dir of FULL_DIRS) for (const f of listMd(join(root, dir))) {
    const rel = `${dir}/${f}`;
    if (!inScope(rel)) { stampPass(rel, join(root, dir, f)); continue; }
    const lines = readLines(join(root, dir, f));
    scanned++; lintFull(rel, lines, findings);
    lintGoalVector(dir, rel, lines, findings);
    lintStamps(rel, lines, findings);
    lintStampTruth(root, rel, lines, findings, stampBaseline, stampDebt);
    lintClosureVsBody(rel, lines, findings);
    lintPendingFate(rel, lines, findings);
  }
  for (const f of listMd(join(root, BUGS_DIR))) {
    const rel = `${BUGS_DIR}/${f}`;
    if (!inScope(rel)) { stampPass(rel, join(root, BUGS_DIR, f)); continue; }
    const lines = readLines(join(root, BUGS_DIR, f));
    scanned++; lintBugs(rel, lines, findings);
    lintStamps(rel, lines, findings);
    lintStampTruth(root, rel, lines, findings, stampBaseline, stampDebt);
    lintClosureVsBody(rel, lines, findings);
    lintPendingFate(rel, lines, findings);
  }
  for (const f of listMd(join(root, INTERVIEWS_DIR))) {
    const rel = `${INTERVIEWS_DIR}/${f}`;
    if (!inScope(rel)) { stampPass(rel, join(root, INTERVIEWS_DIR, f)); continue; }
    const lines = readLines(join(root, INTERVIEWS_DIR, f));
    scanned++; lintInterview(rel, lines, findings);
    lintStamps(rel, lines, findings);
    lintStampTruth(root, rel, lines, findings, stampBaseline, stampDebt);
    lintClosureVsBody(rel, lines, findings);
    lintPendingFate(rel, lines, findings);
  }
  for (const f of ROOT_DOCS) {
    const p = join(root, f);
    if (!existsSync(p)) continue;
    const lines = readLines(p);
    scanned++; lintRoot(f, lines, findings);
    lintStamps(f, lines, findings);
    lintStampTruth(root, f, lines, findings, stampBaseline, stampDebt);
    lintClosureVsBody(f, lines, findings);
    lintPendingFate(f, lines, findings);
  }
  // Конвенция имён plans/ — directory-level, вне пофайлового обхода и вне фильтра DONE.
  const planChildren = lintPlanNaming(root, findings);
  return { findings, scanned, planChildren, stampDebt };
}

function report({ findings, scanned, planChildren, stampDebt = [] }) {
  for (const [file, msg] of findings) console.log(`  ${file} — ${msg}`);
  if (stampDebt.length) {
    console.log(`ось правдивости меток (bugs/78): известный долг ${stampDebt.length} — базовая линия ` +
      'tools/doc-header-lint.stamp-baseline.json, она только УМЕНЬШАЕТСЯ; всё новое печатается поимённо выше');
  }
  console.log(`plan-naming (T2): детей эпиков ${planChildren ?? 0} — у каждого проверен родитель \`MM_EPIC_*\``);
  console.log(`doc-header-lint: scanned ${scanned}, findings ${findings.length}${findings.length
    ? ' — консультативно: поправь или оправдай на месте, старт работы не блокируется'
    : ' — all headers green'}`);
  return findings.length ? 1 : 0;
}

// Композиция N5: прогнать стоп-словарь payload-модуля по секциям требований целевых
// директорий. Вывод модуля печатается как есть (его находки несут готовое решение
// «rewrite measurably or add (justified: …)»); SKIPPED (exit 3) — не находка.
function runRequirementsDict(root) {
  console.log('— стоп-словарь требований (kaif-requirements-lint, payload-модуль) —');
  const dirs = DICT_TARGET_DIRS.filter((d) => existsSync(join(root, d)));
  if (!dirs.length) { console.log('  ⊘ нечего сканировать (нет plans/bugs/ideas)'); return 0; }
  const r = spawnSync(process.execPath, [REQ_LINT_MODULE, 'check', ...dirs], { cwd: root, encoding: 'utf8' });
  process.stdout.write((r.stdout || '') + (r.stderr || ''));
  if (r.status === EXIT_DICT_SKIPPED) return 0;
  return r.status === 0 ? 0 : 1;
}

// ── Селфтест: красный доказан на сломанной фикстуре, зелёный — на чистой (G10) ─────────────
function selftest() {
  // Корень фикстуры УНИКАЛЕН по построению (bugs/59); уборку держит сам помощник: зелёный
  // прогон каталог сносит, красный — ОСТАВЛЯЕТ и печатает путь, чтобы улику было где смотреть.
  const fx = tempRoot('doc-header-lint-fx');
  for (const d of [...FULL_DIRS, BUGS_DIR, INTERVIEWS_DIR]) mkdirSync(join(fx, d), { recursive: true });
  // Чистая blockquote-шапка для нормо-эпохных фикстур (в них ломается БЛОК, не шапка).
  const CLEAN_HEADER = '> **Создан:** 2026-08-07. **Родитель:** `plans/30`. **Статус:** в работе. **Вовне:** —.\n';
  // Сломанные (предсказание точных отказов ДО прогона):
  writeFileSync(join(fx, 'plans', '01_broken.md'),
    '# План 01 — сломанная шапка\n\n> **Создан:** без даты тут. **Статус:**\n\nтело\n');
  //   ожидаем: Создан без ISO-даты · Родитель отсутствует · Статус пусто (значение не на строке) · Вовне отсутствует = 4
  writeFileSync(join(fx, 'plans', '02_no_h1.md'), 'текст без заголовка\n');            // ожидаем: нет H1 = 1
  writeFileSync(join(fx, 'bugs', '03_bug_broken.md'), '# Bug 03 — без версии\n\n**Status:** OPEN\n'); // ожидаем: нет Version/build + нет Fix accepted when = 2
  writeFileSync(join(fx, 'interviews', 'interview_004_broken.md'), '# Interview 004\n\n> Topic: тема\n'); // ожидаем: нет Status = 1
  writeFileSync(join(fx, 'STATUS.md'), '# Статус\n## Сразу секция\n');                 // ожидаем: нет самоописания = 1
  writeFileSync(join(fx, 'plans', '26_no_vector.md'),
    '# План 26 — нормо-эпохный без блока требований\n\n' + CLEAN_HEADER + '\nтело без блоков\n');
  //   ожидаем: нет «Вектор цели» + нет «Критерии приёмки» = 2 (шапка чиста — находки только блока)
  writeFileSync(join(fx, 'ideas', '22_no_vector.md'),
    '# Идея 22 — нормо-эпохная без вектора\n\n' + CLEAN_HEADER + '\n## Суть\n\nтело\n');
  //   ожидаем: нет «Вектор цели» = 1 (у идей отдельный блок критериев не требуется)
  // Чистые (не должны дать находок):
  writeFileSync(join(fx, 'plans', '05_clean.md'),
    '# План 05 — чистая шапка\n\n> **Создан:** 2026-08-07 · по слову владельца. **Родитель:** `plans/30`.\n> **Статус:** в работе. **Вовне:** —. **Наследники:** `plans/54`.\n\nтело\n');
  writeFileSync(join(fx, 'ideas', '06_DONE_closed.md'), 'без H1 — вне дефолтного скоупа\n'); // DONE: скипается без --all
  writeFileSync(join(fx, 'plans', '27_with_block.md'),
    '# План 27 — нормо-эпохный с блоком\n\n' + CLEAN_HEADER +
    '\n## Вектор цели\n\nДостичь X, наблюдаемого прогоном Y (Achieve).\n' +
    '\n## Критерии приёмки (готово, когда)\n\n1. Сборка проходит за ≤ 60 с на референс-машине CI.\n');
  writeFileSync(join(fx, 'ideas', '23_with_vector.md'),
    '# Идея 23 — нормо-эпохная с вектором (EN-форма шаблона)\n\n' + CLEAN_HEADER +
    '\n## Goal vector — the pain it solves + how we check\n\nPain: owners re-type answers after a restart. Check: the draft survives a page restart.\n');
  // Конвенция имён plans/ (T2). Блок требований у нормо-эпохных фикстур чист, чтобы находки
  // приходили ТОЛЬКО от имени файла — иначе страж зеленел бы за чужой счёт.
  const planBody = (title) => `# ${title}\n\n` + CLEAN_HEADER +
    '\n## Вектор цели\n\nДостичь X, наблюдаемого прогоном Y (Achieve).\n' +
    '\n## Критерии приёмки (готово, когда)\n\n1. Сборка проходит за ≤ 60 с на референс-машине CI.\n';
  writeFileSync(join(fx, 'plans', '29_EPIC_clean.md'), planBody('Эпик 29 — чистый родитель'));
  writeFileSync(join(fx, 'plans', '35_epic29_phase1_ok.md'), planBody('План 35 — чистый ребёнок эпика 29'));
  //   ожидаем: 0 — родитель 29 существует и назван `29_EPIC_*`
  writeFileSync(join(fx, 'plans', '36_epic27_bad_parent.md'), planBody('План 36 — родитель есть, но не эпик'));
  //   ожидаем: 1 — план 27 в фикстуре назван `27_with_block.md`, а не `27_EPIC_*`
  writeFileSync(join(fx, 'plans', '37_epic99_orphan.md'), planBody('План 37 — родителя нет вовсе'));
  //   ожидаем: 1 — плана 99 в фикстуре не существует
  // Ось МЕТОК ВРЕМЕНИ (T8). Один файл держит ВСЕ состояния оси — и красные, и молчащие:
  // молчание проверяется здесь же, иначе страж «работает», просто краснея на всём подряд.
  writeFileSync(join(fx, 'plans', '38_epic29_stamps.md'), planBody('План 38 — метки времени') +
    '\n## Вехи\n' +
    '- ЗАКРЫТА 2026-08-09 — красная: дата после принятия канона, времени нет.\n' +
    '- принято 2026-08-09 14:30 — красная: время есть, смещения зоны нет.\n' +
    '- зафиксировано 2026-08-09 14:30 +03:00 — зелёная: полная метка.\n' +
    '- ЗАКРЫТА 2026-08-06 — МОЛЧИТ: история до порога канона, переписывать запрещено.\n' +
    '- Закрытие фазы 2026-08-09 — МОЛЧИТ: существительное, это проза о событии, не метка.\n' +
    '- T1 и T2 закрыты 2026-08-09 — МОЛЧИТ: сводка о НАБОРЕ, метка каждого стоит у него самого.\n' +
    '- зафиксировано ≈ 2026-08-09 14:30 +03:00 — зелёная: честное «≈» метку не ломает.\n' +
    // bugs/67 — формы, которых ось не видела вовсе, и формы, на которых она ложно краснела.
    '- снят 2026-08-09 — красная: глагол волны, форма из живого `ideas/24`.\n' +
    '\n> **Статус:** ✅ DONE 2026-08-09 — красная: БЕЗГЛАГОЛЬНАЯ веха в поле «Статус:»,\n' +
    '> доминирующая форма закрытия в этом репозитории (105 таких меток были невидимы).\n' +
    '\n> **Статус:** ✅ ОТВЕЧЕНО 2026-08-09 07:13–07:20 +03:00 — МОЛЧИТ: диапазон времени\n' +
    '> с одной зоной в конце — живая и законная форма.\n' +
    '\n> **Статус:** ✅ ЗАКРЫТ 2026-08-09 06:00\n' +
    '> +03:00 — МОЛЧИТ: метка ПОЛНАЯ, просто перенесена на следующую строку.\n' +
    '\n**Status:** ✅ DONE · **When/context:** найден 2026-08-09 — МОЛЧИТ: дата принадлежит\n' +
    'полю схемы `When/context:`, а канон поля схемы меткой не считает.\n' +
    '\n- формат метки — `ГГГГ-ММ-ДД ЧЧ:ММ ±ЧЧ:ММ`, и эта строка МОЛЧИТ: она говорит О ФОРМАТЕ.\n' +
    '- ЗАКРЫТА 2026-08-09 — МОЛЧИТ: изъятие на месте. <!-- t8-ok: фикстура примера, не метка -->\n' +
    '- `закрыта 2026-08-09` — МОЛЧИТ: дата внутри обратных кавычек — образец, не метка.\n');
  //   ожидаем от блока меток: 4 красных (нет времени · нет зоны · «снят» · безглагольная веха),
  //   восемь форм молчат — молчание проверяется наравне с краснотой (EXP-0059).
  // Ось «PENDING без СУДЬБЫ» (bugs/72). Один файл держит все состояния: красное — обязательство
  // с АДРЕСОМ вместо судьбы (та самая форма, что провисела два дня), и четыре формы молчания.
  writeFileSync(join(fx, 'plans', '39_epic29_pendings.md'), planBody('План 39 — судьбы допущений') +
    '\n## Решения\n' +
    '1. Место отчётов — тут. — *PENDING → приёмка эпика M.* — КРАСНАЯ: «вынесено в …» есть АДРЕС,\n' +
    '   а не судьба; приёмник о нём может не знать.\n' +
    '2. Порядок целей — такой. — *PENDING: подтверждено владельцем 2026-08-09.* — МОЛЧИТ.\n' +
    '3. Оговорки истока — оставить. — *PENDING: спрошено, interviews/interview_017.* — МОЛЧИТ.\n' +
    '4. Неразрешённых допущений (PENDING) нет: все три проверены. — МОЛЧИТ: строка-отрицание.\n' +
    '5. Строки-артефакты: `INTENT:`, `AUTH:`, `PENDING:` — МОЛЧИТ: рассказ о конвенции.\n');
  //   ожидаем: 1 красная, четыре формы молчат
  const expected = 19; // 4 + 1 + 2 + 1 + 1 + 2 + 1 + 2 (имена plans/) + 4 (метки T8) + 1 (PENDING)
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
  // Композиция со словарём: подложенное стоп-слово в секции критериев целевого документа
  // обязано быть найдено payload-модулем (структурно файл чист — краснеет только словарь).
  writeFileSync(join(fx, 'plans', '28_stopword.md'),
    '# План 28 — стоп-слово в секции критериев\n\n' + CLEAN_HEADER +
    '\n## Вектор цели\n\nДостичь состояния Z, наблюдаемого замером W.\n' +
    '\n## Критерии приёмки (готово, когда)\n\n1. Система должна работать быстро.\n');
  const dictExit = runRequirementsDict(fx);
  if (dictExit !== 1) {
    console.error(`СЕЛФТЕСТ ПРОВАЛЕН (композиция): словарь обязан найти подложенное «быстро» (exit 1), получили ${dictExit}`);
    process.exit(1);
  }
  // ── Ось ПРАВДИВОСТИ метки (bugs/78) ──────────────────────────────────────────────────────
  // Её нельзя доказать на обычной фикстуре: источник истины — git-история строки, а в каталоге
  // без репозитория `blameTimes` честно возвращает null и ось молчит. Поэтому доказательство
  // идёт в НАСТОЯЩЕМ репозитории, созданном тут же: коммит ставит момент, а метки в файле
  // объявляют один момент ДО него (законный) и один ПОСЛЕ (невозможный).
  const gitFx = tempRoot('doc-header-lint-git');
  mkdirSync(join(gitFx, 'plans'), { recursive: true });
  const git = (...a) => spawnSync('git', a, { cwd: gitFx, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'selftest@example.invalid');
  git('config', 'user.name', 'selftest');
  // Момент коммита назначается ЯВНО, а не берётся у часов: иначе проверка зависела бы от
  // скорости прогона, а «примерно сейчас» — не доказательство (детерминизм, канон-порядок).
  const COMMIT_AT = '2026-08-09T12:00:00+03:00';
  const past = '2026-08-09 11:00 +03:00';    // метка ДО своего коммита — законна всегда
  const future = '2026-08-09 12:30 +03:00';  // метка ПОСЛЕ своего коммита — невозможна
  writeFileSync(join(gitFx, 'plans', '40_EPIC_stamp_truth.md'),
    '# Эпик 40 — правдивость метки\n\n' + CLEAN_HEADER +
    '\n## Вектор цели\n\nДостичь X, наблюдаемого прогоном Y (Achieve).\n' +
    '\n## Критерии приёмки (готово, когда)\n\n1. Сборка проходит за ≤ 60 с на референс-машине CI.\n' +
    `\n## Вехи\n- зафиксировано ${past} — МОЛЧИТ: момент раньше своего коммита, это законно.\n` +
    `- зафиксировано ${future} — КРАСНАЯ: момент позже коммита, записать его было нечем.\n`);
  git('add', '-A');
  git('-c', `user.name=selftest`, 'commit', '-q', '-m', 'fixture',
    '--date', COMMIT_AT, ...['-c', `committer.date=${COMMIT_AT}`].slice(0, 0));
  // author-date задаётся флагом `--date`; committer-date — переменной окружения, но ось читает
  // ИМЕННО author-time (ребейз переписывает committer-date и краснил бы честные метки).
  const truth = run(gitFx, { all: false });
  const ahead = truth.findings.filter(([, msg]) => msg.includes('опережает СВОЙ коммит'));
  if (ahead.length !== 1) {
    console.error(`СЕЛФТЕСТ ПРОВАЛЕН (правдивость метки): ожидали 1 находку про опережение, получили ${ahead.length}`);
    for (const [f, m] of truth.findings) console.error(`   ${f} — ${m}`);
    process.exit(1);
  }
  if (!ahead[0][1].includes(future)) {
    console.error(`СЕЛФТЕСТ ПРОВАЛЕН (правдивость метки): покраснела не та метка — ${ahead[0][1]}`);
    process.exit(1);
  }
  // Вторая половина доказательства: ратчет ГЛУШИТ ровно известную метку и ничего сверх неё.
  const savedBaseline = STAMP_BASELINE;
  const debtProbe = [];
  lintStampTruth(gitFx, 'plans/40_EPIC_stamp_truth.md',
    readLines(join(gitFx, 'plans', '40_EPIC_stamp_truth.md')), [],
    new Set([`plans/40_EPIC_stamp_truth.md :: ${future}`]), debtProbe);
  if (debtProbe.length !== 1) {
    console.error(`СЕЛФТЕСТ ПРОВАЛЕН (ратчет): известная метка обязана уйти в долг, получили ${debtProbe.length}`);
    process.exit(1);
  }
  void savedBaseline;

  console.log(`selftest: ok — ${expected} предсказанных находок на сломанной фикстуре, +1 под --all, чистые файлы молчат, композиция со словарём находит стоп-слово, ось правдивости краснеет на метке ПОЗЖЕ своего коммита и молчит на более ранней, ратчет глушит ровно известную, ось PENDING краснеет на адресе вместо судьбы и молчит на четырёх законных формах`);
}

// ── Точка входа ────────────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes('--selftest')) { selftest(); }
else {
  const rootIdx = args.indexOf('--root');
  const root = rootIdx >= 0 ? args[rootIdx + 1] : process.cwd();
  const headerExit = report(run(root, { all: args.includes('--all') }));
  const dictExit = runRequirementsDict(root);
  process.exit(Math.max(headerExit, dictExit));
}
