# Design

## Context

Après l'US-05, `CaptureForm.vue` connaît l'item créé (`createdItemId`, `createdItemUrl`) et passe par les statuts `created` et `saving`. Le client Notion fournit `notionGet`, `notionPost` et `notionPatch`. `itemErrorMessage` renvoie « Item introuvable dans Notion » pour toute réponse 400 ou 404, et `errorMessage` dans les autres cas. La lecture de page passe par `browser.scripting.executeScript`, sans script de contenu déclaré. Voir `proposal.md` pour le besoin.

## Goals / Non-Goals

**Goals:**
- Un aperçu de la sélection en direct, sans script de contenu permanent.
- Un calcul de l'emplacement de chaque extrait dans la page Notion par une fonction pure testée.
- Un ajout en un seul appel à l'API Notion par extrait.

**Non-Goals:**
- Aucune modification ni suppression d'extrait (US-07).
- Aucune conservation des sections et des extraits à la fermeture du panneau (US-09).
- Aucune lecture du corps de la page Notion : le panneau ne connaît que les blocs qu'il a lui-même écrits (hors scope « synchronisation » du PRD).
- Aucun avertissement quand l'onglet actif n'est pas celui de l'item (hors scope du PRD 1.7.0).
- Aucun renommage, suppression ou changement de niveau d'une section (hors scope du PRD).

## Decisions

### 1. Dépendances et prérequis
- Aucune nouvelle dépendance ni permission.
- L'atome Select doit être publié dans le DS ds-editorial-tech (Figma et `docs/components/atoms.md`) avant la tâche 1.1. Sinon, Claude Code s'arrête.
- L'atome repliable doit être publié dans le DS ds-editorial-tech (Figma et `docs/components/atoms.md`) avant la tâche 6.4. Sinon, Claude Code s'arrête.

### 2. Écoute de la sélection (`src/capture/selection-watcher.ts`)
- `installSelectionWatcher` est une fonction autonome, sans import, exécutée dans l'onglet actif par `browser.scripting.executeScript`.
- Elle ouvre un port `browser.runtime.connect({ name: 'readme-capture-selection' })` et écoute `selectionchange` sur le document, avec un délai de 200 ms entre deux envois.
- À chaque envoi, elle poste `{ text, nearestHeading }` :
  - `text` : `window.getSelection().toString()`, débarrassé des espaces en début et fin, ou `null` si le résultat est vide ;
  - `nearestHeading` : le texte, débarrassé des espaces et aux espaces multiples réduits, du dernier élément `h1` à `h6` du document situé avant le début de la sélection (`compareDocumentPosition`), ou `null`.
- Elle poste aussi un premier message dès son installation, pour la sélection déjà présente.
- Quand le port se déconnecte, elle retire son écouteur. Une installation dans un onglet qui en a déjà une déconnecte d'abord l'ancienne, grâce à une propriété dédiée posée sur `window`.
- Le panneau installe l'écoute dans l'onglet actif quand l'item est créé, puis à chaque `tabs.onActivated` (même fenêtre) et `tabs.onUpdated` (onglet actif, `status` égal à `complete`). Il met en pause l'écoute de l'onglet précédent (décision 9). À la fermeture du panneau, la page du panneau est déchargée et le port se déconnecte de lui-même.
- Si `executeScript` échoue, l'état de l'aperçu passe à « page illisible ».

### 3. État des extraits (`src/entrypoints/sidepanel/ExtractCapture.vue`)
- Nouveau composant, affiché par `CaptureForm.vue` quand `status` vaut `created` ou `saving`, avec les props `config`, `pageId`.
- État local :
  - `selection` : `{ text, nearestHeading } | null`, et `selectionState` : `'waiting' | 'selected' | 'unreadable' | 'added'` ;
  - `sections` : `{ id, title, level }[]`, dans l'ordre de création, `id` étant l'identifiant du bloc titre dans Notion ;
  - `extracts` : `{ blockId, sectionId | null, text }[]`, dans l'ordre de la page ;
  - `chosen` : identifiant de section, `'new'` ou `'none'` ; `lastUsed` : dernière valeur utilisée, `'none'` au départ ;
  - `newSection` : `{ title, level }`, `level` valant `1` par défaut ;
  - `adding`, `error`.
- Quand l'utilisatrice choisit « + Nouvelle section… », `newSection.title` reçoit `selection.nearestHeading` (ou une chaîne vide). Il n'est plus mis à jour automatiquement ensuite.
- Après un ajout réussi, `selectionState` passe à `added` et le reste jusqu'au prochain message de l'écoute dont le `text` diffère du texte ajouté.

### 4. Emplacement d'un extrait (`src/capture/extract-placement.ts`)
Fonction pure `placeExtract(state, target)`, avec `target` valant `{ kind: 'none' }`, `{ kind: 'section', id }` ou `{ kind: 'new', title, level }`. Elle renvoie les blocs à écrire et leur position :

| Cible | Blocs écrits | Position |
| --- | --- | --- |
| Sans section, sans extrait sans section existant | une citation | début de la page |
| Sans section, avec extraits sans section | une citation | après le dernier extrait sans section |
| Section existante sans extrait | une citation | après le titre de la section |
| Section existante avec extraits | une citation | après le dernier extrait de la section |
| Nouvelle section | un titre, puis une citation | fin de la page |

- Une cible `new` dont le titre correspond à une section existante (comparaison sans casse, après suppression des espaces en début et fin) est traitée comme cette section existante.
- La fonction renvoie aussi le nouvel état attendu (sections, extraits), complété avec les identifiants de blocs renvoyés par Notion après l'appel.

### 5. Blocs Notion (`src/notion/extract-blocks.ts`)
- Titre : `{ "type": "heading_1" | "heading_2" | "heading_3", "heading_N": { "rich_text": [{ "type": "text", "text": { "content": "<titre>" } }] } }`.
- Citation : `{ "type": "quote", "quote": { "rich_text": [...] } }`. Le texte est découpé en morceaux de 2000 caractères au plus, un objet `text` par morceau. Les sauts de ligne sont conservés tels quels dans le contenu.
- Aucune annotation (gras, italique, lien).

### 6. Ajout (`src/notion/extracts.ts`)
- `appendBlocks(config, pageId, blocks, position)` appelle `PATCH /v1/blocks/{pageId}/children` avec `{ children, position }`. Formes du paramètre `position` dans la version `2025-09-03` de l'API, vérifiées par les tests de contrat :
  - début de page : `{ "type": "start" }` ;
  - après un bloc donné : `{ "type": "after_block", "after_block": { "id": "<id du bloc>" } }` ;
  - fin de page : `{ "type": "end" }`.
- La réponse contient dans `results` les seuls blocs créés, dans l'ordre de `children`.
- La fonction renvoie les identifiants des blocs créés, dans l'ordre de `children`.
- En cas d'échec, l'erreur est propagée. Le panneau affiche `itemErrorMessage(error)`.

### 7. Interface
- Zone des extraits sous le message de confirmation et le lien « Ouvrir dans Notion », séparée du formulaire par un Divider `subtle`.
- **Aperçu** : texte Body S sur `text/primary` dans un bloc à fond `surface/secondary`, rayon `sm`, padding 12 px, limité à 5 lignes (`line-clamp-5`). Les états « Sélectionne un passage dans la page » et « Extrait ajouté » s'affichent dans le même bloc, en `text/tertiary`. « Sélection impossible sur cette page » s'affiche dans un `DsMessage` `warning`.
- **Menu Section** : `DsSelect` (atome Select du DS), libellé « Section » (`DsField`).
- **Nouvelle section** : `DsField` « Titre de la section » + `DsInput`, puis `DsChoiceGroup` « Niveau » avec les options H1, H2, H3.
- **Bouton** : `DsButton` `primary` `md`, « Ajouter l'extrait » ou « Ajout en cours… », actif si `selectionState` vaut `selected`, si `adding` est faux et, pour une nouvelle section, si son titre n'est pas vide.
- **Erreur** : `DsMessage` `error` au-dessus du bouton.
- **Liste** : titre de groupe en Caption sur `text/secondary` pour chaque section, extraits en Body S limités à 2 lignes (`line-clamp-2`), séparés de 8 px.
- Si un rendu demandé ici n'est pas couvert par le DS, Claude Code s'arrête et pose la question.

### 8. Tests
- **Vitest** :
  - `placeExtract` : chaque ligne de la table de la décision 4, la réutilisation d'une section de même nom (casse et espaces), et la mise à jour de l'état.
  - Construction des blocs : chaque niveau de titre, une citation de 4500 caractères découpée en 3 morceaux, des sauts de ligne conservés.
  - `appendBlocks` avec des réponses simulées : succès avec identifiants, 400, 404, erreur réseau.
- **Karate** (`tests/contract/extract-capture.feature`), sur un item créé dans « Readme center (tests) » :
  - ajout en fin de page d'un titre de niveau 2 et d'une citation : 200 et deux identifiants renvoyés ;
  - ajout d'une citation après un bloc donné, puis lecture des enfants de la page (`GET /v1/blocks/{id}/children`) : la citation est à la bonne place ;
  - ajout d'une citation en début de page : elle est le premier enfant ;
  - ajout sur un item à la corbeille : réponse 400 ou 404 ;
  - chaque item créé est mis à la corbeille à la fin du scénario.
- La fonction `installSelectionWatcher` est vérifiée par la check-list manuelle, faute de DOM dans les tests.
- Le surlignage est vérifié par la check-list manuelle, faute de DOM dans les tests.

### 9. Surlignage des extraits ajoutés
- `installSelectionWatcher` garde la plage (`Range`) de la dernière sélection postée.
- Après un ajout réussi, le panneau poste `{ type: 'highlight', text }` sur le port de l'onglet. Si `text` correspond à la plage gardée, la page ajoute une copie de cette plage au surlignage `readme-capture-extract` de `CSS.highlights` (CSS Custom Highlight API, disponible dans Gecko 140 et plus). Le DOM de la page n'est pas modifié.
- Rendu : `::highlight(readme-capture-extract) { background-color: #FDF1ED; color: #0F0E0D; }` (`primary-50` et `neutral-950`). Les valeurs sont fixes quel que soit le mode, car le thème de la page lue ne suit pas celui du panneau. La règle est injectée par `browser.scripting.insertCSS` à l'installation de l'écoute. C'est un usage hors DS, choisi par l'utilisatrice.
- Le panneau garde un port par onglet ayant un extrait surligné. Quand un onglet devient inactif, il y poste `{ type: 'pause' }` : la page retire son écouteur `selectionchange` et garde ses surlignages. Quand l'onglet redevient actif, le panneau poste `{ type: 'resume' }` au lieu de réinstaller l'écoute. Les ports des onglets sans surlignage sont déconnectés comme avant.
- À la déconnexion d'un port (fermeture du panneau, rechargement de la page), la page retire son écouteur et supprime `readme-capture-extract` de `CSS.highlights`. La règle CSS insérée reste, sans effet visible.

### 10. Repli du formulaire (`CaptureForm.vue`)
- Nouveau composant `DsDisclosure` reproduisant l'atome Disclosure du DS (v1.8), dans ses états et au clavier, selon sa spec.
- `CaptureForm.vue` reçoit `collapsed`, qui passe à `true` à la création réussie et à chaque enregistrement réussi, et à `false` au clic sur le contrôle de dépliage.
- Le libellé de l'en-tête est `savedValues.title`, et l'accessoire de l'atome est le lien « Ouvrir dans Notion ». Le message de confirmation (si `dirty` est faux) s'affiche sous le composant, hors de l'atome. Replié, le corps (le formulaire) est masqué et ses valeurs ne changent pas.
- Le contrôle de repli est inactif tant que `dirty` est vrai.
- Un échec d'enregistrement laisse `collapsed` à `false`.
- Bloqué, le déclencheur porte `aria-disabled` et `aria-describedby` vers le texte masqué « Enregistrez vos modifications ».
- L'accessoire reste l'atome Link « Ouvrir dans Notion » de l'US-05, au lieu du Button `variant=link size=sm` prévu par le DS : écart choisi par l'utilisatrice.
- Nouvelle icône `caret-up` (Phosphor Light), exportée de Figma comme `caret-down`.
- Le thème suit le DS v1.7 : `text/accent` passe à `primary-700` en mode clair.
- La zone des extraits reste affichée sous le formulaire, replié ou non.

## Risks / Trade-offs

- [La position d'insertion ne s'exprime pas comme prévu dans la version 2025-09-03] → Tests de contrat et point d'arrêt avant l'implémentation (tâche 2.2).
- [L'utilisatrice modifie le corps de la page dans Notion pendant la capture] → Les extraits restent placés par rapport aux blocs écrits par le panneau. Si un de ces blocs a été supprimé, Notion répond par une erreur, affichée « Item introuvable dans Notion ». Accepté (hors scope « synchronisation »).
- [Sélection de plus de 200 000 caractères, au-delà des 100 objets texte d'un bloc] → Non traité dans la v1.
- [Certains sites bloquent `executeScript`] → Traité comme une page illisible.
