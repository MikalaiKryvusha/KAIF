# Исследование 46 — доверие папке в Claude Code: что сессия теряет без него и как это увидеть

> **Создан:** 2026-11-17 · **Родитель:** `bugs/138` (план, п. 3 — FORK) · **Статус:** 🟢 цитаты вендора сверены грепом по живым страницам
> 2026-11-17 ≈ 15:03 +03:00; поведение расширения 2.1.326 — снято с его кода и журнала на машине владельца · **Вовне:** класс в поставку —
> строка задания установки и обновления, `check` (решение по развилке — `bugs/138`)
>
> Метод: страницы документации вендора прочитаны субагентом (бриф — пять вопросов, ответ цитатами с адресом), ключевые цитаты сверены
> `curl -s https://code.claude.com/docs/en/<страница>.md | grep -o "<цитата>"`; журнал изменений вендора не прочитан (страница GitHub
> отдала только навигацию). Код расширения — `~/.vscode/extensions/anthropic.claude-code-2.1.326-win32-x64/extension.js`, только чтение.

## 1. Что говорит вендор (дословно, сверено)

| Цитата | Страница |
|---|---|
| «Claude Code checks workspace trust before it runs any hook from a settings file.» | https://code.claude.com/docs/en/hooks |
| «… holds back hooks from every settings file, including your own `~/.claude/settings.json`, until you accept the workspace trust dialog for the folder …» | https://code.claude.com/docs/en/hooks |
| «`-p` or SDK session: Claude Code never shows the dialog and treats the folder as trusted.» | https://code.claude.com/docs/en/hooks |
| «In an interactive session, Claude Code shows the workspace trust dialog when you start it in a folder you haven't trusted.» | https://code.claude.com/docs/en/security |
| `~/.claude.json` хранит «per-project state such as trust decisions» | https://code.claude.com/docs/en/settings |
| «The **Status** tab includes a `Setting sources` line that lists each settings file Claude Code loaded for the current session, such as `User settings` or `Project local settings`.» | https://code.claude.com/docs/en/settings |

Не сказано на прочитанных страницах: судьба `CLAUDE.md` и навыков проекта без доверия; регистр буквы диска в ключе доверия; переменная окружения
или строка журнала, по которой сессия узнаёт, что её настройки не загружены. Ключ доверия — корень git-репозитория (пересказ субагента со
страницы permissions, дословно не сверен).

## 2. Что делает расширение 2.1.326 на этой машине (снято с кода и журнала)

- Код: `settingSources: t.kind==="trusted" ? ["user","project","local"] : ["user"]`; модальное окно — «Trust this folder in Claude Code?», кнопки
  «Trust folder» / «Don’t trust». Без доверия сессии не достаётся ни `project`, ни `local` — у истока это и `CLAUDE.md`, и навыки, и хуки.
- Журнал: 2026-11-17 09:48:23 «The folder's setting sources stay unused in d:\work\ai_sandbox\KAIF: Claude Code was not given trust for it».
- Запись доверия: `d:/work/ai_sandbox/KAIF` — `false`, `D:/work/ai_sandbox/KAIF` — `true` (VS Code открывает папку путём со строчной буквой).
- До 2.1.318 события хуков в журналах сессий есть (152 · 302 · 328), с 2.1.326 — ни одного; журнал 2.1.323 (2026-11-13) уже пишет строки ветки доверия для других папок — граница
  между 2.1.318 и 2.1.323 (судья сессии 101, находка 7; точная версия — журнал изменений вендора, не прочитан).

## 3. Что из этого следует для KAIF

1. **Невидимость изнутри.** Всё, чем KAIF говорит с сессией, — из настроек папки (хуки, навыки, `CLAUDE.md`); без доверия сессии сказать
   некому. Заметить может только агент, который уже знает о KAIF: признаки — «Unknown skill» на навыке проекта, нет `CLAUDE.md` в контексте,
   нет записи этой сессии в состоянии хука (`.kaif/context-window.json` — пишется на каждом `PostToolUse`).
2. **Пробы поля слепы к классу.** Живые пробы KAIF ходят через `claude -p` (`wh5-live-first-prompt` · `mm3-live-knowledge`), а там папка
   «treated as trusted» — они зелёные по построению, когда у владельца в панели всё выключено.
3. **Действие человека.** Доверие даёт только он — окном расширения; правка `~/.claude.json` агентом — расширение собственных прав (класс,
   который канон отдаёт владельцу).

## 4. Развилка класса (`bugs/138`, план п. 3)

- **A.** Строка в задании установки и обновления и в README модуля хуков: «Claude Code спросит „Trust this folder?“ — ответьте „Trust folder“,
  иначе хуки и навыки молчат» + признаки из п. 3.1 в `/resume` обоих слоёв. Дёшево; ловит, только когда агент уже читает канон.
- **B.** A + `check` судит запись доверия в `~/.claude.json` по корню проекта (предупреждение поимённо). Читает чужой внутренний формат — ломается
  молча при его смене.
- **C.** A + хуки штампуют свой запуск, `check` сверяет штамп с последним журналом сессии проекта. Наблюдение самой вещи, но зависит от формы
  хранилища журналов вендора.

Рекомендация разведки — A сейчас (вендор сам называет диалог и `Setting sources`), C — отдельным шагом с прогоном на поле; B — нет.
