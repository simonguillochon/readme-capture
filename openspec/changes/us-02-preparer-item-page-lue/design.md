# Design

## Context

L'US-01 a livré le socle : panneau ouvert et fermé par le bouton de l'extension, page d'options, configuration `notionConfig` dans le stockage local, client Notion (`src/notion/client.ts`), correspondance des erreurs (`src/notion/errors.ts`), thème Tailwind et atomes du DS (`src/components/`). Voir `proposal.md` pour le besoin.

Aujourd'hui, le panneau n'affiche que l'état « non configuré ». Quand la connexion est configurée, il est vide.

## Goals / Non-Goals

**Goals:**
- Le formulaire de préparation de l'item, pré-rempli depuis l'onglet actif.
- Des règles de pré-remplissage et de nettoyage d'URL écrites en fonctions pures, testées avec Vitest.
- Une lecture de page ponctuelle, sans script de contenu permanent.

**Non-Goals:**
- Aucune écriture dans Notion. Le bouton « Ajouter » n'a aucune action dans cette US (US-03).
- Aucune conservation du formulaire dans le stockage local (US-08).
- Aucune action de reprise sur erreur, ni réessai automatique sur la lecture des thèmes (US-09).
- Aucune modification des comportements livrés par l'US-01, en dehors de la propriété `LinkedIn auteur` ajoutée à la vérification de connexion (décision 6 ter).

## Decisions

### 1. Dépendances
Aucune nouvelle dépendance. Les fonctions pures sont testées sans DOM. La collecte dans la page (décision 3) est vérifiée par la check-list manuelle.

### 2. Permissions
- Ajout de la permission `scripting`.
- `host_permissions` devient `['<all_urls>']`, ce qui couvre aussi `https://api.notion.com/*`.
- Toujours aucun `content_scripts` déclaré : l'exigence « Rester inactive quand le panneau est fermé » de la spec `side-panel` reste vraie.
- Tous les écouteurs d'onglets sont enregistrés dans la page du panneau, qui est déchargée quand le panneau se ferme. `background.ts` n'est pas modifié.
- Si Zen n'accorde pas l'accès à tous les sites à l'installation temporaire, Claude Code s'arrête (tâche 1.5). Aucune demande d'autorisation dans l'interface n'est prévue dans cette US.

### 3. Lecture de la page
- Le panneau obtient sa fenêtre avec `browser.windows.getCurrent()`, puis l'onglet actif avec `browser.tabs.query({ active: true, windowId })`.
- Il lit la page avec `browser.scripting.executeScript({ target: { tabId }, func: collectPageSnapshot })`.
- `collectPageSnapshot` (`src/capture/page-snapshot.ts`) est autonome, sans import. Il ne modifie pas la page et n'y laisse aucun écouteur. Il renvoie un objet sérialisable :

```ts
interface PageSnapshot {
  ogTitle: string | null;        // <meta property="og:title">
  metaAuthor: string | null;     // <meta name="author">
  articleAuthor: string | null;  // <meta property="article:author">
  jsonLd: string[];              // contenu brut des <script type="application/ld+json">
  postText: string | null;       // texte du post, pour LinkedIn et X uniquement (décision 5)
  postAuthor: string | null;     // auteur du post, pour LinkedIn et X uniquement (décision 5)
  postAuthorProfileUrl: string | null; // lien du profil de l'auteur, pour LinkedIn uniquement (décision 5)
}
```

- Le titre de l'onglet et son URL viennent de l'objet `tabs.Tab`, pas du snapshot.
- Page illisible : si `executeScript` échoue, ou si l'URL de l'onglet n'est pas en `http` ou `https`, les quatre champs pré-remplis restent vides, sans message.

### 4. Règles de pré-remplissage (`src/capture/prefill.ts`)
Fonction pure `buildPrefill(tabUrl, tabTitle, snapshot)` → `{ title, url, author, authorLinkedin }`, chaque valeur étant une chaîne, vide si rien n'est trouvé.
- Toutes les valeurs extraites sont débarrassées des espaces en début et fin, et les espaces multiples sont réduits à un seul.
- **Titre** : pour un post (décision 5), première phrase de `postText`. Sinon `ogTitle`, puis `tabTitle`.
- **URL** : `normalizeUrl(tabUrl)` (décision 6), ou vide si l'URL est invalide.
- **Auteur** : pour un post, `postAuthor`. Sinon `metaAuthor`, puis `articleAuthor`, puis l'auteur des données structurées.
- Une valeur d'auteur qui est elle-même une URL (cas fréquent de `article:author`) est ignorée, et la source suivante est essayée.
- **LinkedIn de l'auteur** : pour un post LinkedIn, `normalizeLinkedinProfile(postAuthorProfileUrl)`. Pour un post X, vide. Sinon, la première valeur pour laquelle `normalizeLinkedinProfile` (décision 6 bis) ne renvoie pas `null`, en essayant dans l'ordre `articleAuthor`, puis les champs `url` et `sameAs` (chaîne ou tableau) de l'auteur des données structurées.
- Auteur des données structurées : chaque bloc `jsonLd` est analysé comme du JSON. Un bloc invalide est ignoré. Le premier champ `author` trouvé est retenu, en parcourant les objets et tableaux en profondeur, y compris `@graph`. S'il s'agit d'une chaîne, elle est retenue. S'il s'agit d'un objet, son champ `name`. S'il s'agit d'un tableau, son premier élément, selon les mêmes règles.

### 5. Posts LinkedIn et X (`src/capture/posts.ts`)
- `isPostUrl(url)` reconnaît :
  - les hôtes `linkedin.com` et `www.linkedin.com`, avec un chemin commençant par `/posts/` ou `/feed/update/` ;
  - les hôtes `x.com`, `www.x.com`, `twitter.com` et `www.twitter.com`, avec un chemin de la forme `/<compte>/status/<chiffres>`.
- `firstSentence(text)` : texte jusqu'au premier `.`, `!` ou `?` inclus, ou jusqu'au premier saut de ligne exclu, selon ce qui arrive en premier. Si aucun ne figure, le texte entier.
- `collectPageSnapshot` reçoit la plateforme du post (`'linkedin'`, `'x'` ou `null`), calculée dans le panneau avec `postPlatform(tab.url)` et transmise par `executeScript({ args })`, car la fonction exécutée dans la page ne peut rien importer. Avec `null`, `postText`, `postAuthor` et `postAuthorProfileUrl` valent `null`.
- Les textes sont lus avec `innerText`, pour conserver les sauts de ligne utilisés par `firstSentence`. Un élément introuvable donne `null`.
- **X** : le post principal est le premier `article[data-testid="tweet"]` qui contient un lien vers `/status/<id>` (identifiant tiré de l'URL de l'onglet) avec un élément `time`. `postText` est le texte de son `[data-testid="tweetText"]`, et `postAuthor` la première ligne non vide de son `[data-testid="User-Name"]`. `postAuthorProfileUrl` vaut `null`.
- **LinkedIn** : `postText` est le texte du premier `[data-testid="expandable-text-box"]` de la page. Sur un post sans texte, c'est celui du premier commentaire, que l'utilisatrice corrige à la main. Le lien de l'auteur est le premier `a[href*="/in/<identifiant>"]` dont le texte n'est pas vide, `<identifiant>` étant la partie du chemin `/posts/<identifiant>_…` située avant le premier `_`. `postAuthor` est la première ligne non vide de ce lien, et `postAuthorProfileUrl` son `href`.
- Pour un post LinkedIn en `/feed/update/…`, dont l'URL ne contient pas l'identifiant de l'auteur, `postAuthor` et `postAuthorProfileUrl` valent `null` : « Auteur » et « LinkedIn de l'auteur » restent vides.

### 6. Nettoyage d'URL (`src/capture/url-normalization.ts`)
- Fonction pure `normalizeUrl(value)` → `string | null`. `null` signifie que la valeur n'est pas une URL valide.
- La valeur est analysée avec le constructeur `URL`. Elle est refusée si elle échoue ou si le protocole n'est ni `http:` ni `https:`.
- Si l'URL contient un `?`, les paramètres de requête et le fragment sont supprimés, sauf exception. Sinon, l'URL est conservée telle quelle, fragment compris.
- Exceptions : un tableau unique `URL_EXCEPTIONS` dans ce module, contenant pour l'instant la seule entrée « hôtes `youtube.com`, `www.youtube.com`, `m.youtube.com`, chemin `/watch` : conserver `v` ».
- Le résultat est `url.toString()`. La normalisation du constructeur `URL` est acceptée, par exemple l'ajout d'un `/` final sur une origine seule.

### 6 bis. Profil LinkedIn (`src/capture/linkedin-profile.ts`)
- Fonction pure `normalizeLinkedinProfile(value)` → `string | null`.
- Acceptée : une URL `http` ou `https` dont l'hôte est `linkedin.com` ou l'un de ses sous-domaines (`www`, `fr`…), et dont le chemin commence par `/in/<identifiant>`. Tout ce qui suit l'identifiant (segments, paramètres, fragment, `/` final) est ignoré.
- Résultat : `https://www.linkedin.com/in/<identifiant>`, l'identifiant étant conservé tel qu'il apparaît dans l'URL.
- Toute autre valeur, dont les pages `/company/`, renvoie `null`.

### 6 ter. Propriété Notion et vérification
- Nouvelle propriété dans les bases Readme center et Readme center (tests) : `LinkedIn auteur`, de type `url`. Elle est créée à la main par l'utilisatrice (tâche 1.1).
- `EXPECTED_PROPERTIES` (`src/notion/verification.ts`) reçoit l'entrée `'LinkedIn auteur': 'url'`. Aucun autre changement de la vérification.
- Une configuration déjà enregistrée n'est pas revérifiée : la vérification ne s'exécute qu'à l'enregistrement dans la page d'options.
- L'écriture de la propriété dans Notion relève de l'US-03.

### 7. Lecture des thèmes (`src/notion/themes.ts`)
- `fetchThemes(config)` appelle `GET /v1/data_sources/{dataSourceId}` avec `notionGet`, puis renvoie `properties.Theme.multi_select.options[].name`, dans l'ordre reçu.
- Si `Theme` est absente ou n'est pas une `multi_select`, une `DatabaseStructureError` est levée.
- En cas d'échec, le message affiché est `errorMessage(error)`, sans réessai.
- Les thèmes sont lus une fois, à l'ouverture du panneau.

### 8. État du formulaire (`src/entrypoints/sidepanel/CaptureForm.vue`)
- État local au composant : `title`, `url`, `author`, `authorLinkedin`, `language` (`'fr' | 'en' | 'es' | null`), `themes` (liste de noms), et un indicateur `edited`.
- `edited` passe à vrai à la première saisie de l'utilisatrice dans « Titre », « URL », « Auteur » ou « LinkedIn de l'auteur ». Tant qu'il est faux, les événements `tabs.onActivated` (même fenêtre) et `tabs.onUpdated` (onglet actif, `status` égal à `complete`) relancent la lecture de la page et remplacent ces quatre champs.
- En quittant le champ « URL », la valeur est remplacée par `normalizeUrl(valeur)` si le résultat n'est pas `null`. Sinon, la valeur est conservée et le champ passe en état `invalid` de l'Input.
- En quittant le champ « LinkedIn de l'auteur », même règle avec `normalizeLinkedinProfile`. Un champ vide n'est jamais invalide.
- Validité : fonction pure `isFormValid(state)` dans `src/capture/form-validation.ts`, selon l'exigence « Activer « Ajouter » uniquement si le formulaire est valide ».
- Rien n'est écrit dans le stockage local.
- `App.vue` affiche `CaptureForm` quand la configuration existe. L'état « non configuré » est inchangé.

### 9. Interface
- Ordre : Titre, URL, Auteur, LinkedIn de l'auteur, Langue, Thèmes, puis le bouton « Ajouter » (Button `primary`, `md`), inactif tant que le formulaire est invalide, et sans action.
- Les champs texte réutilisent `DsField` et `DsInput`. Le message d'erreur des thèmes réutilise `DsMessage` (`error`).
- **Composants absents du DS**, validés par l'utilisatrice :
  - **Case à cocher** (`src/components/DsCheckbox.vue`) : `input type="checkbox"` natif, coche colorée avec le token `accent` (`accent-color`), contour de focus identique aux autres atomes, libellé en Body sur `text-primary`.
  - **Choix exclusif** (`src/components/DsChoiceGroup.vue`) : rangée de Buttons `sm`, variante `secondary` pour une option non choisie et `primary` pour l'option choisie, avec `role="radiogroup"` sur le conteneur et `role="radio"` / `aria-checked` sur chaque bouton. Libellés : « 🇫🇷 Français », « 🇬🇧 Anglais », « 🇪🇸 Espagnol ».
  - Ces écarts sont à reporter dans le DS, comme ceux de l'US-01.

### 10. Tests
- **Vitest** :
  - `normalizeUrl` : tous les scénarios de la spec `url-normalization`, plus une URL `http` et `m.youtube.com`.
  - `isPostUrl` et `firstSentence`, y compris un texte sans ponctuation.
  - `normalizeLinkedinProfile` : les scénarios de l'exigence « Accepter uniquement un profil LinkedIn », un sous-domaine `fr`, un `/` final, une page `/company/` et une URL hors LinkedIn.
  - `buildPrefill` : chaque scénario de pré-remplissage de la spec `capture-form`, à partir de snapshots fictifs, dont l'auteur URL ignoré et un bloc JSON-LD invalide.
  - `isFormValid`.
  - `fetchThemes` avec des réponses simulées : thèmes dans l'ordre, propriété absente, erreur réseau.
- **Karate** : le scénario des propriétés de `tests/contract/notion-connection.feature` vérifie aussi `LinkedIn auteur` de type `url`.
- **Karate** (`tests/contract/themes.feature`) : la source de données de la base « Readme center (tests) » expose `Theme` de type `multi_select`, avec une liste `options` dont chaque élément a un `name`.
- Les exemples des tests sont fictifs : aucun nom réel d'auteur, aucun texte réel de post.

## Risks / Trade-offs

- [Le code des pages LinkedIn et X change] → Le titre et l'auteur des posts restent vides, ce que la spec accepte. La règle est isolée dans `src/capture/posts.ts`.
- [`executeScript` est refusé sur certains sites] → Traité comme une page illisible : les champs restent vides.
- [L'accès à tous les sites est large] → Il n'est utilisé que panneau ouvert, sur l'onglet actif, en lecture seule. Le manifest reste sans script de contenu.
- [La lecture des thèmes échoue par limitation (429)] → Message « Notion limite les appels » sans réessai dans cette US. Le réessai relève de l'US-09.
