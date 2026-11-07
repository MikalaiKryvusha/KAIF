#!/usr/bin/env node
// say.mjs — сказать владельцу голосом из истока (решение №156): мягкий голос поставки с окружением голоса истока (`tools/lib/voice-env.mjs`).
// Фраза — сначала файлом: Write → `voice/<ГГГГ-ММ-ДД_ЧЧ-ММ-СС>_<смысл>.txt`, затем
//   node tools/say.mjs --file voice/<…>.txt --play
// Журнал фраз, имя по часам машины и смыслу, коды выхода — у `framework/tools/contour/voice-soft.mjs` (флаги те же).
// [TESTED: 2026-11-07 · прогоны 1 и 7 отчёта testcases/reports/2026-11-07_voice-soft-kumm-settings.md]
import { spawnSync } from 'node:child_process';
import { applyVoiceDefaults, VOICE_DEFAULTS } from './lib/voice-env.mjs';

const env = applyVoiceDefaults({ ...process.env });
const r = spawnSync(process.execPath, [VOICE_DEFAULTS.KAIF_VOICE_TOOL, ...process.argv.slice(2)], { stdio: 'inherit', env });
process.exit(r.status ?? 1);
