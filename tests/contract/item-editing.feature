Feature: Contrat de l'API Notion pour la modification d'un item (US-05, design.md, décisions 4, 5, 6 et 9)

  Background:
    * url notionBaseUrl
    * configure headers = { 'Authorization': '#("Bearer " + notionToken)', 'Notion-Version': '#(notionVersion)' }
    Given path 'databases', notionDatabaseId
    When method get
    Then status 200
    * def dataSourceId = response.data_sources[0].id
    * def today = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE) + ''
    * def uniqueUrl = function(slug) { return 'https://exemple.com/contrat/' + slug + '-' + java.lang.System.currentTimeMillis() }

  Scenario: Une page modifiée renvoie les nouvelles valeurs et garde sa Date
    * def itemUrl = uniqueUrl('modification')
    Given path 'pages'
    And request
      """
      {
        "parent": { "type": "data_source_id", "data_source_id": "#(dataSourceId)" },
        "icon": { "type": "emoji", "emoji": "🇬🇧" },
        "properties": {
          "Title": { "title": [{ "text": { "content": "What a workplace can't promise" } }] },
          "URL": { "url": "#(itemUrl)" },
          "Source": { "rich_text": [{ "text": { "content": "C. Martin" } }] },
          "Date": { "date": { "start": "#(today)" } },
          "Theme": { "multi_select": [{ "name": "Management" }, { "name": "Strategy" }] },
          "LinkedIn auteur": { "url": "https://www.linkedin.com/in/camille-martin-exemple" }
        }
      }
      """
    When method post
    Then status 200
    * def pageId = response.id

    Given path 'pages', pageId
    And request
      """
      {
        "icon": { "type": "emoji", "emoji": "🇫🇷" },
        "properties": {
          "Title": { "title": [{ "text": { "content": "TBM 444 — What a workplace can't promise" } }] },
          "Source": { "rich_text": [{ "text": { "content": "Camille Martin" } }] },
          "Theme": { "multi_select": [{ "name": "Management" }, { "name": "Design" }] },
          "LinkedIn auteur": { "url": null }
        }
      }
      """
    When method patch
    Then status 200
    And match response.icon == { type: 'emoji', emoji: '🇫🇷' }
    And match response.properties.Title.title[0].plain_text == "TBM 444 — What a workplace can't promise"
    And match response.properties.Source.rich_text[0].plain_text == 'Camille Martin'
    And match response.properties.Theme.multi_select[*].name == ['Management', 'Design']
    And match response.properties['LinkedIn auteur'].url == null
    And match response.properties.URL.url == itemUrl
    And match response.properties.Date.date.start == today

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200
    And match response.in_trash == true

  Scenario: La modification d'une page mise à la corbeille renvoie 400 validation_error
    * def itemUrl = uniqueUrl('corbeille')
    Given path 'pages'
    And request
      """
      {
        "parent": { "type": "data_source_id", "data_source_id": "#(dataSourceId)" },
        "icon": { "type": "emoji", "emoji": "🇬🇧" },
        "properties": {
          "Title": { "title": [{ "text": { "content": "Article mis à la corbeille" } }] },
          "URL": { "url": "#(itemUrl)" },
          "Date": { "date": { "start": "#(today)" } }
        }
      }
      """
    When method post
    Then status 200
    * def pageId = response.id

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200
    And match response.in_trash == true

    Given path 'pages', pageId
    And request { properties: { Title: { title: [{ text: { content: 'Titre corrigé' } }] } } }
    When method patch
    Then status 400
    And match response.code == 'validation_error'
