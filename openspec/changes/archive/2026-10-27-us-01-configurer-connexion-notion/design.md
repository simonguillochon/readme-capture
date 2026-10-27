# Design

## Context

Le dépôt ne contient encore que la configuration OpenSpec, `CLAUDE.md` et le PRD. Cette US pose le socle technique de toute l'extension, puis livre la page d'options et le panneau dans son état « non configuré ». Voir `proposal.md` pour le besoin.

Contraintes héritées du PRD (section « Hypothèses ») : extension Firefox Manifest V3 utilisée dans Zen, WXT + Vue 3 + TypeScript, Tailwind avec les valeurs du DS ds-editorial-tech, stockage local uniquement, dépôt public sans secret, Vitest et Karate.

## Goals / Non-Goals

**Goals:**
- Un projet qui se construit, se teste et se charge en temporaire dans Zen.
- Un thème Tailwind et des composants de base conformes au DS, réutilisés par les US suivantes.
- Une page d'options qui vérifie la connexion à Notion avant d'enregistrer.
- Des tests de contrat qui confirment le comportement de l'API Notion sur lequel repose la vérification.

**Non-Goals:**
- Aucune lecture de la page active, aucun script de contenu : ils arrivent avec l'US-02.
- Aucune création ni modification d'item Notion.
- Aucun composant visuel au-delà de ceux listés dans la décision 7.

## Decisions

### 1. Outillage et versions
- Gestionnaire de paquets : **npm**.
- Dépendances autorisées pour cette US, en dernière version stable au moment de l'initialisation : `wxt`, `@wxt-dev/module-vue`, `vue`, `typescript`, `tailwindcss`, `@tailwindcss/vite`, `vitest`.
- Aucune autre dépendance, y compris bibliothèque de composants, SDK Notion ou utilitaire de requêtes.
- TypeScript en mode `strict`.
- Les versions installées sont celles écrites dans `package.json` et `package-lock.json`, versionnés.

### 2. Arborescence
```
.
├── CLAUDE.md
├── README.md
├── .env.example
├── .gitignore
├── docs/
│   ├── prd/PRD-2610-001.md
│   └── tests/             # check-lists de tests manuels par US
├── openspec/
├── wxt.config.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── public/
│   ├── icon/              # icônes de l'extension
│   └── fonts/             # polices du DS et leur licence
├── src/
│   ├── entrypoints/
│   │   ├── background.ts
│   │   ├── sidepanel/     # index.html, main.ts, App.vue
│   │   └── options/       # index.html, main.ts, App.vue
│   ├── components/        # composants Vue conformes au DS
│   │   └── icons/         # icônes Phosphor Light du DS et leur licence
│   ├── notion/            # client API, vérification, erreurs
│   ├── config/            # lecture et écriture de la configuration
│   ├── styles/theme.css   # thème Tailwind transcrit du DS
│   └── env.d.ts           # déclaration des modules .vue pour TypeScript
└── tests/
    ├── unit/              # Vitest
    └── contract/          # Karate (.feature, karate-config.js)
```
Toute création de fichier hors de cette arborescence demande un accord.

### 3. Manifest
- `manifest_version: 3`, cible Firefox uniquement.
- Nom de l'extension : « Readme Capture ».
- `browser_specific_settings.gecko.id` : `readme-capture@simonguillochon`.
- `action` sans popup, pour que le clic déclenche `action.onClicked`.
- `sidebar_action` pointant vers le panneau, avec `open_at_install: false`.
- `options_ui` pointant vers la page d'options, ouverte dans un onglet.
- Permissions : `storage`. Permission d'hôte : `https://api.notion.com/*` uniquement.
- Aucun `content_scripts` déclaré. C'est ce qui garantit l'exigence « Rester inactive quand le panneau est fermé ».
- Alternative écartée : un bouton dans le panneau seul, sans action dans la barre d'URL, car l'utilisatrice veut un interrupteur visible à côté de l'URL.

### 4. Ouverture et fermeture du panneau
- `background.ts` écoute `browser.action.onClicked` et appelle `browser.sidebarAction.toggle()` dans le gestionnaire, qui conserve le geste utilisateur exigé par Firefox.
- Le lien « page d'options » du panneau appelle `browser.runtime.openOptionsPage()`.

### 5. Configuration
- Clé unique dans `browser.storage.local` : `notionConfig`, de type `{ token: string; databaseUrl: string; databaseId: string; databaseTitle: string; dataSourceId: string }`.
- `databaseUrl` est l'URL saisie, réaffichée dans la page d'options. `databaseTitle` et `dataSourceId` sont obtenus lors de la vérification et réutilisés par les US suivantes.
- Écriture uniquement après une vérification réussie, en une seule opération.
- Le panneau considère la connexion comme configurée si et seulement si `notionConfig` existe.
- Extraction de l'ID : la valeur saisie doit être une URL `https` dont l'hôte est `notion.so`, `notion.com` ou l'un de leurs sous-domaines, et dont le chemin contient un identifiant de 32 caractères hexadécimaux, avec ou sans tirets, éventuellement précédé du nom de la base et d'un tiret. Le dernier identifiant du chemin est retenu, les paramètres de requête (dont `v`, l'identifiant de vue) sont ignorés. L'identifiant est normalisé sans tirets, en minuscules. Toute autre valeur, y compris un identifiant seul, est refusée avec « URL de base non reconnue ».

### 6. Client Notion et vérification
- Appels directs avec `fetch`, sans SDK, en-têtes `Authorization: Bearer <token>` et `Notion-Version: 2025-09-03`. La version est une constante unique dans `src/notion/`.
- Vérification en deux appels :
  1. `GET /v1/databases/{databaseId}` : titre de la base et liste `data_sources`. La première source de données est retenue.
  2. `GET /v1/data_sources/{dataSourceId}` : propriétés.
- Propriétés attendues, par nom et type : `Title` (title), `URL` (url), `Source` (rich_text), `Date` (date), `Theme` (multi_select), `Description` (rich_text). D'autres propriétés peuvent exister.
- Correspondance des erreurs :

| Situation | Message |
| --- | --- |
| `fetch` rejette (pas de réseau) | Connexion impossible |
| HTTP 401 | Jeton Notion invalide |
| HTTP 403, 404 ou toute autre réponse 4xx, réponse illisible | Base inaccessible |
| Base sans source de données, propriété absente ou d'un autre type | La base Notion a changé |
| HTTP 429 | Notion limite les appels, puis réessai après la valeur de l'en-tête `Retry-After`, en secondes (1 seconde si l'en-tête est absent ou illisible). Après 3 réessais, la vérification s'arrête sur ce message. |
| HTTP 5xx | Notion ne répond pas |

- Les messages d'erreur sont affichés avec le style d'erreur, y compris « Notion limite les appels ».

### 7. Interface et design system
- Thème Tailwind dans `src/styles/theme.css`, avec les valeurs transcrites depuis les pages « Foundations » du DS (couleurs en modes clair et sombre, typographie, espacements, rayons, ombres).
- Le mode suit `prefers-color-scheme`.
- Polices du DS embarquées dans `public/fonts/`, avec leur fichier de licence, téléchargées depuis la source indiquée dans la documentation du DS. Si la licence n'autorise pas l'embarquement, Claude Code s'arrête.
- Composants créés dans cette US, selon la page « Atomes » du DS : champ texte, champ masqué avec commande afficher/masquer, bouton, lien, message (succès et erreur). Si l'un d'eux n'est pas spécifié dans le DS, Claude Code s'arrête.
- Composants absents du DS, validés par l'utilisatrice et composés à partir des atomes existants :
  - champ masqué (`DsPasswordInput`) : un Input suivi d'un Icon Button « ghost » avec les icônes eye et eye-slash ;
  - message (`DsMessage`) : bloc à bordure, couleur de bordure succès ou erreur ;
  - libellé de champ (`DsField`) : style Caption, couleur text-secondary.
- Le Link affiche l'icône arrow-right au survol.
- Icônes : Phosphor Light, exportées du fichier Figma du DS, avec leur licence MIT dans `src/components/icons/`.
- Ces écarts sont à reporter dans le DS.

### 8. Tests
- **Vitest**, logique pure uniquement : extraction de l'ID, contrôle des propriétés, correspondance des erreurs (avec des réponses simulées), lecture et écriture de la configuration avec le faux navigateur fourni par WXT.
- **Karate**, tests de contrat sur la base « Readme center (tests) » :
  - un jeton valide et l'ID de la base de test renvoient 200, le titre « Readme center (tests) » et au moins une source de données ;
  - la source de données expose les six propriétés attendues avec leurs types ;
  - un jeton invalide renvoie 401 ;
  - un identifiant de base inconnu renvoie 404.
- Exécution de Karate : JAR autonome officiel, version 2.1.4, téléchargé par un script npm dans un dossier ignoré par git. Prérequis : Java 21 ou plus.
- Variables d'environnement des tests de contrat, dans `.env` (ignoré par git) : `NOTION_TEST_TOKEN`, `NOTION_TEST_DATABASE_ID`. `.env.example` les liste sans valeur.

### 9. Scripts npm
`dev` (WXT pour Firefox), `build`, `zip`, `test` (Vitest), `test:contract` (Karate), `openspec:validate`, `typecheck` (`tsc --noEmit`), `postinstall` (`wxt prepare`, qui génère les types WXT après `npm install`).

## Risks / Trade-offs

- [La version 2025-09-03 de l'API Notion est remplacée ou ses réponses diffèrent de ce design] → Les tests de contrat le révèlent avant toute implémentation métier. Claude Code s'arrête au point d'arrêt correspondant.
- [Une base à plusieurs sources de données] → La première est retenue. Readme center n'en a qu'une à date.
- [Le jeton est stocké en clair dans le profil Zen] → Accepté pour un usage personnel ; le jeton n'est jamais dans le dépôt.
- [WXT ou Firefox gèrent mal `sidebarAction.toggle()` depuis l'action] → Vérifié au premier point d'arrêt, avant toute autre fonctionnalité.
