# Spec Delta

## ADDED Requirements

### Requirement: Joindre l'archive de l'extension pour Chromium
La release SHALL contenir le fichier `readme-capture-X.Y.Z-chrome.zip` produit par `npm run zip`, et aucun autre fichier joint par le workflow.

#### Scenario: Nominal — Installer depuis la release
- **ÉTANT DONNÉ QUE** la release `v1.2.0` est publiée
- **LORSQUE** l'utilisatrice télécharge `readme-capture-1.2.0-chrome.zip` depuis la release, le décompresse dans le dossier de l'extension et la charge dans Dia
- **ALORS** l'extension Readme Capture 1.2.0 est installée

### Requirement: Protéger les secrets dans le dépôt public
Le jeton Notion de test et l'ID de la base de test MUST être lus uniquement depuis les secrets GitHub, et MUST n'apparaître ni dans le dépôt, ni dans les journaux du workflow, ni dans la release.

#### Scenario: Erreur — Secret dans les journaux
- **ÉTANT DONNÉ QUE** le workflow a lancé les tests de contrat
- **LORSQUE** une personne extérieure consulte les journaux publics du workflow
- **ALORS** chaque valeur secrète y apparaît masquée par `***`

## REMOVED Requirements

### Requirement: Ne jamais exposer les secrets
**Reason**: Les clés d'API addons.mozilla.org n'existent plus, et leur scénario « Clés de signature hors de main » ne s'applique plus. OpenSpec refuse de retirer un scénario d'une exigence modifiée.
**Migration**: Remplacée par « Protéger les secrets dans le dépôt public », limitée au jeton et à l'ID de la base de test.

### Requirement: Joindre l'extension signée par Mozilla
**Reason**: L'extension n'est plus signée par Mozilla. Elle s'installe non empaquetée dans Dia.
**Migration**: Remplacée par « Joindre l'archive de l'extension pour Chromium ».
