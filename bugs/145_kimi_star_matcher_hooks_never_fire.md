# Bug 145 — Kimi: хуки KAIF с `matcher = "*"` никогда не запускаются

**Status:** 🔧 fix in the tree, live check pending (2026-11-21 17:19 +03:00: fragment fixed, guard 5zb red on `9263794` exactly 5, the owner's config rewritten
with a backup and `kimi doctor` OK; LIVE 2026-11-21 17:57 +03:00 — real `kimi -p` runs 1 and 3 of KA9: `PostToolUse` without a matcher fired (knowledge-moment
weighed the calls, test-after-code wrote the debt — on the 15:20 config with «*» the same trace was 0), `PreToolUse` without a matcher fired
(the closing gate); `PostToolUseFailure` and `PermissionRequest` not exercised (`kimi -p` runs Never Ask, no tool failed); DONE — after those
two are seen) · **Severity:** S1 (голос до ожидания разрешения — слово владельца — молча перестал звучать; заявления о живых хуках
неверны) · **Version/build:** KAIF 2.10 WIP (`9263794`), Kimi Code CLI 2.7.2 · **When/context:** 2026-11-21 16:52 +03:00, разведка `researches/50` (сессия 104)
**Fixing:** `plans/143`, первый шаг адаптации после разведки — до живой приёмки критериев 37–39.

## Goal vector / done when

**Type:** Achieve. Каждый хук фрагмента `framework/hooks/kimi-config-fragment.toml` запускается настоящим Kimi Code на своём событии.
**Fix accepted when:** живая сессия Kimi на проекте с KAIF пишет след каждого из пяти хуков, которые сейчас стоят с `"*"`
(`PostToolUse` × 3 · `PostToolUseFailure` · `PermissionRequest`); страж сборки краснеет на фрагменте с `"*"` (сборка `9263794`) и молчит на
исправленном.

## Symptom

В `~/.kimi-code/config.toml` владельца (запись 2026-11-21 15:20) пять записей `[[hooks]]` с `matcher = "*"`. Kimi компилирует матчер как
регулярное выражение; `*` — недопустимая регулярка, исключение глотается, и запись «не совпадает» ни с одним инструментом. Конфиг при этом
грузится без единого слова, `kimi doctor config` зелёный.

## Repro (deterministic)

1. Код харнеса (клон `MoonshotAI/kimi-code` `83e4dde`, `packages/agent-core-v2/src/features/externalHooks/internal/matchHooks.ts:129-136`;
   тот же код в установленном `@moonshot-ai/kimi-code/dist/main.mjs:254829-254836`):
   `if (pattern.length === 0) return true; try { return new RegExp(pattern).test(value); } catch { return false; }`.
2. `node -e "try{new RegExp('*')}catch(e){console.log(e.message)}"` → `Invalid regular expression: /*/: Nothing to repeat`.
3. Значит, `PostToolUse` с `matcher = "*"` не совпадает ни с `Read`, ни с `Edit`, ни с чем.

## Forensics

- Резервная копия конфига 2026-11-21 14:56 — шесть хуков соседнего проекта, у `PermissionRequest` матчера нет → голос двух вопросов в тот
  час звучал через хук соседа (`tools/kimi-voice-hook.mjs` поля), а не через `kimi-permission-call.mjs` KAIF.
- Конфиг 15:20 — 21 хук фрагмента KAIF, пять из них с `"*"`.
- Свод `s14` и отчёт `testcases/reports/2026-11-21_kimi_context_window.md` вызывали скрипты хуков НАПРЯМУЮ; строка «Kimi config wiring —
  pass» проверяла только присутствие записи. Путь «Kimi сам запускает хук» не наблюдался.

## Root cause

Синтаксис матчера перенесён из Claude Code, где `"*"` — законное «все инструменты» (`framework/hooks/settings-fragment.json:90,115`). У Kimi
матчер — регулярное выражение без якорей, а пустой или отсутствующий матчер совпадает со всем (`docs/en/customization/hooks.md`: «if
omitted, matches all»).

## Fix plan

1. Во фрагменте Kimi снять пять строк `matcher = "*"` (матчер не нужен — совпадёт со всем); `"Write|Edit|MultiEdit"` → `"^(Write|Edit)$"`,
   `"Agent"` → `"^Agent$"`, `"Skill"` → `"^Skill$"` (поиск без якорей задевает `AgentSwarm` и любое имя с подстрокой).
2. Страж сборки: каждый `matcher` Kimi-фрагмента компилируется `new RegExp`, `"*"` и другие недопустимые — отказ сборки; доказать красным на
   фрагменте `9263794`.
3. Поправить строки поставки «fragment wires the full KAIF set» только после живого наблюдения.
4. Конфиг владельца — только его словом (`plans/143`, риск 2), с резервной копией.

TWINS: searched `matcher *= *"\*"` и `"matcher": "*"` в `framework/` и `tools/` — found 5 sites in `framework/hooks/kimi-config-fragment.toml`
(:58 · :70 · :76 · :82 · :114); `settings-fragment.json` :90 · :115 — Claude Code, там `"*"` законен, не близнец.

## Decisions made without the owner

_(заполняется при закрытии)_

## Links

`researches/50` §6 · §12 · `bugs/144` (его живой путь закрыт этим багом) · `plans/143`.
