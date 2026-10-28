import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CaptureFormState } from '@/capture/form-validation';
import type { NotionConfig } from '@/config/notion-config';
import { errorMessage, itemErrorMessage } from '@/notion/errors';
import { buildCreatePageBody, buildUpdatePageBody } from '@/notion/item-payload';
import { createItem, findItemByUrl, updateItem } from '@/notion/items';

const DATA_SOURCE_ID = 'fedcba98-7654-3210-fedc-ba9876543210';
const PAGE_ID = '11111111-2222-3333-4444-555555555555';
const PAGE_URL = 'https://www.notion.so/Un-article-11111111222233334444555555555555';

const config: NotionConfig = {
  token: 'ntn_exemple123',
  databaseUrl: 'https://www.notion.so/exemple/0123456789abcdef0123456789abcdef',
  databaseId: '0123456789abcdef0123456789abcdef',
  databaseTitle: 'Readme center',
  dataSourceId: DATA_SOURCE_ID,
};

const form: CaptureFormState = {
  title: 'Un article',
  url: 'https://exemple.com/blog/un-article',
  author: 'Camille Martin',
  authorLinkedin: '',
  language: 'fr',
  themes: ['Management'],
};

function stubFetch(response: () => Response | Promise<Response>) {
  const fetchMock = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => response());
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createItem', () => {
  it('crée la page datée du jour local et renvoie son id et son url', async () => {
    const fetchMock = stubFetch(() => Response.json({ id: PAGE_ID, url: PAGE_URL }));

    await expect(createItem(config, form, new Date(2026, 9, 27, 23, 30))).resolves.toEqual({ id: PAGE_ID, url: PAGE_URL });
    const [input, init] = fetchMock.mock.calls[0]!;
    expect(input).toBe('https://api.notion.com/v1/pages');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual(buildCreatePageBody(form, DATA_SOURCE_ID, '2026-10-27'));
  });

  it('échoue sans réseau avec le message « Connexion impossible »', async () => {
    stubFetch(() => Promise.reject(new TypeError('NetworkError')));

    const error = await createItem(config, form, new Date()).catch((caught: unknown) => caught);
    expect(errorMessage(error)).toBe('Connexion impossible');
  });

  it('échoue sur une réponse 401 avec le message « Jeton Notion invalide »', async () => {
    stubFetch(() => new Response(null, { status: 401 }));

    const error = await createItem(config, form, new Date()).catch((caught: unknown) => caught);
    expect(errorMessage(error)).toBe('Jeton Notion invalide');
  });
});

describe('findItemByUrl', () => {
  it('renvoie l’url de la page du premier résultat', async () => {
    const fetchMock = stubFetch(() => Response.json({ results: [{ id: PAGE_ID, url: PAGE_URL }] }));

    await expect(findItemByUrl(config, form.url)).resolves.toBe(PAGE_URL);
    const [input, init] = fetchMock.mock.calls[0]!;
    expect(input).toBe(`https://api.notion.com/v1/data_sources/${DATA_SOURCE_ID}/query`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      filter: { property: 'URL', url: { equals: 'https://exemple.com/blog/un-article' } },
      page_size: 1,
    });
  });

  it('renvoie null quand aucun item n’a cette URL', async () => {
    stubFetch(() => Response.json({ results: [] }));

    await expect(findItemByUrl(config, form.url)).resolves.toBeNull();
  });

  it('échoue sans réseau avec le message « Connexion impossible »', async () => {
    stubFetch(() => Promise.reject(new TypeError('NetworkError')));

    const error = await findItemByUrl(config, form.url).catch((caught: unknown) => caught);
    expect(errorMessage(error)).toBe('Connexion impossible');
  });

  it('échoue sur une réponse 401 avec le message « Jeton Notion invalide »', async () => {
    stubFetch(() => new Response(null, { status: 401 }));

    const error = await findItemByUrl(config, form.url).catch((caught: unknown) => caught);
    expect(errorMessage(error)).toBe('Jeton Notion invalide');
  });
});

describe('updateItem', () => {
  const body = buildUpdatePageBody(form, { ...form, author: 'C. Martin', language: 'en' });

  it('envoie la modification de la page', async () => {
    const fetchMock = stubFetch(() => Response.json({ id: PAGE_ID, url: PAGE_URL }));

    await expect(updateItem(config, PAGE_ID, body)).resolves.toBeUndefined();
    const [input, init] = fetchMock.mock.calls[0]!;
    expect(input).toBe(`https://api.notion.com/v1/pages/${PAGE_ID}`);
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(String(init?.body))).toEqual(body);
  });

  it('échoue sur une réponse 404 avec le message « Item introuvable dans Notion »', async () => {
    stubFetch(() => new Response(null, { status: 404 }));

    const error = await updateItem(config, PAGE_ID, body).catch((caught: unknown) => caught);
    expect(itemErrorMessage(error)).toBe('Item introuvable dans Notion');
  });

  it('échoue sans réseau avec le message « Connexion impossible »', async () => {
    stubFetch(() => Promise.reject(new TypeError('NetworkError')));

    const error = await updateItem(config, PAGE_ID, body).catch((caught: unknown) => caught);
    expect(itemErrorMessage(error)).toBe('Connexion impossible');
  });
});
