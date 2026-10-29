# Design

## Context

Les dix US du PRD sont livrées. L'extension n'est chargée qu'en temporaire (`README.md`, « Chargement temporaire dans Zen »). Le PRD prévoit une signature en « non listée » sur addons.mozilla.org. Depuis le 3 novembre 2025, Mozilla exige que toute nouvelle extension déclare dans son manifeste les données qu'elle collecte ou transmet (`browser_specific_settings.gecko.data_collection_permissions`). L'utilisatrice a choisi de déclarer `none`, en considérant que l'envoi vers sa propre base Notion, à sa demande, n'est pas une collecte. Voir `proposal.md` pour le besoin.

## Goals / Non-Goals

**Goals:**
- Un manifeste accepté par la signature de Mozilla.
- Des archives prêtes à envoyer, sans secret.
- Une procédure de signature, d'installation et de mise à jour écrite dans le `README.md`.

**Non-Goals:**
- Publication listée sur addons.mozilla.org (Hors scope du PRD).
- Signature automatisée (`web-ext sign`, clés d'API, intégration continue).
- Mise à jour automatique (`update_url`).

## Decisions

### 1. Dépendances
Aucune nouvelle dépendance, aucun nouveau script npm. WXT 0.21 produit déjà les deux archives avec `npm run zip` (`wxt zip -b firefox`).

### 2. Manifeste (`wxt.config.ts`)
Dans `manifest.browser_specific_settings.gecko`, à côté de `id` :

```ts
data_collection_permissions: {
  required: ['none'],
},
```

Si le typage du manifeste de WXT 0.21 refuse cette clé, Claude Code s'arrête et pose la question, sans contournement de type.

### 3. Version
`package.json` passe de `0.1.0` à `1.0.0`. WXT reprend cette version dans le manifeste et dans le nom des archives. Chaque nouvelle signature exige une version supérieure à la précédente.

### 4. Archive des sources
- Elle est produite avec la configuration par défaut de WXT. Aucune option `zip` n'est ajoutée.
- Si l'archive contient un fichier ou dossier interdit par la spec (`.env`, `node_modules`, `.output`, `tests/contract/.karate`), Claude Code s'arrête et propose l'option `zip.excludeSources` correspondante, sans l'appliquer.

### 5. Documentation (`README.md`)
Nouvelle section « Installation signée », après « Chargement temporaire dans Zen » :
1. Construire les archives avec `npm run zip`.
2. Sur addons.mozilla.org, Developer Hub : « Submit a New Add-on », choisir « On your own », envoyer `readme-capture-<version>-firefox.zip`, puis l'archive des sources quand le site la demande, avec la consigne de reconstruction `npm ci` puis `npm run zip`.
3. Télécharger le fichier `.xpi` signé.
4. Dans Zen : `about:addons`, roue dentée, « Installer un module depuis un fichier… ».
5. Mise à jour : augmenter la version dans `package.json`, puis reprendre les étapes 1 à 4 en choisissant « Upload New Version » sur la page de l'extension. La configuration est conservée.

La section « Permissions » ajoute que le manifeste déclare ne collecter aucune donnée : la configuration reste dans le stockage local, et les contenus capturés ne sont envoyés qu'à la base Notion de l'utilisatrice, à sa demande.

### 6. Tests
- Aucun test nouveau : pas de code applicatif modifié, hors l'import de Tailwind (décision 7), qui ne retire que des classes absentes de `src/`. `npm test`, `npm run typecheck` et `npm run test:contract` servent de non-régression.
- Les archives et la reconstruction sont vérifiées par des commandes (`unzip -l`, comparaison des listes de fichiers et des contenus).
- La signature et l'installation sont vérifiées par l'utilisatrice avec la check-list manuelle.

### 7. Sources de Tailwind (`src/styles/theme.css`)
L'import de Tailwind limite la détection des classes au dossier `src/` :

```css
@import "tailwindcss" source("../");
```

Sans cette option, Tailwind v4 analyse tous les fichiers du dépôt non ignorés par git, dont `.claude/` et `tests/unit/`, que l'archive des sources de WXT ne contient pas. Le CSS produit depuis le dépôt diffère alors de celui reconstruit depuis l'archive des sources. Les classes retirées ne sont utilisées par aucun fichier de `src/`.

## Risks / Trade-offs

- [Mozilla refuse la déclaration `none` à la revue] → L'utilisatrice l'a acceptée pour essayer. Un nouveau change déclarera `websiteContent` et `browsingActivity`.
- [Reconstruction non identique, par exemple à cause d'un horodatage ou de fichiers analysés hors de l'archive des sources] → La comparaison porte sur la liste des fichiers et leur contenu, pas sur l'archive elle-même. La décision 7 supprime l'écart constaté sur le CSS. En cas d'autre écart de contenu, Claude Code s'arrête.
