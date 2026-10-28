Feature: Contrat de l'API Notion pour l'ajout d'extraits dans le corps d'un item (US-06, design.md, décisions 5, 6 et 8)

  Background:
    * url notionBaseUrl
    * configure headers = { 'Authorization': '#("Bearer " + notionToken)', 'Notion-Version': '#(notionVersion)' }
    Given path 'databases', notionDatabaseId
    When method get
    Then status 200
    * def dataSourceId = response.data_sources[0].id
    * def today = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE) + ''
    * def itemUrl = 'https://exemple.com/contrat/extraits-' + java.lang.System.currentTimeMillis()
    * def quote = function(text) { return { type: 'quote', quote: { rich_text: [{ type: 'text', text: { content: text } }] } } }
    * def heading2 = function(text) { return { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: text } }] } } }
    Given path 'pages'
    And request
      """
      {
        "parent": { "type": "data_source_id", "data_source_id": "#(dataSourceId)" },
        "icon": { "type": "emoji", "emoji": "🇬🇧" },
        "properties": {
          "Title": { "title": [{ "text": { "content": "Article avec extraits" } }] },
          "URL": { "url": "#(itemUrl)" },
          "Date": { "date": { "start": "#(today)" } }
        }
      }
      """
    When method post
    Then status 200
    * def pageId = response.id

  Scenario: Un titre et une citation ajoutés en fin de page renvoient deux identifiants, dans l'ordre
    Given path 'blocks', pageId, 'children'
    And request { children: ['#(heading2("Le constat"))', '#(quote("Culture is what people do when no one is watching."))'], position: { type: 'end' } }
    When method patch
    Then status 200
    And match response.results == '#[2]'
    And match response.results[0].type == 'heading_2'
    And match response.results[1].type == 'quote'
    And match response.results[1].quote.rich_text[0].plain_text == 'Culture is what people do when no one is watching.'

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200

  Scenario: Une citation ajoutée après un bloc donné est placée juste après lui
    Given path 'blocks', pageId, 'children'
    And request { children: ['#(heading2("Le constat"))', '#(quote("Première citation"))', '#(heading2("Les leviers"))'], position: { type: 'end' } }
    When method patch
    Then status 200
    * def firstQuoteId = response.results[1].id

    Given path 'blocks', pageId, 'children'
    And request { children: ['#(quote("Deuxième citation"))'], position: { type: 'after_block', after_block: { id: '#(firstQuoteId)' } } }
    When method patch
    Then status 200
    * def insertedId = response.results[0].id

    Given path 'blocks', pageId, 'children'
    When method get
    Then status 200
    And match response.results[*].type == ['heading_2', 'quote', 'quote', 'heading_2']
    And match response.results[2].id == insertedId

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200

  Scenario: Une citation ajoutée en début de page devient le premier enfant
    Given path 'blocks', pageId, 'children'
    And request { children: ['#(heading2("Le constat"))'], position: { type: 'end' } }
    When method patch
    Then status 200

    Given path 'blocks', pageId, 'children'
    And request { children: ['#(quote("Extrait sans section"))'], position: { type: 'start' } }
    When method patch
    Then status 200
    * def insertedId = response.results[0].id

    Given path 'blocks', pageId, 'children'
    When method get
    Then status 200
    And match response.results[0].id == insertedId
    And match response.results[*].type == ['quote', 'heading_2']

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200

  Scenario: Un ajout sur un item mis à la corbeille renvoie 400 ou 404
    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200

    Given path 'blocks', pageId, 'children'
    And request { children: ['#(quote("Extrait perdu"))'], position: { type: 'end' } }
    When method patch
    Then assert responseStatus == 400 || responseStatus == 404
