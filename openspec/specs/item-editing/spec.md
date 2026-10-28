# item-editing Specification

## Purpose

Permet de corriger depuis le panneau les métadonnées d'un item déjà créé dans Readme center, et d'enregistrer ces corrections dans Notion.

## Requirements

### Requirement: Garder les métadonnées modifiables après la création
Après la création de l'item, les champs « Titre », « URL », « Auteur », « LinkedIn de l'auteur », « Langue » et « Thèmes » SHALL rester modifiables, avec les mêmes règles de saisie et de nettoyage qu'avant la création.

#### Scenario: Nominal — Corriger le titre après la création
- **ÉTANT DONNÉ QUE** l'item « What a workplace can't promise » a été créé
- **LORSQUE** l'utilisatrice remplace le titre par « TBM 444 — What a workplace can't promise »
- **ALORS** le champ « Titre » contient « TBM 444 — What a workplace can't promise »

#### Scenario: Alternatif — Coller une URL à nettoyer après la création
- **ÉTANT DONNÉ QUE** l'item a été créé
- **LORSQUE** l'utilisatrice colle « https://exemple.com/blog/un-article?utm_source=x » dans « URL » et quitte le champ
- **ALORS** le champ « URL » contient « https://exemple.com/blog/un-article »

### Requirement: Afficher le bouton d'enregistrement quand un champ a changé
Après la création, le panneau SHALL afficher le bouton « Enregistrer les modifications » à l'emplacement de l'ancien bouton « Ajouter » si et seulement si au moins un champ diffère des dernières valeurs enregistrées dans Notion.

#### Scenario: Nominal — Modifier un thème
- **ÉTANT DONNÉ QUE** l'item a été créé avec le thème « Management »
- **LORSQUE** l'utilisatrice coche aussi le thème « Strategy »
- **ALORS** le bouton « Enregistrer les modifications » s'affiche

#### Scenario: Alternatif — Revenir à la valeur enregistrée
- **ÉTANT DONNÉ QUE** l'item a été créé avec la langue 🇬🇧 Anglais
- **ET** l'utilisatrice a choisi 🇫🇷 Français, ce qui a fait apparaître le bouton « Enregistrer les modifications »
- **LORSQUE** elle choisit à nouveau 🇬🇧 Anglais
- **ALORS** le bouton « Enregistrer les modifications » n'est plus affiché

### Requirement: Activer l'enregistrement uniquement si le formulaire est valide
Le bouton « Enregistrer les modifications » SHALL être actif si et seulement si le formulaire respecte les règles de validité de la création : « Titre » et « Auteur » non vides, « URL » valide, « LinkedIn de l'auteur » vide ou valide, une langue et au moins un thème choisis.

#### Scenario: Erreur — Titre effacé
- **ÉTANT DONNÉ QUE** l'item a été créé
- **LORSQUE** l'utilisatrice efface entièrement le titre
- **ALORS** le bouton « Enregistrer les modifications » est affiché mais inactif

#### Scenario: Erreur — Dernier thème décoché
- **ÉTANT DONNÉ QUE** l'item a été créé avec le seul thème « Management »
- **LORSQUE** l'utilisatrice décoche « Management »
- **ALORS** le bouton « Enregistrer les modifications » est affiché mais inactif

### Requirement: Enregistrer uniquement les propriétés modifiées
Au clic sur « Enregistrer les modifications », l'extension SHALL mettre à jour dans Readme center uniquement les propriétés dont le champ a changé depuis le dernier enregistrement, parmi Title, URL, Source, LinkedIn auteur, Theme et l'icône de la page, et SHALL ne jamais modifier la Date.

#### Scenario: Nominal — Corriger l'auteur
- **ÉTANT DONNÉ QUE** l'item a été créé avec l'auteur « C. Martin »
- **LORSQUE** l'utilisatrice remplace l'auteur par « Camille Martin » et clique sur « Enregistrer les modifications »
- **ALORS** la Source de l'item est « Camille Martin »
- **ET** les autres propriétés de l'item, dont la Date, sont inchangées

#### Scenario: Alternatif — Changer la langue
- **ÉTANT DONNÉ QUE** l'item a été créé avec la langue 🇬🇧 Anglais
- **LORSQUE** l'utilisatrice choisit 🇫🇷 Français et clique sur « Enregistrer les modifications »
- **ALORS** la page de l'item a l'icône 🇫🇷

#### Scenario: Alternatif — Effacer le profil LinkedIn
- **ÉTANT DONNÉ QUE** l'item a été créé avec le profil « https://www.linkedin.com/in/camille-martin-exemple »
- **LORSQUE** l'utilisatrice vide « LinkedIn de l'auteur » et clique sur « Enregistrer les modifications »
- **ALORS** le LinkedIn auteur de l'item est vide

#### Scenario: Alternatif — Remplacer les thèmes
- **ÉTANT DONNÉ QUE** l'item a été créé avec les thèmes « Management » et « Strategy »
- **LORSQUE** l'utilisatrice décoche « Strategy », coche « Design » et clique sur « Enregistrer les modifications »
- **ALORS** le Theme de l'item contient exactement « Management » et « Design »

### Requirement: Empêcher un double enregistrement pendant l'envoi
Pendant l'enregistrement, le bouton SHALL afficher « Enregistrement en cours… » et rester inactif jusqu'à la réponse de Notion.

#### Scenario: Alternatif — Double clic sur « Enregistrer les modifications »
- **ÉTANT DONNÉ QUE** un champ a été modifié et le formulaire est valide
- **LORSQUE** l'utilisatrice clique deux fois de suite sur « Enregistrer les modifications »
- **ALORS** le bouton affiche « Enregistrement en cours… » et reste inactif jusqu'à la réponse de Notion
- **ET** une seule mise à jour est envoyée à Notion

### Requirement: Confirmer l'enregistrement
Après un enregistrement réussi, le panneau SHALL masquer le bouton « Enregistrer les modifications », afficher le message « Modifications enregistrées dans Readme center » au-dessus du lien « Ouvrir dans Notion », et masquer ce message dès qu'un champ diffère à nouveau des valeurs enregistrées.

#### Scenario: Nominal — Modifications enregistrées
- **ÉTANT DONNÉ QUE** l'utilisatrice a modifié le titre
- **LORSQUE** elle clique sur « Enregistrer les modifications » et Notion confirme la mise à jour
- **ALORS** le message « Modifications enregistrées dans Readme center » s'affiche
- **ET** le bouton « Enregistrer les modifications » n'est plus affiché
- **ET** le lien « Ouvrir dans Notion » reste affiché

#### Scenario: Alternatif — Nouvelle modification après un enregistrement
- **ÉTANT DONNÉ QUE** le message « Modifications enregistrées dans Readme center » est affiché
- **LORSQUE** l'utilisatrice modifie l'auteur
- **ALORS** le message « Modifications enregistrées dans Readme center » n'est plus affiché
- **ET** le bouton « Enregistrer les modifications » s'affiche

### Requirement: Indiquer la cause d'un échec d'enregistrement
Si l'enregistrement échoue, le panneau SHALL afficher le message de la cause la plus probable selon la table d'erreurs du PRD, avec « Item introuvable dans Notion » si l'item a été supprimé ou mis à la corbeille, conserver toutes les valeurs du formulaire et rendre le bouton à nouveau actif.

#### Scenario: Erreur — Item mis à la corbeille dans Notion
- **ÉTANT DONNÉ QUE** l'utilisatrice a mis l'item à la corbeille dans Notion après sa création
- **LORSQUE** elle modifie le titre dans le panneau et clique sur « Enregistrer les modifications »
- **ALORS** le message « Item introuvable dans Notion » s'affiche
- **ET** le formulaire contient toujours les valeurs saisies
- **ET** le bouton « Enregistrer les modifications » est à nouveau actif

#### Scenario: Erreur — Pas de réseau au moment de l'enregistrement
- **ÉTANT DONNÉ QUE** un champ a été modifié et l'ordinateur de l'utilisatrice n'a plus accès à internet
- **LORSQUE** elle clique sur « Enregistrer les modifications »
- **ALORS** le message « Connexion impossible » s'affiche
- **ET** le formulaire contient toujours les valeurs saisies

### Requirement: Ne pas détecter de doublon après la création
Une fois l'item créé, le panneau SHALL ne lancer aucune recherche de doublon et SHALL n'afficher aucun avertissement de doublon, même si l'URL modifiée existe déjà dans Readme center.

#### Scenario: Alternatif — URL modifiée vers un contenu déjà présent
- **ÉTANT DONNÉ QUE** l'item a été créé
- **ET** Readme center contient un autre item dont l'URL est « https://exemple.com/blog/deja-lu »
- **LORSQUE** l'utilisatrice saisit « https://exemple.com/blog/deja-lu » dans « URL » et quitte le champ
- **ALORS** aucun avertissement de doublon ne s'affiche
- **ET** le bouton « Enregistrer les modifications » s'affiche
