# US-13 — Utiliser l'extension dans Dia

> **ID :** US-13
> **Epic :** E1 — Socle et connexion
> **Priorité :** Must
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

> ⚠️ **Points en hypothèse à confirmer avant lancement dev**
> 1. Dia propose un mode développeur et le chargement d'une extension non empaquetée dans sa page des extensions. À vérifier par l'utilisatrice avant le lancement.
> 2. Dia ferme le panneau de l'extension avec sa propre commande de fermeture du panneau latéral. Si un second clic sur le bouton de l'extension le ferme aussi, c'est un comportement de Dia, ni codé ni spécifié.
> 3. L'extension est toujours installée depuis le même dossier. Chromium calcule l'identifiant d'une extension non empaquetée à partir de son emplacement : un autre dossier crée une nouvelle extension, sans la configuration ni la capture en cours.
> 4. Les secrets `AMO_API_KEY` et `AMO_API_SECRET`, l'environnement GitHub « release » et les clés d'API addons.mozilla.org sont supprimés par l'utilisatrice, car plus rien ne les utilise. La publication sur le Chrome Web Store, prévue plus tard, les remplacera par ses propres identifiants.

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** utiliser l'extension dans Dia, mon nouveau navigateur basé sur Chromium
**Afin de** continuer ma veille dans Readme center sans revenir à Zen.

L'objectif de cette user story est de faire passer l'extension de Firefox à Chromium : ouverture du panneau par l'API `sidePanel`, construction pour Chromium, installation non empaquetée dans Dia, release GitHub contenant l'archive pour Chromium, et retrait de tout ce qui était propre à Firefox (signature Mozilla, `web-ext`, déclaration `data_collection_permissions`).

## What Changes

- **BREAKING** L'extension ne se construit plus pour Firefox, seulement pour Chromium.
- Le bouton de l'extension ouvre le panneau latéral de Chromium. Le panneau se ferme avec la commande de fermeture de Dia.
- L'extension s'installe dans Dia en mode développeur, comme extension non empaquetée, depuis un dossier fixe. Elle reste installée après un redémarrage.
- La release GitHub contient `readme-capture-X.Y.Z-chrome.zip`, sans signature. Le workflow ne fait plus appel à Mozilla.
- La dépendance `web-ext`, la configuration `gecko` et la déclaration `data_collection_permissions` sont retirées.
- La version passe à 1.2.0.
- Le `README.md` et `openspec/config.yaml` ne citent plus Zen ni Firefox.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities
- `side-panel`: ouverture par le bouton de l'extension, fermeture par la commande de Dia.
- `capture-session`: exemple de redémarrage du navigateur dans Dia.
- `notion-connection`: exemple de redémarrage du navigateur dans Dia.
- `extension-distribution`: installation non empaquetée dans Dia, archive pour Chromium, mise à jour depuis le même dossier ; retrait des exigences propres à Mozilla.
- `continuous-release`: release contenant l'archive pour Chromium, plus de signature ni de clés addons.mozilla.org.

## Impact

- Code : `src/entrypoints/background.ts`, `wxt.config.ts`.
- `package.json` : scripts pour Chromium, retrait de `web-ext`, version 1.2.0.
- `.github/workflows/ci.yml` : job `release` sans signature ni environnement « release ».
- `.gitignore`, `README.md`, `openspec/config.yaml`.
- Aucun changement du panneau, de la page d'options, des appels Notion ni des tests de contrat.
- Les changes archivés et les check-lists des US précédentes ne sont pas modifiés.

## Maquettes & design

- Aucune maquette. Le panneau garde son rendu selon la spec `ui-design-system` et le design system [ds-editorial-tech](https://github.com/simonguillochon/ds-editorial-tech).
- Écrans concernés : aucun écran modifié ; le panneau s'affiche dans le panneau latéral de Dia.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants
- [ ] Tests de contrat Karate passants (non-régression)
- [ ] `openspec validate us-13-utiliser-extension-dia --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Release 1.2.0 publiée sur GitHub et installée dans Dia
- [ ] Validation PO
