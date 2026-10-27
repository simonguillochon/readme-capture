# US-02 — Check-list de tests manuels

Change OpenSpec : `us-02-preparer-item-page-lue`. Un point par scénario des specs `capture-form`, `url-normalization` et `notion-connection` de ce change.

## Préparation

- Construire l'extension avec `npm run build`, puis la charger en temporaire dans Zen (voir `README.md`).
- Utiliser la base « Readme center (tests) » et le jeton de son intégration, avec une configuration vérifiée. Ne jamais faire ces tests sur la base de production.
- Vérifier que la propriété `LinkedIn auteur` (URL) existe dans la base de test.
- Pour inspecter une page, ouvrir les outils de développement de l'onglet (F12) : les balises `og:title`, `author`, `article:author` et les blocs `application/ld+json` se lisent dans l'inspecteur.

## Formulaire de préparation (`capture-form`)

### Afficher le formulaire quand la connexion est configurée

- [x] **Nominal — Ouvrir le panneau avec une connexion configurée** : avec une configuration vérifiée, ouvrir le panneau. Il affiche « Titre », « URL », « Auteur », « LinkedIn de l'auteur », « Langue », « Thèmes » et le bouton « Ajouter ».

### Pré-remplir le titre depuis la page

- [x] **Nominal — Page avec titre de partage** : ouvrir le panneau sur un article dont la balise `og:title` diffère du titre de l'onglet. « Titre » contient la valeur de `og:title`.
- [x] **Alternatif — Page sans titre de partage** : ouvrir le panneau sur une page sans `og:title` (par exemple https://example.com). « Titre » contient le titre de l'onglet.

### Pré-remplir l'URL nettoyée de l'onglet

- [x] **Nominal — URL avec paramètres de suivi** : ouvrir un article Substack depuis un lien de newsletter (URL avec `?utm_source=…`), puis ouvrir le panneau. « URL » contient l'adresse de l'article sans `?` ni ce qui suit.

### Pré-remplir l'auteur depuis la page

- [x] **Nominal — Page avec balise auteur** : ouvrir le panneau sur un article qui a une balise `author`. « Auteur » contient sa valeur.
- [x] **Alternatif — Auteur déclaré dans les données structurées** : ouvrir le panneau sur un article sans balise `author` ni `article:author`, dont un bloc JSON-LD déclare l'auteur. « Auteur » contient ce nom. Également couvert par les tests Vitest.
- [x] **Alternatif — Page sans auteur déclaré** : ouvrir le panneau sur https://example.com. « Auteur » est vide.

### Pré-remplir le titre d'un post LinkedIn ou X

- [x] **Nominal — Post LinkedIn avec phrase d'accroche** : ouvrir un post LinkedIn seul (`/posts/…`), puis le panneau. « Titre » contient la première phrase du post, ponctuation finale comprise.
- [x] **Alternatif — Post X dont la première ligne n'a pas de ponctuation** : ouvrir un post X dont la première ligne n'a pas de ponctuation, puis le panneau. « Titre » contient cette première ligne. Également couvert par les tests Vitest.
- [x] **Alternatif — Texte du post introuvable** : non reproductible à la main de façon fiable ; couvert par les tests Vitest (snapshot de post sans texte). Le résultat attendu est un « Titre » vide.

### Pré-remplir l'auteur d'un post LinkedIn ou X

- [x] **Nominal — Auteur d'un post X** : ouvrir un post X, puis le panneau. « Auteur » contient le nom affiché de l'auteur, sans le `@compte`.

### Pré-remplir le profil LinkedIn de l'auteur depuis la page

- [x] **Nominal — Profil LinkedIn dans les données structurées** : ouvrir le panneau sur un article dont l'auteur, dans le JSON-LD, a un lien `linkedin.com/in/…` dans `url` ou `sameAs`. « LinkedIn de l'auteur » contient `https://www.linkedin.com/in/<identifiant>`. Également couvert par les tests Vitest.
- [x] **Alternatif — Profil LinkedIn dans la balise article:author** : couvert par les tests Vitest (balise `article:author` valant « https://fr.linkedin.com/in/camille-martin-exemple?trk=article »). Le résultat attendu est « https://www.linkedin.com/in/camille-martin-exemple ».
- [x] **Alternatif — Auteur sans profil LinkedIn déclaré** : ouvrir le panneau sur un article dont l'auteur n'a pas de lien LinkedIn (par exemple un article Substack). « LinkedIn de l'auteur » est vide.

### Pré-remplir le profil LinkedIn de l'auteur d'un post LinkedIn

- [x] **Nominal — Profil de l'auteur d'un post LinkedIn** : ouvrir un post LinkedIn seul (`/posts/…`), puis le panneau. « LinkedIn de l'auteur » contient `https://www.linkedin.com/in/<identifiant de l'auteur>`. Sur un post ouvert en `/feed/update/…`, « Auteur » et « LinkedIn de l'auteur » restent vides (design.md, décision 5).
- [x] **Alternatif — Post X** : ouvrir un post X, puis le panneau. « LinkedIn de l'auteur » est vide.

### Accepter uniquement un profil LinkedIn

- [x] **Nominal — Champ laissé vide** : « Titre », « URL » et « Auteur » valides, une langue et un thème choisis, « LinkedIn de l'auteur » vide. « Ajouter » est actif.
- [x] **Alternatif — Coller une URL de profil à nettoyer** : coller « https://fr.linkedin.com/in/camille-martin-exemple/?originalSubdomain=fr » dans « LinkedIn de l'auteur » et quitter le champ. Le champ contient « https://www.linkedin.com/in/camille-martin-exemple ».
- [x] **Erreur — URL qui n'est pas un profil LinkedIn** : formulaire valide par ailleurs, saisir « https://www.linkedin.com/company/exemple » dans « LinkedIn de l'auteur » et quitter le champ. Le champ est signalé en rouge, et « Ajouter » reste inactif.

### Suivre l'onglet actif tant que les champs ne sont pas modifiés

- [x] **Nominal — Changer d'onglet sans avoir modifié les champs** : panneau pré-rempli depuis un premier article, choisir 🇬🇧 Anglais sans toucher aux quatre champs pré-remplis, puis activer l'onglet d'un second article. Les quatre champs sont pré-remplis depuis le second article, et 🇬🇧 Anglais reste choisi.
- [x] **Alternatif — Changer d'onglet après avoir modifié le titre** : panneau pré-rempli depuis un premier article, remplacer le titre par « Ma lecture du jour », puis activer l'onglet d'un second article. « Titre » contient toujours « Ma lecture du jour », et les trois autres champs gardent les valeurs du premier article.

### Nettoyer une URL saisie à la main

- [x] **Nominal — Coller l'URL d'un post depuis le fil** : sur le fil LinkedIn, coller « https://www.linkedin.com/posts/camille-martin_management-activity-7000000000000000000-AbCd?utm_source=share » dans « URL » et quitter le champ. Le champ contient l'URL sans `?utm_source=share`.
- [x] **Erreur — Valeur qui n'est pas une URL** : saisir « article de Camille » dans « URL » et quitter le champ. Le champ contient toujours « article de Camille » et il est signalé en rouge.

### Choisir une seule langue

- [x] **Nominal — Choisir une langue** : à l'ouverture du panneau, aucune langue n'est choisie. Choisir 🇫🇷 Français : ce bouton devient plein.
- [x] **Alternatif — Changer de langue** : 🇫🇷 Français choisi, choisir 🇬🇧 Anglais. Seul 🇬🇧 Anglais est plein.

### Choisir les thèmes de la base Notion

- [x] **Nominal — Thèmes lus dans Notion** : ouvrir le panneau. « Thèmes » propose les options de la propriété Theme de la base de test, dans l'ordre de Notion.
- [x] **Alternatif — Thème ajouté dans Notion** : ajouter l'option « Signaux faibles » à la propriété Theme de la base de test, puis rouvrir le panneau. « Thèmes » la propose. Retirer l'option après le test.
- [x] **Nominal — Choisir plusieurs thèmes** : cocher deux thèmes. Les deux restent cochés.

### Signaler l'échec de lecture des thèmes

- [x] **Erreur — Pas de réseau à l'ouverture du panneau** : couper le Wi-Fi, puis ouvrir le panneau. « Connexion impossible » s'affiche à la place de la liste des thèmes, et « Ajouter » reste inactif.

### Activer « Ajouter » uniquement si le formulaire est valide

- [x] **Nominal — Formulaire complet** : panneau pré-rempli depuis un article avec auteur, choisir 🇬🇧 Anglais et un thème. « Ajouter » devient actif. Un clic n'a aucun effet (action prévue en US-03).
- [x] **Erreur — Aucun thème choisi** : « Titre », « URL » et « Auteur » valides, 🇬🇧 Anglais choisi, aucun thème coché. « Ajouter » reste inactif.
- [x] **Erreur — Auteur vide** : panneau ouvert sur https://example.com (aucun auteur déclaré), choisir une langue et un thème. « Ajouter » reste inactif.

### Laisser les champs vides sur une page illisible

- [x] **Alternatif — Nouvel onglet vide** : ouvrir le panneau sur un nouvel onglet vide. Les quatre champs pré-remplis sont vides, aucun message d'erreur ne s'affiche, et les champs se remplissent à la main.

### Lire uniquement l'onglet actif, panneau ouvert

- [x] **Nominal — Onglets en arrière-plan** : ouvrir trois articles différents dans la même fenêtre, puis le panneau. Les champs correspondent uniquement à l'onglet actif. Avec le panneau fermé, `about:debugging` ne montre toujours aucun script de contenu déclaré.

### Ne pas conserver le formulaire avant la création de l'item

- [x] **Alternatif — Fermer puis rouvrir le panneau avant la création** : modifier le titre et choisir 🇫🇷 Français sans cliquer sur « Ajouter », fermer puis rouvrir le panneau. Le formulaire est pré-rempli à nouveau depuis l'onglet actif, et aucune langue n'est choisie.

## Nettoyage d'URL (`url-normalization`)

Ces scénarios sont couverts par les tests Vitest de `normalizeUrl`. À la main, coller chaque valeur dans « URL » du panneau et quitter le champ.

### Supprimer les paramètres de requête

- [x] **Nominal — Lien de newsletter avec paramètres de suivi** : « https://exemple.substack.com/p/un-article?utm_source=post-email-title&publication_id=24711&utm_medium=email » devient « https://exemple.substack.com/p/un-article ».
- [x] **Alternatif — URL déjà propre** : « https://exemple.com/blog/un-article » reste inchangée.

### Conserver une URL sans paramètres de requête

- [x] **Alternatif — Lien vers une section de la page sans paramètres** : « https://exemple.com/blog/un-article#conclusion » reste inchangée.
- [x] **Alternatif — Fragment après des paramètres** : « https://exemple.com/blog/un-article?utm_source=x#conclusion » devient « https://exemple.com/blog/un-article ».

### Conserver l'identifiant des vidéos YouTube

- [x] **Alternatif — Vidéo YouTube avec horodatage et playlist** : « https://www.youtube.com/watch?v=abc123XYZ&list=PL0001&t=42s » devient « https://www.youtube.com/watch?v=abc123XYZ ».
- [x] **Erreur — Vidéo YouTube sans paramètre v** : « https://www.youtube.com/watch?list=PL0001 » devient « https://www.youtube.com/watch ».

### Refuser une valeur qui n'est pas une URL web

- [x] **Erreur — Texte libre** : « un article sur le management » reste dans le champ, signalé en rouge.
- [x] **Erreur — Adresse interne du navigateur** : « about:newtab » reste dans le champ, signalé en rouge.

## Connexion à Notion (`notion-connection`)

### Vérifier la connexion avant d'enregistrer

- [x] **Nominal — Connexion vérifiée** : saisir le jeton valide et l'URL de la base de test, puis enregistrer. Le message « Connexion vérifiée : Readme center (tests) » s'affiche, et le panneau affiche le formulaire.
- [x] **Alternatif — Remplacer une configuration existante** : avec une configuration vérifiée, rouvrir la page d'options. « URL de la base » affiche l'URL enregistrée, et le jeton est masqué. Un nouvel enregistrement vérifié remplace la configuration.
- [x] **Erreur — Échec de la vérification** : avec une configuration vérifiée, saisir un jeton refusé par Notion et enregistrer. Un message d'erreur s'affiche, les valeurs saisies restent dans les champs, et la configuration précédente est conservée.
- [x] **Erreur — Base sans propriété LinkedIn auteur** : saisir l'URL d'une base accessible sans propriété `LinkedIn auteur` de type URL (par exemple une copie temporaire de la base de test sans cette propriété, partagée avec l'intégration). Le message « La base Notion a changé » s'affiche, et aucune configuration n'est enregistrée. Également couvert par les tests Vitest.
