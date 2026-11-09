# Readme Capture

Extension Chromium, utilisée dans le navigateur Dia, qui capture des contenus de veille vers la base Notion Readme center.

Référence fonctionnelle : [PRD-2610-001](docs/prd/PRD-2610-001.md).

## Prérequis

- Node.js et npm.
- La CLI OpenSpec, installée globalement, pour `npm run openspec:validate`.
- Java 21 ou plus, uniquement pour exécuter les tests de contrat Karate (Karate 2.1.4).

## Installation

```sh
npm install
```

`npm install` lance aussi `wxt prepare`, qui génère les types de WXT dans `.wxt/`.

Pour les tests de contrat, copier `.env.example` en `.env` et renseigner les variables :

- `NOTION_TEST_TOKEN` : jeton de l'intégration Notion partagée avec la base « Readme center (tests) ».
- `NOTION_TEST_DATABASE_ID` : identifiant de la base « Readme center (tests) ».

Le fichier `.env` est ignoré par git. Il ne doit jamais être versionné.

## Chargement en développement dans Dia

1. Construire l'extension : `npm run build`.
2. Ouvrir la page des extensions de Dia et activer le mode développeur.
3. Cliquer sur « Charger l'extension non empaquetée ».
4. Choisir le dossier `.output/chrome-mv3/`.

Avec `npm run dev`, le lanceur de WXT ne prend pas en charge Dia : charger de la même façon le dossier `.output/chrome-mv3-dev/`.

## Installation dans Dia

1. Sur la page des releases du dépôt GitHub, ouvrir la dernière release et télécharger le fichier `readme-capture-X.Y.Z-chrome.zip`.
2. Le décompresser dans un dossier fixe (exemple : `Extensions/readme-capture`).
3. Charger ce dossier comme décrit dans « Chargement en développement dans Dia », étapes 2 à 4.

Mise à jour : remplacer le contenu de ce même dossier par celui de l'archive plus récente, puis cliquer sur l'actualisation de l'extension dans la page des extensions.

**Attention :** charger l'extension depuis un autre dossier crée une nouvelle extension, sans la configuration ni la capture en cours.

## Intégration continue et releases

Le workflow GitHub Actions `.github/workflows/ci.yml` s'exécute à chaque push sur `main` et à chaque pull request :

- il lance `npm run typecheck`, `npm test`, `npm run openspec:validate` et `npm run test:contract` ;
- sur un push sur `main` dont toutes les vérifications passent, si le tag `v<version>` de la version de `package.json` n'existe pas encore, il crée la release `v<version>` avec le fichier `readme-capture-<version>-chrome.zip` et des notes générées par GitHub.

Publier une version : augmenter la version dans `package.json`, committer, puis pousser sur `main`.

Configuration à faire une seule fois dans GitHub :

Dans *Settings → Secrets and variables → Actions*, créer les secrets du dépôt `NOTION_TEST_TOKEN` et `NOTION_TEST_DATABASE_ID`, avec les mêmes valeurs que dans le `.env`.

Les secrets ne sont plus lisibles après leur enregistrement, sont masqués dans les journaux du workflow et ne sont pas transmis aux pull requests venant d'un fork : sur une telle pull request, les tests de contrat échouent avec « Secrets des tests de contrat indisponibles ».

## Permissions

L'extension demande :

- `storage` : enregistrer la configuration de la connexion à Notion dans le stockage local de l'extension.
- `scripting` : lire les métadonnées de la page de l'onglet actif (titre, auteur, données structurées, texte et auteur d'un post LinkedIn ou X) pour pré-remplir le formulaire.
- `sidePanel` : afficher le panneau latéral.
- L'accès à tous les sites (`<all_urls>`) : nécessaire pour lire la page de l'onglet actif, quel que soit le site, et pour appeler l'API Notion (`https://api.notion.com`).

La page n'est lue que lorsque le panneau est ouvert, et uniquement celle de l'onglet actif de sa fenêtre, en lecture seule. L'extension ne déclare aucun script de contenu : rien n'est ajouté aux pages quand le panneau est fermé.

## Scripts npm

| Script | Rôle |
| --- | --- |
| `npm run dev` | Lance WXT en mode développement pour Chromium. |
| `npm run build` | Construit l'extension dans `.output/chrome-mv3/`. |
| `npm run zip` | Construit l'extension et produit son archive `.output/readme-capture-X.Y.Z-chrome.zip`. |
| `npm run typecheck` | Vérifie les types TypeScript en mode strict. |
| `npm test` | Exécute les tests unitaires Vitest. |
| `npm run test:contract` | Exécute les tests de contrat Karate. Télécharge le JAR Karate au premier lancement. |
| `npm run openspec:validate` | Valide les changes et specs OpenSpec en mode strict. |
