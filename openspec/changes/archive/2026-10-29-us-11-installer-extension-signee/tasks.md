# Tasks

## 1. Manifeste et version

- [x] 1.1 Ajouter `data_collection_permissions` dans `wxt.config.ts` (décision 2 de `design.md`) ; vérifier avec `npm run build` que `.output/firefox-mv3/manifest.json` contient `"data_collection_permissions": {"required": ["none"]}` sous `browser_specific_settings.gecko`, et que `npm run typecheck` passe
- [x] 1.2 Passer la version de `package.json` à `1.0.0` (décision 3) ; vérifier que `.output/firefox-mv3/manifest.json` porte la version `1.0.0` après `npm run build`
- [x] 1.3 Limiter la détection des classes de Tailwind à `src/` dans `src/styles/theme.css` (décision 7) ; vérifier avec `npm run build` que chaque classe absente du nouveau CSS par rapport au précédent n'apparaît dans aucun fichier de `src/`, puis que `npm test` et `npm run typecheck` passent

## 2. Archives

- [x] 2.1 Lancer `npm run zip` (décision 4) ; vérifier que `.output` contient `readme-capture-1.0.0-firefox.zip` et `readme-capture-1.0.0-sources.zip`, et avec `unzip -l` que l'archive des sources ne contient ni `.env`, ni `node_modules`, ni `.output`, ni `tests/contract/.karate`, en ayant un fichier `.env` présent à la racine pendant la vérification
- [x] 2.2 Extraire l'archive des sources dans un dossier temporaire hors du dépôt, y lancer `npm ci` puis `npm run zip` ; vérifier que l'archive de l'extension obtenue contient les mêmes fichiers, au contenu identique, que celle de la tâche 2.1, puis supprimer le dossier temporaire

## 3. Documentation

- [x] 3.1 Ajouter la section « Installation signée » et compléter la section « Permissions » du `README.md` (décision 5) ; vérifier que chaque étape de la décision 5 y figure
- [x] 3.2 Rédiger `docs/tests/US-11-check-list.md`, un point par scénario de la spec `extension-distribution` ; vérifier que chaque scénario y figure

## 4. Clôture

- [x] 4.1 Lancer `npm test`, `npm run typecheck`, `npm run test:contract` et `openspec validate us-11-installer-extension-signee --strict` ; vérifier qu'ils passent tous
- [x] 4.2 ⏸ Point d'arrêt : faire le compte rendu final à l'utilisatrice et lui demander de soumettre l'archive sur addons.mozilla.org, puis de dérouler la check-list manuelle avec le fichier `.xpi` signé

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
