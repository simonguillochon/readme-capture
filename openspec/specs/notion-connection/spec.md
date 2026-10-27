# notion-connection Specification

## Purpose

Relie l'extension à la base Notion de l'utilisatrice, à partir d'un jeton d'intégration et de l'URL de la base saisis localement, jamais présents dans le code.

## Requirements

### Requirement: Saisir le jeton et l'URL de la base
La page d'options SHALL proposer deux champs obligatoires, « Jeton d'intégration Notion » et « URL de la base », et un bouton « Enregistrer » qui reste inactif tant qu'un des deux champs est vide.

#### Scenario: Nominal — Champs remplis
- **ÉTANT DONNÉ QUE** l'utilisatrice a ouvert la page d'options
- **LORSQUE** elle saisit un jeton dans « Jeton d'intégration Notion »
- **ET** elle saisit une URL dans « URL de la base »
- **ALORS** le bouton « Enregistrer » devient actif

#### Scenario: Erreur — Champ vide
- **ÉTANT DONNÉ QUE** l'utilisatrice a ouvert la page d'options
- **LORSQUE** elle saisit un jeton et laisse « URL de la base » vide
- **ALORS** le bouton « Enregistrer » reste inactif

### Requirement: Masquer le jeton par défaut
Le champ « Jeton d'intégration Notion » SHALL masquer les caractères saisis par défaut et proposer une commande qui affiche ou masque le jeton.

#### Scenario: Nominal — Saisie masquée
- **ÉTANT DONNÉ QUE** l'utilisatrice a ouvert la page d'options
- **LORSQUE** elle saisit le jeton « ntn_exemple123 »
- **ALORS** le champ affiche des caractères masqués à la place du jeton

#### Scenario: Alternatif — Afficher puis masquer le jeton
- **ÉTANT DONNÉ QUE** l'utilisatrice a saisi le jeton « ntn_exemple123 »
- **LORSQUE** elle active la commande d'affichage du jeton
- **ALORS** le champ affiche « ntn_exemple123 » en clair
- **ET** une nouvelle activation de la commande masque à nouveau le jeton

### Requirement: Extraire l'identifiant depuis l'URL de la base
Le champ « URL de la base » SHALL accepter uniquement une URL Notion, sur un domaine notion.so ou notion.com, dont le chemin contient l'identifiant de la base (32 caractères hexadécimaux, avec ou sans tirets), et l'extension SHALL en extraire cet identifiant.

#### Scenario: Nominal — URL copiée depuis Notion
- **ÉTANT DONNÉ QUE** l'utilisatrice a ouvert la page d'options
- **LORSQUE** elle saisit « https://app.notion.com/p/exemple/0123456789abcdef0123456789abcdef?v=fedcba9876543210fedcba9876543210 » dans « URL de la base »
- **ALORS** l'identifiant retenu est « 0123456789abcdef0123456789abcdef »

#### Scenario: Alternatif — URL avec le nom de la base dans le chemin
- **ÉTANT DONNÉ QUE** l'utilisatrice a ouvert la page d'options
- **LORSQUE** elle saisit « https://www.notion.so/exemple/Readme-center-0123456789abcdef0123456789abcdef » dans « URL de la base »
- **ALORS** l'identifiant retenu est « 0123456789abcdef0123456789abcdef »

#### Scenario: Erreur — Identifiant seul
- **ÉTANT DONNÉ QUE** l'utilisatrice a ouvert la page d'options
- **LORSQUE** elle saisit « 0123456789abcdef0123456789abcdef » dans « URL de la base » et clique sur « Enregistrer »
- **ALORS** le message « URL de base non reconnue » s'affiche
- **ET** aucune configuration n'est enregistrée

#### Scenario: Erreur — URL hors Notion
- **ÉTANT DONNÉ QUE** l'utilisatrice a ouvert la page d'options
- **LORSQUE** elle saisit « https://example.com/0123456789abcdef0123456789abcdef » dans « URL de la base » et clique sur « Enregistrer »
- **ALORS** le message « URL de base non reconnue » s'affiche
- **ET** aucune configuration n'est enregistrée

### Requirement: Vérifier la connexion avant d'enregistrer
Au clic sur « Enregistrer », l'extension SHALL vérifier auprès de Notion que la base est accessible avec ce jeton et qu'elle contient les propriétés Title, URL, Source, Date, Theme et Description, avec leurs types attendus, et n'enregistrer la configuration que si cette vérification réussit.

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

### Requirement: Indiquer la cause d'un échec de vérification
En cas d'échec de la vérification, la page d'options SHALL afficher le message correspondant à la cause la plus probable : « Connexion impossible » sans réseau, « Jeton Notion invalide » pour un jeton refusé, « Base inaccessible » pour une base introuvable ou non partagée, « La base Notion a changé » pour une propriété manquante ou d'un autre type, « Notion ne répond pas » pour une indisponibilité de Notion.

#### Scenario: Erreur — Jeton refusé
- **ÉTANT DONNÉ QUE** l'utilisatrice a saisi un jeton révoqué
- **LORSQUE** elle clique sur « Enregistrer »
- **ALORS** le message « Jeton Notion invalide » s'affiche

#### Scenario: Erreur — Base non partagée avec l'intégration
- **ÉTANT DONNÉ QUE** l'utilisatrice a saisi un jeton valide et l'URL d'une base non partagée avec l'intégration
- **LORSQUE** elle clique sur « Enregistrer »
- **ALORS** le message « Base inaccessible » s'affiche

#### Scenario: Erreur — Propriété manquante
- **ÉTANT DONNÉ QUE** l'utilisatrice a saisi l'URL d'une base accessible sans propriété Theme
- **LORSQUE** elle clique sur « Enregistrer »
- **ALORS** le message « La base Notion a changé » s'affiche

#### Scenario: Erreur — Pas de réseau
- **ÉTANT DONNÉ QUE** l'ordinateur de l'utilisatrice n'a pas accès à internet
- **LORSQUE** elle clique sur « Enregistrer »
- **ALORS** le message « Connexion impossible » s'affiche

#### Scenario: Erreur — Notion indisponible
- **ÉTANT DONNÉ QUE** Notion répond par une erreur serveur
- **LORSQUE** l'utilisatrice clique sur « Enregistrer »
- **ALORS** le message « Notion ne répond pas » s'affiche

### Requirement: Réessayer automatiquement en cas de limitation
Quand Notion limite le nombre d'appels pendant la vérification, l'extension SHALL afficher « Notion limite les appels » et relancer la vérification automatiquement après le délai indiqué par Notion.

#### Scenario: Alternatif — Limitation temporaire
- **ÉTANT DONNÉ QUE** Notion limite les appels et demande d'attendre 2 secondes
- **LORSQUE** l'utilisatrice clique sur « Enregistrer »
- **ALORS** le message « Notion limite les appels » s'affiche
- **ET** la vérification est relancée automatiquement après 2 secondes

### Requirement: Conserver la configuration localement
L'extension SHALL stocker le jeton, l'URL et l'identifiant de la base uniquement dans son stockage local, et ne les transmettre qu'à l'API Notion.

#### Scenario: Nominal — Configuration conservée après redémarrage
- **ÉTANT DONNÉ QUE** l'utilisatrice a enregistré une configuration vérifiée
- **LORSQUE** elle redémarre Zen et rouvre la page d'options
- **ALORS** la configuration enregistrée est toujours présente
