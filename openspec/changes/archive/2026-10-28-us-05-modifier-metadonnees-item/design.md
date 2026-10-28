# Design

## Context

Après l'US-03, `CaptureForm.vue` passe à l'état `created` et ne garde que l'URL de la page créée (`createdItemUrl`). Les champs restent affichés et saisissables, mais rien n'est enregistré. Le pré-remplissage et la recherche de doublon sont déjà coupés dans cet état. `notionPatch` existe dans le client mais n'est utilisé que par les tests de contrat. Voir `proposal.md` pour le besoin.

## Goals / Non-Goals

**Goals:**
- Comparer le formulaire aux dernières valeurs enregistrées et n'envoyer que les différences.
- Une requête de modification construite par une fonction pure testée.
- Un message dédié quand l'item n'existe plus dans Notion.

**Non-Goals:**
- Aucun enregistrement automatique (hors scope du PRD).
- Aucune détection de doublon après la création.
- Aucune conservation des modifications non enregistrées à la fermeture du panneau (US-09).
- Aucune action « Terminer la capture » sur l'erreur « Item introuvable dans Notion » (US-09 et US-10).
- Aucune relecture de l'item depuis Notion : le panneau ne reflète pas les modifications faites directement dans Notion (hors scope du PRD).

## Decisions

### 1. Dépendances
Aucune nouvelle dépendance ni permission.

### 2. Valeurs enregistrées (`CaptureForm.vue`)
- À la création réussie, le panneau mémorise `createdItemId` (l'`id` renvoyé par `createItem`) et `savedValues`, copie normalisée du formulaire au moment de l'envoi.
- Normalisation, partagée avec la comparaison : Titre et Auteur débarrassés des espaces en début et fin, thèmes traités comme un ensemble (l'ordre n'est pas significatif).
- Après chaque enregistrement réussi, `savedValues` reçoit la copie normalisée des valeurs envoyées.
- Le statut gagne la valeur `saving` : `'editing' | 'creating' | 'created' | 'saving'`.

### 3. Comparaison (`src/capture/form-diff.ts`)
- Fonction pure `changedFields(saved, current)` → liste des champs modifiés parmi `title`, `url`, `author`, `authorLinkedin`, `language`, `themes`, après normalisation (décision 2).
- `dirty` = la liste n'est pas vide. Le bouton « Enregistrer les modifications » est affiché si `status` vaut `saving`, ou si `status` vaut `created` et que `dirty` est vrai.
- Le message de confirmation (création ou enregistrement) est affiché si `status` vaut `created` et que `dirty` est faux.

### 4. Requête de modification (`src/notion/item-payload.ts`)
Fonction pure `buildUpdatePageBody(saved, current)`, appelée uniquement si `changedFields` n'est pas vide et que `isFormValid(current)` est vrai. Elle ne contient que les entrées des champs modifiés :

| Champ modifié | Entrée de la requête |
| --- | --- |
| `title` | `properties.Title` = `{ "title": [{ "text": { "content": "<titre>" } }] }` |
| `url` | `properties.URL` = `{ "url": "<url>" }` |
| `author` | `properties.Source` = `{ "rich_text": [{ "text": { "content": "<auteur>" } }] }` |
| `authorLinkedin` | `properties["LinkedIn auteur"]` = `{ "url": "<profil>" }`, ou `{ "url": null }` si le champ est vide |
| `themes` | `properties.Theme` = `{ "multi_select": [{ "name": "<thème>" }, …] }`, liste complète des thèmes choisis |
| `language` | `icon` = `{ "type": "emoji", "emoji": "<drapeau>" }`, avec la correspondance de l'US-03 |

- `Date`, `Description`, `Type` et le corps de la page ne figurent jamais dans la requête.
- Les formats d'écriture sont ceux de `buildCreatePageBody`, extraits en fonctions communes si besoin, sans changer la requête de création.

### 5. Enregistrement (`src/notion/items.ts`)
- `updateItem(config, pageId, body)` appelle `PATCH /v1/pages/{pageId}` avec `notionPatch`.
- En cas d'échec, l'erreur est propagée. Le panneau affiche `itemErrorMessage(error)` (décision 6).

### 6. Message « Item introuvable dans Notion » (`src/notion/errors.ts`)
- `MESSAGES` reçoit `itemNotFound: 'Item introuvable dans Notion'`.
- Nouvelle fonction `itemErrorMessage(error)` pour les appels portant sur un item existant : une `NotionHttpError` de statut 400 ou 404 renvoie `itemNotFound`, tout le reste renvoie `errorMessage(error)`.
- `errorMessage` n'est pas modifié : la vérification de connexion, la lecture des thèmes et la création gardent leurs messages.
- Notion répond 400 `validation_error` (« Can't edit block that is archived ») à la modification d'une page mise à la corbeille, comme l'a vérifié le test de contrat (tâche 2.2). Le formulaire est validé avant l'envoi, donc un 400 vient presque toujours d'un item à la corbeille. Qu'un autre 400, rare, affiche ce message est accepté (choix de l'utilisatrice).

### 7. Panneau (`CaptureForm.vue`)
- Au clic sur « Enregistrer les modifications » : `status` passe à `saving`, l'erreur précédente est effacée, puis `updateItem` est appelé avec `buildUpdatePageBody(savedValues, valeurs courantes)`.
  - Succès : `savedValues` est mis à jour, `status` revient à `created` et le message de confirmation devient « Modifications enregistrées dans Readme center ».
  - Échec : `status` revient à `created`, l'erreur s'affiche, et `savedValues` est inchangé.
- À la création réussie, l'avertissement de doublon éventuel est effacé : une fois l'item créé, le panneau n'affiche plus aucun avertissement de doublon (exigence « Ne pas détecter de doublon après la création »).
- Le message de confirmation garde son dernier libellé : « Item créé dans Readme center » jusqu'au premier enregistrement réussi, puis « Modifications enregistrées dans Readme center ».
- La recherche de doublon et le pré-remplissage restent coupés après la création, comme dans l'US-03.

### 8. Interface
- **Bouton** : `DsButton` `primary` `md`, à l'emplacement de « Ajouter », libellé « Enregistrer les modifications » ou « Enregistrement en cours… », inactif si le formulaire est invalide ou si `status` vaut `saving`.
- **Erreur** : `DsMessage` `error` au-dessus du bouton, comme pour la création.
- **Confirmation** : `DsMessage` `success`, suivi du `DsLink` « Ouvrir dans Notion », qui reste affiché dans tous les cas après la création.

### 9. Tests
- **Vitest** :
  - `changedFields` : aucun changement, chaque champ seul, espaces ajoutés autour du titre (aucun changement), thèmes dans un autre ordre (aucun changement), thème ajouté et retiré.
  - `buildUpdatePageBody` : chaque ligne de la table de la décision 4, plusieurs champs à la fois, profil LinkedIn vidé (`null`), absence de `Date`, `Description`, `Type` et `children`.
  - `updateItem` avec des réponses simulées : succès, 404, erreur réseau.
  - `itemErrorMessage` : 400, 404, puis un cas de chaque autre ligne de `errorMessage`.
- **Karate** (`tests/contract/item-editing.feature`), sur la base « Readme center (tests) » :
  - un item créé puis modifié par `PATCH /v1/pages/{id}` avec Title, Source, Theme, `LinkedIn auteur` à `null` et une icône renvoie 200, et la page a les nouvelles valeurs, sa Date étant inchangée ;
  - un `PATCH` sur un item mis à la corbeille renvoie 400 `validation_error` ;
  - chaque item créé est mis à la corbeille à la fin du scénario.

## Risks / Trade-offs

- [Une modification faite dans Notion sur le même champ est écrasée] → Seuls les champs modifiés dans le panneau sont envoyés. Le cas d'un même champ modifié des deux côtés est accepté (hors scope « synchronisation » du PRD).
- [Un 400 sans rapport avec la corbeille afficherait « Item introuvable dans Notion »] → Accepté : le formulaire est validé avant l'envoi, ce qui rend ce cas rare.
- [Un thème supprimé dans Notion entre-temps] → Notion le recrée comme nouvelle option, comme à la création. Accepté.
