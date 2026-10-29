# Tasks

## 1. Capture conservée

- [x] 1.1 Implémenter `parseSession` et `toSession` dans `src/capture/capture-session.ts` (décision 2 de `design.md`) ; vérifier avec les tests Vitest de la décision 9
- [x] 1.2 Implémenter la lecture, l'écriture et l'effacement de `captureSession` dans le stockage local ; vérifier avec les tests Vitest de la décision 9

## 2. État partagé

- [x] 2.1 Créer `src/capture/capture-store.ts` (décision 3) et y faire passer l'état de `CaptureForm.vue`, `ExtractCapture.vue` et `DescriptionEditor.vue`, sans changer leur logique ni leur rendu ; vérifier que `npm test` et `npm run typecheck` passent
- [x] 2.2 ⏸ Point d'arrêt : demander à l'utilisatrice de dérouler dans Zen une capture complète (création, extraits, déplacement, description), pour confirmer l'absence de régression avant de brancher la conservation

## 3. Écriture et reprise

- [x] 3.1 Brancher l'écriture de la capture (décision 4) et la reprise à l'ouverture du panneau (décisions 3 et 5) ; vérifier les scénarios des exigences « Conserver la capture dès la création de l'item », « Ne pas pré-remplir une capture reprise » et « Ne pas reprendre l'état éphémère »
- [x] 3.2 Effacer une capture d'une autre base à l'ouverture (décision 2) ; vérifier le scénario « Base changée dans les options »
- [x] 3.3 Brancher le report entre fenêtres (décision 6) ; vérifier le scénario « Deux fenêtres »

## 4. Terminer

- [x] 4.1 Implémenter `hasUnsavedChanges` et `isSending` (décision 7) ; vérifier avec les tests Vitest de la décision 9
- [x] 4.2 Ajouter le bouton « Terminer » et sa confirmation (décisions 7 et 8) ; vérifier les scénarios des exigences « Terminer la capture », « Confirmer la fin d'une capture non enregistrée » et « Bloquer « Terminer » pendant un envoi »

## 5. Clôture

- [x] 5.1 Rédiger `docs/tests/US-09-check-list.md`, un point par scénario de la spec `capture-session`, sur le modèle des check-lists existantes, dont le redémarrage de Zen et les deux fenêtres ; vérifier que chaque scénario y figure
- [x] 5.2 Lancer `npm test`, `npm run typecheck`, `npm run test:contract` et `openspec validate us-09-reprendre-terminer-capture --strict` ; vérifier qu'ils passent tous
- [x] 5.3 ⏸ Point d'arrêt : faire le compte rendu final à l'utilisatrice et lui demander de dérouler la check-list manuelle dans Zen, avec la base « Readme center (tests) » configurée dans la page d'options, ainsi que les points des check-lists `docs/tests/US-02` à `US-08` qui portent sur le panneau, pour vérifier qu'aucun ne régresse

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
