# US-07 — Check-list de tests manuels

Change OpenSpec : `us-07-modifier-supprimer-extrait`. Un point par scénario de la spec `extract-editing` de ce change.

## Préparation

- Construire l'extension avec `npm run build`, puis la charger en temporaire dans Zen (voir `README.md`).
- Utiliser la base « Readme center (tests) » et le jeton de son intégration, avec une configuration vérifiée. Ne jamais faire ces tests sur la base de production.
- Garder la base de test ouverte dans Notion pour contrôler le corps des pages des items.
- Sauf mention contraire, chaque point commence par la création d'un item depuis un article qui contient des titres, puis par l'ajout des extraits décrits.
- Vérifier une fois les actions « Modifier » et « Supprimer » au clavier : Tab pour les atteindre (anneau de focus `accent`), Entrée ou Espace pour les activer, et leur infobulle au survol. Vérifier aussi le mode modification (champ texte, menu « Section », « Enregistrer » et « Annuler ») en modes clair et sombre.
- À la fin des tests, mettre à la corbeille tous les items créés dans la base de test.

## Modification et suppression des extraits (`extract-editing`)

### Proposer les actions sur chaque extrait

- [x] **Nominal — Actions d'un extrait** : ajouter un extrait sous une nouvelle section « Le constat ». Dans la liste, l'extrait propose à sa droite les actions « Modifier » (crayon) et « Supprimer » (corbeille).
- [x] **Alternatif — Modifier un second extrait** : ajouter deux extraits, puis cliquer sur « Modifier » pour le premier. Les actions « Modifier » et « Supprimer » du second extrait sont inactives.

### Ouvrir la modification d'un extrait

- [x] **Nominal — Ouvrir la modification** : ajouter l'extrait « Culture is what people do when no one is watching. » sous « Le constat », puis cliquer sur « Modifier ». Le champ texte contient « Culture is what people do when no one is watching. », le menu « Section » propose les sections de l'item puis « Sans section », sans « + Nouvelle section… », et « Le constat » est pré-sélectionné.
- [x] **Alternatif — Annuler la modification** : ouvrir la modification d'un extrait, modifier son texte, puis cliquer sur « Annuler ». L'extrait réapparaît dans la liste avec son texte d'origine, et la citation est inchangée dans Notion.

### Activer l'enregistrement uniquement si l'extrait a changé

- [x] **Erreur — Texte vidé** : ouvrir la modification d'un extrait, puis vider entièrement le champ texte. « Enregistrer » est inactif.
- [x] **Alternatif — Rien n'a changé** : ouvrir la modification d'un extrait sans rien modifier. « Enregistrer » est inactif.

### Enregistrer le texte modifié d'un extrait

- [x] **Nominal — Corriger une coquille** : ajouter sous « Le constat » un extrait contenant « Culture is what poeple do. » (le corriger dans le champ si besoin pour obtenir ce texte), puis remplacer son texte par « Culture is what people do. » et cliquer sur « Enregistrer ». Dans Notion, la citation contient « Culture is what people do. », à la même place sous « Le constat », et la liste affiche le texte corrigé.

### Déplacer un extrait vers une autre section

- [x] **Nominal — Ranger un extrait dans une autre section** : ajouter deux extraits sous « Le constat », puis un extrait sous « Les leviers ». Ouvrir la modification du premier extrait de « Le constat », choisir « Les leviers », puis cliquer sur « Enregistrer ». Dans Notion, la citation est après la citation existante de « Les leviers », et « Le constat » ne contient plus que sa seconde citation.
- [x] **Alternatif — Sortir un extrait de sa section** : ajouter un extrait sans section, puis deux extraits sous « Le constat ». Choisir « Sans section » pour une citation de « Le constat », puis cliquer sur « Enregistrer ». Dans Notion, la citation est après la citation sans section existante et avant le titre « Le constat ».
- [x] **Alternatif — Déplacer et corriger en une fois** : ouvrir la modification d'un extrait, modifier son texte et choisir une autre section, puis cliquer sur « Enregistrer ». Dans Notion, la citation placée dans la nouvelle section contient le texte modifié.

### Supprimer un extrait

- [x] **Nominal — Supprimer un extrait** : ajouter deux extraits sous « Le constat », puis cliquer sur « Supprimer » pour le premier. Aucune confirmation n'est demandée, sa citation n'est plus dans la page Notion, et la liste n'affiche plus que le second extrait sous « Le constat ».

### Supprimer une section vidée

- [x] **Nominal — Supprimer le dernier extrait d'une section** : ajouter un extrait sous « Le constat », puis un seul extrait sous « Les leviers », et supprimer ce dernier. Dans Notion, le titre « Les leviers » n'est plus dans la page ; le menu « Section » de la zone d'ajout ne propose plus « Les leviers ».
- [x] **Alternatif — Déplacer le dernier extrait d'une section** : ajouter un extrait sous « Le constat », puis un seul extrait sous « Les leviers », et déplacer ce dernier vers « Le constat ». Dans Notion, le titre « Les leviers » n'est plus dans la page, et l'extrait est à la fin de « Le constat ».
- [x] **Alternatif — Section pré-sélectionnée supprimée** : ajouter un seul extrait sous « Les leviers », qui devient la section pré-sélectionnée dans la zone d'ajout, puis supprimer cet extrait. « Sans section » est pré-sélectionné dans la zone d'ajout.

### Empêcher une double action pendant l'envoi

- [x] **Alternatif — Suppression en cours** : ouvrir les outils de développement du panneau (`about:debugging`, Inspecter), onglet Réseau, et choisir une limitation de débit lente (par exemple « GPRS »), puis cliquer sur « Supprimer » pour un extrait. Tant que Notion n'a pas répondu, l'infobulle de l'action affiche « Suppression en cours… », et les autres actions de la liste et « Ajouter l'extrait » sont inactifs. Faire de même avec « Enregistrer » : le bouton affiche « Enregistrement en cours… ».

### Indiquer la cause d'un échec de modification ou de suppression

- [x] **Erreur — Extrait supprimé directement dans Notion** : ajouter un extrait, supprimer sa citation directement dans Notion, puis, dans le panneau, modifier le texte de cet extrait et cliquer sur « Enregistrer ». Le message « Item introuvable dans Notion » s'affiche sous l'extrait, et le champ texte contient toujours le texte modifié.
- [x] **Erreur — Pas de réseau pendant une suppression** : couper le Wi-Fi, puis cliquer sur « Supprimer » pour un extrait. Le message « Connexion impossible » s'affiche sous l'extrait, et l'extrait reste dans la liste.

### Retirer de la liste un extrait déjà supprimé dans Notion

- [x] **Alternatif — Supprimer un extrait déjà supprimé dans Notion** : ajouter un extrait, supprimer sa citation directement dans Notion, puis cliquer sur « Supprimer » pour cet extrait dans le panneau. L'extrait n'est plus dans la liste, et aucun message d'erreur ne s'affiche.

### Retirer le surlignage d'un extrait supprimé

- [x] **Nominal — Supprimer un extrait surligné** : ajouter deux extraits depuis la page lue, tous deux surlignés, puis supprimer le premier depuis le panneau. Seul le second passage reste surligné dans la page.
- [x] **Alternatif — Déplacer un extrait surligné** : ajouter un extrait surligné, puis le déplacer vers une autre section. Le passage reste surligné dans la page.
