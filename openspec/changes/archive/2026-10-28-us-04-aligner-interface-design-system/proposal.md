# US-04 — Aligner l'interface sur le design system 1.5

> **ID :** US-04
> **Epic :** E1 — Socle et connexion
> **Priorité :** Must
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** que le panneau et la page d'options utilisent les composants du design system ds-editorial-tech 1.5, et non plus des composants propres à l'extension
**Afin de** garder une interface cohérente avec mes autres produits et de n'avoir qu'une seule source de vérité pour le rendu visuel.

L'objectif de cette user story est de remplacer, dans l'extension, les composants créés faute d'équivalent dans le DS par les atomes désormais spécifiés dans les versions 1.4 et 1.5 : Checkbox, Choice Group, Message (success, warning, error), Password Input et Field label, avec les nouveaux tokens `--feedback-*`. Aucun comportement fonctionnel ne change.

## What Changes

- Le thème Tailwind reçoit les tokens `--feedback-*` du DS 1.5, avec la variante `warning-light` en mode clair et les variantes `success-dark` et `error-dark` en mode sombre.
- La case à cocher prend le rendu de l'atome Checkbox : case de 20 px dessinée, cochée en `accent` avec l'icône `check`.
- Dans le choix exclusif, l'option choisie garde le style secondary et reçoit une bordure 2 px `border/accent`.
- Le Message affiche son texte et sa bordure dans la couleur de sa variante (`feedback/success`, `feedback/warning`, `feedback/error`), et occupe toute la largeur disponible du panneau.
- Password Input, Field label, Input `password`, Link et Icons sont déjà conformes : leurs commentaires « hors DS » sont remplacés par la référence à l'atome du DS.

## Capabilities

### New Capabilities
- `ui-design-system`: conformité de l'interface de l'extension aux atomes et tokens du design system ds-editorial-tech.

### Modified Capabilities

Aucune. Les comportements des specs `side-panel`, `notion-connection`, `capture-form`, `url-normalization` et `item-creation` sont inchangés.

## Impact

- `src/styles/theme.css` : nouveaux tokens.
- Composants : `DsCheckbox`, `DsChoiceGroup`, `DsMessage` réécrits ; `DsIcon` reçoit l'icône `check` ; commentaires mis à jour dans `DsPasswordInput`, `DsField`, `DsInput`, `DsLink`, `DsIcon`.
- `CaptureForm.vue` : commentaire de renvoi à l'ancienne US-04 corrigé en US-05, suite à la renumérotation.
- Aucune dépendance, permission ni appel Notion nouveau.

## Maquettes & design

- [Design system ds-editorial-tech — page Components](https://www.figma.com/design/YJSGRUgXYIOcjPWlCs52bG/Tote-bag?node-id=26-96) : Checkbox (`646:86`), Choice Group (`646:111`), Message (`643:31`), Password Input (`645:82`), Field label (`643:22`), Input (`157:12`).
- Documentation : `docs/components/atoms.md` et `docs/foundations/color.md` du dépôt [ds-editorial-tech](https://github.com/simonguillochon/ds-editorial-tech), version 1.5.
- Écrans concernés : panneau latéral (formulaire, avertissement de doublon, confirmation, erreurs) et page d'options.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants
- [ ] `openspec validate us-04-aligner-interface-design-system --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Validation PO
