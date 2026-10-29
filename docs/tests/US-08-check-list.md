# US-08 — Check-list de tests manuels

Change OpenSpec : `us-08-rediger-description`. Un point par scénario des specs `item-description` et `ui-design-system` de ce change.

## Préparation

- Construire l'extension avec `npm run build`, puis la charger en temporaire dans Zen (voir `README.md`).
- Utiliser la base « Readme center (tests) » et le jeton de son intégration, avec une configuration vérifiée. Ne jamais faire ces tests sur la base de production.
- Garder la base de test ouverte dans Notion pour contrôler la propriété Description des items.
- Sauf mention contraire, chaque point de la description commence par la création d'un item depuis un article.
- Dérouler la check-list en mode clair, puis en mode sombre.
- À la fin des tests, mettre à la corbeille tous les items créés dans la base de test.

## Description de l'item (`item-description`)

### Proposer la description une fois l'item créé

- [x] **Nominal — Item créé** : créer un item. Dès la confirmation de Notion, la zone « Description » s'affiche entre le formulaire de l'item et la zone des extraits, avec un champ vide.
- [x] **Alternatif — Item pas encore créé** : ouvrir le panneau sur un article, sans cliquer sur « Ajouter ». Aucune zone « Description » n'est affichée.

### Limiter la description à 2000 caractères

- [x] **Erreur — Coller un texte trop long** : le champ « Description » étant vide, y coller un texte de 2500 caractères. Le champ contient les 2000 premiers caractères du texte, et le compteur affiche « 2 000 / 2000 ».

### Afficher le compteur de caractères

- [x] **Nominal — Saisie en cours** : saisir ou coller un texte de 1240 caractères dans le champ. Le compteur affiche « 1 240 / 2000 ».
- [x] **Alternatif — Champ vide** : le champ étant vide, le compteur affiche « 0 / 2000 ».

### Afficher le bouton d'enregistrement quand la description a changé

- [x] **Nominal — Première saisie** : sans description enregistrée, saisir « Une culture d'entreprise se lit dans les arbitrages du quotidien. ». Le bouton « Enregistrer la description » s'affiche.
- [x] **Alternatif — Revenir au texte enregistré** : enregistrer « Une culture se lit dans les arbitrages. », modifier le texte, puis le remettre à « Une culture se lit dans les arbitrages. ». Le bouton « Enregistrer la description » n'est plus affiché.
- [x] **Alternatif — Espaces ajoutés seulement** : enregistrer « Une culture se lit dans les arbitrages. », puis ajouter des espaces à la fin du texte. Le bouton « Enregistrer la description » n'est pas affiché.

### Enregistrer la description dans Notion

- [x] **Nominal — Enregistrer une description** : saisir « Une culture d'entreprise se lit dans les arbitrages du quotidien. », puis cliquer sur « Enregistrer la description ». Dans Notion, la Description de l'item est « Une culture d'entreprise se lit dans les arbitrages du quotidien. ».
- [x] **Alternatif — Remplacer une description** : enregistrer « Première version. », remplacer le texte par « Version corrigée. », puis cliquer sur « Enregistrer la description ». Dans Notion, la Description de l'item est « Version corrigée. ».
- [x] **Alternatif — Effacer la description** : enregistrer « Première version. », vider le champ, puis cliquer sur « Enregistrer la description ». Dans Notion, la Description de l'item est vide.

### Empêcher un double enregistrement de la description

- [x] **Alternatif — Double clic sur « Enregistrer la description »** : saisir un texte, puis cliquer deux fois de suite sur « Enregistrer la description ». Le bouton affiche « Enregistrement en cours… » et reste inactif jusqu'à la réponse de Notion ; l'onglet Réseau des outils de développement de l'extension ne montre qu'une seule requête `PATCH` vers la page.

### Confirmer l'enregistrement de la description

- [x] **Nominal — Description enregistrée** : saisir un texte, puis cliquer sur « Enregistrer la description ». À la réponse de Notion, le message « Description enregistrée dans Readme center » s'affiche et le bouton « Enregistrer la description » n'est plus affiché.
- [x] **Alternatif — Nouvelle modification après un enregistrement** : le message « Description enregistrée dans Readme center » étant affiché, modifier le texte. Le message n'est plus affiché et le bouton « Enregistrer la description » s'affiche.

### Indiquer la cause d'un échec d'enregistrement de la description

- [x] **Erreur — Item mis à la corbeille** : mettre l'item à la corbeille dans Notion, saisir un texte, puis cliquer sur « Enregistrer la description ». Le message « Item introuvable dans Notion » s'affiche et le champ contient toujours le texte saisi.
- [x] **Erreur — Pas de réseau** : couper le Wi-Fi, saisir un texte, puis cliquer sur « Enregistrer la description ». Le message « Connexion impossible » s'affiche et le bouton « Enregistrer la description » est à nouveau actif.

## Design system (`ui-design-system`)

### N'utiliser que les atomes du design system

- [x] **Nominal — Formulaire du panneau** : ouvrir le panneau. Les champs, les libellés, le choix de la langue, les cases des thèmes et le bouton « Ajouter » reprennent respectivement les atomes Input, Field label, Choice Group, Checkbox et Button du DS v1.13 : libellé du bouton et coche des cases en `text/on-accent` (foncé dans les deux modes), survol du bouton plus clair que l'accent en mode clair.
- [x] **Nominal — Page d'options** : ouvrir la page d'options. Le champ du jeton reprend l'atome Password Input, le champ de l'URL de la base l'atome Input et le bouton « Enregistrer » l'atome Button du DS v1.13, en taille sm.
- [x] **Alternatif — Compteur de la description** : créer un item. Le compteur de caractères s'affiche sous le champ « Description » en Caption sur `text/secondary`, aligné à droite.

### Offrir des cibles de 44 px

- [x] **Nominal — Hauteur des contrôles du formulaire** : ouvrir le panneau et mesurer avec l'inspecteur des outils de développement. Les champs « Titre », « URL », « Auteur » et « LinkedIn de l'auteur », les options de langue et le bouton « Ajouter » mesurent 44 px de haut, et chaque thème occupe une zone de 44 px de haut, case et libellé compris.

### Montrer le focus clavier sur les boutons

- [x] **Nominal — Atteindre « Ajouter » au clavier** : remplir un formulaire valide, puis atteindre « Ajouter » avec la touche Tab. Le bouton affiche l'anneau de focus du DS (2 px `accent`, décalé de 2 px). Vérifier aussi l'anneau sur un Icon Button (œil de la page d'options) et sur le lien « Ouvrir dans Notion ».
