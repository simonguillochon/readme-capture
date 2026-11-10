# Spec Delta

## MODIFIED Requirements

### Requirement: Proposer de terminer une capture dont l'item n'existe plus
Quand l'enregistrement des métadonnées, l'ajout d'un extrait, l'ajout d'une section seule ou l'enregistrement de la description échoue sur « Item introuvable dans Notion », le panneau SHALL afficher sous le message un bouton « Terminer la capture » qui termine la capture sans demander de confirmation.

#### Scenario: Nominal — Item mis à la corbeille avec une description en cours
- **ÉTANT DONNÉ QUE** l'utilisatrice a mis l'item à la corbeille dans Notion
- **ET** l'enregistrement de la description a échoué sur « Item introuvable dans Notion »
- **LORSQUE** elle clique sur « Terminer la capture »
- **ALORS** le panneau affiche le formulaire de préparation, pré-rempli depuis l'onglet actif
- **ET** aucun message de confirmation ne s'affiche

#### Scenario: Alternatif — Item mis à la corbeille avant l'ajout d'une section
- **ÉTANT DONNÉ QUE** l'utilisatrice a mis l'item à la corbeille dans Notion
- **LORSQUE** l'ajout d'une section seule échoue sur « Item introuvable dans Notion »
- **ALORS** le bouton « Terminer la capture » s'affiche sous le message
