# Spec Delta

## Purpose

Garantit que la capture en cours survit à la fermeture du panneau ou du navigateur, et permet de la clore pour passer au contenu suivant.

## ADDED Requirements

### Requirement: Conserver la capture dès la création de l'item
Dès la création de l'item et à chaque changement ensuite, l'extension SHALL conserver dans son stockage local la capture en cours : l'item, les valeurs des métadonnées enregistrées et en cours, les sections, les extraits, la section pré-sélectionnée, le texte de la description enregistré et en cours, et l'état replié ou déplié du formulaire.

#### Scenario: Nominal — Fermer puis rouvrir le panneau
- **ÉTANT DONNÉ QUE** l'utilisatrice a créé l'item « What a workplace can't promise », ajouté deux extraits sous « Le constat » et saisi une description sans l'enregistrer
- **LORSQUE** elle ferme puis rouvre le panneau
- **ALORS** le panneau affiche l'item « What a workplace can't promise » et son lien « Ouvrir dans Notion »
- **ET** la liste affiche les deux extraits sous « Le constat »
- **ET** le champ « Description » contient le texte saisi

#### Scenario: Alternatif — Redémarrer Zen
- **ÉTANT DONNÉ QUE** une capture est en cours
- **LORSQUE** l'utilisatrice quitte Zen, le relance et ouvre le panneau
- **ALORS** la capture reprend telle qu'elle était

#### Scenario: Alternatif — Modification de métadonnée non enregistrée
- **ÉTANT DONNÉ QUE** l'utilisatrice a déplié le formulaire et remplacé l'auteur sans l'enregistrer
- **LORSQUE** elle ferme puis rouvre le panneau
- **ALORS** le formulaire est déplié avec l'auteur modifié
- **ET** le bouton « Enregistrer les modifications » est affiché

### Requirement: Ne pas pré-remplir une capture reprise
À la reprise d'une capture, le panneau SHALL afficher les valeurs conservées et SHALL ne pré-remplir aucun champ depuis l'onglet actif.

#### Scenario: Nominal — Reprendre sur un autre onglet
- **ÉTANT DONNÉ QUE** une capture est en cours sur un premier article
- **LORSQUE** l'utilisatrice ouvre le panneau sur l'onglet d'un second article
- **ALORS** le panneau affiche la capture du premier article, sans aucune valeur du second

### Requirement: Ne pas reprendre l'état éphémère
À la reprise d'une capture, le panneau SHALL ne restaurer ni les surlignages dans la page lue, ni l'aperçu de la sélection, ni les messages de confirmation ou d'erreur, et un extrait qui était en cours de modification SHALL réapparaître fermé, avec son texte enregistré.

#### Scenario: Alternatif — Extrait en cours de modification
- **ÉTANT DONNÉ QUE** l'utilisatrice a ouvert la modification d'un extrait et changé son texte sans l'enregistrer
- **LORSQUE** elle ferme puis rouvre le panneau
- **ALORS** l'extrait apparaît fermé dans la liste, avec son texte enregistré

#### Scenario: Alternatif — Surlignages après la reprise
- **ÉTANT DONNÉ QUE** deux extraits étaient surlignés dans la page lue
- **LORSQUE** l'utilisatrice ferme puis rouvre le panneau
- **ALORS** aucun passage n'est surligné dans la page

### Requirement: Terminer la capture
Une fois l'item créé, le panneau SHALL afficher en bas un bouton « Terminer » qui efface la capture conservée et ramène le formulaire de préparation, pré-rempli depuis l'onglet actif, sans aucun appel à Notion ni fermeture du panneau.

#### Scenario: Nominal — Terminer une capture enregistrée
- **ÉTANT DONNÉ QUE** toutes les modifications de la capture sont enregistrées dans Notion
- **LORSQUE** l'utilisatrice clique sur « Terminer »
- **ALORS** le panneau affiche le formulaire de préparation, pré-rempli depuis l'onglet actif
- **ET** le panneau reste ouvert
- **ET** l'item reste inchangé dans Readme center

#### Scenario: Alternatif — Rouvrir le panneau après « Terminer »
- **ÉTANT DONNÉ QUE** l'utilisatrice a cliqué sur « Terminer »
- **LORSQUE** elle ferme puis rouvre le panneau
- **ALORS** le panneau affiche le formulaire de préparation, sans la capture terminée

#### Scenario: Alternatif — Item pas encore créé
- **ÉTANT DONNÉ QUE** le panneau affiche le formulaire de préparation
- **LORSQUE** l'utilisatrice regarde le bas du panneau
- **ALORS** aucun bouton « Terminer » n'est affiché

### Requirement: Confirmer la fin d'une capture non enregistrée
Si une métadonnée, la description ou un extrait en cours de modification n'est pas enregistré dans Notion, le clic sur « Terminer » SHALL afficher le message « Des modifications ne sont pas enregistrées dans Notion » avec les boutons « Terminer quand même » et « Annuler », au lieu de terminer.

#### Scenario: Nominal — Terminer quand même
- **ÉTANT DONNÉ QUE** l'utilisatrice a saisi une description sans l'enregistrer
- **LORSQUE** elle clique sur « Terminer », puis sur « Terminer quand même »
- **ALORS** le panneau affiche le formulaire de préparation
- **ET** la description saisie n'est pas envoyée à Notion

#### Scenario: Alternatif — Annuler
- **ÉTANT DONNÉ QUE** l'utilisatrice a modifié l'auteur sans l'enregistrer
- **LORSQUE** elle clique sur « Terminer », puis sur « Annuler »
- **ALORS** la capture reste affichée, avec l'auteur modifié
- **ET** le message de confirmation n'est plus affiché

### Requirement: Bloquer « Terminer » pendant un envoi
Le bouton « Terminer » SHALL être inactif pendant toute création, tout enregistrement et tout ajout, modification ou suppression d'extrait en cours d'envoi à Notion.

#### Scenario: Alternatif — Ajout d'extrait en cours
- **ÉTANT DONNÉ QUE** l'utilisatrice a cliqué sur « Ajouter l'extrait »
- **LORSQUE** Notion n'a pas encore répondu
- **ALORS** le bouton « Terminer » est inactif

### Requirement: Abandonner une capture d'une autre base
À l'ouverture du panneau, si la capture conservée concerne une autre base que celle de la configuration enregistrée, l'extension SHALL l'effacer sans message et afficher le formulaire de préparation.

#### Scenario: Erreur — Base changée dans les options
- **ÉTANT DONNÉ QUE** une capture est en cours sur la base Readme center
- **ET** l'utilisatrice a enregistré l'URL d'une autre base dans la page d'options
- **LORSQUE** elle rouvre le panneau
- **ALORS** le panneau affiche le formulaire de préparation, pré-rempli depuis l'onglet actif
- **ET** aucun message ne s'affiche

### Requirement: Partager la capture entre fenêtres
Quand le panneau est ouvert dans plusieurs fenêtres, chaque changement de la capture fait dans un panneau SHALL être reporté dans les autres.

#### Scenario: Alternatif — Deux fenêtres
- **ÉTANT DONNÉ QUE** le panneau est ouvert dans deux fenêtres sur la même capture
- **LORSQUE** l'utilisatrice ajoute un extrait depuis la première fenêtre
- **ALORS** l'extrait apparaît dans la liste du panneau de la seconde fenêtre
