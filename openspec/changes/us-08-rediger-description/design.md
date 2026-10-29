# Design

## Context

Après l'US-07, le panneau affiche sous le formulaire replié (`DsDisclosure`) la zone des extraits (`ExtractCapture.vue`), dès que `createdItemId` est connu. `updateItem(config, pageId, body)` (US-05) envoie un `PATCH /v1/pages/{id}`, et `itemErrorMessage` renvoie « Item introuvable dans Notion » pour toute réponse 400 ou 404. `DsTextarea` existe depuis l'US-07. Les composants de l'extension suivent les specs du DS d'avant la version 1.10. Voir `proposal.md` pour le besoin.

Sources de vérité pour l'interface : la page Components de Figma, puis `docs/components/atoms.md` et `docs/foundations/color.md` du dépôt ds-editorial-tech v1.13.

## Goals / Non-Goals

**Goals:**
- Des composants conformes au DS 1.13 avant d'ajouter la zone « Description ».
- Une requête de mise à jour de la description construite par une fonction pure testée.

**Non-Goals:**
- Aucune génération de la description par IA (v2, hors scope du PRD).
- Aucune lecture de la Description depuis Notion : le panneau ne connaît que ce qu'il a enregistré (hors scope « synchronisation »).
- Aucune conservation du texte non enregistré à la fermeture du panneau (US-09).
- Aucun changement de comportement des composants mis à jour : seuls leurs dimensions, paddings, couleurs et états changent, ainsi que la taille des boutons principaux.

## Decisions

### 1. Dépendances
Aucune nouvelle dépendance ni permission.

### 2. Alignement sur le DS 1.13
Chaque composant reprend la spec v1.13 de son atome (`atoms.md`) et sa variante Figma. Changements attendus :

| Composant | Changements |
| --- | --- |
| `DsInput`, `DsSelect` | hauteur 44 px, padding 16 px horizontal et 8 px vertical, placeholder `text/secondary` |
| `DsTextarea` | padding 16 px horizontal et 12 px vertical, placeholder `text/secondary`, hauteur minimale de 3 lignes, `resize: vertical` |
| `DsPasswordInput` | Input à 44 px et Icon Button `md` à 44 × 44 px, espacés de 8 px |
| `DsButton` | hauteurs 44 / 48 / 56 px et paddings horizontaux 16 / 24 / 32 px pour `sm` / `md` / `lg` ; `link` dans une zone de 44 px, souligné au survol et à l'appui seulement ; libellé du `primary` en `text/on-accent` ; désactivé à 60 % d'opacité pour tous les variants ; état focus de Figma |
| `DsIconButton` | `md` à 44 × 44 px ; état focus de Figma |
| `DsCheckbox` | case centrée dans une zone de 44 px de haut couvrant la case et le libellé ; coche `check` de 16 px sur `text/on-accent` |
| `DsChoiceGroup` | options en Button `sm` de 44 px |
| `DsDisclosure` | en-tête de 44 px de haut, padding horizontal 16 px |
| `DsLink` | zone de 44 px de haut ; état focus (anneau 2 px `accent` décalé de 2 px) |
| Thème (`theme.css`) | nouveau jeton `--color-text-on-accent` (`neutral-950` dans les deux modes) ; `--color-accent-hover` en `primary-400` en mode clair |

- Les props et événements des composants ne changent pas.
- Les boutons principaux « Ajouter », « Enregistrer les modifications », « Ajouter l'extrait » et « Enregistrer » (page d'options) passent en `size="sm"` (44 px), comme « Enregistrer la description » (choix de l'utilisatrice).
- Les commentaires de référence passent à « DS v1.13 » avec le nœud Figma de l'atome.
- Si une valeur du DS 1.13 ne s'exprime pas avec les tokens du thème, Claude Code s'arrête et pose la question.

### 3. Compteur de caractères (écart validé, hors DS)
- Paragraphe sous le Textarea, aligné à droite, en Caption sur `text/secondary`, à 8 px du champ.
- Texte : `<nombre> / 2000`, le nombre formaté par `new Intl.NumberFormat('fr-FR')`. Le séparateur des milliers produit par ce format (espace fine insécable) est accepté.
- Fonction pure `formatCharacterCount(count, limit)` dans `src/capture/description.ts`.
- Le champ porte `aria-describedby` vers le compteur. Aucune région `aria-live`.
- Écart à reporter dans la fiche des écarts au DS.

### 4. Limite de saisie
- `maxlength="2000"` sur le `textarea` : le navigateur bloque la saisie et coupe un collage à 2000 caractères.
- La longueur comptée est celle de `value.length`, comme `maxlength`.

### 5. Requête de mise à jour (`src/notion/item-payload.ts`)
- Fonction pure `buildDescriptionBody(text)` : texte débarrassé des espaces de début et de fin, puis :
  - texte non vide : `{ "properties": { "Description": { "rich_text": [{ "text": { "content": "<texte>" } }] } } }` ;
  - texte vide : `{ "properties": { "Description": { "rich_text": [] } } }`.
- Un seul objet texte suffit : 2000 caractères est aussi la limite d'un objet texte de Notion.
- Aucune autre propriété dans la requête.

### 6. Composant `DescriptionEditor.vue`
- Nouveau composant du panneau, affiché par `CaptureForm.vue` entre le formulaire et `ExtractCapture` quand `createdItemId` est connu, séparé par un Divider `subtle`. Props : `config`, `pageId`.
- État local : `text` (chaîne vide au départ), `savedText` (chaîne vide au départ), `saving`, `error`, `confirmed`.
- `dirty` = `text.trim() !== savedText`.
- Bouton affiché si `dirty` ou `saving`, inactif pendant `saving`. Au clic : `saving` passe à vrai, l'erreur est effacée, puis `updateItem(config, pageId, buildDescriptionBody(text))`.
  - Succès : `savedText` reçoit `text.trim()`, `confirmed` passe à vrai.
  - Échec : `error` reçoit `itemErrorMessage(error)`.
- `confirmed` repasse à faux dès que `dirty` devient vrai.

### 7. Interface
- `DsField` « Description » + `DsTextarea`, le compteur dessous (décision 3).
- Bouton `DsButton` `primary` `sm`, « Enregistrer la description » ou « Enregistrement en cours… ».
- Confirmation : `DsMessage` `success` « Description enregistrée dans Readme center », sous le champ.
- Erreur : `DsMessage` `error` sous le champ.

### 8. Tests
- **Vitest** :
  - `formatCharacterCount` : 0, 999, 1240 et 2000.
  - `buildDescriptionBody` : texte simple, espaces de début et de fin retirés, sauts de ligne conservés, texte vide, absence de toute autre propriété.
- **Karate** (`tests/contract/item-description.feature`), sur un item créé dans « Readme center (tests) » :
  - mise à jour de Description avec un texte de 2000 caractères contenant un saut de ligne : 200, puis la propriété contient ce texte ;
  - mise à jour avec `rich_text` vide : 200, puis la propriété est vide ;
  - chaque item créé est mis à la corbeille à la fin du scénario.
- L'alignement sur le DS est vérifié au point d'arrêt 1.4 et par la check-list manuelle.

## Risks / Trade-offs

- [Les nouvelles hauteurs allongent le panneau] → Accepté : c'est la spec du DS 1.13.
- [Notion compte les caractères autrement que `value.length`, par exemple pour certains émojis] → Vérifié par le test de contrat à 2000 caractères. Si Notion refuse, Claude Code s'arrête.
