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
// Использование:
//   node tools/stylometry-snapshot.mjs                 # собрать AUTHOR_STYLOMETRY.md
//   node tools/stylometry-snapshot.mjs --check         # не писать: сверить слепок с источником
//   node tools/stylometry-snapshot.mjs --report <путь> # выгрузить список схлопнутых спанов на ревизию
//   node tools/stylometry-snapshot.mjs --source <путь> # другой источник (по умолчанию — ядро владельца)
//
// [NOT-TESTED]

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

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

/** Схлопывание неразрешённых спанов + обезличивание адресов. Возвращает строку и счётчики. */
function scrubLine(line, allow, stats) {
  let out = line.replace(/«([^«»]+)»/g, (full, inner) => {
    if (isPublishableSpan(inner, line, allow)) return full;
    stats.elided.push({ span: inner, line });
    return '«…»';
  });
  out = out.replace(CORPUS_REF, (full, num) => {
    stats.anonymized += 1;
    return `${num}_*.md`;
  });
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
  try {
    const out = execFileSync('git', ['-C', dir, 'log', '-1', '--format=%h|%cI', '--', file], {
      encoding: 'utf8',
    }).trim();
    const [sha, date] = out.split('|');
    return { sha, date };
  } catch {
    return { sha: 'неизвестен', date: 'неизвестна' };
  }
}

/** Сборка слепка. */
function build(sourcePath, cfg) {
  const src = readFileSync(sourcePath, 'utf8').split(/\r?\n/);
  const stats = { rules: 0, evidenceGroups: 0, publicQuotes: 0, elided: [], anonymized: 0, dropped: [] };
  const allow = cfg.allowSpans || [];
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

    // Доказательная цитата из личного корпуса — не едет.
    if (EVIDENCE_QUOTE.test(line)) continue;

    // Адрес доказательства — едет обезличенным, как ссылка в приватное ядро.
    const addrHit = line.match(EVIDENCE_ADDR);
    if (addrHit) {
      const addr = scrubLine(addrHit[1].trim(), allow, stats).replace(/`/g, '');
      stats.evidenceGroups += 1;
      out.push(`> — доказательство в приватном ядре: \`krinik-stylometry:${addr}\``);
      continue;
    }

    // Заголовок правила: запоминаем идентификатор, чтобы подставить публичное доказательство.
    const ruleHit = line.match(/^###\s+([A-ZА-ЯЁ]{1,2}\d+|R0)\./);
    if (ruleHit) {
      stats.rules += 1;
      pendingRuleId = ruleHit[1];
      out.push(scrubLine(line, allow, stats));
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

    out.push(scrubLine(line, allow, stats));
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
  let body = compact.join('\n');
  body = body.replace(/«([^«»]*\n[^«»]*)»/g, (full, inner) => {
    stats.elided.push({ span: inner.replace(/\s+/g, ' '), line: '(многострочная цитата)' });
    return '«…»';
  });

  return { body, stats };
}

/** Приёмка собранного: доказать, что личное НЕ протекло. Красный — стоп, не предупреждение. */
function selfCheck(body, allow) {
  const failures = [];
  // 1. Ни одного заголовка произведения в адресах (примета та же, что у чистки — узкая по левому краю).
  const titled = body.match(/(?<![\wА-Яа-яЁё/])\d{3}_[a-zа-яё][^\s`«»:,;)\]]*\.md/gi);
  if (titled) failures.push(`адрес с заголовком произведения: ${[...new Set(titled)].slice(0, 3).join(', ')}`);
  // 2. Ни одного неразрешённого спана-цитаты.
  for (const m of body.matchAll(/«([^«»]+)»/g)) {
    const inner = m[1];
    if (inner === '…') continue;
    if (allow.includes(inner)) continue;
    const words = inner.trim().split(/\s+/).filter(Boolean);
    if (words.length > TOKEN_MAX_WORDS || SENTENCE_PUNCT.test(inner)) {
      // Публичные цитаты владельца из этого репозитория живут в блоках `> «…»` со своим адресом.
      failures.push(`неразрешённый спан: «${inner.slice(0, 60)}»`);
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
const { body, stats } = build(sourcePath, cfg);
const prov = sourceProvenance(sourcePath);

// Публичные цитаты владельца — легальные исключения самопроверки: они вытянуты ИЗ ЭТОГО репо кодом.
const publicQuoteTexts = [];
for (const list of Object.values(cfg.publicEvidence || {})) {
  for (const a of list) publicQuoteTexts.push(pullPublicQuote(a));
}
const allowForCheck = [...(cfg.allowSpans || []), ...publicQuoteTexts];

const header = readFileSync(HEADER_PATH, 'utf8')
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
