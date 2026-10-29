# Spec Delta

## Purpose

Accompagne chaque erreur Notion du panneau de l'action qui permet d'y remédier, et absorbe automatiquement les limitations temporaires de Notion.

## ADDED Requirements

### Requirement: Proposer « Réessayer » pour une erreur passagère
Quand une action du panneau échoue sur « Connexion impossible », « Notion ne répond pas » ou « La base Notion a changé », le panneau SHALL afficher sous le message un bouton « Réessayer » qui relance la même action avec les mêmes données.

#### Scenario: Nominal — Réessayer une création après une coupure réseau
- **ÉTANT DONNÉ QUE** la création de l'item a échoué sur « Connexion impossible »
- **ET** l'ordinateur de l'utilisatrice a retrouvé l'accès à internet
- **LORSQUE** elle clique sur « Réessayer »
- **ALORS** l'item est créé avec les valeurs du formulaire
- **ET** le message d'erreur n'est plus affiché

#### Scenario: Erreur — Réessayer sans succès
- **ÉTANT DONNÉ QUE** l'ajout d'un extrait a échoué sur « Notion ne répond pas »
- **LORSQUE** l'utilisatrice clique sur « Réessayer » et que Notion ne répond toujours pas
- **ALORS** le message « Notion ne répond pas » et le bouton « Réessayer » restent affichés
- **ET** l'extrait n'est pas ajouté à la liste

### Requirement: Renvoyer vers la page d'options pour une configuration à corriger
Quand une action du panneau échoue sur « Jeton Notion invalide » ou « Base inaccessible », le panneau SHALL afficher sous le message un lien « Ouvrir la page d'options », sans bouton « Réessayer ».

#### Scenario: Nominal — Jeton révoqué pendant une capture
- **ÉTANT DONNÉ QUE** le jeton enregistré a été révoqué dans Notion
- **LORSQUE** l'enregistrement de la description échoue sur « Jeton Notion invalide »
- **ALORS** le lien « Ouvrir la page d'options » s'affiche sous le message
- **ET** aucun bouton « Réessayer » n'est affiché

#### Scenario: Nominal — Ouvrir les options depuis l'erreur
- **ÉTANT DONNÉ QUE** le lien « Ouvrir la page d'options » est affiché sous une erreur
- **LORSQUE** l'utilisatrice clique dessus
- **ALORS** la page d'options de l'extension s'ouvre
- **ET** le texte saisi dans le panneau est conservé

### Requirement: Prendre en compte une configuration corrigée
Quand la configuration enregistrée change pendant que le panneau est ouvert, le panneau SHALL utiliser la nouvelle configuration pour les actions suivantes, et SHALL abandonner la capture en cours pour revenir au formulaire de préparation si la nouvelle configuration désigne une autre base.

#### Scenario: Nominal — Nouveau jeton pour la même base
- **ÉTANT DONNÉ QUE** l'enregistrement d'une métadonnée a échoué sur « Jeton Notion invalide »
- **ET** l'utilisatrice a enregistré un nouveau jeton valide pour la même base dans la page d'options
- **LORSQUE** elle clique à nouveau sur « Enregistrer les modifications » dans le panneau
- **ALORS** la modification est enregistrée dans Notion

#### Scenario: Alternatif — Autre base enregistrée
- **ÉTANT DONNÉ QUE** une capture est en cours sur la base Readme center
- **LORSQUE** l'utilisatrice enregistre l'URL d'une autre base dans la page d'options, panneau ouvert
- **ALORS** le panneau affiche le formulaire de préparation, pré-rempli depuis l'onglet actif

### Requirement: Recharger les thèmes après un échec de lecture
Quand la lecture des thèmes échoue sur « Connexion impossible », « Notion ne répond pas » ou « La base Notion a changé », le panneau SHALL afficher sous le message un bouton « Recharger les thèmes » qui relit la liste des thèmes dans Notion.

#### Scenario: Nominal — Recharger après une coupure réseau
- **ÉTANT DONNÉ QUE** la lecture des thèmes a échoué sur « Connexion impossible »
- **ET** l'ordinateur de l'utilisatrice a retrouvé l'accès à internet
- **LORSQUE** elle clique sur « Recharger les thèmes »
- **ALORS** le champ « Thèmes » propose les thèmes de la base
- **ET** le message d'erreur n'est plus affiché

#### Scenario: Alternatif — Propriété Theme rétablie
- **ÉTANT DONNÉ QUE** la lecture des thèmes a échoué sur « La base Notion a changé »
- **ET** l'utilisatrice a rétabli la propriété Theme dans Notion
- **LORSQUE** elle clique sur « Recharger les thèmes »
- **ALORS** le champ « Thèmes » propose les thèmes de la base

### Requirement: Proposer de terminer une capture dont l'item n'existe plus
Quand l'enregistrement des métadonnées, l'ajout d'un extrait ou l'enregistrement de la description échoue sur « Item introuvable dans Notion », le panneau SHALL afficher sous le message un bouton « Terminer la capture » qui termine la capture sans demander de confirmation.

#### Scenario: Nominal — Item mis à la corbeille avec une description en cours
- **ÉTANT DONNÉ QUE** l'utilisatrice a mis l'item à la corbeille dans Notion
- **ET** l'enregistrement de la description a échoué sur « Item introuvable dans Notion »
- **LORSQUE** elle clique sur « Terminer la capture »
- **ALORS** le panneau affiche le formulaire de préparation, pré-rempli depuis l'onglet actif
- **ET** aucun message de confirmation ne s'affiche

### Requirement: Ne pas proposer de terminer pour un extrait introuvable
Quand la modification d'un extrait échoue sur « Item introuvable dans Notion », le panneau SHALL afficher le message sans bouton « Terminer la capture » ni « Réessayer ».

#### Scenario: Alternatif — Extrait supprimé directement dans Notion
- **ÉTANT DONNÉ QUE** l'utilisatrice a supprimé une citation directement dans Notion
- **LORSQUE** la modification de cet extrait échoue sur « Item introuvable dans Notion »
- **ALORS** le message s'affiche sous l'extrait, sans bouton « Terminer la capture » ni « Réessayer »
- **ET** après « Annuler », les actions « Modifier » et « Supprimer » de l'extrait restent disponibles

### Requirement: Réessayer automatiquement en cas de limitation
Quand Notion limite les appels pendant une action du panneau, l'extension SHALL afficher « Notion limite les appels » et relancer automatiquement l'action après le délai indiqué par Notion, ou après 1 seconde s'il n'en indique pas, au plus 3 fois, puis SHALL afficher ce message avec un bouton « Réessayer » si la limitation persiste.

#### Scenario: Nominal — Limitation passagère pendant un ajout d'extrait
- **ÉTANT DONNÉ QUE** Notion limite les appels et demande d'attendre 2 secondes
- **LORSQUE** l'utilisatrice clique sur « Ajouter l'extrait »
- **ALORS** le message « Notion limite les appels » s'affiche
- **ET** l'ajout est relancé automatiquement après 2 secondes
- **ET** l'extrait est ajouté dès que Notion l'accepte

#### Scenario: Erreur — Limitation persistante
- **ÉTANT DONNÉ QUE** Notion limite les appels à chaque tentative, sans indiquer de délai
- **LORSQUE** l'utilisatrice clique sur « Enregistrer la description »
- **ALORS** l'extension réessaie 3 fois, à 1 seconde d'intervalle
- **ET** le message « Notion limite les appels » s'affiche ensuite avec un bouton « Réessayer »

### Requirement: Conserver la saisie pendant la reprise
Pendant les réessais et après un échec, le panneau SHALL conserver toutes les valeurs saisies, et le bouton de l'action concernée SHALL rester inactif tant qu'un réessai est en cours.

#### Scenario: Alternatif — Réessai en cours
- **ÉTANT DONNÉ QUE** l'utilisatrice a cliqué sur « Réessayer » après l'échec de l'enregistrement des métadonnées
- **LORSQUE** Notion n'a pas encore répondu
- **ALORS** le formulaire contient toujours les valeurs saisies
- **ET** les boutons « Réessayer » et « Enregistrer les modifications » sont inactifs
