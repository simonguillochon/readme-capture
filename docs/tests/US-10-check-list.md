# US-10 — Check-list de tests manuels

Change OpenSpec : `us-10-informer-cause-erreur-notion`. Un point par scénario de la spec `notion-error-recovery` de ce change, avec la façon de provoquer l'erreur sur la base « Readme center (tests) ».

## Préparation

- Construire l'extension avec `npm run build`, puis la charger dans Zen (voir `README.md`).
- Utiliser la base « Readme center (tests) » et le jeton de son intégration, avec une configuration vérifiée. Ne jamais faire ces tests sur la base de production.
- Garder la base de test ouverte dans Notion.
- Outils de développement du panneau : `about:debugging#/runtime/this-firefox`, puis « Examiner » sur l'extension. L'onglet Réseau permet de ralentir le réseau (« Limitation de bande passante ») et de bloquer une URL (clic droit sur une requête, « Bloquer l'URL »).
- Vérifier une fois le rendu de chaque action sous un message d'erreur (« Réessayer », « Recharger les thèmes », « Terminer la capture », lien « Ouvrir la page d'options »), en modes clair et sombre.
- Le jeton régénéré au point « Jeton révoqué » doit ensuite être reporté dans le fichier `.env` des tests de contrat.
- À la fin des tests, mettre à la corbeille tous les items créés dans la base de test, et rétablir la propriété Theme si elle a été renommée.

## Reprise après une erreur Notion (`notion-error-recovery`)

### Proposer « Réessayer » pour une erreur passagère

- [x] **Nominal — Réessayer une création après une coupure réseau** : remplir le formulaire, couper le Wi-Fi, cliquer sur « Ajouter ». « Connexion impossible » s'affiche avec « Réessayer ». Rétablir le Wi-Fi, puis cliquer sur « Réessayer » : l'item est créé dans Notion avec les valeurs du formulaire, et le message d'erreur n'est plus affiché.
- [x] **Erreur — Réessayer sans succès** : créer un item, sélectionner un passage, couper le Wi-Fi, puis cliquer sur « Ajouter l'extrait », puis sur « Réessayer » sans rétablir le Wi-Fi. Le message et le bouton « Réessayer » restent affichés, et l'extrait n'est pas ajouté à la liste. Une réponse « Notion ne répond pas » (5xx) ne se provoque pas à la main : le comportement est le même pour toute erreur passagère, et la table des actions est couverte par `tests/unit/error-actions.test.ts`.

### Renvoyer vers la page d'options pour une configuration à corriger

- [x] **Nominal — Jeton révoqué pendant une capture** : créer un item, saisir une description, puis dans Notion (Paramètres → Intégrations → intégration de test) régénérer le jeton, sans l'enregistrer dans les options. Cliquer sur « Enregistrer la description » : « Jeton Notion invalide » s'affiche avec le lien « Ouvrir la page d'options », sans bouton « Réessayer ».
- [x] **Nominal — Ouvrir les options depuis l'erreur** : depuis le point précédent, cliquer sur « Ouvrir la page d'options ». La page d'options s'ouvre, et le texte de la description est toujours dans le panneau.

### Prendre en compte une configuration corrigée

- [x] **Nominal — Nouveau jeton pour la même base** : avec le jeton régénéré, modifier l'auteur et cliquer sur « Enregistrer les modifications » : « Jeton Notion invalide » s'affiche. Enregistrer le nouveau jeton dans la page d'options pour la même base, sans fermer le panneau, puis cliquer à nouveau sur « Enregistrer les modifications ». La modification est enregistrée dans Notion.
- [x] **Alternatif — Autre base enregistrée** : avec une capture en cours, enregistrer dans la page d'options l'URL d'une autre base partagée avec l'intégration, panneau ouvert. Le panneau affiche le formulaire de préparation, pré-rempli depuis l'onglet actif. Remettre ensuite « Readme center (tests) » dans la page d'options.

### Recharger les thèmes après un échec de lecture

- [x] **Nominal — Recharger après une coupure réseau** : couper le Wi-Fi, puis ouvrir le panneau. « Connexion impossible » s'affiche à la place des thèmes, avec « Recharger les thèmes ». Rétablir le Wi-Fi et cliquer sur « Recharger les thèmes » : le champ « Thèmes » propose les thèmes de la base, et le message n'est plus affiché.
- [x] **Alternatif — Propriété Theme rétablie** : renommer la propriété Theme de la base de test (par exemple « Theme2 »), puis ouvrir le panneau. « La base Notion a changé » s'affiche avec « Recharger les thèmes ». Renommer la propriété en « Theme » et cliquer sur « Recharger les thèmes » : le champ « Thèmes » propose les thèmes de la base.

### Proposer de terminer une capture dont l'item n'existe plus

- [x] **Nominal — Item mis à la corbeille avec une description en cours** : créer un item, le mettre à la corbeille dans Notion, saisir une description et cliquer sur « Enregistrer la description ». « Item introuvable dans Notion » s'affiche avec « Terminer la capture ». Cliquer dessus : le panneau affiche le formulaire de préparation, pré-rempli depuis l'onglet actif, sans message de confirmation.

### Ne pas proposer de terminer pour un extrait introuvable

- [x] **Alternatif — Extrait supprimé directement dans Notion** : ajouter un extrait, supprimer sa citation dans la page Notion de l'item, puis modifier son texte dans le panneau et cliquer sur « Enregistrer ». « Item introuvable dans Notion » s'affiche sous l'extrait, sans « Terminer la capture » ni « Réessayer ». Après « Annuler », les actions « Modifier » et « Supprimer » de l'extrait sont disponibles.

### Réessayer automatiquement en cas de limitation

- [x] **Nominal — Limitation passagère pendant un ajout d'extrait** : une limitation de Notion (réponse 429) ne se provoque pas de façon fiable à la main. Le réessai après le délai `Retry-After`, l'affichage de « Notion limite les appels » avant chaque attente et le succès après limitation sont couverts par `tests/unit/retry.test.ts`. Vérifier dans le code que l'ajout d'un extrait passe par `withRateLimitRetry` (`ExtractCapture.vue`).
- [x] **Erreur — Limitation persistante** : même remarque. Les 3 réessais à 1 seconde d'intervalle sans `Retry-After`, puis la propagation de l'erreur, sont couverts par `tests/unit/retry.test.ts`, et l'action « Réessayer » de « Notion limite les appels » par `tests/unit/error-actions.test.ts`. Vérifier dans le code que l'enregistrement de la description passe par `withRateLimitRetry` (`DescriptionEditor.vue`).

### Conserver la saisie pendant la reprise

- [x] **Alternatif — Réessai en cours** : modifier l'auteur, couper le Wi-Fi, cliquer sur « Enregistrer les modifications » : « Connexion impossible » s'affiche. Dans les outils de développement, choisir la limitation « GPRS », rétablir le Wi-Fi, puis cliquer sur « Réessayer ». Tant que Notion n'a pas répondu, le formulaire contient l'auteur modifié, et « Réessayer » et « Enregistrer les modifications » sont inactifs.
