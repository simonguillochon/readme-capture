import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NotionConfig } from '@/config/notion-config';
import { NOTION_VERSION } from '@/notion/client';
import { DatabaseStructureError, errorMessage } from '@/notion/errors';
import { fetchThemes } from '@/notion/themes';

const DATA_SOURCE_ID = 'fedcba98-7654-3210-fedc-ba9876543210';

const config: NotionConfig = {
  token: 'ntn_exemple123',
  databaseUrl: 'https://www.notion.so/exemple/0123456789abcdef0123456789abcdef',
  databaseId: '0123456789abcdef0123456789abcdef',
  databaseTitle: 'Readme center',
  dataSourceId: DATA_SOURCE_ID,
};

describe('fetchThemes', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renvoie les thèmes dans l’ordre de Notion', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        properties: {
          Theme: { type: 'multi_select', multi_select: { options: [{ name: 'AI Thoughts' }, { name: 'Design' }, { name: 'Management' }] } },
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchThemes(config)).resolves.toEqual(['AI Thoughts', 'Design', 'Management']);
    expect(fetchMock).toHaveBeenCalledWith(`https://api.notion.com/v1/data_sources/${DATA_SOURCE_ID}`, {
      headers: { Authorization: 'Bearer ntn_exemple123', 'Notion-Version': NOTION_VERSION },
    });
  });

  it('échoue quand la propriété Theme est absente', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ properties: { Title: { type: 'title' } } })));

    await expect(fetchThemes(config)).rejects.toBeInstanceOf(DatabaseStructureError);
  });

  it('échoue quand la propriété Theme est d’un autre type', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ properties: { Theme: { type: 'select', select: { options: [] } } } })));

    await expect(fetchThemes(config)).rejects.toBeInstanceOf(DatabaseStructureError);
  });

  it('échoue sans réseau avec le message « Connexion impossible »', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('NetworkError'))));

    const error = await fetchThemes(config).catch((caught: unknown) => caught);
    expect(errorMessage(error)).toBe('Connexion impossible');
  });
});
