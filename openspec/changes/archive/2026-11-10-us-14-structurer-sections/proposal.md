# US-14 — Structurer les sections de l'item

> **ID :** US-14
> **Epic :** E3 — Capture des extraits
> **Priorité :** Must
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

> ✅ **Points en hypothèse confirmés par l'utilisatrice le 10/11/2026**
> 1. Une section en contient une autre quand celle-ci la suit dans la page et a un niveau plus bas (H2 sous H1, H3 sous H1 ou H2), jusqu'à la prochaine section de niveau égal ou supérieur. Les sections étant toujours ajoutées en fin de page, leur ordre de création est l'ordre de la page.
> 2. Après l'ajout d'une section seule, aucun message de succès ne s'affiche : la section apparaît dans la liste et devient la section pré-sélectionnée.
> 3. Le message « Cette section existe déjà » s'affiche dès que le titre saisi correspond à une section existante. Seul « Ajouter la section seule » devient inactif : « Ajouter l'extrait » range toujours l'extrait sous la section existante.
> 4. Une section vide se supprime sans confirmation, comme un extrait.
> 5. « Cette section existe déjà » s'affiche dans un Message `warning` du DS sous le champ, l'atome Field n'ayant pas de texte d'aide.
> 6. La liste n'affiche pas de niveau en toutes lettres : seuls la typographie et le retrait distinguent H1, H2 et H3. Le préfixe « H2 · » n'apparaît que dans les menus Section.

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** créer des sections sans citation, les supprimer depuis le panneau et voir leur hiérarchie
**Afin de** reproduire dans Notion la structure de l'article lu (H1 > H2 > H3 > citation), même quand l'article n'a pas de texte entre deux titres.

L'objectif de cette user story est d'ajouter le bouton « Ajouter la section seule », de permettre la suppression d'une section et de son contenu depuis la liste, avec confirmation si elle n'est pas vide, de ne plus supprimer automatiquement une section vidée, et de distinguer visuellement les niveaux H1, H2 et H3 dans la liste et dans les menus Section.

Cas d'origine : sur l'article « Experimentation, AI and the Product Model » de SVPG, l'extrait « The purpose of any experiment is to learn something. » doit être rangé sous le H2 « – Experimentation », lui-même sous le H1 « Some Notes on Nomenclature », qui n'a aucun texte propre.

## What Changes

- Quand « + Nouvelle section… » est choisi, un bouton « Ajouter la section seule », placé avec le choix du niveau, écrit seulement le titre en fin de page, sans passage sélectionné requis.
- Chaque titre de section de la liste propose une action « Supprimer la section ». Une section vide est supprimée immédiatement ; sinon, une confirmation indique le nombre de citations et de sections qu'elle contient. La suppression retire de Notion le titre et tout son contenu.
- **BREAKING** Une section qui perd son dernier extrait n'est plus supprimée automatiquement.
- Les sections vides apparaissent dans la liste.
- Dans la liste, les titres H1, H2 et H3 ont une typographie distincte, et chaque sous-section est décalée d'un cran sous sa section parente.
- Dans les menus Section, chaque section est préfixée par son niveau : « H1 · Some Notes on Nomenclature ».
- La version passe à 1.3.0.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities
- `extract-capture`: section seule, sections vides listées, hiérarchie visuelle, préfixe de niveau dans le menu.
- `extract-editing`: suppression d'une section et de son contenu, confirmation, fin de la suppression automatique d'une section vidée, préfixe de niveau dans le menu de modification.
- `capture-session`: « Terminer » inactif aussi pendant l'ajout ou la suppression d'une section.
- `notion-error-recovery`: « Terminer la capture » proposé aussi après l'échec de l'ajout d'une section seule.

## Impact

- `src/capture/extract-placement.ts` : placement d'une section seule, contenu d'une section, suppression en cascade, retrait de la suppression automatique.
- `src/entrypoints/sidepanel/ExtractCapture.vue` : bouton, liste hiérarchique, confirmation, libellés des menus.
- PRD : « Suppression explicite d'une section » sort du Hors scope ; « Insérer une section ailleurs qu'en fin de page » y entre.
- Un appel Notion nouveau par sa forme : l'écriture d'un titre seul en fin de page, couverte par un test de contrat Karate.

## Maquettes & design

- Aucune maquette. Composants selon la spec `ui-design-system` et le design system [ds-editorial-tech](https://github.com/simonguillochon/ds-editorial-tech) : Button, Icon Button, Message, Select, tokens de typographie, d'espacement et de couleur.
- Écrans concernés : zone des extraits du panneau latéral.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants
- [ ] Tests de contrat Karate passants
- [ ] `openspec validate us-14-structurer-sections --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Validation PO
