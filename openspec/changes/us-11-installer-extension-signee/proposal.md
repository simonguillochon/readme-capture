# US-11 — Installer l'extension signée dans Zen

> **ID :** US-11
> **Epic :** E1 — Socle et connexion
> **Priorité :** Must
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

> ⚠️ **Points en hypothèse à confirmer avant lancement dev**
> 1. La première version signée porte le numéro 1.0.0.
> 2. La signature se fait à la main, par le site addons.mozilla.org, en distribution « On your own » (non listée). Aucun outil de signature ni clé d'API n'est ajouté au dépôt.
> 3. Zen, comme Firefox, refuse d'installer de façon permanente un module non signé.
> 4. Si Mozilla refuse la déclaration « aucune donnée collectée », un nouveau change déclare `websiteContent` et `browsingActivity`.

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** installer une version signée de l'extension dans Zen
**Afin de** l'utiliser au quotidien sans la recharger en temporaire à chaque démarrage du navigateur.

L'objectif de cette user story est de rendre l'extension signable en distribution non listée : déclarer dans le manifeste qu'elle ne collecte aucune donnée, produire l'archive de l'extension et celle de ses sources sans aucun secret, et documenter la signature, l'installation et la mise à jour.

## What Changes

- Le manifeste déclare `data_collection_permissions` avec `required: ["none"]`, comme l'exige Mozilla pour toute nouvelle extension depuis le 3 novembre 2025.
- La version de l'extension passe à 1.0.0.
- Tailwind ne cherche plus les classes que dans `src/`, pour que l'extension reconstruite depuis l'archive des sources soit identique.
- `npm run zip` est vérifié : archive de l'extension, archive des sources sans secret, et reconstruction possible depuis l'archive des sources.
- Le `README.md` documente la signature non listée, l'installation du `.xpi` signé et la mise à jour.

## Capabilities

### New Capabilities
- `extension-distribution`: déclaration de collecte de données, paquets à faire signer, installation et mise à jour de la version signée.

### Modified Capabilities

Aucune.

## Impact

- `wxt.config.ts` : ajout de `data_collection_permissions`.
- `package.json` : version 1.0.0.
- `src/styles/theme.css` : détection des classes de Tailwind limitée à `src/`.
- `README.md` : nouvelle section « Installation signée ».
- Aucune dépendance, permission ni appel Notion nouveau. Aucun changement de comportement du panneau ni de la page d'options.

## Maquettes & design

- Aucune maquette, aucun écran modifié.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants (non-régression)
- [ ] `openspec validate us-11-installer-extension-signee --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Extension signée installée dans Zen
- [ ] Validation PO
