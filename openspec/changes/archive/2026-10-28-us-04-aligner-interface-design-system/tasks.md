# Tasks

## 1. Tokens et icône

- [x] 1.1 Ajouter les primitives et tokens `feedback` dans `src/styles/theme.css` (décision 2 de `design.md`) ; vérifier que `npm run build` réussit et que chaque nouvelle ligne cite sa source
- [x] 1.2 Exporter l'icône `check-light` depuis Figma et l'ajouter à `DsIcon` et au type de `DsIconButton` (décision 3) ; vérifier que `npm run typecheck` réussit

## 2. Composants

- [x] 2.1 Réécrire `DsMessage` selon la décision 6 ; vérifier les scénarios de l'exigence « Colorer les messages selon leur variante » et « Étendre les messages à la largeur du panneau »
- [x] 2.2 Réécrire `DsCheckbox` selon la décision 4 ; vérifier les scénarios de l'exigence « Afficher les cases à cocher selon l'atome Checkbox », la navigation par Tab et le cochage par Espace
- [x] 2.3 Réécrire `DsChoiceGroup` selon la décision 5 ; vérifier le scénario « Choisir le français » et que le comportement clavier est inchangé
- [x] 2.4 Mettre à jour les commentaires des composants déjà conformes (décision 7) et celui de `CaptureForm.vue` (décision 8) ; vérifier qu'aucun fichier de `src/` ne mentionne plus « hors DS » ni l'ancienne US-04

## 3. Vérification visuelle

- [x] 3.1 ⏸ Point d'arrêt : comparer chaque composant à son atome Figma, en mode clair et en mode sombre, montrer le rendu du panneau et de la page d'options à l'utilisatrice, signaler tout écart restant et attendre son accord

## 4. Clôture

- [x] 4.1 Rédiger `docs/tests/US-04-check-list.md`, un point par scénario de la spec `ui-design-system`, sur le modèle des check-lists existantes ; vérifier que chaque scénario y figure
- [x] 4.2 Lancer `npm test`, `npm run typecheck` et `openspec validate us-04-aligner-interface-design-system --strict` ; vérifier qu'ils passent tous
- [x] 4.3 ⏸ Point d'arrêt : faire le compte rendu final à l'utilisatrice et lui demander de dérouler la check-list manuelle dans Zen, en mode clair puis en mode sombre

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
