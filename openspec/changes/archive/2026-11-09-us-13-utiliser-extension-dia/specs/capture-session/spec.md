# Spec Delta

## ADDED Requirements

### Requirement: Conserver la capture en cours dès la création de l'item
Dès la création de l'item et à chaque changement ensuite, l'extension SHALL conserver dans son stockage local la capture en cours : l'item, les valeurs des métadonnées enregistrées et en cours, les sections, les extraits, la section pré-sélectionnée, le texte de la description enregistré et en cours, et l'état replié ou déplié du formulaire.

#### Scenario: Nominal — Fermer puis rouvrir le panneau
- **ÉTANT DONNÉ QUE** l'utilisatrice a créé l'item « What a workplace can't promise », ajouté deux extraits sous « Le constat » et saisi une description sans l'enregistrer
- **LORSQUE** elle ferme puis rouvre le panneau
- **ALORS** le panneau affiche l'item « What a workplace can't promise » et son lien « Ouvrir dans Notion »
- **ET** la liste affiche les deux extraits sous « Le constat »
- **ET** le champ « Description » contient le texte saisi

#### Scenario: Alternatif — Redémarrer Dia
- **ÉTANT DONNÉ QUE** une capture est en cours
- **LORSQUE** l'utilisatrice quitte Dia, le relance et ouvre le panneau
- **ALORS** la capture reprend telle qu'elle était

#### Scenario: Alternatif — Modification de métadonnée non enregistrée
- **ÉTANT DONNÉ QUE** l'utilisatrice a déplié le formulaire et remplacé l'auteur sans l'enregistrer
- **LORSQUE** elle ferme puis rouvre le panneau
- **ALORS** le formulaire est déplié avec l'auteur modifié
- **ET** le bouton « Enregistrer les modifications » est affiché

## REMOVED Requirements

### Requirement: Conserver la capture dès la création de l'item
**Reason**: Son scénario « Redémarrer Zen » ne s'applique plus. OpenSpec refuse de retirer un scénario d'une exigence modifiée.
**Migration**: Remplacée par « Conserver la capture en cours dès la création de l'item », identique sauf le scénario « Redémarrer Dia ».
