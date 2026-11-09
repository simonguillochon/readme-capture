# Spec Delta

## MODIFIED Requirements

### Requirement: Conserver la configuration localement
L'extension SHALL stocker le jeton, l'URL et l'identifiant de la base uniquement dans son stockage local, et ne les transmettre qu'à l'API Notion.

#### Scenario: Nominal — Configuration conservée après redémarrage
- **ÉTANT DONNÉ QUE** l'utilisatrice a enregistré une configuration vérifiée
- **LORSQUE** elle redémarre Dia et rouvre la page d'options
- **ALORS** la configuration enregistrée est toujours présente
