# Tasks

## 1. Alignement sur le DS 1.13

- [x] 1.1 Mettre à jour `DsInput`, `DsSelect`, `DsTextarea` et `DsPasswordInput` selon la décision 2 de `design.md` ; vérifier leur rendu en modes clair et sombre, dans chaque état, et que `npm run typecheck` réussit
- [x] 1.2 Mettre à jour `DsButton`, `DsIconButton` et `DsLink`, états focus compris, et ajouter au thème les jetons de la décision 2 ; vérifier le scénario « Atteindre « Ajouter » au clavier » de la spec `ui-design-system`
- [x] 1.3 Mettre à jour `DsCheckbox`, `DsChoiceGroup` et `DsDisclosure`, et passer les boutons principaux en `size="sm"` (décision 2) ; vérifier le scénario « Hauteur des contrôles du formulaire »
- [x] 1.4 ⏸ Point d'arrêt : comparer chaque composant à son atome Figma v1.13, en mode clair et en mode sombre, montrer à l'utilisatrice le panneau et la page d'options, signaler tout écart restant et attendre son accord

## 2. Contrat de l'API Notion

- [x] 2.1 Écrire `tests/contract/item-description.feature` (décision 8) ; vérifier que `npm run test:contract` passe et que la base « Readme center (tests) » ne contient aucun item hors corbeille après l'exécution
- [x] 2.2 ⏸ Point d'arrêt : si Notion refuse le texte de 2000 caractères ou répond autrement que `design.md`, s'arrêter et le décrire à l'utilisatrice ; sinon, passer à la tâche suivante sans attendre

## 3. Règles pures

- [x] 3.1 Implémenter `formatCharacterCount` dans `src/capture/description.ts` et `buildDescriptionBody` dans `src/notion/item-payload.ts` (décisions 3 et 5) ; vérifier avec les tests Vitest de la décision 8

## 4. Panneau

- [x] 4.1 Construire `DescriptionEditor.vue` et l'afficher depuis `CaptureForm.vue` une fois l'item créé (décisions 3, 4, 6 et 7) ; vérifier les scénarios des exigences « Proposer la description une fois l'item créé », « Limiter la description à 2000 caractères », « Afficher le compteur de caractères » et « Afficher le bouton d'enregistrement quand la description a changé », ainsi que « Compteur de la description » de la spec `ui-design-system`
- [x] 4.2 Brancher l'enregistrement, l'état « Enregistrement en cours… », la confirmation et l'erreur (décision 6) ; vérifier les scénarios des exigences « Enregistrer la description dans Notion », « Empêcher un double enregistrement de la description », « Confirmer l'enregistrement de la description » et « Indiquer la cause d'un échec d'enregistrement de la description », sur la base « Readme center (tests) »

## 5. Clôture

- [x] 5.1 Rédiger `docs/tests/US-08-check-list.md`, un point par scénario des specs `item-description` et `ui-design-system` de ce change, sur le modèle des check-lists existantes ; vérifier que chaque scénario y figure
- [x] 5.2 Lancer `npm test`, `npm run typecheck`, `npm run test:contract` et `openspec validate us-08-rediger-description --strict` ; vérifier qu'ils passent tous
- [x] 5.3 ⏸ Point d'arrêt : faire le compte rendu final à l'utilisatrice et lui demander de dérouler la check-list manuelle dans Zen, en mode clair puis en mode sombre, avec la base « Readme center (tests) » configurée dans la page d'options

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
