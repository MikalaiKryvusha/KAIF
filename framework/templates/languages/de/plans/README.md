# `plans/` — detaillierte Schritt-für-Schritt-Pläne

Detaillierte Pläne für einzelne Arbeitsstücke: einzelne Schritte des Masterplans, Features, Ideen, Bugs,
Recherchen, Prozeduren. Der **`MASTER_PLAN.md`** (Projektwurzel) ist die hochrangige Roadmap; `plans/`
enthält die herangezoomten Pläne, die ihre Schritte umsetzen. Ein `NN_<name>.md` pro Plan.

**Für den Menschen (Eigentümer):** Sie müssen hier nicht schreiben — Pläne stammen meist vom Agenten. Sie
können einen Plan ablegen, wenn Sie steuern wollen, *wie* etwas getan wird. Lesen Sie sie, um den
beabsichtigten Ansatz des Agenten vor der Ausführung zu sehen.

**Für den KI-Agenten:** Schreibe vor nicht-trivialer Arbeit hier einen kurzen Plan und folge ihm.
Jeder Plan BEGINNT mit seinem Zielvektor + Abnahmekriterien — geschrieben nach
`REQUIREMENTS_FRAMEWORK.md`; sie dürfen sich ändern, wenn die Arbeit dazulernt. Direkt nach der H1
folgt die lintbare Kopf-Meta — **Erstellt:** · **Eltern:** · **Status:** (mit Meilensteinen) ·
**Nach außen:** (`AGENT_GUIDE.md` → Document header meta). Nummeriere die
Dateien (`NN_<name>.md`). Ein abgeschlossener, verifizierter Plan bekommt das `DONE`-Tag im
Dateinamen (`git mv NN_x.md NN_DONE_x.md`) plus einen Statusabschnitt. Referenzmaterial (keine schließbare
Aufgabe) wird nicht mit DONE markiert.

**Benennung — ein Epic ist im Backlog schon am Dateinamen erkennbar.** Schwere, zusammengesetzte,
lange Arbeit wird als **Epic** geplant (`/plan-epic`), und seine Datei trägt die Markierung:
**`NN_EPIC_<name>.md`**. Die Epic-Datei enthält die phasenweise Architektur der Roadmap — *und
keinerlei operative Detaillierung*. Das Detail lebt in ihren **Kindern**: ein operativer Plan pro
Phase (R&D, Testen, Implementierung, Abnahme), und jedes Kind nennt seinen Elternteil im eigenen
Dateinamen — **`NN_epicMM_<phase>_<name>.md`**, wobei `MM` die Nummer des Eltern-Epics ist. Nur die
nächste Phase wird detailliert; der Plan für Phase N+1 wird beim Schließen von Phase N geschrieben.
Arbeit, die nie ein Epic brauchte, bleibt ein **eigenständiger** Plan: `NN_<name>.md`. Die
Konvention gilt nur nach vorn — benenne ältere Pläne nicht um, ihre Nummern sind bereits über die
gesamte Historie zitiert.
