# US-03 — Créer l'item dans Readme center

> **ID :** US-03
> **Epic :** E2 — Création de l'item
> **Priorité :** Must
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** créer l'item dans Readme center d'un clic sur « Ajouter », en étant prévenue si le contenu y figure déjà
**Afin de** ne plus créer l'item à la main dans Notion, sans risquer de doublon par inadvertance.

L'objectif de cette user story est de créer dans Readme center l'item préparé dans le panneau, avec toutes ses métadonnées, la date de capture et l'icône de sa langue, et d'avertir l'utilisatrice, avant la création et sans la bloquer, quand l'URL existe déjà dans la base.

## What Changes

- Avant la création, le panneau vérifie si l'URL existe déjà dans Readme center et affiche un avertissement avec un lien vers l'item existant.
- Le bouton « Ajouter » crée l'item dans Readme center : Title, URL, Source, Date, Theme, LinkedIn auteur si renseigné, et l'icône de la langue.
- Pendant la création, le bouton affiche « Ajout en cours… » et reste inactif.
- Après la création, le panneau affiche « Item créé dans Readme center » avec un lien « Ouvrir dans Notion ». Le bouton « Ajouter » disparaît et le formulaire ne suit plus l'onglet actif.
- En cas d'échec, le message de la cause la plus probable s'affiche et rien de ce qui a été saisi n'est perdu.

## Capabilities

### New Capabilities
- `item-creation`: création de l'item dans Readme center depuis le panneau et détection de doublon par URL.

### Modified Capabilities
- `capture-form`: le formulaire cesse de suivre l'onglet actif une fois l'item créé.

## Impact

- Client Notion : ajout des appels `POST` (création de page, requête sur la source de données) et `PATCH` (utilisé par les tests de contrat pour mettre les items de test à la corbeille).
- Nouveaux modules : construction de la requête de création, création de l'item, recherche de doublon.
- Composant `DsMessage` : nouvelle variante `warning`, à reporter dans le DS.
- Aucune nouvelle dépendance ni permission.

## Maquettes & design

- Aucune maquette. Les composants respectent le design system [ds-editorial-tech](https://github.com/simonguillochon/ds-editorial-tech).
- Écran concerné : panneau latéral, formulaire de préparation de l'item et son état après création.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants
- [ ] Tests de contrat Karate passants
- [ ] `openspec validate us-03-creer-item-readme-center --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Validation PO
