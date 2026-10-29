# US-07 — Modifier, déplacer ou supprimer un extrait

> **ID :** US-07
> **Epic :** E3 — Capture des extraits
> **Priorité :** Should
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

> ⚠️ **Points en hypothèse à confirmer avant lancement dev**
> 1. Supprimer un extrait retire aussi son surlignage dans la page lue, si cette page est encore ouverte. Modifier ou déplacer un extrait garde son surlignage.
> 2. Modifier ou déplacer un extrait ne change pas la section pré-sélectionnée dans la zone d'ajout. Si cette section disparaît parce qu'elle s'est vidée, « Sans section » est pré-sélectionné.

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** corriger le texte d'un extrait, le ranger dans une autre section ou le supprimer depuis la liste du panneau
**Afin de** garder des notes justes et bien rangées dans l'item Readme center, sans ouvrir Notion.

L'objectif de cette user story est d'ajouter à chaque extrait de la liste les actions « Modifier » et « Supprimer », de permettre en modification de changer le texte et la section, et de répercuter chaque changement dans la page Notion de l'item, y compris la suppression du titre d'une section qui n'a plus d'extrait.

## What Changes

- Chaque extrait de la liste reçoit deux Icon Buttons : « Modifier » et « Supprimer ».
- « Modifier » ouvre un Textarea pré-rempli et un menu Section, avec « Enregistrer » et « Annuler ». Un seul extrait peut être en cours de modification à la fois.
- Un texte modifié est mis à jour dans sa citation. Un changement de section déplace la citation à la fin de sa nouvelle section, ou en haut de la page pour « Sans section ».
- « Supprimer » supprime l'extrait immédiatement, sans confirmation.
- Une section qui n'a plus d'extrait, après une suppression ou un déplacement, disparaît : son titre est supprimé dans Notion et elle n'est plus proposée dans le menu Section.
- Un extrait déjà supprimé dans Notion est retiré de la liste à sa suppression depuis le panneau.

## Capabilities

### New Capabilities
- `extract-editing`: modification, déplacement et suppression depuis le panneau des extraits ajoutés à l'item, et suppression des sections vidées.

### Modified Capabilities

Aucune. Les exigences de `extract-capture` restent valables : une section supprimée n'est plus une section créée pour l'item.

## Impact

- Client Notion : mise à jour d'un bloc (`PATCH /v1/blocks/{id}`) et suppression d'un bloc (`DELETE /v1/blocks/{id}`), à vérifier par les tests de contrat.
- `src/capture/extract-placement.ts` : nouvelles fonctions pures pour le déplacement et la suppression.
- `src/capture/selection-watcher.ts` : surlignages identifiés par extrait, pour pouvoir en retirer un.
- `ExtractCapture.vue` : actions de la liste, mode modification.
- Icônes `pencil-simple` et `trash` (Phosphor Light) à exporter de Figma.
- PRD : le déplacement d'un extrait entre dans le périmètre, et une section disparaît avec son dernier extrait (PRD 1.10.0).
- Aucune dépendance ni permission nouvelle.

## Maquettes & design

- Aucune maquette. Les composants respectent la spec `ui-design-system` et le design system [ds-editorial-tech](https://github.com/simonguillochon/ds-editorial-tech) : Icon Button, Textarea, Select, Button, Message.
- Écran concerné : panneau latéral, liste des extraits.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants
- [ ] Tests de contrat Karate passants
- [ ] `openspec validate us-07-modifier-supprimer-extrait --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Validation PO
