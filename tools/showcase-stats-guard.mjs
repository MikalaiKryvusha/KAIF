#!/usr/bin/env node
// tools/showcase-stats-guard.mjs — страж КЛАССА «витринное число разошлось с живым репозиторием»
// (bugs/74).
//
// ЗАЧЕМ. Инвентарные строки витрины («Планов написано», «Багов заведено», «Уроков опыта») читает
// посторонний человек, и проверить их он не может — а проверить их можно одной командой, которая
// в проекте уже есть. Числа снимаются один раз и вписываются руками, после чего репозиторий
// продолжает жить: фаза Q добавила коммиты, планы, баги и уроки уже ПОСЛЕ замера, и десять строк
// из двенадцати разъехались с реальностью. Прежний `counters-guard` этих строк не видит по
// построению — он стережёт счётчики ПОСТАВКИ (документы/навыки/блоки/модули/своды), а не инвентарь
// версии.
//
// ЧЕСТНАЯ ГРАНИЦА, названная вслух. Страж судит ТОЛЬКО те строки, что выводимы ИЗ РЕПОЗИТОРИЯ:
// счёт документов по директориям знаний, закрытые баги, решения владельца, уроки опыта, навыки.
// Строки, выводимые из git-истории и транскриптов сессий (коммиты, строки, токены, запросы,
// деньги, время), он НЕ ПРОВЕРЯЕТ и говорит об этом вслух: транскрипты живут на машине владельца,
// и молчаливый зелёный по ним был бы ложью о проверке (та же граница, что у
// `private-names-guard` без списка имён).
//
// ГДЕ СТОИТ. В `/release`, преполётом публикации: витрина с разъехавшимся числом не должна уехать
// в мир. В `/end-chat` НЕ ставится намеренно — числа версии законно отстают в течение работы над
// ней, и красный на каждом закрытии чата обесценил бы сигнал.
//
// Использование:
//   node tools/showcase-stats-guard.mjs              # сверить README (обе половины)
//   node tools/showcase-stats-guard.mjs --selftest   # доказать красный мутацией и молчание на чистой
//
// [TESTED: 2026-08-09 · selftest: порча одной строки в КАЖДОЙ половине даёт красный, чистая копия
//  молчит; на живом README поймал десять расхождений — ровно те, что нашёл круг R1]

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tempRoot } from './lib/temp-root.mjs';

const ROOT = process.cwd();

// Строка витрины → как её число зовётся в выводе `kaif-stats --json`.
// Обе половины перечислены ЯВНО и проверяются КАЖДАЯ: счёт «нашлось где-то в файле» узаконил бы
// пропажу строки из одной половины (bugs/55 F1 — тот же класс на другом артефакте).
const ROWS = [
  { key: 'plans',      en: 'Plans written',                              ru: 'Планов написано' },
  { key: 'bugs',       en: 'Bugs filed',                                 ru: 'Багов заведено' },
  { key: 'ideas',      en: 'Ideas proposed',                             ru: 'Идей предложено' },
  { key: 'researches', en: 'Research documents produced',                ru: 'Исследований проведено' },
  { key: 'interviews', en: 'Owner interviews',                           ru: 'Интервью с владельцем' },
  { key: 'reports',    en: 'Reports written',                            ru: 'Отчётов написано' },
  { key: 'knowledge',  en: 'Files in the knowledge directories in total', ru: 'Файлов в директориях знания всего' },
  { key: 'decisions',  en: 'Owner decisions recorded',                   ru: 'Решений владельца зафиксировано' },
  { key: 'lessons',    en: 'Experience lessons written',                 ru: 'Уроков опыта записано' },
  { key: 'skills',     en: 'Skills in the delivery',                     ru: 'Навыков в поставке' },
];

// Строки, которые страж НЕ судит, и почему — перечень нужен, чтобы «не проверено» не читалось
// как «проверено и сошлось» (EXP-0037: зелёное читается как «сверено»).
const NOT_JUDGED = [
  'коммиты, файлы, строки (git-история — судится отдельно, живёт вне окна замера)',
  'токены, запросы, сессии, деньги, энергия, активное время (транскрипты сессий владельца)',
  'производные пересчёты («романов», «страниц», «гамбургеров») — они следуют за своими числами',
];

/** Живые числа — из того же инструмента, что печатает витрина. Не из головы. */
function liveStats(root = ROOT) {
  const out = execFileSync(process.execPath, [join(root, 'tools', 'kaif-stats.mjs'), '--json'],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const j = JSON.parse(out);
  const d = j.docs;
  return {
    plans: d.dirs.plans,
    bugs: d.dirs.bugs,
    ideas: d.dirs.ideas,
    researches: d.dirs.researches,
    interviews: d.dirs.interviews,
    reports: d.dirs.reports,
    knowledge: Object.values(d.dirs).reduce((a, b) => a + b, 0),
    decisions: d.decisions,
    lessons: d.lessons,
    skills: d.skills,
  };
}

/**
 * Число из клетки «Значение» строки таблицы. Форма клетки — `| Подпись | 62 | пояснение |`,
 * значение бывает обёрнуто в `**` и содержит неразрывные пробелы разрядов.
 * Возвращает null, если строки нет вовсе, — это ОТДЕЛЬНАЯ находка, а не «ноль».
 */
function readRow(text, label) {
  const re = new RegExp('^\\|\\s*' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\|([^|]*)\\|', 'mu');
  const m = text.match(re);
  if (!m) return null;
  const digits = m[1].replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
}

function checkFile(path, live) {
  const text = readFileSync(path, 'utf8');
  const findings = [];
  for (const row of ROWS) {
    for (const [half, label] of [['EN', row.en], ['RU', row.ru]]) {
      const got = readRow(text, label);
      if (got === null) { findings.push(`${half}: строки «${label}» нет в таблице`); continue; }
      if (got !== live[row.key]) findings.push(`${half}: «${label}» — на витрине ${got}, живое ${live[row.key]}`);
    }
  }
  return findings;
}

/** Селфтест: красный на порче КАЖДОЙ половины и молчание на чистой копии (EXP-0059). */
function selftest() {
  const root = tempRoot('showcase-stats');
  const live = liveStats();
  const src = readFileSync(join(ROOT, 'README.md'), 'utf8');

  // Чистая копия — та, где все строки приведены к живым числам: страж обязан МОЛЧАТЬ на ней.
  let clean = src;
  for (const row of ROWS) {
    for (const label of [row.en, row.ru]) {
      const re = new RegExp('^(\\|\\s*' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\|)([^|]*)\\|', 'mu');
      clean = clean.replace(re, (full, head) => `${head} **${live[row.key]}** |`);
    }
  }
  const cleanPath = join(root, 'README-clean.md');
  writeFileSync(cleanPath, clean, 'utf8');
  const cleanFindings = checkFile(cleanPath, live);

  let red = 0;
  if (cleanFindings.length) {
    console.error(`❌ selftest: чистая копия — страж КРАСНЫЙ (${cleanFindings.length}):`);
    for (const f of cleanFindings.slice(0, 5)) console.error(`   · ${f}`);
    red += 1;
  } else {
    console.log('✅ selftest: чистая копия — страж молчит');
  }

  // Мутация КАЖДОЙ половины по отдельности: счёт «нашлось где-то» не должен спасать.
  for (const [half, label] of [['EN', ROWS[0].en], ['RU', ROWS[0].ru]]) {
    const re = new RegExp('^(\\|\\s*' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\|)([^|]*)\\|', 'mu');
    const mutPath = join(root, `README-mut-${half}.md`);
    writeFileSync(mutPath, clean.replace(re, (full, head) => `${head} **999999** |`), 'utf8');
    const f = checkFile(mutPath, live);
    const caught = f.some((x) => x.startsWith(half + ':') && x.includes('999999'));
    if (caught) console.log(`✅ selftest: порча ${half}-половины поймана`);
    else { console.error(`❌ selftest: порча ${half}-половины НЕ поймана`); red += 1; }
  }

  if (red) { console.error(`\n❌ selftest красный: ${red}. Корень оставлен: ${root}`); process.exit(1); }
  console.log('\n✅ selftest зелёный: обе половины стерегутся по отдельности, чистая копия молчит');
}

// ── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes('--selftest')) { selftest(); process.exit(0); }

const live = liveStats();
const findings = checkFile(join(ROOT, 'README.md'), live);

console.log('живые числа репозитория: ' + ROWS.map((r) => `${r.key} ${live[r.key]}`).join(' · '));
console.log('НЕ судится этим стражем (и это не «сошлось»):');
for (const n of NOT_JUDGED) console.log('  · ' + n);

if (findings.length) {
  console.error(`\n❌ витринные числа разошлись с живым репозиторием (${findings.length}):`);
  for (const f of findings) console.error('  · ' + f);
  console.error('\nВерный ход: снять свежий замер `node tools/kaif-stats.mjs` и привести обе половины;');
  console.error('окно замера объявлять по МОМЕНТУ ПУБЛИКАЦИИ, а не по дате написания абзаца.');
  process.exit(1);
}
console.log('\n✅ showcase-stats: инвентарные числа витрины совпадают с живым репозиторием');
