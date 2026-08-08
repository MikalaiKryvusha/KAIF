#!/usr/bin/env node
// tools/owner-quotes-harvest.mjs — сборщик ПУБЛИЧНЫХ дословных слов владельца из ЭТОГО репозитория.
//
// Зачем он существует (решение №60, интервью №014 Q1 = B): публичный слепок портрета голоса
// (`AUTHOR_STYLOMETRY.md`) переносит ПРАВИЛА из приватного `krinik-stylometry`, но доказательные
// цитаты берёт из слов владельца, УЖЕ публичных здесь. Выбирать цитату под правило — работа
// модели; ПЕРЕНОСИТЬ её побайтно — работа кода (EXPERIENCE → EXP-0049: «дословность — машинная
// работа, а не добродетель»; модель, переносящая цитату руками, нормализует её молча).
//
// Что считается дословным словом владельца — три механически опознаваемых класса, ни одного
// «на глаз»:
//   1. `GOAL.md` целиком — документ написан владельцем (`AGENT_GUIDE.md`: «GOAL.md ← видение
//      (заполняет владелец)»);
//   2. строки интервью с маркером контура `<!-- owner-review: …-->` — это буквально то, что
//      владелец напечатал в странице вычитки;
//   3. «ёлочные» цитаты на строках со словом «дословно» — принятая конвенция проекта для слов
//      владельца в планах, багах, STATUS и журнале решений MASTER_PLAN.
//
// Вывод — JSON на stdout (или в файл через --out): по записи на цитату, с адресом `файл:строка`.
// Порядок детерминирован (файл, затем строка) — вывод диффуется и кэшируется (AGENT_GUIDE →
// «Канонический порядок для всего сравниваемого»).
//
// Использование:
//   node tools/owner-quotes-harvest.mjs                    # весь пул на stdout (JSON)
//   node tools/owner-quotes-harvest.mjs --out pool.json    # в файл
//   node tools/owner-quotes-harvest.mjs --min-words 8      # только цитаты от N слов
//   node tools/owner-quotes-harvest.mjs --list             # человекочитаемый список
//   node tools/owner-quotes-harvest.mjs --selftest         # страж: класс распознавания краснеет
//
// [TESTED: 2026-08-08 · прогон по репозиторию + --selftest на синтетических фикстурах]

import { readFileSync, writeFileSync, readdirSync, statSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = process.cwd();

// Где искать. Директории знаний + корневые документы, где по конвенции проекта живут дословные
// слова владельца. Приватных путей здесь нет и быть не может: инструмент читает только этот репо.
const SCAN_DIRS = ['interviews', 'plans', 'bugs', 'ideas', 'researches', 'homeworks', 'reports'];
const SCAN_ROOT_FILES = ['GOAL.md', 'STATUS.md', 'MASTER_PLAN.md', 'AGENT_GUIDE.md', 'PHILOSOPHY.md'];

// Маркер интерактивного контура: строка, которую владелец напечатал сам, несёт эту пометку.
const CONTOUR_MARK = '<!-- owner-review:';
// Конвенция проекта: «дословно» рядом с ёлочной цитатой = слова владельца.
const VERBATIM_WORD = /дословн/i;
// Ёлочные кавычки — единственная форма цитаты владельца в документах проекта.
const GUILLEMETS = /«([^«»]+)»/g;

/** Рекурсивный обход markdown-файлов директории. */
function walkMarkdown(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries.sort()) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkMarkdown(full));
    else if (name.endsWith('.md')) out.push(full);
  }
  return out;
}

/** Нормализованный адрес цитаты — всегда через прямой слэш, чтобы адрес не зависел от ОС. */
function addressOf(file, lineNo) {
  return `${relative(ROOT, file).split(sep).join('/')}:${lineNo}`;
}

/**
 * Класс 1 — `GOAL.md`: весь документ написан владельцем, поэтому каждая непустая строка
 * (кроме служебных markdown-строк) — его дословное слово.
 */
function harvestOwnerDocument(file, kind) {
  const rows = [];
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    return rows;
  }
  text.split(/\r?\n/).forEach((line, i) => {
    const t = line.trim().replace(/^[-*]\s+/, '');
    if (!t || t.startsWith('#') || t.startsWith('>') || t.startsWith('|') || t.startsWith('```')) return;
    rows.push({ kind, text: t, address: addressOf(file, i + 1) });
  });
  return rows;
}

/**
 * Класс 2 — строки с маркером интерактивного контура. Берём текст ДО маркера: сам маркер —
 * машинная пометка страницы, а не слово владельца.
 */
function harvestContourLines(file) {
  const rows = [];
  const text = readFileSync(file, 'utf8');
  text.split(/\r?\n/).forEach((line, i) => {
    const at = line.indexOf(CONTOUR_MARK);
    if (at < 0) return;
    // Отрезаем префикс-подпись агента («**Комментарий владельца (…):** ») — она не его слово.
    const body = line.slice(0, at).replace(/^\*\*[^*]+\*\*\s*/, '').trim();
    if (!body) return;
    rows.push({ kind: 'contour', text: body, address: addressOf(file, i + 1) });
  });
  return rows;
}

/**
 * Класс 3 — ёлочные цитаты на строках со словом «дословно».
 * Строка может нести несколько цитат — берём каждую отдельной записью.
 */
function harvestVerbatimQuotes(file) {
  const rows = [];
  const text = readFileSync(file, 'utf8');
  text.split(/\r?\n/).forEach((line, i) => {
    if (!VERBATIM_WORD.test(line)) return;
    for (const m of line.matchAll(GUILLEMETS)) {
      const body = m[1].trim();
      if (!body) continue;
      rows.push({ kind: 'verbatim', text: body, address: addressOf(file, i + 1) });
    }
  });
  return rows;
}

/** Полный сбор пула по всем трём классам. */
function harvest(root = ROOT) {
  const files = [];
  for (const d of SCAN_DIRS) files.push(...walkMarkdown(join(root, d)));
  for (const f of SCAN_ROOT_FILES) {
    const full = join(root, f);
    try {
      statSync(full);
      files.push(full);
    } catch {
      /* документа нет — не ошибка сборщика */
    }
  }

  const rows = [];
  for (const f of files) {
    const isGoal = f.endsWith(`${sep}GOAL.md`) || f.endsWith('GOAL.md');
    if (isGoal) rows.push(...harvestOwnerDocument(f, 'goal'));
    rows.push(...harvestContourLines(f));
    rows.push(...harvestVerbatimQuotes(f));
  }

  // Канонический порядок: адрес — полный тай-брейк (файл, затем номер строки, затем текст).
  rows.sort((a, b) => {
    const [fa, la] = a.address.split(':');
    const [fb, lb] = b.address.split(':');
    return fa.localeCompare(fb) || Number(la) - Number(lb) || a.text.localeCompare(b.text);
  });
  return rows;
}

/**
 * Страж класса распознавания: доказывает, что каждый из трёх классов РЕАЛЬНО опознаётся, а не
 * зеленеет вхолостую (BUG_FIXING_FRAMEWORK → «Проверяй стража на сломанной версии»).
 * Проверяет и второе свойство — молчание на том, что словом владельца НЕ является (EXP-0059).
 */
function selftest() {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-owner-quotes-'));
  const failures = [];
  try {
    writeFileSync(join(dir, 'GOAL.md'), '# Заголовок\n\nЦель: сделать вещь просто.\n', 'utf8');
    const iv = join(dir, 'interviews');
    writeFileSync(
      join(dir, 'STATUS.md'),
      'Слово владельца дословно: «мы не торопимся» и «делаем хорошо».\nОбычная строка агента с «кавычками» без пометки.\n',
      'utf8'
    );
    mkdirSync(iv, { recursive: true });
    writeFileSync(
      join(iv, 'interview_999_x.md'),
      '**Комментарий владельца (дата):** так и сделаем <!-- owner-review: by Owner -->\nПросто строка агента.\n',
      'utf8'
    );

    const rows = harvest(dir);
    const has = (kind, text) => rows.some((r) => r.kind === kind && r.text === text);

    if (!has('goal', 'Цель: сделать вещь просто.')) failures.push('класс goal не опознан');
    if (!has('contour', 'так и сделаем')) failures.push('класс contour не опознан');
    if (!has('verbatim', 'мы не торопимся')) failures.push('класс verbatim не опознан (первая цитата)');
    if (!has('verbatim', 'делаем хорошо')) failures.push('класс verbatim не опознан (вторая цитата строки)');
    // Второе свойство: молчание на «не трогать».
    if (has('verbatim', 'кавычками')) failures.push('ложное срабатывание: цитата без пометки «дословно» попала в пул');
    if (rows.some((r) => r.text === 'Просто строка агента.')) failures.push('ложное срабатывание: проза агента попала в пул');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  if (failures.length) {
    console.error('SELFTEST FAILED:');
    for (const f of failures) console.error(`  · ${f}`);
    process.exit(1);
  }
  console.log('selftest ok — три класса опознаются, посторонние строки молчат');
}

// ── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes('--selftest')) {
  selftest();
} else {
  const minWords = Number(args[args.indexOf('--min-words') + 1]) || 0;
  let rows = harvest();
  if (minWords > 0) rows = rows.filter((r) => r.text.split(/\s+/).length >= minWords);

  if (args.includes('--list')) {
    for (const r of rows) console.log(`[${r.kind}] ${r.address}\n  ${r.text}`);
    console.log(`\nвсего: ${rows.length}`);
  } else {
    const json = JSON.stringify(rows, null, 2);
    const outIdx = args.indexOf('--out');
    if (outIdx >= 0 && args[outIdx + 1]) {
      writeFileSync(args[outIdx + 1], json, 'utf8');
      console.log(`записано: ${args[outIdx + 1]} · цитат: ${rows.length}`);
    } else {
      console.log(json);
    }
  }
}
