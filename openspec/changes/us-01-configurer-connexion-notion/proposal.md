# US-01 — Configurer la connexion à Notion

> **ID :** US-01
> **Epic :** E1 — Socle et connexion
> **Priorité :** Must
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** relier l'extension à ma base Notion Readme center
**Afin de** pouvoir y enregistrer mes captures de veille sans que mon jeton ni l'identifiant de ma base ne figurent dans le code public.

L'objectif de cette user story est de livrer le socle technique de l'extension, l'ouverture et la fermeture du panneau par le bouton de l'extension, et une page d'options qui enregistre localement et vérifie la connexion à Notion.

## What Changes

- Initialisation du projet : WXT, Vue 3, TypeScript, Tailwind avec le thème du DS, Vitest, Karate, OpenSpec.
- Un clic sur le bouton de l'extension, dans la barre d'URL, ouvre ou ferme le panneau latéral.
- Le panneau affiche un état « non configuré » tant que la connexion n'est pas en place.
- Une page d'options permet de saisir le jeton d'intégration Notion, masqué par défaut et affichable, et l'URL de la base, dont l'extension extrait l'identifiant.
- La connexion est vérifiée auprès de Notion avant tout enregistrement local ; en cas d'échec, la configuration précédente reste inchangée.
- Les erreurs de connexion affichent la cause la plus probable, selon la table d'erreurs du PRD.

## Capabilities

### New Capabilities
- `side-panel`: ouverture, fermeture et état initial du panneau latéral de l'extension.
- `notion-connection`: saisie, stockage local et vérification de la connexion à la base Notion.

### Modified Capabilities

Aucune.

## Impact

- Création du dépôt et de toute son arborescence (voir `design.md`).
- Permissions de l'extension : stockage local et accès à `https://api.notion.com/*`.
- Prérequis sur le poste de développement : Node.js, et Java 21 ou plus pour exécuter les tests Karate uniquement (rien n'est embarqué dans l'extension).

## Maquettes & design

- Aucune maquette. Les composants respectent le design system [ds-editorial-tech](https://github.com/simonguillochon/ds-editorial-tech).
- Écrans concernés : panneau latéral (état « non configuré ») et page d'options.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants
- [ ] Tests de contrat Karate passants
- [ ] `openspec validate us-01-configurer-connexion-notion --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Validation PO
