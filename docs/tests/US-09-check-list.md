# US-09 — Check-list de tests manuels

Change OpenSpec : `us-09-reprendre-terminer-capture`. Un point par scénario de la spec `capture-session` de ce change.

## Préparation

- Construire l'extension avec `npm run build`, puis la charger dans Zen (voir `README.md`).
- Utiliser la base « Readme center (tests) » et le jeton de son intégration, avec une configuration vérifiée. Ne jamais faire ces tests sur la base de production.
- Garder la base de test ouverte dans Notion pour contrôler les items.
- Sauf mention contraire, chaque point commence par la création d'un item depuis un article qui contient des titres.
- « Fermer puis rouvrir le panneau » se fait avec le bouton de l'extension.
- À la fin des tests, mettre à la corbeille tous les items créés dans la base de test.

## Capture en cours (`capture-session`)

### Conserver la capture dès la création de l'item

- [ ] **Nominal — Fermer puis rouvrir le panneau** : créer l'item « What a workplace can't promise », ajouter deux extraits sous « Le constat », saisir une description sans l'enregistrer, puis fermer et rouvrir le panneau. Le panneau affiche l'item « What a workplace can't promise » et son lien « Ouvrir dans Notion », la liste affiche les deux extraits sous « Le constat », et le champ « Description » contient le texte saisi.
- [ ] **Alternatif — Redémarrer Zen** : avec une capture en cours, quitter Zen, le relancer et ouvrir le panneau. La capture reprend telle qu'elle était.
- [ ] **Alternatif — Modification de métadonnée non enregistrée** : déplier le formulaire, remplacer l'auteur sans l'enregistrer, puis fermer et rouvrir le panneau. Le formulaire est déplié avec l'auteur modifié, et le bouton « Enregistrer les modifications » est affiché.

### Ne pas pré-remplir une capture reprise

- [ ] **Nominal — Reprendre sur un autre onglet** : avec une capture en cours sur un premier article, fermer le panneau, passer sur l'onglet d'un second article et rouvrir le panneau. Le panneau affiche la capture du premier article, sans aucune valeur du second.

### Ne pas reprendre l'état éphémère

- [ ] **Alternatif — Extrait en cours de modification** : ouvrir la modification d'un extrait, changer son texte sans l'enregistrer, puis fermer et rouvrir le panneau. L'extrait apparaît fermé dans la liste, avec son texte enregistré.
- [ ] **Alternatif — Surlignages après la reprise** : ajouter deux extraits, surlignés dans la page lue, puis fermer et rouvrir le panneau. Aucun passage n'est surligné dans la page, et aucun message de confirmation n'est affiché.

### Terminer la capture

- [ ] **Nominal — Terminer une capture enregistrée** : toutes les modifications étant enregistrées, cliquer sur « Terminer », en bas du panneau. Le panneau affiche le formulaire de préparation, pré-rempli depuis l'onglet actif, il reste ouvert, et l'item est inchangé dans Readme center.
- [ ] **Alternatif — Rouvrir le panneau après « Terminer »** : cliquer sur « Terminer », puis fermer et rouvrir le panneau. Le panneau affiche le formulaire de préparation, sans la capture terminée.
- [ ] **Alternatif — Item pas encore créé** : ouvrir le panneau sur un article, sans cliquer sur « Ajouter ». Aucun bouton « Terminer » n'est affiché en bas du panneau.

### Confirmer la fin d'une capture non enregistrée

- [ ] **Nominal — Terminer quand même** : saisir une description sans l'enregistrer, cliquer sur « Terminer », puis sur « Terminer quand même ». Le panneau affiche le formulaire de préparation, et la Description de l'item reste vide dans Notion.
- [ ] **Alternatif — Annuler** : déplier le formulaire, modifier l'auteur sans l'enregistrer, cliquer sur « Terminer », puis sur « Annuler ». La capture reste affichée avec l'auteur modifié, et le message « Des modifications ne sont pas enregistrées dans Notion » n'est plus affiché.

### Bloquer « Terminer » pendant un envoi

- [ ] **Alternatif — Ajout d'extrait en cours** : sélectionner un passage et cliquer sur « Ajouter l'extrait ». Tant que Notion n'a pas répondu (« Ajout en cours… »), le bouton « Terminer » est inactif. Pour observer l'état, ralentir le réseau dans les outils de développement de l'extension.

### Abandonner une capture d'une autre base

- [ ] **Erreur — Base changée dans les options** : avec une capture en cours sur « Readme center (tests) », enregistrer dans la page d'options l'URL d'une autre base, puis rouvrir le panneau. Le panneau affiche le formulaire de préparation, pré-rempli depuis l'onglet actif, sans aucun message. Remettre ensuite « Readme center (tests) » dans la page d'options.

### Partager la capture entre fenêtres

- [ ] **Alternatif — Deux fenêtres** : ouvrir le panneau dans deux fenêtres de Zen sur la même capture, puis ajouter un extrait depuis la première fenêtre. L'extrait apparaît dans la liste du panneau de la seconde fenêtre.
