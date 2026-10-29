# Spec Delta

## Purpose

Publie automatiquement sur GitHub une version signée et testée de l'extension, sans exposer de secret dans le dépôt public.

## ADDED Requirements

### Requirement: Vérifier chaque push et chaque pull request
À chaque push sur la branche `main` et à chaque pull request, le workflow SHALL lancer le typecheck, les tests Vitest, la validation OpenSpec en mode strict et les tests de contrat Karate.

#### Scenario: Nominal — Push dont les tests passent
- **ÉTANT DONNÉ QUE** l'utilisatrice pousse sur `main` un commit dont tous les tests passent
- **LORSQUE** le workflow se termine
- **ALORS** GitHub affiche le commit comme validé

#### Scenario: Erreur — Test en échec
- **ÉTANT DONNÉ QUE** un test Vitest échoue sur le commit poussé
- **LORSQUE** le workflow se termine
- **ALORS** GitHub affiche le commit en échec
- **ET** aucune release n'est créée

### Requirement: Faire échouer les tests de contrat sans secrets
Quand les secrets de la base de test ne sont pas disponibles, notamment sur une pull request ouverte depuis un fork, les tests de contrat SHALL échouer avec le message « Secrets des tests de contrat indisponibles », sans appeler Notion, et le workflow SHALL lancer les autres vérifications.

#### Scenario: Erreur — Pull request depuis un fork
- **ÉTANT DONNÉ QUE** une personne ouvre une pull request depuis son fork du dépôt
- **LORSQUE** le workflow se termine
- **ALORS** le typecheck, les tests Vitest et la validation OpenSpec ont été lancés
- **ET** les tests de contrat sont en échec avec le message « Secrets des tests de contrat indisponibles »
- **ET** GitHub affiche la pull request en échec

### Requirement: Créer une release pour une nouvelle version
Sur un push sur `main` dont toutes les vérifications passent, le workflow SHALL créer la release `vX.Y.Z`, où `X.Y.Z` est la version de `package.json`, seulement si le tag `vX.Y.Z` n'existe pas encore.

#### Scenario: Nominal — Nouvelle version poussée
- **ÉTANT DONNÉ QUE** la version de `package.json` est passée de 1.0.1 à 1.0.2
- **ET** le tag `v1.0.2` n'existe pas
- **LORSQUE** l'utilisatrice pousse ce changement sur `main` et que les tests passent
- **ALORS** la release `v1.0.2` apparaît sur la page des releases du dépôt
- **ET** le tag `v1.0.2` désigne le commit poussé

#### Scenario: Alternatif — Version déjà publiée
- **ÉTANT DONNÉ QUE** la version de `package.json` est 1.0.2
- **ET** la release `v1.0.2` existe déjà
- **LORSQUE** l'utilisatrice pousse sur `main` un commit qui ne change pas la version
- **ALORS** aucune release n'est créée
- **ET** GitHub affiche le commit comme validé

### Requirement: Joindre l'extension signée par Mozilla
La release SHALL contenir le fichier `readme-capture-X.Y.Z.xpi`, signé par Mozilla en distribution non listée, et aucun autre fichier joint par le workflow.

#### Scenario: Nominal — Installer depuis la release
- **ÉTANT DONNÉ QUE** la release `v1.0.2` est publiée
- **LORSQUE** l'utilisatrice télécharge `readme-capture-1.0.2.xpi` depuis la release et l'installe dans Zen
- **ALORS** l'extension Readme Capture 1.0.2 est installée
- **ET** elle est toujours installée après le redémarrage de Zen

#### Scenario: Erreur — Signature refusée par Mozilla
- **ÉTANT DONNÉ QUE** Mozilla refuse de signer la version 1.0.2
- **LORSQUE** le workflow se termine
- **ALORS** GitHub affiche le commit en échec
- **ET** ni la release ni le tag `v1.0.2` ne sont créés

### Requirement: Générer les notes de release
Les notes de la release SHALL être générées par GitHub et contenir le lien de comparaison avec la release précédente.

#### Scenario: Nominal — Notes de la release
- **ÉTANT DONNÉ QUE** trois commits ont été poussés depuis la release `v1.0.1`
- **LORSQUE** la release `v1.0.2` est créée
- **ALORS** ses notes contiennent le lien « Full Changelog » de comparaison entre `v1.0.1` et `v1.0.2`
- **ET** elles listent les pull requests fusionnées depuis `v1.0.1`, s'il y en a

### Requirement: Ne jamais exposer les secrets
Le jeton Notion de test, l'ID de la base de test et les clés d'API addons.mozilla.org MUST être lus uniquement depuis les secrets GitHub, et MUST n'apparaître ni dans le dépôt, ni dans les journaux du workflow, ni dans la release.

#### Scenario: Erreur — Secret dans les journaux
- **ÉTANT DONNÉ QUE** le workflow a lancé les tests de contrat et la signature
- **LORSQUE** une personne extérieure consulte les journaux publics du workflow
- **ALORS** chaque valeur secrète y apparaît masquée par `***`

#### Scenario: Alternatif — Clés de signature hors de main
- **ÉTANT DONNÉ QUE** une pull request modifie le workflow pour afficher les clés d'API addons.mozilla.org
- **LORSQUE** le workflow s'exécute sur cette pull request
- **ALORS** les clés d'API addons.mozilla.org ne sont pas disponibles pour ce workflow

### Requirement: Utiliser la base de test une exécution à la fois
Le workflow SHALL attendre la fin d'une exécution des tests de contrat en cours avant d'en lancer une autre.

#### Scenario: Alternatif — Deux push rapprochés
- **ÉTANT DONNÉ QUE** les tests de contrat du premier de deux push sont en cours
- **LORSQUE** le second push déclenche le workflow
- **ALORS** ses tests de contrat démarrent après la fin de ceux du premier push
