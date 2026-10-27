Feature: Contrat de l'API Notion pour la création d'un item et la recherche de doublon (design.md, décisions 3, 6 et 9)

  Background:
    * url notionBaseUrl
    * configure headers = { 'Authorization': '#("Bearer " + notionToken)', 'Notion-Version': '#(notionVersion)' }
    Given path 'databases', notionDatabaseId
    When method get
    Then status 200
    * def dataSourceId = response.data_sources[0].id
    * def today = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE) + ''
    * def uniqueUrl = function(slug) { return 'https://exemple.com/contrat/' + slug + '-' + java.lang.System.currentTimeMillis() }

  Scenario: Une page créée avec toutes les propriétés les renvoie avec l'icône envoyée
    * def itemUrl = uniqueUrl('item-complet')
    Given path 'pages'
    And request
      """
      {
        "parent": { "type": "data_source_id", "data_source_id": "#(dataSourceId)" },
        "icon": { "type": "emoji", "emoji": "🇬🇧" },
        "properties": {
          "Title": { "title": [{ "text": { "content": "Article de contrat" } }] },
          "URL": { "url": "#(itemUrl)" },
          "Source": { "rich_text": [{ "text": { "content": "Camille Martin" } }] },
          "Date": { "date": { "start": "#(today)" } },
          "Theme": { "multi_select": [{ "name": "Management" }, { "name": "Strategy" }] },
          "LinkedIn auteur": { "url": "https://www.linkedin.com/in/camille-martin-exemple" }
        }
      }
      """
    When method post
    Then status 200
    * def pageId = response.id
    And match response.url == '#string'
    And match response.icon == { type: 'emoji', emoji: '🇬🇧' }
    And match response.properties.Title.title[0].plain_text == 'Article de contrat'
    And match response.properties.URL.url == itemUrl
    And match response.properties.Source.rich_text[0].plain_text == 'Camille Martin'
    And match response.properties.Date.date.start == today
    And match response.properties.Theme.multi_select[*].name == ['Management', 'Strategy']
    And match response.properties['LinkedIn auteur'].url == 'https://www.linkedin.com/in/camille-martin-exemple'

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200
    And match response.in_trash == true

  Scenario: Une page créée sans LinkedIn auteur a cette propriété à null
    * def itemUrl = uniqueUrl('sans-linkedin')
    Given path 'pages'
    And request
      """
      {
        "parent": { "type": "data_source_id", "data_source_id": "#(dataSourceId)" },
        "icon": { "type": "emoji", "emoji": "🇫🇷" },
        "properties": {
          "Title": { "title": [{ "text": { "content": "Article sans profil" } }] },
          "URL": { "url": "#(itemUrl)" },
          "Source": { "rich_text": [{ "text": { "content": "Camille Martin" } }] },
          "Date": { "date": { "start": "#(today)" } },
          "Theme": { "multi_select": [] }
        }
      }
      """
    When method post
    Then status 200
    * def pageId = response.id
    And match response.properties['LinkedIn auteur'].url == null

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200
    And match response.in_trash == true

  Scenario: La requête filtrée sur l'URL d'un item créé le renvoie en premier résultat, avec un champ url
    * def itemUrl = uniqueUrl('doublon')
    Given path 'pages'
    And request
      """
      {
        "parent": { "type": "data_source_id", "data_source_id": "#(dataSourceId)" },
        "icon": { "type": "emoji", "emoji": "🇪🇸" },
        "properties": {
          "Title": { "title": [{ "text": { "content": "Article en double" } }] },
          "URL": { "url": "#(itemUrl)" },
          "Date": { "date": { "start": "#(today)" } }
        }
      }
      """
    When method post
    Then status 200
    * def pageId = response.id
    * def pageUrl = response.url

    Given path 'data_sources', dataSourceId, 'query'
    And request { filter: { property: 'URL', url: { equals: '#(itemUrl)' } }, page_size: 1 }
    When method post
    Then status 200
    And match response.results[0].id == pageId
    And match response.results[0].url == pageUrl

    Given path 'pages', pageId
    And request { in_trash: true }
    When method patch
    Then status 200
    And match response.in_trash == true

  Scenario: La requête filtrée sur une URL absente renvoie une liste vide
    * def absentUrl = uniqueUrl('absente')
    Given path 'data_sources', dataSourceId, 'query'
    And request { filter: { property: 'URL', url: { equals: '#(absentUrl)' } }, page_size: 1 }
    When method post
    Then status 200
    And match response.results == []
