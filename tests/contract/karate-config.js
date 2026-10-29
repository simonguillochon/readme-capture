function fn() {
  var System = Java.type('java.lang.System');
  var notionToken = System.getenv('NOTION_TEST_TOKEN');
  var notionDatabaseId = System.getenv('NOTION_TEST_DATABASE_ID');
  if (!notionToken || !notionDatabaseId) {
    karate.fail('Secrets des tests de contrat indisponibles');
  }
  return {
    notionBaseUrl: 'https://api.notion.com/v1',
    notionVersion: '2025-09-03',
    notionToken: notionToken,
    notionDatabaseId: notionDatabaseId
  };
}
