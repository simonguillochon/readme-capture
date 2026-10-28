# Tasks

## 1. Prérequis et composant Select

- [x] 1.1 ⏸ Point d'arrêt : vérifier que l'atome Select est publié dans le DS ds-editorial-tech (page Components de Figma et `docs/components/atoms.md`) ; s'il ne l'est pas, le signaler à l'utilisatrice et attendre
- [x] 1.2 Créer `DsSelect` d'après l'atome Select du DS ; vérifier son rendu en modes clair et sombre, dans chacun de ses états, et sa navigation au clavier

## 2. Contrat de l'API Notion

- [x] 2.1 Écrire `tests/contract/extract-capture.feature` (décision 8 de `design.md`) ; vérifier que `npm run test:contract` passe et que la base « Readme center (tests) » ne contient aucun item hors corbeille après l'exécution
- [x] 2.2 ⏸ Point d'arrêt : décrire à l'utilisatrice la forme du paramètre de position constatée pour le début de page, l'insertion après un bloc et la fin de page, et toute autre réponse différente de `design.md` ; proposer le texte à reporter dans la décision 6 et attendre son accord avant de modifier `design.md`

## 3. Règles pures

- [x] 3.1 Implémenter la construction des blocs dans `src/notion/extract-blocks.ts` (décision 5) ; vérifier avec les tests Vitest de la décision 8
- [x] 3.2 Implémenter `placeExtract` dans `src/capture/extract-placement.ts` (décision 4) ; vérifier avec les tests Vitest de la décision 8

## 4. Ajout

- [x] 4.1 Implémenter `appendBlocks` dans `src/notion/extracts.ts` (décision 6), avec la forme de position validée à la tâche 2.2 ; vérifier avec les tests Vitest de la décision 8

## 5. Sélection

- [x] 5.1 Écrire `installSelectionWatcher` (décision 2) ; vérifier que `npm run build` et `npm run typecheck` réussissent
- [x] 5.2 ⏸ Point d'arrêt : demander à l'utilisatrice de recharger l'extension, de créer un item sur la base de test puis de sélectionner un passage, de changer d'onglet et de fermer le panneau, en affichant temporairement les messages reçus dans la console du panneau ; vérifier avec elle que la page ne garde aucun écouteur après la fermeture ; retirer l'affichage dans la console avant de continuer
- [x] 5.3 Ajouter à l'écoute le surlignage et la mise en pause des onglets inactifs (décision 9) ; vérifier que `npm run build` et `npm run typecheck` réussissent
- [x] 5.4 ⏸ Point d'arrêt : avec un déclenchement temporaire depuis la console du panneau, demander à l'utilisatrice de vérifier dans Zen qu'un passage sélectionné est surligné en entier, qu'il le reste après un aller-retour entre deux onglets, et que rien ne reste surligné ni à l'écoute après la fermeture du panneau ; retirer le déclenchement temporaire et l'affichage dans la console avant de continuer

## 6. Panneau

- [x] 6.1 Construire `ExtractCapture.vue` et l'afficher depuis `CaptureForm.vue` une fois l'item créé (décisions 3 et 7) ; vérifier les scénarios des exigences « Proposer la capture d'extraits une fois l'item créé », « Afficher en direct l'aperçu de la sélection », « Signaler une page où la sélection est impossible » et « Choisir la section de l'extrait »
- [x] 6.2 Brancher la nouvelle section, l'ajout, l'état « Extrait ajouté », l'erreur et le surlignage du passage ajouté (décisions 3, 4, 6, 7 et 9) ; vérifier les scénarios des exigences « Créer une section à partir du titre le plus proche », « Écrire l'extrait en citation sous sa section », « Placer les extraits sans section en haut de la page », « Réutiliser une section de même nom », « Empêcher l'ajout en double d'un même extrait », « Indiquer la cause d'un échec d'ajout » et « Surligner dans la page les extraits ajoutés », sur la base « Readme center (tests) »
- [x] 6.3 Afficher la liste des extraits (décision 7) ; vérifier le scénario « Extraits dans deux sections »
- [x] 6.4 ⏸ Point d'arrêt : vérifier que l'atome repliable est publié dans le DS ds-editorial-tech (page Components de Figma et `docs/components/atoms.md`) ; s'il ne l'est pas, le signaler à l'utilisatrice et attendre
- [x] 6.5 Créer le composant d'après l'atome repliable du DS et replier le formulaire après la création et après chaque enregistrement, et passer `text/accent` à `primary-700` en mode clair dans `src/styles/theme.css` (décision 10) ; vérifier son rendu en modes clair et sombre, sa navigation au clavier, et les scénarios de l'exigence « Replier le formulaire après la création »

## 7. Clôture

- [x] 7.1 Rédiger `docs/tests/US-06-check-list.md`, un point par scénario des specs `extract-capture` et `item-editing` de ce change, sur le modèle des check-lists existantes, dont le scénario « Fermer le panneau » vérifié dans l'inspecteur ; vérifier que chaque scénario y figure
- [x] 7.2 Lancer `npm test`, `npm run typecheck`, `npm run test:contract` et `openspec validate us-06-ajouter-extrait-section --strict` ; vérifier qu'ils passent tous
- [x] 7.3 ⏸ Point d'arrêt : faire le compte rendu final à l'utilisatrice et lui demander de dérouler la check-list manuelle dans Zen, avec la base « Readme center (tests) » configurée dans la page d'options

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
