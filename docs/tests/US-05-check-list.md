# US-05 — Check-list de tests manuels

Change OpenSpec : `us-05-modifier-metadonnees-item`. Un point par scénario des specs `item-editing` et `item-creation` de ce change.

## Préparation

- Construire l'extension avec `npm run build`, puis la charger en temporaire dans Zen (voir `README.md`).
- Utiliser la base « Readme center (tests) » et le jeton de son intégration, avec une configuration vérifiée. Ne jamais faire ces tests sur la base de production.
- Garder la base de test ouverte dans Notion pour contrôler les items créés et modifiés.
- Sauf mention contraire, chaque point commence par la création d'un item depuis un article : remplir le formulaire, puis cliquer sur « Ajouter ».
- À la fin des tests, mettre à la corbeille tous les items créés dans la base de test.

## Modification d'un item créé (`item-editing`)

### Garder les métadonnées modifiables après la création

- [x] **Nominal — Corriger le titre après la création** : créer l'item « What a workplace can't promise », puis remplacer le titre par « TBM 444 — What a workplace can't promise ». Le champ « Titre » contient « TBM 444 — What a workplace can't promise ».
- [x] **Alternatif — Coller une URL à nettoyer après la création** : après la création, coller « https://exemple.com/blog/un-article?utm_source=x » dans « URL » et quitter le champ. Le champ « URL » contient « https://exemple.com/blog/un-article ».

### Afficher le bouton d'enregistrement quand un champ a changé

- [x] **Nominal — Modifier un thème** : créer l'item avec le thème « Management », puis cocher aussi « Strategy ». Le bouton « Enregistrer les modifications » s'affiche sous le lien « Ouvrir dans Notion ».
- [x] **Alternatif — Revenir à la valeur enregistrée** : créer l'item avec 🇬🇧 Anglais, choisir 🇫🇷 Français (le bouton « Enregistrer les modifications » apparaît), puis choisir à nouveau 🇬🇧 Anglais. Le bouton n'est plus affiché.

### Activer l'enregistrement uniquement si le formulaire est valide

- [x] **Erreur — Titre effacé** : après la création, effacer entièrement le titre. Le bouton « Enregistrer les modifications » est affiché mais inactif.
- [x] **Erreur — Dernier thème décoché** : créer l'item avec le seul thème « Management », puis décocher « Management ». Le bouton « Enregistrer les modifications » est affiché mais inactif.

### Enregistrer uniquement les propriétés modifiées

- [x] **Nominal — Corriger l'auteur** : créer l'item avec l'auteur « C. Martin », remplacer l'auteur par « Camille Martin », puis cliquer sur « Enregistrer les modifications ». Dans Notion, la Source de l'item est « Camille Martin », et les autres propriétés, dont la Date, sont inchangées.
- [x] **Alternatif — Changer la langue** : créer l'item avec 🇬🇧 Anglais, choisir 🇫🇷 Français, puis cliquer sur « Enregistrer les modifications ». La page de l'item a l'icône 🇫🇷.
- [x] **Alternatif — Effacer le profil LinkedIn** : créer l'item avec le profil « https://www.linkedin.com/in/camille-martin-exemple », vider « LinkedIn de l'auteur », puis cliquer sur « Enregistrer les modifications ». Le LinkedIn auteur de l'item est vide.
- [x] **Alternatif — Remplacer les thèmes** : créer l'item avec les thèmes « Management » et « Strategy », décocher « Strategy », cocher « Design », puis cliquer sur « Enregistrer les modifications ». Le Theme de l'item contient exactement « Management » et « Design ».

### Empêcher un double enregistrement pendant l'envoi

- [x] **Alternatif — Double clic sur « Enregistrer les modifications »** : après la création, modifier un champ, puis double-cliquer sur « Enregistrer les modifications ». Le bouton affiche « Enregistrement en cours… » et reste inactif jusqu'à la réponse de Notion, et une seule mise à jour est envoyée (outils de développement de l'extension, onglet Réseau : une seule requête `PATCH`).

### Confirmer l'enregistrement

- [x] **Nominal — Modifications enregistrées** : après la création, modifier le titre, puis cliquer sur « Enregistrer les modifications ». Le message « Modifications enregistrées dans Readme center » s'affiche au-dessus du lien « Ouvrir dans Notion », qui reste affiché, et le bouton « Enregistrer les modifications » n'est plus affiché.
- [x] **Alternatif — Nouvelle modification après un enregistrement** : avec le message « Modifications enregistrées dans Readme center » affiché, modifier l'auteur. Le message n'est plus affiché et le bouton « Enregistrer les modifications » s'affiche.

### Indiquer la cause d'un échec d'enregistrement

- [x] **Erreur — Item mis à la corbeille dans Notion** : après la création, mettre l'item à la corbeille dans Notion, puis modifier le titre dans le panneau et cliquer sur « Enregistrer les modifications ». Le message « Item introuvable dans Notion » s'affiche, le formulaire contient toujours les valeurs saisies, et le bouton « Enregistrer les modifications » est à nouveau actif.
- [x] **Erreur — Pas de réseau au moment de l'enregistrement** : après la création, modifier un champ, couper le Wi-Fi, puis cliquer sur « Enregistrer les modifications ». Le message « Connexion impossible » s'affiche et le formulaire contient toujours les valeurs saisies.

### Ne pas détecter de doublon après la création

- [x] **Alternatif — URL modifiée vers un contenu déjà présent** : avec un item d'URL « https://exemple.com/blog/deja-lu » dans la base de test, créer un autre item, puis saisir « https://exemple.com/blog/deja-lu » dans « URL » et quitter le champ. Aucun avertissement de doublon ne s'affiche, et le bouton « Enregistrer les modifications » s'affiche. Vérifier aussi qu'un avertissement affiché avant la création (création malgré un doublon) disparaît dès que l'item est créé.

## Création de l'item (`item-creation`)

### Confirmer la création

- [x] **Nominal — Item créé** : cliquer sur « Ajouter ». Le message « Item créé dans Readme center » et le lien « Ouvrir dans Notion » s'affichent, et le bouton « Ajouter » n'est plus affiché.
- [x] **Nominal — Ouvrir l'item créé** : avec le message « Item créé dans Readme center » affiché, cliquer sur « Ouvrir dans Notion ». La page de l'item s'ouvre dans un nouvel onglet.
- [x] **Alternatif — Première modification après la création** : avec le message « Item créé dans Readme center » affiché, modifier le titre. Le message n'est plus affiché, et le lien « Ouvrir dans Notion » reste affiché.
