Feature: Test témoin

  Scenario: Karate s'exécute sans appel réseau
    * def resultat = 1 + 1
    * match resultat == 2
