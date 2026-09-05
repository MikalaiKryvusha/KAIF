#!/usr/bin/env node
// review.mjs — ОБЁРТКА истока над ОТГРУЖАЕМЫМ генератором интерактивного контура (2.6, эпик IC, шаг IC5
// plans/93: «исток ест свою поставку»; №101 — пересмотр №34). Страница, сервер, сигнал, очередь, три
// лица и предполёт живут в `framework/tools/contour/review.mjs` — ровно в том файле, который едет
// проектам как `.kaif/tools/contour/review.mjs`. Здесь — только то, что принадлежит ИСТОКУ:
//   · окружение голоса (I35/I36): движок Silero — «рот» машины владельца, путь к нему задаётся
//     переменными, не поставкой; без переменных генератор честно падает на системный голос культуры;
//   · реэкспорт API генератора для инструментов истока (`verify-contour`, своды) — один модуль, одна правда.
// Параметры контура истока (имя проекта, владелец, обращение зова) — в `.kaif/kaif.json` → `contour`.
// Решения владельца, которые исток исполняет ЧЕРЕЗ поставку (разнос I20): интервью №008, Q1 — тихих часов в
// истоке нет (блок `contour` без `quietFrom`/`quietTo`); интервью №008, Q2 — звено «баннер» = строка в консоли
// (`signalCall` генератора печатает CALL: без OS-уведомлений); интервью №009, Q3 — сообщение (`--notice`)
// зовёт так же громко, как вопрос: писки и голос, различает только фраза «ответа не ждёт» (texts.mjs).
// Команды — те же, что у поставки: `node tools/review.mjs <док> [--notice|--proofread|--mockup|--no-serve|
// --no-open|--silent|--timeout N]` · `--queue [--list|--include-stale]` · `--enqueue <док>` ·
// `--mark-shown <док> --transport чат` · `--selftest`. Коды: 0 · 2 · 130 · 3 (предполёт отказал).
// [TESTED: 2026-09-05 · обёртка ≤ 60 строк над отгружаемым генератором: `--selftest` 45 проверок, `--queue --list` истока
//  («Очередь владельца пуста»), рендер живого интервью №025 через обёртку — шапка KAIF · lang=ru · «Записать решение»;
//  ПОЛНЫЙ `node tools/verify-contour.mjs` в живом браузере — 174 зелёных, 0 красных (IC5, сессия 56)]
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Окружение голоса истока — дефолты ТОЛЬКО здесь (в поставку не едут). Переменная, заданная снаружи,
// сильнее дефолта; пустая строка выключает движок и оставляет системный голос.
const VOICE_DEFAULTS = {
  KAIF_VOICE_TOOL: 'F:\\KLAS\\tools\\voice-say.mjs', // Silero v5 ru — общий «рот» машины владельца
  KAIF_VOICE: 'eugene',                               // вердикт владельца: «звучит по-человечески, а не роботом»
  KAIF_SAPI_VOICE: 'Microsoft Irina Desktop',         // предпочтение системного фолбэка (культура ru)
};
for (const [k, v] of Object.entries(VOICE_DEFAULTS)) if (process.env[k] === undefined) process.env[k] = v;

export * from '../framework/tools/contour/review.mjs';
import { main } from '../framework/tools/contour/review.mjs';

// T9: исполняемся только прямым запуском, не импортом
if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) main(process.argv.slice(2), process.cwd());
