Feature: Contrat de l'API Notion pour la vérification de la connexion (design.md, décisions 6 et 8)

  Background:
    * url notionBaseUrl
    * configure headers = { 'Authorization': '#("Bearer " + notionToken)', 'Notion-Version': '#(notionVersion)' }

  Scenario: Un jeton valide et l'ID de la base de test renvoient le titre et au moins une source de données
    Given path 'databases', notionDatabaseId
    When method get
    Then status 200
    And match response.title[0].plain_text == 'Readme center (tests)'
    And match response.data_sources == '#[_ > 0]'
    And match each response.data_sources == { id: '#string', name: '#string' }

  Scenario: La source de données expose les six propriétés attendues avec leurs types
    Given path 'databases', notionDatabaseId
    When method get
    Then status 200
    * def dataSourceId = response.data_sources[0].id

    Given path 'data_sources', dataSourceId
    When method get
    Then status 200
    And match response.properties.Title.type == 'title'
    And match response.properties.URL.type == 'url'
    And match response.properties.Source.type == 'rich_text'
    And match response.properties.Date.type == 'date'
    And match response.properties.Theme.type == 'multi_select'
    And match response.properties.Description.type == 'rich_text'

  Scenario: Un jeton invalide renvoie 401
    * configure headers = { 'Authorization': 'Bearer ntn_jeton_invalide', 'Notion-Version': '#(notionVersion)' }
    Given path 'databases', notionDatabaseId
    When method get
    Then status 401

  Scenario: Un identifiant de base inconnu renvoie 404
    Given path 'databases', '00000000000000000000000000000000'
    When method get
    Then status 404
