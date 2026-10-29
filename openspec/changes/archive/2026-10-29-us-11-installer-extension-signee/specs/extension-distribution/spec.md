# Spec Delta

## Purpose

Permet d'installer durablement dans Zen une version de l'extension signée par Mozilla en distribution non listée.

## ADDED Requirements

### Requirement: Déclarer l'absence de collecte de données
Le manifeste de l'extension SHALL déclarer qu'elle ne collecte aucune donnée, avec `data_collection_permissions` réglé sur `required: ["none"]` et aucune catégorie facultative.

#### Scenario: Nominal — Déclaration affichée à l'installation
- **ÉTANT DONNÉ QUE** l'utilisatrice dispose du fichier `.xpi` signé de l'extension
- **LORSQUE** elle l'installe dans Zen
- **ALORS** la fenêtre d'installation indique que l'extension ne collecte aucune donnée

### Requirement: Produire des archives sans secret
La commande `npm run zip` SHALL produire l'archive de l'extension et l'archive de ses sources, et l'archive des sources MUST ne contenir ni le fichier `.env`, ni `node_modules`, ni `.output`, ni le dossier `tests/contract/.karate`.

#### Scenario: Nominal — Archives produites
- **ÉTANT DONNÉ QUE** le dépôt est à jour et ses dépendances installées
- **LORSQUE** l'utilisatrice lance `npm run zip`
- **ALORS** le dossier `.output` contient l'archive `readme-capture-1.0.0-firefox.zip`
- **ET** il contient l'archive `readme-capture-1.0.0-sources.zip`

#### Scenario: Alternatif — Fichier .env présent
- **ÉTANT DONNÉ QUE** le fichier `.env` des tests de contrat existe à la racine du dépôt
- **LORSQUE** l'utilisatrice lance `npm run zip`
- **ALORS** l'archive des sources ne contient pas le fichier `.env`

### Requirement: Reconstruire l'extension depuis ses sources
L'archive des sources SHALL suffire à reconstruire une archive de l'extension identique, avec `npm ci` puis `npm run zip`, comme l'exige la revue de Mozilla pour un code compilé.

#### Scenario: Nominal — Reconstruction depuis l'archive des sources
- **ÉTANT DONNÉ QUE** l'archive des sources est extraite dans un dossier vide
- **LORSQUE** l'utilisatrice y lance `npm ci` puis `npm run zip`
- **ALORS** l'archive de l'extension produite a le même contenu que celle produite depuis le dépôt

### Requirement: Installer la version signée
Le fichier `.xpi` signé SHALL s'installer dans Zen depuis le gestionnaire de modules, et l'extension SHALL rester installée après un redémarrage du navigateur.

#### Scenario: Nominal — Installation depuis un fichier
- **ÉTANT DONNÉ QUE** l'utilisatrice a téléchargé le fichier `.xpi` signé depuis addons.mozilla.org
- **LORSQUE** elle choisit « Installer un module depuis un fichier… » dans `about:addons` et sélectionne ce fichier
- **ALORS** l'extension Readme Capture apparaît dans la liste des modules
- **ET** elle est toujours installée après le redémarrage de Zen

#### Scenario: Erreur — Archive non signée
- **ÉTANT DONNÉ QUE** l'utilisatrice dispose de l'archive `readme-capture-1.0.0-firefox.zip` non signée
- **LORSQUE** elle tente de l'installer depuis `about:addons`
- **ALORS** Zen refuse l'installation car le module n'est pas vérifié

### Requirement: Conserver la configuration lors d'une mise à jour
L'installation d'une version signée plus récente SHALL conserver la connexion à Notion enregistrée et la capture en cours.

#### Scenario: Alternatif — Mise à jour vers une version supérieure
- **ÉTANT DONNÉ QUE** la version 1.0.0 est installée avec une connexion à Notion enregistrée
- **LORSQUE** l'utilisatrice installe le fichier `.xpi` signé de la version 1.0.1
- **ALORS** la page d'options affiche la connexion enregistrée
- **ET** le panneau ne demande pas de configurer la connexion
