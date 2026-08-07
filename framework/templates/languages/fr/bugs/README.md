# `bugs/` — défauts, difficultés, casses

Un document par défaut : symptôme, reproduction déterministe, forensique, cause racine / hypothèses,
historique de correction, statut. Le backlog durable de bugs de l'agent lui-même — rien ne se perd, et
n'importe quel bug peut être repris à froid par une session future. Un `NN_<nom>.md` par bug.

**Pour l'humain (propriétaire) :** vous pouvez déposer un bug ici en mots simples (ce qui ne va pas,
comment le reproduire) ; l'agent le structurera. Parcourez ce répertoire pour voir les défauts connus et
leur statut.

**Pour l'agent IA :** quand vous heurtez un défaut pendant le travail/les tests, déposez-le ici selon le
canon (compétence : `/report-bug` ; méthode : `BUG_FIXING_FRAMEWORK.md`) — même les petits. Tant qu'il est
ouvert, pas d'étiquette `DONE`. Une fois corrigé **et vérifié**, `git mv NN_x.md NN_DONE_x.md` et ajoutez
une section `## ✅ STATUS: DONE (date)`. Après 3 tentatives aveugles de correction échouées, arrêtez et
passez à la recherche (`/bug-research`).

**Le sous-répertoire `bugs/KAIF/`** — défauts et demandes d'amélioration concernant le
**framework KAIF lui-même**, pas ce projet. Quand un échec remonte à une lacune de KAIF (une
règle trompeuse, un guardrail manquant, une machinerie cassée), déposez le document là selon le
même canon des bugs — **strictement en anglais** (ces documents s'adressent au développeur de
KAIF). Dédupliquez avant de créer : cherchez d'abord dans `bugs/KAIF/` ; les déploiements liés
à l'origin cherchent aussi dans le tracker d'issues de l'origin et envoient les signaux
confirmés en amont, les déploiements détachés gardent tout en local.
