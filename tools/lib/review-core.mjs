#!/usr/bin/env node
// review-core.mjs — ШИМ истока над ядром ОТГРУЖАЕМОГО контура (2.6, эпик IC, шаг IC5 plans/93: «исток
// ест свою поставку»). Ядро — `framework/tools/contour/core.mjs` (= `.kaif/tools/contour/core.mjs` в
// поле): нормализация, хеш, разбор, статус, рендер, предполёт, запись решения, гейт одобрения. Здесь —
// реэкспорт для инструментов истока (`questions-guard`, `review-gate`, `send-outbound`, `verify-contour`)
// и ЛЕГАСИ-константы прежнего ядра, выведенные из конфигурации истока (`.kaif/kaif.json` → `contour`),
// чтобы потребители не переписывались ради переезда. `--selftest` — селфтест генератора (45 проверок).
// [TESTED: 2026-09-05 · шим: `--selftest` → 45 проверок генератора; потребители — `questions-guard` (селфтест 32 мутации,
//  живой прогон 0 новых нарушений), `verify-contour` (--selfcheck · --etalon-only 54/0 · полный в браузере 174/0),
//  `review-gate`/`send-outbound` (usage без падения); `s12` 26 проверок (IC5, сессия 56)]
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadContourConfig } from '../../framework/tools/contour/core.mjs';

export * from '../../framework/tools/contour/core.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CFG = loadContourConfig(ROOT);
export const PROJECT_NAME = CFG.projectName;   // P9: имя проекта в шапке страницы
export const OWNER_NAME = CFG.ownerName;       // P4: запись `by`
export const DECISIONS_DIR = CFG.decisionsDir; // машинная память решений (коммитится)
export const ARCHIVE_DIR = CFG.archiveDir;     // копии «никогда не перезаписываются»
export const QUIET_FROM = CFG.quietFrom;       // тихих часов в истоке нет — слово владельца (интервью №008, Q1): блок `contour` маркера без окна
export const QUIET_TO = CFG.quietTo;

// T9: исполняемся только прямым запуском, не импортом
if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) {
  if (process.argv.includes('--selftest')) (await import('../../framework/tools/contour/review.mjs')).selftest();
  else console.log('review-core: шим над framework/tools/contour/core.mjs; запуск проверок — --selftest');
}
