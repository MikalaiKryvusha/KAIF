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

import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tempRoot } from './lib/temp-root.mjs';

const ROOT = process.cwd();
const DEFAULT_SOURCE = 'd:/work/krinik_voice/AUTHOR_STYLOMETRY.md';
const CONFIG_PATH = join(ROOT, 'tools', 'stylometry-snapshot.config.json');
const HEADER_PATH = join(ROOT, 'tools', 'stylometry-snapshot-header.md');
const OUT_PATH = join(ROOT, 'AUTHOR_STYLOMETRY.md');

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
const EVIDENCE_QUOTE = /^>\s*«/;
const EVIDENCE_ADDR = /^>\s*—\s*`?([^`\n]+)`?\s*$/;

/** Чтение конфигурации: белый список спанов, публичные доказательства, снимаемые секции. */
function loadConfig() {
  if (!existsSync(CONFIG_PATH)) {
    return { allowSpans: [], publicEvidence: {}, dropSections: [], stopAfter: null };
  }
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
}

/** Разрешён ли спан к публикации без схлопывания. */
function isPublishableSpan(span, line, allow) {
  if (allow.includes(span)) return true;
  const words = span.trim().split(/\s+/).filter(Boolean);
  if (words.length > TOKEN_MAX_WORDS) return false;
  if (SENTENCE_PUNCT.test(span)) return false;
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

function loadPrivateNames() {
  if (!existsSync(PRIVATE_LIST)) return [];
  const cfg = JSON.parse(readFileSync(PRIVATE_LIST, 'utf8'));
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

/** Схлопывание неразрешённых спанов + обезличивание адресов и приватных имён. */
function scrubLine(line, allow, stats, privateNames = []) {
  // Сначала «ёлочки» сканером (вложенность), затем прочие пары — регулярным выражением.
  let out = '';
  let prev = 0;
  for (const [s, e] of guillemetRegions(line)) {
    const inner = line.slice(s + 1, e);
    out += line.slice(prev, s);
    if (inner === '…' || isPublishableSpan(inner, line, allow)) {
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
    if (isPublishableSpan(inner, line, allow)) return full;
    stats.elided.push({ span: inner, line });
    return `${open}…${close}`;
  });
  out = out.replace(CORPUS_REF, (full, num) => {
    stats.anonymized += 1;
    return `${num}_*.md`;
  });
  for (const p of privateNames) {
    out = out.replace(p.re, (match, offset, whole) => {
      stats.privateNames = (stats.privateNames || 0) + 1;
      const before = whole[offset - 1] || '';
      const after = whole[offset + match.length] || '';
      const inPath = before === '/' || before === '_' || after === '/' || after === '_';
      return inPath ? p.slug : p.alias;
    });
  }
  return out;
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
  const stats = { rules: 0, evidenceGroups: 0, publicQuotes: 0, elided: [], anonymized: 0, privateNames: 0, dropped: [], evidenceTails: 0 };
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

  return { body, stats };
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
function evidenceChunksFromSource(srcLines) {
  const chunks = [];
  let cur = null;
  for (const l of srcLines) {
    if (EVIDENCE_QUOTE.test(l)) {
      if (cur) chunks.push(cur.join(' '));
      cur = [l];
      continue;
    }
    if (!cur) continue;
    if (/^>/.test(l) && !EVIDENCE_ADDR.test(l)) { cur.push(l); continue; }
    chunks.push(cur.join(' '));
    cur = null;
  }
  if (cur) chunks.push(cur.join(' '));
  return chunks;
}

/**
 * Приёмка собранного: доказать, что личное НЕ протекло. Красный — стоп, не предупреждение.
 * Три оси; третья не зависит от глифов кавычек и потому переживает появление новой их формы.
 */
function selfCheck(body, allow, srcLines = null) {
  const failures = [];
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
];

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
  const cleanFailures = selfCheck(clean.body, [...(cfg.allowSpans || []), ...publicTexts], readFileSync(sourcePath, 'utf8').split(/\r?\n/));
  if (cleanFailures.length) {
    console.error(`❌ селфтест: чистая копия — приёмка КРАСНАЯ (${cleanFailures.length}):`);
    for (const f of cleanFailures.slice(0, 5)) console.error(`   · ${f}`);
    red += 1;
  } else {
    console.log('✅ селфтест: чистая копия — приёмка молчит');
  }

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

const cfg = loadConfig();

if (args.includes('--selftest')) {
  selfTest(sourcePath, cfg);
  process.exit(0);
}

const { body, stats } = build(sourcePath, cfg);
const prov = sourceProvenance(sourcePath);

// Публичные цитаты владельца — легальные исключения самопроверки: они вытянуты ИЗ ЭТОГО репо кодом.
const publicQuoteTexts = [];
for (const list of Object.values(cfg.publicEvidence || {})) {
  for (const a of list) publicQuoteTexts.push(pullPublicQuote(a));
}
const allowForCheck = [...(cfg.allowSpans || []), ...publicQuoteTexts];

const header = readFileSync(HEADER_PATH, 'utf8')
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

const failures = selfCheck(body, allowForCheck);

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
  `слепок: правил ${stats.rules} · публичных цитат владельца ${stats.publicQuotes} · ` +
    `адресов в приватное ядро ${stats.evidenceGroups} · схлопнуто спанов ${stats.elided.length} ` +
    `(уникальных ${new Set(stats.elided.map((e) => e.span)).size}) · обезличено адресов ${stats.anonymized} · ` +
    `снято секций ${stats.dropped.length}`
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
