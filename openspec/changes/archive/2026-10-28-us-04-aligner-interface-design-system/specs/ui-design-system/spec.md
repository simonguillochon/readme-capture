# Spec Delta

## Purpose

Garantit que l'interface de l'extension n'utilise que les atomes et les tokens du design system ds-editorial-tech, qui fait foi pour tout rendu visuel.

## ADDED Requirements

### Requirement: N'utiliser que les atomes du design system
Chaque élément d'interface du panneau et de la page d'options SHALL correspondre à un atome du design system ds-editorial-tech, avec ses variantes et ses états, et l'extension SHALL n'utiliser aucune valeur de couleur, d'espacement, de rayon ou de typographie absente des tokens du DS.

#### Scenario: Nominal — Formulaire du panneau
- **ÉTANT DONNÉ QUE** une connexion à Notion est configurée
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** les champs, les libellés, le choix de la langue, les cases des thèmes et le bouton « Ajouter » reprennent respectivement les atomes Input, Field label, Choice Group, Checkbox et Button du DS

#### Scenario: Nominal — Page d'options
- **ÉTANT DONNÉ QUE** l'utilisatrice a ouvert la page d'options
- **LORSQUE** elle affiche la page
- **ALORS** le champ du jeton reprend l'atome Password Input, le champ de l'URL de la base l'atome Input et le bouton « Enregistrer » l'atome Button du DS

### Requirement: Afficher les cases à cocher selon l'atome Checkbox
Chaque case à cocher SHALL être une case de 20 px au rayon `sm`, sur fond `surface/elevated` avec une bordure `border/default` quand elle n'est pas cochée, et sur fond `accent` avec l'icône `check` en `text/inverse` quand elle est cochée.

#### Scenario: Nominal — Cocher un thème
- **ÉTANT DONNÉ QUE** le thème « Management » n'est pas coché
- **LORSQUE** l'utilisatrice coche « Management »
- **ALORS** la case de « Management » passe sur fond `accent` avec l'icône `check` en `text/inverse`

#### Scenario: Alternatif — Survol d'une case non cochée
- **ÉTANT DONNÉ QUE** le thème « Design » n'est pas coché
- **LORSQUE** l'utilisatrice survole la case de « Design »
- **ALORS** la bordure de la case passe en `border/accent`

### Requirement: Distinguer l'option choisie par une bordure accent
Dans le choix de la langue, chaque option SHALL garder le style du Button secondary `sm`, et l'option choisie SHALL recevoir en plus une bordure de 2 px `border/accent`.

#### Scenario: Nominal — Choisir le français
- **ÉTANT DONNÉ QUE** aucune langue n'est choisie
- **LORSQUE** l'utilisatrice choisit 🇫🇷 Français
- **ALORS** l'option 🇫🇷 Français garde le style secondary avec une bordure de 2 px `border/accent`
- **ET** les options 🇬🇧 Anglais et 🇪🇸 Espagnol gardent le style secondary sans bordure accent

### Requirement: Colorer les messages selon leur variante
Chaque message SHALL afficher son texte et sa bordure dans la couleur de sa variante : `feedback/success` pour un succès, `feedback/warning` pour un avertissement et `feedback/error` pour une erreur, sur fond `surface/elevated`.

#### Scenario: Nominal — Confirmation de création
- **ÉTANT DONNÉ QUE** l'utilisatrice a cliqué sur « Ajouter »
- **LORSQUE** le message « Item créé dans Readme center » s'affiche
- **ALORS** son texte et sa bordure sont en `feedback/success`

#### Scenario: Alternatif — Avertissement de doublon
- **ÉTANT DONNÉ QUE** l'URL de la page lue existe déjà dans Readme center
- **LORSQUE** l'avertissement « Cette URL existe déjà dans Readme center » s'affiche
- **ALORS** son texte et sa bordure sont en `feedback/warning`

#### Scenario: Erreur — Échec de la vérification de connexion
- **ÉTANT DONNÉ QUE** l'utilisatrice a saisi un jeton révoqué dans la page d'options
- **LORSQUE** le message « Jeton Notion invalide » s'affiche
- **ALORS** son texte et sa bordure sont en `feedback/error`

### Requirement: Adapter les couleurs de retour au mode sombre
Les tokens de retour SHALL prendre les valeurs du DS selon le mode : `warning-light` pour `feedback/warning` en mode clair, et `success-dark`, `warning` et `error-dark` pour `feedback/success`, `feedback/warning` et `feedback/error` en mode sombre.

#### Scenario: Nominal — Avertissement en mode clair
- **ÉTANT DONNÉ QUE** le système de l'utilisatrice est en mode clair
- **LORSQUE** l'avertissement de doublon s'affiche dans le panneau
- **ALORS** son texte et sa bordure sont en `warning-light` (#8A6508)

#### Scenario: Alternatif — Erreur en mode sombre
- **ÉTANT DONNÉ QUE** le système de l'utilisatrice est en mode sombre
- **LORSQUE** un message d'erreur s'affiche dans le panneau
- **ALORS** son texte et sa bordure sont en `error-dark` (#E57373)

### Requirement: Étendre les messages à la largeur du panneau
Dans l'extension, un message SHALL occuper toute la largeur disponible de son conteneur, au lieu de la largeur fixe de 320 px de l'atome Message.

#### Scenario: Nominal — Panneau élargi
- **ÉTANT DONNÉ QUE** l'utilisatrice a élargi le panneau à 480 px
- **LORSQUE** un message s'affiche
- **ALORS** le message occupe toute la largeur du formulaire
