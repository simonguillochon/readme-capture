# Tasks

## 1. Socle technique

- [x] 1.1 Vérifier que `docs/prd/PRD-2610-001.md`, `CLAUDE.md` et `openspec/config.yaml` sont présents ; sinon, s'arrêter et les demander à l'utilisatrice
- [x] 1.2 Initialiser le projet WXT avec Vue 3 et TypeScript strict selon l'arborescence de `design.md` (décision 2), avec uniquement les dépendances de la décision 1 ; vérifier que `npm install` et `npm run build` réussissent
- [x] 1.3 Configurer le manifest selon la décision 3 de `design.md` ; vérifier dans le manifest généré la présence de `sidebar_action`, `action`, `options_ui`, de la seule permission `storage`, de la seule permission d'hôte `https://api.notion.com/*` et l'absence de `content_scripts`
- [x] 1.4 Créer `.gitignore` (dont `.env`, le dossier du JAR Karate et les sorties de build), `.env.example` et un `README.md` décrivant l'installation, le chargement temporaire dans Zen et les scripts npm ; vérifier que `git status` ne propose aucun fichier secret
- [x] 1.5 Configurer Vitest avec un test témoin ; vérifier que `npm test` passe
- [x] 1.6 Mettre en place Karate selon la décision 8 de `design.md` avec un test témoin sans appel réseau ; vérifier que `npm run test:contract` passe
- [x] 1.7 Ajouter le script `openspec:validate` ; vérifier que `npm run openspec:validate` sur ce change ne remonte aucune erreur
- [x] 1.8 Créer un panneau vide (`sidepanel`) et brancher l'ouverture et la fermeture par le bouton de l'extension (décision 4) ; vérifier que `npm run build` réussit
- [x] 1.9 ⏸ Point d'arrêt : faire un compte rendu à l'utilisatrice (versions installées, résultats des commandes) et lui demander de charger l'extension en temporaire dans Zen pour confirmer que le bouton ouvre et ferme le panneau ; attendre son accord avant de continuer

## 2. Thème et composants du design system

- [x] 2.1 Lire les pages « Foundations » du DS et transcrire leurs valeurs dans `src/styles/theme.css` (modes clair et sombre) ; vérifier que chaque valeur du thème cite sa page source en commentaire
- [x] 2.2 Embarquer les polices du DS et leur licence dans `public/fonts/` (décision 7) ; vérifier que le panneau vide s'affiche avec ces polices
- [x] 2.3 Créer les composants champ texte, champ masqué avec commande afficher/masquer, bouton, lien et message selon la page « Atomes » du DS ; vérifier leur rendu en modes clair et sombre dans le panneau
- [x] 2.4 ⏸ Point d'arrêt : montrer à l'utilisatrice le rendu des composants et la liste des écarts éventuels au DS ; attendre son accord avant de continuer

## 3. Configuration locale

- [x] 3.1 Implémenter l'extraction de l'ID depuis l'URL de la base (décision 5) ; vérifier avec des tests Vitest couvrant les quatre scénarios de l'exigence « Extraire l'identifiant depuis l'URL de la base », une URL avec un identifiant à tirets et une URL `http`
- [x] 3.2 Implémenter la lecture et l'écriture de `notionConfig` (décision 5) ; vérifier avec des tests Vitest utilisant le faux navigateur de WXT

## 4. Vérification de la connexion à Notion

- [x] 4.1 Écrire les tests de contrat Karate de la décision 8 sur la base « Readme center (tests) » ; vérifier qu'ils passent avec les variables de `.env`
- [x] 4.2 ⏸ Point d'arrêt : si un test de contrat révèle une réponse de Notion différente de `design.md`, s'arrêter et la décrire à l'utilisatrice ; sinon, passer à la tâche suivante sans attendre
- [x] 4.3 Implémenter le client Notion et la vérification en deux appels (décision 6) ; vérifier avec des tests Vitest sur réponses simulées : base valide, propriété absente, propriété d'un autre type, base sans source de données
- [x] 4.4 Implémenter la correspondance des erreurs et le réessai après `Retry-After` (décision 6) ; vérifier avec des tests Vitest couvrant chaque ligne de la table, dont le réessai après 2 secondes

## 5. Page d'options

- [x] 5.1 Construire la page d'options avec les composants du groupe 2 : champs « Jeton d'intégration Notion » (masqué, avec commande afficher/masquer) et « URL de la base », bouton « Enregistrer » inactif si un champ est vide ; vérifier les scénarios « Champs remplis », « Champ vide », « Saisie masquée » et « Afficher puis masquer le jeton » de la spec `notion-connection`
- [x] 5.2 Brancher l'enregistrement sur l'extraction de l'ID, la vérification et les messages ; vérifier les scénarios « Connexion vérifiée », « Identifiant seul », « URL hors Notion », « Échec de la vérification » et les scénarios d'erreur de la spec `notion-connection`
- [x] 5.3 Pré-remplir la page avec la configuration enregistrée ; vérifier les scénarios « Remplacer une configuration existante » et « Configuration conservée après redémarrage »

## 6. Panneau non configuré

- [x] 6.1 Afficher l'état non configuré du panneau et le lien vers les options (décision 4) ; vérifier les scénarios « Ouvrir le panneau sans configuration » et « Accéder aux options depuis le panneau » de la spec `side-panel`

## 7. Clôture

- [x] 7.1 Rédiger dans `docs/tests/US-01-check-list.md` la check-list de tests manuels, un point par scénario des deux specs ; vérifier que chaque scénario y figure
- [x] 7.2 Lancer `npm test`, `npm run test:contract` et `openspec validate us-01-configurer-connexion-notion --strict` ; vérifier qu'ils passent tous
- [x] 7.3 ⏸ Point d'arrêt : faire le compte rendu final à l'utilisatrice et lui demander de dérouler la check-list manuelle dans Zen

## Workflow follow-up

- Archiver le change avec `/opsx:archive` après validation de l'utilisatrice.
