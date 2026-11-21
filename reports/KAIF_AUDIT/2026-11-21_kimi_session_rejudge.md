REFUTED

# Independent re-judge — Kimi session fixes, 2026-11-21

The two original findings are fixed, but the first re-judge found one adjacent explicit-identity case: a newer Kimi fallback overrode an explicitly selected older Claude session.

## Claims and observations

| Claim | Observation |
|---|---|
| Real filled maps pass; template and multiline guidance remain refused | Verified by the judge: `ka8-install-findings.mjs` and all three broken controls passed, including the origin's real maps. |
| s01/s04/s07 fixtures corrected without weakening the gate | Verified: all three independently exited 0; replacements fill multiline guidance rather than disabling checks. |
| No-id freshness orderings fail safely | Verified: Kimi-newer selects Kimi; Claude-newer and Kimi-only return ambiguous exit 2; `3b78552` control reproduced the defects. |
| Explicit Claude id remains valid | Refuted for explicit Claude older than Kimi; the first added fixture covered only Claude-newer. |
| bugs/148 route and stale status | Verified: route probe and broken control passed without sound; contour 247/247 is recorded and no longer described as running. |
| Final polygon | The supplied corrected-fixture log ends all 28 suites green; the judge did not rerun it by instruction. Selftest and check-framework independently passed. |
| Handoff boundaries | Positive live alive/Stop remains pending; bugs/149 remains an open release blocker; no release is claimed. |

## Finding and parent response

The judge's synthetic fixture with newer recorded Kimi and older explicitly selected Claude returned:

```text
KAIF hooks: running in this Kimi session (session_kimi_new) … (session by the newest Kimi session of the project).
explicit-older-Claude exit=0
```

`handKimiId` used the Kimi fallback even with `CLAUDE_CODE_SESSION_ID=claude_old`. Smallest fix: never call the Kimi fallback when an explicit Claude id exists; add explicit-older-Claude alive/measure assertions. The parent applied exactly that fix and extended `bugs147-kimi-alive-fallback.mjs`; the current probe passes both explicit-Claude freshness orders, and the `3b78552` control remains red on the cross-agent defects while both explicit-Claude controls stay valid.

A further complete polygon and a focused re-judge follow before any commit or push. No files were changed by the judge; no pages, sound or outward actions were produced.

## Final focused re-judge — VERIFIED WITH CAVEATS

The judge reran the current bugs/147 probe and its `3b78552` control and inspected the exact fix. Explicit older Claude now returns alive 0 for `claude_old`, says `session by session id`, and measures its own 10 tokens; no Kimi session is selected. Explicit newer Claude, both no-id freshness orders and Kimi-only remain correct. The supplied final polygon log after this fix ends `all 28 suites green`.

No remaining code finding. The caveat is solely the prescribed live acceptance in a new/reloaded Kimi session: bugs/142/145/146, positive bugs/147 verification and bugs/149 remain open. The judge edited nothing, produced no pages or sound, and did not commit or push.
