# US-03 — Check-list de tests manuels

Change OpenSpec : `us-03-creer-item-readme-center`. Un point par scénario des specs `item-creation` et `capture-form` de ce change.

## Préparation

- Construire l'extension avec `npm run build`, puis la charger en temporaire dans Zen (voir `README.md`).
- Utiliser la base « Readme center (tests) » et le jeton de son intégration, avec une configuration vérifiée. Ne jamais faire ces tests sur la base de production.
- Garder la base de test ouverte dans Notion pour contrôler les items créés.
- À la fin des tests, mettre à la corbeille tous les items créés dans la base de test.

## Création de l'item (`item-creation`)

### Créer l'item avec ses métadonnées

- [x] **Nominal — Créer un item complet** : ouvrir le panneau sur un article, renseigner un titre, une URL et un auteur, choisir 🇬🇧 Anglais et les thèmes « Management » et « Strategy », puis cliquer sur « Ajouter ». Dans Notion, l'item a ce Title, cette URL, cette Source, un Theme contenant « Management » et « Strategy », une Description et un corps de page vides, et un Type vide.

### Renseigner le profil LinkedIn de l'auteur s'il est connu

- [x] **Nominal — Profil LinkedIn renseigné** : saisir « https://www.linkedin.com/in/camille-martin-exemple » dans « LinkedIn de l'auteur », puis cliquer sur « Ajouter ». La propriété LinkedIn auteur de l'item créé contient ce profil.
- [x] **Alternatif — Profil LinkedIn vide** : laisser « LinkedIn de l'auteur » vide, puis cliquer sur « Ajouter ». La propriété LinkedIn auteur de l'item créé est vide.

### Porter la langue par l'icône de la page

- [x] **Nominal — Contenu en français** : choisir 🇫🇷 Français, puis cliquer sur « Ajouter ». La page de l'item créé a l'icône 🇫🇷.
- [x] **Alternatif — Contenu en espagnol** : choisir 🇪🇸 Espagnol, puis cliquer sur « Ajouter ». La page de l'item créé a l'icône 🇪🇸.

### Dater l'item du jour de la capture

- [x] **Nominal — Capture en soirée** : créer un item et vérifier que sa Date est celle du jour, sans heure. Le cas de 23 h 30 est couvert par les tests Vitest (`localDate`) ; il peut aussi être reproduit en créant un item après 23 h.

### Empêcher une double création pendant l'envoi

- [x] **Alternatif — Double clic sur « Ajouter »** : avec un formulaire valide, double-cliquer sur « Ajouter ». Le bouton affiche « Ajout en cours… » et reste inactif jusqu'à la réponse de Notion, et un seul item est créé dans la base de test.

### Confirmer la création

- [x] **Nominal — Item créé** : cliquer sur « Ajouter ». Le message « Item créé dans Readme center » et le lien « Ouvrir dans Notion » s'affichent, et le bouton « Ajouter » n'est plus affiché.
- [x] **Nominal — Ouvrir l'item créé** : cliquer sur « Ouvrir dans Notion ». La page de l'item s'ouvre dans un nouvel onglet.

### Indiquer la cause d'un échec de création

- [x] **Erreur — Pas de réseau au moment de la création** : remplir le formulaire, couper le Wi-Fi, puis cliquer sur « Ajouter ». Le message « Connexion impossible » s'affiche, le formulaire contient toujours les valeurs saisies, « Ajouter » est à nouveau actif, et aucun item n'est créé.
- [x] **Erreur — Jeton révoqué** : remplir le formulaire, puis régénérer le secret de l'intégration de test dans Notion et cliquer sur « Ajouter ». Le message « Jeton Notion invalide » s'affiche, et le formulaire contient toujours les valeurs saisies. Enregistrer ensuite le nouveau jeton dans la page d'options.

### Avertir d'un doublon avant la création

- [x] **Nominal — URL déjà présente dans la base** : créer un item depuis un article, puis rouvrir le panneau sur le même article avec `?utm_source=email` ajouté à son URL. L'avertissement « Cette URL existe déjà dans Readme center » et le lien « Ouvrir l'item existant » s'affichent sous « URL », et « Ajouter » reste actif si le formulaire est valide. Vérifier le rendu de l'avertissement en modes clair et sombre.
- [x] **Nominal — Ouvrir l'item existant** : avec l'avertissement affiché, cliquer sur « Ouvrir l'item existant ». La page de l'item existant s'ouvre dans un nouvel onglet.
- [x] **Alternatif — Créer malgré le doublon** : avec l'avertissement affiché et un formulaire valide, cliquer sur « Ajouter ». Un nouvel item est créé dans la base de test.
- [x] **Alternatif — Variante d'URL non reconnue comme doublon** : avec un item d'URL « https://example.com/ » dans la base de test, saisir « https://www.example.com/ » dans « URL » et quitter le champ. Aucun avertissement de doublon ne s'affiche.
- [x] **Alternatif — URL corrigée après un doublon** : avec l'avertissement affiché, remplacer l'URL par une URL absente de la base de test et quitter le champ. L'avertissement disparaît.

### Ignorer l'échec de la recherche de doublon

- [x] **Erreur — Notion indisponible pendant la recherche de doublon** : une erreur serveur de Notion n'est pas reproductible à la main. Simuler l'échec en bloquant les requêtes `*/query` dans l'onglet Réseau des outils de développement de l'extension (`about:debugging`, « Inspecter »), puis ouvrir le panneau sur un article déjà présent dans la base. Aucun avertissement ni message d'erreur ne s'affiche, et « Ajouter » est actif dès que le formulaire est valide. Le panneau traite toute erreur de la recherche de la même façon.

## Formulaire de préparation (`capture-form`)

### Suivre l'onglet actif tant que les champs ne sont pas modifiés

- [x] **Nominal — Changer d'onglet sans avoir modifié les champs** : ouvrir le panneau sur un premier article, choisir 🇬🇧 sans modifier « Titre », « URL », « Auteur » ni « LinkedIn de l'auteur », puis activer l'onglet d'un second article. Les quatre champs sont pré-remplis depuis le second article, et la langue 🇬🇧 reste choisie.
- [x] **Alternatif — Changer d'onglet après avoir modifié le titre** : remplacer le titre par « Ma lecture du jour », puis activer l'onglet d'un second article. « Titre » contient toujours « Ma lecture du jour », et « URL », « Auteur » et « LinkedIn de l'auteur » contiennent toujours les valeurs du premier article.
- [x] **Alternatif — Changer d'onglet après la création de l'item** : créer l'item depuis un premier article sans modifier aucun champ, puis activer l'onglet d'un second article. « Titre », « URL », « Auteur » et « LinkedIn de l'auteur » contiennent toujours les valeurs du premier article.
