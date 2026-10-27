# Spec Delta

## Purpose

Prépare dans le panneau latéral les métadonnées d'un nouvel item Readme center, pré-remplies depuis la page lue, afin que l'utilisatrice n'ait plus à les recopier.

## ADDED Requirements

### Requirement: Afficher le formulaire quand la connexion est configurée
Quand une connexion à Notion est enregistrée, le panneau SHALL afficher le formulaire de préparation de l'item, composé des champs « Titre », « URL », « Auteur », « LinkedIn de l'auteur », « Langue » et « Thèmes », et du bouton « Ajouter ».

#### Scenario: Nominal — Ouvrir le panneau avec une connexion configurée
- **ÉTANT DONNÉ QUE** une connexion vérifiée à Notion est enregistrée
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le panneau affiche les champs « Titre », « URL », « Auteur », « LinkedIn de l'auteur », « Langue » et « Thèmes »
- **ET** le panneau affiche le bouton « Ajouter »

### Requirement: Pré-remplir le titre depuis la page
À l'ouverture du panneau, le champ « Titre » SHALL être pré-rempli avec le titre déclaré par la page dans la balise `og:title`, ou à défaut avec le titre de l'onglet, et rester vide si aucun des deux n'existe.

#### Scenario: Nominal — Page avec titre de partage
- **ÉTANT DONNÉ QUE** l'onglet actif affiche un article dont la balise `og:title` vaut « What a workplace can't promise »
- **ET** le titre de l'onglet est « TBM 444 | The Beautiful Mess »
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « Titre » contient « What a workplace can't promise »

#### Scenario: Alternatif — Page sans titre de partage
- **ÉTANT DONNÉ QUE** l'onglet actif affiche une page sans balise `og:title` dont le titre d'onglet est « Notes de lecture »
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « Titre » contient « Notes de lecture »

### Requirement: Pré-remplir l'URL nettoyée de l'onglet
À l'ouverture du panneau, le champ « URL » SHALL être pré-rempli avec l'URL de l'onglet actif, nettoyée selon la capacité `url-normalization`.

#### Scenario: Nominal — URL avec paramètres de suivi
- **ÉTANT DONNÉ QUE** l'onglet actif affiche « https://exemple.substack.com/p/un-article?utm_source=post-email-title »
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « URL » contient « https://exemple.substack.com/p/un-article »

### Requirement: Pré-remplir l'auteur depuis la page
À l'ouverture du panneau, le champ « Auteur » SHALL être pré-rempli avec l'auteur déclaré par la page dans la balise `author`, puis à défaut dans la balise `article:author`, puis à défaut dans ses données structurées, et rester vide si aucune ne le déclare.

#### Scenario: Nominal — Page avec balise auteur
- **ÉTANT DONNÉ QUE** l'onglet actif affiche un article dont la balise `author` vaut « Camille Martin »
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « Auteur » contient « Camille Martin »

#### Scenario: Alternatif — Auteur déclaré dans les données structurées
- **ÉTANT DONNÉ QUE** l'onglet actif affiche un article sans balise `author` ni `article:author`
- **ET** ses données structurées déclarent l'auteur « Camille Martin »
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « Auteur » contient « Camille Martin »

#### Scenario: Alternatif — Page sans auteur déclaré
- **ÉTANT DONNÉ QUE** l'onglet actif affiche une page qui ne déclare aucun auteur
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « Auteur » est vide

### Requirement: Pré-remplir le titre d'un post LinkedIn ou X
Quand l'URL de l'onglet actif est celle d'un post (`linkedin.com/posts/…`, `linkedin.com/feed/update/…`, `x.com/<compte>/status/<id>` ou `twitter.com/<compte>/status/<id>`), le champ « Titre » SHALL être pré-rempli avec la première phrase du post, c'est-à-dire son texte jusqu'au premier `.`, `!`, `?` ou saut de ligne, ponctuation finale comprise.

#### Scenario: Nominal — Post LinkedIn avec phrase d'accroche
- **ÉTANT DONNÉ QUE** l'onglet actif affiche un post LinkedIn dont le texte commence par « Le management n'est pas un titre. C'est une pratique quotidienne. »
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « Titre » contient « Le management n'est pas un titre. »

#### Scenario: Alternatif — Post X dont la première ligne n'a pas de ponctuation
- **ÉTANT DONNÉ QUE** l'onglet actif affiche un post X dont le texte commence par « 3 leçons sur la discovery » suivi d'un saut de ligne
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « Titre » contient « 3 leçons sur la discovery »

#### Scenario: Alternatif — Texte du post introuvable
- **ÉTANT DONNÉ QUE** l'onglet actif affiche un post LinkedIn dont l'extension ne trouve pas le texte
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « Titre » est vide

### Requirement: Pré-remplir l'auteur d'un post LinkedIn ou X
Quand l'URL de l'onglet actif est celle d'un post LinkedIn ou X, le champ « Auteur » SHALL être pré-rempli avec le nom affiché de l'auteur du post, et rester vide si l'extension ne le trouve pas.

#### Scenario: Nominal — Auteur d'un post X
- **ÉTANT DONNÉ QUE** l'onglet actif affiche un post X publié par « Camille Martin »
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « Auteur » contient « Camille Martin »

### Requirement: Pré-remplir le profil LinkedIn de l'auteur depuis la page
À l'ouverture du panneau, le champ « LinkedIn de l'auteur » SHALL être pré-rempli avec la première URL de profil LinkedIn déclarée pour l'auteur par la page, dans la balise `article:author` puis dans les liens de l'auteur de ses données structurées, et rester vide si la page n'en déclare aucune.

#### Scenario: Nominal — Profil LinkedIn dans les données structurées
- **ÉTANT DONNÉ QUE** l'onglet actif affiche un article dont les données structurées déclarent l'auteur « Camille Martin » avec le lien « https://www.linkedin.com/in/camille-martin-exemple/ »
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « LinkedIn de l'auteur » contient « https://www.linkedin.com/in/camille-martin-exemple »

#### Scenario: Alternatif — Profil LinkedIn dans la balise article:author
- **ÉTANT DONNÉ QUE** l'onglet actif affiche un article dont la balise `article:author` vaut « https://fr.linkedin.com/in/camille-martin-exemple?trk=article »
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « LinkedIn de l'auteur » contient « https://www.linkedin.com/in/camille-martin-exemple »

#### Scenario: Alternatif — Auteur sans profil LinkedIn déclaré
- **ÉTANT DONNÉ QUE** l'onglet actif affiche un article dont l'auteur n'a qu'un lien vers « https://x.com/camille_exemple »
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « LinkedIn de l'auteur » est vide

### Requirement: Pré-remplir le profil LinkedIn de l'auteur d'un post LinkedIn
Quand l'URL de l'onglet actif est celle d'un post LinkedIn, le champ « LinkedIn de l'auteur » SHALL être pré-rempli avec l'URL du profil LinkedIn de l'auteur du post, et rester vide si l'extension ne la trouve pas.

#### Scenario: Nominal — Profil de l'auteur d'un post LinkedIn
- **ÉTANT DONNÉ QUE** l'onglet actif affiche un post LinkedIn publié par le profil « https://www.linkedin.com/in/camille-martin-exemple »
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « LinkedIn de l'auteur » contient « https://www.linkedin.com/in/camille-martin-exemple »

#### Scenario: Alternatif — Post X
- **ÉTANT DONNÉ QUE** l'onglet actif affiche un post X
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « LinkedIn de l'auteur » est vide

### Requirement: Accepter uniquement un profil LinkedIn
Le champ « LinkedIn de l'auteur » SHALL être facultatif, et, s'il est rempli, contenir une URL de profil LinkedIn de la forme `linkedin.com/in/<identifiant>`, normalisée en `https://www.linkedin.com/in/<identifiant>` sans paramètres ni `/` final.

#### Scenario: Nominal — Champ laissé vide
- **ÉTANT DONNÉ QUE** « Titre », « URL » et « Auteur » sont valides, une langue et un thème sont choisis
- **LORSQUE** l'utilisatrice laisse « LinkedIn de l'auteur » vide
- **ALORS** le bouton « Ajouter » est actif

#### Scenario: Alternatif — Coller une URL de profil à nettoyer
- **ÉTANT DONNÉ QUE** le panneau affiche le formulaire
- **LORSQUE** l'utilisatrice colle « https://fr.linkedin.com/in/camille-martin-exemple/?originalSubdomain=fr » dans « LinkedIn de l'auteur » et quitte le champ
- **ALORS** le champ contient « https://www.linkedin.com/in/camille-martin-exemple »

#### Scenario: Erreur — URL qui n'est pas un profil LinkedIn
- **ÉTANT DONNÉ QUE** « Titre », « URL » et « Auteur » sont valides, une langue et un thème sont choisis
- **LORSQUE** l'utilisatrice saisit « https://www.linkedin.com/company/exemple » dans « LinkedIn de l'auteur » et quitte le champ
- **ALORS** le champ « LinkedIn de l'auteur » est signalé comme invalide
- **ET** le bouton « Ajouter » reste inactif

### Requirement: Suivre l'onglet actif tant que les champs ne sont pas modifiés
Quand l'utilisatrice active un autre onglet ou qu'une nouvelle page se charge dans l'onglet actif, le panneau SHALL pré-remplir à nouveau « Titre », « URL », « Auteur » et « LinkedIn de l'auteur » depuis cette page, sauf si l'utilisatrice a modifié l'un de ces quatre champs, et SHALL conserver la langue et les thèmes choisis.

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

### Requirement: Nettoyer une URL saisie à la main
Quand l'utilisatrice quitte le champ « URL » après l'avoir modifié, le panneau SHALL remplacer sa valeur par l'URL nettoyée selon la capacité `url-normalization`, si la valeur est une URL valide.

#### Scenario: Nominal — Coller l'URL d'un post depuis le fil
- **ÉTANT DONNÉ QUE** l'utilisatrice est sur son fil LinkedIn avec le panneau ouvert
- **LORSQUE** elle colle « https://www.linkedin.com/posts/camille-martin_management-activity-7000000000000000000-AbCd?utm_source=share » dans « URL » et quitte le champ
- **ALORS** le champ « URL » contient « https://www.linkedin.com/posts/camille-martin_management-activity-7000000000000000000-AbCd »

#### Scenario: Erreur — Valeur qui n'est pas une URL
- **ÉTANT DONNÉ QUE** le panneau affiche le formulaire
- **LORSQUE** l'utilisatrice saisit « article de Camille » dans « URL » et quitte le champ
- **ALORS** le champ « URL » contient toujours « article de Camille »
- **ET** le champ « URL » est signalé comme invalide

### Requirement: Choisir une seule langue
Le champ « Langue » SHALL proposer les choix 🇫🇷 Français, 🇬🇧 Anglais et 🇪🇸 Espagnol, aucun n'étant choisi à l'ouverture, et un seul pouvant être choisi à la fois.

#### Scenario: Nominal — Choisir une langue
- **ÉTANT DONNÉ QUE** le panneau affiche le formulaire sans langue choisie
- **LORSQUE** l'utilisatrice choisit 🇫🇷 Français
- **ALORS** 🇫🇷 Français est la langue choisie

#### Scenario: Alternatif — Changer de langue
- **ÉTANT DONNÉ QUE** l'utilisatrice a choisi 🇫🇷 Français
- **LORSQUE** elle choisit 🇬🇧 Anglais
- **ALORS** 🇬🇧 Anglais est la seule langue choisie

### Requirement: Choisir les thèmes de la base Notion
Le champ « Thèmes » SHALL proposer les options de la propriété Theme lues dans la base Notion à l'ouverture du panneau, dans l'ordre de Notion, et permettre d'en choisir plusieurs.

#### Scenario: Nominal — Thèmes lus dans Notion
- **ÉTANT DONNÉ QUE** la propriété Theme de la base propose « AI Thoughts », « Design » et « Management », dans cet ordre
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le champ « Thèmes » propose « AI Thoughts », « Design » et « Management », dans cet ordre

#### Scenario: Alternatif — Thème ajouté dans Notion
- **ÉTANT DONNÉ QUE** l'utilisatrice a ajouté le thème « Signaux faibles » dans la base Notion
- **LORSQUE** elle rouvre le panneau
- **ALORS** le champ « Thèmes » propose « Signaux faibles »

#### Scenario: Nominal — Choisir plusieurs thèmes
- **ÉTANT DONNÉ QUE** le panneau affiche les thèmes de la base
- **LORSQUE** l'utilisatrice choisit « Design » puis « Management »
- **ALORS** « Design » et « Management » sont choisis

### Requirement: Signaler l'échec de lecture des thèmes
Si la liste des thèmes ne peut pas être lue dans Notion, le panneau SHALL afficher le message de la cause la plus probable, selon la table d'erreurs du PRD, à la place de la liste des thèmes.

#### Scenario: Erreur — Pas de réseau à l'ouverture du panneau
- **ÉTANT DONNÉ QUE** l'ordinateur de l'utilisatrice n'a pas accès à internet
- **LORSQUE** elle ouvre le panneau
- **ALORS** le message « Connexion impossible » s'affiche à la place de la liste des thèmes
- **ET** le bouton « Ajouter » reste inactif

### Requirement: Activer « Ajouter » uniquement si le formulaire est valide
Le bouton « Ajouter » SHALL être actif si et seulement si « Titre » et « Auteur » ne sont pas vides ni composés uniquement d'espaces, « URL » contient une URL valide, « LinkedIn de l'auteur » est vide ou contient un profil LinkedIn valide, une langue est choisie et au moins un thème est choisi.

#### Scenario: Nominal — Formulaire complet
- **ÉTANT DONNÉ QUE** « Titre », « URL » et « Auteur » sont pré-remplis avec des valeurs valides
- **LORSQUE** l'utilisatrice choisit 🇬🇧 Anglais et le thème « Management »
- **ALORS** le bouton « Ajouter » devient actif

#### Scenario: Erreur — Aucun thème choisi
- **ÉTANT DONNÉ QUE** « Titre », « URL » et « Auteur » sont valides et la langue 🇬🇧 Anglais est choisie
- **LORSQUE** l'utilisatrice ne choisit aucun thème
- **ALORS** le bouton « Ajouter » reste inactif

#### Scenario: Erreur — Auteur vide
- **ÉTANT DONNÉ QUE** la page lue ne déclare aucun auteur
- **ET** l'utilisatrice a choisi une langue et un thème
- **LORSQUE** elle laisse « Auteur » vide
- **ALORS** le bouton « Ajouter » reste inactif

### Requirement: Laisser les champs vides sur une page illisible
Quand l'onglet actif est une page que l'extension ne peut pas lire, comme une page interne du navigateur ou la visionneuse PDF, le panneau SHALL laisser « Titre », « URL », « Auteur » et « LinkedIn de l'auteur » vides sans afficher de message, et l'utilisatrice SHALL pouvoir les remplir à la main.

#### Scenario: Alternatif — Nouvel onglet vide
- **ÉTANT DONNÉ QUE** l'onglet actif affiche « about:newtab »
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** « Titre », « URL », « Auteur » et « LinkedIn de l'auteur » sont vides
- **ET** aucun message d'erreur ne s'affiche
- **ET** l'utilisatrice peut saisir les trois champs à la main

### Requirement: Lire uniquement l'onglet actif, panneau ouvert
L'extension SHALL lire une page web uniquement quand le panneau est ouvert, et uniquement la page de l'onglet actif de la fenêtre du panneau.

#### Scenario: Nominal — Onglets en arrière-plan
- **ÉTANT DONNÉ QUE** le panneau est ouvert et trois onglets sont ouverts dans la fenêtre
- **LORSQUE** l'extension pré-remplit le formulaire
- **ALORS** seule la page de l'onglet actif est lue

### Requirement: Ne pas conserver le formulaire avant la création de l'item
Tant que l'item n'est pas créé, le panneau SHALL ne pas conserver les valeurs du formulaire après sa fermeture.

#### Scenario: Alternatif — Fermer puis rouvrir le panneau avant la création
- **ÉTANT DONNÉ QUE** l'utilisatrice a modifié le titre et choisi la langue 🇫🇷 Français sans cliquer sur « Ajouter »
- **LORSQUE** elle ferme puis rouvre le panneau
- **ALORS** le formulaire est pré-rempli à nouveau depuis l'onglet actif
- **ET** aucune langue n'est choisie
