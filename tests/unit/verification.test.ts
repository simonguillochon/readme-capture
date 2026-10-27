import { afterEach, describe, expect, it, vi } from 'vitest';
import { NOTION_VERSION } from '@/notion/client';
import { DatabaseStructureError } from '@/notion/errors';
import { verifyDatabase } from '@/notion/verification';

const DATABASE_ID = '0123456789abcdef0123456789abcdef';
const DATA_SOURCE_ID = 'fedcba98-7654-3210-fedc-ba9876543210';

const validProperties = {
  Title: { type: 'title' },
  URL: { type: 'url' },
  Source: { type: 'rich_text' },
  Date: { type: 'date' },
  Theme: { type: 'multi_select' },
  Description: { type: 'rich_text' },
  Type: { type: 'select' },
};

function mockNotion(database: unknown, properties: unknown = validProperties) {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url.endsWith(`/databases/${DATABASE_ID}`)) return Response.json(database);
    if (url.endsWith(`/data_sources/${DATA_SOURCE_ID}`)) return Response.json({ properties });
    return new Response(null, { status: 404 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const validDatabase = {
  title: [{ plain_text: 'Readme ' }, { plain_text: 'center' }],
  data_sources: [{ id: DATA_SOURCE_ID, name: 'Readme center' }],
};

describe('verifyDatabase', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renvoie le titre et la première source de données pour une base valide', async () => {
    const fetchMock = mockNotion(validDatabase);

    await expect(verifyDatabase('ntn_exemple123', DATABASE_ID)).resolves.toEqual({
      databaseTitle: 'Readme center',
      dataSourceId: DATA_SOURCE_ID,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(1, `https://api.notion.com/v1/databases/${DATABASE_ID}`, {
      headers: { Authorization: 'Bearer ntn_exemple123', 'Notion-Version': NOTION_VERSION },
    });
  });

  it('échoue quand une propriété attendue est absente', async () => {
    const { Theme: _theme, ...withoutTheme } = validProperties;
    mockNotion(validDatabase, withoutTheme);

    await expect(verifyDatabase('ntn_exemple123', DATABASE_ID)).rejects.toBeInstanceOf(DatabaseStructureError);
  });

  it('échoue quand une propriété attendue est d’un autre type', async () => {
    mockNotion(validDatabase, { ...validProperties, Date: { type: 'rich_text' } });

    await expect(verifyDatabase('ntn_exemple123', DATABASE_ID)).rejects.toBeInstanceOf(DatabaseStructureError);
  });

  it('échoue quand la base n’a aucune source de données', async () => {
    const fetchMock = mockNotion({ ...validDatabase, data_sources: [] });

    await expect(verifyDatabase('ntn_exemple123', DATABASE_ID)).rejects.toBeInstanceOf(DatabaseStructureError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
