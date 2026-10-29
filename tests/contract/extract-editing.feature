Feature: Contrat de l'API Notion pour la modification et la suppression d'extraits (US-07, design.md, décisions 2 et 7)

  Background:
    * url notionBaseUrl
    * configure headers = { 'Authorization': '#("Bearer " + notionToken)', 'Notion-Version': '#(notionVersion)' }
    Given path 'databases', notionDatabaseId
    When method get
    Then status 200
    * def dataSourceId = response.data_sources[0].id
    * def today = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE) + ''
    * def itemUrl = 'https://exemple.com/contrat/modification-extraits-' + java.lang.System.currentTimeMillis()
    * def quote = function(text) { return { type: 'quote', quote: { rich_text: [{ type: 'text', text: { content: text } }] } } }
    * def heading2 = function(text) { return { type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: text } }] } } }
    Given path 'pages'
    And request
      """
      {
        "parent": { "type": "data_source_id", "data_source_id": "#(dataSourceId)" },
        "icon": { "type": "emoji", "emoji": "🇬🇧" },
        "properties": {
          "Title": { "title": [{ "text": { "content": "Article avec extraits modifiés" } }] },
          "URL": { "url": "#(itemUrl)" },
          "Date": { "date": { "start": "#(today)" } }
        }
      }
      """
    When method post
    Then status 200
    * def pageId = response.id
    Given path 'blocks', pageId, 'children'
    And request { children: ['#(heading2("Le constat"))', '#(quote("Culture is what poeple do."))'], position: { type: 'end' } }
    When method patch
    Then status 200
    * def quoteId = response.results[1].id

  Scenario: La mise à jour du texte d'une citation renvoie 200, puis le texte lu est le nouveau
    Given path 'blocks', quoteId
    And request { quote: { rich_text: [{ type: 'text', text: { content: "Culture is what people do.\nWhen no one is watching." } }] } }
    When method patch
    Then status 200

    Given path 'blocks', quoteId
    When method get
    Then status 200
    And match response.type == 'quote'
    And match response.quote.rich_text[0].plain_text == "Culture is what people do.\nWhen no one is watching."

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200

  Scenario: La suppression d'une citation renvoie 200, puis elle n'est plus parmi les enfants de la page
    Given path 'blocks', quoteId
    When method delete
    Then status 200

    Given path 'blocks', pageId, 'children'
    When method get
    Then status 200
    And match response.results[*].id !contains quoteId
    And match response.results[*].type == ['heading_2']

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200

  Scenario: La suppression d'un bloc déjà supprimé renvoie 400 ou 404
    Given path 'blocks', quoteId
    When method delete
    Then status 200

    Given path 'blocks', quoteId
    When method delete
    * print 'Statut constaté pour la suppression d\'un bloc déjà supprimé :', responseStatus
    Then assert responseStatus == 400 || responseStatus == 404

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200

  Scenario: La mise à jour d'un bloc supprimé renvoie 400 ou 404
    Given path 'blocks', quoteId
    When method delete
    Then status 200

    Given path 'blocks', quoteId
    And request { quote: { rich_text: [{ type: 'text', text: { content: 'Extrait perdu' } }] } }
    When method patch
    * print 'Statut constaté pour la mise à jour d\'un bloc supprimé :', responseStatus
    Then assert responseStatus == 400 || responseStatus == 404

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200
