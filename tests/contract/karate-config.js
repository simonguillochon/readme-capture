function fn() {
  var System = Java.type('java.lang.System');
  return {
    notionBaseUrl: 'https://api.notion.com/v1',
    notionVersion: '2025-09-03',
    notionToken: System.getenv('NOTION_TEST_TOKEN'),
    notionDatabaseId: System.getenv('NOTION_TEST_DATABASE_ID')
  };
}
