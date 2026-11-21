// voice-env.mjs — окружение голоса ИСТОКА, одно место (I35/I36; решение №156). Читают его обёртка контура `tools/review.mjs`
// (зов `--call` и страницы) и прямая озвучка `tools/say.mjs`. В поставку не едет: движки — ресурсы ЭТОЙ машины.
// С 2026-11-09 (№159) исток зовёт мягким голосом с Glass: `voice-soft.mjs` видит `KAIF_VOICE_FILE_TOOL` и отдаёт фразу
// настроенному общему `silero_tts/say.py`; его прежний рендер с писками остаётся запасным там, где file-tool не настроен.
// Переменная, заданная снаружи, сильнее дефолта; пустая строка выключает движок.
// [TESTED: 2026-11-07 · рендер через это окружение побайтно равен голосу поля; отчёт testcases/reports/2026-11-07_voice-soft-kumm-settings.md]
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const HERE = import.meta.dirname;
let fileTool = null;
try {
  const marker = JSON.parse(readFileSync(resolve(HERE, '..', '..', '.kaif', 'kaif.json'), 'utf8').replace(/^\uFEFF/, ''));
  if (Array.isArray(marker.contour?.voiceFileTool) && marker.contour.voiceFileTool.every((x) => typeof x === 'string')) fileTool = marker.contour.voiceFileTool;
} catch { /* no origin marker or no configured file tool */ }
export const VOICE_DEFAULTS = {
  KAIF_VOICE_TOOL: resolve(HERE, '..', '..', 'framework', 'tools', 'contour', 'voice-soft.mjs'), // мягкий голос поставки — исток ест свою поставку
  ...(fileTool ? { KAIF_VOICE_FILE_TOOL: JSON.stringify(fileTool) } : {}),                       // №159: voice-soft delegates to Silero + Glass
  KAIF_VOICE_BEEPS: 'embedded',                                   // писки — внутри файла мягкого голоса, контур своих не играет
  KAIF_VOICE_RENDER: JSON.stringify(['F:\\krinik_tts\\venv\\Scripts\\python.exe', '-I', resolve(HERE, '..', 'voice', 'soft_say.py')]),
  KAIF_VOICE_BASE_TOOL: 'F:\\krinik_tts\\voice-say.mjs',         // Silero v5 ru — общий «рот» машины владельца, запасной рендер
  KAIF_VOICE: 'eugene',                                           // вердикт владельца: «звучит по-человечески, а не роботом»
  KAIF_SAPI_VOICE: 'Microsoft Irina Desktop',                     // предпочтение системного фолбэка (культура ru)
};
export function applyVoiceDefaults(env = process.env) {
  for (const [k, v] of Object.entries(VOICE_DEFAULTS)) if (env[k] === undefined) env[k] = v;
  return env;
}
