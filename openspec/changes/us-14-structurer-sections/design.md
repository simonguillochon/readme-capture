# Design

## Context

Après l'US-13, une section n'existe qu'avec au moins une citation : « + Nouvelle section… » écrit le titre et la citation ensemble (`placeExtract`, `src/capture/extract-placement.ts`). Une section qui perd son dernier extrait est supprimée automatiquement (`withoutEmptySection`, `emptySectionOperations`, et `deleteSection` dans `ExtractCapture.vue` pour relancer cette suppression après un échec). La liste affiche tous les titres de section dans le même style (`text-caption text-text-secondary`), et les menus Section n'affichent que le titre. Voir `proposal.md` pour le besoin.

Points d'appui existants :
- `Section { id, title, level }` dans l'état de la capture, conservé par `capture-session` ; les sections sont dans l'ordre de création, qui est l'ordre de la page puisqu'une nouvelle section est toujours écrite en fin de page.
- `ExtractChange { operations, apply(completed) }` et les opérations `append`, `delete-quote`, `delete-section`, envoyées une par une avec `withRateLimitRetry`.
- `deleteBlock` (`src/notion/extracts.ts`) ; une réponse 400 ou 404 à la suppression d'une citation est déjà traitée comme un succès.
- `isSending` (`src/capture/capture-store.ts`) bloque « Terminer » dès que `adding` ou `busy` est actif.
- `ErrorNotice.vue` et `errorAction` (US-10), contextes `item` et `extract`.

## Goals / Non-Goals

**Goals:**
- Créer une section sans citation.
- Supprimer une section et tout son contenu depuis le panneau.
- Lire la hiérarchie H1 > H2 > H3 dans la liste et dans les menus.

**Non-Goals:**
- Renommer une section ou changer son niveau (Hors scope du PRD).
- Insérer une section ailleurs qu'en fin de page (Hors scope du PRD).
- Lire la structure des titres de la page Notion : l'extension ne connaît que les sections créées depuis le panneau.

## Decisions

### 1. Dépendances
Aucune nouvelle dépendance. Version `1.3.0` dans `package.json`.

### 2. Fonctions pures (`src/capture/extract-placement.ts`)
- `placeSection(state, title, level): Placement` : un seul bloc `headingBlock(title.trim(), level)`, position `end` ; `apply([headingId])` ajoute la section à la fin de `state.sections`.
- `sectionLabel(section)` : `` `H${level} · ${title}` ``.
- `sectionDepths(sections): Map<string, number>` : parcours dans l'ordre avec une pile de niveaux ; on retire de la pile les niveaux supérieurs ou égaux au niveau courant, la profondeur est la taille de la pile, puis on empile le niveau courant. Exemples : H1, H2, H3 → 0, 1, 2 ; H2 seul → 0 ; H1, H2, H1, H3 → 0, 1, 0, 1.
- `sectionContents(state, sectionId)` : les sections qui suivent la section avec un niveau plus bas, jusqu'à la première de niveau égal ou supérieur (exclue), et les extraits de la section et de ces sections, dans l'ordre de la page.
- `deleteSectionChange(state, sectionId): ExtractChange` : opérations `delete-quote` pour chaque extrait contenu, dans l'ordre de la page, puis `delete-section` pour chaque section contenue, de la dernière à la première, puis `delete-section` pour la section elle-même. `apply(completed)` retire de l'état les blocs des `completed` premières opérations. Le titre étant supprimé en dernier, un échec en cours de route laisse la section dans la liste avec ce qui n'a pas pu être supprimé.
- `sectionDeletionMessage(quotes, sections)` : message de la spec `extract-editing` (« Compter le contenu dans la confirmation »). Cas testés : 2 citations et 1 section ; 1 citation ; 2 sections ; 1 section ; 1 citation et 1 section (« qui seront supprimées »).
- Retrait de `withoutEmptySection` et `emptySectionOperations` : `editExtract` et `deleteExtract` ne produisent plus d'opération `delete-section`.

### 3. Envoi à Notion
- La section seule est écrite avec l'appel d'ajout existant (`append`, position `end`), avec un seul bloc titre.
- Une réponse 400 ou 404 à une opération `delete-section` est traitée comme un succès, comme pour `delete-quote`. La condition, aujourd'hui écrite dans `run()` (`ExtractCapture.vue`), est extraite dans une fonction pure `isAlreadyDeleted(caught)` de `src/notion/extracts.ts`, appelée par `run()`, pour être testée avec Vitest.
- Toutes les opérations passent par `withRateLimitRetry`, comme les autres opérations sur les extraits.

### 4. Zone d'ajout (`src/entrypoints/sidepanel/ExtractCapture.vue`)
- Dans le bloc « Niveau », juste après le `DsChoiceGroup`, un `DsButton` `secondary` `sm` « Ajouter la section seule », libellé « Ajout en cours… » pendant l'envoi.
- Actif si le titre, sans espaces en début et fin, n'est pas vide, ne correspond à aucune section existante (comparaison de `placeExtract`), et si rien n'est en cours d'envoi. Aucun passage sélectionné n'est requis.
- Si le titre correspond à une section existante : `DsMessage` `warning` « Cette section existe déjà » sous le champ « Titre de la section ».
- Pendant l'envoi, l'indicateur `adding` existant est utilisé : « Terminer » est donc bloqué par `isSending` sans autre changement.
- Après succès : `chosen` et la dernière section utilisée deviennent la nouvelle section ; le champ du titre est vidé pour la prochaine nouvelle section.
- Après échec : `ErrorNotice` sous les boutons d'ajout, contexte `item` de `errorAction` ; « Réessayer » relance l'ajout avec le titre et le niveau d'origine.
- Libellés des options du menu Section de la zone d'ajout et du menu de modification : `sectionLabel(section)`.

### 5. Liste (`ExtractCapture.vue`)
- Chaque section est affichée, même sans extrait.
- Titre de section, selon son niveau :
  - H1 : `text-body font-semibold text-text-primary` ;
  - H2 : `text-body-s font-medium text-text-primary` ;
  - H3 : `text-caption text-text-secondary`.
- Retrait du groupe (titre et extraits) selon `sectionDepths` : profondeur 1 → `pl-3` (12 px, `--spacing-3`), profondeur 2 → `pl-6` (24 px, `--spacing-6`).
- À droite du titre, `DsIconButton` `ghost` icône `trash`, libellé « Supprimer la section », inactif comme les actions des extraits (`actionsDisabled`, qui couvre la modification en cours et les envois).
- Clic : si `sectionContents` est vide, suppression immédiate ; sinon, sous le titre, `DsMessage` `warning` avec `sectionDeletionMessage`, puis `DsButton` `sm` « Supprimer la section » (primaire) et `DsButton` `secondary` `sm` « Annuler », comme la confirmation de « Terminer » (US-09). Une seule confirmation est ouverte à la fois.
- Pendant la suppression, `busy` vaut `{ blockId: sectionId, kind: 'deleting-section' }` (nouvelle valeur du type de `busy` dans `capture-store.ts`), et le bouton de confirmation affiche « Suppression en cours… ».
- Après chaque opération réussie, l'état est mis à jour avec `apply` ; les surlignages des extraits supprimés sont retirés avec la fonction déjà utilisée par la suppression d'un extrait ; si `chosen` ou la dernière section utilisée ne fait plus partie des sections, ils passent à « Sans section ».
- Après échec : `ErrorNotice` sous le titre de la section, contexte `extract` ; « Réessayer » relance `deleteSectionChange` sur l'état courant. Le `sectionError` global et la fonction `deleteSection` actuels, propres à la suppression automatique, sont retirés.

### 6. Tests
- **Vitest** (`tests/unit/extract-placement.test.ts`, ou le fichier qui teste déjà ces fonctions) : `placeSection`, `sectionLabel`, `sectionDepths`, `sectionContents`, `deleteSectionChange` (ordre des opérations, `apply` partiel, section vide), `sectionDeletionMessage`. `tests/unit/extracts.test.ts` : `isAlreadyDeleted` (400 et 404 → vrai ; autre statut et erreur réseau → faux). Les tests existants qui attendent une opération `delete-section` après le dernier extrait sont mis à jour pour attendre son absence.
- **Karate** (`tests/contract/extract-capture.feature`) : nouveau scénario « Un titre seul ajouté en fin de page renvoie un identifiant et devient le dernier enfant », sur la base « Readme center (tests) ». La suppression d'un titre est déjà couverte par la suppression d'un bloc (`extract-editing.feature`).
- Check-list manuelle pour l'affichage et la confirmation.

## Risks / Trade-offs

- [Titre supprimé directement dans Notion, puis extrait ajouté à cette section depuis le panneau] → L'ajout échoue sur « Item introuvable dans Notion », comme aujourd'hui. L'utilisatrice supprime la section depuis le panneau (400 ou 404 traité comme un succès).
- [Suppression d'une grosse section] → Un appel par bloc, avec réessai sur limitation. Accepté pour un usage personnel.
- [Sections créées avant cette US] → Elles ont déjà un niveau dans l'état conservé : aucune migration.
