// voice-env.mjs — окружение голоса ИСТОКА, одно место (I35/I36; решение №156). Читают его обёртка контура `tools/review.mjs`
// (зов `--call` и страницы) и прямая озвучка `tools/say.mjs`. В поставку не едет: движки — ресурсы ЭТОЙ машины.
// Голос — мягкий голос поставки `framework/tools/contour/voice-soft.mjs` с числами, которые владелец настроил на слух в полевом
// развёртывании (темп 0,90 · бас +6 дБ на 140 Гц · срез высоких 4200 Гц · 1 с тишины · писки ×2,5 в том же файле · 2 с до слов) —
// «эти настройки нужно взять» (2026-11-07, №156). Рендер с удвоенными паузами на знаках — `tools/voice/soft_say.py` на Python машины,
// запасной — Silero-инструмент машины. Переменная, заданная снаружи, сильнее дефолта; пустая строка выключает движок.
// [TESTED: 2026-11-07 · рендер через это окружение побайтно равен голосу поля; отчёт testcases/reports/2026-11-07_voice-soft-kumm-settings.md]
import { resolve } from 'node:path';

const HERE = import.meta.dirname;
export const VOICE_DEFAULTS = {
  KAIF_VOICE_TOOL: resolve(HERE, '..', '..', 'framework', 'tools', 'contour', 'voice-soft.mjs'), // мягкий голос поставки — исток ест свою поставку
  KAIF_VOICE_BEEPS: 'embedded',                                   // писки — внутри файла мягкого голоса, контур своих не играет
  KAIF_VOICE_RENDER: JSON.stringify(['F:\\KLAS\\voice\\venv\\Scripts\\python.exe', '-I', resolve(HERE, '..', 'voice', 'soft_say.py')]),
  KAIF_VOICE_BASE_TOOL: 'F:\\KLAS\\tools\\voice-say.mjs',         // Silero v5 ru — общий «рот» машины владельца, запасной рендер
  KAIF_VOICE: 'eugene',                                           // вердикт владельца: «звучит по-человечески, а не роботом»
  KAIF_SAPI_VOICE: 'Microsoft Irina Desktop',                     // предпочтение системного фолбэка (культура ru)
};
export function applyVoiceDefaults(env = process.env) {
  for (const [k, v] of Object.entries(VOICE_DEFAULTS)) if (env[k] === undefined) env[k] = v;
  return env;
}
