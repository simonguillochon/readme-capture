# Design

## Context

Après l'US-11, l'extension est signée à la main sur addons.mozilla.org, en non listé. Les vérifications (`npm run typecheck`, `npm test`, `npm run openspec:validate`, `npm run test:contract`) ne tournent que sur le poste de l'utilisatrice. Le dépôt https://github.com/simonguillochon/readme-capture est public, sans workflow GitHub Actions. Voir `proposal.md` pour le besoin.

Le script `test:contract` lit déjà ses variables d'environnement quand le fichier `.env` est absent : il fonctionne sans modification dans le workflow. En revanche, `tests/contract/karate-config.js` ne vérifie pas leur présence : sans secrets, les tests appellent Notion et échouent sur une erreur d'authentification.

## Goals / Non-Goals

**Goals:**
- Une release signée et testée à chaque nouvelle version poussée sur `main`.
- Aucun secret lisible par le public, ni par une pull request.

**Non-Goals:**
- Publication listée sur addons.mozilla.org (Hors scope du PRD).
- Mise à jour automatique de l'extension installée (`update_url`).
- Augmentation automatique de la version : l'utilisatrice la change elle-même dans `package.json`.
- Tests e2e (Hors scope du PRD).

## Decisions

### 1. Dépendances
- `web-ext`, dernière version 8.x ou supérieure publiée au moment de l'implémentation, en dépendance de développement et en version exacte (sans `^`). C'est l'outil officiel de Mozilla pour signer.
- OpenSpec CLI 1.15.0, installée globalement dans le workflow (`npm install -g @fission-ai/openspec@1.15.0`), comme sur le poste.
- Java 21, distribution Temurin, pour Karate 2.1.4.
- Node.js lu depuis `.nvmrc` : `22.23.4`.
- Actions : uniquement `actions/checkout`, `actions/setup-node` et `actions/setup-java`, chacune épinglée sur l'empreinte complète (40 caractères) du commit de sa dernière version, avec la version en commentaire. Aucune action tierce.

### 2. Déclencheurs et permissions (`.github/workflows/ci.yml`)
- `on` : `push` sur `main`, et `pull_request` (toutes branches). Jamais `pull_request_target`.
- `permissions` au niveau du workflow : `contents: read`. Seul le job `release` reçoit `contents: write`.
- Aucune commande n'affiche un secret (`echo`, `set -x`, `env`).

### 3. Job `checks`
`npm ci`, puis `npm run typecheck`, `npm test`, installation d'OpenSpec et `npm run openspec:validate`.

### 4. Job `contract`
- Lancé à chaque push sur `main` et à chaque pull request, y compris depuis un fork : sans secrets, il échoue avec « Secrets des tests de contrat indisponibles ».
- `concurrency` : groupe `notion-test-base`, `cancel-in-progress: false`.
- Variables `NOTION_TEST_TOKEN` et `NOTION_TEST_DATABASE_ID` lues depuis les secrets du dépôt, définies dans l'`env` du seul pas qui lance `npm run test:contract`.
- Le JAR Karate est téléchargé par le script existant.
- `tests/contract/karate-config.js` échoue avec le message « Secrets des tests de contrat indisponibles », avant tout appel à Notion, quand `NOTION_TEST_TOKEN` ou `NOTION_TEST_DATABASE_ID` est absente ou vide. Ce contrôle vaut aussi en local.

### 5. Job `release`
- `needs: [checks, contract]`. Lancé seulement si `github.event_name == 'push'` et `github.ref == 'refs/heads/main'`.
- `environment: release`. Les secrets `AMO_API_KEY` et `AMO_API_SECRET` sont des secrets de cet environnement, limité à la branche `main` dans les réglages de GitHub.
- Pas 1 : lire la version de `package.json`. Si `gh release view vX.Y.Z` réussit, le job se termine avec succès sans rien faire de plus.
- Pas 2 : `npm ci`, puis `npm run zip`.
- Pas 3 : `npx web-ext sign --channel=unlisted --source-dir .output/firefox-mv3 --upload-source-code .output/readme-capture-X.Y.Z-sources.zip --artifacts-dir web-ext-artifacts`, avec `WEB_EXT_API_KEY` et `WEB_EXT_API_SECRET` définis dans l'`env` de ce seul pas. Délai d'attente par défaut de web-ext.
- Pas 4 : renommer le seul `.xpi` de `web-ext-artifacts` en `readme-capture-X.Y.Z.xpi`. S'il n'y en a pas exactement un, le job échoue.
- Pas 5 : `gh release create vX.Y.Z readme-capture-X.Y.Z.xpi --target "$GITHUB_SHA" --title "vX.Y.Z" --generate-notes`, avec `GH_TOKEN` égal au `GITHUB_TOKEN`. Le tag est créé par cette commande, donc seulement après une signature réussie.
- `web-ext-artifacts/` est ajouté au `.gitignore`.

### 6. Documentation (`README.md`)
- Section « Installation signée » (US-11) : les étapes de construction et d'envoi sur addons.mozilla.org sont remplacées par le téléchargement du `.xpi` depuis la dernière release GitHub. Les étapes d'installation dans Zen sont inchangées.
- Nouvelle section « Intégration continue et releases » :
  - ce que fait le workflow à chaque push et pull request ;
  - publier une version : augmenter la version dans `package.json`, committer, pousser sur `main` ;
  - configuration unique dans GitHub, *Settings → Secrets and variables → Actions* : secrets du dépôt `NOTION_TEST_TOKEN` et `NOTION_TEST_DATABASE_ID` ; environnement `release` limité à la branche `main` (*Settings → Environments*), avec les secrets `AMO_API_KEY` et `AMO_API_SECRET` créés sur la page des clés d'API d'addons.mozilla.org ;
  - les secrets ne sont plus lisibles après leur enregistrement, sont masqués dans les journaux et ne sont pas transmis aux pull requests venant d'un fork.

### 7. Tests
- Aucun test unitaire nouveau : pas de code de l'extension modifié.
- Le workflow est vérifié sur GitHub : une pull request de test, puis le push d'une nouvelle version sur `main`.
- La syntaxe du workflow est vérifiée avant le push avec `actionlint`, lancé ponctuellement (`npx` ou binaire téléchargé), sans l'ajouter aux dépendances.

## Risks / Trade-offs

- [Signature en attente de revue manuelle chez Mozilla au-delà du délai de web-ext] → Le job échoue sans créer de release ni de tag. Relancer le job une fois la version approuvée ; si web-ext refuse une version déjà envoyée, augmenter la version.
- [Tests de contrat qui laissent des items dans la base de test en cas d'échec] → Même comportement qu'en local. L'utilisatrice nettoie la base de test.
- [Une action officielle compromise] → Épinglage par empreinte de commit, permissions minimales.
