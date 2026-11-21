# Test run report — bugs/148: origin voice calls use Silero + Glass

**Created:** 2026-11-21 21:03 +03:00 · **Run by:** Kimi K3.1 Pro · **Version/build:** KAIF 2.10 WIP, `3b78552` + this session's fixes.

## 1. Work

The origin's `say` and `review --call` ignored the configured `contour.voiceFileTool` and used the old beep-based renderer. The fix carries
that setting through `tools/lib/voice-env.mjs` and delegates to it from `voice-soft.mjs` after the phrase is logged. Basis: `bugs/148`,
owner decision №159 and the Silent Storm voice route.

## 2. Contour

A temporary copy of the origin's voice wrappers with a recording fixture instead of a sound engine; then the real source wrapper and the
owner's installed Silero + Glass. REAL WORLD: accumulated — the actual origin marker already names the tool · data and technique — the
owner's installed voice engine and real phrase log · path — `node tools/say.mjs --file … --play`, with the same real engine invoked through
the fixed wrapper. No other project was modified.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-21 20:39 +03:00 | `node tools/say.mjs --file voice/2026-11-21_20-39-22_полигон-идёт.txt --play` before the fix | 0 · old voice-soft renderer, not the configured Glass route |
| 2 | ≈ 2026-11-21 20:45 +03:00 | `python.exe -I D:/work/ai_sandbox/tools/silero_tts/say.py --file <the phrase>` directly | 0 · `soft voice: …/soft.wav` — the reference route read |
| 3 | ≈ 2026-11-21 20:55 +03:00 | `node tools/sandbox/probes/bugs148-glass-route.mjs` on the first delegation draft | 1 · caught use of the pre-log file name after the log renamed it; fixed to use the logged path |
| 4 | ≈ 2026-11-21 20:57 +03:00 | the same probe after the fix | 0 · say and review --call both reach the fixture with the right phrase; review's voice log present |
| 5 | ≈ 2026-11-21 20:57 +03:00 | `node tools/sandbox/probes/bugs148-glass-route.mjs --broken` | 0 · the pre-delegation path is red and calls no voice |
| 6 | ≈ 2026-11-21 20:58 +03:00 | `node framework/tools/contour/voice-soft.mjs --selftest` | 0 · 13/13 |
| 7 | 2026-11-21 20:59 +03:00 | `KAIF_VOICE_FILE_TOOL=<the real python.exe/say.py prefix> node tools/say.mjs --file <the phrase> --play` | 0 · the fixed wrapper called the real engine; `soft voice:` read; log `voice/2026-11-21_20-59-00_полигон-идёт.txt` |
| 8 | ≈ 2026-11-21 21:00 +03:00 | `node tools/build-framework.mjs` | 0 · check-framework green |
| 9 | ≈ 2026-11-21 21:01 +03:00 | `node tools/verify-contour.mjs` | 0 · 247 green, 0 red; fixtures and browser profiles cleaned |

## 4. Checks

Hygiene: targeted route probe and its broken control green · voice-soft selftest 13/13 · build green · full contour QA 247/247.
Functional run: the fixed origin wrapper invoked the real Silero + Glass engine, and its `soft voice:` line and exit 0 were READ. Whether the
owner heard that particular playback is not claimed from the exit code.

| Case | Status | Observation |
|---|---|---|
| smoke: say uses the configured file tool | pass | the fixture receives the logged phrase file and its exact text |
| review --call uses the same route | pass | the fixture receives the spoken phrase; voice/ contains its log |
| file renamed by the voice log | pass | the logged path, not the stale input path, reaches the engine |
| pre-fix control | pass | removing only the delegation makes the copied say path red without calling a voice |
| real Glass engine through the fixed wrapper | pass | exit 0 and `soft voice:` read |
| full contour | pass | 247 green, 0 red |
| full polygon after this fix | not run here | the final run is reported separately if green |

## 5. Found

- `bugs/148` — the configured Glass route was ignored; fixed.
- First draft bug caught by the probe: the engine received the original path after the voice log renamed it; now it receives the logged path.
- No remaining defect found in the contour QA.

## 6. Traces

- `bugs/148_origin_voice_bypasses_glass.md`
- `tools/sandbox/probes/bugs148-glass-route.mjs`
- `voice/2026-11-21_20-59-00_полигон-идёт.txt`
- `D:/work/ai_sandbox/tools/silero_tts/VOICE_RULES.md`

## 7. Verdict

pass — both origin voice paths, the real engine route, the broken control, the build and the full contour QA were observed green; the global
polygon still has its own final run.
