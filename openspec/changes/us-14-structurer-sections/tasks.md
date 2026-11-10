# Tasks

## 1. Règles pures

- [x] 1.1 Implémenter `placeSection`, `sectionLabel`, `sectionDepths` et `sectionContents` (décision 2 de `design.md`) ; vérifier avec les tests Vitest de la décision 6
- [x] 1.2 Implémenter `deleteSectionChange` et `sectionDeletionMessage`, et retirer la suppression automatique d'une section vidée de `editExtract` et `deleteExtract` (décision 2) ; vérifier avec les tests Vitest de la décision 6, tests existants mis à jour compris
- [x] 1.3 Extraire la condition 400 ou 404 de `run()` dans `isAlreadyDeleted` et l'appliquer aussi aux opérations `delete-section` (décision 3) ; vérifier avec les tests Vitest de `isAlreadyDeleted` (décision 6)

## 2. Contrat Notion

- [x] 2.1 Ajouter le scénario Karate du titre seul en fin de page (décision 6) ; vérifier avec `npm run test:contract`

## 3. Panneau

- [x] 3.1 Ajouter le bouton « Ajouter la section seule », le message « Cette section existe déjà », l'envoi, la pré-sélection et la reprise après erreur (décision 4) ; vérifier les scénarios « Section parente sans texte », « Sous-section avec son extrait », « Aucun passage sélectionné », « Section seule au nom déjà utilisé », « Ajout de section en cours » et « Pas de réseau pendant l'ajout d'une section »
- [x] 3.2 Préfixer les sections par leur niveau dans les deux menus Section (décision 4) ; vérifier les scénarios « Dernière section utilisée » et « Ouvrir la modification »
- [x] 3.3 Afficher toutes les sections avec la typographie de leur niveau et leur retrait (décision 5) ; vérifier les scénarios « Section sans extrait », « Trois niveaux imbriqués » et « Sous-niveau sans parent », en modes clair et sombre
- [x] 3.4 Ajouter l'action « Supprimer la section », la confirmation, la suppression en cascade, le retrait des surlignages, la pré-sélection et la reprise après erreur, et retirer le `sectionError` global (décision 5) ; vérifier les scénarios des exigences de suppression de section de la spec `extract-editing`, ainsi que « Suppression de section en cours » des specs `extract-editing` et `capture-session`

## 4. Clôture

- [x] 4.1 Passer la version de `package.json` à `1.3.0` ; vérifier avec `npm run build` que le manifeste porte la version `1.3.0`
- [x] 4.2 Rédiger `docs/tests/US-14-check-list.md`, un point par scénario des specs de ce change, en reprenant le cas de l'article SVPG « Experimentation, AI and the Product Model » ; vérifier que chaque scénario y figure
- [x] 4.3 Lancer `npm test`, `npm run typecheck`, `npm run test:contract` et `openspec validate us-14-structurer-sections --strict` ; vérifier qu'ils passent tous
- [x] 4.4 ⏸ Point d'arrêt : faire le compte rendu final à l'utilisatrice et lui demander de dérouler la check-list manuelle dans Dia, avec la base « Readme center (tests) » configurée dans la page d'options

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
