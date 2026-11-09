# US-13 — Check-list de tests manuels

Change OpenSpec : `us-13-utiliser-extension-dia`. Un point par scénario des specs de ce change, plus un parcours complet de capture dans Dia et la vérification de l'inactivité du panneau fermé.

## Préparation

- Partir d'un dépôt à jour, avec les dépendances installées (`npm install`) et le fichier `.env` des tests de contrat présent à la racine.
- Construire l'archive avec `npm run zip`, puis suivre la section « Installation dans Dia » du `README.md`, depuis le dossier fixe `Extensions/readme-capture`.
- Utiliser la base « Readme center (tests) » et le jeton de son intégration pour la connexion. Ne jamais faire ces tests sur la base de production.
- Le point « Mise à jour vers une version supérieure » et le point « Mise à jour depuis un autre dossier » demandent le contenu d'une archive `readme-capture-1.2.1-chrome.zip` : passer temporairement la version de `package.json` à `1.2.1`, lancer `npm run zip`, conserver l'archive, puis remettre la version à `1.2.0` sans committer.
- Le point « Installer depuis la release » demande que la release `v1.2.0` soit publiée.

## Panneau latéral (`side-panel`)

### Ouvrir le panneau par le bouton de l'extension

- [x] **Nominal — Ouvrir le panneau** : panneau fermé, cliquer sur le bouton de l'extension dans la barre d'outils de Dia. Le panneau de l'extension s'affiche à côté de la page.

### Fermer le panneau depuis le navigateur

- [x] **Alternatif — Fermer le panneau** : panneau ouvert, le fermer avec la commande de fermeture du panneau latéral de Dia. Le panneau de l'extension se ferme, et la page occupe de nouveau toute la largeur de la fenêtre.

## Session de capture (`capture-session`)

### Conserver la capture en cours dès la création de l'item

- [x] **Nominal — Fermer puis rouvrir le panneau** : créer l'item « What a workplace can't promise », ajouter deux extraits sous « Le constat » et saisir une description sans l'enregistrer. Fermer puis rouvrir le panneau. Le panneau affiche l'item et son lien « Ouvrir dans Notion », la liste affiche les deux extraits sous « Le constat », et le champ « Description » contient le texte saisi.
- [x] **Alternatif — Redémarrer Dia** : une capture étant en cours, quitter Dia, le relancer et ouvrir le panneau. La capture reprend telle qu'elle était.
- [x] **Alternatif — Modification de métadonnée non enregistrée** : déplier le formulaire et remplacer l'auteur sans l'enregistrer. Fermer puis rouvrir le panneau. Le formulaire est déplié avec l'auteur modifié, et le bouton « Enregistrer les modifications » est affiché.

## Connexion à Notion (`notion-connection`)

### Conserver la configuration localement

- [x] **Nominal — Configuration conservée après redémarrage** : enregistrer une configuration vérifiée, redémarrer Dia et rouvrir la page d'options. La configuration enregistrée est toujours présente.

## Distribution de l'extension (`extension-distribution`)

### Installer l'extension non empaquetée dans Dia

- [x] **Nominal — Chargement du dossier de l'extension** : décompresser `readme-capture-1.2.0-chrome.zip` dans `Extensions/readme-capture`, activer le mode développeur dans la page des extensions de Dia, cliquer sur « Charger l'extension non empaquetée » et sélectionner ce dossier. Readme Capture 1.2.0 apparaît dans la liste des extensions, et elle est toujours installée après le redémarrage de Dia.
- [x] **Erreur — Archive non décompressée** : cliquer sur « Charger l'extension non empaquetée » et tenter de choisir directement `readme-capture-1.2.0-chrome.zip`. Dia ne propose pas l'archive à la sélection, car il attend un dossier.

### Produire des archives sans secret

- [x] **Nominal — Archives produites** : lancer `npm run zip`. Le dossier `.output` contient `readme-capture-1.2.0-chrome.zip`, et `unzip -l` montre `manifest.json` à la racine de l'archive.
- [x] **Alternatif — Fichier .env présent** : le fichier `.env` existant à la racine du dépôt, lancer `npm run zip`. `unzip -l` montre que l'archive ne contient pas `.env`.

### Conserver la configuration lors d'une mise à jour

- [x] **Alternatif — Mise à jour vers une version supérieure** : la version 1.2.0 étant installée depuis `Extensions/readme-capture` avec une connexion enregistrée, remplacer le contenu de ce dossier par celui de `readme-capture-1.2.1-chrome.zip`, puis actualiser l'extension dans la page des extensions de Dia. La page des extensions affiche Readme Capture 1.2.1, et la page d'options affiche la connexion enregistrée.
- [x] **Erreur — Mise à jour depuis un autre dossier** : la version 1.2.0 étant installée depuis `Extensions/readme-capture` avec une connexion enregistrée, charger la version 1.2.1 depuis `Téléchargements/readme-capture-1.2.1`. Dia affiche deux extensions Readme Capture, et le panneau de la version 1.2.1 indique que la connexion à Notion n'est pas configurée. Retirer ensuite cette seconde extension.

## Release continue (`continuous-release`)

### Joindre l'archive de l'extension pour Chromium

- [x] **Nominal — Installer depuis la release** : la release `v1.2.0` étant publiée, vérifier que le seul fichier joint par le workflow est `readme-capture-1.2.0-chrome.zip` (en plus des archives du code source ajoutées par GitHub). Le télécharger, le décompresser dans le dossier de l'extension et la charger dans Dia. L'extension Readme Capture 1.2.0 est installée.

### Protéger les secrets dans le dépôt public

- [x] **Erreur — Secret dans les journaux** : depuis une fenêtre de navigation privée, sans être connecté à GitHub, ouvrir le journal d'une exécution qui a lancé les tests de contrat. Rechercher dans le journal du job `contract` les premiers caractères du jeton Notion et de l'ID de la base de test : aucune valeur n'apparaît en clair ; une valeur affichée apparaît sous la forme `***`.

## Parcours complet de capture dans Dia

- [x] **Pré-remplissage** : ouvrir un article dans un onglet, puis ouvrir le panneau. Le titre, l'URL nettoyée et l'auteur sont pré-remplis.
- [x] **Création** : choisir la langue et au moins un thème, puis cliquer sur « Ajouter ». L'item est créé dans la base « Readme center (tests) », et le panneau affiche son lien « Ouvrir dans Notion ».
- [x] **Extrait avec surlignage** : sélectionner un passage dans la page, vérifier son aperçu dans le panneau, choisir une section, puis cliquer sur « Ajouter l'extrait ». La citation est écrite dans la page Notion, et le passage est surligné dans la page, sur fond vermillon pâle.
- [x] **Description** : rédiger la description et l'enregistrer. La propriété Description de l'item est à jour dans Notion.
- [x] **Terminer** : cliquer sur « Terminer ». La capture se clôt, et le panneau est prêt pour un nouvel item.
- [x] **Mode sombre** : passer le système en mode sombre, panneau ouvert. Le panneau suit le mode sombre et reste lisible dans le panneau latéral de Dia.

## Inactivité du panneau fermé

- [x] **Alternatif — Navigation avec le panneau fermé** : panneau fermé, charger https://example.com. La page s'affiche sans aucun élément ni script ajouté par l'extension (inspecteur : aucun élément ni script injecté ; onglet *Sources* : aucun script de contenu de Readme Capture).
