# Spec Delta

## MODIFIED Requirements

### Requirement: Confirmer la création
Après la création, le panneau SHALL afficher le message « Item créé dans Readme center », un lien « Ouvrir dans Notion » vers la page de l'item, et SHALL ne plus afficher le bouton « Ajouter ». Le message SHALL être masqué dès qu'un champ diffère des valeurs enregistrées, et le lien SHALL rester affiché.

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

#### Scenario: Alternatif — Première modification après la création
- **ÉTANT DONNÉ QUE** le panneau affiche le message « Item créé dans Readme center »
- **LORSQUE** l'utilisatrice modifie le titre
- **ALORS** le message « Item créé dans Readme center » n'est plus affiché
- **ET** le lien « Ouvrir dans Notion » reste affiché
