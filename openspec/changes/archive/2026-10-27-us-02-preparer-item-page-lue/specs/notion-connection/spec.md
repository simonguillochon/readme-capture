# Spec Delta

## MODIFIED Requirements

### Requirement: Vérifier la connexion avant d'enregistrer
Au clic sur « Enregistrer », l'extension SHALL vérifier auprès de Notion que la base est accessible avec ce jeton et qu'elle contient les propriétés Title, URL, Source, Date, Theme, Description et LinkedIn auteur, avec leurs types attendus, et n'enregistrer la configuration que si cette vérification réussit.

#### Scenario: Nominal — Connexion vérifiée
- **ÉTANT DONNÉ QUE** l'utilisatrice a saisi un jeton valide et l'URL de la base Readme center
- **ET** la base est partagée avec l'intégration
- **LORSQUE** elle clique sur « Enregistrer »
- **ALORS** le message « Connexion vérifiée : Readme center » s'affiche
- **ET** la configuration est enregistrée

#### Scenario: Alternatif — Remplacer une configuration existante
- **ÉTANT DONNÉ QUE** une configuration vérifiée est déjà enregistrée
- **LORSQUE** l'utilisatrice rouvre la page d'options
- **ALORS** « URL de la base » affiche l'URL enregistrée
- **ET** « Jeton d'intégration Notion » affiche le jeton enregistré sous forme masquée
- **ET** un nouvel enregistrement vérifié remplace la configuration précédente

#### Scenario: Erreur — Échec de la vérification
- **ÉTANT DONNÉ QUE** une configuration vérifiée est déjà enregistrée
- **LORSQUE** l'utilisatrice saisit un nouveau jeton refusé par Notion et clique sur « Enregistrer »
- **ALORS** un message d'erreur s'affiche
- **ET** les valeurs saisies restent dans les champs
- **ET** la configuration précédente reste enregistrée sans modification

#### Scenario: Erreur — Base sans propriété LinkedIn auteur
- **ÉTANT DONNÉ QUE** l'utilisatrice a saisi l'URL d'une base accessible qui n'a pas de propriété LinkedIn auteur de type URL
- **LORSQUE** elle clique sur « Enregistrer »
- **ALORS** le message « La base Notion a changé » s'affiche
- **ET** aucune configuration n'est enregistrée
