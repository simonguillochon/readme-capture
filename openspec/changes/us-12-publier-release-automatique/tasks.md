# Tasks

## 1. Préparation

- [x] 1.1 Vérifier que le change `us-11-installer-extension-signee` est archivé ; s'il ne l'est pas, s'arrêter et le signaler à l'utilisatrice
- [x] 1.2 Créer `.nvmrc` avec `22.23.4` et ajouter `web-ext` en dépendance de développement, en version exacte (décision 1 de `design.md`) ; vérifier que `npx web-ext --version` affiche la version installée et que `npm test` passe
- [x] 1.3 Ajouter `web-ext-artifacts/` au `.gitignore` (décision 5) ; vérifier avec `git check-ignore web-ext-artifacts/x.xpi`

## 2. Workflow

- [x] 2.1 Créer `.github/workflows/ci.yml` avec les déclencheurs, les permissions et le job `checks` (décisions 2 et 3) ; vérifier avec `actionlint` (décision 7)
- [x] 2.2 Faire échouer `tests/contract/karate-config.js` avec « Secrets des tests de contrat indisponibles » quand une des deux variables est absente ou vide (décision 4) ; vérifier en local que `npm run test:contract` échoue avec ce message, sans appel à Notion, quand les deux variables sont vides et sans `.env`, puis qu'il passe avec le `.env`
- [x] 2.3 Ajouter le job `contract` (décision 4) ; vérifier avec `actionlint` et que les secrets ne sont définis que dans l'`env` des pas qui en ont besoin
- [x] 2.4 Ajouter le job `release` (décision 5) ; vérifier avec `actionlint`, que `contents: write` et l'environnement `release` ne concernent que ce job, et qu'aucune commande n'affiche un secret
- [x] 2.5 Vérifier que chaque action est épinglée par une empreinte de 40 caractères suivie de sa version en commentaire, et que le workflow n'utilise ni `pull_request_target` ni action tierce

## 3. Documentation

- [x] 3.1 Mettre à jour la section « Installation signée » et ajouter la section « Intégration continue et releases » du `README.md` (décision 6) ; vérifier que chaque point de la décision 6 y figure
- [x] 3.2 Rédiger `docs/tests/US-12-check-list.md`, un point par scénario de la spec `continuous-release`, avec pour chacun la façon de le provoquer sur GitHub ; vérifier que chaque scénario y figure

## 4. Clôture

- [x] 4.1 Lancer `npm test`, `npm run typecheck`, `npm run test:contract` et `openspec validate us-12-publier-release-automatique --strict` ; vérifier qu'ils passent tous
- [x] 4.2 ⏸ Point d'arrêt : faire le compte rendu à l'utilisatrice et lui demander de configurer les secrets et l'environnement `release` dans GitHub (décision 6), de passer la version à 1.1.0 si la 1.0.0 a déjà été signée à la main, puis de pousser sur `main` et de dérouler la check-list manuelle

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
