# Spec Delta

## Purpose

Permet à l'utilisatrice d'activer l'extension uniquement pendant ses sessions de veille, en ouvrant et fermant un panneau latéral à côté de la page lue.

## ADDED Requirements

### Requirement: Ouvrir et fermer le panneau par le bouton de l'extension
Un clic sur le bouton de l'extension, dans la barre d'URL, SHALL ouvrir le panneau latéral s'il est fermé, et le fermer s'il est ouvert.

#### Scenario: Nominal — Ouvrir le panneau
- **ÉTANT DONNÉ QUE** le panneau de l'extension est fermé
- **LORSQUE** l'utilisatrice clique sur le bouton de l'extension dans la barre d'URL
- **ALORS** le panneau de l'extension s'affiche à côté de la page

#### Scenario: Alternatif — Fermer le panneau
- **ÉTANT DONNÉ QUE** le panneau de l'extension est ouvert
- **LORSQUE** l'utilisatrice clique sur le bouton de l'extension dans la barre d'URL
- **ALORS** le panneau de l'extension se ferme

### Requirement: Rester inactive quand le panneau est fermé
Quand le panneau est fermé, l'extension SHALL ne lire ni ne modifier aucune page web visitée par l'utilisatrice.

#### Scenario: Alternatif — Navigation avec le panneau fermé
- **ÉTANT DONNÉ QUE** le panneau de l'extension est fermé
- **LORSQUE** l'utilisatrice charge la page https://example.com
- **ALORS** la page s'affiche sans aucun élément ni script ajouté par l'extension

### Requirement: Afficher l'état non configuré
Tant qu'aucune connexion à Notion n'a été enregistrée, le panneau SHALL afficher uniquement un message indiquant que la connexion à Notion n'est pas configurée et un lien vers la page d'options.

#### Scenario: Erreur — Ouvrir le panneau sans configuration
- **ÉTANT DONNÉ QUE** aucune connexion à Notion n'a été enregistrée
- **LORSQUE** l'utilisatrice ouvre le panneau
- **ALORS** le panneau affiche le message « La connexion à Notion n'est pas configurée »
- **ET** le panneau affiche un lien vers la page d'options
- **ET** le panneau n'affiche aucun autre contenu

#### Scenario: Nominal — Accéder aux options depuis le panneau
- **ÉTANT DONNÉ QUE** le panneau affiche l'état non configuré
- **LORSQUE** l'utilisatrice clique sur le lien vers la page d'options
- **ALORS** la page d'options de l'extension s'ouvre
