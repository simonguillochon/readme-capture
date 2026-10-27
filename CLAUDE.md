# Règles de travail pour Claude Code

Ce dépôt est développé en spec-driven development avec OpenSpec. Les specs et le plan d'implémentation ont été convenus en amont avec l'utilisatrice. Ton rôle est de les exécuter fidèlement, pas de les compléter.

## Sources de vérité

Par ordre de priorité :

1. Le change OpenSpec en cours : `openspec/changes/<change>/` (`proposal.md`, `specs/`, `design.md`, `tasks.md`).
2. Les specs déjà livrées : `openspec/specs/`.
3. Le PRD : `docs/prd/PRD-2610-001.md`, en particulier ses sections « Hors scope » et « Hypothèses ».
4. Le design system : https://github.com/simonguillochon/ds-editorial-tech (fait foi pour tout rendu visuel).

En cas de contradiction entre ces sources, tu t'arrêtes et tu poses la question.

## Ce que tu fais

- Tu implémentes **uniquement** les tâches de `tasks.md` du change en cours, **dans l'ordre**, et tu les coches au fur et à mesure.
- Tu vérifies chaque tâche selon le critère indiqué dans sa description avant de la cocher.
- Tu écris les tests demandés dans le groupe de tâches qui produit le code testé.
- Tu lances `openspec validate <change> --strict` avant de déclarer un change terminé.

## Ce que tu ne fais jamais sans accord explicite

- Ajouter une dépendance, un fichier, un dossier, un script ou une configuration qui n'est pas prévu dans `design.md` ou `tasks.md`.
- Ajouter une fonctionnalité, un comportement, un message ou un cas d'erreur qui n'est pas dans les specs, même s'il te semble évident ou utile.
- Refactoriser, renommer ou réorganiser du code existant en dehors d'une tâche qui le demande.
- Implémenter un élément listé « Hors scope » dans le PRD.
- Dévier du design system, ou créer un composant visuel que le DS ne spécifie pas.
- Écrire un jeton, un ID de base Notion ou toute donnée personnelle dans le code, les tests ou l'historique git.
- Modifier les specs, le design ou les tâches d'un change. Si tu penses qu'ils sont faux ou incomplets, tu le dis et tu proposes une correction.

## Quand tu t'arrêtes

Tu t'arrêtes, tu fais un compte rendu court et tu poses ta question dans ces cas :

- Une tâche commence par « ⏸ Point d'arrêt ».
- Un point n'est pas couvert par les specs, le design ou les tâches, ou il est ambigu.
- Une spec, le design et le PRD se contredisent.
- Un outil, une version ou une API ne se comporte pas comme le décrit `design.md`.
- Un test échoue et la correction impliquerait de sortir du périmètre de la tâche.
- Le design system ne couvre pas un besoin de l'interface.

Quand tu poses une question, tu proposes les options possibles avec leurs conséquences. Tu ne choisis pas à la place de l'utilisatrice.

## Secrets et données de test

- Les secrets des tests de contrat (jeton Notion, ID de la base de test) sont lus depuis des variables d'environnement définies dans un fichier `.env` local, ignoré par git. Le fichier `.env.example` liste les noms des variables, sans valeur.
- Les tests de contrat s'exécutent uniquement sur la base « Readme center (tests) », jamais sur la base de production.

## Langue

- Specs, documentation, interface et messages à l'utilisatrice : en français.
