# US-10 — Être informée de la cause d'une erreur Notion

> **ID :** US-10
> **Epic :** E5 — Fiabilité
> **Priorité :** Must
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

> ✅ **Points en hypothèse confirmés par l'utilisatrice le 29/10/2026**
> 1. Le panneau prend en compte une configuration corrigée dans la page d'options sans avoir à être rouvert. Si l'URL enregistrée désigne une autre base, la capture en cours est abandonnée comme à la réouverture (US-09), et le panneau revient au formulaire de préparation.
> 2. Après une correction dans les options, l'utilisatrice relance elle-même l'action depuis le panneau : aucun bouton « Réessayer » n'accompagne « Jeton Notion invalide » ni « Base inaccessible ».

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** savoir pourquoi un échec s'est produit et disposer de l'action qui permet d'y remédier
**Afin de** reprendre ma capture sans perdre ce que j'ai saisi ni chercher moi-même la cause.

L'objectif de cette user story est d'accompagner chaque message d'erreur Notion du panneau de l'action prévue par la table d'erreurs du PRD (« Réessayer », « Ouvrir la page d'options », « Recharger les thèmes », « Terminer la capture »), et d'étendre à toutes les actions du panneau le réessai automatique en cas de limitation par Notion.

## What Changes

- « Connexion impossible », « Notion ne répond pas » et « La base Notion a changé » sont suivis d'un bouton « Réessayer », qui relance l'action échouée avec les mêmes données.
- « Jeton Notion invalide » et « Base inaccessible » sont suivis d'un lien « Ouvrir la page d'options ».
- Un échec de lecture des thèmes propose « Recharger les thèmes » à la place de « Réessayer ».
- « Item introuvable dans Notion » propose « Terminer la capture », sans confirmation, sauf pour la modification ou la suppression d'un extrait.
- En cas de limitation, chaque action du panneau réessaie automatiquement jusqu'à 3 fois, en affichant « Notion limite les appels », puis propose « Réessayer ».
- Le panneau suit les changements de la configuration enregistrée.

## Capabilities

### New Capabilities
- `notion-error-recovery`: actions de reprise associées aux erreurs Notion du panneau, et réessai automatique en cas de limitation.

### Modified Capabilities

Aucune. Les messages définis par les specs `capture-form`, `item-creation`, `item-editing`, `extract-capture`, `extract-editing` et `item-description` sont inchangés. La page d'options garde le comportement de la spec `notion-connection`.

## Impact

- Nouveau module de réessai partagé, utilisé aussi par la vérification de connexion de la page d'options, sans changement de comportement.
- Nouveau composant `ErrorNotice.vue` pour le message et son action, utilisé dans les trois composants du panneau.
- `App.vue` écoute les changements de `notionConfig`.
- Aucun appel nouveau à l'API Notion, aucune dépendance ni permission nouvelle.

## Maquettes & design

- Aucune maquette. Composants selon la spec `ui-design-system` et le design system [ds-editorial-tech](https://github.com/simonguillochon/ds-editorial-tech) v1.10 : Message, Button, Link.
- Écrans concernés : panneau latéral, partout où une erreur Notion peut s'afficher.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants
- [ ] `openspec validate us-10-informer-cause-erreur-notion --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Validation PO
