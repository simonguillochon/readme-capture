# US-01 — Check-list de tests manuels

Change OpenSpec : `us-01-configurer-connexion-notion`. Un point par scénario des specs `side-panel` et `notion-connection`.

## Préparation

- Construire l'extension avec `npm run build`, puis la charger en temporaire dans Zen (voir `README.md`).
- Utiliser la base « Readme center (tests) » et le jeton de son intégration. Ne jamais faire ces tests sur la base de production.
- Pour repartir d'un état sans configuration : retirer l'extension dans `about:debugging`, puis la recharger.

## Panneau latéral (`side-panel`)

### Ouvrir et fermer le panneau par le bouton de l'extension

- [x] **Nominal — Ouvrir le panneau** : panneau fermé, cliquer sur le bouton de l'extension. Le panneau s'affiche à côté de la page.
- [x] **Alternatif — Fermer le panneau** : panneau ouvert, cliquer sur le bouton de l'extension. Le panneau se ferme.

### Rester inactive quand le panneau est fermé

- [x] **Alternatif — Navigation avec le panneau fermé** : panneau fermé, charger https://example.com. La page s'affiche sans aucun élément ni script ajouté par l'extension (inspecteur : aucun élément ni script injecté ; `about:debugging` : aucun script de contenu déclaré).

### Afficher l'état non configuré

- [x] **Erreur — Ouvrir le panneau sans configuration** : sans configuration enregistrée, ouvrir le panneau. Il affiche « La connexion à Notion n'est pas configurée » et un lien vers la page d'options, et rien d'autre.
- [x] **Nominal — Accéder aux options depuis le panneau** : dans l'état non configuré, cliquer sur le lien. La page d'options de l'extension s'ouvre.

## Connexion à Notion (`notion-connection`)

### Saisir le jeton et l'URL de la base

- [x] **Nominal — Champs remplis** : saisir un jeton dans « Jeton d'intégration Notion » et une URL dans « URL de la base ». Le bouton « Enregistrer » devient actif.
- [x] **Erreur — Champ vide** : saisir un jeton et laisser « URL de la base » vide. Le bouton « Enregistrer » reste inactif.

### Masquer le jeton par défaut

- [x] **Nominal — Saisie masquée** : saisir « ntn_exemple123 ». Le champ affiche des caractères masqués.
- [x] **Alternatif — Afficher puis masquer le jeton** : après avoir saisi « ntn_exemple123 », activer la commande d'affichage. Le jeton s'affiche en clair. Une nouvelle activation le masque à nouveau.

### Extraire l'identifiant depuis l'URL de la base

- [x] **Nominal — URL copiée depuis Notion** : copier l'URL de la base de test depuis Notion (forme `https://app.notion.com/p/…/<identifiant>?v=…`) et enregistrer. La connexion est vérifiée, donc l'identifiant a été retenu.
- [x] **Alternatif — URL avec le nom de la base dans le chemin** : saisir l'URL de la base de test sous la forme `https://www.notion.so/…/Readme-center-tests-<identifiant>` et enregistrer. La connexion est vérifiée.
- [x] **Erreur — Identifiant seul** : saisir « 0123456789abcdef0123456789abcdef » et cliquer sur « Enregistrer ». Le message « URL de base non reconnue » s'affiche, et aucune configuration n'est enregistrée (le panneau reste dans l'état non configuré).
- [x] **Erreur — URL hors Notion** : saisir « https://example.com/0123456789abcdef0123456789abcdef » et cliquer sur « Enregistrer ». Le message « URL de base non reconnue » s'affiche, et aucune configuration n'est enregistrée.

### Vérifier la connexion avant d'enregistrer

- [x] **Nominal — Connexion vérifiée** : saisir le jeton valide et l'URL de la base de test, partagée avec l'intégration, puis enregistrer. Le message « Connexion vérifiée : Readme center (tests) » s'affiche, et le panneau n'affiche plus l'état non configuré.
- [x] **Alternatif — Remplacer une configuration existante** : avec une configuration vérifiée, rouvrir la page d'options. « URL de la base » affiche l'URL enregistrée, et « Jeton d'intégration Notion » affiche le jeton masqué. Un nouvel enregistrement vérifié (par exemple l'autre forme d'URL) remplace la configuration : l'URL réaffichée après réouverture est la nouvelle.
- [x] **Erreur — Échec de la vérification** : avec une configuration vérifiée, saisir un jeton refusé par Notion et enregistrer. Un message d'erreur s'affiche, les valeurs saisies restent dans les champs, et la configuration précédente est conservée (à la réouverture de la page, l'ancien jeton est réaffiché).

### Indiquer la cause d'un échec de vérification

- [x] **Erreur — Jeton refusé** : saisir un jeton révoqué ou inventé et enregistrer. Le message « Jeton Notion invalide » s'affiche.
- [x] **Erreur — Base non partagée avec l'intégration** : saisir le jeton valide et l'URL d'une base non partagée avec l'intégration. Le message « Base inaccessible » s'affiche.
- [x] **Erreur — Propriété manquante** : saisir l'URL d'une base accessible sans propriété Theme (par exemple une copie temporaire de la base de test sans cette propriété, partagée avec l'intégration). Le message « La base Notion a changé » s'affiche. Également couvert par les tests Vitest.
- [x] **Erreur — Pas de réseau** : couper le Wi-Fi, puis enregistrer une configuration valide. Le message « Connexion impossible » s'affiche.
- [x] **Erreur — Notion indisponible** : non reproductible à la main ; couvert par les tests Vitest (réponses 5xx simulées). Si Notion est en incident lors d'un test, le message attendu est « Notion ne répond pas ».

### Réessayer automatiquement en cas de limitation

- [x] **Alternatif — Limitation temporaire** : non reproductible à la main de façon fiable ; couvert par les tests Vitest (réponse 429 avec `Retry-After: 2`). Le message attendu est « Notion limite les appels », puis la vérification est relancée après 2 secondes.

### Conserver la configuration localement

- [x] **Nominal — Configuration conservée après redémarrage** : enregistrer une configuration vérifiée, redémarrer Zen, puis rouvrir la page d'options. La configuration est toujours présente. À faire avec l'extension installée de façon permanente : une extension chargée en temporaire est retirée à la fermeture de Zen, avec son stockage.
