# US-06 — Check-list de tests manuels

Change OpenSpec : `us-06-ajouter-extrait-section`. Un point par scénario des specs `extract-capture` et `item-editing` de ce change.

## Préparation

- Construire l'extension avec `npm run build`, puis la charger en temporaire dans Zen (voir `README.md`).
- Utiliser la base « Readme center (tests) » et le jeton de son intégration, avec une configuration vérifiée. Ne jamais faire ces tests sur la base de production.
- Garder la base de test ouverte dans Notion pour contrôler le corps des pages des items.
- Sauf mention contraire, chaque point commence par la création d'un item depuis un article qui contient des titres (`h1` à `h6`) : remplir le formulaire, puis cliquer sur « Ajouter ».
- Vérifier une fois l'en-tête du formulaire replié au clavier : Tab pour atteindre le chevron et le titre (anneau de focus `accent`), Entrée ou Espace pour déplier et replier, puis Tab vers « Ouvrir dans Notion ». Vérifier aussi les modes clair et sombre.
- Vérifier une fois le menu Section au clavier : Tab pour l'atteindre (contour de focus `border/accent`), flèches pour changer d'option, Espace ou Entrée pour ouvrir la liste, Échap pour la fermer.
- À la fin des tests, mettre à la corbeille tous les items créés dans la base de test.

## Capture des extraits (`extract-capture`)

### Proposer la capture d'extraits une fois l'item créé

- [x] **Nominal — Item créé** : cliquer sur « Ajouter ». Sous le formulaire, après un trait de séparation, la zone des extraits s'affiche : aperçu, menu « Section » et bouton « Ajouter l'extrait ».
- [x] **Alternatif — Item pas encore créé** : avant de cliquer sur « Ajouter », sélectionner un passage dans la page. Aucune zone des extraits n'est affichée.

### Afficher en direct l'aperçu de la sélection

- [x] **Nominal — Sélectionner un passage** : après la création, sélectionner le passage « Culture is what people do when no one is watching. » (ou un passage équivalent) dans la page. L'aperçu affiche ce passage, limité à 5 lignes.
- [x] **Alternatif — Aucune sélection** : après la création, cliquer dans la page sans sélectionner de texte. L'aperçu affiche « Sélectionne un passage dans la page » et « Ajouter l'extrait » est inactif.
- [x] **Alternatif — Sélection dans un autre onglet** : créer l'item depuis un premier article, activer l'onglet d'un second article et y sélectionner un passage. L'aperçu affiche ce passage, sans aucun avertissement.

### Signaler une page où la sélection est impossible

- [x] **Erreur — Page interne du navigateur** : après la création, activer un onglet « about:newtab ». Le message « Sélection impossible sur cette page » s'affiche et « Ajouter l'extrait » est inactif.

### Choisir la section de l'extrait

- [x] **Nominal — Premier extrait** : juste après la création, regarder le menu « Section ». « Sans section » est pré-sélectionné.
- [x] **Nominal — Dernière section utilisée** : ajouter un extrait sous une nouvelle section « Le constat », puis un extrait sous une nouvelle section « Les leviers », puis sélectionner un nouveau passage. Le menu propose « Le constat », « Les leviers », « + Nouvelle section… » et « Sans section », dans cet ordre, et « Les leviers » est pré-sélectionné.

### Créer une section à partir du titre le plus proche

- [x] **Nominal — Titre de section pré-rempli** : sélectionner un passage situé sous un titre de la page (par exemple « Why culture eats strategy »), puis choisir « + Nouvelle section… ». Le champ « Titre de la section » contient ce titre et le niveau H1 est choisi.
- [x] **Alternatif — Page sans titre avant la sélection** : sélectionner un passage situé avant tout titre de la page, puis choisir « + Nouvelle section… ». Le champ « Titre de la section » est vide.
- [x] **Erreur — Titre de section vide** : choisir « + Nouvelle section… », sélectionner un passage, puis vider le champ « Titre de la section ». « Ajouter l'extrait » est inactif.

### Écrire l'extrait en citation sous sa section

- [x] **Nominal — Extrait sous une nouvelle section** : sur un item sans section, sélectionner un passage, choisir « + Nouvelle section… », saisir « Le constat », choisir H2, puis cliquer sur « Ajouter l'extrait ». Dans Notion, la page contient un titre de niveau 2 « Le constat » suivi d'une citation du passage.
- [x] **Alternatif — Extrait sous une section existante, après la création d'une autre section** : avec la section « Le constat » et sa citation, puis la section « Les leviers » et sa citation, ajouter un extrait sous « Le constat ». Dans Notion, la nouvelle citation est après la citation existante de « Le constat » et avant le titre « Les leviers ».
- [x] **Alternatif — Passage sur plusieurs paragraphes** : sélectionner deux paragraphes consécutifs contenant un mot en gras ou un lien, puis ajouter l'extrait. Dans Notion, la page contient une seule citation avec les deux paragraphes séparés par un saut de ligne, sans gras ni lien.

### Placer les extraits sans section en haut de la page

- [x] **Nominal — Extrait sans section avec des sections existantes** : avec une citation sans section puis la section « Le constat », ajouter un extrait avec « Sans section ». Dans Notion, la nouvelle citation est après la première citation sans section et avant le titre « Le constat ».

### Réutiliser une section de même nom

- [x] **Alternatif — Nouvelle section au nom déjà utilisé** : avec une section « Le constat », choisir « + Nouvelle section… », saisir « le constat », puis ajouter l'extrait. Dans Notion, la citation est à la fin de la section « Le constat » et la page ne contient qu'un seul titre « Le constat ».

### Empêcher l'ajout en double d'un même extrait

- [x] **Nominal — Extrait ajouté** : cliquer sur « Ajouter l'extrait ». Le bouton affiche « Ajout en cours… » pendant l'envoi, puis l'aperçu affiche « Extrait ajouté » et le bouton est inactif.
- [x] **Alternatif — Nouvelle sélection après un ajout** : avec l'aperçu sur « Extrait ajouté », sélectionner un autre passage. L'aperçu affiche le nouveau passage et « Ajouter l'extrait » est actif.

### Lister les extraits ajoutés

- [x] **Nominal — Extraits dans deux sections** : ajouter un extrait sans section, puis un extrait sous « Le constat ». La liste affiche d'abord l'extrait sans section, puis le titre « Le constat » suivi de son extrait, chaque extrait limité à 2 lignes.

### Indiquer la cause d'un échec d'ajout

- [x] **Erreur — Item mis à la corbeille** : mettre l'item à la corbeille dans Notion, puis sélectionner un passage et cliquer sur « Ajouter l'extrait ». Le message « Item introuvable dans Notion » s'affiche, l'aperçu et la section choisie sont conservés, et le bouton est à nouveau actif.
- [x] **Erreur — Pas de réseau** : sélectionner un passage, couper le Wi-Fi, puis cliquer sur « Ajouter l'extrait ». Le message « Connexion impossible » s'affiche et aucun extrait n'est ajouté à la liste du panneau.

### Surligner dans la page les extraits ajoutés

- [x] **Nominal — Extrait surligné** : sélectionner deux paragraphes consécutifs, puis ajouter l'extrait. Les deux paragraphes sont surlignés en entier dans la page, sur fond vermillon pâle.
- [x] **Alternatif — Retour sur l'onglet de l'extrait** : après avoir ajouté un extrait dans un premier article, activer l'onglet d'un second article, puis revenir au premier. L'extrait est toujours surligné.
- [x] **Erreur — Échec de l'ajout** : sélectionner un passage, couper le Wi-Fi, puis cliquer sur « Ajouter l'extrait ». Le passage n'est pas surligné.
- [x] **Alternatif — Fermer le panneau** : avec deux extraits surlignés dans la page, fermer le panneau. Aucun passage n'est plus surligné.

### N'écouter la sélection que panneau ouvert

- [x] **Nominal — Fermer le panneau** : après la création, ouvrir l'inspecteur de la page (F12, onglet Inspecteur) et repérer, dans le badge `event` du nœud `<html>`, l'écouteur `selectionchange` venant de `moz-extension://…`. Fermer le panneau : l'écouteur n'apparaît plus.

## Repli du formulaire (`item-editing`)

### Replier le formulaire après la création

- [x] **Nominal — Formulaire replié à la création** : remplir le formulaire avec le titre « What a workplace can't promise », puis cliquer sur « Ajouter ». Le formulaire est replié en une ligne avec le titre « What a workplace can't promise » et le lien « Ouvrir dans Notion », le message « Item créé dans Readme center » s'affiche dessous, et la zone des extraits s'affiche juste en dessous.
- [x] **Alternatif — Déplier pour corriger** : avec le formulaire replié, cliquer sur le titre. Les champs « Titre », « URL », « Auteur », « LinkedIn de l'auteur », « Langue » et « Thèmes » s'affichent avec les valeurs enregistrées.
- [x] **Alternatif — Replié après un enregistrement** : déplier le formulaire, remplacer l'auteur par « Camille Martin », puis cliquer sur « Enregistrer les modifications ». Le formulaire est replié et le message « Modifications enregistrées dans Readme center » s'affiche.
- [x] **Erreur — Échec de l'enregistrement** : déplier le formulaire, modifier un champ, couper le Wi-Fi, puis cliquer sur « Enregistrer les modifications ». Le formulaire reste déplié et le message « Connexion impossible » s'affiche.
- [x] **Erreur — Modification non enregistrée** : déplier le formulaire, modifier le titre sans l'enregistrer, puis cliquer sur l'en-tête du formulaire. Le formulaire reste déplié et l'en-tête est grisé.

### Confirmer l'enregistrement

- [x] **Nominal — Modifications enregistrées** : déplier le formulaire, modifier le titre, puis cliquer sur « Enregistrer les modifications ». Le message « Modifications enregistrées dans Readme center » s'affiche sous le formulaire, le bouton « Enregistrer les modifications » n'est plus affiché, et le lien « Ouvrir dans Notion » reste affiché.
- [x] **Alternatif — Nouvelle modification après un enregistrement** : avec le message « Modifications enregistrées dans Readme center » affiché, déplier le formulaire et modifier l'auteur. Le message n'est plus affiché et le bouton « Enregistrer les modifications » s'affiche.
