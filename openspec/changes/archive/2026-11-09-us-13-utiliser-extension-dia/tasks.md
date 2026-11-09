# Tasks

## 1. Construction pour Chromium

- [x] 1.1 Mettre à jour les scripts et la version de `package.json`, puis retirer `web-ext` (décisions 1 et 2 de `design.md`) ; vérifier que `npm ls web-ext` ne trouve rien et que `npm test` passe
- [x] 1.2 Retirer `browser_specific_settings` de `wxt.config.ts` (décision 3) ; vérifier avec `npm run build` que `.output/chrome-mv3/manifest.json` porte la version `1.2.0`, contient `side_panel.default_path` et la permission `sidePanel`, et ne contient ni `browser_specific_settings` ni `sidebar_action`
- [x] 1.3 Remplacer le contenu de `src/entrypoints/background.ts` (décision 4) ; vérifier que `npm run typecheck` passe et qu'aucun fichier de `src` ne contient `sidebarAction`

## 2. Archive et workflow

- [x] 2.1 Lancer `npm run zip` ; vérifier que `.output` contient `readme-capture-1.2.0-chrome.zip`, et avec `unzip -l`, en ayant un fichier `.env` présent à la racine, que `manifest.json` est à la racine de l'archive et qu'elle ne contient ni `.env`, ni `node_modules`, ni `src`, ni `tests`
- [x] 2.2 Mettre à jour le job `release` de `.github/workflows/ci.yml` et le `.gitignore` (décision 5) ; vérifier avec `actionlint` et qu'aucun fichier du dépôt ne contient `web-ext`, `AMO_API` ou `xpi`, hors `openspec/changes/archive`, `docs`, `openspec/specs` et `openspec/changes/us-13-utiliser-extension-dia` (mis à jour à l'archivage), `README.md` (vérifié en 3.1) et `package-lock.json` (dépendance pair optionnelle déclarée par `wxt`)

## 3. Documentation

- [x] 3.1 Mettre à jour le `README.md` et `openspec/config.yaml` (décision 6) ; vérifier que chaque point de la décision 6 y figure, et qu'aucun des deux fichiers ne contient « Zen », « Firefox », « Mozilla », `web-ext`, `AMO_API` ni `xpi`
- [x] 3.2 Rédiger `docs/tests/US-13-check-list.md`, un point par scénario des specs de ce change, plus un parcours complet de capture dans Dia (pré-remplissage, création, extrait avec surlignage, description, Terminer, mode sombre) et la vérification qu'aucun script n'est injecté quand le panneau est fermé ; vérifier que chaque scénario y figure

## 4. Clôture

- [x] 4.1 Lancer `npm test`, `npm run typecheck`, `npm run test:contract` et `openspec validate us-13-utiliser-extension-dia --strict` ; vérifier qu'ils passent tous
- [x] 4.2 ⏸ Point d'arrêt : faire le compte rendu final à l'utilisatrice et lui demander de charger `.output/chrome-mv3/` dans Dia, de dérouler la check-list manuelle, puis de supprimer dans GitHub les secrets `AMO_API_KEY` et `AMO_API_SECRET` et l'environnement « release », et de révoquer ses clés d'API sur addons.mozilla.org

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
- Après l'archivage, remplacer le `## Purpose` de deux specs, seule partie qu'un delta ne met pas à jour :
  - `openspec/specs/extension-distribution/spec.md` : « Permet d'installer durablement dans Dia l'extension construite pour Chromium, en extension non empaquetée. »
  - `openspec/specs/continuous-release/spec.md` : « Publie automatiquement sur GitHub une version testée de l'extension, sans exposer de secret dans le dépôt public. »
