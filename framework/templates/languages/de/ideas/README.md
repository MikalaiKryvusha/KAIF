# `ideas/` — Feature- und Verbesserungsvorschläge

Detaillierte Ideen, *was* gebaut werden soll — meist ein schmaler Ausschnitt des Projekts, gut genug
beschrieben, damit der Agent daraus implementieren kann. Meist vom **Menschen** verfasst, aber auch der
Agent schlägt Ideen vor. Ein `NN_<name>.md` pro Idee.

**Für den Menschen (Eigentümer):** Dies ist Ihr Haupt-Autorenverzeichnis. Legen Sie hier eine Idee ab, die
beschreibt, was Sie wollen; der Agent bringt sie in eine saubere, strukturierte Form und implementiert
daraus. Eine Idee ist ein Stück Produkt-**Vision** — der Agent implementiert sie erst nach Ihrer Freigabe.

**Für den KI-Agenten:** Lies die Ideen des Eigentümers, korrigiere Tippfehler, strukturiere minimal für
Klarheit um, dann implementiere. Wenn *du* eine lohnende Idee hast, lege sie hier mit dem Status
„❓ wartet auf Freigabe des Eigentümers" ab (Skill: `/propose-idea`) und implementiere sie **nicht** vor der
Freigabe. Nach der Umsetzung einer Idee schreibe Status und Datum in ihre Datei zurück und markiere sie
mit `DONE` (`git mv NN_x.md NN_DONE_x.md`).
