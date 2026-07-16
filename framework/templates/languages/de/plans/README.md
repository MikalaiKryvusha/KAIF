# `plans/` — detaillierte Schritt-für-Schritt-Pläne

Detaillierte Pläne für einzelne Arbeitsstücke: einzelne Schritte des Masterplans, Features, Ideen, Bugs,
Recherchen, Prozeduren. Der **`MASTER_PLAN.md`** (Projektwurzel) ist die hochrangige Roadmap; `plans/`
enthält die herangezoomten Pläne, die ihre Schritte umsetzen. Ein `NN_<name>.md` pro Plan.

**Für den Menschen (Eigentümer):** Sie müssen hier nicht schreiben — Pläne stammen meist vom Agenten. Sie
können einen Plan ablegen, wenn Sie steuern wollen, *wie* etwas getan wird. Lesen Sie sie, um den
beabsichtigten Ansatz des Agenten vor der Ausführung zu sehen.

**Für den KI-Agenten:** Schreibe vor nicht-trivialer Arbeit hier einen kurzen Plan und folge ihm.
Nummeriere die Dateien (`NN_<name>.md`). Ein abgeschlossener, verifizierter Plan bekommt das `DONE`-Tag im
Dateinamen (`git mv NN_x.md NN_DONE_x.md`) plus einen Statusabschnitt. Referenzmaterial (keine schließbare
Aufgabe) wird nicht mit DONE markiert.
