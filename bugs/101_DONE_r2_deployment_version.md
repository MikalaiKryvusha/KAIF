# Bug 101 — версия развёртывания: два независимых носителя согласованно называют прошлый релиз

**Status:** 🔬 ПРЕДПОЛОЖИТЕЛЬНЫЙ — не верифицирован, причина не установлена · скоуп **2.3**
**Version/build:** build 279 · **When/context:** круги ревью R1/R2 фазы R, 2026-08-09
**Fix accepted when (observable):** НЕ ОПРЕДЕЛЁН — критерий приёмки задаёт исполнитель после
установления причины (решение №70: разбор и лечение за Fable, не за автором документа)

Семейство из одного вхождения: то, что репозиторий говорит о СВОЕЙ развёрнутой версии, расходится
с тем, что он выпускает. Особенность вхождения — расхождение согласовано между двумя носителями,
которые для человека выглядят взаимной проверкой (документ корня и машинный маркер), поэтому
перекрёстная сверка подтверждает ошибочное значение, а не ловит его. Вхождение не верифицировано;
причина не устанавливалась.

## 1. Запись о развёртывании и маркер `.kaif/kaif.json` называют 2.0 «Excellent KAIF» при живых 2.2 «Yolden KAIF»

**Адрес:** `KAIF_FRAMEWORK.md:53`
Прочие адреса того же вхождения: `.kaif/kaif.json:3-4` (поля `version`, `released`) ·
`tools/kaif.mjs:29-33` (ветка `case 'version'`, печать из маркера) ·
`.claude/skills/release/SKILL.md` · `.claude/skills/kaif-version/SKILL.md:18-24` (шаг 1 ритуала).

**Заявлено.** `KAIF_FRAMEWORK.md` — ключевой документ корня, и его раздел «Запись о развёртывании»
объявляет развёрнутую в этом проекте версию. Навык `/kaif-version` объявляет своим источником
маркер: «Reads the `.kaif/kaif.json` marker (version, release date, origin, tracking mode)», шаг 1
— «**Read the local marker** `.kaif/kaif.json` … Report: current version + release date».
`tools/kaif.mjs` помечен `[TESTED: 2026-08-09 · голый прогон печатает запись развёртывания из
.kaif/kaif.json и верный указатель на /kaif-version]`.

**Наблюдалось.** Оба носителя стоят на `2.0` / `2026-07-28`, тогда как `version.json` даёт
`2.2` «Yolden KAIF», выпуск `2026-08-08`, build 279. В `tools/kaif.mjs` при НАЛИЧИИ маркера ветка
`if (m)` печатает значения маркера и до чтения `version.json` не доходит (`ver()` вызывается, но
результат используется только в ветке `else if (v)`), поэтому пользователю печатается 2.0. Ни
`counters-guard`, ни `check-framework` этих полей не стерегут; в `.claude/skills/release/SKILL.md`
шага обновления `KAIF_FRAMEWORK.md` / `.kaif/kaif.json` нет — упоминается только `version.json`
(строки 126 и 152).

**Улика.**

```
$ grep -n "Версия KAIF" KAIF_FRAMEWORK.md
53:| **Версия KAIF** | 2.0 «Excellent KAIF» (выпущена 2026-07-28) |

$ grep -n '"version"\|"released"' .kaif/kaif.json
3:  "version": "2.0",
4:  "released": "2026-07-28",

$ cat version.json
{
  "name": "KAIF",
  "major": 2,
  "minor": 2,
  "codename": "Yolden KAIF",
  "released": "2026-08-08",
  "origin": "https://github.com/MikalaiKryvusha/KAIF",
  "build": 279
}

$ node tools/kaif.mjs version
KAIF 2.0 (2026-07-28) · tracking=origin · origin=https://github.com/MikalaiKryvusha/KAIF · sphere=meta/framework · agents=claude-code
Check origin for a newer release with the /kaif-version skill, or:
  gh release view --repo MikalaiKryvusha/KAIF --json tagName,publishedAt

$ node tools/counters-guard.mjs
counters: 57 embedded (14 docs + 7 readmes + 35 skills + 1 tools) · bundle 161 blocks · 691 modules · polygon 14 suites
✅ counters OK — 50 зеркал сверены с живыми числами …

$ grep -rn "kaif.json" .claude/skills/release/SKILL.md tools/counters-guard.mjs tools/check-framework.mjs
(пусто)
```

**Кого касается.** Человека, спрашивающего «какая версия KAIF здесь развёрнута», и агента,
исполняющего `/kaif-version` в этом репозитории: оба независимых источника отвечают согласованно и
одинаково неверно, так что перекрёстная сверка подтверждает ошибку вместо того, чтобы её вскрыть.
Дальше по шагу 2–3 `/kaif-version` сравнение «локальные 2.0» против «релиз origin» даёт вывод, что
исток отстал от самого себя, и предлагает мигрировать его на собственный релиз.

**Замечено.** Круг ревью R1, подтверждено кругом R2 (фаза R, 2026-08-09).

**Состояние на 2026-08-09.** Все названные адреса на месте, наблюдаемое воспроизводится дословно
после закрытия шести блокеров (300104b, 6bf6445, 2cb1c33, f65107f, 2079536): `KAIF_FRAMEWORK.md:53`
по-прежнему «2.0 «Excellent KAIF» (выпущена 2026-07-28)», `.kaif/kaif.json` — `"version": "2.0"`,
`node tools/kaif.mjs version` печатает «KAIF 2.0 (2026-07-28)», `counters-guard` зелёный.

## Триаж 2.3 (фаза S, 2026-08-14)

> Вердикты двухступенчатого триажа (механика на HEAD → скептик, дефолт REFUTED; сводная таблица — `reports/KAIF_AUDIT/2026-08-14_r2_triage_SUMMARY.md`).

| № | Вердикт | Тяжесть | Эпик | Улика триажа |
|---|---|---|---|---|
| 1 | STALE | hygiene | - | Снято коммитом a3178b1 «fix(фаза S, bugs/101): исток перестал врать о своей версии» (после R2; свежее fea9a7e из механического отчёта — те незакоммиченные правки уже закоммичены, рабочее дерево чисто по git status). Наблюдено на HEAD: KAIF_FRAMEWORK.md:53 = «2.2 — Yolden KAIF (выпущена 2026-08-08)»; .kaif/kaif.json = version 2.2 / released 2026-08-08 — совпадает с version.json (2.2 Yolden KAIF, 2026-08-08, build 314); живой прогон node tools/kaif.mjs version печатает «KAIF 2.2 (2026-08-08)». Коммит также ввёл пару «version.json ↔ носители версии истока» в реестр пар AGENT_GUIDE (страж доказан красным на дефекте до починки), так что вхождение не только починено, но и застраховано. Исходное наблюдение R1/R2 было верным (не REFUTED), дефект снят фикс-коммитом — STALE. |

## ✅ STATUS: DONE (2026-08-14 07:07 +03:00)

Единственное вхождение — STALE: наблюдение круга было верным, дефект снят фиксом фазы S
2.3 (коммит `a3178b1`, 2026-08-14): маркер `.kaif/kaif.json` и `KAIF_FRAMEWORK.md` сведены к
живой версии, пара «version.json ↔ носители версии истока» добавлена в реестр пар
`AGENT_GUIDE.md`, страж доказан красным на живом дефекте ДО починки. Вердикты триажа — в секции
«Триаж 2.3» выше; сводная таблица — `reports/KAIF_AUDIT/2026-08-14_r2_triage_SUMMARY.md`.
