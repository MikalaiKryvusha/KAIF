# План 143 — KI: full KAIF 2.10 on Kimi Code (operational plan, rev. 2)

> **Создан:** 2026-11-21 (Kimi Code; owner's «гоу» after the sixth scope revision) · **rev. 2** 2026-11-21 16:55 +03:00 (session 104, Claude Opus 5.5; owner's
> word 2026-11-21 16:35 +03:00: «иди в интернет в разведку … и потом план. как KAIF под KIMI адаптировать»). Written in English by rule №163.
> **Родитель:** `plans/136` criteria 37–40 · `researches/50` (harness + K3.1 Pro recon — every step below cites it) · `researches/48` · №162.
> **Статус:** 🟢 rev. 2 2026-11-21 16:55 +03:00 — recon done; KA0 ✅ (`21584dc`); D1–D4 answered 2026-11-21 17:07 +03:00 (№164); KA1 · KA3 ·
> D2 · D3 · D4 done 2026-11-21 17:19 +03:00 (guard 5zb red on `9263794` exactly 5; window mutants K1–K3 red on their cases; the owner's
> `~/.kimi-code/config.toml` and new `tui.toml` written with a backup, `kimi doctor` OK; the D2 line in a Kimi install's `AGENTS.md` and in
> the origin's new `AGENTS.md`); KA6 2026-11-21 17:28 +03:00 — a farewell on `StopFailure`, read right on the two real quota-dead sessions of the day
> (the `PARKED:` line of the step is dropped: the farewell file alone reaches the next `/resume` first — `[ИИ]`); Kimi firing the hooks live —
> KA9, after the 5-hour quota resets. KA2 · KA4 · KA5 · KA8 open.
> **KA9 live 2026-11-21 17:57 +03:00 (three `kimi -p` runs, the owner's new quota window):** Kimi itself fired `UserPromptSubmit`, `SessionStart` →
> `/skill:resume`, `PostToolUse` and `PreToolUse` without matchers (knowledge weight, the test debt of `src/app.mjs`, the closing gate at
> «69178 of 891289»), `--alive` exit 0; found and fixed `bugs/146` (Kimi's `Write {path}`); NOT observed — a Stop block opening a
> continuation turn in `kimi -p`, `PostToolUseFailure`, `PermissionRequest`, `PostCompact`/`StopFailure` live (`StopFailure` proven on real
> records); next — one TUI session for the Stop path. KA4 ✅ · KA5 (bare `/resume` hint for a Kimi + Codex install) ✅ in part.
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
4. **The soft-close order arrives before Kimi compacts.** Check: `context-window.mjs --selftest` Kimi cases — at the configured compaction
   trigger (default `min(0.85·W, W − 50 000)`, `researches/50` §9) minus the margin the owner picks (decision D1), the order is emitted once.
5. **`--alive` and `check` judge Kimi by Kimi's config.** Check: on a Kimi-only install `--alive` reads `~/.kimi-code/config.toml` and
   `check` prints no `.claude/settings.json` line.
6. **A quota death leaves a handoff.** Check: a `StopFailure` event with a quota error writes the farewell file and a `PARKED:` line.
7. Criteria 37–40 of `plans/136` are ticked only after their scenarios ran on the built `dist` in a live Kimi session; the full
   `npm run test:core` is green; `/fable-judge` reviewed every claim.

## Steps

- [ ] **KA0 — Commit the recon and the parked fix.** Anchor: `plans/136` → KI 37–40. `researches/50`, `bugs/145`, the standing-lie corrections
  (STATUS · `researches/48` · EXPERIENCE · `bugs/144` · report · `KAIF_FRAMEWORK.md`), the prior session's `s14` assertions (s14 green,
  mute guard green, session 104). ≈ 0.25 h.
- [ ] **KA1 — Fix the matchers (`bugs/145`).** Anchor: criterion 38. In `framework/hooks/kimi-config-fragment.toml` drop the five
  `matcher = "*"` lines (omitted = all, `researches/50` §6), anchor the rest: `^(Write|Edit)$` · `^Agent$` · `^Skill$`. New build guard:
  every Kimi matcher compiles with `new RegExp`, and every `[[hooks]]` entry has only `event · matcher · command · timeout` with a known
  event (one bad entry drops the whole section — §6). Prove red on `9263794`. Fix the `[TESTED]` line of `context-window.mjs:103`.
  ≈ 1–1.5 h.
- [ ] **KA2 — One user-level dispatcher, not 21 project-relative commands.** Anchor: criterion 38. Kimi hooks are user-level only, run in
  the session folder (not the git root) through `cmd.exe` (§6). `FORK: options <A per-event "node .kaif/hooks/x.mjs" as now | B one
  dispatcher ~/.kimi-code/kaif/kaif-hook.mjs <hook> that walks up from stdin cwd to .kaif/kaif.json and runs that project's own script |
  C a user-level KAIF plugin with hooks + systemPrompt> · price of error <hooks dead from subfolders and noisy in every non-KAIF folder (A);
  version skew if the dispatcher carries logic (B); an install/reinstall flow per update (C)> · consulted <Kimi docs hooks.md + plugins.md,
  code matchHooks.ts/runHook.ts (researches/50 §6, §6a)>` → **B**: the dispatcher is ~40 lines, logic-free, versionless; the project keeps
  its own hook scripts. `wire-hooks` learns `--agents kimi-code`: prints the exact `[[hooks]]` diff, writes only on the owner's explicit
  word (global file — `plans/143` rule since rev. 1), backs up, validates with `kimi doctor config`. Plugin (C) → `ideas/33` for 2.11.
  ≈ 2–3 h.
- [ ] **KA3 — Window stages before Kimi's compaction.** Anchor: criterion 38, owner decision №161. Kimi compacts at
  `min(0.85·W, W − 50 000)` checked before every step, counting each Cyrillic character as a token (§9) — KAIF's 85 % and 92 % stages never
  arrive. The hook reads `loop_control.compaction_trigger_ratio` / `reserved_context_size` from Kimi's config and places the stages below the
  trigger by the margin of decision D1. Delivery mid-turn: only `UserPromptSubmit` injects text and `PreToolUse` / `Stop` can block (§6) —
  the order goes through a one-time `PreToolUse` block (its reason is written back into the context) and `Stop`, never through
  `PostToolUse`. ≈ 1.5–2.5 h.
- [ ] **KA4 — `--alive` and `check` for Kimi.** Anchor: criterion 38. `--alive` today reads only `.claude/settings.json`
  (`context-window.mjs:397-401`) and always answers «nothing to judge» under Kimi (`researches/50` §12.6). Under Kimi it reads the
  `[[hooks]]` of `~/.kimi-code/config.toml` (and flags invalid matchers) plus the session record; `check` on a Kimi-only install reports Kimi
  wiring instead of Claude's. ≈ 1–1.5 h.
- [ ] **KA5 — Skills: listing, root, triggers.** Anchor: criterion 37. (a) Kimi shows the model only the first 250 characters of a
  `description` and the full `whenToUse` (§5, code `registry.ts:13, 271-278`) — the Kimi copy moves KAIF's trigger aliases into
  `whenToUse`. (b) Project skills are found only under the nearest `.git` ancestor (§4) — `install` / `check` say so when there is none.
  (c) Live: the `Skill` tool calls a KAIF skill with an argument and a `${KIMI_SKILL_DIR}` reference (doc says inline-only — §13.4).
  ≈ 1–2 h.
- [ ] **KA6 — Quota death leaves a handoff.** Anchor: criterion 39. The prior Kimi chat died on the 5-hour quota (429, not retried) with
  `[object Object]` and no farewell (§12.5). Wire `stop-farewell-capture.mjs` also on `StopFailure`: on a quota error it writes the farewell
  file and a `PARKED:` line naming the reason. ≈ 0.5–1 h.
- [ ] **KA7 — Owner conversation under Kimi.** Anchor: criterion 39. Interview with decisions D1–D3 (below), then the adapter and
  `framework/adapters/kimi-code.md` say what each chosen setting does. ≈ 0.5–1 h plus the owner's answers.
- [ ] **KA8 — Install findings (criterion 40, interview №050 Q1 = A).** Unchanged from rev. 1: one red case each for empty maps, two
  standard headings and the `sync` hint; fix; green; functional install in a fresh project. ≈ 1–1.5 h.
- [ ] **KA9 — Live acceptance, polygon, judge.** Anchor: «Готово, когда» of `plans/136`, criteria 18 and `plans/141` RL1. Fresh `git init`
  project from the built `dist`, Kimi-only install, wiring by the owner's word; `kimi -p` runs (auto permission — §11) after the quota
  window resets: `/skill:resume`, a skill with an argument and a reference, a voice call before a wait, recovery after `/compact`; run reports
  in `testcases/reports/`; full `npm run test:core` alone; `/fable-judge` on every KI claim; hand over to `plans/141`. ≈ 3–5 h.

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
