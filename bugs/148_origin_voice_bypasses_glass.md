# Bug 148 — голос истока обходит настроенный Silero + Glass и возвращается к пискам

**Status:** 🔧 fix pending verification — обе обёртки используют Glass; проба, реальный вызов и полная приёмка контура 247/247 зелёные; ждёт только закрывающий суд/полигон общего дерева
**Version/build:** исток KAIF 2.10, сборка 860 + рабочее дерево сессии Kimi · Windows 11 · **When/context:** 2026-11-21 20:48 +03:00, зов владельца во время полигона
**Severity:** S1 — нарушены прямое решение владельца №159 и его наблюдение за работой агента
**Fixing:** эта сессия, после текущего полигона
**Fix accepted when (observable):** `tools/say.mjs` и `tools/review.mjs --call` у истока используют `contour.voiceFileTool` из `.kaif/kaif.json`; вызов заканчивается кодом 0 и строкой `soft voice:` общего `silero_tts/say.py`, а журнал фразы остаётся в `voice/`. Проверка без проигрывания доказывает выбор маршрута; живая озвучка читает вывод и код.

## Вектор цели

**Maintain:** каждый голосовой зов истока использует принятый владельцем мягкий голос с Glass, без возврата к снятым пискам.

## Symptom

Вызов `node tools/say.mjs --file … --play` напечатал `voice-soft … (KAIF_VOICE_RENDER, voice eugene)` и использовал генератор с тремя писками, темпом 0,90 и срезом высоких. Владелец напомнил про Glass и назвал проект-источник настройки — Silent Storm.

## Repro (deterministic)

1. В маркере истока задан `contour.voiceFileTool` = `pythonw.exe -I D:/work/ai_sandbox/tools/silero_tts/say.py --file {file}`.
2. Записать фразу в `voice/`.
3. Запустить `node tools/say.mjs --file <она> --play`.
4. Маршрут идёт через `tools/lib/voice-env.mjs` → `framework/tools/contour/voice-soft.mjs`; настроенный file-tool не читается.

## Forensics

- `Silent-Storm-Krinik-Retribution/HOUSE_RULES.md` §6 называет тот же общий `silero_tts/say.py`; его `tools/kimi-voice-hook.mjs` вызывает его напрямую.
- Общий `VOICE_RULES.md` задаёт один WAV: 1 с тишины → Glass → 2 с паузы → Eugene, темп 1,08, бас +6 дБ на 140 Гц, без среза высоких.
- Прямой повтор фразы через `python.exe -I say.py --file …` завершился кодом 0 и напечатал `soft voice: …/soft.wav`.

## Root cause

Два независимых голосовых контракта: `voiceFileTool` читает только `kimi-permission-call.mjs`, а обёртки истока всегда назначают `KAIF_VOICE_TOOL = voice-soft.mjs` и никогда не читают эту настройку. Решение №159 сменило голос владельца, но старый маршрут остался на пути `say`/`--call`.

## Fix

`tools/lib/voice-env.mjs` читает `contour.voiceFileTool` из маркера и передаёт его в `KAIF_VOICE_FILE_TOOL`. `voice-soft.mjs` сначала записывает фразу в журнал, затем делегирует её настроенному file-tool; прежний рендер остаётся fallback без этой настройки. `say` и `review --call` идут этим общим путём.

**Проверено 2026-11-21 20:59 +03:00:** `tools/sandbox/probes/bugs148-glass-route.mjs` — обе обёртки вызывают file-tool с нужной фразой, `--broken` без делегирования красный и никого не вызывает; selftest voice-soft 13/13. Живой `tools/say.mjs` с реальным `python.exe -I silero_tts/say.py` — код 0, строка `soft voice: …/soft.wav`, журнал `voice/2026-11-21_20-59-00_полигон-идёт.txt`. Первая редакция читала путь до переименования журнала — проба это поймала, исправлено на зарегистрированный путь.

Гигиена: проба с контролем, selftest 13/13, сборка, полный `verify-contour` 247/247. Функциональный прогон: реальный вызов через обёртку с прочитанным кодом 0 и строкой `soft voice:`; повторный полный полигон учитывается только по его собственному итоговому отчёту.

TWINS: searched `KAIF_VOICE_TOOL` и `voiceFileTool` в `tools/` и `framework/` — found два пути истока (`tools/say.mjs`, `tools/review.mjs`) с общей `voice-env.mjs`; Kimi permission hook уже читает правильный контракт. Поставка `voice-soft` сохраняет прежний контракт для проектов без file-tool.

## Decisions made without the owner

- `[ИИ]` Починка использует уже записанный в маркере `contour.voiceFileTool`; новых путей и настроек не вводится. Поставка общего `voice-soft` этим исправлением не меняет свой дефолт.

## Links

`MASTER_PLAN.md` №159 · `researches/44` (голосовая развилка) · `plans/136` вход поля про Glass · `D:/work/ai_sandbox/tools/silero_tts/VOICE_RULES.md`.

kaif-fp: origin voice wrappers :: configured Glass route ignored :: v2.10
