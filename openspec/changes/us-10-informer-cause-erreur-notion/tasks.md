# Tasks

## 1. Règles pures

- [x] 1.1 Créer `src/notion/retry.ts` avec `withRateLimitRetry` en y déplaçant la logique de `verifyConnection`, puis faire utiliser ce module par `verifyConnection` (décision 2 de `design.md`) ; vérifier avec les tests Vitest de la décision 7 et que les tests existants de `verifyConnection` passent sans modification
- [x] 1.2 Implémenter `errorAction` dans `src/notion/error-actions.ts` (décision 3) ; vérifier avec les tests Vitest de la décision 7

## 2. Composant

- [x] 2.1 Créer `ErrorNotice.vue` (décision 4) ; vérifier son rendu pour chaque action, en modes clair et sombre, et l'état inactif de ses boutons pendant `busy`

## 3. Panneau

- [x] 3.1 Brancher `withRateLimitRetry`, `ErrorNotice` et la relance sur la lecture des thèmes, la création et l'enregistrement des métadonnées dans `CaptureForm.vue` (décisions 2, 4 et 5) ; vérifier les scénarios « Réessayer une création après une coupure réseau », « Recharger après une coupure réseau » et « Propriété Theme rétablie »
- [x] 3.2 Faire de même pour l'ajout, la modification et la suppression d'extraits dans `ExtractCapture.vue` ; vérifier les scénarios « Réessayer sans succès », « Extrait supprimé directement dans Notion » et « Limitation passagère pendant un ajout d'extrait »
- [x] 3.3 Faire de même pour l'enregistrement de la description dans `DescriptionEditor.vue` ; vérifier les scénarios « Jeton révoqué pendant une capture », « Item mis à la corbeille avec une description en cours » et « Limitation persistante »
- [x] 3.4 Brancher « Terminer la capture » et « Ouvrir la page d'options » (décision 5) ; vérifier les scénarios « Ouvrir les options depuis l'erreur » et « Réessai en cours »

## 4. Configuration

- [x] 4.1 Suivre les changements de `notionConfig` dans `App.vue` (décision 6) ; vérifier les scénarios « Nouveau jeton pour la même base » et « Autre base enregistrée »

## 5. Clôture

- [x] 5.1 Rédiger `docs/tests/US-10-check-list.md`, un point par scénario de la spec `notion-error-recovery`, avec pour chacun la façon de provoquer l'erreur sur la base « Readme center (tests) » ; vérifier que chaque scénario y figure
- [x] 5.2 Lancer `npm test`, `npm run typecheck`, `npm run test:contract` et `openspec validate us-10-informer-cause-erreur-notion --strict` ; vérifier qu'ils passent tous
- [x] 5.3 ⏸ Point d'arrêt : faire le compte rendu final à l'utilisatrice et lui demander de dérouler la check-list manuelle dans Zen, avec la base « Readme center (tests) » configurée dans la page d'options

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
