# US-04 — Check-list de tests manuels

Change OpenSpec : `us-04-aligner-interface-design-system`. Un point par scénario de la spec `ui-design-system` de ce change.

## Préparation

- Construire l'extension avec `npm run build`, puis la charger en temporaire dans Zen (voir `README.md`).
- Utiliser la base « Readme center (tests) » et le jeton de son intégration, avec une configuration vérifiée. Ne jamais faire ces tests sur la base de production.
- Dérouler la check-list une première fois avec le système en mode clair, puis une seconde fois en mode sombre (Réglages Système > Apparence).
- Garder ouvert le fichier Figma du DS, page Components, pour comparer chaque élément à son atome.
- À la fin des tests, mettre à la corbeille tous les items créés dans la base de test.

## Conformité au design system (`ui-design-system`)

### N'utiliser que les atomes du design system

- [x] **Nominal — Formulaire du panneau** : ouvrir le panneau sur un article. Les champs reprennent l'atome Input (`157:12`), les libellés l'atome Field label (`643:22`), le choix de la langue l'atome Choice Group (`646:111`), les cases des thèmes l'atome Checkbox (`646:86`) et le bouton « Ajouter » l'atome Button (`154:98`).
- [x] **Nominal — Page d'options** : ouvrir la page d'options. Le champ du jeton reprend l'atome Password Input (`645:82`), le champ de l'URL de la base l'atome Input (`157:12`) et le bouton « Enregistrer » l'atome Button (`154:98`).

### Afficher les cases à cocher selon l'atome Checkbox

- [x] **Nominal — Cocher un thème** : avec « Management » non coché, cocher « Management ». La case de 20 px passe sur fond `accent` avec l'icône `check` en `text/inverse`. Refaire au clavier : atteindre la case avec Tab (anneau de focus `accent` décalé de 2 px), puis la cocher et la décocher avec Espace.
- [x] **Alternatif — Survol d'une case non cochée** : avec « Design » non coché, survoler sa case. La bordure de la case passe en `border/accent`.

### Distinguer l'option choisie par une bordure accent

- [x] **Nominal — Choisir le français** : sans langue choisie, choisir 🇫🇷 Français. L'option garde le style secondary avec une bordure de 2 px `border/accent`, sans changer de taille ; 🇬🇧 Anglais et 🇪🇸 Espagnol gardent le style secondary sans bordure accent. Vérifier aussi que Tab n'atteint qu'une option et que les flèches changent de langue.

### Colorer les messages selon leur variante

- [x] **Nominal — Confirmation de création** : remplir le formulaire, puis cliquer sur « Ajouter ». Le texte et la bordure du message « Item créé dans Readme center » sont en `feedback/success`, sur fond `surface/elevated`.
- [x] **Alternatif — Avertissement de doublon** : rouvrir le panneau sur l'article dont l'item vient d'être créé. Le texte et la bordure de l'avertissement « Cette URL existe déjà dans Readme center » sont en `feedback/warning`.
- [x] **Erreur — Échec de la vérification de connexion** : dans la page d'options, régénérer le secret de l'intégration de test dans Notion, puis enregistrer l'ancien jeton. Le texte et la bordure du message « Jeton Notion invalide » sont en `feedback/error`. Enregistrer ensuite le nouveau jeton.

### Adapter les couleurs de retour au mode sombre

- [x] **Nominal — Avertissement en mode clair** : système en mode clair, afficher l'avertissement de doublon dans le panneau. Son texte et sa bordure sont en `warning-light` (#8A6508).
- [x] **Alternatif — Erreur en mode sombre** : système en mode sombre, afficher un message d'erreur dans le panneau (par exemple en coupant le Wi-Fi avant de cliquer sur « Ajouter » : « Connexion impossible »). Son texte et sa bordure sont en `error-dark` (#E57373).

### Étendre les messages à la largeur du panneau

- [x] **Nominal — Panneau élargi** : élargir le panneau à 480 px environ, puis afficher un message (avertissement de doublon ou confirmation). Le message occupe toute la largeur du formulaire.
