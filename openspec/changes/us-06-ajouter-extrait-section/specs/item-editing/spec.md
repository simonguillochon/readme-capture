## ADDED Requirements

### Requirement: Replier le formulaire après la création
Après la création de l'item et après chaque enregistrement réussi des modifications, le panneau SHALL replier le formulaire des métadonnées en un résumé affichant le titre enregistré, le message de confirmation et le lien « Ouvrir dans Notion », et SHALL le déplier au clic de l'utilisatrice, avec les valeurs en cours. Le formulaire SHALL ne pouvoir être replié par l'utilisatrice que si aucun champ ne diffère des valeurs enregistrées.

#### Scenario: Nominal — Formulaire replié à la création
- **ÉTANT DONNÉ QUE** l'utilisatrice a rempli le formulaire avec le titre « What a workplace can't promise »
- **LORSQUE** elle clique sur « Ajouter » et Notion confirme la création
- **ALORS** le formulaire est replié et affiche le titre « What a workplace can't promise »
- **ET** le message « Item créé dans Readme center » et le lien « Ouvrir dans Notion » s'affichent
- **ET** la zone des extraits s'affiche juste en dessous

#### Scenario: Alternatif — Déplier pour corriger
- **ÉTANT DONNÉ QUE** le formulaire est replié
- **LORSQUE** l'utilisatrice le déplie
- **ALORS** les champs « Titre », « URL », « Auteur », « LinkedIn de l'auteur », « Langue » et « Thèmes » s'affichent avec les valeurs enregistrées

#### Scenario: Alternatif — Replié après un enregistrement
- **ÉTANT DONNÉ QUE** l'utilisatrice a déplié le formulaire et remplacé l'auteur par « Camille Martin »
- **LORSQUE** elle clique sur « Enregistrer les modifications » et Notion confirme la mise à jour
- **ALORS** le formulaire est replié
- **ET** le message « Modifications enregistrées dans Readme center » s'affiche

#### Scenario: Erreur — Échec de l'enregistrement
- **ÉTANT DONNÉ QUE** l'ordinateur de l'utilisatrice n'a plus accès à internet
- **LORSQUE** elle clique sur « Enregistrer les modifications »
- **ALORS** le formulaire reste déplié
- **ET** le message « Connexion impossible » s'affiche

#### Scenario: Erreur — Modification non enregistrée
- **ÉTANT DONNÉ QUE** l'utilisatrice a déplié le formulaire et modifié le titre sans l'enregistrer
- **LORSQUE** elle tente de replier le formulaire
- **ALORS** le formulaire reste déplié

## MODIFIED Requirements

### Requirement: Confirmer l'enregistrement
Après un enregistrement réussi, le panneau SHALL masquer le bouton « Enregistrer les modifications », afficher le message « Modifications enregistrées dans Readme center » sous le formulaire, et masquer ce message dès qu'un champ diffère à nouveau des valeurs enregistrées.

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
