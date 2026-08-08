# `plans/` — plans détaillés pas à pas

Plans détaillés de morceaux de travail précis : étapes individuelles du plan directeur, fonctionnalités,
idées, bugs, recherches, procédures. Le **`MASTER_PLAN.md`** (racine du projet) est la feuille de route de
haut niveau ; `plans/` contient les plans rapprochés qui implémentent ses étapes. Un `NN_<nom>.md` par plan.

**Pour l'humain (propriétaire) :** vous n'êtes pas obligé d'écrire ici — les plans sont en général ceux de
l'agent. Vous pouvez déposer un plan si vous voulez orienter *comment* quelque chose est fait. Lisez-les
pour voir l'approche prévue par l'agent avant qu'il l'exécute.

**Pour l'agent IA :** avant tout travail non trivial, écrivez ici un plan court et suivez-le. Tout plan
S'OUVRE sur son vecteur d'objectif + ses critères d'acceptation — écrits selon
`REQUIREMENTS_FRAMEWORK.md` ; ils peuvent changer à mesure que le travail apprend. Juste après le
H1 vient l'en-tête méta lintable — **Créé :** · **Parent :** · **Statut :** (avec jalons) ·
**Vers l'extérieur :** (`AGENT_GUIDE.md` → Document header meta). Numérotez les
fichiers (`NN_<nom>.md`). Un plan terminé et vérifié reçoit l'étiquette `DONE` dans son nom
(`git mv NN_x.md NN_DONE_x.md`) plus une section de statut. Le matériel de référence (pas une tâche
fermable) n'est pas étiqueté DONE.

**Nommage — un épique se voit dans le backlog rien qu'au nom de fichier.** Le travail lourd,
composite et long est planifié comme un **épique** (`/plan-epic`), et son fichier porte la marque :
**`NN_EPIC_<nom>.md`**. Le fichier de l'épique contient l'architecture par phases de la feuille de
route — *et aucun détail opérationnel*. Le détail vit chez ses **enfants** : un plan opérationnel
par phase (R&D, tests, implémentation, recette), et chaque enfant nomme son parent dans son propre
nom de fichier — **`NN_epicMM_<phase>_<nom>.md`**, où `MM` est le numéro de l'épique parent. Seule
la phase la plus proche est détaillée ; le plan de la phase N+1 s'écrit à la clôture de la phase N.
Un travail qui n'a jamais eu besoin d'épique reste un plan **autonome** : `NN_<nom>.md`. La
convention vaut vers l'avant — ne renommez pas les anciens plans : leurs numéros sont déjà cités
dans toute l'historique.
