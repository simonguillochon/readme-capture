# Design

## Context

L'US-06 a livré `ExtractCapture.vue`, l'état `{ sections, extracts }` (`src/capture/extract-placement.ts`), où chaque extrait connaît l'identifiant de sa citation (`blockId`) et de sa section (`sectionId`), et `appendBlocks` avec les positions `start`, `after_block` et `end`. Chaque extrait ajouté est surligné dans la page lue par `CSS.highlights`, via le port de l'onglet (`src/capture/selection-watcher.ts`, commande `highlight`). `itemErrorMessage` renvoie « Item introuvable dans Notion » pour toute réponse 400 ou 404. Voir `proposal.md` pour le besoin.

## Goals / Non-Goals

**Goals:**
- Des fonctions pures, testées, qui calculent les appels Notion et le nouvel état pour une modification, un déplacement et une suppression.
- Un retrait ciblé du surlignage d'un extrait supprimé.

**Non-Goals:**
- Aucune création de section depuis le mode modification.
- Aucun renommage, changement de niveau ni suppression explicite d'une section (hors scope du PRD).
- Aucune relecture du corps de la page Notion (hors scope « synchronisation »).
- Aucune conservation des extraits à la fermeture du panneau (US-09).

## Decisions

### 1. Dépendances
Aucune nouvelle dépendance ni permission.

### 2. Client Notion
- Ajout de `notionDelete<T>(token, path)` dans `src/notion/client.ts`, construit comme les autres méthodes (`DELETE`, mêmes en-têtes et mêmes erreurs).
- `updateQuote(config, blockId, text)` (`src/notion/extracts.ts`) appelle `PATCH /v1/blocks/{blockId}` avec `{ "quote": { "rich_text": [...] } }`, le texte étant découpé comme à l'ajout (`quoteBlock` de l'US-06).
- `deleteBlock(config, blockId)` appelle `DELETE /v1/blocks/{blockId}`.
- Les réponses de ces deux appels, y compris sur un bloc déjà supprimé, sont vérifiées par les tests de contrat (tâche 2.2).

### 3. Règles pures (`src/capture/extract-placement.ts`)
Nouvelles fonctions, qui renvoient une liste d'opérations et une fonction `apply` donnant le nouvel état, sur le modèle de `placeExtract` :

| Fonction | Cas | Opérations, dans l'ordre |
| --- | --- | --- |
| `editExtract(state, blockId, text, sectionId)` | même section, texte modifié | mettre à jour la citation `blockId` |
| | autre section | ajouter la citation avec le nouveau texte à l'emplacement de `placeExtract` pour cette section ; supprimer la citation `blockId` ; supprimer le titre de l'ancienne section si elle est vide |
| `deleteExtract(state, blockId)` | — | supprimer la citation `blockId` ; supprimer le titre de sa section si elle est vide |

- L'emplacement dans la nouvelle section se calcule sans l'extrait déplacé, avec les règles de `placeExtract` (fin de section, ou en haut de la page après les autres extraits sans section).
- Une section est vide quand aucun extrait de l'état, après l'opération, n'a son `sectionId`.
- `apply` retire l'extrait déplacé ou supprimé, ajoute l'extrait déplacé avec son nouveau `blockId`, retire la section vidée de `sections`, et garde l'ordre de la page.

### 4. Exécution des opérations (`ExtractCapture.vue`)
- Les opérations sont envoyées une par une, dans l'ordre de la table.
- **Mise à jour ou ajout** : une erreur arrête l'action, rien n'est modifié dans l'état et le message `itemErrorMessage(error)` s'affiche sous l'extrait.
- **Suppression de la citation** : une réponse 400 ou 404 compte comme une réussite. Toute autre erreur arrête l'action et affiche `errorMessage(error)` sous l'extrait. Si l'ajout au nouvel emplacement a déjà réussi, l'état reçoit le nouvel extrait et garde l'ancien, qui reste dans la liste avec le message d'erreur.
- **Suppression du titre d'une section vidée** : une réponse 400 ou 404 compte comme une réussite. Toute autre erreur affiche `errorMessage(error)` sous la liste. La section reste alors dans l'état, sans extrait, et reste proposée dans les menus Section.
- Pendant une action, l'état `busy` (`{ blockId, kind: 'saving' | 'deleting' }`) rend inactifs toutes les actions de la liste et le bouton « Ajouter l'extrait ».
- Si la section supprimée était `chosen` ou `lastUsed` dans la zone d'ajout, ces deux valeurs passent à `'none'`. Sinon, elles ne changent pas.

### 5. Surlignage par extrait (`src/capture/selection-watcher.ts`)
- La commande `highlight` reçoit une clé : `{ type: 'highlight', text, key }`. La page garde une table `key → Range` et ajoute la plage au surlignage `readme-capture-extract` comme dans l'US-06.
- Nouvelle commande `{ type: 'unhighlight', key }` : la page retire la plage de la table et du surlignage.
- La clé est un identifiant local créé à l'ajout (`crypto.randomUUID()`) et gardé dans l'extrait (`highlight: { tabId, key } | null`), avec l'onglet où il a été surligné. Elle ne change pas quand l'extrait est déplacé.
- À la suppression d'un extrait, le panneau poste `unhighlight` sur le port de son onglet si ce port est encore ouvert. Sinon, il n'y a rien à faire.
- Les commandes `pause` et `resume` et le comportement à la déconnexion sont inchangés.

### 6. Interface (`ExtractCapture.vue`)
- **Actions** : à droite de chaque extrait, deux Icon Buttons `ghost` `md`, « Modifier » (`pencil-simple`) et « Supprimer » (`trash`), avec ces libellés accessibles.
- **Mode modification** : à la place de l'extrait, un Textarea (atome du DS), pré-rempli ; sous lui, un `DsField` « Section » avec `DsSelect`, proposant les sections dans l'ordre de création puis « Sans section » ; puis « Enregistrer » (`primary` `sm`) et « Annuler » (`secondary` `sm`).
- **Libellés pendant l'envoi** : « Enregistrement en cours… » sur « Enregistrer », et « Suppression en cours… » comme libellé accessible et infobulle du bouton « Supprimer », l'Icon Button n'ayant pas de texte visible.
- **Erreur** : `DsMessage` `error` sous l'extrait concerné.
- Le composant Textarea est créé d'après l'atome Textarea du DS (`DsTextarea`), s'il n'existe pas encore dans l'extension.
- Icônes `pencil-simple-light` et `trash-light` exportées du composant Icons du fichier Figma du DS, ajoutées à `DsIcon` et au type de la prop `icon` de `DsIconButton`.

### 7. Tests
- **Vitest** :
  - `editExtract` : texte seul, déplacement vers une section avec et sans extrait, vers « Sans section » avec et sans extraits sans section, déplacement du dernier extrait d'une section, `apply` dans chaque cas.
  - `deleteExtract` : extrait non dernier, dernier extrait d'une section, extrait sans section.
  - `updateQuote` et `deleteBlock` avec des réponses simulées : succès, 400, 404, erreur réseau.
  - `notionDelete` : méthode, en-têtes.
- **Karate** (`tests/contract/extract-editing.feature`), sur un item créé dans « Readme center (tests) » :
  - mise à jour du texte d'une citation : 200, puis le texte lu est le nouveau ;
  - suppression d'une citation : 200, puis elle n'est plus parmi les enfants de la page ;
  - suppression d'un bloc déjà supprimé : statut constaté ;
  - mise à jour d'un bloc supprimé : statut constaté ;
  - chaque item créé est mis à la corbeille à la fin du scénario.
- Le surlignage est vérifié par la check-list manuelle.

## Risks / Trade-offs

- [Un déplacement interrompu après l'ajout au nouvel emplacement laisse deux citations] → Les deux restent visibles dans la liste avec un message d'erreur. L'utilisatrice supprime celle qu'elle veut (décision 4).
- [La suppression d'un titre de section échoue] → La section reste, vide, dans Notion et dans les menus. Accepté.
- [Notion ne répond pas 400 ou 404 pour un bloc déjà supprimé] → Vérifié par les tests de contrat avant l'implémentation (tâche 2.2).
