# Design

## Context

Après l'US-09, chaque composant du panneau traduit ses erreurs en message avec `errorMessage` ou `itemErrorMessage` (`src/notion/errors.ts`), et l'affiche dans un `DsMessage` `error`, sans action. Le réessai automatique sur une réponse 429 n'existe que dans `verifyConnection` (`src/notion/verification.ts`), pour la page d'options. `finishCapture()` (`src/capture/capture-store.ts`) termine la capture. `App.vue` lit `notionConfig` une seule fois, à l'ouverture. Voir `proposal.md` pour le besoin.

Actions du panneau concernées :

| Action | Composant | Message d'erreur | Contexte de reprise |
| --- | --- | --- | --- |
| Lecture des thèmes | `CaptureForm.vue` | `errorMessage` | `themes` |
| Création de l'item | `CaptureForm.vue` | `errorMessage` | `action` |
| Enregistrement des métadonnées | `CaptureForm.vue` | `itemErrorMessage` | `item` |
| Ajout d'un extrait | `ExtractCapture.vue` | `itemErrorMessage` | `item` |
| Modification ou suppression d'un extrait, suppression d'un titre de section | `ExtractCapture.vue` | `itemErrorMessage` ou `errorMessage` | `extract` |
| Enregistrement de la description | `DescriptionEditor.vue` | `itemErrorMessage` | `item` |

La recherche de doublon (US-03) reste silencieuse et n'est pas concernée.

## Goals / Non-Goals

**Goals:**
- Une règle unique, pure et testée, qui associe à chaque message et à chaque contexte l'action proposée.
- Un réessai automatique sur limitation, partagé par toutes les actions, page d'options comprise.

**Non-Goals:**
- Aucun nouveau message d'erreur, aucun changement de libellé.
- Aucun changement de comportement de la page d'options.
- Aucune action sur l'échec de la recherche de doublon, ni sur « Sélection impossible sur cette page ».

## Decisions

### 1. Dépendances
Aucune nouvelle dépendance ni permission.

### 2. Réessai sur limitation (`src/notion/retry.ts`)
- `withRateLimitRetry(run, onRateLimited)` : exécute `run()`. Sur une `NotionHttpError` 429, appelle `onRateLimited()`, attend la valeur de `Retry-After` en secondes (1 seconde si l'en-tête est absent ou illisible), puis relance, au plus 3 fois. Après le 3e réessai, l'erreur 429 est propagée.
- La logique actuelle de `verifyConnection` (constantes, calcul du délai, boucle) est déplacée dans ce module, que `verifyConnection` utilise désormais. Ses tests existants doivent passer sans modification.
- Toutes les actions du tableau du contexte appellent Notion à travers `withRateLimitRetry`. Pour une action en plusieurs appels (déplacement d'un extrait), chaque appel est enveloppé séparément.

### 3. Règle des actions (`src/notion/error-actions.ts`)
Fonction pure `errorAction(message, context)` → `'retry' | 'reload-themes' | 'options' | 'finish' | null` :

| Message | `themes` | `action` | `item` | `extract` |
| --- | --- | --- | --- | --- |
| Connexion impossible | `reload-themes` | `retry` | `retry` | `retry` |
| Notion ne répond pas | `reload-themes` | `retry` | `retry` | `retry` |
| La base Notion a changé | `reload-themes` | `retry` | `retry` | `retry` |
| Notion limite les appels (après 3 réessais) | `reload-themes` | `retry` | `retry` | `retry` |
| Jeton Notion invalide | `options` | `options` | `options` | `options` |
| Base inaccessible | `options` | `options` | `options` | `options` |
| Item introuvable dans Notion | `null` | `null` | `finish` | `null` |

### 4. Composant `ErrorNotice.vue` (`src/entrypoints/sidepanel/`)
- Props : `message`, `action` (résultat de `errorAction`), `busy`. Événements : `retry`, `finish`.
- Rendu : `DsMessage` `error` avec le message, puis, à 8 px dessous :
  - `retry` : `DsButton` `secondary` `sm` « Réessayer » ;
  - `reload-themes` : `DsButton` `secondary` `sm` « Recharger les thèmes » ;
  - `finish` : `DsButton` `secondary` `sm` « Terminer la capture » ;
  - `options` : `DsLink` « Ouvrir la page d'options », qui appelle `browser.runtime.openOptionsPage()` ;
  - `null` : rien.
- Les boutons sont inactifs quand `busy` est vrai.
- Pendant une attente de réessai automatique, le composant appelant affiche « Notion limite les appels » dans ce même `ErrorNotice`, sans action.
- Il remplace les `DsMessage` `error` des six actions du tableau, au même emplacement.

### 5. Relance d'une action
- Chaque composant garde, pour chaque erreur affichée, la fonction qui relance l'action avec ses données d'origine (`lastFailed: () => Promise<void>`). « Réessayer » et « Recharger les thèmes » l'appellent, en effaçant l'erreur au départ.
- La relance passe par le même chemin que l'action initiale : mêmes états d'envoi (« Ajout en cours… », etc.), même mise à jour de l'état et de la capture conservée.
- « Terminer la capture » appelle `finishCapture()` directement, sans passer par la confirmation de l'US-09.

### 6. Configuration suivie (`App.vue`)
- `App.vue` écoute `browser.storage.onChanged` sur `notionConfig` et met à jour la configuration transmise aux composants.
- Si le nouvel `databaseId` diffère de celui de la capture conservée, `App.vue` appelle `finishCapture()`, ce qui ramène le formulaire de préparation.
- Si la configuration est supprimée, le panneau affiche l'état « non configuré » de la spec `side-panel`.

### 7. Tests
- **Vitest** :
  - `withRateLimitRetry` : succès direct, succès après 1 et 2 limitations, échec après 3 réessais, `Retry-After` absent, illisible et à 2 secondes (minuteurs simulés), appel de `onRateLimited` avant chaque attente, propagation immédiate d'une autre erreur.
  - `errorAction` : chaque case de la table de la décision 3.
  - Les tests existants de `verifyConnection` passent sans modification.
- Aucun test Karate : aucun appel Notion nouveau.
- Les actions de reprise sont vérifiées par la check-list manuelle, en provoquant les erreurs (réseau coupé, jeton révoqué, item à la corbeille, propriété Theme renommée).

## Risks / Trade-offs

- [Une relance après un échec partiel d'un déplacement d'extrait] → La relance reprend l'action entière depuis l'état courant, qui contient déjà la nouvelle citation (US-07, décision 4). Seule la suppression restante est rejouée.
- [Limitation de Notion pendant qu'une autre action attend déjà] → Chaque action réessaie de son côté. Accepté pour un usage personnel.
