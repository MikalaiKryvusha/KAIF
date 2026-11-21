# Исследование 48 — адаптация KAIF 2.10 под Kimi Code

> **Создан:** 2026-11-21 14:02 +03:00 (Kimi Code; слово владельца в чате: «делаем адаптацию KAIF под KIMI агентскую ИИ систему» ·
> «включаем это в KAIF 2.10» · затем: «Адаптируем KAIF 2.10 под KIMI и выпускаем в том виде, в каком он есть»).
> **Родитель:** `plans/136` · `framework/adapters/_template.md` · `researches/01`.
> **Статус:** 🟢 проверено 2026-11-21 14:02 +03:00: официальные страницы Kimi Code прочитаны; sandbox, PyYAML и голос зелёные; текущая сессия Kimi увидела 37 project skills из `.kimi-code/skills/`.
> **Вовне:** адаптер и выпуск KAIF 2.10; незавершённые фичи 2.10 — в `ideas/33` для 2.11 словом владельца.

## 1. Внешняя правда

Источники — только официальная документация Kimi Code, прочитана `FetchURL` 2026-11-21:

- Agents and Sub-Agents: https://www.kimi.com/code/docs/en/kimi-code-cli/customization/agents.html
- Agent Skills: https://www.kimi.com/code/docs/en/kimi-code-cli/customization/skills.html
- Hooks: https://www.kimi.com/code/docs/en/kimi-code-cli/customization/hooks.html
- Plugins: https://www.kimi.com/code/docs/en/kimi-code-cli/customization/plugins.html

Подтверждено для **Kimi Code CLI**:

1. Проектные инструкции читаются из `AGENTS.md`; также поддержаны `.kimi-code/AGENTS.md` и глобальный
   `$KIMI_CODE_HOME/AGENTS.md`. Для KAIF достаточно уже генерируемого корневого `AGENTS.md`.
2. Навыки в форме каталога `<name>/SKILL.md` обнаруживаются в проектных `.kimi-code/skills/` и
   `.agents/skills/`; обязательны frontmatter `name` и `description`. Канонические навыки KAIF уже имеют оба поля.
3. Ручной вызов навыка — `/skill:<name>`; автоматический вызов разрешён по `description` и `whenToUse`.
   Аргументы `$ARGUMENTS`, `$0`, `$1` и `${KIMI_SKILL_DIR}` поддержаны нативно.
4. Плагины могут нести навыки, агентов, команды, MCP и хуки, но для проектного развёртывания KAIF плагин не нужен:
   контекст и навыки — уже поддержанные проектные файлы.
5. Хуки Kimi настраиваются в пользовательском `~/.kimi-code/config.toml` или в манифесте включённого плагина;
   проектного файла хуков нет. `UserPromptSubmit`, `PreToolUse` и `Stop` могут влиять на ход; `PreCompact` и
   `PostCompact` — observation-only. Поэтому Claude-фрагмент `.claude/settings.json` в Kimi не переносится и не
   выдаётся за работающий.

## 2. Соответствие текущей машинерии KAIF

`framework/installer/KAIF-CORE.mjs` уже умеет:

- всегда писать корневой `AGENTS.md` с указателями на канон;
- копировать навыки и их `references/` из `.claude/skills/` в `.agents/skills/` для Codex;
- пересинхронизировать копии командой `sync` и проверять их в `check`/`update-verify`.

Kimi должен быть самостоятельным значением `--agents kimi-code`: иначе маркер проекта не сможет отличить
выбранный Kimi от Codex, а суженная установка и последующий `sync` не будут знать целевую систему.
Соседняя адаптация использует общий `.agents/skills/`, но в многосистемной поставке Kimi и Codex записывали бы
разный текст в одни файлы. Поэтому поставка использует официальный Kimi-specific `.kimi-code/skills/`.

## 3. Минимальная поставка в 2.10

1. Новый адаптер `framework/adapters/kimi-code.md` с проверенными путями, вызовом и границей хуков.
2. `kimi-code` добавляется в целевые системы установщика и в набор по умолчанию.
3. Для `kimi-code` навыки копируются в `.kimi-code/skills/` с Kimi-преобразованием; references едут рядом;
   `AGENTS.md` остаётся контекстом.
4. Проверка чистой установки `--agents kimi-code`: каждый навык и reference на месте, маркер содержит
   `agents: ["kimi-code"]`, `check` и `sync` зелёные, изменение канонического навыка доходит до копии.
5. Документация называет шесть целевых систем вместо пяти; счёт адаптеров обновляется через существующий counter-guard.

Не входит: отдельный Kimi-плагин, собственные субагенты KAIF, автоматическая запись глобального `config.toml`,
перенос незавершённых фич 2.10. Это не нужно для работы контекста и навыков и не должно задерживать выпуск.

## 4. Полевая консультация и YAML

Владелец указал на параллельную адаптацию в `D:\work\ai_sandbox\Silent-Storm-Krinik-Retribution`.
Соседнее дерево прочитано без правок; вопросы коллеге переданы новым файлом
`reports/2026-11-21_kimi_consultation_from_kaif.md` в том проекте. Его `tools/check-kimi-skills.mjs`
и адаптированные `.agents/skills/` показывают три дополнительных преобразования: folded YAML description,
явный `/skill:<name>` вместо `/<name>`, `${KIMI_SKILL_DIR}` для ссылок на ресурсы навыка.

Причина YAML подтверждена независимо: исходный `description: Stops ONLY when: (1) …` отклонён PyYAML 6.0.3
с `mapping values are not allowed here`; та же форма получает `Trigger aliases (<lang>): …` от `applyLanguage`.
Поэтому копирование «как есть» для Kimi недостаточно: его копия переводит description в `description: >-`
с отступом тела. Это валидный YAML и сохраняет одну строку значения после свёртывания.

Полевой скрипт — наблюдение и источник гипотез, не самостоятельное доказательство контракта Kimi: его собственная
шапка на момент чтения была `[NOT-TESTED]`. Официальные пути и синтаксис выше подтверждены документацией;
окончательная проверка поставки — установка, YAML-parse каждой Kimi-копии и живой каталог/вызов Kimi.

**Ответ коллеги получен 2026-11-21 в том же файле.** До нормализации все 37 файлов отклонялись PyYAML 6.0.3
на `description`; после folded block все 37 прошли PyYAML и живую загрузку Kimi. Вызов `Skill` для
`fable-method` из `.agents/skills/` успешен, `${KIMI_SKILL_DIR}` развернулся в абсолютный путь навыка.
Kimi не показал пофайловых ошибок: навыки просто отсутствовали в каталоге. Короткие `/name` могут конфликтовать;
`/resume` занято встроенной командой, поэтому `/skill:resume` обязателен для KAIF. Хуки из `.claude/settings.json`
Kimi не читает. Проверка соседнего скрипта не является полным YAML-парсером и не проверяет тело, ресурсы,
scopes и hooks — эти границы учтены в нашем sandbox и живой проверке.

## 5. Голос до блокирующего ожидания

Официальный Built-in Tools (https://www.kimi.com/code/docs/en/kimi-code-cli/reference/tools.html), прочитан
2026-11-21: `AskUserQuestion(background=true)` сразу возвращает task id и доставляет ответ позднее; `Bash`
поддерживает `run_in_background=true`; foreground Bash блокирует ход. Hooks подтверждают `PermissionRequest`
перед ожиданием разрешения. Слово владельца: голосовой зов обязан идти ДО вопроса или запускаться параллельно
неблокирующе — после входа в ожидание он уже не услышан.

Полевой рецепт коллеги: `PermissionRequest` → UTF-8 файл → detached Silero + Glass; локальные пути и параметры —
`D:/work/ai_sandbox/tools/silero_tts/VOICE_RULES.md`. В поставку перенесён не абсолютный путь, а контракт
`KAIF_VOICE_FILE_TOOL` (JSON command prefix с `{file}`); по умолчанию — shipped `voice-soft.mjs`. Имя, проект,
язык, тихие часы и журнал берутся из существующего контура KAIF. Пример проводки — `kimi-config-fragment.toml`;
глобальный Kimi config установщик автоматически не переписывает. Движок также принимает `contour.voiceFileTool`
в маркере развёртывания; переменная среды сильнее маркера.

## 6. Полная активация хуков

Коллега подтвердил установку официального Kimi CLI 2.7.2, doctor и живую активацию. Его схема перенесена и
расширена на весь набор KAIF. События observation-only не выдаются за инжекцию: SessionStart/PostCompact пишут
pending mark, PostToolUse knowledge queue читается следующим UserPromptSubmit. Kimi usage — формула
`inputOther + inputCacheRead + inputCacheCreation`; окно читается из `max_context_size` модели, явный override —
`contextWindow.tokens`.

Конфиг истока изменён через копию `config-new.toml`, doctor, timestamped backup и только затем overwrite.
Старые абсолютные пути соседа заменены проектно-переносимыми `.kaif/hooks/…`, дублей событий нет. Живая проверка
`kimi -p` 2026-11-21 показала SessionStart → UserPromptSubmit, refresh timer, clock-now и knowledge-moment;
ответ модели — OK. Голосовой зов до двух вопросов владельца реально прошёл через Silero + Glass, со строкой
`soft voice:` и кодом 0. Полный контрактный свод s14 с Kimi-случаями зелёный.
