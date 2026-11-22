<!--
  Release-body form: every prose paragraph is ONE line. GitHub preserves single line breaks.
  Before publishing, run the release-body guard and open the rendered release page.
-->

<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.10_GitHub_LOGO.webp" alt="KAIF 2.10 — Confronted KAIF" width="620">
</p>

> **Release date: 2026-11-22** · Minsk.

<a name="english"></a>
## English · [Русский](#русский)

**KAIF 2.10 — Confronted KAIF** makes Kimi Code a native KAIF target. The release also keeps the completed work of this cycle: machine-written time, project memory at the moment of discovery, four context-window stages, a lasting farewell, safer owner pages and stronger checks of the agent's own claims. The unfinished feature scope moves to 2.11 with its original scenarios and plans.

What KAIF is and how to use it — the [README](https://github.com/MikalaiKryvusha/KAIF#english). This page covers what changed in 2.10.

---

### ✨ What's new in 2.10

**1. Kimi Code receives a native project contour.** Installation with `--agents kimi-code` writes `AGENTS.md` and all 37 skills into `.kimi-code/skills/<name>/SKILL.md`, together with their reference files. The Kimi copies use valid folded YAML descriptions, complete localized trigger text, explicit `/skill:<name>` calls and `${KIMI_SKILL_DIR}` resource links. `check`, `sync` and `update-verify` apply the same transformation. The canonical set lives in `.kaif/skills-canonical/`; a Kimi-only installation creates no `.claude/` directory, and updates carry local skill edits into the neutral home. Edit the canonical skills and run `node .kaif/kaif-core.mjs sync`; the Kimi copies follow mechanically. Use `/skill:resume` for the KAIF entry ritual because Kimi's unprefixed `/resume` opens its own session history.

**2. One user-level dispatcher connects Kimi hooks to every KAIF project.** `node .kaif/kaif-core.mjs wire-hooks --kimi` installs `<Kimi home>/kaif/kimi-hook.mjs` and updates only the marked KAIF block in Kimi's user-level `config.toml`. The command creates a timestamped backup and validates the result with `kimi doctor config`. The dispatcher finds the project from the session folder, works from subfolders and stays silent outside KAIF or when the project sets `"hooks": "off"`. Reload Kimi or start a new session after wiring.

**3. The hooks follow Kimi's real event contract.** Prompt refresh, the leading `resume` order, machine time, knowledge recording, subagent briefs, STATUS freshness, test debt, context-window stages, farewell capture and the permission voice have Kimi-specific delivery. Observation-only events carry pending work to the next prompt. A `Stop` block opens a continuation in a session that stays alive; `kimi -p` can exit before that continuation when no other work is pending. Kimi has no documented `updatedInput`, so clock writes and subagent launches use an explicit corrected retry.

**4. KAIF closes Kimi chats through explicit stages.** The Kimi stages are 70 % for a warning, 75 % for a logical cut, 80 % for soft closure and 90 % for forced closure, counted against Kimi's compaction point. A soft entry never satisfies the forced stage. After forced closure starts, only STATUS/FAREWELL, date and the git/commit handover commands pass. The public Kimi Code fork adds `[loop_control] auto_compact = false`: threshold, after-step and overflow-recovery automation return no compaction, while manual `/compact` remains available. Hook selftests, mutants K1/K3–K7 and the deployed hook suite cover these paths. The earlier live acceptance at 87 % covered only the soft entry and was retracted after a later compaction in the same session. Full live closure and the VSIX acceptance remain release gates.

**5. The agent leaves knowledge and a handoff on disk.** `clock-now.mjs` fills time placeholders from the machine clock. `subagent-preamble.mjs` enters every subagent through the project canon and its brief boundaries. `knowledge-moment.mjs` reminds the agent to record a discovery or correct a stale map in the same turn. `test-after-code.mjs` records new product code as test debt and refuses the first stop until a run of the right kind clears it. `stop-farewell-capture.mjs` writes the closing message to `FAREWELL_MESSAGE_FROM_THE_PREVIOUS_CHAT.md`, including a quota death on `StopFailure`; the next `/resume` reads that file first.

**6. The owner's pages and voice behave as one working contour.** Only one question page can be open at a time. A queue page survives reading a notice while questions remain, saves each answer and closes after the last one. Images in questions render at the column width and open in full. Two documents with the same filename keep separate decisions and page locks. The voice call uses the configured Silero + Glass route, speaks the owner's name once and writes every spoken phrase into `voice/`. The owner's own message lifts quiet hours for 60 minutes; an explicit owner quiet window remains in force.

**7. Checks make stronger claims about themselves.** A red run names the stand and looks for one systemic measurement cause before blaming the product. A feature cannot be called tested while its positive smoke case has not passed. The run-report linter accepts a bulleted `Functional run:` line. The agent builds available test conditions itself. Anonymous installation uses neutral owner wording. The maps checkpoint refuses untouched template guidance while accepting genuine generic notation in filled project maps. Update verification understands filled placeholders, and the closing skills reject a sweeping `git add -A` stage.

**8. The release boundary is explicit.** Version 2.10 publishes the current working state after the native Kimi contour and its live acceptance. Nineteen unfinished earlier criteria move to `ideas/33` for 2.11; they are not presented as completed features. The local interactive contour supports the owner's Windows path. Kimi's hooks are user-level, so they require the validated global wiring and a new or reloaded session.

---

### ✅ Verification

A clean Russian Kimi installation passed its manifest check and `sync`, with all 37 skills and 9 reference files present and every frontmatter parsed. The three installation findings have separate red controls against their exact previous constructs. Real Kimi events proved the five formerly silent hooks, `Stop` continuation, session-local `--alive`, `PermissionRequest` with its voice artifact, and the order of the 75/80/85 % stages before compaction. The durable live-order probe returns PASS with `compactions:[]` and rejects quoted documentation and a compaction-before-close fixture. The full sandbox polygon is green: 28 suites.

---

### 📦 Installation and upgrading

Drop [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) into your project root and tell your agent to deploy KAIF. For a Kimi-only deployment, ask for Kimi Code as the agent system. After installation, call KAIF rituals as `/skill:<name>`.

For an existing deployment, say *"update KAIF"*. The update preserves project documents and local edits, synchronizes the Kimi skill copies and names `wire-kimi-hooks` when Kimi Code is configured on the machine. Keep the owner-facing decisions in `interviews/` even when Kimi's Never Ask mode runs tool calls without confirmation. Deliver the update field report with `node .kaif/kaif-core.mjs report <file>`.

---

<a name="русский"></a>
## Русский · [English](#english)

**KAIF 2.10 — Confronted KAIF** делает Kimi Code родной целевой системой KAIF. В выпуск вошла и завершённая работа этого цикла: время по часам машины, память проекта в момент находки, четыре ступени контекстного окна, сохранённое прощание, более надёжные страницы владельца и более строгие проверки заявлений агента. Незавершённый скоуп переходит в 2.11 вместе с исходными сценариями и планами.

Что такое KAIF и как им пользоваться — [README](https://github.com/MikalaiKryvusha/KAIF#russian). Эта страница описывает изменения версии 2.10.

---

### ✨ Что нового в 2.10

**1. Kimi Code получает родной проектный контур.** Установка с `--agents kimi-code` создаёт `AGENTS.md` и записывает все 37 навыков в `.kimi-code/skills/<name>/SKILL.md` вместе с reference-файлами. Копии Kimi используют корректные многострочные YAML-описания, полный текст локализованных триггеров, явные вызовы `/skill:<name>` и ссылки на ресурсы через `${KIMI_SKILL_DIR}`. Команды `check`, `sync` и `update-verify` применяют одно преобразование. Канонический набор живёт в `.kaif/skills-canonical/`; установка только для Kimi не создаёт каталог `.claude/`, а обновление переносит локальные правки навыков в нейтральный каталог. Правьте канонические навыки и запускайте `node .kaif/kaif-core.mjs sync`: копии Kimi обновятся механически. Для входа в KAIF вызывайте `/skill:resume`; команда `/resume` без префикса открывает собственную историю сессий Kimi.

**2. Один пользовательский диспетчер подключает хуки Kimi ко всем проектам KAIF.** Команда `node .kaif/kaif-core.mjs wire-hooks --kimi` устанавливает `<дом Kimi>/kaif/kimi-hook.mjs` и меняет только отмеченный блок KAIF в пользовательском `config.toml` Kimi. Перед записью команда создаёт резервную копию с меткой времени, а после записи проверяет конфигурацию через `kimi doctor config`. Диспетчер находит проект от папки сессии, работает из подпапок и молчит вне KAIF или при настройке проекта `"hooks": "off"`. После подключения перезагрузите Kimi или откройте новую сессию.

**3. Хуки следуют реальному контракту событий Kimi.** Освежение контекста, приказ ведущего слова `resume`, машинное время, запись знаний, брифы субагентов, свежесть STATUS, тестовый долг, ступени окна, прощание и голосовой зов получили доставку через события Kimi. События, которые только наблюдают, переносят отложенную работу в следующий промпт. Блок `Stop` открывает продолжение в сессии, которая остаётся живой; `kimi -p` может завершиться до продолжения, если другой работы не осталось. В Kimi нет документированного `updatedInput`. При записи времени и запуске субагента агент явно повторяет вызов с исправленными входными данными.

**4. KAIF закрывает чаты Kimi по явным ступеням.** Ступени Kimi: 70 % — предупреждение, 75 % — логический срез, 80 % — мягкое закрытие, 90 % — срочное закрытие. Доли считаются от точки собственного сжатия Kimi. Вход в мягкое закрытие не засчитывается как вход в срочное. После входа в срочное закрытие хук разрешает только STATUS/FAREWELL, часы и git-команды эстафеты. Публичный форк Kimi Code добавляет `[loop_control] auto_compact = false`: пороговый, послемодульный и overflow-путь завершаются без сжатия, ручной `/compact` сохраняется. Самопроверка хука, мутанты K1/K3–K7 и развёрнутый свод хуков зелёные. Прежняя живая приёмка на 87 % покрыла только вход в мягкое закрытие; последующее сжатие в той же сессии отозвало её. Полное живое закрытие и приёмка VSIX остаются воротами выпуска.

**5. Агент оставляет знания и эстафету на диске.** Хук `clock-now.mjs` заполняет метки времени по часам машины. Хук `subagent-preamble.mjs` вводит каждого субагента через канон проекта и границы брифа. Хук `knowledge-moment.mjs` напоминает записать находку или исправить устаревшую карту в текущем ходу. Хук `test-after-code.mjs` записывает новый код продукта в тестовый долг и отклоняет первую остановку, пока прогон нужного вида долг не погасит. Хук `stop-farewell-capture.mjs` пишет закрывающее сообщение в `FAREWELL_MESSAGE_FROM_THE_PREVIOUS_CHAT.md`, включая завершение сессии по квоте через `StopFailure`; следующий `/resume` читает этот файл первым.

**6. Страницы и голос владельца работают одним контуром.** Одновременно открыта одна страница вопросов. Страница очереди продолжает жить после прочтения сообщения, пока остаются вопросы, записывает каждый ответ и закрывается после последнего. Картинки в вопросах выводятся по ширине колонки и открываются целиком. Два документа с одинаковым именем файла хранят решения и замки страниц раздельно. Голосовой зов использует настроенный маршрут Silero + Glass, произносит имя владельца один раз и записывает каждую сказанную фразу в `voice/`. Собственное сообщение владельца снимает тихие часы на 60 минут; явно заданное владельцем окно тишины остаётся в силе.

**7. Проверки точнее называют свои доказательства.** Красный прогон описывает стенд и ищет одну системную причину замера до вывода о поломке продукта. Фичу нельзя назвать протестированной, пока её позитивный смоук не прошёл. Линтер отчётов принимает строку `Функциональный прогон:` в форме пункта списка. Агент сам строит доступные условия теста. Обезличенная установка использует нейтральные слова о владельце. Контрольная точка карт отклоняет незаполненные указания шаблона и принимает настоящую общую нотацию в заполненных картах проекта. Проверка обновления понимает заполненные заглушки, а навыки закрытия отклоняют подметающий `git add -A`.

**8. Граница выпуска названа явно.** Версия 2.10 публикует текущее рабочее состояние после родного проектного контура Kimi и его живой приёмки. В `ideas/33` для версии 2.11 перенесены девятнадцать незавершённых прежних критериев; эти возможности не представлены завершёнными. Локальный интерактивный контур поддерживает Windows-путь владельца. Хуки Kimi находятся на пользовательском уровне. Им нужны проверенная глобальная проводка и новая или перезагруженная сессия.

---

### ✅ Проверка

Чистая русская установка Kimi прошла проверку манифеста и `sync`: на месте все 37 навыков и 9 reference-файлов, каждый frontmatter разобран. Три установочные находки имеют отдельные красные контроли на своих точных прежних конструкциях. Реальные события Kimi доказали пять прежде молчавших хуков, продолжение `Stop`, `--alive` своей сессии, `PermissionRequest` с голосовым артефактом и порядок ступеней 75/80/85 % до сжатия. Постоянная проба живого порядка возвращает PASS с `compactions:[]` и отклоняет как цитату документации, так и фикстуру со сжатием до закрытия. Полный песочный полигон зелёный: 28 сводов.

---

### 📦 Установка и обновление

Положите [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) в корень проекта и скажите агенту развернуть KAIF. Для установки только под Kimi назовите Kimi Code агентской системой. После установки вызывайте ритуалы KAIF как `/skill:<имя>`.

В существующем развёртывании скажите *«обнови KAIF»*. Обновление сохраняет документы и локальные правки проекта, синхронизирует копии навыков Kimi и называет пункт `wire-kimi-hooks`, когда Kimi Code настроен на машине. Решения уровня видения оставляйте в `interviews/`, даже если режим Never Ask выполняет вызовы инструментов без подтверждения. Отправьте полевой отчёт обновления командой `node .kaif/kaif-core.mjs report <файл>`.
