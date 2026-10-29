# Spec Delta

## Purpose

Permet de rédiger dans le panneau la phrase de synthèse d'un contenu et de l'enregistrer dans la propriété Description de l'item Readme center.

## ADDED Requirements

### Requirement: Proposer la description une fois l'item créé
Le panneau SHALL afficher la zone « Description » uniquement après la création de l'item, entre le formulaire de l'item et la zone des extraits, avec un champ texte vide à la création.

#### Scenario: Nominal — Item créé
- **ÉTANT DONNÉ QUE** l'utilisatrice vient de créer l'item
- **LORSQUE** Notion confirme la création
- **ALORS** la zone « Description » s'affiche entre le formulaire de l'item et la zone des extraits, avec un champ vide

#### Scenario: Alternatif — Item pas encore créé
- **ÉTANT DONNÉ QUE** le panneau affiche le formulaire de préparation de l'item
- **LORSQUE** l'utilisatrice regarde le panneau
- **ALORS** aucune zone « Description » n'est affichée

### Requirement: Limiter la description à 2000 caractères
Le champ « Description » SHALL accepter au plus 2000 caractères : la saisie s'arrête à la limite et un texte collé plus long est coupé à 2000 caractères.

#### Scenario: Erreur — Coller un texte trop long
- **ÉTANT DONNÉ QUE** le champ « Description » est vide
- **LORSQUE** l'utilisatrice y colle un texte de 2500 caractères
- **ALORS** le champ contient les 2000 premiers caractères du texte

### Requirement: Afficher le compteur de caractères
Sous le champ « Description », le panneau SHALL afficher le nombre de caractères saisis et la limite, au format « <nombre> / 2000 », le nombre étant écrit au format français.

#### Scenario: Nominal — Saisie en cours
- **ÉTANT DONNÉ QUE** le champ « Description » contient 1240 caractères
- **LORSQUE** l'utilisatrice regarde le compteur
- **ALORS** le compteur affiche « 1 240 / 2000 »

#### Scenario: Alternatif — Champ vide
- **ÉTANT DONNÉ QUE** le champ « Description » est vide
- **LORSQUE** l'utilisatrice regarde le compteur
- **ALORS** le compteur affiche « 0 / 2000 »

### Requirement: Afficher le bouton d'enregistrement quand la description a changé
Le panneau SHALL afficher le bouton « Enregistrer la description » si et seulement si le texte du champ, débarrassé des espaces de début et de fin, diffère de la dernière description enregistrée.

#### Scenario: Nominal — Première saisie
- **ÉTANT DONNÉ QUE** aucune description n'a été enregistrée
- **LORSQUE** l'utilisatrice saisit « Une culture d'entreprise se lit dans les arbitrages du quotidien. »
- **ALORS** le bouton « Enregistrer la description » s'affiche

#### Scenario: Alternatif — Revenir au texte enregistré
- **ÉTANT DONNÉ QUE** la description « Une culture se lit dans les arbitrages. » est enregistrée
- **LORSQUE** l'utilisatrice modifie le texte puis le remet à « Une culture se lit dans les arbitrages. »
- **ALORS** le bouton « Enregistrer la description » n'est plus affiché

#### Scenario: Alternatif — Espaces ajoutés seulement
- **ÉTANT DONNÉ QUE** la description « Une culture se lit dans les arbitrages. » est enregistrée
- **LORSQUE** l'utilisatrice ajoute des espaces à la fin du texte
- **ALORS** le bouton « Enregistrer la description » n'est pas affiché

### Requirement: Enregistrer la description dans Notion
Au clic sur « Enregistrer la description », l'extension SHALL écrire dans la propriété Description de l'item le texte du champ en texte brut, débarrassé des espaces de début et de fin et sauts de ligne compris, en remplaçant la description précédente.

#### Scenario: Nominal — Enregistrer une description
- **ÉTANT DONNÉ QUE** le champ contient « Une culture d'entreprise se lit dans les arbitrages du quotidien. »
- **LORSQUE** l'utilisatrice clique sur « Enregistrer la description »
- **ALORS** la Description de l'item est « Une culture d'entreprise se lit dans les arbitrages du quotidien. »

#### Scenario: Alternatif — Remplacer une description
- **ÉTANT DONNÉ QUE** la Description de l'item est « Première version. »
- **LORSQUE** l'utilisatrice remplace le texte par « Version corrigée. » et clique sur « Enregistrer la description »
- **ALORS** la Description de l'item est « Version corrigée. »

#### Scenario: Alternatif — Effacer la description
- **ÉTANT DONNÉ QUE** la Description de l'item est « Première version. »
- **LORSQUE** l'utilisatrice vide le champ et clique sur « Enregistrer la description »
- **ALORS** la Description de l'item est vide

### Requirement: Empêcher un double enregistrement de la description
Pendant l'enregistrement, le bouton SHALL afficher « Enregistrement en cours… » et rester inactif jusqu'à la réponse de Notion.

#### Scenario: Alternatif — Double clic sur « Enregistrer la description »
- **ÉTANT DONNÉ QUE** le texte du champ diffère de la description enregistrée
- **LORSQUE** l'utilisatrice clique deux fois de suite sur « Enregistrer la description »
- **ALORS** le bouton affiche « Enregistrement en cours… » et reste inactif jusqu'à la réponse de Notion
- **ET** une seule mise à jour est envoyée à Notion

### Requirement: Confirmer l'enregistrement de la description
Après un enregistrement réussi, le panneau SHALL masquer le bouton, afficher le message « Description enregistrée dans Readme center » sous le champ, et masquer ce message dès que le texte diffère à nouveau de la description enregistrée.

#### Scenario: Nominal — Description enregistrée
- **ÉTANT DONNÉ QUE** l'utilisatrice a cliqué sur « Enregistrer la description »
- **LORSQUE** Notion confirme la mise à jour
- **ALORS** le message « Description enregistrée dans Readme center » s'affiche
- **ET** le bouton « Enregistrer la description » n'est plus affiché

#### Scenario: Alternatif — Nouvelle modification après un enregistrement
- **ÉTANT DONNÉ QUE** le message « Description enregistrée dans Readme center » est affiché
- **LORSQUE** l'utilisatrice modifie le texte
- **ALORS** le message n'est plus affiché
- **ET** le bouton « Enregistrer la description » s'affiche

### Requirement: Indiquer la cause d'un échec d'enregistrement de la description
Si l'enregistrement échoue, le panneau SHALL afficher sous le champ le message de la cause la plus probable selon la table d'erreurs du PRD, avec « Item introuvable dans Notion » pour toute réponse 400 ou 404, conserver le texte saisi et rendre le bouton à nouveau actif.

#### Scenario: Erreur — Item mis à la corbeille
- **ÉTANT DONNÉ QUE** l'utilisatrice a mis l'item à la corbeille dans Notion
- **LORSQUE** elle clique sur « Enregistrer la description »
- **ALORS** le message « Item introuvable dans Notion » s'affiche
- **ET** le champ contient toujours le texte saisi

#### Scenario: Erreur — Pas de réseau
- **ÉTANT DONNÉ QUE** l'ordinateur de l'utilisatrice n'a plus accès à internet
- **LORSQUE** elle clique sur « Enregistrer la description »
- **ALORS** le message « Connexion impossible » s'affiche
- **ET** le bouton « Enregistrer la description » est à nouveau actif
