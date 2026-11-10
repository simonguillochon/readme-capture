# Spec Delta

## MODIFIED Requirements

### Requirement: Choisir la section de l'extrait
Le menu Section SHALL proposer les sections déjà créées pour l'item dans leur ordre de création, chacune préfixée par son niveau sous la forme « H2 · Titre », puis « + Nouvelle section… » et « Sans section », et SHALL pré-sélectionner la dernière section utilisée ou créée, ou « Sans section » si aucune ne l'a encore été.

#### Scenario: Nominal — Premier extrait
- **ÉTANT DONNÉ QUE** l'item vient d'être créé et aucun extrait n'a été ajouté
- **LORSQUE** l'utilisatrice regarde le menu Section
- **ALORS** « Sans section » est pré-sélectionné

#### Scenario: Nominal — Dernière section utilisée
- **ÉTANT DONNÉ QUE** l'utilisatrice a ajouté un extrait sous la section H1 « Le constat », puis un extrait sous la section H2 « Les leviers »
- **LORSQUE** elle sélectionne un nouveau passage
- **ALORS** le menu Section propose « H1 · Le constat », « H2 · Les leviers », « + Nouvelle section… » et « Sans section », dans cet ordre
- **ET** « H2 · Les leviers » est pré-sélectionné

### Requirement: Lister les extraits ajoutés
Le panneau SHALL lister les extraits ajoutés à l'item et les sections de l'item, y compris les sections sans extrait, regroupés dans l'ordre de la page Notion (les extraits sans section d'abord, puis chaque section sous son titre), en affichant les 2 premières lignes de chaque extrait.

#### Scenario: Nominal — Extraits dans deux sections
- **ÉTANT DONNÉ QUE** l'utilisatrice a ajouté un extrait sans section, puis un extrait sous « Le constat »
- **LORSQUE** elle regarde la liste des extraits
- **ALORS** la liste affiche d'abord l'extrait sans section, puis le titre « Le constat » suivi de son extrait

#### Scenario: Alternatif — Section sans extrait
- **ÉTANT DONNÉ QUE** l'utilisatrice a ajouté la section seule « Some Notes on Nomenclature », puis un extrait sous la section « – Experimentation »
- **LORSQUE** elle regarde la liste des extraits
- **ALORS** la liste affiche le titre « Some Notes on Nomenclature », sans extrait, puis le titre « – Experimentation » suivi de son extrait

## ADDED Requirements

### Requirement: Ajouter une section seule
Quand « + Nouvelle section… » est choisi, le panneau SHALL afficher, avec le choix du niveau, un bouton « Ajouter la section seule », actif dès que le titre de la section n'est ni vide ni composé uniquement d'espaces, même sans passage sélectionné. Au clic, l'extension SHALL écrire uniquement le titre, au niveau choisi, à la fin de la page Notion de l'item, et le panneau SHALL pré-sélectionner cette section dans le menu Section.

#### Scenario: Nominal — Section parente sans texte
- **ÉTANT DONNÉ QUE** la page Notion de l'item ne contient aucune section
- **ET** l'utilisatrice a choisi « + Nouvelle section… », saisi « Some Notes on Nomenclature » et choisi le niveau H1
- **LORSQUE** elle clique sur « Ajouter la section seule »
- **ALORS** la page Notion se termine par un titre de niveau 1 « Some Notes on Nomenclature », sans citation
- **ET** le menu Section pré-sélectionne « H1 · Some Notes on Nomenclature »

#### Scenario: Nominal — Sous-section avec son extrait
- **ÉTANT DONNÉ QUE** la page Notion de l'item se termine par la section seule H1 « Some Notes on Nomenclature »
- **ET** l'utilisatrice a sélectionné « The purpose of any experiment is to learn something. » et choisi « + Nouvelle section… » avec le titre « – Experimentation » au niveau H2
- **LORSQUE** elle clique sur « Ajouter l'extrait »
- **ALORS** la page Notion contient le titre de niveau 1 « Some Notes on Nomenclature », puis le titre de niveau 2 « – Experimentation », puis la citation du passage

#### Scenario: Alternatif — Aucun passage sélectionné
- **ÉTANT DONNÉ QUE** aucun texte n'est sélectionné dans l'onglet actif
- **LORSQUE** l'utilisatrice choisit « + Nouvelle section… » et saisit « Overview »
- **ALORS** le champ « Titre de la section » contient « Overview »
- **ET** le bouton « Ajouter la section seule » est actif
- **ET** le bouton « Ajouter l'extrait » est inactif

#### Scenario: Erreur — Titre de section seule vide
- **ÉTANT DONNÉ QUE** l'utilisatrice a choisi « + Nouvelle section… »
- **LORSQUE** le champ « Titre de la section » est vide
- **ALORS** le bouton « Ajouter la section seule » est inactif

### Requirement: Refuser une section seule au titre déjà utilisé
Si le titre saisi pour une nouvelle section est identique au titre d'une section existante de l'item, sans tenir compte de la casse ni des espaces en début et fin, le panneau SHALL afficher sous le champ « Titre de la section » le message « Cette section existe déjà » et SHALL rendre inactif le bouton « Ajouter la section seule ».

#### Scenario: Erreur — Section seule au nom déjà utilisé
- **ÉTANT DONNÉ QUE** l'item a une section « Le constat »
- **LORSQUE** l'utilisatrice choisit « + Nouvelle section… » et saisit « le constat »
- **ALORS** le message « Cette section existe déjà » s'affiche sous le champ « Titre de la section »
- **ET** le bouton « Ajouter la section seule » est inactif
- **ET** le bouton « Ajouter l'extrait » reste actif si un passage est sélectionné

### Requirement: Empêcher l'ajout en double d'une section seule
Pendant l'ajout d'une section seule, le bouton SHALL afficher « Ajout en cours… », et les boutons « Ajouter la section seule » et « Ajouter l'extrait » SHALL rester inactifs jusqu'à la réponse de Notion.

#### Scenario: Alternatif — Ajout de section en cours
- **ÉTANT DONNÉ QUE** l'utilisatrice a cliqué sur « Ajouter la section seule »
- **LORSQUE** Notion n'a pas encore répondu
- **ALORS** le bouton affiche « Ajout en cours… »
- **ET** les boutons « Ajouter la section seule » et « Ajouter l'extrait » sont inactifs

### Requirement: Indiquer la cause d'un échec d'ajout de section
Si l'ajout d'une section seule échoue, le panneau SHALL afficher le message de la cause la plus probable selon la table d'erreurs du PRD, avec « Item introuvable dans Notion » pour toute réponse 400 ou 404, et SHALL conserver le titre et le niveau saisis.

#### Scenario: Erreur — Pas de réseau pendant l'ajout d'une section
- **ÉTANT DONNÉ QUE** l'ordinateur de l'utilisatrice n'a plus accès à internet
- **LORSQUE** elle clique sur « Ajouter la section seule »
- **ALORS** le message « Connexion impossible » s'affiche
- **ET** le champ « Titre de la section » et le niveau choisi sont conservés
- **ET** aucune section n'est ajoutée à la liste ni au menu Section

### Requirement: Afficher la hiérarchie des sections
Dans la liste, le titre d'une section SHALL suivre le style de son niveau : H1 en texte `body` semi-gras de couleur principale, H2 en texte `body-s` medium de couleur principale, H3 en texte `caption` de couleur secondaire. Chaque section contenue dans une autre SHALL être décalée de 12 px de plus que sa section parente, avec ses extraits. Une section en contient une autre quand celle-ci la suit dans la page avec un niveau plus bas, jusqu'à la prochaine section de niveau égal ou supérieur.

#### Scenario: Nominal — Trois niveaux imbriqués
- **ÉTANT DONNÉ QUE** l'item a, dans cet ordre, la section H1 « Some Notes on Nomenclature », la section H2 « – Experimentation » et la section H3 « Definitions »
- **LORSQUE** l'utilisatrice regarde la liste des extraits
- **ALORS** « Some Notes on Nomenclature » est aligné à gauche, dans le style H1
- **ET** « – Experimentation » est décalé d'un cran, dans le style H2
- **ET** « Definitions » est décalé de deux crans, dans le style H3

#### Scenario: Alternatif — Sous-niveau sans parent
- **ÉTANT DONNÉ QUE** la première section de l'item est la section H2 « Overview »
- **LORSQUE** l'utilisatrice regarde la liste des extraits
- **ALORS** « Overview » est aligné à gauche, dans le style H2
