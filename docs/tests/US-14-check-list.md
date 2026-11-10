# US-14 — Check-list de tests manuels

Change OpenSpec : `us-14-structurer-sections`. Un point par scénario des specs de ce change, sur le cas d'origine : l'article SVPG « Experimentation, AI and the Product Model », où l'extrait « The purpose of any experiment is to learn something. » se range sous le H2 « – Experimentation », lui-même sous le H1 « Some Notes on Nomenclature », qui n'a aucun texte propre.

## Préparation

- Partir d'un dépôt à jour, avec les dépendances installées (`npm install`).
- Construire l'extension avec `npm run zip` et l'installer dans Dia en suivant la section « Installation dans Dia » du `README.md`. Vérifier que la page des extensions affiche Readme Capture 1.3.0.
- Configurer la base « Readme center (tests) » et le jeton de son intégration dans la page d'options. Ne jamais faire ces tests sur la base de production.
- Ouvrir l'article SVPG « Experimentation, AI and the Product Model » dans Dia, ouvrir le panneau et créer l'item. Garder la page Notion de l'item ouverte dans un autre onglet pour suivre son contenu.
- Les points sur l'affichage de la liste se vérifient en mode clair, puis en mode sombre du système.

## Capture des extraits (`extract-capture`)

### Choisir la section de l'extrait

- [x] **Nominal — Premier extrait** : l'item vient d'être créé, sans extrait. Le menu Section pré-sélectionne « Sans section ».
- [x] **Nominal — Dernière section utilisée** : ajouter un extrait sous la nouvelle section H1 « Le constat », puis un extrait sous la nouvelle section H2 « Les leviers ». Sélectionner un nouveau passage. Le menu Section propose « H1 · Le constat », « H2 · Les leviers », « + Nouvelle section… » et « Sans section », dans cet ordre, et « H2 · Les leviers » est pré-sélectionné.

### Lister les extraits ajoutés

- [x] **Nominal — Extraits dans deux sections** : sur un nouvel item, ajouter un extrait sans section, puis un extrait sous « Le constat ». La liste affiche d'abord l'extrait sans section, puis le titre « Le constat » suivi de son extrait.
- [x] **Alternatif — Section sans extrait** : sur un nouvel item, ajouter la section seule « Some Notes on Nomenclature », puis un extrait sous la nouvelle section « – Experimentation ». La liste affiche le titre « Some Notes on Nomenclature » sans extrait, puis le titre « – Experimentation » suivi de son extrait.

### Ajouter une section seule

- [x] **Nominal — Section parente sans texte** : sur un nouvel item, choisir « + Nouvelle section… », saisir « Some Notes on Nomenclature », choisir H1 et cliquer sur « Ajouter la section seule ». La page Notion se termine par un titre de niveau 1 « Some Notes on Nomenclature », sans citation, et le menu Section pré-sélectionne « H1 · Some Notes on Nomenclature ».
- [x] **Nominal — Sous-section avec son extrait** : à la suite, sélectionner « The purpose of any experiment is to learn something. », choisir « + Nouvelle section… » avec le titre « – Experimentation » au niveau H2, puis cliquer sur « Ajouter l'extrait ». La page Notion contient le titre de niveau 1 « Some Notes on Nomenclature », puis le titre de niveau 2 « – Experimentation », puis la citation du passage.
- [x] **Alternatif — Aucun passage sélectionné** : sans texte sélectionné dans l'onglet, choisir « + Nouvelle section… » et saisir « Overview ». Le champ « Titre de la section » contient « Overview », « Ajouter la section seule » est actif et « Ajouter l'extrait » est inactif.
- [x] **Erreur — Titre de section seule vide** : choisir « + Nouvelle section… » et vider le champ « Titre de la section », puis y saisir seulement des espaces. Dans les deux cas, « Ajouter la section seule » est inactif.

### Refuser une section seule au titre déjà utilisé

- [x] **Erreur — Section seule au nom déjà utilisé** : l'item ayant la section « Le constat », choisir « + Nouvelle section… » et saisir « le constat ». Le message « Cette section existe déjà » s'affiche sous le champ « Titre de la section », « Ajouter la section seule » est inactif, et « Ajouter l'extrait » reste actif si un passage est sélectionné.

### Empêcher l'ajout en double d'une section seule

- [x] **Alternatif — Ajout de section en cours** : limiter le réseau dans les outils de développement du panneau (préréglage « 3G lente »), puis cliquer sur « Ajouter la section seule ». Tant que Notion n'a pas répondu, le bouton affiche « Ajout en cours… », et « Ajouter la section seule » et « Ajouter l'extrait » sont inactifs.

### Indiquer la cause d'un échec d'ajout de section

- [x] **Erreur — Pas de réseau pendant l'ajout d'une section** : couper l'accès à internet, saisir « Overview » au niveau H2 et cliquer sur « Ajouter la section seule ». Le message « Connexion impossible » s'affiche, le titre « Overview » et le niveau H2 sont conservés, et aucune section n'est ajoutée à la liste ni au menu Section. Rétablir l'accès et cliquer sur « Réessayer » : la section est ajoutée.

### Afficher la hiérarchie des sections

- [x] **Nominal — Trois niveaux imbriqués** : sur un nouvel item, ajouter dans cet ordre les sections seules H1 « Some Notes on Nomenclature », H2 « – Experimentation » et H3 « Definitions ». « Some Notes on Nomenclature » est aligné à gauche dans le style H1, « – Experimentation » est décalé d'un cran dans le style H2, et « Definitions » est décalé de deux crans dans le style H3. Vérifier en mode clair et en mode sombre.
- [x] **Alternatif — Sous-niveau sans parent** : sur un nouvel item, ajouter en premier la section seule H2 « Overview ». « Overview » est aligné à gauche, dans le style H2. Vérifier en mode clair et en mode sombre.

## Modification des extraits (`extract-editing`)

### Ouvrir la modification d'un extrait

- [x] **Nominal — Ouvrir la modification** : l'extrait « Culture is what people do when no one is watching. » étant rangé sous la section H1 « Le constat », cliquer sur « Modifier ». Le champ texte contient l'extrait, le menu « Section » propose les sections de l'item, préfixées par leur niveau, et « Sans section », sans « + Nouvelle section… », et « H1 · Le constat » est pré-sélectionné.
- [x] **Alternatif — Annuler la modification** : modifier le texte d'un extrait sans l'enregistrer, puis cliquer sur « Annuler ». L'extrait réapparaît avec son texte d'origine, et rien n'est envoyé à Notion.

### Empêcher une double action pendant l'envoi

- [x] **Alternatif — Suppression en cours** : réseau limité, cliquer sur « Supprimer » pour un extrait. Tant que Notion n'a pas répondu, l'action affiche « Suppression en cours… », et les autres actions de la liste et « Ajouter l'extrait » sont inactifs.
- [x] **Alternatif — Suppression de section en cours** : réseau limité, confirmer la suppression d'une section non vide. Tant que Notion n'a pas répondu, le bouton de confirmation affiche « Suppression en cours… », et les actions de la liste, « Ajouter l'extrait » et « Ajouter la section seule » sont inactifs.

### Conserver une section vidée

- [x] **Nominal — Supprimer le dernier extrait d'une section** : la section « Les leviers » contenant un seul extrait, supprimer cet extrait. Le titre « Les leviers » est toujours dans la page Notion, et la liste affiche « Les leviers » sans extrait.
- [x] **Alternatif — Déplacer le dernier extrait d'une section** : la section « Les leviers » contenant un seul extrait, le déplacer vers « Le constat ». Le titre « Les leviers » est toujours dans la page Notion, et l'extrait est à la fin de « Le constat ».

### Proposer la suppression de chaque section

- [x] **Nominal — Action sur un titre de section** : l'item ayant la section « Le constat », le titre « Le constat » de la liste propose le bouton corbeille « Supprimer la section ».
- [x] **Alternatif — Extrait en cours de modification** : ouvrir la modification d'un extrait. Les actions « Supprimer la section » de tous les titres de section sont inactives.

### Supprimer une section vide sans confirmation

- [x] **Nominal — Section créée par erreur** : ajouter la section seule « Overveiw », puis cliquer sur « Supprimer la section » pour elle. Aucune confirmation ne s'affiche, le titre « Overveiw » n'est plus dans la page Notion, et ni la liste ni les menus Section ne proposent plus « Overveiw ».

### Confirmer la suppression d'une section non vide

- [x] **Nominal — Section avec une sous-section** : la section H1 « Some Notes on Nomenclature » contenant une citation et la section H2 « – Experimentation », qui contient « The purpose of any experiment is to learn something. », cliquer sur « Supprimer la section » pour « Some Notes on Nomenclature ». Le message « Cette section contient 2 citations et 1 section, qui seront supprimées de Notion. » s'affiche sous le titre avec les boutons « Supprimer la section » et « Annuler », et rien n'est encore supprimé dans Notion.
- [x] **Alternatif — Annuler la suppression** : la confirmation de suppression de « Les leviers » étant affichée, cliquer sur « Annuler ». Le message n'est plus affiché, et la section et sa citation sont toujours dans la liste et dans la page Notion.

### Compter le contenu dans la confirmation

- [x] **Alternatif — Une seule citation** : la section « Les leviers » contenant une seule citation et aucune section, cliquer sur « Supprimer la section ». Le message « Cette section contient 1 citation, qui sera supprimée de Notion. » s'affiche sous le titre.
- [x] **Alternatif — Sections sans citation** : la section H1 « Some Notes on Nomenclature » ne contenant que les sections seules H2 « – Experimentation » et « – Product Model », cliquer sur « Supprimer la section » pour « Some Notes on Nomenclature ». Le message « Cette section contient 2 sections, qui seront supprimées de Notion. » s'affiche sous le titre.

### Supprimer une section avec tout son contenu

- [x] **Nominal — Supprimer une section parente** : la section H1 « Some Notes on Nomenclature » contenant la section H2 « – Experimentation » et sa citation surlignée dans l'article, suivies de la section H1 « Overview » avec une citation, confirmer la suppression de « Some Notes on Nomenclature ». La page Notion ne contient plus ni « Some Notes on Nomenclature », ni « – Experimentation », ni sa citation ; « Overview » et sa citation sont intactes ; le passage « The purpose of any experiment is to learn something. » n'est plus surligné dans l'article.
- [x] **Alternatif — Section pré-sélectionnée supprimée** : « – Experimentation » étant pré-sélectionnée dans la zone d'ajout, supprimer « Some Notes on Nomenclature », qui la contient. « Sans section » est pré-sélectionné dans la zone d'ajout.

### Indiquer la cause d'un échec de suppression de section

- [x] **Erreur — Coupure réseau pendant la suppression** : la section « Les leviers » contenant deux citations, réseau limité, confirmer sa suppression et couper l'accès à internet dès que la première citation a disparu de la page Notion. Le message « Connexion impossible » s'affiche sous le titre « Les leviers », la liste n'affiche plus la première citation, et « Les leviers » et sa seconde citation sont toujours dans la liste. Rétablir l'accès et cliquer sur « Réessayer » : la section et sa seconde citation sont supprimées.
- [x] **Alternatif — Section déjà supprimée dans Notion** : ajouter la section seule « Overview », supprimer son titre directement dans Notion, puis cliquer sur « Supprimer la section » pour « Overview » dans le panneau. La section n'est plus dans la liste, et aucun message d'erreur ne s'affiche.

## Session de capture (`capture-session`)

### Bloquer « Terminer » pendant un envoi

- [x] **Alternatif — Ajout d'extrait en cours** : réseau limité, cliquer sur « Ajouter l'extrait ». Tant que Notion n'a pas répondu, « Terminer » est inactif.
- [x] **Alternatif — Suppression de section en cours** : réseau limité, confirmer la suppression d'une section. Tant que Notion n'a pas répondu, « Terminer » est inactif.

## Reprise après erreur Notion (`notion-error-recovery`)

### Proposer de terminer une capture dont l'item n'existe plus

- [x] **Nominal — Item mis à la corbeille avec une description en cours** : mettre l'item à la corbeille dans Notion, saisir une description et cliquer sur « Enregistrer la description ». Le message « Item introuvable dans Notion » s'affiche avec « Terminer la capture » ; cliquer dessus. Le panneau affiche le formulaire de préparation pré-rempli depuis l'onglet actif, sans message de confirmation.
- [x] **Alternatif — Item mis à la corbeille avant l'ajout d'une section** : mettre l'item à la corbeille dans Notion, puis cliquer sur « Ajouter la section seule » pour « Overview ». Le message « Item introuvable dans Notion » s'affiche, avec le bouton « Terminer la capture » dessous.
