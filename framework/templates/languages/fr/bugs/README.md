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
