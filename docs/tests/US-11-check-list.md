# US-11 — Check-list de tests manuels

Change OpenSpec : `us-11-installer-extension-signee`. Un point par scénario de la spec `extension-distribution` de ce change.

## Préparation

- Partir d'un dépôt à jour, avec les dépendances installées (`npm install`) et le fichier `.env` des tests de contrat présent à la racine.
- Construire les archives avec `npm run zip`, puis suivre la section « Installation signée » du `README.md` pour obtenir le fichier `.xpi` signé de la version 1.0.0.
- Avant d'installer la version signée, retirer de Zen la version chargée en temporaire, s'il y en a une.
- Utiliser la base « Readme center (tests) » et le jeton de son intégration pour la connexion. Ne jamais faire ces tests sur la base de production.
- Le point « Mise à jour vers une version supérieure » demande un fichier `.xpi` signé de la version 1.0.1 (voir « Mise à jour » dans le `README.md`).

## Distribution de l'extension (`extension-distribution`)

### Déclarer l'absence de collecte de données

- [ ] **Nominal — Déclaration affichée à l'installation** : installer le fichier `.xpi` signé dans Zen. La fenêtre d'installation indique que l'extension ne collecte aucune donnée.

### Produire des archives sans secret

- [ ] **Nominal — Archives produites** : lancer `npm run zip`. Le dossier `.output` contient `readme-capture-1.0.0-firefox.zip` et `readme-capture-1.0.0-sources.zip`.
- [ ] **Alternatif — Fichier .env présent** : avec le fichier `.env` à la racine, lancer `npm run zip`, puis `unzip -l .output/readme-capture-1.0.0-sources.zip`. La liste ne contient pas `.env`.

### Reconstruire l'extension depuis ses sources

- [ ] **Nominal — Reconstruction depuis l'archive des sources** : extraire `readme-capture-1.0.0-sources.zip` dans un dossier vide hors du dépôt, y lancer `npm ci` puis `npm run zip`. Extraire les deux archives `readme-capture-1.0.0-firefox.zip` (celle du dépôt et celle du dossier) et les comparer avec `diff -r` : aucune différence.

### Installer la version signée

- [ ] **Nominal — Installation depuis un fichier** : dans `about:addons`, roue dentée, « Installer un module depuis un fichier… », sélectionner le fichier `.xpi` signé. Readme Capture apparaît dans la liste des modules. Fermer puis rouvrir Zen : l'extension est toujours installée.
- [ ] **Erreur — Archive non signée** : dans `about:addons`, roue dentée, « Installer un module depuis un fichier… », sélectionner `.output/readme-capture-1.0.0-firefox.zip`. Zen refuse l'installation car le module n'est pas vérifié.

### Conserver la configuration lors d'une mise à jour

- [ ] **Alternatif — Mise à jour vers une version supérieure** : avec la version 1.0.0 installée et une connexion à Notion enregistrée, installer le fichier `.xpi` signé de la version 1.0.1. La page d'options affiche la connexion enregistrée, et le panneau ne demande pas de configurer la connexion.
