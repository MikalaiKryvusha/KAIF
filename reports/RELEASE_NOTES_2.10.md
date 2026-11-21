<!--
  Release-body form: every prose paragraph is ONE line. GitHub preserves single line breaks.
  Before publishing, run the release-body guard and open the rendered release page.
-->

<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.10_GitHub_LOGO.webp" alt="KAIF 2.10" width="620">
</p>

> **Release date: 2026-11-21** · Minsk.

<a name="english"></a>
## English · [Русский](#русский)

**KAIF 2.10** makes the current 2.10 work available as a native Kimi Code deployment. The release deliberately carries the work as it stands: the unfinished feature scope moves to 2.11, whose baseline is the Kimi-adapted KAIF.

What KAIF is and how to use it — the [README](https://github.com/MikalaiKryvusha/KAIF#english). This page covers the release delta.

---

### ✨ What's new in 2.10

**1. Kimi Code is a native target.** `--agents kimi-code` writes `AGENTS.md` and all 37 skills into `.kimi-code/skills/<name>/SKILL.md`, including their references. Kimi-specific copies do not collide with Codex's `.agents/skills/`. `check`, `sync` and `update-verify` share one transformation, so a canonical edit reaches the Kimi copy mechanically.

**2. Localized skill metadata is valid YAML.** KAIF descriptions can contain `: `, and localization appends `Trigger aliases (<lang>): …`. Kimi copies now use folded blocks (`description: >-`), explicit `/skill:<name>` calls and `${KIMI_SKILL_DIR}` resource links. Use `/skill:resume` for KAIF's entry ritual; Kimi's unprefixed `/resume` belongs to session history.

**3. The voice starts before Kimi waits.** The optional `PermissionRequest` hook writes a localized UTF-8 phrase and starts the configured voice tool detached. Merge `.kaif/hooks/kimi-config-fragment.toml` into Kimi's user-level `config.toml`. `KAIF_VOICE_FILE_TOOL` accepts a JSON command prefix with a `{file}` slot, so a machine's Silero + Glass installation stays outside the template. Structured questions can use `AskUserQuestion(background=true)` when work continues.

**4. The current 2.10 work ships unchanged in scope.** The release includes the discipline, update, contour and verification work already present in the candidate. Its open criteria are recorded for 2.11; they are not presented here as completed features.

---

### ✅ Verification

A clean Russian `--agents kimi-code` install passed its manifest check and `sync`; all 37 Kimi skills and all 9 reference files were present. PyYAML 6.0.3 parsed every Kimi frontmatter. The permission-voice selftest and dry-run passed, and the installed Silero + Glass engine rendered a 7.14-second WAV without playback. The current Kimi session discovered all 37 project skills from `.kimi-code/skills/`.

---

### 📦 Installation and upgrading

Drop [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) into your project root and ask your agent to deploy KAIF. For a Kimi-only deployment, the installer accepts `--agents kimi-code`.

For an existing deployment, add `kimi-code` to `agents` in `.kaif/kaif.json` and run `node .kaif/kaif-core.mjs sync`. The voice hook is optional and requires the user-level Kimi configuration described above. No global Kimi configuration is rewritten by KAIF.

---

<a name="русский"></a>
## Русский · [English](#english)

**KAIF 2.10** делает текущую работу версии 2.10 доступной как родное развёртывание для Kimi Code. Версия выпускает работу в её текущем состоянии: незавершённый скоуп фич переходит в 2.11, а базой версии 2.11 становится KAIF, адаптированный под Kimi.

Что такое KAIF и как им пользоваться — [README](https://github.com/MikalaiKryvusha/KAIF#russian). Эта страница описывает изменения текущего выпуска.

---

### ✨ Что нового в 2.10

**1. Kimi Code — родная целевая система.** Установка с `--agents kimi-code` пишет `AGENTS.md` и все 37 навыков в `.kimi-code/skills/<name>/SKILL.md` вместе с их references. Копии Kimi не пересекаются с `.agents/skills/` для Codex. Команды `check`, `sync` и `update-verify` применяют одно преобразование. Правка канонического навыка попадает в копию Kimi механически.

**2. Метаданные локализованных навыков — корректный YAML.** Описания KAIF могут содержать `: `, а локализация добавляет `Trigger aliases (<lang>): …`. Копии Kimi используют folded block (`description: >-`), явные вызовы `/skill:<name>` и ссылки на ресурсы через `${KIMI_SKILL_DIR}`. Для входа в KAIF вызывайте `/skill:resume`; команда `/resume` без префикса принадлежит истории сессий Kimi.

**3. Голос запускается до ожидания Kimi.** Опциональный хук `PermissionRequest` записывает локализованную фразу в UTF-8 и запускает настроенный голосовой инструмент фоном. Добавьте `.kaif/hooks/kimi-config-fragment.toml` в пользовательский `config.toml` Kimi. Переменная `KAIF_VOICE_FILE_TOOL` принимает JSON-префикс команды со слотом `{file}`. Пути Silero + Glass остаются настройкой машины. Если работа продолжается, структурированный вопрос поддерживает `AskUserQuestion(background=true)`.

**4. Текущая работа 2.10 выпускается с прежним скоупом.** В выпуск вошли уже присутствующие в кандидате правила, обновления, интерактивный контур и проверки. Открытые критерии записаны для 2.11; эта страница не выдаёт их за завершённые фичи.

---

### ✅ Проверка

Чистая русская установка с `--agents kimi-code` прошла проверку манифеста и `sync`; на месте все 37 навыков Kimi и все 9 reference-файлов. PyYAML 6.0.3 разобрал каждый frontmatter Kimi. Selftest и dry-run голосового хука прошли, а установленный Silero + Glass создал WAV длительностью 7,14 секунды без проигрывания. Текущая сессия Kimi обнаружила все 37 навыков проекта в `.kimi-code/skills/`.

---

### 📦 Установка и обновление

Положите [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) в корень проекта и попросите агента развернуть KAIF. Для установки только под Kimi установщик принимает `--agents kimi-code`.

В существующем развёртывании добавьте `kimi-code` в `agents` файла `.kaif/kaif.json` и запустите `node .kaif/kaif-core.mjs sync`. Голосовой хук опционален и требует пользовательской настройки Kimi, описанной выше. KAIF не переписывает глобальную конфигурацию Kimi.
