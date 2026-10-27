# Spec Delta

## Purpose

Crée dans Readme center l'item préparé dans le panneau, avec ses métadonnées, et prévient l'utilisatrice quand le contenu figure déjà dans la base.

## ADDED Requirements

### Requirement: Créer l'item avec ses métadonnées
Au clic sur « Ajouter », l'extension SHALL créer dans la base Readme center un item dont Title vaut « Titre », URL vaut « URL », Source vaut « Auteur » et Theme contient les thèmes choisis, avec un corps de page et une Description vides, et sans renseigner Type.

#### Scenario: Nominal — Créer un item complet
- **ÉTANT DONNÉ QUE** le formulaire contient le titre « What a workplace can't promise », l'URL « https://exemple.substack.com/p/un-article » et l'auteur « Camille Martin »
- **ET** l'utilisatrice a choisi la langue 🇬🇧 Anglais et les thèmes « Management » et « Strategy »
- **LORSQUE** elle clique sur « Ajouter »
- **ALORS** un item est créé dans Readme center
- **ET** son Title est « What a workplace can't promise »
- **ET** son URL est « https://exemple.substack.com/p/un-article »
- **ET** sa Source est « Camille Martin »
- **ET** son Theme contient « Management » et « Strategy »
- **ET** sa Description et le corps de sa page sont vides

### Requirement: Renseigner le profil LinkedIn de l'auteur s'il est connu
L'extension SHALL renseigner la propriété LinkedIn auteur avec la valeur de « LinkedIn de l'auteur » si ce champ est rempli, et la laisser vide sinon.

#### Scenario: Nominal — Profil LinkedIn renseigné
- **ÉTANT DONNÉ QUE** « LinkedIn de l'auteur » contient « https://www.linkedin.com/in/camille-martin-exemple »
- **LORSQUE** l'utilisatrice clique sur « Ajouter »
- **ALORS** la propriété LinkedIn auteur de l'item créé est « https://www.linkedin.com/in/camille-martin-exemple »

#### Scenario: Alternatif — Profil LinkedIn vide
- **ÉTANT DONNÉ QUE** « LinkedIn de l'auteur » est vide
- **LORSQUE** l'utilisatrice clique sur « Ajouter »
- **ALORS** la propriété LinkedIn auteur de l'item créé est vide

### Requirement: Porter la langue par l'icône de la page
L'extension SHALL donner à la page de l'item l'icône 🇫🇷 pour Français, 🇬🇧 pour Anglais ou 🇪🇸 pour Espagnol, selon la langue choisie.

#### Scenario: Nominal — Contenu en français
- **ÉTANT DONNÉ QUE** l'utilisatrice a choisi la langue 🇫🇷 Français
- **LORSQUE** elle clique sur « Ajouter »
- **ALORS** la page de l'item créé a l'icône 🇫🇷

#### Scenario: Alternatif — Contenu en espagnol
- **ÉTANT DONNÉ QUE** l'utilisatrice a choisi la langue 🇪🇸 Espagnol
- **LORSQUE** elle clique sur « Ajouter »
- **ALORS** la page de l'item créé a l'icône 🇪🇸

### Requirement: Dater l'item du jour de la capture
L'extension SHALL renseigner la propriété Date avec la date du jour de la création, selon le fuseau horaire de l'ordinateur de l'utilisatrice, sans heure.

#### Scenario: Nominal — Capture en soirée
- **ÉTANT DONNÉ QUE** l'ordinateur de l'utilisatrice est à l'heure de Paris et qu'il est 23 h 30 le 27 octobre 2026
- **LORSQUE** elle clique sur « Ajouter »
- **ALORS** la Date de l'item créé est le 27/10/2026, sans heure

### Requirement: Empêcher une double création pendant l'envoi
Pendant la création, le bouton « Ajouter » SHALL afficher « Ajout en cours… » et rester inactif jusqu'à la réponse de Notion.

#### Scenario: Alternatif — Double clic sur « Ajouter »
- **ÉTANT DONNÉ QUE** le formulaire est valide
- **LORSQUE** l'utilisatrice clique deux fois de suite sur « Ajouter »
- **ALORS** le bouton affiche « Ajout en cours… » et reste inactif jusqu'à la réponse de Notion
- **ET** un seul item est créé dans Readme center

### Requirement: Confirmer la création
Après la création, le panneau SHALL afficher le message « Item créé dans Readme center », un lien « Ouvrir dans Notion » vers la page de l'item, et SHALL ne plus afficher le bouton « Ajouter ».

#### Scenario: Nominal — Item créé
- **ÉTANT DONNÉ QUE** l'utilisatrice a cliqué sur « Ajouter »
- **LORSQUE** Notion confirme la création de l'item
- **ALORS** le message « Item créé dans Readme center » s'affiche
- **ET** le lien « Ouvrir dans Notion » s'affiche
- **ET** le bouton « Ajouter » n'est plus affiché

#### Scenario: Nominal — Ouvrir l'item créé
- **ÉTANT DONNÉ QUE** le panneau affiche le message « Item créé dans Readme center »
- **LORSQUE** l'utilisatrice clique sur « Ouvrir dans Notion »
- **ALORS** la page de l'item s'ouvre dans un nouvel onglet

### Requirement: Indiquer la cause d'un échec de création
Si la création échoue, le panneau SHALL afficher le message de la cause la plus probable selon la table d'erreurs du PRD, conserver toutes les valeurs du formulaire et rendre le bouton « Ajouter » à nouveau actif.

#### Scenario: Erreur — Pas de réseau au moment de la création
- **ÉTANT DONNÉ QUE** le formulaire est valide et l'ordinateur de l'utilisatrice n'a plus accès à internet
- **LORSQUE** elle clique sur « Ajouter »
- **ALORS** le message « Connexion impossible » s'affiche
- **ET** le formulaire contient toujours les valeurs saisies
- **ET** le bouton « Ajouter » est à nouveau actif
- **ET** aucun item n'est créé

#### Scenario: Erreur — Jeton révoqué
- **ÉTANT DONNÉ QUE** le jeton enregistré a été révoqué dans Notion
- **LORSQUE** l'utilisatrice clique sur « Ajouter »
- **ALORS** le message « Jeton Notion invalide » s'affiche
- **ET** le formulaire contient toujours les valeurs saisies

### Requirement: Avertir d'un doublon avant la création
Avant la création, chaque fois que « URL » reçoit une URL valide, par pré-remplissage ou en quittant le champ, le panneau SHALL chercher dans Readme center un item dont l'URL est exactement identique, et, s'il en existe un, afficher sous « URL » l'avertissement « Cette URL existe déjà dans Readme center » avec un lien « Ouvrir l'item existant », sans désactiver « Ajouter ».

#### Scenario: Nominal — URL déjà présente dans la base
- **ÉTANT DONNÉ QUE** Readme center contient un item dont l'URL est « https://exemple.substack.com/p/un-article »
- **LORSQUE** l'utilisatrice ouvre le panneau sur « https://exemple.substack.com/p/un-article?utm_source=email »
- **ALORS** l'avertissement « Cette URL existe déjà dans Readme center » s'affiche sous « URL »
- **ET** le lien « Ouvrir l'item existant » s'affiche
- **ET** le bouton « Ajouter » reste actif si le formulaire est valide

#### Scenario: Nominal — Ouvrir l'item existant
- **ÉTANT DONNÉ QUE** l'avertissement de doublon est affiché
- **LORSQUE** l'utilisatrice clique sur « Ouvrir l'item existant »
- **ALORS** la page de l'item existant s'ouvre dans un nouvel onglet

#### Scenario: Alternatif — Créer malgré le doublon
- **ÉTANT DONNÉ QUE** l'avertissement de doublon est affiché et le formulaire est valide
- **LORSQUE** l'utilisatrice clique sur « Ajouter »
- **ALORS** un nouvel item est créé dans Readme center

#### Scenario: Alternatif — Variante d'URL non reconnue comme doublon
- **ÉTANT DONNÉ QUE** Readme center contient un item dont l'URL est « https://exemple.com/blog/un-article »
- **LORSQUE** l'utilisatrice ouvre le panneau sur « https://www.exemple.com/blog/un-article »
- **ALORS** aucun avertissement de doublon ne s'affiche

#### Scenario: Alternatif — URL corrigée après un doublon
- **ÉTANT DONNÉ QUE** l'avertissement de doublon est affiché
- **LORSQUE** l'utilisatrice remplace l'URL par une URL absente de Readme center et quitte le champ
- **ALORS** l'avertissement de doublon disparaît

### Requirement: Ignorer l'échec de la recherche de doublon
Si la recherche de doublon échoue, le panneau SHALL n'afficher ni avertissement ni message d'erreur, et la création SHALL rester possible.

#### Scenario: Erreur — Notion indisponible pendant la recherche de doublon
- **ÉTANT DONNÉ QUE** Notion répond par une erreur serveur à la recherche de doublon
- **LORSQUE** l'utilisatrice ouvre le panneau sur un article
- **ALORS** aucun avertissement ni message d'erreur ne s'affiche
- **ET** le bouton « Ajouter » est actif dès que le formulaire est valide
