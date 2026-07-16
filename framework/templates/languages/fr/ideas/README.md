# `ideas/` — propositions de fonctionnalités et d'améliorations

Idées détaillées de *quoi* construire — en général une tranche étroite du projet, décrite assez bien pour
que l'agent puisse l'implémenter. Le plus souvent écrites par l'**humain**, mais l'agent propose aussi des
idées. Un `NN_<nom>.md` par idée.

**Pour l'humain (propriétaire) :** c'est votre principal répertoire d'écriture. Déposez-y une idée
décrivant ce que vous voulez ; l'agent la mettra au propre dans une forme structurée et l'implémentera.
Une idée est un morceau de la **vision** du produit — l'agent ne l'implémente qu'après votre approbation.

**Pour l'agent IA :** lisez les idées du propriétaire, corrigez les coquilles, restructurez au minimum pour
la clarté, puis implémentez. Quand *vous* avez une idée qui en vaut la peine, déposez-la ici avec le statut
« ❓ en attente de l'approbation du propriétaire » (compétence : `/propose-idea`) et ne l'implémentez
**pas** avant approbation. Après avoir implémenté une idée, inscrivez le statut et la date dans son fichier
et étiquetez-le `DONE` (`git mv NN_x.md NN_DONE_x.md`).
