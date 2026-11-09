# Design

## Context

L'utilisatrice remplace Zen (Firefox) par Dia, basé sur Chromium. Le journal des versions de Dia indique la prise en charge des extensions Manifest V3 et, depuis Dia 1.10.1 (18/12/2025), l'affichage du panneau latéral des extensions qui utilisent l'API `sidePanel` de Chromium. Voir `proposal.md` pour le besoin.

État du code après l'US-12 :
- Seul `src/entrypoints/background.ts` utilise une API propre à Firefox : `sidebarAction.toggle()`, appelée sur `action.onClicked`.
- `wxt.config.ts` déclare `browser_specific_settings.gecko` (`id`, `data_collection_permissions`).
- Les scripts npm construisent avec `-b firefox`. `.output/firefox-mv3/` est la sortie de build.
- Le job `release` de `.github/workflows/ci.yml` signe avec `web-ext sign` (environnement « release », secrets `AMO_API_KEY` et `AMO_API_SECRET`) et joint le `.xpi`.
- Le reste (`scripting.executeScript`, ports `runtime.connect`, `CSS.highlights`, `storage.local`, `runtime.openOptionsPage`) est commun à Firefox et Chromium.

## Goals / Non-Goals

**Goals:**
- Une extension construite uniquement pour Chromium, utilisable dans Dia avec le même comportement fonctionnel.
- Une release GitHub contenant l'archive à charger dans Dia.
- Plus aucune trace de Firefox, de Zen ni de Mozilla dans le code, la CI, le `README.md` et `openspec/config.yaml`.

**Non-Goals:**
- Construction pour Firefox.
- Publication sur le Chrome Web Store (prévue dans un second temps, Hors scope du PRD).
- Fixer l'identifiant de l'extension par une clé `key` dans le manifeste.
- Modifier le panneau, la page d'options, les appels Notion ou les tests.

## Decisions

### 1. Dépendances
- Retrait de la dépendance de développement `web-ext`.
- Aucune nouvelle dépendance. WXT 0.21 construit pour Chromium avec `-b chrome`.

### 2. Scripts npm (`package.json`)
- `dev` : `wxt -b chrome`, `build` : `wxt build -b chrome`, `zip` : `wxt zip -b chrome`.
- Sortie de build : `.output/chrome-mv3/`. Archive : `.output/readme-capture-X.Y.Z-chrome.zip`. `wxt zip -b chrome` ne produit pas d'archive des sources.
- Version : `1.2.0`.
- WXT ouvre son propre navigateur en mode `dev`. Dia n'est pas pris en charge par ce lanceur : le `README.md` indique de charger `.output/chrome-mv3-dev/` dans Dia comme extension non empaquetée. Aucun réglage du lanceur n'est ajouté.

### 3. Manifeste (`wxt.config.ts`)
- Retrait de `browser_specific_settings` en entier.
- `action`, `permissions` (`storage`, `scripting`) et `host_permissions` (`<all_urls>`) sont inchangés.
- WXT génère, pour l'entrée `sidepanel`, la clé `side_panel.default_path` et la permission `sidePanel`. À vérifier dans `.output/chrome-mv3/manifest.json`. Si WXT ne les génère pas, Claude Code s'arrête et pose la question, sans les ajouter à la main.

### 4. Ouverture du panneau (`src/entrypoints/background.ts`)
- Le contenu actuel (type `FirefoxBrowser`, écoute de `action.onClicked`) est remplacé par un appel, au démarrage du script d'arrière-plan, à `browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`.
- Aucune écoute de `action.onClicked` : avec ce réglage, Chromium ouvre le panneau lui-même.
- Aucun code de fermeture : le panneau se ferme par la commande de Dia. Sa fermeture décharge la page du panneau, ce qui ferme ses ports : le comportement de la spec `side-panel` « Rester inactive quand le panneau est fermé » est conservé sans changement de code. À vérifier dans la check-list.
- Si le typage de `browser.sidePanel` manque dans WXT 0.21, Claude Code s'arrête et pose la question, sans contournement de type.

### 5. Workflow (`.github/workflows/ci.yml`)
- Jobs `checks` et `contract` inchangés.
- Job `release` :
  - retrait de `environment: release`, du pas `web-ext sign` et du pas qui renomme le `.xpi` ;
  - après `npm ci` et `npm run zip`, `gh release create "v$VERSION" ".output/readme-capture-$VERSION-chrome.zip" --target "$GITHUB_SHA" --title "v$VERSION" --generate-notes` ;
  - `permissions: contents: write` et le test d'existence de la release sont inchangés.
- `.gitignore` : retrait du bloc « Extension signée par web-ext ».

### 6. Documentation
- `README.md` :
  - introduction : « Extension Chromium, utilisée dans le navigateur Dia » ;
  - « Chargement temporaire dans Zen » devient « Chargement en développement dans Dia » : `npm run build`, puis, dans la page des extensions de Dia, activer le mode développeur, cliquer sur « Charger l'extension non empaquetée » et choisir `.output/chrome-mv3/` ;
  - « Installation signée » devient « Installation dans Dia » : télécharger `readme-capture-X.Y.Z-chrome.zip` depuis la dernière release, le décompresser dans un dossier fixe (exemple : `Extensions/readme-capture`), puis le charger comme ci-dessus. Mise à jour : remplacer le contenu de ce même dossier, puis cliquer sur l'actualisation de l'extension dans la page des extensions. Avertissement : un autre dossier crée une nouvelle extension, sans la configuration ni la capture en cours ;
  - « Intégration continue et releases » : retrait de la signature, de l'environnement « release » et des clés addons.mozilla.org ; seuls `NOTION_TEST_TOKEN` et `NOTION_TEST_DATABASE_ID` restent à configurer ;
  - « Permissions » : ajout de `sidePanel`, pour afficher le panneau latéral ; retrait de la mention de `data_collection_permissions` ;
  - tableau des scripts : sorties `.output/chrome-mv3/` et `readme-capture-X.Y.Z-chrome.zip`.
- `openspec/config.yaml`, bloc `context` : « Usage personnel, navigateur Dia (basé sur Chromium) » et « Extension Chromium Manifest V3 » à la place des mentions de Zen et de Firefox.
- `CLAUDE.md` ne cite ni Zen ni Firefox : inchangé.
- Les changes archivés et les check-lists `docs/tests/US-01` à `US-12` restent inchangés.

### 7. Tests
- Aucun test unitaire nouveau : `background.ts` ne contient qu'un appel d'API du navigateur.
- `npm test`, `npm run typecheck` et `npm run test:contract` servent de non-régression.
- Le fonctionnement dans Dia est vérifié par la check-list manuelle de l'US-13, qui reprend un parcours complet de capture.

## Risks / Trade-offs

- [Dia ne propose pas le chargement d'une extension non empaquetée] → Hypothèse 1 de `proposal.md`, à vérifier avant le lancement. À défaut, publication non répertoriée sur le Chrome Web Store, prévue dans un second temps.
- [Un comportement du panneau diffère dans Dia (largeur, mode sombre, sélection)] → Repéré par la check-list. Toute correction passe par un nouveau change.
- [Installation depuis un autre dossier] → Nouvelle extension, configuration perdue. Documenté dans le `README.md` et couvert par un scénario d'erreur.
