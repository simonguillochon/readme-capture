# extension-distribution Specification

## Purpose

Permet d'installer durablement dans Dia l'extension construite pour Chromium, en extension non empaquetée.

## Requirements

### Requirement: Produire des archives sans secret
La commande `npm run zip` SHALL produire l'archive `readme-capture-X.Y.Z-chrome.zip` de l'extension construite pour Chromium, et cette archive MUST ne contenir ni le fichier `.env`, ni `node_modules`, ni les sources, ni le dossier `tests`.

#### Scenario: Nominal — Archives produites
- **ÉTANT DONNÉ QUE** le dépôt est à jour et ses dépendances installées
- **LORSQUE** l'utilisatrice lance `npm run zip`
- **ALORS** le dossier `.output` contient l'archive `readme-capture-1.2.0-chrome.zip`
- **ET** l'archive contient le fichier `manifest.json` à sa racine

#### Scenario: Alternatif — Fichier .env présent
- **ÉTANT DONNÉ QUE** le fichier `.env` des tests de contrat existe à la racine du dépôt
- **LORSQUE** l'utilisatrice lance `npm run zip`
- **ALORS** l'archive de l'extension ne contient pas le fichier `.env`

### Requirement: Installer l'extension non empaquetée dans Dia
Le dossier issu de l'archive `readme-capture-X.Y.Z-chrome.zip` SHALL se charger dans Dia comme extension non empaquetée, en mode développeur, et l'extension SHALL rester installée après un redémarrage du navigateur.

#### Scenario: Nominal — Chargement du dossier de l'extension
- **ÉTANT DONNÉ QUE** l'utilisatrice a décompressé `readme-capture-1.2.0-chrome.zip` dans le dossier `Extensions/readme-capture` de son ordinateur
- **ET** le mode développeur est activé dans la page des extensions de Dia
- **LORSQUE** elle clique sur « Charger l'extension non empaquetée » et sélectionne ce dossier
- **ALORS** l'extension Readme Capture 1.2.0 apparaît dans la liste des extensions
- **ET** elle est toujours installée après le redémarrage de Dia

#### Scenario: Erreur — Archive non décompressée
- **ÉTANT DONNÉ QUE** l'utilisatrice dispose de l'archive `readme-capture-1.2.0-chrome.zip`
- **LORSQUE** elle tente de charger directement l'archive comme extension non empaquetée
- **ALORS** Dia ne propose pas l'archive à la sélection, car il attend un dossier

### Requirement: Conserver la configuration lors d'une mise à jour
Le remplacement du contenu du dossier de l'extension par une version plus récente, suivi de l'actualisation de l'extension dans Dia, SHALL conserver la connexion à Notion enregistrée et la capture en cours.

#### Scenario: Alternatif — Mise à jour vers une version supérieure
- **ÉTANT DONNÉ QUE** la version 1.2.0 est installée depuis le dossier `Extensions/readme-capture`, avec une connexion à Notion enregistrée
- **LORSQUE** l'utilisatrice remplace le contenu de ce dossier par celui de `readme-capture-1.2.1-chrome.zip` puis actualise l'extension dans la page des extensions de Dia
- **ALORS** la page des extensions affiche Readme Capture 1.2.1
- **ET** la page d'options affiche la connexion enregistrée

#### Scenario: Erreur — Mise à jour depuis un autre dossier
- **ÉTANT DONNÉ QUE** la version 1.2.0 est installée depuis le dossier `Extensions/readme-capture`, avec une connexion à Notion enregistrée
- **LORSQUE** l'utilisatrice charge la version 1.2.1 depuis le dossier `Téléchargements/readme-capture-1.2.1`
- **ALORS** Dia affiche deux extensions Readme Capture
- **ET** le panneau de la version 1.2.1 indique que la connexion à Notion n'est pas configurée
