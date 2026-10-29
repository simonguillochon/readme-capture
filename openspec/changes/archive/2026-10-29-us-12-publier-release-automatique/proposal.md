# US-12 — Publier automatiquement une release signée

> **ID :** US-12
> **Epic :** E1 — Socle et connexion
> **Priorité :** Should
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

> ⚠️ **Points en hypothèse à confirmer avant lancement dev**
> 1. Un seul workflow GitHub Actions, `.github/workflows/ci.yml`, porte les vérifications et la release.
> 2. Seules les actions officielles de GitHub sont utilisées (`actions/checkout`, `actions/setup-node`, `actions/setup-java`), épinglées par l'empreinte complète de leur commit. La release est créée avec la CLI `gh`, déjà présente sur les machines de GitHub.
> 3. Sur une pull request ouverte depuis un fork, GitHub ne transmet pas les secrets : les tests de contrat échouent avec « Secrets des tests de contrat indisponibles », sans appeler Notion, et la pull request est affichée en échec.
> 4. Les clés d'API addons.mozilla.org sont rangées dans un environnement GitHub « release », utilisable uniquement depuis la branche `main`. Le jeton et l'ID de la base de test restent des secrets du dépôt.
> 5. La release ne contient que le fichier `.xpi` signé. GitHub y ajoute de lui-même les archives du code source.
> 6. Si la version 1.0.0 a déjà été signée à la main lors de l'US-11, la première release automatique est la 1.1.0.

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** qu'une release signée soit publiée sur GitHub dès que j'augmente la version, après le passage de tous les tests
**Afin de** ne plus construire, faire signer ni vérifier l'extension à la main, et de toujours installer une version testée.

L'objectif de cette user story est d'ajouter un workflow GitHub Actions qui lance les vérifications à chaque push sur `main` et sur chaque pull request, puis, sur `main`, fait signer l'extension par Mozilla en non listé et publie une release GitHub quand la version de `package.json` n'a pas encore de tag, sans jamais exposer de secret dans ce dépôt public.

## What Changes

- Nouveau workflow `.github/workflows/ci.yml` : typecheck, Vitest, `openspec validate` et tests de contrat Karate, puis signature et release.
- Une release `vX.Y.Z` est créée seulement si tous les tests passent et que le tag `vX.Y.Z` n'existe pas. Ses notes sont générées par GitHub.
- La signature passe de manuelle (US-11) à automatique, avec `web-ext sign` et les clés d'API addons.mozilla.org rangées dans les secrets GitHub.
- Nouveau fichier `.nvmrc`, avec la version de Node.js du poste de l'utilisatrice (22.23.4), lu par le workflow.
- Le `README.md` explique comment publier une version, configurer les secrets, et installer le `.xpi` depuis la release.

## Capabilities

### New Capabilities
- `continuous-release`: vérifications automatiques, signature et publication d'une release GitHub, protection des secrets.

### Modified Capabilities

Aucune. Les exigences de la spec `extension-distribution` (US-11) restent vraies. Seule la procédure de signature du `README.md` change.

## Impact

- Prérequis : l'US-11 est archivée avant l'implémentation de cette US.
- Nouveaux fichiers : `.github/workflows/ci.yml`, `.nvmrc`.
- `package.json` : dépendance de développement `web-ext`, en version exacte.
- `README.md` : sections « Installation signée » et « Intégration continue et releases ».
- Configuration à faire par l'utilisatrice dans GitHub : secrets du dépôt et environnement « release ».
- Aucun changement du code de l'extension.

## Maquettes & design

- Aucune maquette, aucun écran modifié.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants (non-régression)
- [ ] Tests de contrat Karate passants, en local et dans le workflow
- [ ] `openspec validate us-12-publier-release-automatique --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Première release signée publiée sur GitHub et installée dans Zen
- [ ] Validation PO
