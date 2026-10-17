# Разведка 2.10 — группа memory-canon: #160 · #159 · #87

> Тикеты прочитаны целиком (тело и все комментарии) из `scratchpad/issues/<N>.md` (скачаны 2026-10-18 02:16 +03:00) — проба часов
> `date '+%Y-%m-%d %H:%M %z'` → `2026-10-18 02:17 +0300` в начале чтения, `2026-10-18 02:20 +0300` на пробе бюджетов.
> Сверка — HEAD `250cf7a`; `git diff --stat v2.9 HEAD -- framework/` → пусто: номера строк `framework/` = выпущенной 2.9.
> Полевой проект KUMM (`D:\work\ai_sandbox\KUMM`) — только чтение: файлы и `git log` без записи.
> Пробы — только в копиях во временном каталоге `mktemp -d` (`git archive v2.9 framework` + копия `knowledge-hook.mjs` KUMM); каталог
> удалён в конце (`rm -rf`), временные папки самопроверки и пробы (`khook-*`, `khprobe-*`) удалены самими скриптами (проверено `ls`).
> Цитаты: `путь:строка` + текст строки дословно; «…» в цитате тикета — так в тикете.

---

## 0. Что общего у трёх тикетов

Все три — о том, что знание проекта лежит в НЕВЕРНОЙ ФОРМЕ носителя. #159: обязанность обновлять карты — проза, и сессия за два
часа не записала ни строки. #160: владелец KAIF требует механический носитель — хук. #87: урок про красный от аппарата лежал в журнале
опыта и «did not transfer — because a lesson in a journal is memory, and memory is what KAIF exists to replace» (`issues/87.md:85-86`).
Правило канона, которое все три применяют, — `framework/AGENT_GUIDE.md:604` `Therefore every obligation in a canon document carries one of three executable forms:`
и `:610` `Prose stays as the rationale UNDER the carrier: it explains WHY, it never carries the obligation`.

---

## 1. Что канон поставки СЕЙЧАС обещает записать — и чем это несёт (п. 1 задания)

Носитель — по форме обязательства (`AGENT_GUIDE.md:606-608`: команда · шаг с проверяемым условием выхода · чекбокс ритуала); «проза» —
текст без носителя.

| Что записать | Место и дословная строка | Носитель |
|---|---|---|
| **Карта внутренняя** | `framework/AGENT_GUIDE.md:88` `10. Check the map & blast radius   # before editing code: PROJECT_ARCHITECTURE_INTERNAL_MAP.md — who is affected; update the map if relations change` | шаг чек-листа, но **без условия выхода** и с узким поводом («if relations change»), привязан к моменту «before editing code», а не к моменту «узнал» |
| Карта внутренняя | `framework/PROJECT_ARCHITECTURE_INTERNAL_MAP.md:46-47` `> Keep this in sync with the real logic as it evolves. When you introduce or retire an abstraction, or` / `> change how they interact, update this map in the same change. File/directory placement belongs in` | **проза** (сноска шаблона) |
| **Карта внешняя** | `framework/PROJECT_STRUCTURE_EXTERNAL_MAP.md:42-43` `> Keep this map honest: when you add, move, or rename a file/directory, update the tree and the table in` / `> the same change. The *internal* logic (abstractions, data/interaction flows) belongs in` | **проза** |
| Карта внешняя | `framework/PROJECT_STRUCTURE_EXTERNAL_MAP.md:9-10` `… Keep it in sync with the` / `> real tree. **Living reference — never DONE-tagged.**` | **проза** |
| Карты при установке | `framework/installer/KAIF-CORE.mjs:1098` `items.push(['maps', 'Fill PROJECT_STRUCTURE_EXTERNAL_MAP.md and PROJECT_ARCHITECTURE_INTERNAL_MAP.md from your inspection. Keep them SHORT; write in 2-3 small edits, not one giant write.']);` | **чекбокс** задания установки — ОДИН раз, на развёртывании; дальше карты не спрашивает никто |
| **STATUS** | `framework/AGENT_GUIDE.md:121` `→ **`STATUS.md`** is the master state file. Update it after every significant task.` | проза в гайде, но под ней — шаги ритуалов (ниже) и **хук** `stop-status-guard.mjs` |
| STATUS | `framework/skills/end-chat-soft/SKILL.md:31` `### Step 1. Record status & the handover in STATUS.md` · `framework/skills/end-chat-force/SKILL.md:13` `Update `STATUS.md`, tersely:` | **шаг** ритуала закрытия |
| STATUS | `framework/skills/dayloop/SKILL.md:109` `- Update `STATUS.md`: what's done, where you stopped, what's next, any "❓ awaiting human review".` · `framework/skills/revision/SKILL.md:37` `6. **Sync & report.** Update `STATUS.md` if the phases changed …` | **шаг** |
| STATUS | `framework/hooks/stop-status-guard.mjs:3-4` `// refresh-hooks module, deployed to .kaif/hooks/). Claude Code event: Stop. The ONLY blocking` / `// hook of the module — and even it blocks softly: once per session, with a reason that asks` | **хук** (мягкий блок остановки раз на сессию) |
| **Опыт** | `framework/AGENT_GUIDE.md:93` `15. Capture experience            # after a meaningful success/failure, append a lesson to EXPERIENCE.md (skill: /experience)` | шаг + навык; условие субъективно («meaningful») |
| Опыт | `framework/skills/end-chat-soft/SKILL.md:40-42` `Reconcile with the active bug docs in `bugs/` and reflect their status. If a reusable lesson` / `emerged in this chat, capture it in `EXPERIENCE.md` (skill: `/experience`) before the handover is` / `passed — and then run `node .kaif/tools/kaif-experience-lint.mjs check`: …` | условный шаг + **команда**; команда судит ПОВТОР класса, а не то, что урок записан |
| Опыт | `framework/skills/experience/SKILL.md:73` `5. **Run the deadline, don't remember it:** `node .kaif/tools/kaif-experience-lint.mjs check` — a SECOND` | **команда** (тот же линтер) |
| Знание по ходу цикла | `framework/skills/autoloop/SKILL.md:71-73` `9. **Capture knowledge**: for bugs — reflection in `bugs/NN_*.md`; for features — status/date in` / `` `ideas/*`; update `STATUS.md`. After a meaningful success or failure, append the approach-level lesson `` / `to `EXPERIENCE.md` (skill: `/experience`) — don't wait for the human.` | **шаг** цикла — **карты не названы** |
| Знание по ходу цикла | `framework/skills/dayloop/SKILL.md:68` `5. **Document**: a worklog in `plans/`, bug docs in `bugs/`, `STATUS.md` along the way; append the` · `framework/skills/nightloop/SKILL.md:57` `5. **Document**: worklog in `plans/`, bug docs in `bugs/`, `STATUS.md` along the way; append the` | **шаг** — **карты не названы** |
| Пауза | `framework/skills/pause/SKILL.md:24` `- Do NOT update `STATUS.md`, README or other status documents — that ceremony is exactly what this` | явное «не писать» — память пауза держит в чате |
| Внешняя истина | `framework/AGENT_GUIDE.md:87` (шаг 9) `… The FIRST artifact is a recon doc in researches/ — code is forbidden until it exists; …` | **шаг с условием выхода** — самый сильный носитель записи знания в каноне; но срабатывает ДО кода и только на внешней истине |
| Досье машины | `framework/skills/refresh-context/SKILL.md:35` `3. **Check the environment dossier** (the rule — `AGENT_GUIDE.md` → Environment dossier; the table —` | **шаг** с условием (старше 4 недель — перезамерить) |
| План мастер | `framework/MASTER_PLAN.md:51-52` `> **Maintenance:** keep this in sync with reality. When `GOAL.md` or the project's state shifts materially,` / `> run `/revision` to re-derive the phases. …` | **команда** (`/revision`) |
| Канон-документы вообще | `framework/AGENT_GUIDE.md:105` `    Edit them when it would make future autonomous work more effective. The agent operates across` · `:4` `the map, the commands, the conventions. Keep it accurate — a fresh agent session with empty context` | **проза** |
| Документ владельца | `framework/AGENT_GUIDE.md:112-113` `… After implementing from such a document, write the status` / `    and the implementation date back into it.` | шаг чек-листа (18) |
| Сюрприз | `framework/skills/fable-method/SKILL.md:79` `7. **Surprises route the loop.** Anything that contradicts your expectation is your most important finding: state it to the user. If it changes what done means, update Step 1. If it changes what the user is actually asking for, go back to Step 0. Otherwise report it and continue.` | **правило** метода — ЕДИНСТВЕННОЕ место канона, где назван момент новизны (ошибка предсказания); сток — **чат**, не документы проекта |
| Судья | `framework/skills/fable-judge/SKILL.md:77` `   - **Re-derived own work (KAIF 2.8).** The task sat on a surface the project had already worked on — …` · `:44` `   - **Experience recall.** …` | охоты судьи — только на ЧТЕНИЕ своего; охоты «узнал и не записал» нет |

**Итог таблицы.** Из «живых» документов проекта у каждого есть исполнимый носитель обновления — STATUS (шаги закрытия + хук), опыт
(навык + линтер), мастер-план (`/revision`), видение (`/fix-vision`), досье (`/refresh-context` шаг 3), разведка (шаг 9) — **кроме двух
карт**: у них один чекбокс установки и три строки прозы. Полевая проба этого различия — ночь KUMM (п. 4 ниже): за 23:30–02:00 `STATUS.md`
— 6 коммитов, карта игры — 0.

Близнец на стороне чтения: шаг 2 чек-листа `framework/AGENT_GUIDE.md:79-80` `# a surface the project already touched (a device, a route, a stand, a recipe) → find your` /
`# own work (the house-rules file, researches/, the project's tools) and cite it, or write "no own work found"` — карты в списке
«своей работы» не названы; судья `fable-judge/SKILL.md:77` грепает «the house-rules file and `researches/`» — тоже без карт.

---

## 2. Хук памяти и слово №144 — тот же класс или другой (п. 2 задания)

Слово владельца №144 (`MASTER_PLAN.md:273`): «Убрать это!!!! ИЗ КАИФ НАХУЙ УБРАТ!» · «Мне не нравится, что ты останавливаешься на
этом!!! ⏩» — о двух хуках. Механика по `framework/hooks/README.md:54-55` `(2.8, `PreToolUse` — refused the next tool call after a mid-turn word) and `stop-owner-answer.mjs` (2.9 pre-release, `Stop` — demanded`
/ `a last "next step" arrow line and resumed the turn) are no longer shipped.`

| Хук | Событие | Что делает в ходе агента | Повод | Частота | Судьба |
|---|---|---|---|---|---|
| `pretool-owner-word.mjs` | `PreToolUse` | **отказ вызова** инструмента | слово владельца посреди хода | на каждое слово | снят №144 |
| `stop-owner-answer.mjs` | `Stop` | **блок остановки**: требует строку `⏩`, возвращает ход | ответ на слово владельца | на каждое | снят №144 |
| `session-start-refresh.mjs` | `SessionStart` `compact\|clear` | **впрыск** приказа перечитать | сжатие/очистка | раз на событие | оставлен |
| `prompt-refresh-timer.mjs` | `UserPromptSubmit` | **впрыск** | маркер старше 60 мин | каждый промпт до штампа | оставлен |
| `prompt-resume-word.mjs` | `UserPromptSubmit` | **впрыск** | первое слово `resume`/`stop` | каждое такое | оставлен |
| `stop-status-guard.mjs` | `Stop` | **мягкий блок** остановки | грязное дерево/коммит за 3 ч И STATUS старше 3 ч | раз на сессию | оставлен (`README.md:26` `the one blocking hook is `stop-status-guard.mjs`, at most once per session — no hook of this module stops the agent on`) |
| хук памяти KUMM (`tools/hooks/knowledge-hook.mjs`, `befce6f`) | `UserPromptSubmit` · `PostToolUse` (`matcher "*"`) | **впрыск** `additionalContext` | любое событие; текст по «моменту» | не чаще раза в 10 мин на все моменты | предложен #160 |
| то же | `Stop` | **блок остановки** `{ decision: 'block', reason: MOMENTS.reflect }` | своя остановка агента | раз в 10 мин (своё окно), `stop_hook_active` — пропуск | предложен #160 |

Механика KUMM — по коду копии: `respond()` → `if (kind === 'reflect') return { decision: 'block', reason: MOMENTS.reflect };` и
`return { hookSpecificOutput: { hookEventName: ev.hook_event_name, additionalContext: MOMENTS[kind] } };`. Проводка в KUMM — в ЛИЧНОМ
`.claude/settings.local.json` (проба `lshooks.mjs`: `settings.local.json PostToolUse * knowledge-hook.mjs` · `settings.local.json Stop - knowledge-hook.mjs` ·
`settings.local.json UserPromptSubmit - knowledge-hook.mjs`); в общем `.claude/settings.json` — только четыре хука KAIF.

**Вердикт по механике.**
- **Половина впрыска** (UserPromptSubmit, PostToolUse) — класс ОСТАВЛЕННЫХ хуков: ничего не отказывает, ход не останавливает, только
  вписывает предписание в контекст. Это не класс №144. Новое для KAIF — событие `PostToolUse` (ни один хук поставки его не использует) и
  запуск `node` на КАЖДЫЙ вызов инструмента: проба на копии — `avg ms per call: 62` (10 запусков, Windows 11, Node v24.15.0).
- **Половина остановки** (`Stop` → `decision: block`) — та же механика, что у снятого `stop-owner-answer.mjs` (ход возвращён с
  требованием) и у оставленного `stop-status-guard.mjs`. От №144 её отличает повод (не слово владельца, а своя остановка) и окно
  (10 мин). Но в диалоге `Stop` = конец КАЖДОГО ответа владельцу: хук будет возвращать ход после ответа до 6 раз в час — и агент допишет
  строку «новых знаний нет». Это форма симптома №144 («останавливаешься на этом» + лишняя строка в конце хода). И владелец сам отверг
  этот дизайн как основной: пункт 6 #160 «НКТ!!!!!!!!» · «не стоп хук!» (`issues/160.md:33`). Пункт 16 (`:43`) просит другое — сработать,
  «когда агенту сказано закрывать работу и закругляться» и «когда агент останавливает работу сам». Чем это сделать — блоком `Stop` или
  шагом закрытия — **развилка владельца**.
- Два блока `Stop` на одной остановке (`stop-status-guard` + хук памяти; в KUMM их три — ещё `no-permission-question.mjs`): как харнесс
  сводит их причины — **NOT-VERIFIABLE-HERE** (нужен вендорский документ, в сеть нельзя).

**Проба «момент новизны» — что хук видит на деле** (`probe-window.mjs` на копии; часовая сессия: рутинный `Bash` каждые 20 с, поиск в
сети на 3:00, слово владельца на 25:00, декомпиляция на 41:30, остановка на 60:30). Вывод дословно:

```
00:00 FIRED   compare
03:00 SILENT  novelty event swallowed: WebSearch
10:00 FIRED   compare
20:00 FIRED   compare
25:00 SILENT  novelty event swallowed: UserPromptSubmit
30:00 FIRED   compare
40:00 FIRED   compare
41:30 SILENT  novelty event swallowed: Bash
50:00 FIRED   compare
60:00 FIRED   compare
60:30 FIRED   reflect(block)
events 185, fired 8
```

Окно в 10 минут общее для всех моментов, а рутинное «сравнение» срабатывает на любом выводе. Поэтому в активной сессии хук сводится
к таймеру раз в 10 минут, и все три события новизны (сеть, слово владельца, декомпиляция) проглочены. Сам хук KUMM это признаёт:
`// GAP:            хук видит МОМЕНТ, не СМЫСЛ: …; новизна, пришедшая в рассуждении агента без` / `// события (догадка в голове), хуку не видна; …`.
Разведка KUMM (`researches/agent-memory-hook-psychology/README.md`) называет привыкание гашением ПОВТОРНОГО раздражителя. Реализация
гасит новый раздражитель старым — обратное собственной разведке.

Прецедент истока для того же вопроса («у момента нет механического признака»): хук `recon-before-decision` отложен с 2.5 —
`ideas/30_DONE_kaif_2.8_scope.md:47-48` `8. **Хук `recon-before-decision`** (issue #36 п. 3) — когда появится механический признак` /
`   развилки; 2.5 дала артефакт `FORK:` + охоту судьи, 2.6/2.7 признака не добавляют.` Вместо хука там взяли обязательную строку и охоту
судьи. Та же форма подходит к новизне.

Близнец по `bugs/120` (впрыснутый приказ утверждает ненаблюдённое): KUMM `surprise` говорит агенту «неожиданный исход: ждал одно —
получил другое» по регэкспу слова `error` в выводе; GAP хука сам называет ложную тревогу. Порт в поставку должен спрашивать («если это
было неожиданно…»), а не утверждать.

---

### #160 — обязательный «хук запоминания»: агент пишет знания проекта в md в момент новизны, а не по коммитам

- **Суть:** в 2.9 есть хуки на ПЕРЕЧИТЫВАНИЕ канона, но нет хука на ЗАПИСЬ знаний. Тикет просит поставить `memory-hook` в
  `.kaif/hooks/`, проводить его `wire-hooks` ОБЯЗАТЕЛЬНО (`"hooks": "off"` его не снимает, `check` называет отсутствие). Хук впрыскивает
  предписание владельца в моменты новизны, не чаще раза в 10 минут; на приказ закрываться и на свою остановку спрашивает один раз. Плюс
  строка канона в `AGENT_GUIDE.md` и охота судьи. Рабочая реализация — KUMM `befce6f`.
- **Сверка с HEAD:**
  - «KAIF 2.9 ships hooks for re-reading the canon (`.kaif/hooks/`: compaction re-read, marker-age timer, `resume` word, STATUS guard)» —
    **CONFIRMED**: `framework/hooks/README.md:14-17` (четыре строки таблицы), проводка `framework/hooks/settings-fragment.json` — четыре скрипта.
  - «none for WRITING knowledge» — **PARTIAL**: `stop-status-guard.mjs` — хук ЗАПИСИ состояния (`:3-5` `… with a reason that asks` /
    `// for an update or an explicit "nothing changed", never a hard wall.`); хука записи ЗНАНИЙ (карты, разведка, домашние правила) нет.
  - «The canon's only carriers for recording knowledge are prose: "update the map if relations change" … and "update the tree and the
    table in the same change"» — **PARTIAL**: для КАРТ верно (§1); для знаний вообще — нет: опыт (`/experience` + линтер), разведка
    (шаг 9 с условием выхода), досье (`/refresh-context` шаг 3), STATUS (шаги + хук) имеют исполнимые носители.
  - «A working implementation … self-test 13 cases» — **CONFIRMED** пробой на копии: `node knowledge-hook.mjs --selftest` → 13 строк
    `ok`, `selftest: all ok`, `exit=0`. Отчёт прогона есть: KUMM `testcases/reports/2026-10-18_knowledge-hook.md:33`
    `**Verdict:** pass — самопроверка 13 из 13 и все моменты вживую, включая закрытие и остановку хода.`
  - «moments of novelty» как различимые повода срабатывания — **REFUTED на деле** пробой выше: в активной сессии все три события
    новизны проглочены общим окном, хук срабатывает таймером.
  - «`check` naming a deployment where it is absent» — механизм **уже есть** для любого хука фрагмента:
    `framework/installer/KAIF-CORE.mjs:3841` `// SW (2.9, origin issue #115): a DELIVERED hook that is not wired is named — a warning, never a failure (the hooks are the mechanical`;
    добавить хук в `settings-fragment.json` — `wire-hooks` и `check` подхватят его без новой логики (`hookWiringState()` читает фрагмент, `:4972-4987`).
  - «MANDATORY … its `"hooks": "off"` opt-out not covering it» — **противоречит действующему канону**: `KAIF-CORE.mjs:4969`
    `  if (marker.hooks === 'off') return { state: 'off', retired: retiredOf(HOOK_SETTINGS), retiredLocal };` (отказ — общий),
    `framework/hooks/README.md:7-8` `… A deployment without hooks is not degraded and never reddens for` / `lacking them.`,
    `framework/AGENT_GUIDE.md:216` (`… a deployment without hooks never reddens.`). Плюс `KAIF-CORE.mjs:4906` `const HOOK_SYSTEMS = ['claude-code'];`
    — «в каждом развёртывании» физически значит «в каждом на Claude Code»; есть ли у Codex/Cursor/Copilot/Antigravity событие после
    вызова инструмента с впрыском — **NOT-VERIFIABLE-HERE** (вендорские документы, сеть запрещена).
  - Локальная копия `D:\work\ai_sandbox\KUMM\bugs\KAIF\14_mandatory_memory_hook_documents_knowledge_like_a_brain.md` — **совпадает** с
    телом трекера (`diff` после снятия CR): отличия — строка `**Delivered upstream:**` (ссылка вместо «(this issue)»), служебный
    комментарий `<!-- claim-ok: «+03:00» — смещение часового пояса, не время -->` в заголовке слов владельца и подпись транспорта.
    Слов владельца сверх тела в копии нет.
- **Класс:** механизм KAIF — обязательство записи знания без носителя в момент, когда знание появляется: канон знает момент новизны
  только как правило метода со стоком в чат (`fable-method/SKILL.md:79` «state it to the user»), а механический контур (`.kaif/hooks/`)
  весь построен на перечитывании. TWINS: searched `keep .* in sync|in the same change|Keep it accurate|Update it whenever` по
  `framework/**/*.md` (без справочника, сфер, readmes) — found 6: `AGENT_GUIDE.md:4` (проза) · `GOAL.md:9` (носитель `/fix-vision`) ·
  `KAIF_FRAMEWORK.md:9` · `MASTER_PLAN.md:51` (носитель `/revision`) · `PROJECT_ARCHITECTURE_INTERNAL_MAP.md:46-47` (проза) ·
  `PROJECT_STRUCTURE_EXTERNAL_MAP.md:9`, `:42-43` (проза). Без носителя — гайд и две карты.
- **Кто платит сейчас:** владелец лично — часы живого времени на объяснение проекта своему агенту (#159); каждое полевое развёртывание
  на длинных сессиях. Тяжесть **S1** (доверие владельца: «мне даже грустно тебе говорить, почему», #159).
- **Форма починки:** см. §6 (Парето). Полный объём тикета: хук + своды `s14` + мутанты + таблица README + справочник + обязательность
  ядром + функциональный прогон в живой сессии ≈ **1,25–1,5 чата**. Минимальная форма (впрыск раз в 10 мин без классификатора, вариант
  на слово закрытия, без нового блока `Stop`, обязательность — словом владельца) ≈ **0,75 чата**.
- **Пересечения:** `ideas/32` п. 12 (`"hooks": {"off": [имена]}` — отказ от ОДНОГО хука; #160 тянет в обратную сторону — хук, от
  которого отказаться нельзя) · п. 3 L10N (сообщения хуков на переведённых развёртываниях — хук памяти будет пятым хуком с текстом
  владельцу-агенту; в KUMM текст русский) · п. 10 → `ideas/31` п. 13 (хук `recon-before-decision` — тот же вопрос «нет механического
  признака момента») · п. 8 (Stop-хук над последним ответом) · №144 (класс блока `Stop`) · №147 («если пользователь явно не просит ИИ агента
  остановиться … продолжить делать то, что делал») · #159 (дефект, который закрывает) · #140 (`ideas/32` «Новые тикеты» п. 8 — ещё
  одна заявка на Stop-хук). Открытые баги истока: `bugs/120` (приказ хука утверждает ненаблюдённое — см. §2), `bugs/119` (состояние хука
  из непроверенного входа: файл окна KUMM лежит в дереве проекта `tools/hooks/.knowledge-hook.json`, общий для всех сессий и мест
  команды; в `.gitignore` KUMM строка 43 есть).
- **Слова владельца** (владелец KAIF; тикет: «The KAIF owner designed this hook live, correcting the agent's attempts one by one»,
  `issues/160.md:26`). Дословно, по пунктам тикета:
  - п. 1 `:28` «какого хуя ты разрабатываешь проект, и нихуя не ДОКУМЕНТИРУЕШЬ ПО ХОДУ ЕГО СОСТОЯНИЕ!»
  - п. 2 `:29` «БАГ В КАИФ, НЕМЕДЛЕННО!»
  - п. 3 `:30` «ХУК ЗАВЕСТИ И ЗАРЕГИСТРИРОВАТЬ: ВСЕ РАБОТЫ И ЗНАНИЯ ДОКУМЕНТИРУЮТСЯ!!!!!!!! АГЕНТ ПОМНИТ И ЗНАЕТ СВОЙ ПРОЕКТ НА ВЫСОКОМ ПРОДУКТОВОМ И ФУНКЦИОНАЛЬНОМ УРОВНЕ!»
  - п. 4 `:31` «КАЖДЫЙ РАЗ, КОГДА ЧТО-ТО НОВОЕ ВВОДИТСЧЯ, ДЕЛАЕТСЯ, МЕНЯЕТСЯ _ АГЕНТ ОБЯЗАТ ЭТО ЗАДОКУМЕНТИРОВАТЬ В ЗАНИЯ ПО ПРОЕКТУ!!!!!!»
  - п. 5 `:32` «Импрувмент в каиф: ОБЯЗАТЕЛЬНАЯ РЕГИСТРАЦИЯ ТАКОГО ХУКА, КОТОРЫЙ ОБЯЗЫВАЕТ АГЕНТА ДОКУМНТИРОВАТЬ ЗНАНИЯ ПО ПРОЕКТУ, НАД КОТОРЫМ ОН РАБОТАЕТ!»
  - п. 6 `:33` (на Stop-хук, блокирующий конец хода) «НКТ!!!!!!!!» · «не стоп хук!»
  - п. 7 `:34` «А хук, который предписывает агенту: "Это что-то новое? Такого не было в проекте, и теперь будет вот так? Ты ОБЯЗАН ЭТО ЗАДОКУМЕНТИРОВАТЬ!"»
  - п. 8 `:35` «Что то изменилось? Документы со знаниями говорят по-другому? ТЫ ОБЯЗАН ЭТО ОТРЕДАКТИРОВАТЬ, актуализировать, удалить устаревшее, написать новое!»
  - п. 9 `:36` (на гейт `git commit`) «а на каждом git commit, НЕТ!!!!!!!!»
  - п. 10 `:37` «он должен срабатывать на кажом ПООНИМАНИИ НОВИЗНЫ!!!!!!» · «ИЗМЕНЕНИй!» · «того, как проеккт менячется идейным и смысловым наполнением!»
  - п. 11 `:38` (на предписание только при правке кода) «только срабатывание в момент правки кода. НЕТ БЛЯТЬ!!!!!!!!!!!»
  - п. 12 `:39` «иди в интернет, разведка о психологии человека» · «как мозг и нейронные сети запоминают информацию» · «и в какой момент у человека в голове срабатывает "ХУК ЗАПОМИНАНИЯ"»
  - п. 13 `:40` «Так должен работать агентский ХУК, который обязывает агента ЗАПОМИНАТЬ знания о проетке в локальных md документах» · «а не миханистически привязывать нахуй это к каким-то комитам и прочим действиям» · «мозг человека не привязывает хуки к коммитам»
  - п. 14 `:41` «мозг человека постоянно сравнивает свой текущий опыт с тем, что посутпает в мозг через источники информации, и постоянно идёт сравнение "я это знаю, или нет? это новоек? а как у меня в памяти хранится? и постоянно актуализирует базу знаний"»
  - п. 15 `:42` «не нужно часто этот хук вызывать» · «не чаще раза в 10 минут будет достаточно» · «сессии агента Клод обычно длинные, от 30 минут до часов»
  - п. 16 `:43` «и пусть срабатывает, когда агенту сказано закрывать работу и закругляться. Когда агент останавливает работу сам - ему нужно порефлексировать, проверить, записал ли он новые знания»
  - п. 17 `:44` «полного пересмотра сессии … не полного пересмотра сессии..... А новых знаний» · «мщменений знаний» · «изменений» — «…» соединяет два фрагмента; чьё это соединение, по тексту не видно.
  - п. 18 `:45` «импрувмент в КАИФ отправлен со всеми моими набросами по этому хуку?»
  - контекст `:47` «ты и не должен был [открывать код]. Ты должен был это понять из более высокоуровневых документов проекта» · «это не записано в карту проекта?» — квадратные скобки вставлены агентом (в #159 та же фраза с «[открывать Jump.cs]»).

  **Что сказал агент поля, а не владелец:** всё в «Proposed change»: события `PostToolUse`/`UserPromptSubmit`, «CAPS, «!!!», «НЕТ»» как
  нажим, регэкспы «unexpected outcome», блок `Stop` с `stop_hook_active`, список «where to write». «`"hooks": "off"` not covering it» и
  «`check` naming a deployment where it is absent» — тоже прочтение агентом пункта 5. Владелец сказал «ОБЯЗАТЕЛЬНАЯ РЕГИСТРАЦИЯ», про
  отказ проекта он не говорил. Принятия итогового дизайна (с блоком `Stop`) в словах нет: п. 18 спрашивает только, отправлены ли его наброски.
  Список «где писать» в хуке KUMM включает `GOAL.md (видение)` и `HOUSE_RULES.md (правила владельца …)`. Это задевает канон: видение —
  через `/fix-vision`, `AGENT_GUIDE.md:281-282` `… The map precedes the canon: every edit` / `  is checked against it, ONLY the owner may change it, …`,
  write-gate `AGENT_GUIDE.md:998-1000`. Порт должен разводить «своё знание» (карты, разведка, досье, опыт) и «слово владельца»
  (видение, правила, канон-карта).

---

### #159 — карты проекта не обновляются по ходу работы: у «update the map» нет исполнимого носителя

- **Суть:** ночная сессия KUMM (2026-10-18, 00:00–01:55) два часа работала над панелью быстрых действий игры и узнала её устройство
  (два набора слотов 0–11 и 12–23, общие Q/E, авторский баг перетаскивания, ячейки «Пробел» нет из-за своего мода прыжка). Всё ушло в
  комментарии кода, тест-кейсы и чат, в карту игры — ничего. В конце агент спросил владельца о несуществующей ячейке. Причина по тикету:
  обязанность — проза в двух местах, повод узкий, ни `/end-chat-soft`, ни судья карты не спрашивают.
- **Сверка с HEAD:**
  - цитата шага 10 — **CONFIRMED** дословно: `framework/AGENT_GUIDE.md:88` (§1).
  - цитата сноски внешней карты — **CONFIRMED**: `framework/PROJECT_STRUCTURE_EXTERNAL_MAP.md:42-43` (§1). Третье место той же прозы
    тикет не назвал: `framework/PROJECT_ARCHITECTURE_INTERNAL_MAP.md:46-47`.
  - «`/end-chat-soft` step 1 updates STATUS and EXPERIENCE but never the maps» — **CONFIRMED**: `grep -c -i "map"` →
    `framework/skills/end-chat-soft/SKILL.md:0`, так же `end-chat-force:0`, `pause:0`, `experience:0`, `autoloop:0`, `dayloop:0`,
    `nightloop:0`, `guarded-loop:0`; `fable-loop:1` — это «mapped to KAIF's own cycles» (`:7`), `plan-task:1` — ЧТЕНИЕ среза карты (`:29`
    `- The relevant map slice (`PROJECT_ARCHITECTURE_INTERNAL_MAP.md` — blast radius).`).
  - «`/fable-judge` has no hunt for "new subsystem knowledge outside the maps"» — **CONFIRMED**: упоминания карт в судье — только
    `:43` «parity inventory or canon map» (сверка поставки с инвентарём, другой класс); ближайшая охота `:77` «Re-derived own work» —
    сторона чтения, грепает house-rules и `researches/`, не карты.
  - «no step of the loop, of `/plan-task`, of the commit hygiene or of `/end-chat-soft` asks …» — **CONFIRMED** (см. выше; разделы
    `AGENT_GUIDE.md` «Git workflow» и «Commits», строки 535–583, слова map не содержат — grep по гайду: 4, 88, 104, 131, 135, 154, 155,
    164, 280–283, 447, 504–507, 791).
  - адрес `kaif-fp` «fable-method step 4/7» и «the fable loop's step 7 (report)» — **PARTIAL**: у `fable-method` шаги 0–6 (отчёт —
    `## Step 6 - Report outcome-first`, `:122`), у `fable-loop` стадии 1–4 (отчёт — `## Stage 4 - AUDIT and REPORT`, `:44`). «Шага 7»
    нет. Ближайшее по смыслу — правило 7 шага 2 `fable-method/SKILL.md:79` («Surprises route the loop»).
  - полевой факт «none into `games/SvarogsDream/GAME_ARCHITECTURE_INTERNAL_MAP.md`» — **CONFIRMED** git KUMM (только чтение):
    `git log --since="2026-10-17 12:00" -- games/SvarogsDream/GAME_ARCHITECTURE_INTERNAL_MAP.md` → `befce6f 02:08 …` · `20a804e 17:58 …` ·
    `ef64df9 13:11 …` — между 17:58 и 02:08 карту не трогали; `git log --since="2026-10-17 23:30" --until="2026-10-18 02:00" --oneline -- STATUS.md | wc -l` → `6`.
  - Правило проекта в Notes from the human — **CONFIRMED** и важнее, чем в тикете: в KUMM оно уже ШАГ, а не проза, —
    `KUMM/AGENT_GUIDE.md:1196` `2. Before decompiling or probing the game, read both maps; whatever the probe finds goes into them in the same move.`
    — и всё равно не сработало. Нумерованный шаг в разделе, который читают один раз, без условия выхода и без ритуала, который его спросит,
    — не носитель. Это уточняет форму починки: носитель должен стоять там, где ритуал его СПРАШИВАЕТ (строка отчёта закрытия, охота судьи).
  - предложенная «Optional machinery» `kaif-core check --maps <since>` (каталоги, тронутые с коммита, которых нет в картах) — по пробе
    **не поймала бы этот инцидент**: за ночь тронуты `plans/`, `testcases/`, `researches/svarogs-dream`, `interviews/`, `STATUS.md`,
    `EXPERIENCE.md` (проба `git log --name-only` KUMM 23:30–02:00) — все давно в картах. Знание о подсистеме игры — не путь в дереве проекта.
  - Локальная копия `D:\work\ai_sandbox\KUMM\bugs\KAIF\13_maps_not_updated_as_work_goes_no_carrier.md` — **совпадает** с телом
    (отличия — строка `**Delivered upstream:**` и подпись транспорта). Слов владельца сверх тела нет. Рядом, ВНЕ тикета, — раннее слово
    владельца о картах игры (`KUMM/AGENT_GUIDE.md:1190-1191`, 2026-10-13): «как внешняя и внутренняя карты KAIF, только подробный, по
    каждой игре, которую мы модифицируем» · «он нужен, чтобы не изучать игру каждый раз по-новому».
- **Класс:** обязательство записи знания — проза или шаг БЕЗ точки, где ритуал его спрашивает; повод сформулирован через ДЕЙСТВИЕ
  («relations change», «add, move, or rename a file») вместо ЗНАНИЯ («узнал, как устроено»). TWINS: searched `\bmaps?\b|_MAP\.md` по
  `framework/skills/*/SKILL.md` — found 0 шагов записи карт в 37 навыках; места чтения: `resume:28-29`, `refresh-context:13-15`,
  `plan-task:29`, `revision:25-26`, `team-deployment:45`, `help-kaif:39`. Близнецы по механизму (циклы, которые перечисляют, куда писать,
  и пропускают карты): `autoloop:71-73`, `dayloop:68`, `nightloop:57`.
  Ещё одно поле: `KUMM/EXPERIENCE.md` EXP-0308 пишет `mechanized: строка «Панель быстрых действий» во внутренней карте (2026-10-18)`. Строка
  карты — не страж, а починка случая. Поле `mechanized:` здесь использовано не по назначению (`experience/SKILL.md:50` `` `mechanized: <the tool>` — the lesson is now enforced/eliminated by code · ``).
- **Кто платит сейчас:** владелец лично (часы живого времени, бессмысленный вопрос в интервью) и каждый следующий холодный старт.
  Полевые проекты — на каждой длинной сессии по подсистеме, которой нет в карте. Тяжесть **S1** (доверие владельца).
- **Форма починки:** (1) строка-артефакт в отчёте закрытия `/end-chat-soft` шаг 1, `/end-chat-force` шаг 1, `/autoloop` шаг 9,
  `/dayloop` и `/nightloop` шаг 5: `KNOWLEDGE: <часть системы> → <строка карты / документ> | none new` (форма `FORK:`/`TWINS:`, на языке
  владельца в отчёте). (2) KAIF-патч правила 7 шага 2 `fable-method`: сюрприз — не только «state it to the user», но и запись тем же
  ходом туда, где его прочтёт следующая сессия. (3) Охота судьи «Learned, not recorded». (4) Шаг 10 гайда — переписать ПОВОД той же
  строкой (`AGENT_GUIDE.md` на потолке 1080/1080, строка не растёт), сноски карт — то же. Проверка: страж пар сборки (строка `KNOWLEDGE:`
  в навыках закрытия ↔ охота судьи, как пары `tools/check-framework.mjs:1032`), функциональный прогон — закрытие сессии, тронувшей
  подсистему без строки карты. Цена ≈ **0,5 чата**.
- **Пересечения:** #160 (то же, механическая половина); `ideas/32` пп. 1–14 — нет пункта о картах (`grep -n "карт" ideas/32_kaif_2.10_scope.md`
  → пусто); `ideas/30` п. 8 / `ideas/31` п. 13 — прецедент «строка + охота вместо хука»; открытых багов истока на карты нет.
- **Слова владельца** (`issues/159.md:35-39`, тикет: «The owner's words, verbatim (Russian)»):
  «твой вопрос про пробел неуместен, и мне даже грустно тебе говорить, почему» · «почему это ты только сейчас узнал, спустя часы работы?» ·
  «ты и не должен был [открывать Jump.cs]. Ты должен был это понять из более высокоуровневых документов проекта» (скобки — вставка агента) ·
  «какого хуя ты разрабатываешь проект, и нихуя не ДОКУМЕНТИРУЕШЬ ПО ХОДУ ЕГО СОСТОЯНИЕ!» · «БАГ В КАИФ, НЕМЕДЛЕННО!».
  Правило «Before decompiling or probing the game…» (`:21`) — английский пересказ агента, не слова владельца.

---

### #87 — канон тестирования называет только ложный ЗЕЛЁНЫЙ; красный, который дал АППАРАТ, а не предмет, нигде не класс

- **Суть:** все механизмы доверия в `TESTING_FRAMEWORK.md` ловят ложный зелёный. Обратного случая — стенд/обвязка сломаны или в чужом
  контексте и называют сломанным ПРЕДМЕТ — в каноне нет. Поле (QA_Engineer): 15 красных из 26 от чужой локали стенда, затем ещё 5 от
  преамбулы прогона, написанной самим агентом. Просьба: назвать класс, шаг «перед вердиктом о предмете — закрепить и напечатать контекст
  прогона», обратить принцип 4 (кучные красные — не подтверждение), зеркальная охота судьи.
- **Сверка с HEAD (2.9):**
  - «The class is absent» — **CONFIRMED** для четырёх файлов прежних замеров: `grep -n -i "false red\|apparatus\|false-red"` по
    `framework/TESTING_FRAMEWORK.md`, `framework/AGENT_GUIDE.md`, `framework/BUG_FIXING_FRAMEWORK.md`, `framework/skills/fable-judge/SKILL.md`
    → `0`. Во всей поставке — 2 строки, обе в коде линтеров (`kaif-canon-lint.mjs:151`, `kaif-experience-lint.mjs:16`), класс не канон.
  - **PARTIAL — уточнение, которого не было в замерах 2.8 и 2.9:** вендоренный `fable-method` один раз называет проверку виновником красного:
    `framework/skills/fable-method/SKILL.md:78` `6. **Establish intent before changing behavior.** A failing check has two possible culprits: the code or the check itself.`
    Но лечит он только расхождение кода, проверки и спецификации («find the statement of intended behavior»). Контекст прогона (локаль,
    исходный экран, преамбула) там не назван, шага «закрепи контекст» нет.
  - принцип 4 — **CONFIRMED**: `framework/TESTING_FRAMEWORK.md:17` `4. **Defects cluster.** Most bugs live in a few narrow modules — where one was found, hunt for more`.
  - что изменилось с 2.8 — **ничего**: `git log --oneline v2.8..v2.9 -- framework/TESTING_FRAMEWORK.md` → пусто; последняя правка
    `6562895` (2026-09-26 05:12, эпик TB 2.8) — `git merge-base --is-ancestor 6562895 v2.8` → внутри v2.8; `git show v2.8:framework/TESTING_FRAMEWORK.md | wc -l` → `270`, HEAD → `270`.
  - бюджет — **места нет**: `framework/installer/KAIF-CORE.mjs:154` `  'TESTING_FRAMEWORK.md': { budget: 300, overflowTo: MOVE_OUT_ADDRESS },`;
    потолок шаблона `tools/check-framework.mjs:301` `const TEMPLATE_RESERVE_PCT = 10;` и `:304`
    `const templateCeiling = (budget) => Math.floor((budget * (100 - TEMPLATE_RESERVE_PCT)) / 100);` → 270; гард 5j (`:931-934`)
    краснеет при `n > ceiling`. Проба на `git archive v2.9`: `TESTING_FRAMEWORK.md 270` — ровно на потолке, ноль свободных строк.
    Так же `AGENT_GUIDE.md 1080` при бюджете 1200 → потолок 1080, ноль строк — это касается и строки канона, которую просит #160.
    Свободно: `PROJECT_STRUCTURE_EXTERNAL_MAP.md 44/270`, `REQUIREMENTS_FRAMEWORK.md 215/225`, `BUG_FIXING_FRAMEWORK.md 225/270`.
    Навыки бюджета строк не имеют (`grep` бюджета по `SKILL` в `check-framework.mjs` → пусто). Корневой слой истока:
    `TESTING_FRAMEWORK.md` 278 из 300, `AGENT_GUIDE.md` 1185 из 1200 — место для зеркала есть.
  - Исток сам платит этот класс: `grep -rIn -i "false red\|ложн[а-я]* красн\|ложнокрасн\|false-red" --include=*.md` без `.claude/`
    (рабочие копии) и `dist/` → 66 строк в 37 файлах (`plans` 11, `bugs` 6, `testcases` 5, `reports` 5, `researches` 4, `EXPERIENCE.md` 8 строк).
    В замере 2.8 было 28 строк в 9 файлах (`issues/87.md:132`); шаблоны поиска могли различаться.
- **Класс:** канон доверия смотрит в одну сторону: «красный = правда о предмете» ничем не оспаривается, а принцип 4 читает кучу
  красных с общей причиной как подтверждение. TWINS: searched `culprit|the check itself|stand\b|flaky|environment` по
  `TESTING_FRAMEWORK.md`, `BUG_FIXING_FRAMEWORK.md`, `fable-method`, `fable-judge` — found 2 по смыслу: `fable-method/SKILL.md:78`
  (выше) и `TESTING_FRAMEWORK.md:221` `## The agent's stand is not the owner's real world — "done" about production comes after the real world`
  — зеркало (ложный зелёный чистого стенда). `BUG_FIXING_FRAMEWORK.md:135` «the check itself is checked» — о стражах, которые не могут
  покраснеть (снова ложный зелёный).
- **Кто платит сейчас:** полевые проекты, где агент сам строит измерительный стенд (QA, скрейперы, мониторы): каждый такой красный
  уводит сессию чинить несломанное. Исток — тоже (66 строк). Тяжесть **S2** (теряется прогон и час; в поле дважды за два дня).
- **Форма починки:** раздел ≈ 6–8 строк рядом с «The agent's stand is not the owner's real world»: класс («a red is a claim about the
  subject and is earned exactly like a green»), шаг-артефакт `RUN CONTEXT: <что закреплено и напечатано>` перед вердиктом о предмете
  (команду даёт проект, как в тикете), вторая половина принципа 4 той же строкой (кучные красные с общим условием — сначала подпись одной
  ошибки измерения). Плюс зеркальная охота судьи — в навыке, бюджета нет. Место — вынести 6–8 строк из `## How this composes with the rest of KAIF`
  (`:252-270`, 19 строк ссылок) в справочник §17. Проверка: страж пар сборки (строка `RUN CONTEXT:` в каноне ↔ охота судьи), гард 5j
  зелёный на 270. Цена ≈ **0,35–0,5 чата** (замер 2.9 — 0,35; вынос строк и второй слой — сверху).
- **Пересечения:** `ideas/32` п. 4 «AR — Красный от аппарата» (тот же пункт, перенесён из `ideas/31` п. 2); `researches/35_kaif_2.9_scope_recon.md:191`
  `| AR «Красный от аппарата» | #87 (`ideas/31` п. 2) | агент и QA-владелец | 0,35 | 2.10 |`; #159/#160 — общая тема «урок в журнале не
  переносится» (`issues/87.md:84-86`); открытых багов истока на этот класс нет.
- **Слова владельца** (владелец проекта QA_Engineer, в пересказе агента поля, курсивом в тикете): `issues/87.md:21` «ты по всем пунктам
  уверен, что именно харнес KAIF это обязан?» (вопрос, после которого три пункта из пяти сняты); `:120` «чтобы мы понимали, что не баги в
  наших тулзах автоматизации находим, а баги в приложении» (основание эпика `plans/85` проекта). Комментарии 1–2 — ответы истока, не
  слова владельца; решения о разрезе (интервью №034 Q1, №043 Q1) в них только названы.

---

## 6. Парето для группы — 80 % пользы за 20 % усилий (п. 5 задания)

Главное наблюдение: «момент новизны» живёт в рассуждении агента. Хук видит только события: промпт, вызов инструмента, остановку. Проба §2
показывает, что «моменты» KUMM в активной сессии не решают, КОГДА хук говорит, а только КАКИМИ словами. Поэтому носитель новизны — в
каноне, а хук — его механический усилитель. Ту же форму исток уже принял для развилки (`FORK:` + охота судьи вместо хука `recon-before-decision`).

| Ход | Что даёт | Цена |
|---|---|---|
| **A. Строка `KNOWLEDGE:` в пяти ритуалах** (`/end-chat-soft` ш. 1, `/end-chat-force` ш. 1, `/autoloop` ш. 9, `/dayloop` и `/nightloop` ш. 5) + охота судьи «Learned, not recorded» + страж пар | закрывает #159 и половину «закругляться» из п. 16 #160: на закрытии агента спрашивают поимённо, судья видит пустую строку | ≈ 0,3 |
| **B. KAIF-патч `fable-method` шаг 2 правило 7**: сюрприз записывается тем же ходом в документ знаний (строка карты · разведка · досье), не только в чат | носитель «понимания новизны» (пп. 7, 8, 10, 14 #160) там, где новизна и рождается, — в методе; бюджета нет | ≈ 0,1 |
| **C. Шаг 10 гайда и сноски двух карт — повод «узнал, как устроено, или оно изменилось → строка карты тем же ходом»**, без роста строк | убирает узкий повод «if relations change» | ≈ 0,1 |
| **D. Хук памяти, лёгкий**: `UserPromptSubmit` + `PostToolUse` с узким матчером, впрыск дословных вопросов владельца (пп. 7–8) не чаще раза в 10 мин, вариант на слово закрытия без окна; **без нового блока `Stop`** (своя остановка — строкой A или причиной `stop-status-guard`); через `settings-fragment.json` → `wire-hooks`/`check` без новой логики ядра | механическая половина #160 по словам владельца пп. 5, 13, 15, 16 без формы №144 | ≈ 0,75 |
| E. Обязательность (`"hooks": "off"` не снимает), классификатор моментов, блок `Stop` раз в 10 мин | то, что тикет добавил сверх слов владельца или что спорит с п. 6 и №144 | +0,5 и развилка владельца |
| **F. AR** (#87) | отдельный класс тестирования; вынос строк обязателен | 0,35–0,5 |

**80/20:** A + B + C (≈ 0,5 чата) закрывают #159 и смысловую половину #160. D (≈ 0,75) — механическая половина, о которой владелец
просил прямо. E — только словом владельца, с вопросом-сценарием: «отказ проекта от хука памяти: можно (как от остальных четырёх) /
нельзя» и «своя остановка агента: шаг закрытия / блок `Stop`». F — независимо от памяти, ≈ 0,35–0,5.
Для D и строки гайда учесть бюджет: `AGENT_GUIDE.md` 1080/1080 — строка канона о хуке ложится в `framework/hooks/README.md` и навыки,
а гайд правится только заменой строк.

---

## 7. Итоговая таблица

| Тикет | Вердикт сверки | Тяжесть | Цена | Кандидат-эпик (рабочее имя) |
|---|---|---|---|---|
| #160 | PARTIAL: хуки перечитывания CONFIRMED; «нет хука записи» PARTIAL (`stop-status-guard` пишет STATUS); реализация KUMM CONFIRMED (13/13); «моменты новизны» REFUTED пробой (общее окно — таймер); «MANDATORY» противоречит `README.md:7-8` и `KAIF-CORE.mjs:4969`; другие системы — NOT-VERIFIABLE-HERE | S1 | 0,75 (лёгкий хук D) · 1,25–1,5 (как в тикете) | **MH «Хук памяти»** (вместе с KN) |
| #159 | CONFIRMED (все заявления о каноне); адрес «step 7» PARTIAL; `check --maps` не поймал бы инцидент (проба) | S1 | 0,5 (A + B + C) | **KN «Знание — тем же ходом»** |
| #87 | CONFIRMED (класс отсутствует; 2.9 файл не трогала; 270/270); PARTIAL-уточнение — `fable-method:78` | S2 | 0,35–0,5 | **AR «Красный от аппарата»** (`ideas/32` п. 4) |
