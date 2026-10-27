# Design

## Context

L'US-02 a livré le formulaire `src/entrypoints/sidepanel/CaptureForm.vue`, ses règles pures (`src/capture/`), la lecture des thèmes (`src/notion/themes.ts`) et un bouton « Ajouter » sans action. Le client Notion (`src/notion/client.ts`) ne fait que des `GET`. La configuration `notionConfig` contient `token` et `dataSourceId`. Voir `proposal.md` pour le besoin.

## Goals / Non-Goals

**Goals:**
- Créer l'item en un seul appel à l'API Notion, à partir d'une requête construite par une fonction pure testée.
- Détecter un doublon avant la création, sans bloquer.
- Des tests de contrat qui créent de vrais items dans la base de test et les mettent à la corbeille.

**Non-Goals:**
- Aucune modification des champs après la création, ni bouton « Enregistrer les modifications » (US-04). Les champs restent affichés tels quels après la création.
- Aucune conservation de la capture dans le stockage local, ni bouton « Terminer » (US-08).
- Aucun réessai automatique ni action de reprise sur erreur (US-09).
- Aucune détection de doublon après la création (US-04, à la modification de l'URL).

## Decisions

### 1. Dépendances
Aucune nouvelle dépendance ni permission.

### 2. Client Notion (`src/notion/client.ts`)
- Ajout de `notionPost<T>(token, path, body)` et `notionPatch<T>(token, path, body)`, construits comme `notionGet` : mêmes en-têtes, plus `Content-Type: application/json`, et mêmes erreurs (`NotionNetworkError`, `NotionHttpError`).
- `notionGet` n'est pas modifié.
- `notionPatch` n'est utilisé que par les tests de contrat dans cette US. Il est ajouté au client pour servir aux US-04 à 07.

### 3. Requête de création (`src/notion/item-payload.ts`)
Fonction pure `buildCreatePageBody(form, dataSourceId, today)`, avec `form: CaptureFormState` et `today: string` au format `AAAA-MM-JJ` :

```json
{
  "parent": { "type": "data_source_id", "data_source_id": "<dataSourceId>" },
  "icon": { "type": "emoji", "emoji": "🇬🇧" },
  "properties": {
    "Title": { "title": [{ "text": { "content": "<Titre>" } }] },
    "URL": { "url": "<URL>" },
    "Source": { "rich_text": [{ "text": { "content": "<Auteur>" } }] },
    "Date": { "date": { "start": "<today>" } },
    "Theme": { "multi_select": [{ "name": "<thème>" }] },
    "LinkedIn auteur": { "url": "<profil>" }
  }
}
```

- Correspondance des icônes : `fr` → 🇫🇷, `en` → 🇬🇧, `es` → 🇪🇸.
- Titre et Auteur sont débarrassés des espaces en début et fin. L'URL et le profil LinkedIn sont passés tels qu'ils figurent dans le formulaire, déjà nettoyés par l'US-02.
- `LinkedIn auteur` est omis si « LinkedIn de l'auteur » est vide.
- `Description`, `Type` et `children` sont omis.
- Les thèmes sont envoyés dans l'ordre où l'utilisatrice les a choisis.
- La fonction n'est appelée que sur un formulaire valide au sens de `isFormValid`.

### 4. Date du jour (`src/notion/item-payload.ts`)
Fonction pure `localDate(now: Date)` → `AAAA-MM-JJ`, calculée avec les méthodes locales de `Date` (`getFullYear`, `getMonth`, `getDate`), donc dans le fuseau de l'ordinateur. Elle est appelée avec `new Date()` au clic sur « Ajouter ».

### 5. Création (`src/notion/items.ts`)
- `createItem(config, form, now)` appelle `POST /v1/pages` avec `buildCreatePageBody(form, config.dataSourceId, localDate(now))`, et renvoie `{ id, url }` lus dans la réponse. `url` est le champ `url` de la page renvoyée par Notion.
- En cas d'échec, l'erreur est propagée. Le panneau affiche `errorMessage(error)`.

### 6. Recherche de doublon (`src/notion/items.ts`)
- `findItemByUrl(config, url)` appelle `POST /v1/data_sources/{dataSourceId}/query` avec :

```json
{ "filter": { "property": "URL", "url": { "equals": "<url>" } }, "page_size": 1 }
```

- Elle renvoie le champ `url` du premier résultat, ou `null` s'il n'y en a aucun.
- Le panneau l'appelle à chaque pré-remplissage qui produit une URL valide et à chaque sortie du champ « URL » où `normalizeUrl` ne renvoie pas `null`, tant que l'item n'est pas créé. Seul le résultat de la dernière recherche lancée est pris en compte, comme pour la lecture de la page dans l'US-02.
- Une URL vide ou invalide efface l'avertissement sans lancer de recherche.
- En cas d'échec de la recherche, l'avertissement est effacé et rien n'est affiché.

### 7. Panneau (`CaptureForm.vue`)
- Nouvel état : `status` (`'editing' | 'creating' | 'created'`), `createdItemUrl`, `duplicateUrl`, `creationError`.
- Au clic sur « Ajouter » : `status` passe à `creating`, `creationError` est effacé, puis `createItem` est appelé.
  - Succès : `status` passe à `created` et `createdItemUrl` reçoit l'URL de la page.
  - Échec : `status` revient à `editing` et `creationError` reçoit `errorMessage(error)`.
- Quand `status` vaut `created`, `prefillFromActiveTab` et la recherche de doublon ne font plus rien. Les écouteurs d'onglets restent enregistrés mais sans effet.
- Les liens « Ouvrir dans Notion » et « Ouvrir l'item existant » ouvrent la page avec `browser.tabs.create({ url })`.

### 8. Interface
- **Doublon** : sous le champ « URL », un `DsMessage` `warning` contenant « Cette URL existe déjà dans Readme center », suivi d'un `DsLink` « Ouvrir l'item existant ».
- **Bouton** : `DsButton` `primary` `md`, libellé « Ajouter » ou « Ajout en cours… », inactif si le formulaire est invalide ou si `status` vaut `creating`. Il n'est plus affiché quand `status` vaut `created`.
- **Erreur de création** : `DsMessage` `error` au-dessus du bouton.
- **Confirmation** : à la place du bouton, un `DsMessage` `success` « Item créé dans Readme center », suivi d'un `DsLink` « Ouvrir dans Notion ».
- **Variante `warning` de `DsMessage`** : bordure `border-warning`, `role="status"`, le reste identique aux autres variantes. Le token `--color-warning` existe dans le DS. La variante est à reporter dans la fiche des écarts au DS.

### 9. Tests
- **Vitest** :
  - `buildCreatePageBody` : chaque langue, profil LinkedIn rempli et vide, espaces autour du titre et de l'auteur, plusieurs thèmes dans l'ordre choisi, absence de `Description`, `Type` et `children`.
  - `localDate` : une date en milieu de journée et une date à 23 h 30, construites en heure locale.
  - `createItem` et `findItemByUrl` avec des réponses simulées : succès, aucun résultat, erreur réseau, réponse 401.
  - `notionPost` et `notionPatch` : méthode, en-têtes et corps envoyés.
- **Karate** (`tests/contract/item-creation.feature`), sur la base « Readme center (tests) » :
  - `POST /v1/pages` avec un corps de la forme de la décision 3 renvoie 200, la page a l'icône emoji envoyée, et ses propriétés Title, URL, Source, Date, Theme et LinkedIn auteur contiennent les valeurs envoyées ;
  - sans `LinkedIn auteur`, la propriété de la page créée vaut `null` ;
  - `POST /v1/data_sources/{id}/query` filtré sur l'URL de l'item créé le renvoie en premier résultat, avec un champ `url` ;
  - le même filtre sur une URL absente renvoie une liste `results` vide ;
  - chaque item créé est mis à la corbeille à la fin du scénario avec `PATCH /v1/pages/{id}` et `{ "in_trash": true }`.
- Les URL et valeurs des tests sont fictives, et chaque scénario utilise une URL unique, par exemple suffixée d'un horodatage, pour ne pas dépendre des autres.

## Risks / Trade-offs

- [Le champ `in_trash` ou la forme de `parent` diffèrent dans la version 2025-09-03 de l'API] → Les tests de contrat le révèlent avant l'implémentation (tâche 2.2).
- [Un titre de plus de 2000 caractères est refusé par Notion] → Le message « Base inaccessible » s'affiche. Ce cas n'est pas traité dans la v1.
- [Un thème supprimé dans Notion entre l'ouverture du panneau et la création] → Notion le recrée comme nouvelle option. Accepté.
- [Une URL saisie à la main et non encore nettoyée au moment du clic] → Le formulaire n'est valide que si `normalizeUrl` réussit, mais la valeur envoyée est celle du champ. Le nettoyage à la sortie du champ (US-02) a lieu avant le clic, puisque cliquer sur le bouton fait quitter le champ.
