#!/usr/bin/env node
// tools/lib/temp-root.mjs — ОДИН способ получить временный корень прогона + страж его класса
// (bugs/59).
//
// ЗАЧЕМ. Каталог с ФИКСИРОВАННЫМ именем в общем OS-temp — это разделяемый ресурс БЕЗ ВЛАДЕЛЬЦА.
// Достаточно двух прогонов в одно время (две сессии агента · полигон рядом с отдельным сводом ·
// `--selftest` рядом с обычным прогоном · CI рядом с локальным), и второй сносит каталог, пока
// первый по нему ходит: наружу летит сырой стектрейс `EPERM`/`EPIPE` и ЛОЖНЫЙ КРАСНЫЙ в главном
// гейте проекта. Ложная тревога опаснее пропуска — она учит оператора перезапускать и не
// смотреть, обесценивая красный, который означает настоящую поломку.
//
// ФОРМА, ЗАКРЫВАЮЩАЯ КЛАСС. Корень уникален ПО ПОСТРОЕНИЮ (`mkdtempSync`), а не уникален «по
// договорённости имён»: тринадцать сводов не могут разойтись снова, потому что имя больше не
// выбирается вручную. Прецедент формы жил в этом же репозитории и был не замечен —
// `tools/lib/review-core.mjs` и `tools/review.mjs` уже брали корень через `mkdtempSync`.
//
// ПРИВЫЧКА «ЗАЙТИ И ПОСМОТРЕТЬ, ЧТО ПРОГОН ОСТАВИЛ» сохранена и стала точнее:
//   • зелёный прогон убирает свой корень — мусор в temp не копится;
//   • КРАСНЫЙ прогон корень ОСТАВЛЯЕТ и печатает путь — улика лежит там, где она нужна;
//   • `KAIF_TMP_KEEP=1` оставляет корень всегда;
//   • явный путь аргументом (`node <свод> <путь>`) — корень принадлежит вызывающему, не убирается.
//
// [TESTED: 2026-08-08 · два одновременных прогона s13 → A_EXIT=0 и B_EXIT=0 (до фикса A=1);
//  преполётный страж доказан красным на синтетической мутации — см. selfProof()]
import { mkdtempSync, mkdirSync, rmSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PREFIX = 'kaif-sbx-';
const KEEP_ENV = 'KAIF_TMP_KEEP';
const EXIT_ROOT_BUSY = 2;          // отличим от обычного провала проверок (1)
const SCAN_DIRS = ['tools', 'framework'];
const SELF_REL = 'tools/lib/temp-root.mjs';

/**
 * Вернуть готовый (существующий и ПУСТОЙ) временный корень прогона.
 * @param {string} name  короткое имя прогона — попадает в имя каталога для человека
 * @param {string} [explicit]  явный путь от вызывающего (обычно process.argv[2])
 */
export function tempRoot(name, explicit) {
  if (explicit) {
    // Явный путь: владелец каталога — вызывающий. Уникальности здесь нет по определению,
    // поэтому единственное, что мы обязаны, — не падать стектрейсом, а НАЗВАТЬ ВЕРНЫЙ ХОД
    // (EXP-0008: ошибка инструмента несёт готовое решение, никогда — обход).
    const root = resolve(explicit);
    try {
      rmSync(root, { recursive: true, force: true });
    } catch (e) {
      console.error(`❌ временный корень занят другим прогоном: ${root} (${e.code})`);
      console.error('   Верный ход: запусти БЕЗ явного пути — корень будет уникальным (mkdtemp);');
      console.error('   либо дождись соседнего прогона; либо укажи свободный каталог аргументом.');
      process.exit(EXIT_ROOT_BUSY);
    }
    mkdirSync(root, { recursive: true });
    return root;
  }

  const root = mkdtempSync(join(tmpdir(), `${PREFIX}${name}-`));
  process.on('exit', (code) => {
    if (code === 0 && !process.env[KEEP_ENV]) {
      // Чужой открытый хэндл на Windows даёт EPERM. Мусор в temp безвреден, ложный красный — нет:
      // уборка НИКОГДА не имеет права уронить зелёный прогон.
      try { rmSync(root, { recursive: true, force: true }); } catch { /* оставляем как есть */ }
    } else {
      console.error(`ℹ️  временный корень оставлен для разбора: ${root}`);
    }
  });
  return root;
}

// ── Страж КЛАССА ───────────────────────────────────────────────────────────────────────────
// Фикс без стража — фикс в кредит: класс обязан не мочь вернуться. Проверка построчная —
// все реальные вхождения однострочные, а простое правило читается и чинится без разбора AST.
// ЛЕГАЛЬНЫЕ формы: `mkdtempSync(...)` · интерполяция уникализирующего ключа (`${process.pid}`,
// идентификатор сессии) · вызов `tempRoot(...)` из этого модуля.
const LEGAL_MARKS = ['mkdtempSync', '${', 'tempRoot('];

/** Найти фиксированные temp-имена в тексте одного файла. Возвращает список находок. */
export function auditLines(relPath, text) {
  const out = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.includes('tmpdir()')) return;
    if (LEGAL_MARKS.some((m) => line.includes(m))) return;
    out.push(`${relPath}:${i + 1} — ${line.trim()}`);
  });
  return out;
}

/** Обойти инструменты репозитория и вернуть все фиксированные temp-имена. */
export function auditFixedTempNames(repoRoot) {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '.git') continue;
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      if (!entry.endsWith('.mjs')) continue;
      const rel = relative(repoRoot, p).split('\\').join('/');
      if (rel === SELF_REL) continue;                    // сам страж говорит о запрещённой форме
      found.push(...auditLines(rel, readFileSync(p, 'utf8')));
    }
  };
  for (const d of SCAN_DIRS) walk(join(repoRoot, d));
  return found;
}

/**
 * Доказательство красного БЕЗ ввода-вывода: страж, который ни разу не краснел, ничего не
 * доказывает. Кормим стража синтетической мутацией (ровно та форма, что породила bugs/59) и
 * чистыми образцами всех легальных форм.
 * @returns {string[]} список провалов самопроверки (пустой = страж доказан)
 */
export function selfProof() {
  const fails = [];
  const mutant = "const ROOT = resolve(process.argv[2] || join(tmpdir(), 'kaif-sbx-field'));";
  if (auditLines('mutant.mjs', mutant).length !== 1) fails.push('мутация «фиксированное имя» НЕ поймана');
  const legal = [
    "const root = mkdtempSync(join(tmpdir(), 'kaif-core-'));",
    'const tmpMsg = join(tmpdir(), `kaif-commit-msg-${process.pid}.txt`);',
    "const ROOT = tempRoot('field', process.argv[2]);",
  ];
  for (const l of legal) {
    if (auditLines('legal.mjs', l).length !== 0) fails.push(`легальная форма ошибочно помечена: ${l}`);
  }
  return fails;
}

// ── CLI: `node tools/lib/temp-root.mjs --selftest` (и он же — преполётный блок полигона) ────
if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) {
  const repo = resolve(HERE, '..', '..');
  const fails = selfProof();
  const violations = auditFixedTempNames(repo);
  for (const f of fails) console.error('✖ selfproof: ' + f);
  for (const v of violations) console.error('✖ фиксированное temp-имя: ' + v);
  if (fails.length || violations.length) {
    console.error(`\n❌ temp-root: ${fails.length} провалов самопроверки, ${violations.length} фиксированных имён (bugs/59)`);
    process.exit(1);
  }
  console.log(`✅ temp-root: страж доказан красным на мутации, фиксированных temp-имён в ${SCAN_DIRS.join('/')} нет`);
}
