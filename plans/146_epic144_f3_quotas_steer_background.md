# Plan 146 — Epic 144 F3: quotas, hardened automatic steer, VS Code background and VSIX

> **Создан:** 2026-11-23 12:02 +03:00.
> **Родитель:** `plans/144` F3; F2 verdict `reports/KAIF_AUDIT/2026-11-23_epic144-f2-repeat-judge.md`; `researches/51` §9–12; `bugs/151`; owner decisions №169–173.
> **Статус:** VERIFIED WITH CAVEATS 2026-11-23 12:46 +03:00 — implementation, VSIX and isolated startup green; F3 changesets owner-confirmed; F2 changeset pending; live visual and race acceptance remain F4. Report `testcases/reports/2026-11-23_epic144-f3-quotas-steer-background.md`. Release target **1.0.0** approved by owner 2026-11-23 13:47 +03:00 (decision №175); Glass route verified by real launch.
> **Вовне:** public fork changesets and later VSIX Release require owner-confirmed text and completed F3/F4 gates; no Marketplace or upstream PR.

## Goal vector

**Achieve + Maintain + Avoid.** Ship a separately identifiable local VSIX on the fresh official 2.7.2 engine that shows managed 5h plus 7d/monthly quotas, sends every running-turn follow-up through native steer without losing text/media or duplicating a turn, and matches the VS Code sidebar background. Preserve manual compaction while automatic compaction stays disabled; never reintroduce click-to-compact or a queue for new running-turn follow-ups.

## Acceptance criteria

1. **Package identity and self-containment.** `name=kimi-code-kaif`, `publisher=mikalai-kryvusha`, `displayName=Kimi Code (KAIF fork)`; official `moonshot-ai/kimi-code` is not overwritten. The win32-x64 VSIX passes `vsix-verify`, contains no bare `uuid` import and starts in an isolated Extension Host.
2. **Managed quotas.** With a managed Kimi provider, the composer displays concentric 5h and 7d/monthly indicators with percentages and reset countdowns. Missing windows and fetch failures render grey/unavailable, never invented zero. Pure mapping and state tests cover weekly, monthly code, monthly total, loading and error.
3. **Automatic steer.** Ordinary Enter while `isStreaming` calls existing `SteerChat` with the original string or `ContentPart[]`; queue stays empty and multiple calls preserve order. Idle send is unchanged.
4. **Turn-ended race.** If steer returns `ok:false`, the same content goes through a dedicated idle-send path exactly once, without recursive automatic steer. Text and media are not dropped and no error toast is shown for the normal race.
5. **Actual steer failure.** A rejected steer shows the error and restores both text and ready media to the composer; accepted steer clears draft media only after host acknowledgement.
6. **Theme.** Body/root use `var(--vscode-sideBar-background, var(--vscode-editor-background))`; card/popover/input colors remain distinct. Computed empty background equals the sidebar (ΔRGB=0) in the dark Extension Host and the screenshot is offered for owner acceptance.
7. **Verification and provenance.** New tests fail on the named pre-change behavior, then pass; VS Code typecheck, affected Vitest files, VSIX package/verify and isolated Extension Host smoke pass. Reference provenance is pinned to `gxgleo67/kimi-code-vscode-fork@4298cb7f0cbe25afc147bd7b2aaca8ae39b71390` (Apache-2.0); upstream `AGENTS.md` rules and `pnpm lint` outcomes are reported honestly.
8. **Changesets.** Owner-confirmed English entries exist for the F2 engine change and the F3 user-facing extension changes; no commit contains unconfirmed changeset text.
9. **Attention notifications (owner decision №174).** New approval, question and error events produce a short Web Audio signal and speechSynthesis message; identical messages are throttled for 5 seconds and session replay emits none. Notification failure never breaks chat.

## Operational steps

- [x] **F3.0 — Recon and baselines.** Read upstream/root rules, official SDK auth surface, `chat.store`, `SteerChat`, CSS and reference implementation. Preserve the fresh engine; exclude multi-account/custom providers and the reference ContextRing click-to-compact.
- [x] **F3.1 — Bare dependency.** Add `uuid` to the existing `alwaysBundle` list. Red was the official verifier failure; green is `node apps/vscode/scripts/vsix-package.mjs win32-x64` (27 files, package/static checks passed).
- [~] **F3.2 — Separate identity and changesets.** Owner decision №173 applied; 0.9.1 manifest and changelog updated; four F3 changesets owner-confirmed. F2 engine changeset still awaits owner confirmation.
- [x] **F3.3 — Managed usage host and shared model.** `GetManagedUsage` added to the existing bridge validator, webview client and auth handler using `ctx.harness.auth.getManagedUsage`. Pure mapping helpers and tests ported from the pinned Apache-2.0 reference; no SDK or dependency changes.
- [x] **F3.4 — Quota UI.** Concentric status component added to the composer without the reference compact button. Loading, weekly/monthly selection, reset formatting and error/unavailable states covered.
- [x] **F3.5 — Hardened steer.** Running `sendMessage` uses `steerNow`; dedicated `sendIdle` handles `ok:false` exactly once; rejection restores input; accepted ack clears only ready media IDs. Accepted, idle, race, rejected, media, ordering and recursion tests green.
- [x] **F3.6 — Dark background.** Body/root use the VS Code sidebar variable with editor fallback; card/popover/input remain distinct. Static style assertion green; live computed RGB and owner screenshot remain F4.
- [x] **F3.7 — Build and isolated acceptance.** Affected tests and typecheck green; VSIX package/verify green; isolated VS Code 1.123.0 starts the extension with 10 commands and an open webview. Seven-field report recorded; live managed UI and race evidence remain F4.
- [ ] **F3.7б — Attention notifications (owner decision №174).** Add Web Audio + speechSynthesis for new approvals, questions and errors; throttle identical messages for 5 seconds, suppress replay and fail open. Cover direct sound calls and chat/replay paths, then rebuild VSIX.
- [ ] **F3.8 — Hand over F4.** Keep `bugs/150–151` open until live F4. Update `plans/144`, `STATUS.md` and the bug evidence. Public README/Release waits for the styleguide/portrait workflow and live owner acceptance; Marketplace and upstream PR remain unauthorized.

## Verification matrix

| Surface | Red before fix | Green evidence |
|---|---|---|
| Bare `uuid` | Official VSIX verifier: `Bare runtime dependency "uuid" remains` | Real win32-x64 package + `verifyVsix` |
| Quota mapping/UI | No `GetManagedUsage` or component in official extension | Pure unit tests + managed UI state render |
| Accepted automatic steer | Running Enter enqueues | `SteerChat` receives original content, queue=0 |
| Turn-ended race | `ok:false` can queue or lose media | Exactly one dedicated idle `streamChat`, same content, no toast |
| Rejected steer | Reference toast loses composer and media | Text + ready media restored, visible error, zero idle-send |
| Theme | Fixed dark oklch differs from sidebar | Computed body RGB equals sidebar RGB, distinct surfaces |
| Isolated VSIX | No standalone acceptance yet | Extension starts outside checkout, logs and UI read |

## Risks and boundaries

- `SteerChat` currently exposes only `{ok:boolean}`; do not invent structured error codes. Treat resolved `ok:false` as turn-ended, rejected Promise as actual failure.
- The composer clears text in React while media lives in the store. Rollback must mark an explicit restoration state so an ordinary in-flight `pendingInput` is not restored immediately.
- `pendingInput` is also retry state; do not clobber it during accepted steer. Clear it only through the explicit restoration path.
- Existing queued items are not migrated or reordered; the no-queue rule applies to new running-turn follow-ups.
- Official extension and live profile remain untouched until the isolated VSIX and rollback path are proven. F4 performs the owner-profile installation and visual acceptance.

## Decisions made without the owner

- `[ИИ]` Reuse the official bridge and SDK auth methods instead of copying reference multi-account infrastructure; this is the smallest path to the owner-requested quota windows and follows `researches/51`.
- `[ИИ]` Keep the current English extension UI strings, matching the official extension; EN/RU work belongs to public README/release documentation, not a new i18n subsystem.
- `[ИИ]` Interpret resolved `ok:false` as the normal turn-ended race and rejected Promise as actual failure, because this is the entire outcome surface exposed by the official handler.
