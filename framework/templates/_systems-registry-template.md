# Systems registry — <PROJECT_NAME>

> **How to use this file.** COPY it to the project root as `SYSTEMS_REGISTRY.md` — never fill this
> template in place — and fill the table from `GOAL.md`, `MASTER_PLAN.md`,
> `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` and `PROJECT_STRUCTURE_EXTERNAL_MAP.md`. The AGENT drafts
> the registry the moment the project needs its first delivery line — the owner is never asked what
> to measure (`AGENT_GUIDE.md` → the fable loop); the OWNER approves the list as vision when ready,
> and the vector prints from the draft meanwhile. The vector is printed by
> `node .kaif/kaif-core.mjs delivery` (`--json` · `--system <name>`) and opens every session close
> and loop report: `DELIVERY: systems N · complete A % (k of n) · integrated B % (c of d) · holes … ·
> contradictions … · bugs …`.

**Status:** draft — awaiting the owner's approval   <!-- the owner's word turns this into `approved <date>`; `delivery` prints `registry: draft` until then -->
**Drafted:** <date> · **Sources:** <GOAL.md §… · MASTER_PLAN.md §… · the maps>

## Rules of the cut

- **A system is one logically separate part of the product** — a health system, a trade system, a
  cave generator, a checkout flow, an import pipeline. Three marks of a system, all three required:
  it has its **own action or process**, its **own state** and its **own condition of success**.
- **Cut finer rather than coarser.** No target number of systems: a number would become the goal.
- **Completeness has four parts, each a checkbox** (☐ / ☑ — `[ ]` / `[x]` are read the same):
  **Specified** (the rule or requirement is written) · **Accepted** (the owner has read and accepted
  it) · **Implemented** (it exists in the product) · **Verified in use** (observed working on the
  real path without findings — `TESTING_FRAMEWORK.md`, gate 6). The percentage is ALWAYS printed
  with its fraction — `50 % (2 of 4)` — never a bare estimate. A project may rename its parts: the
  checkbox columns are data, the command reads them by header.
- **Needs (feeds from)** — the systems THIS one cannot work without, by name, comma-separated
  (quests need alchemy, alchemy needs ingredient generation). A need is a declaration of feeding,
  not a cross-reference. Integration = the share of declared needs closed by a system whose
  **Implemented** box is ticked. A system with no needs is `isolated` in `--json` — a diagnostic,
  not a seventh number.
- **Three classes of findings** live in `bugs/` as the header line `**Kind:** hole | contradiction
  | bug` (`/report-bug`): a **hole** — the rules are SILENT where an answer is needed; a
  **contradiction** — two places answer DIFFERENTLY; a **bug** — the code, table or calculation
  diverges from the written rule. A document without the line counts as a bug. Open = no `DONE`
  tag in the filename; `bugs/KAIF/` (framework tickets) is never counted.

## Registry

| # | System | Own action | Own state | Needs (feeds from) | Specified | Accepted | Implemented | Verified in use | Lives in |
|---|---|---|---|---|---|---|---|---|---|
| 1 | <System name> | <what it does — one verb phrase> | <what it keeps — one noun phrase> | <other systems by name, or —> | ☐ | ☐ | ☐ | ☐ | <module / doc / directory> |

## Boundary notes

<One line per boundary the owner could dispute — why this is one system and not two, or two and
not one: the argument the owner approves or corrects. Provenance marks (`[AI]…[/AI]`) apply if the
project keeps them on canon.>

## History (append-only)

- <date> — drafted by the agent from <sources>; awaiting the owner's approval.
