# US-05 — Modifier les métadonnées d'un item créé

> **ID :** US-05
> **Epic :** E2 — Création de l'item
> **Priorité :** Should
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** corriger depuis le panneau le titre, l'URL, l'auteur, son profil LinkedIn, la langue ou les thèmes d'un item déjà créé
**Afin de** rectifier une métadonnée pendant ma capture sans ouvrir Notion.

L'objectif de cette user story est de rendre les métadonnées d'un item créé modifiables depuis le panneau, et d'enregistrer ces modifications dans Readme center au clic sur « Enregistrer les modifications », bouton qui n'apparaît que lorsqu'un champ diffère des valeurs enregistrées.

## What Changes

- Après la création, les champs Titre, URL, Auteur, LinkedIn de l'auteur, Langue et Thèmes restent modifiables, sans aucun pré-remplissage.
- Le bouton « Enregistrer les modifications » apparaît dès qu'un champ diffère des dernières valeurs enregistrées, et disparaît si toutes les valeurs y reviennent.
- Le bouton n'est actif que si le formulaire est valide, et affiche « Enregistrement en cours… » pendant l'envoi.
- Seules les propriétés modifiées sont envoyées à Notion. La Date de capture ne change jamais.
- Après l'enregistrement, le message « Modifications enregistrées dans Readme center » s'affiche, jusqu'à la modification suivante.
- En cas d'échec, le message de la cause la plus probable s'affiche, dont « Item introuvable dans Notion » si l'item a été supprimé ou mis à la corbeille.
- Aucune détection de doublon n'a lieu après la création, même si l'URL modifiée existe déjà dans la base.

## Capabilities

### New Capabilities
- `item-editing`: modification et enregistrement dans Readme center des métadonnées d'un item créé depuis le panneau.

### Modified Capabilities
- `item-creation`: le message « Item créé dans Readme center » s'efface à la première modification d'un champ.

## Impact

- Client Notion : `notionPatch` (livré par l'US-03) est utilisé par l'extension.
- Nouveaux modules : construction de la requête de modification, enregistrement des modifications, comparaison avec les valeurs enregistrées.
- `src/notion/errors.ts` : nouveau message « Item introuvable dans Notion ».
- PRD : la phrase « Modifier l'URL relance la vérification de doublon » est remplacée par l'absence de détection de doublon après la création (PRD 1.6.0).
- Aucune dépendance ni permission nouvelle.

## Maquettes & design

- Aucune maquette. Les composants respectent la spec `ui-design-system` et le design system [ds-editorial-tech](https://github.com/simonguillochon/ds-editorial-tech).
- Écran concerné : panneau latéral, après la création de l'item.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants
- [ ] Tests de contrat Karate passants
- [ ] `openspec validate us-05-modifier-metadonnees-item --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Validation PO
