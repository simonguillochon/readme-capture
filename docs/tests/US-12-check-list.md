# US-12 — Check-list de tests manuels

Change OpenSpec : `us-12-publier-release-automatique`. Un point par scénario de la spec `continuous-release` de ce change, avec la façon de le provoquer sur GitHub.

## Préparation

- Faire la configuration décrite dans la section « Intégration continue et releases » du `README.md` : secrets du dépôt `NOTION_TEST_TOKEN` et `NOTION_TEST_DATABASE_ID`, environnement `release` limité à la branche `main` avec les secrets `AMO_API_KEY` et `AMO_API_SECRET`.
- Les secrets du dépôt désignent la base « Readme center (tests) ». Ne jamais les faire pointer vers la base de production.
- Dans les points ci-dessous, `X.Y.Z` désigne la version de `package.json` au moment du test, et `X.Y.Z+1` une version supérieure.
- Les résultats se lisent dans l'onglet *Actions* du dépôt (exécutions du workflow « CI »), sur la page des releases et dans la liste des tags.
- Le point « Pull request depuis un fork » demande un second compte GitHub.
- Ne jamais fusionner les pull requests et branches de test créées pour ces points.

## Release continue (`continuous-release`)

### Vérifier chaque push et chaque pull request

- [ ] **Nominal — Push dont les tests passent** : pousser sur `main` un commit qui ne change pas le code, par exemple une correction du `README.md`. Les jobs `checks` et `contract` passent, et GitHub affiche une coche verte à côté du commit.
- [ ] **Erreur — Test en échec** : sur `main`, augmenter la version de `package.json` et ajouter à un fichier de `tests/unit/` un test qui échoue (`expect(1).toBe(2)`), committer puis pousser. Le job `checks` échoue sur `npm test`, le job `release` n'est pas lancé, GitHub affiche une croix rouge à côté du commit, et ni la release ni le tag de la nouvelle version n'existent. Annuler aussitôt ce commit avec `git revert` et pousser.

### Faire échouer les tests de contrat sans secrets

- [ ] **Erreur — Pull request depuis un fork** : avec un second compte GitHub, forker le dépôt, modifier une ligne du `README.md` dans le fork et ouvrir une pull request vers `main`. Si GitHub demande d'approuver l'exécution du workflow, l'approuver. Le job `checks` passe (typecheck, Vitest, OpenSpec) ; le job `contract` échoue, et son journal contient « Secrets des tests de contrat indisponibles » sans aucun appel à `api.notion.com` ; la pull request est affichée en échec. Fermer la pull request sans la fusionner.

### Créer une release pour une nouvelle version

- [ ] **Nominal — Nouvelle version poussée** : vérifier que le tag `vX.Y.Z+1` n'existe pas, passer la version de `package.json` à `X.Y.Z+1`, committer puis pousser sur `main`. Une fois le workflow terminé, la release `vX.Y.Z+1` apparaît sur la page des releases, et le tag `vX.Y.Z+1` désigne le commit poussé (même empreinte que celle affichée dans l'exécution du workflow).
- [ ] **Alternatif — Version déjà publiée** : la release `vX.Y.Z` existant déjà, pousser sur `main` un commit qui ne change pas la version. Dans le journal du job `release`, les pas de construction, de signature et de création de la release sont ignorés ; aucune nouvelle release n'apparaît, et GitHub affiche une coche verte à côté du commit.

### Joindre l'extension signée par Mozilla

- [ ] **Nominal — Installer depuis la release** : sur la release `vX.Y.Z`, vérifier que le seul fichier joint est `readme-capture-X.Y.Z.xpi` (en plus des archives du code source ajoutées par GitHub). Le télécharger, puis l'installer dans Zen depuis `about:addons`, roue dentée, « Installer un module depuis un fichier… ». Readme Capture X.Y.Z apparaît dans la liste des modules. Fermer puis rouvrir Zen : l'extension est toujours installée.
- [ ] **Erreur — Signature refusée par Mozilla** : pousser sur `main` une version déjà signée sur addons.mozilla.org mais sans release GitHub (par exemple la 1.0.0 signée à la main lors de l'US-11, avant de passer à la version suivante). Mozilla refuse de signer une version déjà envoyée : le pas de signature échoue, GitHub affiche une croix rouge à côté du commit, et ni la release ni le tag de cette version n'existent.

### Générer les notes de release

- [ ] **Nominal — Notes de la release** : après une release `vX.Y.Z`, pousser trois commits sur `main`, puis une nouvelle version `X.Y.Z+1`. Les notes de la release `vX.Y.Z+1` listent les changements depuis `vX.Y.Z`.

### Ne jamais exposer les secrets

- [ ] **Erreur — Secret dans les journaux** : depuis une fenêtre de navigation privée, sans être connecté à GitHub, ouvrir le journal d'une exécution qui a lancé les tests de contrat et la signature. Rechercher dans les journaux des jobs `contract` et `release` les premiers caractères du jeton Notion, de l'ID de la base de test et des clés d'API addons.mozilla.org : aucune valeur n'apparaît en clair ; une valeur affichée apparaît sous la forme `***`.
- [ ] **Alternatif — Clés de signature hors de main** : sur une branche de test, ajouter au workflow un job qui déclare `environment: release` et affiche la longueur de la clé (`run: echo "${#AMO_API_KEY}"`, avec `AMO_API_KEY: ${{ secrets.AMO_API_KEY }}` dans son `env`), puis ouvrir une pull request vers `main`. GitHub refuse de lancer ce job, car la branche n'est pas autorisée à utiliser l'environnement `release`. Fermer la pull request sans la fusionner et supprimer la branche.

### Utiliser la base de test une exécution à la fois

- [ ] **Alternatif — Deux push rapprochés** : pousser sur `main` un premier commit, puis un second quelques secondes plus tard (par exemple deux corrections du `README.md`). Pendant que le job `contract` de la première exécution tourne, celui de la seconde est affiché en attente (« Waiting » / « Pending »), et il ne démarre qu'après la fin du premier.
