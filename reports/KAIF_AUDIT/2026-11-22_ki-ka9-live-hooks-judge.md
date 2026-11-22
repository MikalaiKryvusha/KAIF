# Judge — KA9 live hooks and bugs/145

**Verdict:** VERIFIED · **When:** 2026-11-22 10:58 +03:00 · **Judge:** Kimi K3.1 Pro.

| Claim | Observation |
|---|---|
| all five former silent hooks fire | live PostToolUse ×3 and PostToolUseFailure in VS Code; ACP PermissionRequest with an automatic approval and voice artifact |
| matcher fix is proven against the broken build | `bugs145-matcher-red`: `9263794` exactly five `*`; current tree zero; unknown key/event/timeout/regex each red |
| dispatcher remains healthy | `kimi-hook --selftest` all ok, including subfolder, stdin-cwd, origin fallback, opt-out and refusal |
| full system remains green | full `npm run test:core` output ends `sandbox suite: all 28 suites green` |
| documents and reports are valid | build/check-framework green; `kaif-testrun-lint`: 161 reports, 0 findings; `doc-header-lint`: 0 findings; `node --check` on the ACP probe passed |

Scope: bug 145, KA9 live evidence, the ACP probe and its report, STATUS/plans/research and the dispatcher's test-status comment.
No production behavior changed in this batch. The ACP probe was corrected to assert the actual wire names (`interaction.request` and
`permission.record_approval_result`); it was not weakened: it still requires both a real approval and the KAIF voice artifact.

REAL WORLD: accumulated — the owner's real Kimi config and state · data and machine — the actual VS Code session and fresh ACP projects ·
path — real tools, real failures and `session/set_mode=plan` → `session/prompt` → automatic `session/request_permission` response.

`TWINS: searched permission.approval.requested / permission.approval.resolved — the only wrong predicate was in ka9-acp-permission.mjs; no other sites.`
`Experience recall: EXP-0217 — a config is not a live hook; EXP-0221 — execute the Stop continuation in that same continuation.`
`Standing falsehood: none after the earlier predicate mismatch was corrected in the probe and its report.`

Caveat: bugs/149 remains outside this verdict. Commit this batch and continue the real 75/80/85 acceptance; no release publication.
