# Tasks

## 1. Client Notion

- [x] 1.1 Ajouter `notionPost` et `notionPatch` à `src/notion/client.ts` (décision 2 de `design.md`) ; vérifier avec les tests Vitest de la décision 9 et vérifier que les tests existants de `notionGet` passent toujours

## 2. Contrat de l'API Notion

- [x] 2.1 Écrire `tests/contract/item-creation.feature` (décision 9) ; vérifier que `npm run test:contract` passe et que la base « Readme center (tests) » ne contient aucun item hors corbeille après l'exécution
- [x] 2.2 ⏸ Point d'arrêt : si un test de contrat révèle une réponse de Notion différente de `design.md` (forme de `parent`, champ `url` de la page, `in_trash`, propriété vide), s'arrêter et la décrire à l'utilisatrice ; sinon, passer à la tâche suivante sans attendre

## 3. Requête de création et date

- [x] 3.1 Implémenter `buildCreatePageBody` et `localDate` dans `src/notion/item-payload.ts` (décisions 3 et 4) ; vérifier avec les tests Vitest de la décision 9

## 4. Création et doublon

- [x] 4.1 Implémenter `createItem` et `findItemByUrl` dans `src/notion/items.ts` (décisions 5 et 6) ; vérifier avec les tests Vitest de la décision 9

## 5. Composant

- [x] 5.1 Ajouter la variante `warning` à `DsMessage` (décision 8) ; vérifier son rendu en modes clair et sombre et que les variantes `success` et `error` sont inchangées

## 6. Panneau

- [x] 6.1 Brancher la recherche de doublon dans `CaptureForm.vue` (décisions 6, 7 et 8) ; vérifier les scénarios de l'exigence « Avertir d'un doublon avant la création » et « Notion indisponible pendant la recherche de doublon »
- [x] 6.2 Brancher la création, l'état « Ajout en cours… », la confirmation et l'erreur (décisions 5, 7 et 8) ; vérifier les scénarios des exigences « Créer l'item avec ses métadonnées », « Renseigner le profil LinkedIn de l'auteur s'il est connu », « Porter la langue par l'icône de la page », « Dater l'item du jour de la capture », « Empêcher une double création pendant l'envoi », « Confirmer la création » et « Indiquer la cause d'un échec de création », sur la base « Readme center (tests) »
- [x] 6.3 Arrêter le pré-remplissage et la recherche de doublon une fois l'item créé (décision 7) ; vérifier le scénario « Changer d'onglet après la création de l'item » de la spec `capture-form`

## 7. Clôture

- [x] 7.1 Rédiger `docs/tests/US-03-check-list.md`, un point par scénario des specs `item-creation` et `capture-form` de ce change, sur le modèle des check-lists existantes ; vérifier que chaque scénario y figure
- [x] 7.2 Lancer `npm test`, `npm run typecheck`, `npm run test:contract` et `openspec validate us-03-creer-item-readme-center --strict` ; vérifier qu'ils passent tous
- [x] 7.3 ⏸ Point d'arrêt : faire le compte rendu final à l'utilisatrice et lui demander de dérouler la check-list manuelle dans Zen, avec la base « Readme center (tests) » configurée dans la page d'options

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
