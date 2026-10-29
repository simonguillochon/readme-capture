Feature: Contrat de l'API Notion pour la description d'un item (US-08, design.md, décisions 5 et 8)

  Background:
    * url notionBaseUrl
    * configure headers = { 'Authorization': '#("Bearer " + notionToken)', 'Notion-Version': '#(notionVersion)' }
    Given path 'databases', notionDatabaseId
    When method get
    Then status 200
    * def dataSourceId = response.data_sources[0].id
    * def today = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE) + ''
    * def uniqueUrl = function(slug) { return 'https://exemple.com/contrat/' + slug + '-' + java.lang.System.currentTimeMillis() }

  Scenario: Une description de 2000 caractères avec un saut de ligne est enregistrée telle quelle
    * def itemUrl = uniqueUrl('description')
    Given path 'pages'
    And request
      """
      {
        "parent": { "type": "data_source_id", "data_source_id": "#(dataSourceId)" },
        "icon": { "type": "emoji", "emoji": "🇫🇷" },
        "properties": {
          "Title": { "title": [{ "text": { "content": "Article avec description" } }] },
          "URL": { "url": "#(itemUrl)" },
          "Date": { "date": { "start": "#(today)" } }
        }
      }
      """
    When method post
    Then status 200
    * def pageId = response.id

    * def text = 'a'.repeat(999) + '\n' + 'b'.repeat(1000)
    * match text.length == 2000
    Given path 'pages', pageId
    And request { properties: { Description: { rich_text: [{ text: { content: '#(text)' } }] } } }
    When method patch
    Then status 200
    And match response.properties.Description.rich_text == '#[1]'
    And match response.properties.Description.rich_text[0].plain_text == text

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200
    And match response.in_trash == true

  Scenario: Une description vide efface la description de l'item
    * def itemUrl = uniqueUrl('description-vide')
    Given path 'pages'
    And request
      """
      {
        "parent": { "type": "data_source_id", "data_source_id": "#(dataSourceId)" },
        "icon": { "type": "emoji", "emoji": "🇫🇷" },
        "properties": {
          "Title": { "title": [{ "text": { "content": "Article à la description effacée" } }] },
          "URL": { "url": "#(itemUrl)" },
          "Date": { "date": { "start": "#(today)" } },
          "Description": { "rich_text": [{ "text": { "content": "Première version." } }] }
        }
      }
      """
    When method post
    Then status 200
    * def pageId = response.id

    Given path 'pages', pageId
    And request { properties: { Description: { rich_text: [] } } }
    When method patch
    Then status 200
    And match response.properties.Description.rich_text == []

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200
    And match response.in_trash == true
