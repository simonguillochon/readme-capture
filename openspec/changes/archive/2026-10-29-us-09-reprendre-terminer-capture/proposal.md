# US-09 — Reprendre et terminer une capture

> **ID :** US-09
> **Epic :** E4 — Synthèse et fin de capture
> **Priorité :** Must
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

> ✅ **Points en hypothèse confirmés par l'utilisatrice le 29/10/2026**
> 1. « Terminer » remet le panneau à zéro mais ne le ferme pas, pour enchaîner les captures d'une même session de veille. Le panneau se ferme toujours avec le bouton de l'extension.
> 2. « Terminer » est inactif pendant un envoi à Notion (création, enregistrement, ajout, modification ou suppression d'un extrait).

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** retrouver ma capture en cours quand je rouvre le panneau, et la clore d'un clic quand j'ai fini
**Afin de** ne jamais perdre mon travail si je ferme le panneau ou le navigateur, et de repartir proprement sur le contenu suivant.

L'objectif de cette user story est de conserver dans le stockage local de l'extension toute la capture en cours, dès la création de l'item, de la restaurer à la réouverture du panneau, et d'ajouter un bouton « Terminer » qui l'efface et remet le panneau à zéro, avec une confirmation s'il reste des modifications non enregistrées.

## What Changes

- Dès la création de l'item, la capture est conservée à chaque changement : item, métadonnées enregistrées et en cours, sections, extraits, section pré-sélectionnée, description enregistrée et en cours, état replié du formulaire.
- À la réouverture du panneau, ou après un redémarrage de Zen, la capture reprend telle qu'elle était. Les surlignages, l'aperçu de la sélection, les messages et un extrait en cours de modification ne sont pas repris.
- Un bouton « Terminer », en bas du panneau, efface la capture et ramène le formulaire de préparation, pré-rempli depuis l'onglet actif. Aucun appel n'est fait à Notion.
- S'il reste des modifications non enregistrées, « Terminer » demande une confirmation.
- Une capture qui concerne une autre base que celle configurée est abandonnée sans message.
- Avec le panneau ouvert dans deux fenêtres, chaque changement est reporté dans l'autre panneau.

## Capabilities

### New Capabilities
- `capture-session`: conservation, reprise et fin de la capture en cours.

### Modified Capabilities

Aucune. Avant la création de l'item, le formulaire n'est toujours pas conservé (spec `capture-form`).

## Impact

- Stockage local : nouvelle clé pour la capture en cours, à côté de `notionConfig`.
- Panneau : l'état de `CaptureForm.vue`, `ExtractCapture.vue` et `DescriptionEditor.vue` passe par un état de capture partagé et conservé.
- Aucun appel nouveau à l'API Notion, aucune dépendance ni permission nouvelle.

## Maquettes & design

- Aucune maquette. Composants selon la spec `ui-design-system` et le design system [ds-editorial-tech](https://github.com/simonguillochon/ds-editorial-tech) v3 : Button, Message, Divider.
- Écran concerné : panneau latéral, bas de la capture.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants
- [ ] `openspec validate us-09-reprendre-terminer-capture --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Validation PO
