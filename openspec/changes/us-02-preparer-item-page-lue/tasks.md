# Tasks

## 1. Propriété Notion, permissions et lecture de la page

- [x] 1.1 ⏸ Point d'arrêt : demander à l'utilisatrice de créer la propriété `LinkedIn auteur`, de type URL, dans les bases Readme center et Readme center (tests) (décision 6 ter de `design.md`), et attendre sa confirmation
- [x] 1.2 Ajouter `'LinkedIn auteur': 'url'` à `EXPECTED_PROPERTIES` et la vérification correspondante au scénario des propriétés de `tests/contract/notion-connection.feature` ; ajouter un test Vitest de `verifyDatabase` sans cette propriété ; vérifier que `npm test` et `npm run test:contract` passent et que le scénario « Base sans propriété LinkedIn auteur » est couvert
- [x] 1.3 Ajouter la permission `scripting` et remplacer les permissions d'hôte par `<all_urls>` (décision 2 de `design.md`) ; vérifier dans le manifest généré ces permissions, la présence de `storage` et l'absence de `content_scripts`
- [x] 1.4 Écrire `collectPageSnapshot` dans `src/capture/page-snapshot.ts` pour les champs `ogTitle`, `metaAuthor`, `articleAuthor` et `jsonLd`, avec `postText`, `postAuthor` et `postAuthorProfileUrl` à `null` (décision 3) ; brancher dans le panneau la lecture de l'onglet actif qui l'exécute ; vérifier que `npm run build` et `npm run typecheck` réussissent
- [x] 1.5 ⏸ Point d'arrêt : demander à l'utilisatrice de recharger l'extension dans Zen, d'ouvrir le panneau sur un article de blog et de confirmer que Zen a accordé l'accès à tous les sites et que le snapshot (affiché temporairement dans la console du panneau) est lu ; si l'accès n'est pas accordé, décrire ce que Zen affiche et attendre sa décision ; retirer l'affichage dans la console avant de continuer

## 2. Nettoyage d'URL et pré-remplissage

- [x] 2.1 Implémenter `normalizeUrl` et `URL_EXCEPTIONS` (décision 6) ; vérifier avec les tests Vitest de la décision 10
- [x] 2.2 Implémenter `buildPrefill` sans la branche des posts, avec la recherche de l'auteur dans les données structurées et le rejet des auteurs URL (décision 4) ; vérifier avec les tests Vitest de la décision 10
- [x] 2.3 Implémenter `normalizeLinkedinProfile` (décision 6 bis) et le pré-remplissage de « LinkedIn de l'auteur » hors posts dans `buildPrefill` (décision 4) ; vérifier avec les tests Vitest de la décision 10 et les scénarios de l'exigence « Pré-remplir le profil LinkedIn de l'auteur depuis la page »
- [x] 2.4 Implémenter `isPostUrl` et `firstSentence` (décision 5) et brancher la branche des posts dans `buildPrefill` ; vérifier avec les tests Vitest de la décision 10

## 3. Posts LinkedIn et X

- [x] 3.1 ⏸ Point d'arrêt : fournir à l'utilisatrice un court script à exécuter dans la console de Zen sur un post LinkedIn puis sur un post X, qui affiche les éléments utiles pour retrouver le texte et l'auteur du post, et pour LinkedIn le lien du profil de l'auteur ; à partir de ses résultats, proposer la règle d'extraction de `postText`, `postAuthor` et `postAuthorProfileUrl` et le texte à reporter dans la décision 5 de `design.md` ; attendre son accord avant de modifier `design.md`
- [x] 3.2 Implémenter dans `collectPageSnapshot` la règle validée à la tâche 3.1, uniquement quand `isPostUrl` est vrai ; ajouter des tests Vitest de `buildPrefill` à partir de snapshots fictifs de posts ; vérifier que `npm test` passe

## 4. Thèmes

- [x] 4.1 Écrire `tests/contract/themes.feature` (décision 10) ; vérifier que `npm run test:contract` passe
- [x] 4.2 Implémenter `fetchThemes` (décision 7) ; vérifier avec les tests Vitest de la décision 10

## 5. Composants

- [x] 5.1 Créer `DsCheckbox` et `DsChoiceGroup` selon la décision 9 ; vérifier leur rendu en modes clair et sombre
- [x] 5.2 ⏸ Point d'arrêt : montrer à l'utilisatrice le rendu des deux composants et attendre son accord avant de continuer

## 6. Formulaire

- [x] 6.1 Implémenter `isFormValid` (décision 8) ; vérifier avec des tests Vitest couvrant chaque scénario de l'exigence « Activer « Ajouter » uniquement si le formulaire est valide », un titre composé uniquement d'espaces, un « LinkedIn de l'auteur » vide et un « LinkedIn de l'auteur » invalide
- [x] 6.2 Construire `CaptureForm.vue` et l'afficher depuis `App.vue` quand la configuration existe (décisions 8 et 9) ; vérifier les scénarios « Ouvrir le panneau avec une connexion configurée », de pré-remplissage, « Choisir une seule langue », « Choisir les thèmes de la base Notion » et « Signaler l'échec de lecture des thèmes »
- [x] 6.3 Brancher le suivi de l'onglet actif et l'indicateur `edited` (décision 8) ; vérifier les scénarios « Changer d'onglet sans avoir modifié les champs » et « Changer d'onglet après avoir modifié le titre »
- [x] 6.4 Brancher le nettoyage à la sortie des champs « URL » et « LinkedIn de l'auteur » ; vérifier les scénarios des exigences « Nettoyer une URL saisie à la main » et « Accepter uniquement un profil LinkedIn »

## 7. Clôture

- [x] 7.1 Rédiger `docs/tests/US-02-check-list.md`, un point par scénario des specs `capture-form`, `url-normalization` et `notion-connection` de ce change, sur le modèle de `docs/tests/US-01-check-list.md` ; vérifier que chaque scénario y figure
- [x] 7.2 Mettre à jour `README.md` sur les permissions demandées par l'extension ; vérifier que la section décrit `storage`, `scripting` et l'accès à tous les sites
- [x] 7.3 Lancer `npm test`, `npm run typecheck`, `npm run test:contract` et `openspec validate us-02-preparer-item-page-lue --strict` ; vérifier qu'ils passent tous
- [x] 7.4 ⏸ Point d'arrêt : faire le compte rendu final à l'utilisatrice et lui demander de dérouler la check-list manuelle dans Zen

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
