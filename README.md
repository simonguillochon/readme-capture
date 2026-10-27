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
