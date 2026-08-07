# `homeworks/` — tâches de l'agent pour l'humain

Tâches que l'agent demande à l'**humain** — ce qu'il ne peut pas faire lui-même du fait de sa nature
numérique et sans corps : tester sur du vrai matériel, agir dans le monde physique, utiliser un
compte/identifiant que seul l'humain possède, faire un achat, observer quelque chose hors ligne. Chaque
document décrit la tâche avec des étapes concrètes pour l'humain, et recueille en retour ses observations
et résultats. Un `NN_<nom>.md` chacune.

**Pour l'humain (propriétaire) :** quand l'agent dépose un homework, il a besoin d'un coup de main dans le
monde physique/hors ligne. Suivez les étapes et écrivez ce que vous avez observé dans le document —
l'agent lit vos notes et continue.

**Pour l'agent IA :** quand vous êtes bloqué sur quelque chose que seul un humain-avec-un-corps peut faire,
ne calez pas — écrivez ici un homework avec des étapes claires, minimales et numérotées et une place pour
les résultats de l'humain, puis continuez avec un autre travail. Juste après le H1 vient l'en-tête
méta lintable — **Créé :** · **Parent :** · **Statut :** · **Vers l'extérieur :**
(`AGENT_GUIDE.md` → Document header meta). Quand l'humain rapporte, intégrez les
résultats et étiquetez le fichier `DONE` (`git mv NN_x.md NN_DONE_x.md`).

**Homework de la classe « goût »** (le critère d'acceptation est un adjectif de perception —
`AGENT_GUIDE.md` → "The taste class") : l'agent remet à l'humain un ARTEFACT à percevoir, jamais un lien
ni un benchmark étranger ; tous les candidats sur UN MÊME matériau, étiquettes à l'aveugle, la clé à
côté. Deux champs permanents dans chaque document de ce type : **« Prêt à voir/écouter tout de suite »**
(chemins vers les artefacts) et **« Verdicts déjà rendus »** (les décisions du propriétaire, consignées
mot pour mot — un verdict est canon et n'est jamais demandé deux fois).
