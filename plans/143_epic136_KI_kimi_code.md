# План 143 — KI: full KAIF 2.10 on Kimi Code (operational plan, rev. 2)

> **Создан:** 2026-11-21 (Kimi Code; owner's «гоу» after the sixth scope revision) · **rev. 2** 2026-11-21 16:55 +03:00 (session 104, Claude Opus 5.5; owner's
> word 2026-11-21 16:35 +03:00: «иди в интернет в разведку … и потом план. как KAIF под KIMI адаптировать»). Written in English by rule №163.
> **Родитель:** `plans/136` criteria 37–40 · `researches/50` (harness + K3.1 Pro recon — every step below cites it) · `researches/48` · №162.
> **Статус:** 🟢 rev. 2 2026-11-21 16:55 +03:00 — recon done; KA0 ✅ (`21584dc`); D1–D4 answered 2026-11-21 17:07 +03:00 (№164); KA1 · KA3 ·
> D2 · D3 · D4 done 2026-11-21 17:19 +03:00 (guard 5zb red on `9263794` exactly 5; window mutants K1–K3 red on their cases; the owner's
> `~/.kimi-code/config.toml` and new `tui.toml` written with a backup, `kimi doctor` OK; the D2 line in a Kimi install's `AGENTS.md` and in
> the origin's new `AGENTS.md`); KA6 2026-11-21 17:28 +03:00 — a farewell on `StopFailure`, read right on the two real quota-dead sessions of the day
> (the `PARKED:` line of the step is dropped: the farewell file alone reaches the next `/resume` first — `[ИИ]`); Kimi firing the hooks live —
> KA9, after the 5-hour quota resets. KA2 · KA4 · KA5 · KA8 done (KA5 + KA8 — 2026-11-21 21:04 +03:00, report below).
> **KA9 REOPENED 2026-11-23 00:27 +03:00 (bugs/150 recurrence):** ранняя приёмка на 87 % доказала только отказы до входа в soft. После неё ступень 92 % не стала постоянным force-latch, вход в force открыл обычную работу и wire 2474 зафиксировал `context.apply_compaction`. Полное исправление и повторная живая приёмка — `plans/144`; прежний отчёт остаётся историческим срезом, не закрытием пути.
> **KA9 live 2026-11-21 17:57 +03:00 (three `kimi -p` runs, the owner's new quota window):** Kimi itself fired `UserPromptSubmit`, `SessionStart` →
> `/skill:resume`, `PostToolUse` and `PreToolUse` without matchers (knowledge weight, the test debt of `src/app.mjs`, the closing gate at
> «69178 of 891289»), `--alive` exit 0; found and fixed `bugs/146` (Kimi's `Write {path}`); NOT observed — a Stop block opening a
> continuation turn in `kimi -p`, `PostToolUseFailure`, `PermissionRequest`, `PostCompact`/`StopFailure` live (`StopFailure` proven on real
> records); next — one TUI session for the Stop path. KA4 ✅ · KA5 (bare `/resume` hint for a Kimi + Codex install) ✅ in part.
> **Stop path by Kimi's code 2026-11-21 18:25 +03:00 (session 105):** the block does open a continuation turn in a session that stays alive (TUI · ACP ·
> web: `runStop` → `loop.notify` → `releaseIntake` → `schedule`), and `kimi -p` usually drops it — print mode follows further turns only while a turn, a goal, a cron fire or a background
> task is pending, otherwise `cleanup → quiesceSessionAgents` cancels the loop while the asynchronous Stop hook still runs; a turn ending
> with a queued request runs no Stop at all (`researches/50` §14; narrowed by the judge of session 105 — it said «waits for its own turn
> only»). The adapter says so. **Live VS Code 2026-11-22 09:40 +03:00:** the continuation arrived with `origin: system_trigger / stop_hook`; the new file ran and the debt cleared. **Live all five former silent hooks 2026-11-22 10:54 +03:00:** `PostToolUseFailure` produced the knowledge reminder and ACP `session_476e0bc5…` produced `PermissionRequest` with an automatic approval and the voice file; `bugs/145` · `146` · `147` DONE. Reports `testcases/reports/2026-11-22_kimi-stop-alive.md` and `…_ki-ka9-live-hooks.md`. `bugs/149` remains the only live KA9 blocker.
> **Вовне:** four owner decisions (interview, scenario form) · one write permission for the owner's `~/.kimi-code/config.toml`.

## Goal vector (Achieve)

A Kimi Code session in any project with KAIF 2.10 gets the same working contour as Claude Code: the canon in context, all 37 skills callable,
every delivered hook actually fired by Kimi (not by our test harness), the context-window stages arriving before Kimi's own compaction, the
owner's questions and mid-turn words reaching the agent, and a chat that dies of quota leaving a handoff behind.

## Acceptance criteria

1. **Hooks fire in Kimi itself.** Situation: a git project with KAIF installed for `kimi-code`, hooks wired. Action: one `kimi -p` run that
   reads a file, edits a file and ends. Result: a trace line from every wired hook event (`UserPromptSubmit` · `PreToolUse` · `PostToolUse` ·
   `Stop` · `SessionStart`) in `.kaif/kimi-hook-trace.log`. Check: `node tools/sandbox/probes/ki-live-hooks.mjs` exits 0 and lists 5/5;
   build `9263794` lists ≤ 2/5.
2. **No invalid Kimi matcher can ship.** Check: `node tools/build-framework.mjs` refuses a fragment with `matcher = "*"` (guard red on
   `9263794`, green after KA1).
3. **Hooks are silent outside KAIF projects and work from a subfolder.** Check: the dispatcher selftest — no `.kaif/kaif.json` up the tree →
   exit 0, no output; started in `<project>/src` → the project's hook runs.
4. **The closing requirement arrives before Kimi compacts and cannot lapse unobeyed.** Check: `context-window.mjs --selftest` Kimi cases —
   at the configured compaction trigger (default `min(0.85·W, W − 50 000)`, `researches/50` §9) minus the margin the owner picks (decision D1),
   the order is emitted; above close/force EVERY ordinary PreToolUse is refused until the closing skill is entered, a new owner prompt re-arms
   the requirement, PostCompact clears it. Mutants K4–K5 remove those two properties and go red on exactly their cases (bugs/150, №166).
5. **`--alive` and `check` judge Kimi by Kimi's config.** Check: on a Kimi-only install `--alive` reads `~/.kimi-code/config.toml` and
   `check` prints no `.claude/settings.json` line.
6. **A quota death leaves a handoff.** Check: a `StopFailure` event with a quota error writes the farewell file; the next `/resume` reads that file first.
7. Criteria 37–40 of `plans/136` are ticked only after their scenarios ran on the built `dist` in a live Kimi session; the full
   `npm run test:core` is green; `/fable-judge` reviewed every claim.

## Steps

- [x] **KA0 — Commit the recon and the parked fix.** Anchor: `plans/136` → KI 37–40. `researches/50`, `bugs/145`, the standing-lie corrections
  (STATUS · `researches/48` · EXPERIENCE · `bugs/144` · report · `KAIF_FRAMEWORK.md`), the prior session's `s14` assertions (s14 green,
  mute guard green, session 104). ≈ 0.25 h.
- [x] **KA1 — Fix the matchers (`bugs/145`).** Anchor: criterion 38. In `framework/hooks/kimi-config-fragment.toml` drop the five
  `matcher = "*"` lines (omitted = all, `researches/50` §6), anchor the rest: `^(Write|Edit)$` · `^Agent$` · `^Skill$`. New build guard:
  every Kimi matcher compiles with `new RegExp`, and every `[[hooks]]` entry has only `event · matcher · command · timeout` with a known
  event (one bad entry drops the whole section — §6). Prove red on `9263794`. Fix the `[TESTED]` line of `context-window.mjs:103`.
  ≈ 1–1.5 h.
- [x] **KA2 — One user-level dispatcher, not 21 project-relative commands.** (✅ 2026-11-21 18:51 +03:00 session 105: `framework/hooks/kimi-hook.mjs` +
  `wire-hooks --kimi` + task item `wire-kimi-hooks` with an executing gate; selftest 8/8, mutants D1–D5, `s14` «KA2» 10 cases; the owner's real
  config rewired with a backup, its commands answer from the origin root and a subfolder and stay silent outside KAIF — report
  `testcases/reports/2026-11-21_ka2-kimi-hook-dispatcher.md`; Kimi itself firing it live — KA9. `[ИИ]` deviations from the step: the run writes
  without a separate «owner's explicit word» — the dispatcher makes the global wiring silent outside KAIF, so it is wired like Claude's hooks
  (#115); the origin's untracked `.kaif/hooks/` copy is dropped and the dispatcher falls back to `framework/hooks/` when the KAIF origin sign
  `framework/installer/KAIF-CORE.mjs` exists; the task item appears only when Kimi Code is set up for the user — the polygon points
  `KIMI_CODE_HOME` at a missing folder.) Anchor: criterion 38. Kimi hooks are user-level only, run in
  the session folder (not the git root) through `cmd.exe` (§6). `FORK: options <A per-event "node .kaif/hooks/x.mjs" as now | B one
  dispatcher ~/.kimi-code/kaif/kaif-hook.mjs <hook> that walks up from stdin cwd to .kaif/kaif.json and runs that project's own script |
  C a user-level KAIF plugin with hooks + systemPrompt> · price of error <hooks dead from subfolders and noisy in every non-KAIF folder (A);
  version skew if the dispatcher carries logic (B); an install/reinstall flow per update (C)> · consulted <Kimi docs hooks.md + plugins.md,
  code matchHooks.ts/runHook.ts (researches/50 §6, §6a)>` → **B**: the dispatcher is ~40 lines, logic-free, versionless; the project keeps
  its own hook scripts. `wire-hooks` learns `--agents kimi-code`: prints the exact `[[hooks]]` diff, writes only on the owner's explicit
  word (global file — `plans/143` rule since rev. 1), backs up, validates with `kimi doctor config`. Plugin (C) → `ideas/33` for 2.11.
  ≈ 2–3 h.
- [x] **KA3 — Window stages before Kimi's compaction.** Anchor: criterion 38, owner decision №161. Kimi compacts at
  `min(0.85·W, W − 50 000)` checked before every step, counting each Cyrillic character as a token (§9) — KAIF's 85 % and 92 % stages never
  arrive. The hook reads `loop_control.compaction_trigger_ratio` / `reserved_context_size` from Kimi's config and places the stages below the
  trigger by the margin of decision D1. Delivery mid-turn: only `UserPromptSubmit` injects text and `PreToolUse` / `Stop` can block (§6) —
  the order goes through a one-time `PreToolUse` block (its reason is written back into the context) and `Stop`, never through
  `PostToolUse`. ≈ 1.5–2.5 h.
- [x] **KA4 — `--alive` and `check` for Kimi.** Anchor: criterion 38. `--alive` today reads only `.claude/settings.json`
  (`context-window.mjs:397-401`) and always answers «nothing to judge» under Kimi (`researches/50` §12.6). Under Kimi it reads the
  `[[hooks]]` of `~/.kimi-code/config.toml` (and flags invalid matchers) plus the session record; `check` on a Kimi-only install reports Kimi
  wiring instead of Claude's. ≈ 1–1.5 h.
- [x] **KA5 — Skills: listing, root, triggers.** ✅ 2026-11-21 21:04 +03:00. (a) Every Kimi copy carries the full description, aliases included,
  in folded `whenToUse`; 37/37 at the origin and in the fresh install, and the running Kimi VS Code session re-read its catalog live. (b) Without
  a nearest `.git` ancestor both `install` and `check` say that Kimi cannot discover the project skills (s01 S9). (c) This live session called
  `Skill(fable-method, args="report")`, received the expanded skill with its resolved reference paths, then read
  `.kimi-code/skills/fable-method/references/failure-modes.md`. Report `testcases/reports/2026-11-21_ka5-ka8-kimi-skills-and-install.md`.
- [x] **KA6 — Quota death leaves a handoff.** Anchor: criterion 39. The prior Kimi chat died on the 5-hour quota (429, not retried) with
  `[object Object]` and no farewell (§12.5). Wire `stop-farewell-capture.mjs` also on `StopFailure`: on a quota error it writes the farewell
  file; the next `/resume` reads that file first. ≈ 0.5–1 h.
- [x] **KA7 — Owner conversation under Kimi.** (D1–D4 answered in chat, №164; the adapter names steer · Never Ask · the window steps) Anchor: criterion 39. Interview with decisions D1–D3 (below), then the adapter and
  `framework/adapters/kimi-code.md` say what each chosen setting does. ≈ 0.5–1 h plus the owner's answers.
- [x] **KA8 — Install findings (criterion 40, interview №050 Q1 = A).** ✅ 2026-11-21 21:40 +03:00 after the judge's refutation: the maps checkpoint refuses shipped template slots, passes after filling, and also passes the origin's real filled maps containing generic `<name>`/`<dir>`/`<DOC>` notation. The Russian KAIF document is clean under the voice lint (H1 + two H2, all declared as renames); the drift warning names `sync`. Each finding has a red control on its exact pre-fix construct in `tools/sandbox/probes/ka8-install-findings.mjs`; fresh install and s01 green. Report `testcases/reports/2026-11-21_ka5-ka8-kimi-skills-and-install.md`; judge `reports/KAIF_AUDIT/2026-11-21_kimi_session_judge.md`.
- [ ] **KA9 — Live acceptance, polygon, judge.** ⏳ REOPENED 2026-11-23 00:27 +03:00: прежний срез на 87 % доказал только вход в soft; последующий force-entry открыл обычную работу до `context.apply_compaction` (wire 2474). Полное исправление передано `plans/144` F2/F4: soft→force escalation, ограниченный post-entry контур, auto-compaction off и живой путь до прощания. Anchor: «Готово, когда» of `plans/136`, criteria 18 and `plans/141` RL1. Fresh `git init`
  project from the built `dist`, Kimi-only install, wiring by the owner's word; `kimi -p` runs (auto permission — §11) after the quota
  window resets: `/skill:resume`, a skill with an argument and a reference, a voice call before a wait, recovery after `/compact`; run reports
  in `testcases/reports/`; full `npm run test:core` alone; `/fable-judge` on every KI claim; hand over to `plans/141`. The generic live-evidence
  contract is `framework/adapters/_template.md`. The first VS Code Stop probe failed because the process held the pre-dispatcher wiring; the false
  green `--alive` became `bugs/147` (fixed in the tree, positive live check pending a new/reloaded session). On 2026-11-21 21:42 +03:00 this
  process reached `context.apply_compaction` before soft closure: `bugs/149` is a release blocker and can close only on a real new/reloaded Kimi
  session whose 75/80/85 stages arrive and whose soft closure starts before compaction. ≈ 3–5 h.

Total ≈ 11–18 h of work, plus the owner's answers to D1–D4.

## Owner decisions — ANSWERED 2026-11-21 17:07 +03:00 in chat (journal №164)

- **D1 → keep Kimi's compaction trigger; move KAIF's stages for Kimi below it** — «порог KIMI не трогаем, правим наши правила для этой ИИ
  системы, чтобы она запускала срез и мягкое завершение чата раньше, не доходя до сжатия контекста».
- **D2 → Never Ask stays for tool calls; vision-level decisions go to `interviews/` through the KAIF contour** — «инструменты CLI пусть не
  спрашивает. Высокоуровневые проектые решения уровня видения - пусть носит в интервью интерактивным контуром KAIF».
- **D3 → steer, no queue** — «Сразу, без очередей.»
- **D4 → granted** — «РАЗРЕШАЮ ПРАВИТЬ.»

The questions as they were asked (kept for the record):

- **D1 — where the window stages sit under Kimi.** A: KAIF moves its stages below Kimi's compaction (soft close at the trigger minus a
  margin). B: KAIF raises Kimi's compaction trigger (`compaction_trigger_ratio` 0.95) so 75 · 80 · 85 · 92 stay. C: both.
- **D2 — Never Ask mode.** The owner's Kimi runs `default_permission_mode = "auto"`, where Kimi tells the model it «decides everything on its
  own» (§10) — against KAIF's fork rule. A: keep it and KAIF's `AGENTS.md` states that forks still go to the owner. B: KAIF recommends
  Ask When Needed (`yolo`).
- **D3 — the owner's word mid-turn.** Kimi queues a message typed during a turn until the turn ends (§10); KAIF's rule says answer at once.
  A: KAIF recommends `follow_up_behavior = "steer"` in `tui.toml`. B: keep the queue; the owner uses `Ctrl-S`. (A hook that stops work on the
  owner's word is excluded by №144.)
- **D4 — permission to write** the five matcher fixes and the dispatcher into `~/.kimi-code/config.toml` (backup first, `kimi doctor config`
  after).

## Verification

Build guard of KA1 (red on `9263794`); dispatcher selftest; `context-window.mjs --selftest` Kimi cases; `s01` / `s14`; new live probe
`tools/sandbox/probes/ki-live-hooks.mjs` (a real `kimi -p` in a fresh git project, hook trace file); run reports
`testcases/reports/2026-11-2x_ki-*.md`; full `npm run test:core`; `/fable-judge`.

## Risks

1. **(a) Quota.** Live runs burn the owner's 5-hour Kimi quota; a run that hits it is `blocked`, never `fail` of KAIF — read the session
   wire before judging (§12.5). Live steps are batched into few `kimi -p` runs.
2. **(a) The owner's global config.** One invalid `[[hooks]]` entry silently drops all hooks (§6) — every write is validated by the build
   guard's rules and `kimi doctor config`, with a timestamped backup.
3. **(b) Harness drift.** Kimi Code ships weekly (2.7.2 on 2026-11-21); matcher and compaction code are cited with file:line — re-check them
   on the installed bundle before KA9.
4. **(c) IDE parity.** VS Code / ACP share the engine and `config.toml`, but hook parity is undocumented (§14) — named, not tested in 2.10.

## Решения, принятые агентом без владельца

1. `[ИИ]` rev. 2 replaces rev. 1 in place instead of a second plan (one goal, one plan); rev. 1 KI0–KI6 live on as KA0, KA8, KA9.
2. `[ИИ]` KA2 option B (dispatcher) over plugin C — reasons in its `FORK:` line; the plugin goes to `ideas/33`.
3. `[ИИ]` The mid-turn delivery channel of KA3 is a one-time `PreToolUse` block for the window order only — not for owner messages (№144).
4. `[ИИ]` (session 105, KA2) The field task item `wire-kimi-hooks` writes the user-level `~/.kimi-code/config.toml` WITHOUT asking the owner
   — against rev. 1 of this plan («writes only on the owner's explicit word»). Reason: the dispatcher makes the global wiring silent outside
   KAIF, so it is wired like Claude's hooks by the KAIF owner's rule (#115); a backup and `kimi doctor config` come first. Since the default
   agent list holds `kimi-code`, ANY default install on a machine with Kimi Code set up gets the item. Revisable by the owner's word.
5. `[ИИ]` (session 105) The dispatcher falls back to `framework/hooks/` only where `framework/installer/KAIF-CORE.mjs` exists (the KAIF
   origin); the origin's untracked `.kaif/hooks/` copy was dropped.
6. `[ИИ]` (session 105) The polygon runner points `KIMI_CODE_HOME` at a missing folder; a sandbox suite run ALONE on a machine with Kimi
   still reads the real config for the task item (s04 · s07 tick every item) — named, not fixed.
7. `[ИИ]` (session 105) Known limits of `wire-hooks --kimi`, named in its log or here: a line the owner changed inside a KAIF entry is not
   carried over (the backup keeps it); a config with mixed line endings is written with one.
