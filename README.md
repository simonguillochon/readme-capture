# Readme Capture

Extension Firefox, utilisée dans le navigateur Zen, qui capture des contenus de veille vers la base Notion Readme center.

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

## Chargement temporaire dans Zen

1. Construire l'extension : `npm run build`.
2. Ouvrir `about:debugging#/runtime/this-firefox` dans Zen.
3. Cliquer sur « Charger un module complémentaire temporaire… ».
4. Sélectionner le fichier `.output/firefox-mv3/manifest.json`.

L'extension reste chargée jusqu'à la fermeture de Zen.

## Installation signée

La version signée reste installée après un redémarrage de Zen. Elle est signée par Mozilla en distribution non listée : elle n'apparaît pas dans le catalogue d'addons.mozilla.org.

1. Construire les archives : `npm run zip`. Le dossier `.output/` contient `readme-capture-<version>-firefox.zip` (l'extension) et `readme-capture-<version>-sources.zip` (ses sources).
2. Sur addons.mozilla.org, dans le Developer Hub, cliquer sur « Submit a New Add-on », choisir « On your own », puis envoyer `readme-capture-<version>-firefox.zip`. Quand le site demande les sources, envoyer `readme-capture-<version>-sources.zip`, avec la consigne de reconstruction : `npm ci`, puis `npm run zip`.
3. Une fois l'extension signée, télécharger le fichier `.xpi` signé.
4. Dans Zen, ouvrir `about:addons`, cliquer sur la roue dentée, puis sur « Installer un module depuis un fichier… », et sélectionner le fichier `.xpi`.

Mise à jour : augmenter la version dans `package.json`, puis reprendre les étapes 1 à 4 en choisissant « Upload New Version » sur la page de l'extension dans le Developer Hub. Chaque nouvelle signature exige une version supérieure à la précédente. La configuration de la connexion à Notion est conservée.

## Permissions

L'extension demande :

- `storage` : enregistrer la configuration de la connexion à Notion dans le stockage local de l'extension.
- `scripting` : lire les métadonnées de la page de l'onglet actif (titre, auteur, données structurées, texte et auteur d'un post LinkedIn ou X) pour pré-remplir le formulaire.
- L'accès à tous les sites (`<all_urls>`) : nécessaire pour lire la page de l'onglet actif, quel que soit le site, et pour appeler l'API Notion (`https://api.notion.com`).

La page n'est lue que lorsque le panneau est ouvert, et uniquement celle de l'onglet actif de sa fenêtre, en lecture seule. L'extension ne déclare aucun script de contenu : rien n'est ajouté aux pages quand le panneau est fermé.

Le manifeste déclare que l'extension ne collecte aucune donnée (`data_collection_permissions` : `none`) : la configuration reste dans le stockage local de l'extension, et les contenus capturés ne sont envoyés qu'à la base Notion de l'utilisatrice, à sa demande.

## Scripts npm

| Script | Rôle |
| --- | --- |
| `npm run dev` | Lance WXT en mode développement pour Firefox. |
| `npm run build` | Construit l'extension dans `.output/firefox-mv3/`. |
| `npm run zip` | Construit l'extension et produit son archive dans `.output/`. |
| `npm run typecheck` | Vérifie les types TypeScript en mode strict. |
| `npm test` | Exécute les tests unitaires Vitest. |
| `npm run test:contract` | Exécute les tests de contrat Karate. Télécharge le JAR Karate au premier lancement. |
| `npm run openspec:validate` | Valide les changes et specs OpenSpec en mode strict. |
