# Spec Delta

## MODIFIED Requirements

### Requirement: Suivre l'onglet actif tant que les champs ne sont pas modifiés
Tant que l'item n'est pas créé, quand l'utilisatrice active un autre onglet ou qu'une nouvelle page se charge dans l'onglet actif, le panneau SHALL pré-remplir à nouveau « Titre », « URL », « Auteur » et « LinkedIn de l'auteur » depuis cette page, sauf si l'utilisatrice a modifié l'un de ces quatre champs, et SHALL conserver la langue et les thèmes choisis. Une fois l'item créé, le panneau SHALL ne plus pré-remplir aucun champ.

#### Scenario: Nominal — Changer d'onglet sans avoir modifié les champs
- **ÉTANT DONNÉ QUE** le panneau est pré-rempli depuis un premier article
- **ET** l'utilisatrice a choisi la langue 🇬🇧 sans modifier « Titre », « URL », « Auteur » ni « LinkedIn de l'auteur »
- **LORSQUE** elle active l'onglet d'un second article
- **ALORS** « Titre », « URL », « Auteur » et « LinkedIn de l'auteur » sont pré-remplis depuis le second article
- **ET** la langue 🇬🇧 reste choisie

#### Scenario: Alternatif — Changer d'onglet après avoir modifié le titre
- **ÉTANT DONNÉ QUE** le panneau est pré-rempli depuis un premier article
- **ET** l'utilisatrice a remplacé le titre par « Ma lecture du jour »
- **LORSQUE** elle active l'onglet d'un second article
- **ALORS** « Titre » contient toujours « Ma lecture du jour »
- **ET** « URL », « Auteur » et « LinkedIn de l'auteur » contiennent toujours les valeurs du premier article

#### Scenario: Alternatif — Changer d'onglet après la création de l'item
- **ÉTANT DONNÉ QUE** l'item a été créé depuis un premier article sans que l'utilisatrice modifie aucun champ
- **LORSQUE** elle active l'onglet d'un second article
- **ALORS** « Titre », « URL », « Auteur » et « LinkedIn de l'auteur » contiennent toujours les valeurs du premier article
