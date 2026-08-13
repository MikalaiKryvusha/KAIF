# KLAS — KAIF 2.1 → 2.2 update field report

> **Created:** 2026-08-14 00:45 +03:00 · **Parent:** `/kaif-update` run of 2026-08-14 · **Status:** final ·
> **Outward:** sent to origin as a GitHub issue (owner's explicit instruction in chat: «по итогу
> обновления — напиши полевой отчёт разработчику KAIF в GitHub»).

Project: **KLAS** — ai-infrastructure, working language **ru**, wrapper **translated wholesale**
(every framework file is a Russian localization), Windows 11, Node v24.15.0, tracking **origin**.
Route: **first mechanical `core-update` of this deployment** (1.6→2.1 went legacy-bootstrap).
Receipt: `replaced 4 · mergedModules 20 · added 14 · kept 59`; 37 diverged files hand-merged into
the Russian canon; 3 new files translated wholesale (`REQUIREMENTS_FRAMEWORK.md`,
`reports/README.md`, `kaif-go/SKILL.md`); 7 parallel transfer agents, ~790k subagent tokens.

## What worked — worth keeping

1. **The 2.2 heading-script detector is a big win for translated wrappers.** 37 of 38 wholesale-
   translated files were correctly classified «translated wholesale — kept intact; fold the news in
   by hand». The 2.1 machinery glued English modules into these same files (see our 2.1 report,
   defects D1/D3); 2.2 protects them. The counter lies are gone too.
2. **Sandbox-first paid for itself before the live run.** File-copy sandbox (git archive is
   impossible here — the wrapper lives outside git), REAL `update` run inside it. The sandbox pass
   predicted the live pass exactly, including the one remaining merge defect (below), at zero cost
   to the live tree.
3. **Russian language templates in the bundle (`templates/languages/ru/`)** made the README /
   KAIF_FRAMEWORK merges precise: the module diffs in `KAIF_UPDATE_TASK.md` arrived already in
   Russian. For a translated deployment this converts guess-translation into mechanical folding.
4. **`kaif-requirements-lint` ships bilingual dictionaries** (EN `\b`-regexes + RU stem
   lookarounds). A translated wrapper stays lintable; selftest green after we translated
   `REQUIREMENTS_FRAMEWORK.md` and mirrored the stop-dictionary as a three-column table (class ·
   EN · RU, RU column verbatim from the linter stems).
5. **The refresh-hooks module wired cleanly on Windows / PowerShell 5.1.** All three hooks passed
   the README smoke procedure: timer prints the JSON order with no marker and stays silent with a
   fresh one; SessionStart prints the order; Stop guard exits 0 silently. Wired into
   `.claude/settings.json` on the owner's explicit word (recorded with date and time per the new
   timestamp canon).

## Defects / signals — each with our local remediation

1. **PHILOSOPHY.md still gets English modules glued into a translated file.** The heading-script
   detector reads headings, and PHILOSOPHY's legitimate Russian headings carry Latin terms («KISS —
   Keep It Simple, Stupid», «Best practices», «DRY») — the file was classified untranslated, and
   `update` reported «merged 20 module(s) into PHILOSOPHY.md (1 kept for you)» while actually
   inserting 20 English template modules next to their Russian twins (both languages side by side,
   sections duplicated). Reproduced twice: sandbox AND live. This is the narrowed survivor of the
   2.1 bilingual-gluing class: fixed for heading-translated files, still alive for files whose
   translated headings legitimately contain Latin. A possible fix: measure script share over the
   whole body, not headings alone.
   *Local remediation:* restored the file from the pre-update backup, folded the three real 2.2
   novelties in by hand.
2. **`update` is not crash-safe.** Our first live run was killed mid-pass by our own shell fault
   (PowerShell `Select-Object -First N` terminates the pipeline and kills the native process — now
   recorded in our environment dossier). Result: files already replaced/merged on disk, marker
   still 2.1, no `KAIF_UPDATE_TASK.md`, no receipt — a half-updated tree with no evidence an update
   ever ran. There is no journal, no staging, no resume.
   *Local remediation:* full file backup of the wrapper before the update (already канон for this
   project), restore + clean re-run. Suggestion: stage into a temp dir and swap, or write a
   journal entry first so a dead pass is at least visible.
3. **`diff --source <repo-page-url>` dies unhelpfully.** The skill text offers `--source
   <url|dir>`; given `https://github.com/MikalaiKryvusha/KAIF` it 404s on
   `<url>/kaif-manifest.json` without saying what URL shape it expects (the dist root). On Windows
   the failed download also trips a libuv assertion (`!(handle->flags & UV_HANDLE_CLOSING)`,
   `src\win\async.c:76`) after the error message.
   *Local remediation:* none needed — bare `diff` with the default source works.
4. **Placeholder ghost, second occurrence.** The update task lists `<BUILD_COMMAND>` under
   `placeholders`, but no deployed file contains it (grep over the whole tree; same class as our
   2.1 report and issue #3 — the gate scans templates, not the deployment). Cost: an agent hunts
   for a placeholder that does not exist.
   *Local remediation:* checked every deployed surface, recorded the absence, put the intended
   value (`npm run kaif:check`) into the one spot of `/kaif-go` that names a check.
5. **The receipt violates the receipt schema.** §12.3 of `KAIF_REFERENCE.md` (2.2) says `date` and
   `verifiedAt` are MOMENTS — full ISO 8601 with the owner's local offset, «never a bare date» —
   yet the 2.2 machinery wrote `"date": "2026-08-13"` into `.kaif/last-update.json`: bare, and in
   the wrong day for the owner's clock (the update ran 2026-08-14 00:05 +03:00; the bare date looks
   like UTC). The schema's own rationale (two updates in one day are indistinguishable) applies.
6. **Canon tension: `AUTHOR_STYLOMETRY.md` at project root vs a multi-project voice store.** The
   owner's portrait canon (krinik-stylometry, v1.1) states: the portrait lives in ONE voice store,
   projects REFERENCE it and keep no copies. The KAIF canon expects a FILE named
   `AUTHOR_STYLOMETRY.md` in the project root. We reconciled with a symlink (root name → private
   store checkout, gitignored); works on Windows with admin rights. The canon could bless the
   reference/symlink pattern explicitly for owners with more than one project — otherwise every
   deployment is one hand-copy away from a stale fork of the voice.

## Judge verdict (adversarial pass, recorded verbatim by `checkpoint judge`)

«VERIFIED WITH CAVEATS — маркер/квитанция/чекпоинты/хуки/симлинк/миграция отчётов воспроизведены
наблюдением, оба охранника (kaif-i18n-guard, kaif-core check) прогнаны заново и зелёные, живые
файлы — строгие надмножества бэкапа (заголовки + контентные выборки, потерь нет), англо-дублей и
нулевых файлов нет; каверзы: (1) физической директории bugs/KAIF/ на диске нет — она существует
только как раздел в bugs/README.md (git пустых директорий не хранит; создастся первым тикетом),
(2) чекпоинт judge ожидаемо отсутствует — его ставит оркестратор после этого вердикта.»

## Owner decisions recorded this run

- refresh-hooks module: **wired** — owner's word in chat, 2026-08-14 00:19 +03:00.
- Stylometric core: **adopted as a reference** — root `AUTHOR_STYLOMETRY.md` is a symlink to the
  single voice store (`F:\krinik_voice`, krinik-stylometry v1.1, accepted 2026-08-08); kept out of
  the public KLAS repo.

