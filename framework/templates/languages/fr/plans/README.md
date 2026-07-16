# `plans/` — plans détaillés pas à pas

Plans détaillés de morceaux de travail précis : étapes individuelles du plan directeur, fonctionnalités,
idées, bugs, recherches, procédures. Le **`MASTER_PLAN.md`** (racine du projet) est la feuille de route de
haut niveau ; `plans/` contient les plans rapprochés qui implémentent ses étapes. Un `NN_<nom>.md` par plan.

**Pour l'humain (propriétaire) :** vous n'êtes pas obligé d'écrire ici — les plans sont en général ceux de
l'agent. Vous pouvez déposer un plan si vous voulez orienter *comment* quelque chose est fait. Lisez-les
pour voir l'approche prévue par l'agent avant qu'il l'exécute.

**Pour l'agent IA :** avant tout travail non trivial, écrivez ici un plan court et suivez-le. Numérotez les
fichiers (`NN_<nom>.md`). Un plan terminé et vérifié reçoit l'étiquette `DONE` dans son nom
(`git mv NN_x.md NN_DONE_x.md`) plus une section de statut. Le matériel de référence (pas une tâche
fermable) n'est pas étiqueté DONE.
