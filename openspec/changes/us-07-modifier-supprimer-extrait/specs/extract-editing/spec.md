# Spec Delta

## Purpose

Permet de corriger, de ranger autrement ou de supprimer depuis le panneau les extraits ajoutés à l'item, en répercutant chaque changement dans la page Notion.

## ADDED Requirements

### Requirement: Proposer les actions sur chaque extrait
Chaque extrait de la liste SHALL proposer les actions « Modifier » et « Supprimer », et un seul extrait SHALL pouvoir être en cours de modification à la fois.

#### Scenario: Nominal — Actions d'un extrait
- **ÉTANT DONNÉ QUE** l'utilisatrice a ajouté un extrait sous la section « Le constat »
- **LORSQUE** elle regarde la liste des extraits
- **ALORS** l'extrait propose les actions « Modifier » et « Supprimer »

#### Scenario: Alternatif — Modifier un second extrait
- **ÉTANT DONNÉ QUE** l'utilisatrice a ouvert la modification d'un premier extrait
- **LORSQUE** elle regarde les autres extraits de la liste
- **ALORS** leurs actions « Modifier » et « Supprimer » sont inactives

### Requirement: Ouvrir la modification d'un extrait
L'action « Modifier » SHALL remplacer l'extrait dans la liste par un champ texte pré-rempli avec son texte complet, un menu « Section » proposant les sections de l'item et « Sans section », pré-sélectionné sur sa section actuelle, et les boutons « Enregistrer » et « Annuler ».

#### Scenario: Nominal — Ouvrir la modification
- **ÉTANT DONNÉ QUE** l'extrait « Culture is what people do when no one is watching. » est rangé sous « Le constat »
- **LORSQUE** l'utilisatrice clique sur « Modifier »
- **ALORS** le champ texte contient « Culture is what people do when no one is watching. »
- **ET** le menu « Section » propose les sections de l'item et « Sans section », sans « + Nouvelle section… »
- **ET** « Le constat » est pré-sélectionné

#### Scenario: Alternatif — Annuler la modification
- **ÉTANT DONNÉ QUE** l'utilisatrice a modifié le texte d'un extrait sans l'enregistrer
- **LORSQUE** elle clique sur « Annuler »
- **ALORS** l'extrait réapparaît dans la liste avec son texte d'origine
- **ET** rien n'est envoyé à Notion

### Requirement: Activer l'enregistrement uniquement si l'extrait a changé
Le bouton « Enregistrer » SHALL être actif si et seulement si le texte n'est pas vide ni composé uniquement d'espaces, et si le texte ou la section diffère de l'extrait enregistré.

#### Scenario: Erreur — Texte vidé
- **ÉTANT DONNÉ QUE** l'utilisatrice a ouvert la modification d'un extrait
- **LORSQUE** elle vide entièrement le champ texte
- **ALORS** le bouton « Enregistrer » est inactif

#### Scenario: Alternatif — Rien n'a changé
- **ÉTANT DONNÉ QUE** l'utilisatrice a ouvert la modification d'un extrait
- **LORSQUE** elle n'a modifié ni le texte ni la section
- **ALORS** le bouton « Enregistrer » est inactif

### Requirement: Enregistrer le texte modifié d'un extrait
Quand seul le texte a changé, l'extension SHALL remplacer le texte de la citation existante dans la page Notion, à la même place, en texte brut, sauts de ligne compris.

#### Scenario: Nominal — Corriger une coquille
- **ÉTANT DONNÉ QUE** l'extrait « Culture is what poeple do. » est rangé sous « Le constat »
- **LORSQUE** l'utilisatrice remplace son texte par « Culture is what people do. » et clique sur « Enregistrer »
- **ALORS** la citation de la page Notion contient « Culture is what people do. », à la même place sous « Le constat »
- **ET** la liste affiche le texte corrigé

### Requirement: Déplacer un extrait vers une autre section
Quand la section a changé, l'extension SHALL écrire la citation, avec son texte éventuellement modifié, à la fin de sa nouvelle section, ou en haut de la page après les autres extraits sans section pour « Sans section », puis SHALL supprimer la citation d'origine.

#### Scenario: Nominal — Ranger un extrait dans une autre section
- **ÉTANT DONNÉ QUE** la page contient la section « Le constat » avec deux citations, puis la section « Les leviers » avec une citation
- **LORSQUE** l'utilisatrice déplace la première citation de « Le constat » vers « Les leviers » et clique sur « Enregistrer »
- **ALORS** la citation est placée après la citation existante de « Les leviers »
- **ET** « Le constat » ne contient plus que sa seconde citation

#### Scenario: Alternatif — Sortir un extrait de sa section
- **ÉTANT DONNÉ QUE** la page contient une citation sans section, puis la section « Le constat » avec deux citations
- **LORSQUE** l'utilisatrice choisit « Sans section » pour une citation de « Le constat » et clique sur « Enregistrer »
- **ALORS** la citation est placée après la citation sans section existante et avant le titre « Le constat »

#### Scenario: Alternatif — Déplacer et corriger en une fois
- **ÉTANT DONNÉ QUE** l'utilisatrice a modifié le texte d'un extrait et choisi une autre section
- **LORSQUE** elle clique sur « Enregistrer »
- **ALORS** la citation placée dans la nouvelle section contient le texte modifié

### Requirement: Supprimer un extrait
L'action « Supprimer » SHALL supprimer immédiatement, sans confirmation, la citation de la page Notion et l'extrait de la liste du panneau.

#### Scenario: Nominal — Supprimer un extrait
- **ÉTANT DONNÉ QUE** la section « Le constat » contient deux extraits
- **LORSQUE** l'utilisatrice clique sur « Supprimer » pour le premier
- **ALORS** sa citation n'est plus dans la page Notion
- **ET** la liste n'affiche plus que le second extrait sous « Le constat »

### Requirement: Supprimer une section vidée
Quand une section n'a plus aucun extrait, après une suppression ou un déplacement, l'extension SHALL supprimer son titre de la page Notion, et le panneau SHALL ne plus la proposer dans aucun menu Section ni l'afficher dans la liste.

#### Scenario: Nominal — Supprimer le dernier extrait d'une section
- **ÉTANT DONNÉ QUE** la section « Les leviers » contient un seul extrait
- **LORSQUE** l'utilisatrice supprime cet extrait
- **ALORS** le titre « Les leviers » n'est plus dans la page Notion
- **ET** le menu Section ne propose plus « Les leviers »

#### Scenario: Alternatif — Déplacer le dernier extrait d'une section
- **ÉTANT DONNÉ QUE** la section « Les leviers » contient un seul extrait
- **LORSQUE** l'utilisatrice déplace cet extrait vers « Le constat »
- **ALORS** le titre « Les leviers » n'est plus dans la page Notion
- **ET** l'extrait est à la fin de « Le constat »

#### Scenario: Alternatif — Section pré-sélectionnée supprimée
- **ÉTANT DONNÉ QUE** « Les leviers » est la section pré-sélectionnée dans la zone d'ajout et ne contient qu'un extrait
- **LORSQUE** l'utilisatrice supprime cet extrait
- **ALORS** « Sans section » est pré-sélectionné dans la zone d'ajout

### Requirement: Empêcher une double action pendant l'envoi
Pendant l'enregistrement ou la suppression d'un extrait, le bouton concerné SHALL afficher « Enregistrement en cours… » ou « Suppression en cours… », et toutes les actions de la liste et le bouton « Ajouter l'extrait » SHALL rester inactifs jusqu'à la réponse de Notion.

#### Scenario: Alternatif — Suppression en cours
- **ÉTANT DONNÉ QUE** l'utilisatrice a cliqué sur « Supprimer » pour un extrait
- **LORSQUE** Notion n'a pas encore répondu
- **ALORS** l'action affiche « Suppression en cours… »
- **ET** les autres actions de la liste et le bouton « Ajouter l'extrait » sont inactifs

### Requirement: Indiquer la cause d'un échec de modification ou de suppression
Si l'enregistrement ou la suppression échoue, le panneau SHALL afficher sous l'extrait concerné le message de la cause la plus probable selon la table d'erreurs du PRD, avec « Item introuvable dans Notion » pour toute réponse 400 ou 404 à un enregistrement, et SHALL conserver le texte et la section en cours de modification.

#### Scenario: Erreur — Extrait supprimé directement dans Notion
- **ÉTANT DONNÉ QUE** l'utilisatrice a supprimé une citation directement dans Notion
- **LORSQUE** elle modifie le texte de cet extrait dans le panneau et clique sur « Enregistrer »
- **ALORS** le message « Item introuvable dans Notion » s'affiche sous l'extrait
- **ET** le champ texte contient toujours le texte modifié

#### Scenario: Erreur — Pas de réseau pendant une suppression
- **ÉTANT DONNÉ QUE** l'ordinateur de l'utilisatrice n'a plus accès à internet
- **LORSQUE** elle clique sur « Supprimer » pour un extrait
- **ALORS** le message « Connexion impossible » s'affiche sous l'extrait
- **ET** l'extrait reste dans la liste

### Requirement: Retirer de la liste un extrait déjà supprimé dans Notion
Si Notion répond 400 ou 404 à la suppression d'un extrait, l'extension SHALL considérer la suppression comme réussie et retirer l'extrait de la liste.

#### Scenario: Alternatif — Supprimer un extrait déjà supprimé dans Notion
- **ÉTANT DONNÉ QUE** l'utilisatrice a supprimé une citation directement dans Notion
- **LORSQUE** elle clique sur « Supprimer » pour cet extrait dans le panneau
- **ALORS** l'extrait n'est plus dans la liste
- **ET** aucun message d'erreur ne s'affiche

### Requirement: Retirer le surlignage d'un extrait supprimé
À la suppression d'un extrait, l'extension SHALL retirer son surlignage de la page lue si cette page est encore ouverte, et SHALL garder le surlignage d'un extrait modifié ou déplacé.

#### Scenario: Nominal — Supprimer un extrait surligné
- **ÉTANT DONNÉ QUE** deux extraits sont surlignés dans la page lue
- **LORSQUE** l'utilisatrice supprime le premier depuis le panneau
- **ALORS** seul le second passage reste surligné dans la page

#### Scenario: Alternatif — Déplacer un extrait surligné
- **ÉTANT DONNÉ QUE** un extrait est surligné dans la page lue
- **LORSQUE** l'utilisatrice le déplace vers une autre section
- **ALORS** le passage reste surligné dans la page
