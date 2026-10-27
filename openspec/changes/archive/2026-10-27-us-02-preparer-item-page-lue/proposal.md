# US-02 — Préparer un item à partir de la page lue

> **ID :** US-02
> **Epic :** E2 — Création de l'item
> **Priorité :** Must
> **PRD :** [PRD-2610-001](../../../docs/prd/PRD-2610-001.md)

## Why

**En tant que** utilisatrice de l'extension
**Je souhaite** trouver le titre, l'URL propre, l'auteur et son profil LinkedIn déjà remplis dans le panneau, et y choisir la langue et les thèmes
**Afin de** ne plus recopier ces informations à la main avant de créer l'item dans Readme center, et de permettre à ma publication hebdomadaire automatisée sur LinkedIn de mentionner l'auteur quand son profil est connu.

L'objectif de cette user story est de livrer le formulaire de préparation de l'item dans le panneau : pré-remplissage depuis l'onglet actif, nettoyage de l'URL, choix de la langue et des thèmes lus dans Notion, et bouton « Ajouter » actif uniquement quand tous les champs sont valides. Le clic sur « Ajouter » relève de l'US-03.

## What Changes

- Quand la connexion est configurée, le panneau affiche le formulaire de préparation de l'item.
- Titre, URL nettoyée et Auteur sont pré-remplis depuis l'onglet actif, avec une règle dédiée aux posts LinkedIn et X.
- Un champ facultatif « LinkedIn de l'auteur » est pré-rempli quand la page déclare le profil LinkedIn de l'auteur, et pour les posts LinkedIn.
- Le formulaire suit l'onglet actif tant que l'utilisatrice n'a modifié aucun des champs pré-remplis.
- L'URL est nettoyée selon la règle du PRD, y compris quand elle est collée à la main.
- La langue se choisit parmi 🇫🇷, 🇬🇧 et 🇪🇸, et les thèmes parmi ceux de la base Notion.
- « Ajouter » n'est actif que si tous les champs sont valides. Son action relève de l'US-03.
- L'extension obtient l'accès en lecture à tous les sites. Elle ne l'utilise que panneau ouvert, et seulement sur l'onglet actif.

## Capabilities

### New Capabilities
- `url-normalization`: règle de nettoyage des URL de contenu, réutilisée par la création, la modification et la détection de doublon.
- `capture-form`: formulaire de préparation de l'item dans le panneau, pré-remplissage depuis l'onglet actif, choix de la langue et des thèmes, validation.

### Modified Capabilities
- `notion-connection`: la vérification de connexion contrôle aussi la propriété `LinkedIn auteur`, de type URL.

## Impact

- Bases Notion : la propriété `LinkedIn auteur` (URL) est à créer à la main dans Readme center et Readme center (tests), avant le développement.
- Permissions de l'extension : ajout de `scripting` et de l'accès à tous les sites (`<all_urls>`), en plus de `storage` et `https://api.notion.com/*`.
- Nouveaux modules : extraction des métadonnées de la page, nettoyage d'URL, lecture des thèmes, formulaire du panneau.
- Nouveaux composants : case à cocher et sélecteur de langue, composés à partir des atomes du DS.
- Aucune nouvelle dépendance.

## Maquettes & design

- Aucune maquette. Les composants respectent le design system [ds-editorial-tech](https://github.com/simonguillochon/ds-editorial-tech).
- Écran concerné : panneau latéral, état « configuré », avant création de l'item.

## Definition of Done

- [ ] Critères d'acceptation validés
- [ ] Code revu et mergé
- [ ] Tests unitaires Vitest passants
- [ ] Tests de contrat Karate passants
- [ ] `openspec validate us-02-preparer-item-page-lue --strict` sans erreur
- [ ] Documentation mise à jour
- [ ] Validation PO
