# Tasks

## 1. Comparaison et requête de modification

- [x] 1.1 Implémenter `changedFields` dans `src/capture/form-diff.ts` (décisions 2 et 3 de `design.md`) ; vérifier avec les tests Vitest de la décision 9
- [x] 1.2 Implémenter `buildUpdatePageBody` dans `src/notion/item-payload.ts` (décision 4), sans modifier la requête de création ; vérifier avec les tests Vitest de la décision 9 et que les tests existants de `buildCreatePageBody` passent toujours

## 2. Contrat de l'API Notion

- [x] 2.1 Écrire `tests/contract/item-editing.feature` (décision 9) ; vérifier que `npm run test:contract` passe et que la base « Readme center (tests) » ne contient aucun item hors corbeille après l'exécution
- [x] 2.2 ⏸ Point d'arrêt : si la mise à jour d'un item à la corbeille ne renvoie pas 404, ou si une autre réponse de Notion diffère de `design.md`, s'arrêter et la décrire à l'utilisatrice ; sinon, passer à la tâche suivante sans attendre

## 3. Enregistrement et erreurs

- [x] 3.1 Ajouter le message `itemNotFound` et `itemErrorMessage` dans `src/notion/errors.ts` (décision 6) ; vérifier avec les tests Vitest de la décision 9 et que les tests existants de `errorMessage` passent toujours
- [x] 3.2 Implémenter `updateItem` dans `src/notion/items.ts` (décision 5) ; vérifier avec les tests Vitest de la décision 9

## 4. Panneau

- [x] 4.1 Mémoriser `createdItemId` et `savedValues` à la création, et afficher le bouton et le message de confirmation selon `dirty` (décisions 2, 3 et 8) ; vérifier les scénarios des exigences « Garder les métadonnées modifiables après la création », « Afficher le bouton d'enregistrement quand un champ a changé », « Activer l'enregistrement uniquement si le formulaire est valide » et le scénario « Première modification après la création » de la spec `item-creation`
- [x] 4.2 Brancher l'enregistrement, l'état « Enregistrement en cours… », la confirmation et l'erreur (décision 7) ; vérifier les scénarios des exigences « Enregistrer uniquement les propriétés modifiées », « Empêcher un double enregistrement pendant l'envoi », « Confirmer l'enregistrement » et « Indiquer la cause d'un échec d'enregistrement », sur la base « Readme center (tests) »
- [x] 4.3 Vérifier que la recherche de doublon reste coupée après la création ; vérifier le scénario « URL modifiée vers un contenu déjà présent »

## 5. Clôture

- [x] 5.1 Rédiger `docs/tests/US-05-check-list.md`, un point par scénario des specs `item-editing` et `item-creation` de ce change, sur le modèle des check-lists existantes ; vérifier que chaque scénario y figure
- [x] 5.2 Lancer `npm test`, `npm run typecheck`, `npm run test:contract` et `openspec validate us-05-modifier-metadonnees-item --strict` ; vérifier qu'ils passent tous
- [x] 5.3 ⏸ Point d'arrêt : faire le compte rendu final à l'utilisatrice et lui demander de dérouler la check-list manuelle dans Zen, avec la base « Readme center (tests) » configurée dans la page d'options

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
