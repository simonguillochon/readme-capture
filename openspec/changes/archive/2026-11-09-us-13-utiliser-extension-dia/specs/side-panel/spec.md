# Spec Delta

## ADDED Requirements

### Requirement: Ouvrir le panneau par le bouton de l'extension
Un clic sur le bouton de l'extension, dans la barre d'outils du navigateur, SHALL ouvrir le panneau latéral de l'extension s'il est fermé.

#### Scenario: Nominal — Ouvrir le panneau
- **ÉTANT DONNÉ QUE** le panneau de l'extension est fermé
- **LORSQUE** l'utilisatrice clique sur le bouton de l'extension dans la barre d'outils de Dia
- **ALORS** le panneau de l'extension s'affiche à côté de la page

### Requirement: Fermer le panneau depuis le navigateur
Le panneau de l'extension SHALL se fermer avec la commande de fermeture du panneau latéral du navigateur.

#### Scenario: Alternatif — Fermer le panneau
- **ÉTANT DONNÉ QUE** le panneau de l'extension est ouvert
- **LORSQUE** l'utilisatrice ferme le panneau latéral avec la commande de fermeture de Dia
- **ALORS** le panneau de l'extension se ferme
- **ET** la page occupe de nouveau toute la largeur de la fenêtre

## REMOVED Requirements

### Requirement: Ouvrir et fermer le panneau par le bouton de l'extension
**Reason**: Chromium n'offre pas l'équivalent de `sidebarAction.toggle()` de Firefox. L'ouverture et la fermeture sont désormais deux exigences distinctes.
**Migration**: Remplacée par « Ouvrir le panneau par le bouton de l'extension » et « Fermer le panneau depuis le navigateur ».
