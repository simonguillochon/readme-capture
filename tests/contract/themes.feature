Feature: Contrat de l'API Notion pour la lecture des thèmes (design.md, décisions 7 et 10)

  Background:
    * url notionBaseUrl
    * configure headers = { 'Authorization': '#("Bearer " + notionToken)', 'Notion-Version': '#(notionVersion)' }

  Scenario: La source de données expose Theme en multi_select avec des options nommées
    Given path 'databases', notionDatabaseId
    When method get
    Then status 200
    * def dataSourceId = response.data_sources[0].id

    Given path 'data_sources', dataSourceId
    When method get
    Then status 200
    And match response.properties.Theme.type == 'multi_select'
    And match response.properties.Theme.multi_select.options == '#array'
    And match each response.properties.Theme.multi_select.options contains { name: '#string' }
