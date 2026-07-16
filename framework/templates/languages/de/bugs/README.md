# `bugs/` — Defekte, Schwierigkeiten, Brüche

Ein Dokument pro Defekt: Symptom, deterministische Reproduktion, Forensik, Grundursache / Hypothesen,
Fix-Historie, Status. Das eigene dauerhafte Bug-Backlog des Agenten — nichts geht verloren, und jeder Bug
kann von einer zukünftigen Sitzung kalt aufgenommen werden. Ein `NN_<name>.md` pro Bug.

**Für den Menschen (Eigentümer):** Sie können hier einen Bug in einfachen Worten anlegen (was falsch ist,
wie man es reproduziert); der Agent strukturiert ihn. Durchstöbern Sie dieses Verzeichnis, um bekannte
Defekte und ihren Status zu sehen.

**Für den KI-Agenten:** Wenn du bei der Arbeit/beim Testen auf einen Defekt stößt, lege ihn hier nach dem
Kanon an (Skill: `/report-bug`; Methode: `BUG_FIXING_FRAMEWORK.md`) — auch kleine. Solange offen, kein
`DONE`-Tag. Wenn behoben **und verifiziert**: `git mv NN_x.md NN_DONE_x.md` und einen Abschnitt
`## ✅ STATUS: DONE (Datum)` anhängen. Nach 3 fehlgeschlagenen blinden Fix-Versuchen: Stopp und Wechsel
zur Recherche (`/bug-research`).
