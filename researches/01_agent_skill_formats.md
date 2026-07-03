# Research 01 — Форматы контекста и навыков агентских систем (для механической трансляции)

> Тема: как формализованы пользовательские команды/навыки и авто-загружаемый контекст в целевых
> агентских системах — чтобы распаковку/трансляцию навыков KAIF сделать механической, а не «на словах».
> Породившие документы: `bugs/01_poor_kaif_deploy_on_local_llms.md`, `ideas/06_extended_skills.md`.
> Живой справочник (DONE не помечается). Создан 2026-07-03.
>
> Верифицировано по официальной документации 2026-07-03: **Roo Code** (приоритет №1 владельца),
> Claude Code, OpenAI Codex, GitHub Copilot, Cursor, Cline, Windsurf/Cascade, OpenCode, Devin, Junie,
> Aider, Continue.dev, Ollama/LM Studio.

---

## 🥇 Zoo Code (наследник Roo Code) — приоритет №1 владельца · ✅ верифицировано

**Zoo Code** (https://zoocode.dev · github.com/Zoo-Code-Org/Zoo-Code) — комьюнити-форк архивированного
Roo Code (апрель 2026; цепочка форков: Cline → Roo Code → Zoo Code). Сохраняет пути и настройки Roo Code
**дословно** (`.roo/`, `roo-cline.*`), так что всё ниже относится к обоим; архивный Roo Code —
байт-совместим.

**Источники:** https://docs.zoocode.dev/features/slash-commands ·
https://docs.zoocode.dev/features/custom-instructions · https://docs.roocode.com/features/slash-commands ·
https://docs.roocode.com/features/custom-instructions

- **Авто-контекст:** `AGENTS.md` в корне воркспейса поддерживается **нативно** (вкл. по умолчанию;
  фолбэк `AGENT.md`). Каталоги правил: `.roo/rules/` (все режимы), `.roo/rules-{modeSlug}/`
  (порежимно); фолбэк-файлы `.roorules`. Порядок: глобальные → режимные → `AGENTS.md` → проектные
  `.roo/rules/`; внутри каталога — по алфавиту; всё агрегируется.
- **Команды:** кастомные слэш-команды — markdown-файлы в `.roo/commands/` (проект) или
  `~/.roo/commands/` (глобально). **Имя файла = имя команды** (lowercase, дефисы). Frontmatter
  (все поля опциональны): `description`, `argument-hint`, `mode`. Только `.md`. Вызов: `/` + fuzzy-меню.
- **Трансляция KAIF → Zoo Code (механическая, 1:1):** `.claude/skills/<name>/SKILL.md` →
  `.roo/commands/<name>.md`; поле `name:` отбросить (его несёт имя файла), `description:` и тело —
  перенести как есть. Плюс `AGENTS.md` → указатель на `AGENT_GUIDE.md` и `.roo/rules/kaif.md` с
  перечнем ключевых документов. Custom Modes (`.roomodes`) для навыков НЕ использовать — это персоны,
  а не ритуалы. Валидация: число команд на диске == числу навыков KAIF.
- Детали: проектные команды перекрывают глобальные с тем же именем; встроенные команды перекрыть
  нельзя; правила из `.roo/rules/` читаются рекурсивно; легаси-фолбэки `.roorules` и даже
  `.clinerules` (Roo — форк Cline). Встроенный `/init` сам создаёт порежимные `AGENTS.md` в
  `.roo/rules-*` — не конфликтовать с ним при деплое.
- Мета: docs.roocode.com редиректит на roocodeinc.github.io/Roo-Code (архив после закрытия Roo Code);
  действующая документация — **https://docs.zoocode.dev**. При реализации сверяться с ней.

## Claude Code (референсная система) · ✅ верифицировано

**Источники:** https://code.claude.com/docs/en/skills · https://code.claude.com/docs/en/memory

- **Авто-контекст:** `CLAUDE.md` (проект: `./CLAUDE.md` или `./.claude/CLAUDE.md`; личный:
  `~/.claude/CLAUDE.md`; локальный: `CLAUDE.local.md`). Поддерживает импорты `@path/to/file`.
  **`AGENTS.md` нативно НЕ читается** — официальные обходы: `CLAUDE.md` с `@AGENTS.md` или симлинк.
- **Навыки:** `.claude/skills/<name>/SKILL.md` — формат KAIF-исходников. Все поля frontmatter
  опциональны; `description` — рекомендован (по нему модель сама вызывает навык); имя команды даёт
  каталог. Легаси `.claude/commands/<name>.md` продолжают работать (слиты с навыками). Следует
  открытому стандарту **Agent Skills (agentskills.io)**. Рекомендация: SKILL.md < 500 строк.

## OpenAI Codex · ✅ верифицировано (адаптер обновлён — прежний устарел)

**Источники:** https://developers.openai.com/codex/skills ·
https://developers.openai.com/codex/guides/agents-md

- **Авто-контекст:** `AGENTS.md` нативно: глобальный `~/.codex/AGENTS.md` + обход от корня git-репо до
  cwd (все конкатенируются, ближние важнее; лимит 32 KiB, настраивается).
- **Навыки:** у Codex теперь есть **нативные скилы** по стандарту agentskills.io: каталог
  `SKILL.md` (обязательны `name` + `description`) в **`.agents/skills/`** (проект; также
  `~/.agents/skills/`). Прежние `~/.codex/prompts/*.md` — **deprecated** в пользу скилов.
- **Трансляция:** скопировать каталог навыка KAIF в `.agents/skills/<name>/` почти без изменений
  (`name` в frontmatter обязателен — оставить).

## GitHub Copilot · ✅ верифицировано

**Источники:** https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions ·
https://code.visualstudio.com/docs/copilot/customization/prompt-files

- **Авто-контекст:** `AGENTS.md` поддерживается (корневой — основной, вложенные — локальные; и в
  VS Code, и у cloud-агента), плюс `.github/copilot-instructions.md` (репо-широкий, ≤ «2 страниц») и
  path-scoped `.github/instructions/*.instructions.md` (frontmatter `applyTo`).
- **Команды:** prompt-файлы `.github/prompts/<name>.prompt.md` (VS Code/VS/JetBrains; вызов `/name`).
  Frontmatter опционален: `description`, `name`, `argument-hint`, `agent`, `model`, `tools`.
- **Трансляция:** SKILL.md → `.github/prompts/<name>.prompt.md`; `description` перенести, тело как есть.

## Cursor · ✅ верифицировано (важно!)

**Источники:** https://cursor.com/docs/context/skills · https://cursor.com/docs/context/rules

- **Авто-контекст:** `AGENTS.md` в корне — подтверждён (вложенные тоже). Правила: `.cursor/rules/*.mdc`
  (frontmatter `description`/`globs`/`alwaysApply`; < 500 строк).
- **Навыки:** Cursor поддерживает **Agent Skills / SKILL.md** (стандарт agentskills.io): проектные
  `.agents/skills/` и `.cursor/skills/`; обязательны `name` (= имя папки) + `description`.
  **Легаси-совместимость: Cursor читает и `.claude/skills/` напрямую** — навыки KAIF в исходном виде
  подхватываются без трансляции. Старые `.cursor/commands/*.md` — легаси, слиты в скилы.

## Остальные системы — кратко · ✅ верифицировано 2026-07-03

| Система | Авто-контекст | Команды/навыки |
|---|---|---|
| Cline | `.clinerules/` (+ `AGENTS.md` авто-детект) | **Skills** (≥3.48): `SKILL.md` в `.cline/skills/`, `.clinerules/skills/` и **`.claude/skills/`**; вызов `/skill-name` или авто |
| Windsurf/Cascade (ныне под Devin/Cognition) | `.devin/rules/` (легаси `.windsurf/rules/`), `AGENTS.md` поддержан; лимит 12k символов/файл | workflows `.windsurf/workflows/<name>.md`, вызов `/name`, только вручную, ≤12k символов |
| OpenCode | `AGENTS.md` (основной) + читает `CLAUDE.md` и **`~/.claude/skills/`** | команды `.opencode/commands/<name>.md`; **Skills**: `.opencode/skills/` и `.claude/skills/`, `.agents/skills/` |
| Devin | Knowledge (авто-инжест `AGENTS.md`, `CLAUDE.md`, `.cursorrules`…) | **Skills**: `.agents/skills/<name>/SKILL.md` (+ сканирует `.claude/skills/` и др.) |
| JetBrains Junie | `.junie/AGENTS.md` → корневой `AGENTS.md` (легаси `.junie/guidelines.md`) | нет команд → `kaif-skills/` + указатель |
| Aider | `CONVENTIONS.md` через `read:` в `.aider.conf.yml` (AGENTS.md не подтверждён) | нет кастомных команд → `kaif-skills/` |
| Continue.dev | `.continue/rules/*.md` (+ `AGENTS.md` по issue-трекеру) | prompt-файлы с `invokable: true`, вызов `/name` |

**Локальные LLM-стеки (критично для bug 01):** Ollama/LM Studio — только рантаймы, своих файлов
инструкций/навыков не имеют; всё определяет обвязка (чаще всего Roo Code/Cline). Контекст Ollama по
умолчанию — **4096 токенов**, и всё сверх `num_ctx` **молча отбрасывается** (без ошибки!) — большой
всегда-загружаемый файл (KAIF.md целиком) может быть тихо обрезан или вытеснить историю. Отсюда прямое
объяснение симптомов bug 01 (модель «забывает» файлы) и требование: этапная + механическая распаковка,
маленькие атомарные шаги, on-demand навыки вместо всегда-в-контексте.

---

## Выводы для KAIF (механическая распаковка/трансляция)

1. **Экосистема сошлась на двух стандартах:** `AGENTS.md` (авто-контекст: нативно у Zoo/Roo Code,
   Codex, Copilot, Cursor, Cline, Windsurf, OpenCode, Junie; у Claude Code — через `@AGENTS.md`) и
   **Agent Skills / SKILL.md** (agentskills.io: Claude Code, Codex, Cursor, Cline, Devin, OpenCode —
   причём Cursor, Cline и OpenCode читают `.claude/skills/` напрямую). Формат исходников KAIF оказался
   в ядре стандарта — трансляция всюду тривиальна.
2. **Распаковка навыков — механическая операция.** Везде: markdown + маленький YAML-frontmatter;
   отличаются только путь и судьба поля `name`. Творческой (LLM-)работы требует только локализация
   `description`/тела — не структура.
3. **Общий алгоритм трансляции** (псевдокод):
   `для каждого навыка: (путь, frontmatter) = адаптер(система) → записать файл → путь в манифест;
   затем: валидация манифеста (все файлы существуют, непусты) → недостающее доделать → до 100%`.
4. **Маппинг полей:**

   | KAIF | Zoo Code | Codex | Copilot | Cursor |
   |---|---|---|---|---|
   | путь | `.roo/commands/<n>.md` | `.agents/skills/<n>/SKILL.md` | `.github/prompts/<n>.prompt.md` | `.claude/skills/` читается как есть |
   | `name:` | отбросить (имя файла) | оставить | опционально | оставить |
   | `description:` | перенести | перенести | перенести | перенести |
   | тело | как есть | как есть | как есть | как есть |

5. Этап 1 распаковки (структура из блоков `FILE:`) скриптуется полностью — встроенный `kaif-unpack.mjs`
   в ядре + манифест + цикл валидации (план `plans/09_kaif_1.2_anonymous_kaif.md`).
