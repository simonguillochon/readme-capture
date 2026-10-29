# US-08 — Rédiger et enregistrer la description

> **ID :** US-08
> **Epic :** E4 — Synthèse et fin de capture
> **Priorité :** Must
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

> ⚠️ **Points en hypothèse à confirmer avant lancement dev**
> 1. Compteur, hors DS : « 1 240 / 2000 » sous le champ, aligné à droite, en Caption sur `text/secondary`, nombres au format français. Il ne change pas de couleur à l'approche de la limite et n'est pas annoncé à chaque frappe par les lecteurs d'écran : il est relié au champ par `aria-describedby`.
> 2. À la limite, la saisie s'arrête : un texte collé au-delà de 2000 caractères est coupé à 2000.

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** rédiger ma phrase de synthèse dans le panneau, sous mes extraits, et l'enregistrer dans la Description de l'item
**Afin de** conclure ma capture sans ouvrir Notion, avec mes extraits sous les yeux.

L'objectif de cette user story est d'ajouter au panneau, une fois l'item créé, une zone « Description » avec un champ texte limité à 2000 caractères et un compteur, qui enregistre son contenu dans la propriété Description de l'item. Elle aligne aussi au préalable les composants de l'extension sur la version 1.13 du design system.

## What Changes

- Une fois l'item créé, une zone « Description » s'affiche entre le formulaire de l'item et la zone des extraits : un Textarea, un compteur de caractères et le bouton « Enregistrer la description ».
- Le bouton n'apparaît que si le texte diffère de la dernière description enregistrée. Une description vide peut être enregistrée pour effacer celle de Notion.
- Le texte est enregistré en texte brut, sauts de ligne conservés et espaces de début et de fin retirés, et remplace la description précédente.
- Après l'enregistrement, « Description enregistrée dans Readme center » s'affiche jusqu'à la modification suivante.
- Les composants Input, Select, Textarea, Button, Icon Button, Link, Checkbox, Choice Group, Password Input et Disclosure de l'extension suivent les specs v1.13 du DS : cibles de 44 px, paddings de 16 px, état focus du Button, de l'Icon Button et du Link, libellé du Button primary et coche de la Checkbox en `text/on-accent`, survol de l'accent éclairci en mode clair, Buttons désactivés à 60 % d'opacité, Button link souligné au survol seulement.
- Les boutons « Ajouter », « Enregistrer les modifications », « Ajouter l'extrait » et « Enregistrer » de la page d'options passent en taille sm (44 px).

## Capabilities

### New Capabilities
- `item-description`: rédaction et enregistrement de la phrase de synthèse dans la propriété Description de l'item.

### Modified Capabilities
- `ui-design-system`: l'interface suit la version 1.13 du DS, et les écarts validés par l'utilisatrice, dont le compteur de caractères, sont admis.

## Impact

- Composants : mise à jour de `DsInput`, `DsSelect`, `DsTextarea`, `DsButton`, `DsIconButton`, `DsLink`, `DsCheckbox`, `DsChoiceGroup`, `DsPasswordInput` et `DsDisclosure` selon le DS 1.13 ; nouveau composant `DescriptionEditor.vue` dans le panneau.
- Thème : nouveau jeton `--color-text-on-accent` ; `--color-accent-hover` en `primary-400` en mode clair.
- Usages : les quatre boutons principaux de `CaptureForm.vue`, `ExtractCapture.vue` et de la page d'options passent en taille sm.
- Client Notion : la mise à jour de la propriété Description passe par `updateItem` (US-05).
- Aucune dépendance ni permission nouvelle.
- La hauteur des champs et des boutons principaux passe de 40 à 44 px : le panneau s'allonge légèrement.

## Maquettes & design

- Aucune maquette. Composants selon le design system [ds-editorial-tech](https://github.com/simonguillochon/ds-editorial-tech) v1.13 (`docs/components/atoms.md`) et la page Components de Figma : Textarea, Field label, Button, Message.
- Écran concerné : panneau latéral, entre le formulaire de l'item et la zone des extraits ; tous les écrans pour l'alignement sur le DS 1.13.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants
- [ ] Tests de contrat Karate passants
- [ ] `openspec validate us-08-rediger-description --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Validation PO
