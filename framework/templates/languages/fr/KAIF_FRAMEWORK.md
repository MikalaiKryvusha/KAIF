# KAIF dans <PROJECT_NAME> — le framework, déployé

> **Ce qu'est ce document.** Une description de haut niveau du **framework KAIF tel que déployé et utilisé
> dans ce projet** — voyez-le comme la page « technologies et frameworks » du projet, sur laquelle KAIF est
> désormais l'une des technologies. Il est écrit par l'agent **après une injection réussie de KAIF** (le
> noyau auto-extractible est supprimé dès que ce document existe — voir le cycle de vie de KAIF). À partir
> de là, le travail dans ce projet s'organise *à travers* KAIF, et ce fichier en est le résumé pour les
> humains.
>
> Rédigé dans la langue de travail du propriétaire. **Référence vivante — jamais marquée `DONE`.** Gardez
> la ligne de version à jour.

---

## Ce qu'est KAIF

KAIF (Krinik AI Framework) est un **framework opérationnel résistant à la perte de contexte et à
l'autonomie disciplinée pour le tandem humain–IA**. Il externalise la mémoire de travail et la discipline
de l'agent dans ce dépôt — un petit ensemble de documents markdown, de conventions de répertoires et de
compétences slash répétables — de sorte que toute nouvelle session de l'agent reprend avec un contexte
complet, travaille de façon autonome dans des limites claires et accumule la connaissance au lieu de la
perdre. Ce n'est pas du code ; c'est *un processus capturé sous forme de fichiers qu'un agent lit*.

## Pourquoi il est là — ce qu'il apporte à ce projet

- **Pas de démarrage à froid.** Une nouvelle session lit `AGENT_GUIDE.md` + `STATUS.md` et est productive immédiatement.
- **Une connaissance qui survit.** Bugs, décisions, recherches et idées deviennent des documents durables, pas du chat perdu.
- **Une autonomie bornée.** L'agent abat le backlog seul et n'escalade que les décisions du propriétaire.
- **Une méthode partagée.** Humain = visionnaire (`GOAL.md`), agent = exécutant ; KAIF est l'interface entre les deux.

## Comment ça marche ici — les pièces mobiles

| Pièce | Rôle dans ce projet |
|-------|---------------------|
| `AGENT_GUIDE.md` | Le canon que l'agent lit avant chaque tâche. |
| `PHILOSOPHY.md` | Comment l'agent pense (KISS + Occam + l'ensemble élargi de principes). |
| `BUG_FIXING_FRAMEWORK.md` | Comment l'agent débogue. |
| `GOAL.md` / `MASTER_PLAN.md` | La vision, et le chemin par phases vers elle. |
| `STATUS.md` | L'état vivant — mis à jour après chaque tâche significative. |
| `PROJECT_STRUCTURE_EXTERNAL_MAP.md` / `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` | Les cartes externe et interne. |
| `plans/ ideas/ bugs/ researches/ interviews/ homeworks/` | Les répertoires de connaissance (chacun avec son README). |
| `.claude/skills/` (ou l'équivalent de votre système d'agent) | Les rituels répétables (`/resume`, `/pause`, boucles, …). |
| `.kaif/kaif.json` | Le marqueur de déploiement : version, sphère, agent, tracking. |

## Journal de déploiement

| Champ | Valeur |
|-------|--------|
| **Version de KAIF** | `<X.Y>` |
| **Injecté le** | `<AAAA-MM-JJ>` |
| **Comment s'est passée l'injection** | `<une ou deux lignes : dépaquetage mécanique rapide, ou flux respectueux par étapes ; tout élément notable>` |
| **Sphère** | `<programming / science / design / business / …>` |
| **Systèmes d'agent** | `<claude-code / codex / grok-build / cline / zoo-code / …>` |
| **Langue de travail** | `<la langue du propriétaire>` |
| **Tracking** | `<origin / fork>` — `<URL du dépôt origin>` |

## Vivre avec KAIF (cycle de vie)

`/kaif-version` (vérifier les mises à jour) · `/kaif-update` (migration respectueuse depuis l'origin) ·
`/kaif-fork` (faire évoluer le vôtre) · `/kaif-switch-origin` · `/kaif-remove` (le partiel garde vos
artefacts, ou complet — toujours respectueux). Appuyé par les handles npm `kaif:*`.

<!-- KAIF:AUTHOR-NOTE:BEGIN — this whole region is stripped mechanically on anonymous installs -->
---

## Une note de l'auteur

> KAIF a été conçu et construit par nécessité par **Krinik (Mikalai Kryvusha / Николай Кривуша)** lors de
> sessions de vibe-coding avec Claude sur un produit logiciel, à la fin d'un chaud mois de juin 2026, à
> Minsk. **L'anniversaire de KAIF est le 30 juin 2026.**

*(Texte original, en russe — canonique :)*

> KAIF был придуман и разработан как вынужденная необходимость (Николай Кривуша) Криником при совместной
> работе в режиме вайбкодинга с Claude над программным продуктом в конце жаркого июня 2026 года, в
> г. Минск. Дата рождения KAIF — 30 июня 2026 г.
<!-- KAIF:AUTHOR-NOTE:END -->