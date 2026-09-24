# House rules — <PROJECT NAME>

> **How to use this file.** COPY it to the project root on first use —
> `cp .kaif/_house-rules-template.md HOUSE_RULES.md` — then fill the copy and delete the sections
> this project does not need; never fill this template in place. The owner reads this file, so the
> copy is written in the project's working language (`.kaif/kaif.json` → `language`), headings
> included. First use is whichever comes first: the owner gives a standing working rule
> (`/fix-vision` step 3) · the agent records a route, a recipe or a convention it will need again ·
> a re-read core document crosses its size budget and a project-subject section has to move out.
>
> **What belongs here.** Tier 4 of the document taxonomy (`AGENT_GUIDE.md`): local law that governs
> this project and travels nowhere. `AGENT_GUIDE.md` answers HOW the agent works (the KAIF method);
> this file answers WITH WHAT it works here — the owner's standing rules, the systems, stands,
> devices, routes, tools and product facts of THIS project. It is outside the nine re-read core
> documents and has no size budget; `/resume` reads it at session entry, and the context router
> sends a task on a surface the project already touched here first.

**Created:** <date> · **Owner:** <name> · **Moved here from the guide:** <section → date, or "nothing yet">

## 1. The owner's standing rules

Each rule is a strict rule in the agent's wording — imperative, numbered, its exceptions named — with
ONE provenance line. The owner's verbatim words stay at their source (the commit that recorded them
verbatim first, the interview, the decisions log); a block of raw chat messages here is a defect
(`AGENT_GUIDE.md` → "The rulebook takes the rule, not the quote").

### R1. <rule title — what to do, as a command>

1. <step, imperative>
2. <step, imperative>
- **Exception:** <when the rule does not apply — or none>

[OWNER] <date and time> · <where the verbatim lives: commit <hash> · interview #NNN, QN · decision #NN>

## 2. External systems and access

| System | What the agent does there | Entry point (URL, CLI, API) | Where the credentials live |
|---|---|---|---|
| <tracker / stage / prod / analytics> | <read · write · deploy> | <address> | <secret store or env var — NEVER the secret itself> |

## 3. Stands, environments and devices

| Stand / device | What it is for | How the agent reaches it | Known traps (with the lesson id) |
|---|---|---|---|
| <stage · prod · emulator · phone> | <purpose> | <command> | <EXP-NNNN or "none known"> |

## 4. Routes, recipes and conventions — the index of own work

Where the project's accumulated work lives: step files, device routes, recorded recipes, style
measurements of the project's own texts. A task on a surface listed here starts by opening the entry
and citing it (`AGENT_GUIDE.md` → checklist step 2).

| Surface | Where the work lives | What it covers |
|---|---|---|
| <feature / screen / procedure> | <path> | <one line> |

## 5. Tools of this project

| Command | What it does | What it guards |
|---|---|---|
| `<command>` | <one line> | <the defect class it catches, or "—"> |

## 6. Product knowledge

<Domain facts the agent needs and must not re-derive: the glossary, the entities and their roles, the
numbers that must not change. A fact the owner owns carries the owner's provenance line, like a rule.>
