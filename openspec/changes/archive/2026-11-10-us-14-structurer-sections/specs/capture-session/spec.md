# Spec Delta

## MODIFIED Requirements

### Requirement: Bloquer « Terminer » pendant un envoi
Le bouton « Terminer » SHALL être inactif pendant toute création, tout enregistrement, tout ajout, modification ou suppression d'extrait, et tout ajout ou suppression de section en cours d'envoi à Notion.

#### Scenario: Alternatif — Ajout d'extrait en cours
- **ÉTANT DONNÉ QUE** l'utilisatrice a cliqué sur « Ajouter l'extrait »
- **LORSQUE** Notion n'a pas encore répondu
- **ALORS** le bouton « Terminer » est inactif

#### Scenario: Alternatif — Suppression de section en cours
- **ÉTANT DONNÉ QUE** l'utilisatrice a confirmé la suppression d'une section
- **LORSQUE** Notion n'a pas encore répondu
- **ALORS** le bouton « Terminer » est inactif
