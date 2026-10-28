# Spec Delta

## Purpose

Permet d'ajouter en citation, dans la page Notion de l'item, les passages sélectionnés dans la page lue, rangés sous des sections choisies par l'utilisatrice.

## ADDED Requirements

### Requirement: Proposer la capture d'extraits une fois l'item créé
Le panneau SHALL afficher la zone des extraits (aperçu de la sélection, menu Section, bouton « Ajouter l'extrait » et liste des extraits) uniquement après la création de l'item.

#### Scenario: Nominal — Item créé
- **ÉTANT DONNÉ QUE** l'utilisatrice vient de créer l'item
- **LORSQUE** Notion confirme la création
- **ALORS** la zone des extraits s'affiche dans le panneau

#### Scenario: Alternatif — Item pas encore créé
- **ÉTANT DONNÉ QUE** le panneau affiche le formulaire de préparation de l'item
- **LORSQUE** l'utilisatrice sélectionne un passage dans la page
- **ALORS** aucune zone des extraits n'est affichée

### Requirement: Afficher en direct l'aperçu de la sélection
Après la création de l'item, le panneau SHALL afficher l'aperçu du passage sélectionné dans l'onglet actif, mis à jour à chaque nouvelle sélection, limité à 5 lignes, et afficher « Sélectionne un passage dans la page » quand aucun texte n'est sélectionné.

#### Scenario: Nominal — Sélectionner un passage
- **ÉTANT DONNÉ QUE** l'item a été créé
- **LORSQUE** l'utilisatrice sélectionne le passage « Culture is what people do when no one is watching. » dans la page
- **ALORS** l'aperçu affiche « Culture is what people do when no one is watching. »

#### Scenario: Alternatif — Aucune sélection
- **ÉTANT DONNÉ QUE** l'item a été créé
- **LORSQUE** aucun texte n'est sélectionné dans l'onglet actif
- **ALORS** l'aperçu affiche « Sélectionne un passage dans la page »
- **ET** le bouton « Ajouter l'extrait » est inactif

#### Scenario: Alternatif — Sélection dans un autre onglet
- **ÉTANT DONNÉ QUE** l'item a été créé depuis un premier article
- **LORSQUE** l'utilisatrice active l'onglet d'un second article et y sélectionne un passage
- **ALORS** l'aperçu affiche le passage sélectionné dans le second article
- **ET** aucun avertissement ne s'affiche

### Requirement: Signaler une page où la sélection est impossible
Quand l'onglet actif est une page que l'extension ne peut pas lire, le panneau SHALL afficher « Sélection impossible sur cette page » à la place de l'aperçu, et le bouton « Ajouter l'extrait » SHALL rester inactif.

#### Scenario: Erreur — Page interne du navigateur
- **ÉTANT DONNÉ QUE** l'item a été créé
- **LORSQUE** l'utilisatrice active un onglet affichant « about:newtab »
- **ALORS** le message « Sélection impossible sur cette page » s'affiche
- **ET** le bouton « Ajouter l'extrait » est inactif

### Requirement: Choisir la section de l'extrait
Le menu Section SHALL proposer les sections déjà créées pour l'item dans leur ordre de création, puis « + Nouvelle section… » et « Sans section », et SHALL pré-sélectionner la dernière section utilisée, ou « Sans section » si aucune ne l'a encore été.

#### Scenario: Nominal — Premier extrait
- **ÉTANT DONNÉ QUE** l'item vient d'être créé et aucun extrait n'a été ajouté
- **LORSQUE** l'utilisatrice regarde le menu Section
- **ALORS** « Sans section » est pré-sélectionné

#### Scenario: Nominal — Dernière section utilisée
- **ÉTANT DONNÉ QUE** l'utilisatrice a ajouté un extrait sous la section « Le constat », puis un extrait sous la section « Les leviers »
- **LORSQUE** elle sélectionne un nouveau passage
- **ALORS** le menu Section propose « Le constat », « Les leviers », « + Nouvelle section… » et « Sans section », dans cet ordre
- **ET** « Les leviers » est pré-sélectionné

### Requirement: Créer une section à partir du titre le plus proche
Quand l'utilisatrice choisit « + Nouvelle section… », le panneau SHALL afficher un champ « Titre de la section », pré-rempli avec le texte du dernier titre (`h1` à `h6`) situé avant le début de la sélection dans la page, ou vide s'il n'y en a aucun, et un choix de niveau H1, H2 ou H3, H1 étant choisi par défaut.

#### Scenario: Nominal — Titre de section pré-rempli
- **ÉTANT DONNÉ QUE** le passage sélectionné se trouve sous le titre « Why culture eats strategy » de la page
- **LORSQUE** l'utilisatrice choisit « + Nouvelle section… »
- **ALORS** le champ « Titre de la section » contient « Why culture eats strategy »
- **ET** le niveau H1 est choisi

#### Scenario: Alternatif — Page sans titre avant la sélection
- **ÉTANT DONNÉ QUE** le passage sélectionné n'est précédé d'aucun titre dans la page
- **LORSQUE** l'utilisatrice choisit « + Nouvelle section… »
- **ALORS** le champ « Titre de la section » est vide

#### Scenario: Erreur — Titre de section vide
- **ÉTANT DONNÉ QUE** l'utilisatrice a choisi « + Nouvelle section… » et sélectionné un passage
- **LORSQUE** elle vide le champ « Titre de la section »
- **ALORS** le bouton « Ajouter l'extrait » est inactif

### Requirement: Écrire l'extrait en citation sous sa section
Au clic sur « Ajouter l'extrait », l'extension SHALL écrire le texte brut de la sélection, sauts de ligne compris, dans une seule citation de la page Notion de l'item, placée à la fin de sa section, et SHALL écrire le titre d'une nouvelle section au niveau choisi, à la fin de la page, juste avant sa première citation.

#### Scenario: Nominal — Extrait sous une nouvelle section
- **ÉTANT DONNÉ QUE** la page Notion de l'item ne contient aucune section
- **ET** l'utilisatrice a sélectionné un passage et choisi « + Nouvelle section… » avec le titre « Le constat » au niveau H2
- **LORSQUE** elle clique sur « Ajouter l'extrait »
- **ALORS** la page Notion contient un titre de niveau 2 « Le constat » suivi d'une citation du passage

#### Scenario: Alternatif — Extrait sous une section existante, après la création d'une autre section
- **ÉTANT DONNÉ QUE** la page contient la section « Le constat » avec une citation, puis la section « Les leviers » avec une citation
- **LORSQUE** l'utilisatrice ajoute un extrait sous « Le constat »
- **ALORS** la nouvelle citation est placée après la citation existante de « Le constat » et avant le titre « Les leviers »

#### Scenario: Alternatif — Passage sur plusieurs paragraphes
- **ÉTANT DONNÉ QUE** l'utilisatrice a sélectionné deux paragraphes consécutifs de la page
- **LORSQUE** elle ajoute l'extrait
- **ALORS** la page Notion contient une seule citation avec les deux paragraphes séparés par un saut de ligne
- **ET** la citation ne contient ni gras ni lien

### Requirement: Placer les extraits sans section en haut de la page
Un extrait ajouté avec « Sans section » SHALL être écrit en citation sans titre, en haut de la page de l'item, après les autres extraits sans section et avant la première section.

#### Scenario: Nominal — Extrait sans section avec des sections existantes
- **ÉTANT DONNÉ QUE** la page contient une citation sans section, puis la section « Le constat »
- **LORSQUE** l'utilisatrice ajoute un extrait avec « Sans section »
- **ALORS** la nouvelle citation est placée après la première citation sans section et avant le titre « Le constat »

### Requirement: Réutiliser une section de même nom
Si le titre saisi pour une nouvelle section est identique au titre d'une section déjà créée pour l'item, sans tenir compte de la casse ni des espaces en début et fin, l'extension SHALL ranger l'extrait sous la section existante sans écrire de nouveau titre.

#### Scenario: Alternatif — Nouvelle section au nom déjà utilisé
- **ÉTANT DONNÉ QUE** l'item a une section « Le constat »
- **LORSQUE** l'utilisatrice choisit « + Nouvelle section… », saisit « le constat » et ajoute l'extrait
- **ALORS** la citation est placée à la fin de la section « Le constat »
- **ET** la page ne contient qu'un seul titre « Le constat »

### Requirement: Empêcher l'ajout en double d'un même extrait
Pendant l'ajout, le bouton SHALL afficher « Ajout en cours… » et rester inactif, puis l'aperçu SHALL afficher « Extrait ajouté » et le bouton rester inactif jusqu'à ce que l'utilisatrice sélectionne un autre passage.

#### Scenario: Nominal — Extrait ajouté
- **ÉTANT DONNÉ QUE** l'utilisatrice a cliqué sur « Ajouter l'extrait »
- **LORSQUE** Notion confirme l'ajout
- **ALORS** l'aperçu affiche « Extrait ajouté »
- **ET** le bouton « Ajouter l'extrait » est inactif

#### Scenario: Alternatif — Nouvelle sélection après un ajout
- **ÉTANT DONNÉ QUE** l'aperçu affiche « Extrait ajouté »
- **LORSQUE** l'utilisatrice sélectionne un autre passage
- **ALORS** l'aperçu affiche le nouveau passage
- **ET** le bouton « Ajouter l'extrait » est actif

### Requirement: Lister les extraits ajoutés
Le panneau SHALL lister les extraits ajoutés à l'item, regroupés dans l'ordre de la page Notion (les extraits sans section d'abord, puis chaque section sous son titre), en affichant les 2 premières lignes de chaque extrait.

#### Scenario: Nominal — Extraits dans deux sections
- **ÉTANT DONNÉ QUE** l'utilisatrice a ajouté un extrait sans section, puis un extrait sous « Le constat »
- **LORSQUE** elle regarde la liste des extraits
- **ALORS** la liste affiche d'abord l'extrait sans section, puis le titre « Le constat » suivi de son extrait

### Requirement: Indiquer la cause d'un échec d'ajout
Si l'ajout échoue, le panneau SHALL afficher le message de la cause la plus probable selon la table d'erreurs du PRD, avec « Item introuvable dans Notion » pour toute réponse 400 ou 404, et SHALL conserver la sélection affichée, la section choisie et le titre de la nouvelle section.

#### Scenario: Erreur — Item mis à la corbeille
- **ÉTANT DONNÉ QUE** l'utilisatrice a mis l'item à la corbeille dans Notion
- **LORSQUE** elle clique sur « Ajouter l'extrait »
- **ALORS** le message « Item introuvable dans Notion » s'affiche
- **ET** l'aperçu et la section choisie sont conservés
- **ET** le bouton « Ajouter l'extrait » est à nouveau actif

#### Scenario: Erreur — Pas de réseau
- **ÉTANT DONNÉ QUE** l'ordinateur de l'utilisatrice n'a plus accès à internet
- **LORSQUE** elle clique sur « Ajouter l'extrait »
- **ALORS** le message « Connexion impossible » s'affiche
- **ET** aucun extrait n'est ajouté à la liste du panneau

### Requirement: Surligner dans la page les extraits ajoutés
Après l'ajout réussi d'un extrait, l'extension SHALL surligner en entier dans la page le passage ajouté, sans modifier le contenu de la page, et SHALL garder ce surlignage jusqu'à la fermeture du panneau, y compris quand l'utilisatrice change d'onglet.

#### Scenario: Nominal — Extrait surligné
- **ÉTANT DONNÉ QUE** l'utilisatrice a sélectionné deux paragraphes consécutifs de la page
- **LORSQUE** Notion confirme l'ajout de l'extrait
- **ALORS** les deux paragraphes sont surlignés en entier dans la page

#### Scenario: Alternatif — Retour sur l'onglet de l'extrait
- **ÉTANT DONNÉ QUE** un extrait a été ajouté et surligné dans un premier article
- **LORSQUE** l'utilisatrice active l'onglet d'un second article, puis revient au premier
- **ALORS** l'extrait est toujours surligné dans le premier article

#### Scenario: Erreur — Échec de l'ajout
- **ÉTANT DONNÉ QUE** l'ordinateur de l'utilisatrice n'a plus accès à internet
- **LORSQUE** elle clique sur « Ajouter l'extrait »
- **ALORS** le passage sélectionné n'est pas surligné

#### Scenario: Alternatif — Fermer le panneau
- **ÉTANT DONNÉ QUE** deux extraits sont surlignés dans la page
- **LORSQUE** l'utilisatrice ferme le panneau
- **ALORS** aucun passage n'est plus surligné dans la page

### Requirement: N'écouter la sélection que panneau ouvert
L'extension SHALL écouter la sélection uniquement dans l'onglet actif, uniquement après la création de l'item et tant que le panneau est ouvert, et SHALL cesser toute écoute dans la page à la fermeture du panneau, ainsi que dans un onglet qui n'est plus actif.

#### Scenario: Nominal — Fermer le panneau
- **ÉTANT DONNÉ QUE** l'item a été créé et l'aperçu suit la sélection de l'onglet actif
- **LORSQUE** l'utilisatrice ferme le panneau
- **ALORS** la page ne contient plus aucun écouteur de l'extension
