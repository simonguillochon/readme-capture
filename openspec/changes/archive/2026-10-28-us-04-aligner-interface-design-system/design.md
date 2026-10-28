# Design

## Context

Les US-01 à US-03 ont créé, faute d'équivalent dans le DS, des composants composés à partir des atomes existants : `DsPasswordInput`, `DsField`, `DsMessage` (success, warning, error), `DsCheckbox` (case native) et `DsChoiceGroup` (option choisie en Button primary). Le DS 1.4, complété par la 1.5 pour la variante `warning` du Message, spécifie désormais ces atomes, avec des différences de rendu. Voir `proposal.md` pour le besoin.

Sources de vérité, par ordre : Figma (page Components du fichier du DS, canonique), puis `docs/components/atoms.md` et `docs/foundations/color.md` du dépôt ds-editorial-tech 1.5.

## Goals / Non-Goals

**Goals:**
- Un rendu identique aux atomes du DS 1.5, en mode clair et en mode sombre.
- Des tokens du thème alignés sur ceux du DS, sans valeur en dur.

**Non-Goals:**
- Aucun changement de comportement, de libellé, de message ou d'ordre des champs.
- Aucune modification des props publiques des composants : leurs appels dans `CaptureForm.vue`, `App.vue` et la page d'options restent identiques.
- Aucun atome du DS non utilisé par l'extension (Textarea, Tag, Avatar, Divider) n'est ajouté.

## Decisions

### 1. Dépendances
Aucune nouvelle dépendance.

### 2. Tokens (`src/styles/theme.css`)
- Primitives ajoutées : `--color-success-dark: #6FBF95`, `--color-error-dark: #E57373` et `--color-warning-light: #8A6508`.
- Tokens sémantiques ajoutés, en mode clair : `--color-feedback-success`, `--color-feedback-warning`, `--color-feedback-error`, `--color-feedback-info`, qui pointent sur `--color-success`, `--color-warning-light`, `--color-error` et `--color-info`.
- Dans le bloc `prefers-color-scheme: dark` : `--color-feedback-success` pointe sur `--color-success-dark`, `--color-feedback-warning` sur `--color-warning` et `--color-feedback-error` sur `--color-error-dark`.
- Chaque ligne cite sa source par un commentaire `/* DS docs/foundations/color.md */`, comme les autres.

### 3. Icône `check`
- Exportée du composant Icons du fichier Figma du DS (variante `check-light`), au même format que les icônes existantes, dans `src/components/icons/check-light.svg`.
- Ajoutée à la table de `DsIcon` sous le nom `check`, et au type de la prop `icon` de `DsIconButton`.
- La licence Phosphor déjà présente dans `src/components/icons/LICENSE` la couvre.

### 4. Checkbox (`DsCheckbox.vue`)
- Reproduction de l'atome Checkbox (`646:86`) : `input type="checkbox"` avec `appearance: none`, case de 20 px, rayon `sm`, et l'icône `check` affichée par-dessus quand la case est cochée.
- Non cochée : fond `surface-elevated`, bordure `border-default`, `border-accent` au survol.
- Cochée : fond `accent`, `accent-hover` au survol, icône `check` en `text-inverse`.
- Focus clavier : anneau 2 px `accent`, décalé de 2 px.
- Désactivée : valeurs de la variante `disabled` dans Figma, cochée et non cochée.
- Libellé en Body sur `text-primary`, à 8 px de la case. Le libellé reste un `label` qui englobe l'`input`.
- Props et événements inchangés (`v-model`, `label`, `disabled`).

### 5. Choice Group (`DsChoiceGroup.vue`)
- Toutes les options sont des `DsButton` `secondary` `sm`, espacés de 8 px.
- L'option choisie reçoit une bordure 2 px `border-accent`, selon la variante `selected` de l'atome (`646:111`). Si le Button secondary garde une bordure 1 px, le passage à 2 px ne doit pas décaler le texte : la compensation est reprise de Figma.
- La variante `disabled` reprend `text-tertiary` et `border-subtle`, selon Figma.
- Le comportement clavier (une seule tabulation, flèches) et les attributs `role`, `aria-checked` sont inchangés.

### 6. Message (`DsMessage.vue`)
- Reproduction de l'atome Message (`643:31`), variantes success, warning et error : padding 12 px, rayon `sm`, fond `surface-elevated`, texte Body S, bordure 1 px.
- Texte **et** bordure en `feedback-success`, `feedback-warning` ou `feedback-error` selon la variante.
- Largeur : `w-full` au lieu des 320 px de l'atome. C'est l'usage propre à Readme Capture, validé par l'utilisatrice, à noter en commentaire.
- Les `role` (`status` pour success et warning, `alert` pour error) sont inchangés.

### 7. Composants déjà conformes
- `DsPasswordInput`, `DsField`, `DsInput` (type `password`), `DsLink` (icône `arrow-right` au survol) et `DsIcon` (couleur suivant le texte) correspondent déjà au DS 1.5.
- Seuls leurs commentaires changent : « composant hors DS, validé par l'utilisatrice » devient la référence à l'atome du DS et à son nœud Figma.
- Si un écart de rendu apparaît à la comparaison avec Figma (tâche 3.1), Claude Code le signale sans le corriger.

### 8. Commentaire de `CaptureForm.vue`
- La mention « (US-04) » du commentaire sur la recherche de doublon après création devient « (US-05) », suite à la renumérotation du PRD 1.5.0.

### 9. Tests
- Aucun test Vitest nouveau : les changements sont visuels et les composants ne contiennent pas de logique nouvelle.
- `npm test` et `npm run typecheck` doivent continuer de passer.
- La vérification visuelle se fait au point d'arrêt 3.1 et par la check-list manuelle.

## Risks / Trade-offs

- [La case à cocher dessinée perd l'accessibilité native] → L'`input` reste un vrai `checkbox` relié à son libellé. Seul son rendu change.
- [La bordure de 2 px de l'option choisie modifie la largeur du bouton] → Compensation reprise de Figma, vérifiée au point d'arrêt.
