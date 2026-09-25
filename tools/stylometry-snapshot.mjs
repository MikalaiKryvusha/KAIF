#!/usr/bin/env node
// tools/stylometry-snapshot.mjs — генератор ПУБЛИЧНОГО слепка портрета голоса владельца.
//
// Зачем (задача T12, `plans/66`; решение №60, интервью №014 Q1 = B): у KAIF должен быть свой
// `AUTHOR_STYLOMETRY.md` — но портрет снят в ПРИВАТНОМ `krinik-stylometry` и держится на дословных
// цитатах из личных корпусов владельца, а `STATUS.md` фиксирует границу: «личное творчество
// владельца в открытую поставку не едет». Владелец выбрал вариант B: **правила едут целиком,
// цитаты — нет**; доказательства берутся из его слов, УЖЕ публичных в этом репозитории, а где
// публичной замены нет — остаётся АДРЕС в приватный репозиторий.
//
// Почему это код, а не письмо модели (EXPERIENCE → EXP-0049, оплачено тремя кругами проверки):
// модель, переносящая цитату руками, молча нормализует её — теряет «ё», подменяет глифы кавычек и
// тире, съедает экранирование. Значит: рамку (шапку, объявления, реестр) пишет модель, а всё, что
// несёт правило, замер или цитату, переносит КОД побайтно.
//
// БЕЗОПАСНОСТЬ ПО УМОЛЧАНИЮ — главный инвариант этого инструмента: наружу НЕ ЕДЕТ НИ ОДНА цитата
// текста. Публикуется только то, что разрешено явно:
//   · языковой токен — ≤3 слов, без конечной пунктуации, не на строке с адресом корпуса
//     (без них правило перестаёт быть исполнимым: «пиши A вместо B» без A и B — пустая строка);
//   · спан из белого списка `allowSpans` — то, что владельцу не принадлежит (реплики ИИ) или уже
//     публично здесь;
//   · публичная цитата владельца, ВЫТЯНУТАЯ ИЗ ЭТОГО РЕПОЗИТОРИЯ по адресу `файл:строка`.
// Всё остальное схлопывается в многоточие «…» и остаётся адресуемым: адрес в приватное ядро
// сохраняется, только обезличенный — заголовок произведения тоже творчество владельца.
//
// ГРАНИЦА, НАЗВАННАЯ ВСЛУХ (bugs/66). Фильтр стережёт НОСИТЕЛИ доказательства — блок-цитату и
// спан в кавычках ЛЮБОЙ формы, включая вложенные, непарные и растянутые на несколько строк.
// Он НЕ ловит голое предложение без кавычек посреди правила: механически оно неотличимо от самого
// правила, а правила едут целиком по решению №60. Приёмка страхует этот зазор независимой осью —
// сверкой n-граммами с доказательными блоками источника, которая на кавычки не смотрит вовсе.
//
// Использование:
//   node tools/stylometry-snapshot.mjs                 # собрать AUTHOR_STYLOMETRY.md
//   node tools/stylometry-snapshot.mjs --check         # не писать: сверить слепок с источником
//   node tools/stylometry-snapshot.mjs --selftest      # доказать красный на 7 формах утечки и молчание на чистой
//   node tools/stylometry-snapshot.mjs --report <путь> # выгрузить список схлопнутых спанов на ревизию
//   node tools/stylometry-snapshot.mjs --source <путь> # другой источник (по умолчанию — ядро владельца)
//
// [TESTED: 2026-08-09 · `--selftest` зелёный: 7 форм утечки схлопнуты (ёлочки · хвост
//  многострочной · типографские · прямые · инлайн · непарная вложенность · многострочная с
//  вложенной), чистая копия молчит. Независимая ось приёмки нашла в слепке 1.0 ТРИ настоящие
//  утечки и после фикса молчит. Пересборка против побайтного эталона: 114 слов убрано, новых
//  токенов нет ни одного, кроме знака схлопывания.]

import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tempRoot } from './lib/temp-root.mjs';

const ROOT = process.cwd();
const DEFAULT_SOURCE = 'd:/work/krinik_voice/AUTHOR_STYLOMETRY.md';
const CONFIG_PATH = join(ROOT, 'tools', 'stylometry-snapshot.config.json');
const HEADER_PATH = join(ROOT, 'tools', 'stylometry-snapshot-header.md');
const HEADER_V2_PATH = join(ROOT, 'tools', 'stylometry-snapshot-header-v2.md');
const OUT_PATH = join(ROOT, 'AUTHOR_STYLOMETRY.md');

// ── Раскладка ядра 2.x (ядро голоса 2.2, 2026-09-25; эпик VO 2.8, `plans/120` шаг VO1) ───────────
// Ядро 2.x переписано целиком: правила стоят строками таблиц и пунктами, а не заголовками `### З1.`;
// рядом с ядром в хранилище живут два ПРИВАТНЫХ слоя — рабочий (формы и образцы рабочих жанров) и
// модуль прозы (дословные отрывки прозы) — и в публичный слепок не едут никогда (#103 п. 3). Раскладку
// узнаём по первой строке источника, профиль чистки — `v2` конфига (решение №60 в силе: правила едут,
// непубличные фразы владельца — нет).
// [TESTED: 2026-09-25 15:17 +03:00 · сессия 74: слепок истока собран из ядра 2.2 (`c4bbf85`) — приёмка пятью осями зелёная, `--check`
//  совпадает; `--selftest` K1–K21 зелёный; шесть мутантов краснеют ровно на адресатах K16–K21; ось 5 красная на дереве утечки `19e19ff`
//  и молчит на исправлении; путь 1.x побайтно цел (`--check` на ядре 1.2 — «совпадает»). Отчёт —
//  testcases/reports/2026-09-25_vo1-snapshot-core22.md]
const LAYOUT_V2_H1 = /^# Ядро голоса и мышления /;
const PRIVATE_LAYER_H1 = /^# (Рабочий слой|Модуль прозы) ядра голоса/;
const PRIVATE_LAYER_FILES = ['AUTHOR_STYLOMETRY_WORK.md', 'AUTHOR_STYLOMETRY_PROSE.md'];
// Образец руки автора (§2.6 ядра 2.x) — целый текст владельца БЕЗ кавычек: построчная чистка его не
// видит по построению, поэтому он судится БЛОКОМ — публичен в этом репозитории (каждая строка найдена
// кодом) или заменяется строкой-объявлением.
const SAMPLE_OPEN = /^<образец id="([^"]+)"[^>]*>\s*$/;
const SAMPLE_CLOSE = /^<\/образец>\s*$/;
const SAMPLE_PROBE_WORDS = 8;
const SAMPLE_MIN_LINE_WORDS = 5;
// Правило ядра 2.x — идентификатор в первой ячейке строки таблицы или в жирной метке пункта.
const RULE_ID_V2 = /(?:^\|\s*|^-\s*\*\*)((?:З|МШ|ГЛ|ШВ|ДК|ПР|R)\d+)(?=[\s.|·*])/gmu;

// ── Правила чистки ──────────────────────────────────────────────────────────
// Языковой токен: короткий спан без конечной пунктуации. Порог 3 слова выведен ЗАМЕРОМ по
// источнику (распределение спанов: 1 сл. — 1630, 2 — 512, 3 — 331, 4 — 202, 5 — 149, ≥6 — 772),
// и он не про длину, а про класс: четырёхсловные спаны в источнике уже бывают авторскими
// строками, а одно-трёхсловные — почти всегда служебные слова, формы и якоря правил.
const TOKEN_MAX_WORDS = 3;
const SENTENCE_PUNCT = /[.!?…]/;
// Кавычки — ЛЮБЫЕ, а не одна пара (bugs/66). Прежняя примета знала только «ёлочки», поэтому
// цитата в типографских, немецких или прямых кавычках уезжала дословно, а приёмка не могла это
// увидеть: она смотрела ТОТ ЖЕ паттерн, что и чистка. Форма здесь одна — «текст между любыми
// кавычками», и она закрывает класс целиком, а не перечислением случаев.
// Пары не разделяются намеренно: несогласованная пара («…” ) для приватности тоже цитата.
const QUOTE_OPEN = '«“„‹‘"';
const QUOTE_CLOSE = '»”“›’"';
const ANY_QUOTED = new RegExp(`([${QUOTE_OPEN}])([^${QUOTE_OPEN}${QUOTE_CLOSE}\\n]{1,600})([${QUOTE_CLOSE}])`, 'g');
// Окно независимой приёмки: восемь слов подряд — длиннее любого языкового токена (порог 3) и
// короче предложения, поэтому совпадение означает перенос ТЕКСТА, а не совпадение служебных слов.
const NGRAM_WORDS = 8;
// Ссылка на произведение корпуса: три цифры + заголовок. Заголовок обезличивается.
// Примета УЗКАЯ по левому краю: номер произведения стоит в начале имени файла, а не в середине —
// иначе под неё попадают адреса ЭТОГО репозитория (`interviews/interview_011_scope_*.md`), которые
// публичны по построению. Ложную тревогу поймала собственная приёмка на первом же прогоне.
const CORPUS_REF = /(?<![\wА-Яа-яЁё/])(\d{3})_[^\s`«»:,;)\]]*\.md/g;
// Пара «доказательство» в источнике: строка цитаты и строка адреса.
// Глиф открывающей кавычки — ЛЮБОЙ, а не одна ёлочка (круг R2, bugs/66): личная цитата в
// “типографских”, "прямых", „немецких“ или ‹одинарных угловых› открывала блок, который эта
// примета не узнавала, — и весь блок проходил мимо независимой оси приёмки. Структура блока
// («>» в начале строки) остаётся обязательной НАМЕРЕННО: она отделяет доказательство от прозы
// правила, а правила переносятся в слепок дословно по замыслу, и кормить ими ось означало бы
// красить приёмку всегда, то есть выключить её.
const EVIDENCE_QUOTE = /^>\s*[«“"„‹‚'»]/u;
const EVIDENCE_ADDR = /^>\s*—\s*`?([^`\n]+)`?\s*$/;

/** Чтение конфигурации: белый список спанов, публичные доказательства, снимаемые секции. */
function loadConfig() {
  if (!existsSync(CONFIG_PATH)) {
    return { allowSpans: [], publicEvidence: {}, dropSections: [], stopAfter: null };
  }
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
}

/** Раскладка источника: 2 — ядро 2.x (узнаётся по заголовку), 1 — портрет 1.x. */
function layoutOf(sourcePath) {
  const first = readFileSync(sourcePath, 'utf8').split(/\r?\n/, 1)[0] || '';
  return LAYOUT_V2_H1.test(first) ? 2 : 1;
}

/** Текст без переносов, отступов и маркеров цитаты — общий знаменатель поиска публичности (и оси 5). */
const normWords = (s) => s.replace(/\r?\n[ \t]*(?:>[ \t]*)*/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Профиль чистки под раскладку источника. Для 2.x — блок `v2` конфига: белый список несёт причину
 * на каждый спан, а публичность фразы и образца проверяет КОД по файлу этого репозитория — запись
 * конфига, которую файл не подтверждает, роняет сборку (fail-closed: «публично» без улики — выдумка).
 */
function effectiveConfig(cfg, sourcePath) {
  if (layoutOf(sourcePath) !== 2) return { ...cfg, layout: 1, headerPath: HEADER_PATH };
  const v2 = cfg.v2;
  if (!v2) throw new Error('источник — ядро 2.x, а в конфиге нет профиля `v2` — слепок НЕ пересобран');
  const publicSpans = Object.entries(v2.publicSpans || {});
  for (const [span, file] of publicSpans) {
    const full = join(ROOT, file);
    if (!existsSync(full) || !normWords(readFileSync(full, 'utf8')).includes(normWords(span))) {
      throw new Error(`публичность фразы не подтверждена файлом ${file}: «${span.slice(0, 60)}» — слепок НЕ пересобран`);
    }
  }
  return {
    ...cfg,
    layout: 2,
    headerPath: HEADER_V2_PATH,
    startAtHeading: v2.startAtHeading,
    dropSections: v2.dropSections || [],
    // Белый список 1.x наследуется: он пересмотрен кругами проверки слепка 1.x; записи v2 — сверх него, с причиной.
    allowSpans: [...(cfg.allowSpans || []), ...(v2.allowSpans || []).map((a) => a.span), ...publicSpans.map(([span]) => span)],
    publicSpans: publicSpans.map(([span]) => span),
    publicEvidence: {},
    publicSamples: v2.publicSamples || {},
  };
}

/**
 * Образец публичен, когда конфиг называет файл этого репозитория И каждая строка образца (от пяти слов)
 * найдена в нём первыми восемью словами. Конфиг назвал файл, а файл строку не подтвердил — отказ.
 */
function samplePublic(id, block, cfg) {
  const file = (cfg.publicSamples || {})[id];
  if (!file) return false;
  const full = join(ROOT, file);
  const hay = existsSync(full) ? normWords(readFileSync(full, 'utf8')) : '';
  for (const l of block) {
    const words = l.trim().split(/\s+/).filter(Boolean);
    if (words.length < SAMPLE_MIN_LINE_WORDS) continue;
    // строка образца сверяется ЦЕЛИКОМ (находка 8 судьи VO4: сверка первых восьми слов пропускала публичное начало с непубличным
    // продолжением); SAMPLE_PROBE_WORDS остаётся длиной цитаты в сообщении отказа
    const probe = words.slice(0, SAMPLE_PROBE_WORDS).join(' ');
    if (!hay.includes(normWords(l))) {
      throw new Error(`образец ${id} назван публичным (${file}), но строка «${probe}…» в файле не найдена — слепок НЕ пересобран`);
    }
  }
  return true;
}

/**
 * Ось 5 приёмки — фраза, которую слепок СХЛОПНУЛ как непубличную, не стоит ни в одном отслеживаемом файле
 * репозитория (кроме самого слепка). Оплачено сессией 74: отчёт шага VO0 процитировал непубличные фразы
 * владельца из ядра 2.2 и ушёл в origin (`19e19ff`) — слепок их прятал, а соседний документ публиковал.
 * Короче трёх слов не судится (частые обороты дали бы шум). `grepFn` — шов для селфтеста.
 */
const ELSEWHERE_MIN_WORDS = 3;
// Поиск идёт по СКЛЕЕННОМУ тексту файла: markdown переносит фразу на следующую строку, иногда с отступом или маркером
// цитаты `>`, и построчный `git grep` такую фразу не видит (прогон по дереву `19e19ff`: из двух процитированных фраз
// построчный поиск нашёл одну — вторая была разорвана переносом).
const TEXT_EXT = /\.(md|mjs|js|json|txt|html|yml|yaml)$/i;
let trackedCache = null;
const glue = (s) => s.replace(/\r?\n[ \t]*(?:>[ \t]*)*/g, ' ').replace(/[ \t]+/g, ' ');
function trackedTexts() {
  if (trackedCache) return trackedCache;
  const files = execFileSync('git', ['-C', ROOT, 'ls-files'], { encoding: 'utf8' }).split('\n')
    .filter((f) => f && TEXT_EXT.test(f) && f !== 'AUTHOR_STYLOMETRY.md');
  trackedCache = files.map((f) => {
    try { return { f, text: glue(readFileSync(join(ROOT, f), 'utf8')) }; } catch { return { f, text: '' }; }
  });
  return trackedCache;
}
function gitGrepFiles(span) {
  const needle = glue(span);
  return trackedTexts().filter(({ text }) => text.includes(needle)).map(({ f }) => f);
}
/** Тексты того, что едет в коммит: файлы ИНДЕКСА (новые — тоже; утечка 19e19ff сидела в новых файлах) и явно названные `--also`. */
function stagedTexts(also = []) {
  let names = [];
  try { names = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], { cwd: ROOT, encoding: 'utf8' }).split('\n'); } catch { names = []; }
  const staged = names.filter((f) => f && TEXT_EXT.test(f) && f !== 'AUTHOR_STYLOMETRY.md').map((f) => {
    try { return { f, text: glue(execFileSync('git', ['show', `:${f}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 })) }; } catch { return { f, text: '' }; }
  });
  return [...staged, ...also.filter((p) => existsSync(p)).map((p) => ({ f: basename(p), text: glue(readFileSync(p, 'utf8')) }))];
}
function leakedElsewhere(spans, grepFn = gitGrepFiles) {
  const failures = [];
  for (const span of new Set(spans)) {
    if (span.trim().split(/\s+/).filter(Boolean).length < ELSEWHERE_MIN_WORDS) continue;
    const files = grepFn(span);
    // Фраза называется sha, а не текстом (находка 5 судьи VO4: вывод оси сам уносил 40 символов непубличной фразы в отчёты и чат);
    // сам текст — в `--report <скретч>` на машине владельца.
    const id = createHash('sha256').update(span, 'utf8').digest('hex').slice(0, 12);
    if (files.length) failures.push(`непубличная фраза, схлопнутая слепком, стоит в ${files.slice(0, 3).join(', ')}: спан sha ${id} (${span.trim().split(/\s+/).length} слов; текст — в \`--report <скретч>\`, в вывод не печатается)`);
  }
  return failures;
}

/**
 * ПРИВАТНОЕ содержимое слоёв рядом с ядром 2.x — для оси n-грамм: блоки `<образец>` рабочего слоя (живые тексты
 * рабочих жанров владельца) и модуля прозы (дословная проза). Правила, которые слой пересказывает из ядра, сюда
 * не входят: они и есть ядро, и сверка с ними давала бы ложный красный (первый прогон 2.x — «слова и глифы
 * образца в свой текст не…» из §2.6). Нет слоя или в нём нет ни одного образца — приёмка не полна (fail-closed).
 */
const LAYER_SAMPLE = /<образец[^>]*>\r?\n([\s\S]*?)\r?\n<\/образец>/g;
function privateLayerTexts(sourcePath) {
  const dir = dirname(sourcePath);
  return PRIVATE_LAYER_FILES.map((f) => {
    const p = join(dir, f);
    if (!existsSync(p)) throw new Error(`приватный слой ${f} не найден рядом с ядром (${dir}) — ось против него не исполнима, слепок НЕ пересобран`);
    const samples = [...readFileSync(p, 'utf8').matchAll(LAYER_SAMPLE)].map((m) => m[1]);
    if (!samples.length) throw new Error(`в приватном слое ${f} нет ни одного блока <образец> — ось против него не исполнима, слепок НЕ пересобран`);
    return { file: f, text: samples.join('\n\n'), samples: samples.length };
  });
}

/** Разрешён ли спан к публикации без схлопывания.
 *  Порог токена судится по ОПУБЛИКОВАННОЙ форме спана (issue #20): чистка видела «NDim Space
 *  Rating» (3 слова → токен), замена имени раздувала его в «project A Space Rating» (4 слова),
 *  и красной становилась независимая приёмка, судящая уже опубликованное тело. Чистка и приёмка
 *  обязаны судить В ОДНОМ пространстве — опубликованном. */
function isPublishableSpan(span, line, allow, privateNames = []) {
  if (allow.includes(span)) return true;
  const pub = anonymizeStr(span, privateNames);
  const words = pub.trim().split(/\s+/).filter(Boolean);
  if (words.length > TOKEN_MAX_WORDS) return false;
  if (SENTENCE_PUNCT.test(pub)) return false;
  // Спан на строке с адресом корпуса — это цитата с адресом, а не токен.
  CORPUS_REF.lastIndex = 0;
  if (CORPUS_REF.test(line)) return false;
  return true;
}

// Приватные имена проектов владельца: тот же список, что кормит `tools/private-names-guard.mjs`,
// и та же честная граница — НЕТ СПИСКА, НЕТ ЗАМЕНЫ. Приватное ядро называет проекты своими
// именами по делу (правило АП22 требует называть вещи рабочими именами, и примеры в нём —
// настоящие), но слепок ПУБЛИЧЕН: имя, полезное внутри, снаружи сообщает посторонним, над чем
// владелец работает. Пять таких имён доехало до публичного слепка версии 1.0 — их нашёл не
// человек, а страж поставки, когда ему добавили эту зону.
const PRIVATE_LIST = join(ROOT, '.kaif', 'private-names.json');

function loadPrivateNames(listPath = PRIVATE_LIST, { throwOnMissing = false } = {}) {
  if (!existsSync(listPath)) {
    // Fail-closed (находка W2-2 суда W1, 2026-08-21): слепок ПУБЛИЧЕН, и отсутствие карты — не
    // «нечего заменять», а НЕВОЗМОЖНОСТЬ обезличить. Прежний тихий `return []` писал реальные
    // имена проектов владельца в публичный файл с exit 0 и зелёной приёмкой. Сверка версий на
    // чужих машинах карты не требует по построению (`--version-check` выходит раньше).
    const msg = `карта приватных имён недоступна: ${listPath} — пересборка/приёмка публичного слепка без неё запрещена (fail-closed, суд W1)`;
    if (throwOnMissing) throw new Error(msg);
    console.error(`❌ ${msg}`);
    process.exit(2);
  }
  const cfg = JSON.parse(readFileSync(listPath, 'utf8'));
  // Длинные имена раньше коротких: иначе «Unlim» съел бы начало «Unliminium».
  return Object.entries(cfg.names || {})
    .sort((a, b) => b[0].length - a[0].length)
    .map(([name, alias]) => ({
      name,
      alias,
      // В путях и составных токенах пробел ломает адрес, поэтому там едет слаг.
      slug: alias.toLowerCase().replace(/\s+/g, '-'),
      re: new RegExp(`(?<![\\p{L}\\d])${name}(?![\\p{L}\\d])`, 'giu'),
    }));
}

/**
 * ВНЕШНИЕ спаны «…» с учётом ВЛОЖЕННОСТИ. Форма `«внешний текст «токен» продолжение»` — один спан,
 * а не один вложенный: регулярное выражение здесь бессильно по построению, потому что требует
 * отсутствия кавычек внутри, и потому видит только внутренний короткий токен. Внутренний токен
 * проходит порог как разрешённый, ВНЕШНИЙ текст не матчится вовсе — и уезжает целиком.
 * Так три личные цитаты доехали до опубликованного слепка версии 1.0 (bugs/66); нашла их не
 * чистка, а независимая ось приёмки, которая на кавычки не смотрит.
 */
function guillemetRegions(line) {
  const regions = [];
  let depth = 0;
  let start = -1;
  for (let k = 0; k < line.length; k += 1) {
    const ch = line[k];
    if (ch === '«') {
      if (depth === 0) start = k;
      depth += 1;
    } else if (ch === '»' && depth > 0) {
      depth -= 1;
      if (depth === 0) regions.push([start, k]);
    }
  }
  return regions;
}

/** Замена приватных имён в одной строке — вынесена из scrubLine, потому что она нужна ещё и
 *  суждению о публикуемости (isPublishableSpan) и приёмке (расширение белого списка): все три
 *  обязаны видеть одно и то же опубликованное пространство (issue #20). */
function anonymizeStr(s, privateNames, stats = null) {
  let out = s;
  for (const p of privateNames) {
    out = out.replace(p.re, (match, offset, whole) => {
      if (stats) stats.privateNames = (stats.privateNames || 0) + 1;
      const before = whole[offset - 1] || '';
      const after = whole[offset + match.length] || '';
      const inPath = before === '/' || before === '_' || after === '/' || after === '_';
      return inPath ? p.slug : p.alias;
    });
  }
  return out;
}

/** Схлопывание неразрешённых спанов + обезличивание адресов и приватных имён. */
function scrubLine(line, allow, stats, privateNames = []) {
  // Сначала «ёлочки» сканером (вложенность), затем прочие пары — регулярным выражением.
  let out = '';
  let prev = 0;
  for (const [s, e] of guillemetRegions(line)) {
    const inner = line.slice(s + 1, e);
    out += line.slice(prev, s);
    if (inner === '…' || isPublishableSpan(inner, line, allow, privateNames)) {
      out += line.slice(s, e + 1);
    } else {
      stats.elided.push({ span: inner, line });
      out += '«…»';
    }
    prev = e + 1;
  }
  out += line.slice(prev);

  // Регулярное выражение идёт ПОСЛЕ сканера и не дублирует его, а страхует: сканер закрывает
  // вложенность, но бессилен при НЕПАРНОЙ вложенности («открыто дважды, закрыто once» — форма
  // `««текст?”»`), где глубина к нулю не возвращается и региона не возникает вовсе. Такую форму
  // ловит выражение — ровно так, как ловило до фикса. Двойной проход безопасен: уже схлопнутый
  // спан пропускается по «…», а разрешённый короткий токен вложенных длинных спанов не содержит.
  // Регрессия поймана СРАВНЕНИЕМ С ПОБАЙТНЫМ ЭТАЛОНОМ, а не чтением диффа глазами.
  out = out.replace(ANY_QUOTED, (full, open, inner, close) => {
    if (inner === '…') return full;                      // уже схлопнуто — не считать дважды
    if (isPublishableSpan(inner, line, allow, privateNames)) return full;
    stats.elided.push({ span: inner, line });
    return `${open}…${close}`;
  });
  out = out.replace(CORPUS_REF, (full, num) => {
    stats.anonymized += 1;
    return `${num}_*.md`;
  });
  return anonymizeStr(out, privateNames, stats);
}

/**
 * Публичная цитата владельца, вытянутая ИЗ ЭТОГО РЕПОЗИТОРИЯ по адресу `файл:строка`.
 * Перенос побайтный: текст берётся из файла, а не из головы модели.
 */
function pullPublicQuote(address) {
  const [file, lineNo] = address.split(':');
  const full = join(ROOT, file);
  const lines = readFileSync(full, 'utf8').split(/\r?\n/);
  const raw = lines[Number(lineNo) - 1];
  if (raw === undefined) throw new Error(`адрес вне файла: ${address}`);
  let text = raw.trim();
  // Строка интервью несёт машинный маркер контура и подпись-префикс агента — они не слово владельца.
  const mark = text.indexOf('<!-- owner-review:');
  if (mark >= 0) text = text.slice(0, mark).trim();
  text = text.replace(/^\*\*[^*]+\*\*\s*/, '').trim();
  text = text.replace(/^[-*]\s+/, '').trim();
  if (!text) throw new Error(`пустая цитата по адресу: ${address}`);
  return text;
}

/**
 * Момент снятия слепка — из git приватного ядра: коммит и его дата. Наблюдение, не память.
 * Якорь взят по САМОМУ ФАЙЛУ портрета, а не по HEAD репозитория: ядро живёт своей жизнью
 * (README, корпуса, методология), и коммит, не тронувший портрет, не имеет права объявлять
 * слепок протухшим. Оплачено сразу: правка README ядра в день рождения инструмента заставила бы
 * сверку краснеть на изменении, к портрету не относящемся.
 */
function sourceProvenance(sourcePath) {
  const dir = sourcePath.replace(/\/[^/]+$/, '');
  const file = sourcePath.replace(/^.*\//, '');

  // Версия ядра — ЕСЛИ ядро её объявляет. Выдумывать номер запрещено (правило трёх дверей):
  // до 2026-08-08 ядро версии не несло вовсе, и слепок честно писал «не объявляет».
  let version = null;
  try {
    const v = JSON.parse(readFileSync(join(dir, 'version.json'), 'utf8'));
    if (v && v.version) version = v;
  } catch {
    /* версии нет — не ошибка: слепок скажет об этом вслух */
  }

  try {
    const out = execFileSync('git', ['-C', dir, 'log', '-1', '--format=%h|%cI', '--', file], {
      encoding: 'utf8',
    }).trim();
    const [sha, date] = out.split('|');
    return { sha, date, version };
  } catch {
    return { sha: 'неизвестен', date: 'неизвестна', version };
  }
}

/** Сборка слепка. */
function build(sourcePath, cfg) {
  const src = readFileSync(sourcePath, 'utf8').split(/\r?\n/);
  // Приватный слой в роли источника — отказ ДО первой строки (#103 п. 3): рабочий слой и модуль
  // прозы не едут никуда, кроме приватных проектов автора. Узнаём по заголовку слоя и по имени файла —
  // не по упоминанию имени: само ядро называет свои слои указателем.
  if (PRIVATE_LAYER_H1.test(src[0] || '') || PRIVATE_LAYER_FILES.includes(basename(sourcePath))) {
    throw new Error(`источник — приватный слой ядра (${basename(sourcePath)}): в публичный слепок он не едет — слепок НЕ пересобран`);
  }
  const stats = { rules: 0, evidenceGroups: 0, publicQuotes: 0, elided: [], anonymized: 0, privateNames: 0, dropped: [], evidenceTails: 0,
    samplesKept: [], samplesDropped: [], keptSampleTexts: [] };
  const allow = cfg.allowSpans || [];
  const privateNames = loadPrivateNames();
  const out = [];

  // Секции, которые целиком НЕ едут: их место занимает объявление (пустых секций не бывает —
  // «нечего написать» само по себе находка и называется вслух; так велит скелет поставки).
  const drops = new Map((cfg.dropSections || []).map((d) => [d.heading, d]));

  let i = 0;
  // Шапку источника заменяем публичной: до первого заголовка, названного в конфиге как начало переноса.
  const startAt = cfg.startAtHeading;
  while (i < src.length && !src[i].startsWith(startAt)) i += 1;
  // Инвариант issue #20 («дороже самой починки»): ненайденный заголовок начала переноса — ОТКАЗ,
  // а не тихий старт с другого места. Тихий старт публикует документ, начинающийся не там, где
  // задумано, и заметить это можно только грепом вручную; молчащий страж хуже отсутствующего.
  if (startAt && i >= src.length) {
    throw new Error(`в источнике нет заголовка начала переноса: ${startAt} — слепок НЕ пересобран (сверь startAtHeading в tools/stylometry-snapshot.config.json с живым источником)`);
  }

  let skippingSection = null;
  let pendingRuleId = null;

  for (; i < src.length; i += 1) {
    const line = src[i];

    // Начало секции, снимаемой целиком.
    const dropHit = [...drops.keys()].find((h) => line.startsWith(h));
    if (dropHit) {
      const d = drops.get(dropHit);
      skippingSection = d;
      stats.dropped.push(dropHit);
      out.push(line.startsWith('## ') ? line : `## ${line.replace(/^#+\s*/, '')}`);
      out.push('');
      out.push(d.replacement);
      out.push('');
      continue;
    }
    // Конец снимаемой секции — следующий заголовок того же уровня.
    if (skippingSection) {
      if (/^## /.test(line)) skippingSection = null;
      else continue;
    }

    // Образец руки автора (ядро 2.x, §2.6) — судится БЛОКОМ: публичный в этом репозитории едет как
    // есть (имена обезличены), непубличный заменяется строкой-объявлением с адресом в приватное ядро.
    const sampleHit = cfg.layout === 2 && line.match(SAMPLE_OPEN);
    if (sampleHit) {
      const id = sampleHit[1];
      const block = [];
      let j = i + 1;
      while (j < src.length && !SAMPLE_CLOSE.test(src[j])) { block.push(src[j]); j += 1; }
      if (j >= src.length) throw new Error(`образец ${id} не закрыт — слепок НЕ пересобран`);
      out.push(scrubLine(line, allow, stats, privateNames));
      if (samplePublic(id, block, cfg)) {
        for (const b of block) out.push(anonymizeStr(b, privateNames, stats));
        stats.samplesKept.push(id);
        stats.keptSampleTexts.push(block.join(' '));
      } else {
        out.push(`«…» — непубличный текст владельца (решение №60); образец — в приватном ядре \`krinik-stylometry:AUTHOR_STYLOMETRY.md\` §2.6, ${id}`);
        stats.samplesDropped.push(id);
      }
      out.push(src[j]);
      i = j;
      continue;
    }

    // Доказательная цитата из личного корпуса — не едет. Цитата вправе занимать НЕСКОЛЬКО строк:
    // открывающая кавычка стоит на первой, закрывающая — на последней (bugs/66, форма K2). У
    // строки-продолжения нет собственной приметы — она вообще ничем не отличается от прозы, —
    // поэтому снимается она ФОРМОЙ БЛОКА: пока цитата не закрыта, каждая следующая строка
    // блок-цитаты принадлежит ей. Останавливаемся на адресе доказательства и на конце блока.
    if (EVIDENCE_QUOTE.test(line)) {
      let opens = (line.match(/«/g) || []).length;
      let closes = (line.match(/»/g) || []).length;
      while (
        opens > closes &&
        i + 1 < src.length &&
        /^>/.test(src[i + 1]) &&
        !EVIDENCE_ADDR.test(src[i + 1])
      ) {
        i += 1;
        opens += (src[i].match(/«/g) || []).length;
        closes += (src[i].match(/»/g) || []).length;
        stats.evidenceTails += 1;
      }
      continue;
    }

    // Адрес доказательства — едет обезличенным, как ссылка в приватное ядро.
    const addrHit = line.match(EVIDENCE_ADDR);
    if (addrHit) {
      const addr = scrubLine(addrHit[1].trim(), allow, stats, privateNames).replace(/`/g, '');
      stats.evidenceGroups += 1;
      out.push(`> — доказательство в приватном ядре: \`krinik-stylometry:${addr}\``);
      continue;
    }

    // Заголовок правила: запоминаем идентификатор, чтобы подставить публичное доказательство.
    const ruleHit = line.match(/^###\s+([A-ZА-ЯЁ]{1,2}\d+|R0)\./);
    if (ruleHit) {
      stats.rules += 1;
      pendingRuleId = ruleHit[1];
      out.push(scrubLine(line, allow, stats, privateNames));
      const ev = (cfg.publicEvidence || {})[pendingRuleId];
      if (ev && ev.length) {
        out.push('');
        out.push('**Доказательство — публичные слова владельца в этом репозитории:**');
        for (const address of ev) {
          const text = pullPublicQuote(address);
          stats.publicQuotes += 1;
          out.push('');
          out.push(`> «${text}»`);
          out.push(`> — \`${address}\``);
        }
      }
      continue;
    }

    out.push(scrubLine(line, allow, stats, privateNames));
  }

  // Схлопываем подряд идущие пустые строки, оставшиеся после вырезанных цитат.
  const compact = [];
  for (const l of out) {
    if (l.trim() === '' && compact.length && compact[compact.length - 1].trim() === '') continue;
    compact.push(l);
  }

  // ВТОРОЙ ПРОХОД — цитаты, растянутые на НЕСКОЛЬКО строк. Построчная чистка их не видит по
  // построению (спан открыт на одной строке, закрыт на другой), и именно этот класс поймала
  // приёмка на первом же прогоне. Многострочный спан — всегда цитата текста, никогда не токен:
  // языковое слово в перенос строки не уходит.
  // ВТОРОЙ ПРОХОД — цитаты, растянутые на НЕСКОЛЬКО строк. Построчная чистка их не видит по
  // построению (спан открыт на одной строке, закрыт на другой). Границей спана служит АБЗАЦ:
  // кавычка не переживает пустую строку, а абзац ограничивает ущерб, если в источнике оказалась
  // непарная кавычка. Сканер тот же, что и построчно, — то есть вложенность учитывается и здесь
  // (форма «многострочная И с вложенной» — последняя из трёх утечек, доехавших до слепка 1.0).
  // Публичные цитаты владельца из ЭТОГО репозитория разрешены поимённо: их вставил код по адресу.
  const publicTexts = [];
  for (const list of Object.values(cfg.publicEvidence || {})) {
    for (const a of list) publicTexts.push(pullPublicQuote(a));
  }
  const allowMulti = [...allow, ...publicTexts];

  const paragraphs = [];
  let para = [];
  for (const l of compact) {
    if (l.trim() === '') { paragraphs.push(para); paragraphs.push(null); para = []; continue; }
    para.push(l);
  }
  paragraphs.push(para);

  const rebuilt = [];
  for (const p of paragraphs) {
    if (p === null) { rebuilt.push(''); continue; }
    if (!p.length) continue;
    const text = p.join('\n');
    const regions = guillemetRegions(text).filter(([s, e]) => text.slice(s, e).includes('\n'));
    if (!regions.length) { rebuilt.push(text); continue; }
    let outP = '';
    let prev = 0;
    for (const [s, e] of regions) {
      const inner = text.slice(s + 1, e);
      outP += text.slice(prev, s);
      if (inner === '…' || isPublishableSpan(inner.replace(/\s+/g, ' '), text, allowMulti)) {
        outP += text.slice(s, e + 1);
      } else {
        stats.elided.push({ span: inner.replace(/\s+/g, ' '), line: '(многострочная цитата)' });
        outP += '«…»';
      }
      prev = e + 1;
    }
    outP += text.slice(prev);
    rebuilt.push(outP);
  }
  let body = rebuilt.join('\n');

  // Ядро 2.x: правило — идентификатор в первой ячейке строки таблицы или в жирной метке пункта.
  if (cfg.layout === 2) stats.rules = new Set([...body.matchAll(RULE_ID_V2)].map((m) => m[1])).size;

  // srcLines едут наружу вместе со сборкой: приёмке нужен ТОТ ЖЕ исходник, из которого собран
  // слепок, а второе чтение файла завело бы вторую истину (круг R2: боевой вызов приёмки
  // третьего аргумента не получал вовсе, и независимая ось молча не исполнялась).
  return { body, stats, srcLines: src };
}

/** Слова текста без разметки блок-цитаты и без кавычек — общий знаменатель для сверки n-граммами. */
function wordsOf(text) {
  return text
    .replace(/^>\s*/gm, ' ')
    .replace(new RegExp(`[${QUOTE_OPEN}${QUOTE_CLOSE}]`, 'g'), ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

/**
 * Тексты доказательных блоков ИСТОЧНИКА, взятые БЛОКОМ: от строки, открывающей цитату, до адреса
 * доказательства. Это ВТОРОЙ взгляд на вопрос «что не должно уехать», и он намеренно устроен
 * иначе, чем чистка: чистка идёт построчно и опирается на глифы, этот — на границы блока и не
 * смотрит на кавычки вовсе. Разъезд двух взглядов и есть то, что ловит приёмка (bugs/66: прежняя
 * приёмка делила слепое пятно с чисткой и потому не могла увидеть её промах).
 */
// Пустая строка ВНУТРИ блока не закрывает его (круг R2, bugs/66): цитата, у которой открывающая
// кавычка стоит до пустой строки, а продолжение после неё, прежде теряла ВСЁ продолжение —
// первая половина уходила в чанк, вторая не начинала новый (она открывается не кавычкой) и
// пропадала из поля зрения оси совсем. Терпим ровно ОДНУ пустую строку: две подряд в markdown
// уже разделяют смысловые блоки, и склеивать через них значило бы кормить ось текстом правил.
const MAX_BLANK_INSIDE_BLOCK = 1;
function evidenceChunksFromSource(srcLines) {
  const chunks = [];
  let cur = null;
  let blanks = 0;
  for (const l of srcLines) {
    if (EVIDENCE_QUOTE.test(l)) {
      if (cur) chunks.push(cur.join(' '));
      cur = [l];
      blanks = 0;
      continue;
    }
    if (!cur) continue;
    if (/^\s*$/.test(l)) {
      if (++blanks > MAX_BLANK_INSIDE_BLOCK) { chunks.push(cur.join(' ')); cur = null; blanks = 0; }
      continue;
    }
    if (/^>/.test(l) && !EVIDENCE_ADDR.test(l)) { cur.push(l); blanks = 0; continue; }
    chunks.push(cur.join(' '));
    cur = null;
    blanks = 0;
  }
  if (cur) chunks.push(cur.join(' '));
  return chunks;
}

/**
 * Приёмка собранного: доказать, что личное НЕ протекло. Красный — стоп, не предупреждение.
 * Три оси; третья не зависит от глифов кавычек и потому переживает появление новой их формы.
 */
function selfCheck(body, allow, srcLines = null, layers = []) {
  const failures = [];
  // 4. (ядро 2.x) Ни одно окно из восьми слов ПРИВАТНОГО СЛОЯ (рабочий слой, модуль прозы) не
  //    встречается в слепке, кроме разрешённого (белый список, публичные образцы). Ось не смотрит ни
  //    на кавычки, ни на блоки — она ловит слой, вставленный в ядро голым текстом, где чистка слепа.
  if (layers.length) {
    const bw = wordsOf(body);
    const bodyGrams = new Set();
    for (let k = 0; k + NGRAM_WORDS <= bw.length; k += 1) bodyGrams.add(bw.slice(k, k + NGRAM_WORDS).join(' '));
    const allowedText = wordsOf(allow.join('\n')).join(' ');
    for (const { file, text } of layers) {
      const lw = wordsOf(text);
      for (let k = 0; k + NGRAM_WORDS <= lw.length; k += 1) {
        const gram = lw.slice(k, k + NGRAM_WORDS).join(' ');
        if (!bodyGrams.has(gram) || allowedText.includes(gram)) continue;
        failures.push(`фрагмент приватного слоя ${file} в слепке: «${gram.slice(0, 70)}…»`);
        break;
      }
    }
  }
  // 1. Ни одного заголовка произведения в адресах (примета та же, что у чистки — узкая по левому краю).
  const titled = body.match(/(?<![\wА-Яа-яЁё/])\d{3}_[a-zа-яё][^\s`«»:,;)\]]*\.md/gi);
  if (titled) failures.push(`адрес с заголовком произведения: ${[...new Set(titled)].slice(0, 3).join(', ')}`);
  // 2. Ни одного неразрешённого спана-цитаты — в кавычках ЛЮБОЙ формы, «ёлочки» с вложенностью.
  const spans = [];
  for (const line of body.split('\n')) {
    for (const [s, e] of guillemetRegions(line)) spans.push(line.slice(s + 1, e));
    for (const m of line.matchAll(ANY_QUOTED)) {
      if (m[1] !== '«' && m[3] !== '»') spans.push(m[2]);
    }
  }
  for (const inner of spans) {
    if (inner === '…') continue;
    if (allow.includes(inner)) continue;
    const words = inner.trim().split(/\s+/).filter(Boolean);
    if (words.length > TOKEN_MAX_WORDS || SENTENCE_PUNCT.test(inner)) {
      // Публичные цитаты владельца из этого репозитория живут в блоках `> «…»` со своим адресом.
      failures.push(`неразрешённый спан: «${inner.slice(0, 60)}»`);
    }
  }
  // 3. НЕЗАВИСИМАЯ ось: ни одно окно из восьми слов подряд, принадлежащее доказательному блоку
  //    источника, не встречается в слепке. Работает и там, где кавычек нет вовсе, — то есть
  //    ловит ту форму, которую чистка по построению увидеть не может.
  if (srcLines) {
    const bodyGrams = new Set();
    const bw = wordsOf(body);
    for (let k = 0; k + NGRAM_WORDS <= bw.length; k += 1) {
      bodyGrams.add(bw.slice(k, k + NGRAM_WORDS).join(' '));
    }
    const allowedText = allow.join('\n');
    const seen = new Set();
    for (const chunk of evidenceChunksFromSource(srcLines)) {
      const cw = wordsOf(chunk);
      for (let k = 0; k + NGRAM_WORDS <= cw.length; k += 1) {
        const gram = cw.slice(k, k + NGRAM_WORDS).join(' ');
        if (!bodyGrams.has(gram) || seen.has(gram)) continue;
        if (allowedText.includes(gram)) continue;   // разрешённый спан / публичная цитата из этого репо
        seen.add(gram);
        failures.push(`текст доказательства уехал дословно: «${gram.slice(0, 70)}…»`);
        break;
      }
    }
  }
  return failures;
}

/**
 * Сверка версий (решение №62, интервью №014 Q3 = B): КОНСТАТИРОВАТЬ расхождение слепка и ядра —
 * и НИЧЕГО не требовать. Обновление идёт только по явному слову владельца, в обе стороны, поэтому
 * код возврата здесь ВСЕГДА 0: красный гейт противоречил бы его модели («по моему явному
 * требованию»), а молчаливое отставание — тот класс, который проект уже оплатил дважды
 * (bugs/09, bugs/49). Ровно одна строка, затем инструмент замолкает.
 */
function versionCheck(sourcePath) {
  if (!existsSync(OUT_PATH)) {
    console.log('стилометрия: слепка нет в репозитории — сверка версий пропущена');
    return;
  }
  const snap = readFileSync(OUT_PATH, 'utf8');
  const snapSha = (snap.match(/Коммит источника `([0-9a-f]+)`/) || [])[1];

  if (!existsSync(sourcePath)) {
    console.log(
      `стилометрия: слепок с \`${snapSha || 'неизвестно'}\`, приватное ядро недоступно на этой машине — ` +
        'сверка версий пропущена (это норма, а не поломка)'
    );
    return;
  }
  const live = sourceProvenance(sourcePath);
  if (!snapSha || snapSha === live.sha) {
    console.log(`стилометрия: слепок совпадает с ядром (\`${live.sha}\`)`);
    return;
  }
  // Насколько ушло ядро — считаем коммиты, но НИЧЕГО не требуем.
  let ahead = '';
  try {
    const dir = sourcePath.replace(/\/[^/]+$/, '');
    const file = sourcePath.replace(/^.*\//, '');
    // Счёт — тоже ТОЛЬКО по портрету: сколько раз он менялся с момента слепка.
    const n = execFileSync('git', ['-C', dir, 'rev-list', '--count', `${snapSha}..HEAD`, '--', file], {
      encoding: 'utf8',
    }).trim();
    if (n && n !== '0') ahead = `, ядро ушло вперёд на ${n} коммит(ов)`;
  } catch {
    /* история недоступна — строка остаётся без счёта */
  }
  console.log(
    `стилометрия: слепок с \`${snapSha}\`, ядро на \`${live.sha}\`${ahead} — ` +
      'обновление слепка только по слову владельца (решение №62); ничего не требуется'
  );
}

/**
 * `--selftest` — доказать, что приёмка умеет КРАСНЕТЬ на каждой форме утечки и МОЛЧАТЬ на чистой
 * копии (EXP-0059: свойство без своей мутации не защищено ничем). Канарейки подсаживаются в КОПИЮ
 * приватного источника во временном корне; рабочее дерево и сам слепок не трогаются.
 *
 * Формы взяты из волны bugs/66 дословно, а не обобщением (EXP-0074): именно они уехали.
 */
const CANARIES = [
  {
    id: 'K1-ёлочки',
    lines: ['> «KANARYONE он шёл по улице и думал о ней долго и мучительно, а город молчал.»'],
  },
  {
    id: 'K2-хвост многострочной',
    lines: [
      '> «KANARYTWO он шёл по улице и думал о ней долго и мучительно, а хвост этой',
      '> цитаты лёг на следующую строку и прежде оставался снаружи фильтра.»',
    ],
  },
  {
    id: 'K3-типографские кавычки',
    lines: ['Иллюстрация: “KANARYTHREE он шёл по улице и думал о ней долго и мучительно”.'],
  },
  {
    id: 'K4-прямые кавычки',
    lines: ['Иллюстрация: "KANARYFOUR он шёл по улице и думал о ней долго и мучительно".'],
  },
  {
    id: 'K5-инлайн в прозе',
    lines: ['Иллюстрация: «KANARYFIVE он шёл по улице и думал о ней долго и мучительно».'],
  },
  {
    // Найдена не ревизором, а сверкой пересборки с побайтным эталоном: сканер вложенности её
    // пропускал, потому что глубина не возвращается к нулю. Форма живая — она есть в источнике.
    id: 'K6-непарная вложенность',
    lines: ['Иллюстрация: ««KANARYSIX он шёл по улице и думал о ней долго и мучительно?”»'],
  },
  {
    // Многострочная в обычной прозе (не в блок-цитате) И с вложенной внутри — последняя из трёх
    // форм, реально доехавших до опубликованного слепка 1.0.
    id: 'K7-многострочная с вложенной',
    lines: [
      'Иллюстрация: «KANARYSEVEN он шёл по улице и думал о ней долго и мучительно,',
      'а город молчал и «молчал» ещё громче».',
    ],
  },
  // ── K8–K13: шесть форм, на которых круг R2 доказал ЖИВУЮ утечку ────────────────────────────
  // Все шесть — блок-цитаты доказательства, то есть носитель, объявленный классом фильтра. Они
  // проходили молча по двум независимым причинам, и обе теперь закрыты: примета блока узнавала
  // единственный глиф открывающей кавычки (K8–K11), а пустая строка внутри блока обрывала его и
  // уносила продолжение цитаты из поля зрения оси (K12). Каждая живёт ЗДЕСЬ, а не в скретчпаде
  // сессии: проверка, умирающая вместе с сессией, — это отсутствие проверки (EXP-0016).
  {
    id: 'K8-блок в типографских',
    lines: [
      '> “KANARYEIGHT он шёл по улице и думал о ней долго и мучительно, а город',
      '> молчал и не отвечал ему совершенно ничего в тот самый долгий вечер”',
      '> — `корпус/проза/901_канарейка.md:1`',
    ],
  },
  {
    id: 'K9-блок в прямых',
    lines: [
      '> "KANARYNINE он шёл по улице и думал о ней долго и мучительно, а город',
      '> молчал и не отвечал ему совершенно ничего в тот самый долгий вечер"',
      '> — `корпус/проза/902_канарейка.md:1`',
    ],
  },
  {
    id: 'K10-блок в немецких',
    lines: [
      '> „KANARYTEN он шёл по улице и думал о ней долго и мучительно, а город',
      '> молчал и не отвечал ему совершенно ничего в тот самый долгий вечер“',
      '> — `корпус/проза/903_канарейка.md:1`',
    ],
  },
  {
    id: 'K11-блок в одинарных угловых',
    lines: [
      '> ‹KANARYELEVEN он шёл по улице и думал о ней долго и мучительно, а город',
      '> молчал и не отвечал ему совершенно ничего в тот самый долгий вечер›',
      '> — `корпус/проза/904_канарейка.md:1`',
    ],
  },
  {
    id: 'K12-блок, разорванный ПУСТОЙ строкой',
    lines: [
      '> «KANARYTWELVE он шёл по улице и думал о ней долго и мучительно, а город',
      '',
      '> молчал и не отвечал ему совершенно ничего в тот самый долгий вечер»',
      '> — `корпус/проза/905_канарейка.md:1`',
    ],
  },
  {
    // Баланс ёлочек сходится ещё на первой строке (внутренняя закрывающая), и весь хвост блока
    // прежде шёл дальше обычной прозой — то есть уезжал дословно.
    id: 'K13-баланс сходится на первой строке',
    lines: [
      '> «KANARYTHIRTEEN он сказал «да» и это было единственное слово за вечер»',
      '> а дальше пошёл личный текст, который уже никакими кавычками не закрыт и',
      '> тянется ещё на одну длинную строку, чтобы окно из восьми слов состоялось',
      '> — `корпус/проза/906_канарейка.md:1`',
    ],
  },
];

/** Строки таблицы §8 (разбор линтера голоса: строка, открытая ячейкой паттерна). */
const section8Rows = (text) => {
  const at = text.search(/^## 8\. /m);
  if (at < 0) return [];
  const rest = text.slice(at);
  const end = rest.slice(4).search(/^## /m);
  return (end < 0 ? rest : rest.slice(0, end + 4)).split('\n').filter((l) => /^\|\s*`\//.test(l));
};

/** Селфтест форм 2.x. Каждая форма — своя мутация КОПИИ источника во временном корне; число красных — в ответе. */
function selfTestV2(sourcePath, cfg, root, src, at) {
  let red = 0;
  const ok = (cond, id, what) => {
    if (cond) console.log(`✅ селфтест: ${id} — ${what}`);
    else { console.error(`❌ селфтест: ${id} — ${what}: НЕ выполнено`); red += 1; }
  };
  const layers = privateLayerTexts(sourcePath);
  const privNames = loadPrivateNames();
  const allowAll = (b) => [...new Set([...cfg.allowSpans, ...b.stats.keptSampleTexts, ...cfg.allowSpans.map((a) => anonymizeStr(a, privNames))])];

  // K16 — непубличный образец §2.6 не едет: на его месте строка-объявление.
  const k16 = join(root, 'k16', 'AUTHOR_STYLOMETRY.md');
  mkdirSync(dirname(k16), { recursive: true });
  const sample = ['', '<образец id="ОБ99" жанр="проба">', 'KANARYSAMPLE он шёл по улице и думал о ней долго и мучительно, а город молчал', '</образец>'];
  writeFileSync(k16, [...src.slice(0, at + 1), ...sample, ...src.slice(at + 1)].join('\n'), 'utf8');
  const b16 = build(k16, cfg);
  ok(!b16.body.includes('KANARYSAMPLE') && b16.stats.samplesDropped.includes('ОБ99'), 'K16-непубличный образец', 'снят, на месте — объявление');

  // K17 — приватный слой в роли источника: отказ по имени файла и по заголовку слоя.
  const k17a = join(root, 'k17', 'AUTHOR_STYLOMETRY_WORK.md');
  const k17b = join(root, 'k17', 'layer-renamed.md');
  mkdirSync(dirname(k17a), { recursive: true });
  writeFileSync(k17a, src.join('\n'), 'utf8');
  writeFileSync(k17b, ['# Рабочий слой ядра голоса проба', ...src.slice(1)].join('\n'), 'utf8');
  const refused = (p) => { try { build(p, cfg); return false; } catch { return true; } };
  ok(refused(k17a) && refused(k17b), 'K17-слой как источник', 'отказ и по имени файла, и по заголовку слоя');

  // K18 — образец приватного слоя, вставленный в ядро ГОЛЫМ текстом (без кавычек и без блока): ось 4 краснеет.
  const layerWords = layers[0].text.replace(/\s+/g, ' ').trim().split(' ').slice(0, 16).join(' ');
  const k18 = join(root, 'k18', 'AUTHOR_STYLOMETRY.md');
  mkdirSync(dirname(k18), { recursive: true });
  writeFileSync(k18, [...src.slice(0, at + 1), '', `Иллюстрация без кавычек: ${layerWords}`, ...src.slice(at + 1)].join('\n'), 'utf8');
  const b18 = build(k18, cfg);
  const f18 = selfCheck(b18.body, allowAll(b18), b18.srcLines, layers);
  ok(f18.some((f) => f.startsWith('фрагмент приватного слоя')), 'K18-слой голым текстом', 'ось приватных слоёв краснеет');

  // K19 — таблица §8 едет побайтно (после обезличивания имён), строка к строке.
  const clean = build(sourcePath, cfg);
  const srcRows = section8Rows(src.join('\n')).map((l) => anonymizeStr(l, privNames));
  const bodyRows = section8Rows(clean.body);
  ok(srcRows.length > 0 && JSON.stringify(srcRows) === JSON.stringify(bodyRows), 'K19-таблица §8', `${bodyRows.length} строк побайтно`);

  // K20 — «публично» без улики: фраза, которой нет в названном файле, и образец, чья строка не найдена, — отказ.
  let k20a = false;
  try { effectiveConfig({ ...loadConfig(), v2: { ...loadConfig().v2, publicSpans: { 'KANARYPUBLIC такой фразы нет ни в одном файле': 'GOAL.md' } } }, sourcePath); }
  catch { k20a = true; }
  let k20b = false;
  try { samplePublic('ОБ98', ['KANARYPUBLIC строка образца которой нет в файле вовсе'], { publicSamples: { 'ОБ98': 'GOAL.md' } }); }
  catch { k20b = true; }
  ok(k20a && k20b, 'K20-публичность без улики', 'отказ и для фразы, и для образца');
  // K20c — строка образца с ПУБЛИЧНЫМ началом (первые восемь слов стоят в GOAL.md) и непубличным продолжением — отказ (находка 8 судьи VO4)
  const goalStart = readFileSync(join(ROOT, 'GOAL.md'), 'utf8').split(/\r?\n/)[0].trim().split(/\s+/).slice(0, 10).join(' ');
  let k20c = false;
  try { samplePublic('ОБ97', [`${goalStart} KANARYTAIL непубличное продолжение строки образца`], { publicSamples: { 'ОБ97': 'GOAL.md' } }); }
  catch { k20c = true; }
  ok(k20c, 'K20c-публичное начало строки образца', 'непубличное продолжение не проходит сверку первыми словами');

  // K21 — схлопнутая фраза стоит в другом файле репозитория (класс утечки 19e19ff): ось 5 краснеет, без находки — молчит.
  const hit = leakedElsewhere(['KANARYELSEWHERE фраза владельца в чужом отчёте'], () => ['testcases/reports/проба.md']);
  const miss = leakedElsewhere(['KANARYELSEWHERE фраза владельца в чужом отчёте'], () => []);
  ok(hit.length === 1 && miss.length === 0, 'K21-утечка рядом', 'находка краснеет, чистота молчит');
  // находка называет фразу sha, никогда текстом (находка 5 судьи VO4 — вывод оси не должен сам уносить фразу)
  ok(hit.length === 1 && !hit[0].includes('KANARYELSEWHERE') && /спан sha [0-9a-f]{12}/.test(hit[0]), 'K21-находка без текста', 'фраза названа sha, её текста в выводе нет');

  // Чистая копия 2.x — все пять осей молчат.
  const cleanFail = selfCheck(clean.body, allowAll(clean), clean.srcLines, layers);
  ok(cleanFail.length === 0, 'K16–K21 чистая копия 2.x', `приёмка молчит${cleanFail.length ? ' (' + cleanFail[0] + ')' : ''}`);
  return red;
}

function selfTest(sourcePath, cfg) {
  if (!existsSync(sourcePath)) {
    console.error(`селфтест: приватное ядро недоступно (${sourcePath}) — доказать нечего.`);
    console.error('Это НЕ зелёный: без источника инструмент не проверяется. Запусти на машине владельца.');
    process.exit(2);
  }
  const src = readFileSync(sourcePath, 'utf8').split(/\r?\n/);
  const at = src.findIndex((l) => l.startsWith(cfg.startAtHeading));
  if (at < 0) throw new Error(`в источнике нет заголовка начала переноса: ${cfg.startAtHeading}`);

  const root = tempRoot('sty-selftest');
  const mutant = join(root, 'source-with-canaries.md');
  const inject = CANARIES.flatMap((c) => ['', ...c.lines]);
  writeFileSync(mutant, [...src.slice(0, at + 1), ...inject, ...src.slice(at + 1)].join('\n'), 'utf8');

  let red = 0;
  const built = build(mutant, cfg);
  for (const c of CANARIES) {
    // Улика канарейки — её собственный маркер: он не может прийти ниоткуда ещё.
    const marker = c.lines.join(' ').match(/KANARY[A-Z]+/)[0];
    const leaked = built.body.includes(marker) && !built.body.includes(`${marker} …`);
    // Строгая проверка: маркер вправе уцелеть только если ВЕСЬ хвост фразы схлопнут.
    const tailLeaked = /KANARY[A-Z]+ он шёл по улице/.test(built.body.slice(built.body.indexOf(marker)));
    if (built.body.includes(marker) && tailLeaked) {
      console.error(`❌ селфтест: ${c.id} — текст уехал в слепок дословно`);
      red += 1;
    } else {
      console.log(`✅ селфтест: ${c.id} — схлопнуто${leaked ? '' : ' (маркер снят целиком)'}`);
    }
  }

  // Вторая половина доказательства: на ЧИСТОЙ копии приёмка обязана молчать (EXP-0064: страж,
  // который не умеет молчать, — не страж, а генератор шума).
  const clean = build(sourcePath, cfg);
  const publicTexts = [];
  for (const list of Object.values(cfg.publicEvidence || {})) {
    for (const a of list) publicTexts.push(pullPublicQuote(a));
  }
  // То же расширение белого списка обезличенными вариантами, что и в боевой приёмке (issue #20).
  const stRaw = [...(cfg.allowSpans || []), ...publicTexts];
  const stPriv = loadPrivateNames();
  const cleanFailures = selfCheck(clean.body,
    [...new Set([...stRaw, ...stRaw.map((a) => anonymizeStr(a, stPriv))])],
    readFileSync(sourcePath, 'utf8').split(/\r?\n/));
  if (cleanFailures.length) {
    console.error(`❌ селфтест: чистая копия — приёмка КРАСНАЯ (${cleanFailures.length}):`);
    for (const f of cleanFailures.slice(0, 5)) console.error(`   · ${f}`);
    red += 1;
  } else {
    console.log('✅ селфтест: чистая копия — приёмка молчит');
  }

  // K14 (W2-2 суда W1): отсутствие карты приватных имён — ОТКАЗ, не тихий проход. Прежний
  // fail-open (`return []`) писал реальные имена в публичный слепок с exit 0.
  let mapMissingRefused = false;
  try { loadPrivateNames(join(root, 'no-such-map.json'), { throwOnMissing: true }); }
  catch { mapMissingRefused = true; }
  if (mapMissingRefused) {
    console.log('✅ селфтест: K14-нет-карты-имён — отказ (fail-closed)');
  } else {
    console.error('❌ селфтест: K14 — карта имён отсутствует, а загрузка прошла молча (fail-open)');
    red += 1;
  }

  // K15 (W2-4 суда W1): приёмочная половина фикса #20 — расширение белого списка обезличенными
  // вариантами — доказывает себя мутацией: БЕЗ расширения легальный спан, чьё тело уже несёт
  // алиас, обязан краснеть; с расширением — молчать. Зелёный «с» при зелёном «без» = театр.
  const nm = stPriv[0]; // карта гарантирована: K14 выше держит fail-closed
  if (!nm) {
    console.error('❌ селфтест: K15 — карта имён пуста, расширение белого списка недоказуемо');
    process.exit(1);
  }
  const rawSpan = `${nm.name} проверочный спан приёмки суда версии`;
  const bodyLine = `Иллюстрация: «${anonymizeStr(rawSpan, stPriv)}».`;
  const withExt = selfCheck(bodyLine, [rawSpan, anonymizeStr(rawSpan, stPriv)]);
  const withoutExt = selfCheck(bodyLine, [rawSpan]);
  if (withExt.length === 0 && withoutExt.length > 0) {
    console.log('✅ селфтест: K15-белый-список — расширение обезличенными работает (без него легальный спан краснеет)');
  } else {
    console.error(`❌ селфтест: K15 — расширение белого списка не доказывает себя (с расширением: ${withExt.length}, без: ${withoutExt.length})`);
    red += 1;
  }

  // ── K16–K21: формы раскладки 2.x (ядро голоса 2.2; эпик VO 2.8, plans/120 шаг VO1) ───────────────
  if (cfg.layout === 2) red += selfTestV2(sourcePath, cfg, root, src, at);

  if (red) {
    console.error(`\n❌ селфтест красный: ${red} проверок(и). Корень прогона оставлен: ${root}`);
    process.exit(1);
  }
  rmSync(root, { recursive: true, force: true });
  console.log(`\n✅ селфтест зелёный: ${CANARIES.length} форм утечки схлопнуты, чистая копия молчит`);
  console.log('   ГРАНИЦА, названная вслух: фильтр стережёт НОСИТЕЛИ доказательства — блок-цитату');
  console.log('   и спан в кавычках любой формы. Голое предложение без кавычек посреди правила');
  console.log('   механически неотличимо от самого правила, а правила едут целиком по решению №60.');
}

// ── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const srcIdx = args.indexOf('--source');
const sourcePath = srcIdx >= 0 ? args[srcIdx + 1] : DEFAULT_SOURCE;
// `--leak-only` — ось 5 для преполёта коммита (1d tools/commit.mjs): только утечка, без пересборки слепка; приватного ядра нет на
// машине — SKIPPED=3 вслух (ось стоит только там, где живут схлопнутые фразы), коммит решает сам.
const LEAK_ONLY = args.includes('--leak-only');
const ALSO = args.flatMap((a, i) => (a === '--also' && args[i + 1] ? [args[i + 1]] : []));
if (LEAK_ONLY && !existsSync(sourcePath)) {
  console.log(`SKIPPED=3 — ось утечки не исполнена: приватного ядра голоса нет на этой машине (${sourcePath}); непубличные фразы здесь некому схлопывать`);
  process.exit(3);
}

// Сверка версий обязана работать и БЕЗ приватного источника — она для чужих машин тоже.
if (args.includes('--version-check')) {
  versionCheck(sourcePath);
  process.exit(0);
}

if (!existsSync(sourcePath)) {
  console.error(`источник недоступен: ${sourcePath}`);
  console.error('Слепок собирается из приватного ядра владельца; без него пересборка невозможна.');
  process.exit(2);
}

let cfg;
try {
  cfg = effectiveConfig(loadConfig(), sourcePath);
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(2);
}

if (args.includes('--selftest')) {
  selfTest(sourcePath, cfg);
  process.exit(0);
}

let built;
let layers = [];
try {
  built = build(sourcePath, cfg);
  if (cfg.layout === 2) layers = privateLayerTexts(sourcePath);
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(2);
}
const { body, stats, srcLines } = built;
if (LEAK_ONLY) {
  if (cfg.layout !== 2) { console.log('SKIPPED=3 — ось утечки только для раскладки 2.x (у слепка 1.x её нет — GAP назван в приёмке)'); process.exit(3); }
  const spans = stats.elided.map((e) => e.span);
  const texts = stagedTexts(ALSO);
  const leaks = leakedElsewhere(spans, (span) => { const needle = glue(span); return texts.filter(({ text }) => text.includes(needle)).map(({ f }) => f); });
  if (leaks.length) {
    for (const l of leaks) console.error('❌ ' + l);
    console.error(`❌ ось утечки: ${leaks.length} непубличн. фраз(ы) владельца едут этим коммитом — решение №60 держит их вне публичного репозитория`);
    process.exit(1);
  }
  console.log(`✅ ось утечки: ни одна из ${new Set(spans).size} схлопнутых фраз не стоит в том, что едет коммитом (${texts.length} файл(ов))`);
  process.exit(0);
}
const prov = sourceProvenance(sourcePath);

// Публичные цитаты владельца — легальные исключения самопроверки: они вытянуты ИЗ ЭТОГО репо кодом.
const publicQuoteTexts = [...stats.keptSampleTexts];
for (const list of Object.values(cfg.publicEvidence || {})) {
  for (const a of list) publicQuoteTexts.push(pullPublicQuote(a));
}
// Белый список расширяется ОБЕЗЛИЧЕННЫМИ вариантами своих записей (issue #20, тот же класс
// «одно пространство суждения»): запись allow вправе нести настоящее имя проекта (директива
// владельца называет вещи рабочими именами), а тело слепка к моменту приёмки уже несёт алиас —
// сверка «сырое против опубликованного» гасила бы легальный спан.
const allowRaw = [...(cfg.allowSpans || []), ...publicQuoteTexts];
const privNamesForCheck = loadPrivateNames();
const allowForCheck = [...new Set([...allowRaw, ...allowRaw.map((a) => anonymizeStr(a, privNamesForCheck))])];

const header = readFileSync(cfg.headerPath, 'utf8')
  .replace('{{SAMPLES_KEPT}}', stats.samplesKept.join(' · ') || 'нет')
  .replace('{{SAMPLES_DROPPED}}', stats.samplesDropped.join(' · ') || 'нет')
  .replace('{{ELIDED}}', String(new Set(stats.elided.map((e) => e.span)).size))
  .replace('{{PUBLIC_SPANS}}', String((cfg.publicSpans || []).length))
  .replace(
    '{{CORE_VERSION}}',
    prov.version
      ? `**${prov.version.name} ${prov.version.version}** (объявлена ядром, ${prov.version.released}; статус — \`${prov.version.status}\`)`
      : '⚠️ ядро версии НЕ ОБЪЯВЛЯЕТ (ни файла версии, ни тега на момент слепка) — привязка идёт к коммиту; выдуманный номер хуже отсутствующего'
  )
  .replace('{{SOURCE_SHA}}', prov.sha)
  .replace('{{SOURCE_DATE}}', prov.date)
  .replace('{{RULES}}', String(stats.rules))
  .replace('{{PUBLIC_QUOTES}}', String(stats.publicQuotes))
  .replace('{{PRIVATE_ADDRESSES}}', String(stats.evidenceGroups));

const full = `${header.trimEnd()}\n\n${body.trim()}\n`;

// ПРИЁМКА ИДЁТ ВСЕМИ ТРЕМЯ ОСЯМИ. Прежде здесь стоял вызов из двух аргументов, поэтому
// независимая ось n-грамм — ровно та, которой документ `bugs/66` приписывает находку всех
// настоящих утечек, — в боевой пересборке не исполнялась НИКОГДА: она включалась только в
// селфтесте. Проба круга R2: шесть новых форм личной цитаты уехали в слепок дословно при
// EXIT=0, а тот же прогон с подключённой осью печатает «личное могло протечь».
// Приёмка личных данных обязана падать ЗАКРЫТО: нет исходника — нет и зелёного.
if (!srcLines || !srcLines.length) {
  console.error('ПРИЁМКА НЕ ПОЛНАЯ: исходник недоступен, независимая ось n-грамм не исполнена.');
  console.error('Слепок НЕ пересобирается: молчаливый зелёный на приёмке личного — ложь о проверке.');
  process.exit(2);
}
// Ось 5 — только для раскладки 2.x: слепок 1.x объявлял публичность одними адресами доказательств и осторожно
// схлопывал и то, что публично в планах этого репозитория, — на нём ось дала бы 32 «находки» публичного, а не утечки
// (прогон 2026-09-25 15:15). GAP, названный вслух: у слепка 1.x оси 5 нет.
const failures = [...selfCheck(body, allowForCheck, srcLines, layers),
  ...(cfg.layout === 2 ? leakedElsewhere(stats.elided.map((e) => e.span)) : [])];

const reportIdx = args.indexOf('--report');
if (reportIdx >= 0 && args[reportIdx + 1]) {
  const uniq = [...new Map(stats.elided.map((e) => [e.span, e])).values()];
  writeFileSync(
    args[reportIdx + 1],
    uniq.map((e) => `«${e.span}»\n    ← ${e.line.trim().slice(0, 160)}`).join('\n'),
    'utf8'
  );
  console.log(`отчёт о схлопнутых спанах: ${args[reportIdx + 1]} · уникальных: ${uniq.length}`);
}

console.log(
  `слепок: правил ${stats.rules} · цитат-доказательств с публичным адресом (раскладка 1.x) ${stats.publicQuotes} · ` +
    (cfg.layout === 2 ? `фраз владельца, уже публичных в репозитории (белый список 2.x) ${(cfg.publicSpans || []).length} · ` : '') +
    `адресов в приватное ядро ${stats.evidenceGroups} · схлопнуто спанов ${stats.elided.length} ` +
    `(уникальных ${new Set(stats.elided.map((e) => e.span)).size}) · обезличено адресов ${stats.anonymized} · ` +
    `снято секций ${stats.dropped.length}` +
    (cfg.layout === 2 ? ` · раскладка 2.x: образцов публичных ${stats.samplesKept.length}, снято ${stats.samplesDropped.length} · ` +
      `ось приватных слоёв: ${layers.map((l) => l.file).join(', ')}` : '')
);
console.log(`источник: ${sourcePath} @ ${prov.sha} (${prov.date})`);

if (failures.length) {
  console.error(`\nПРИЁМКА КРАСНАЯ — личное могло протечь (${failures.length}):`);
  for (const f of failures.slice(0, 20)) console.error(`  · ${f}`);
  if (failures.length > 20) console.error(`  … ещё ${failures.length - 20}`);
  process.exit(1);
}

if (args.includes('--check')) {
  const current = existsSync(OUT_PATH) ? readFileSync(OUT_PATH, 'utf8') : '';
  if (current !== full) {
    console.error('\nРАСХОЖДЕНИЕ: слепок в репозитории отличается от пересборки из источника.');
    process.exit(1);
  }
  console.log('слепок совпадает с пересборкой из источника');
} else {
  writeFileSync(OUT_PATH, full, 'utf8');
  console.log(`\nзаписано: ${OUT_PATH}`);
}
