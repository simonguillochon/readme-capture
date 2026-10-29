# Tasks

## 1. Client Notion

- [x] 1.1 Ajouter `notionDelete` à `src/notion/client.ts`, puis `updateQuote` et `deleteBlock` à `src/notion/extracts.ts` (décision 2 de `design.md`) ; vérifier avec les tests Vitest de la décision 7

## 2. Contrat de l'API Notion

- [x] 2.1 Écrire `tests/contract/extract-editing.feature` (décision 7) ; vérifier que `npm run test:contract` passe et que la base « Readme center (tests) » ne contient aucun item hors corbeille après l'exécution
- [x] 2.2 ⏸ Point d'arrêt : si la mise à jour ou la suppression d'un bloc déjà supprimé ne renvoie pas 400 ou 404, ou si une autre réponse de Notion diffère de `design.md`, s'arrêter et la décrire à l'utilisatrice ; sinon, passer à la tâche suivante sans attendre

## 3. Règles pures

- [x] 3.1 Implémenter `editExtract` et `deleteExtract` dans `src/capture/extract-placement.ts` (décision 3), sans modifier `placeExtract` ; vérifier avec les tests Vitest de la décision 7 et que les tests existants de `placeExtract` passent toujours

## 4. Surlignage

- [x] 4.1 Identifier les surlignages par clé et ajouter la commande `unhighlight` (décision 5) ; vérifier que `npm run build` et `npm run typecheck` réussissent

## 5. Composants et icônes

- [x] 5.1 Exporter `pencil-simple-light` et `trash-light` de Figma, et créer `DsTextarea` d'après l'atome Textarea du DS s'il n'existe pas (décision 6) ; vérifier leur rendu en modes clair et sombre

## 6. Panneau

- [x] 6.1 Ajouter les actions « Modifier » et « Supprimer » à la liste et le mode modification (décision 6) ; vérifier les scénarios des exigences « Proposer les actions sur chaque extrait », « Ouvrir la modification d'un extrait » et « Activer l'enregistrement uniquement si l'extrait a changé »
- [x] 6.2 Brancher l'enregistrement et le déplacement (décisions 3 et 4) ; vérifier les scénarios des exigences « Enregistrer le texte modifié d'un extrait » et « Déplacer un extrait vers une autre section », sur la base « Readme center (tests) »
- [x] 6.3 Brancher la suppression, la suppression des sections vidées et le retrait du surlignage (décisions 3, 4 et 5) ; vérifier les scénarios des exigences « Supprimer un extrait », « Supprimer une section vidée », « Retirer de la liste un extrait déjà supprimé dans Notion » et « Retirer le surlignage d'un extrait supprimé »
- [x] 6.4 Brancher les états pendant l'envoi et les erreurs (décisions 4 et 6) ; vérifier les scénarios des exigences « Empêcher une double action pendant l'envoi » et « Indiquer la cause d'un échec de modification ou de suppression »

## 7. Clôture

- [x] 7.1 Rédiger `docs/tests/US-07-check-list.md`, un point par scénario de la spec `extract-editing`, sur le modèle des check-lists existantes ; vérifier que chaque scénario y figure
- [x] 7.2 Lancer `npm test`, `npm run typecheck`, `npm run test:contract` et `openspec validate us-07-modifier-supprimer-extrait --strict` ; vérifier qu'ils passent tous
- [x] 7.3 ⏸ Point d'arrêt : faire le compte rendu final à l'utilisatrice et lui demander de dérouler la check-list manuelle dans Zen, avec la base « Readme center (tests) » configurée dans la page d'options

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
