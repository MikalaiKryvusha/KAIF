# KAIF in <PROJECT_NAME> — das Framework, deployt

> **Was dieses Dokument ist.** Eine hochrangige Beschreibung des **KAIF-Frameworks, wie es in diesem
> Projekt deployt und genutzt wird** — denken Sie an die „Technologien & Frameworks"-Seite des Projekts,
> auf der KAIF nun eine der Technologien ist. Es wird vom Agenten **nach einer erfolgreichen
> KAIF-Injektion** geschrieben (der selbstextrahierende Kern wird entfernt, sobald dieses Dokument
> existiert — siehe KAIF-Lebenszyklus). Von da an ist die Arbeit in diesem Projekt *durch* KAIF
> organisiert, und diese Datei ist die menschenlesbare Zusammenfassung davon.
>
> Geschrieben in der Arbeitssprache des Eigentümers. **Lebende Referenz — nie mit `DONE` markiert.**
> Halten Sie die Versionszeile aktuell.

---

## Was KAIF ist

KAIF (Krinik AI Framework) ist ein **kontextverlust-resistentes, autonomie-diszipliniertes
Betriebsframework für das Mensch–KI-Tandem**. Es externalisiert das Arbeitsgedächtnis und die Disziplin
des Agenten in dieses Repository — ein kleines Set aus Markdown-Dokumenten, Verzeichniskonventionen und
wiederholbaren Slash-Skills — sodass jede frische Agentensitzung mit vollem Kontext weitermacht, autonom
in klaren Grenzen arbeitet und Wissen ansammelt, statt es zu verlieren. Es ist kein Code; es ist
*Prozess, festgehalten als Dateien, die ein Agent liest*.

## Warum es hier ist — was es diesem Projekt gibt

- **Keine Kaltstarts.** Eine neue Sitzung liest `AGENT_GUIDE.md` + `STATUS.md` und ist sofort produktiv.
- **Wissen, das überlebt.** Bugs, Entscheidungen, Recherchen und Ideen werden dauerhafte Dokumente, kein verlorener Chat.
- **Begrenzte Autonomie.** Der Agent arbeitet das Backlog allein ab und eskaliert nur Eigentümer-Entscheidungen.
- **Eine gemeinsame Methode.** Mensch = Visionär (`GOAL.md`), Agent = Ausführender; KAIF ist die Schnittstelle dazwischen.

## Wie es hier funktioniert — die beweglichen Teile

| Teil | Rolle in diesem Projekt |
|------|-------------------------|
| `AGENT_GUIDE.md` | Der Kanon, den der Agent vor jeder Aufgabe liest. |
| `PHILOSOPHY.md` | Wie der Agent denkt (KISS + Ockham + das erweiterte Prinzipienset). |
| `BUG_FIXING_FRAMEWORK.md` | Wie der Agent debuggt. |
| `GOAL.md` / `MASTER_PLAN.md` | Die Vision und der phasenweise Weg dorthin. |
| `STATUS.md` | Der lebende Zustand — nach jeder bedeutenden Aufgabe aktualisiert. |
| `PROJECT_STRUCTURE_EXTERNAL_MAP.md` / `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` | Die externe und interne Karte. |
| `plans/ ideas/ bugs/ researches/ interviews/ homeworks/` | Die Wissensverzeichnisse (jedes mit eigenem README). |
| `.claude/skills/` (oder das Äquivalent Ihres Agentensystems) | Die wiederholbaren Rituale (`/resume`, `/pause`, Loops, …). |
| `.kaif/kaif.json` | Der Deploy-Marker: Version, Sphäre, Agent, Tracking. |

## Deployment-Protokoll

| Feld | Wert |
|------|------|
| **KAIF-Version** | `<X.Y>` |
| **Injiziert am** | `<JJJJ-MM-TT>` |
| **Wie die Injektion lief** | `<ein bis zwei Zeilen: schnelles mechanisches Entpacken oder respektvoller Stufenfluss; alles Bemerkenswerte>` |
| **Sphäre** | `<programming / science / design / business / …>` |
| **Agentensysteme** | `<claude-code / codex / grok-build / cline / zoo-code / …>` |
| **Arbeitssprache** | `<die Sprache des Eigentümers>` |
| **Tracking** | `<origin / fork>` — `<URL des Origin-Repos>` |

## Leben mit KAIF (Lebenszyklus)

`/kaif-version` (nach Updates schauen) · `/kaif-update` (respektvolle Migration vom Origin) ·
`/kaif-fork` (das eigene weiterentwickeln) · `/kaif-switch-origin` · `/kaif-remove` (teilweise behält
Ihre Artefakte, oder vollständig — immer respektvoll). Gestützt auf die npm-Handles `kaif:*`.

<!-- KAIF:AUTHOR-NOTE:BEGIN — this whole region is stripped mechanically on anonymous installs -->
---

## Eine Notiz des Autors

> KAIF wurde aus Notwendigkeit erdacht und gebaut von **Krinik (Mikalai Kryvusha / Николай Кривуша)**
> während Vibe-Coding-Sessions mit Claude an einem Softwareprodukt, Ende eines heißen Juni 2026, in Minsk.
> **KAIFs Geburtstag ist der 30. Juni 2026.**

*(Originaltext, Russisch — kanonisch:)*

> KAIF был придуман и разработан как вынужденная необходимость (Николай Кривуша) Криником при совместной
> работе в режиме вайбкодинга с Claude над программным продуктом в конце жаркого июня 2026 года, в
> г. Минск. Дата рождения KAIF — 30 июня 2026 г.
<!-- KAIF:AUTHOR-NOTE:END -->