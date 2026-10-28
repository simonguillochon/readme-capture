# US-06 — Ajouter un extrait sous une section

> **ID :** US-06
> **Epic :** E3 — Capture des extraits
> **Priorité :** Must
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

> ⚠️ **Points en hypothèse à confirmer avant lancement dev**
> 1. Tant qu'aucune section n'a été utilisée, le menu Section pré-sélectionne « Sans section ».
> 2. Deux noms de section sont identiques s'ils ne diffèrent que par la casse ou par des espaces en début et fin.
> 3. Le menu Section s'appuie sur un atome Select du design system ds-editorial-tech, en cours d'ajout. Le développement ne démarre qu'une fois cet atome publié dans le DS (tâche 1.1).

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** sélectionner un passage dans la page lue et l'ajouter en citation dans l'item Readme center, rangé sous une section de mon choix
**Afin de** ne plus recopier à la main les passages qui m'intéressent, tout en gardant mes notes structurées.

L'objectif de cette user story est d'afficher dans le panneau un aperçu de la sélection en cours, de permettre de choisir ou de créer une section, et d'écrire l'extrait en citation dans le corps de la page Notion de l'item, sous le titre de sa section.

## What Changes

- Une fois l'item créé, le panneau affiche en direct un aperçu du passage sélectionné dans l'onglet actif.
- Un menu Section propose les sections déjà créées pour l'item, « + Nouvelle section… » et « Sans section », avec la dernière section utilisée pré-sélectionnée.
- « + Nouvelle section… » ouvre un champ pré-rempli avec le titre de la page le plus proche de la sélection, et un choix de niveau H1, H2 ou H3, H1 par défaut.
- « Ajouter l'extrait » écrit la citation dans la page Notion de l'item : à la fin de sa section, ou en haut de la page pour un extrait sans section.
- Les extraits ajoutés sont listés dans le panneau, regroupés par section, en lecture seule.
- L'ajout fonctionne depuis n'importe quel onglet, sans avertissement.

## Capabilities

### New Capabilities
- `extract-capture`: aperçu de la sélection, choix ou création d'une section, et écriture des extraits en citations dans la page Notion de l'item.

### Modified Capabilities
- `item-editing`: le formulaire des métadonnées se replie après la création et après chaque enregistrement.

## Impact

- Permissions : aucune nouvelle. L'écoute de la sélection passe par `scripting` et l'accès à tous les sites, déjà accordés par l'US-02.
- Client Notion : ajout de blocs dans le corps d'une page (`PATCH /v1/blocks/{id}/children`).
- Nouveaux modules : écoute de la sélection, calcul de l'emplacement d'un extrait, construction des blocs, ajout d'un extrait, composant d'extraits du panneau.
- Nouveaux composants : `DsSelect`, d'après l'atome Select du DS, et un composant repliable, d'après l'atome repliable du DS.
- PRD : l'avertissement quand l'onglet actif n'est pas celui de l'item est retiré et passe hors scope (PRD 1.7.0).

## Maquettes & design

- Aucune maquette. Les composants respectent la spec `ui-design-system` et le design system [ds-editorial-tech](https://github.com/simonguillochon/ds-editorial-tech), dont l'atome Select à venir.
- Écran concerné : panneau latéral, après la création de l'item.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants
- [ ] Tests de contrat Karate passants
- [ ] `openspec validate us-06-ajouter-extrait-section --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Validation PO
