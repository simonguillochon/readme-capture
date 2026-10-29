# Spec Delta

## MODIFIED Requirements

### Requirement: N'utiliser que les atomes du design system
Chaque élément d'interface du panneau et de la page d'options SHALL correspondre à un atome du design system ds-editorial-tech dans sa version 1.13, avec ses variantes et ses états, et l'extension SHALL n'utiliser aucune valeur de couleur, d'espacement, de rayon ou de typographie absente des tokens du DS, à l'exception des écarts validés par l'utilisatrice et décrits dans le design des changes, dont le compteur de caractères de la description.

#### Scenario: Nominal — Formulaire du panneau
- **ÉTANT DONNÉ QUE** une connexion à Notion est configurée
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** les champs, les libellés, le choix de la langue, les cases des thèmes et le bouton « Ajouter » reprennent respectivement les atomes Input, Field label, Choice Group, Checkbox et Button du DS

#### Scenario: Nominal — Page d'options
- **ÉTANT DONNÉ QUE** l'utilisatrice a ouvert la page d'options
- **LORSQUE** elle affiche la page
- **ALORS** le champ du jeton reprend l'atome Password Input, le champ de l'URL de la base l'atome Input et le bouton « Enregistrer » l'atome Button du DS

#### Scenario: Alternatif — Compteur de la description
- **ÉTANT DONNÉ QUE** l'item a été créé
- **LORSQUE** l'utilisatrice regarde la zone « Description »
- **ALORS** le compteur de caractères s'affiche sous le champ en Caption sur `text/secondary`, aligné à droite

## ADDED Requirements

### Requirement: Offrir des cibles de 44 px
Les champs Input et Select, les Buttons, les Icon Buttons `md`, la zone de chaque Checkbox et de chaque Link et l'en-tête du Disclosure SHALL mesurer au moins 44 px de haut, comme le prévoit le DS 1.13.

#### Scenario: Nominal — Hauteur des contrôles du formulaire
- **ÉTANT DONNÉ QUE** une connexion à Notion est configurée
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** les champs « Titre », « URL », « Auteur » et « LinkedIn de l'auteur », les options de langue et le bouton « Ajouter » mesurent 44 px de haut
- **ET** chaque thème occupe une zone de 44 px de haut, case et libellé compris

### Requirement: Montrer le focus clavier sur les boutons
Les Buttons, les Icon Buttons et les Links SHALL afficher l'état focus du DS 1.13 quand ils reçoivent le focus au clavier.

#### Scenario: Nominal — Atteindre « Ajouter » au clavier
- **ÉTANT DONNÉ QUE** le formulaire de préparation de l'item est valide
- **LORSQUE** l'utilisatrice atteint le bouton « Ajouter » avec la touche Tab
- **ALORS** le bouton affiche l'état focus du DS
