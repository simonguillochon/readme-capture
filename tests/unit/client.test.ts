import { afterEach, describe, expect, it, vi } from 'vitest';
import { NOTION_VERSION, NotionHttpError, NotionNetworkError, notionPatch, notionPost } from '@/notion/client';

describe.each([
  ['notionPost', notionPost, 'POST'],
  ['notionPatch', notionPatch, 'PATCH'],
] as const)('%s', (_name, send, method) => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('envoie la méthode, les en-têtes et le corps JSON, et renvoie la réponse', async () => {
    const fetchMock = vi.fn(async () => Response.json({ id: 'page-1' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(send('ntn_exemple123', 'pages/page-1', { in_trash: true })).resolves.toEqual({ id: 'page-1' });
    expect(fetchMock).toHaveBeenCalledWith('https://api.notion.com/v1/pages/page-1', {
      method,
      headers: {
        Authorization: 'Bearer ntn_exemple123',
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: '{"in_trash":true}',
    });
  });

  it('échoue avec NotionNetworkError sans réseau', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('NetworkError'))));

    await expect(send('ntn_exemple123', 'pages', {})).rejects.toBeInstanceOf(NotionNetworkError);
  });

  it('échoue avec NotionHttpError et son statut sur une réponse non réussie', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 401 })));

    await expect(send('ntn_exemple123', 'pages', {})).rejects.toMatchObject({ status: 401 });
    await expect(send('ntn_exemple123', 'pages', {})).rejects.toBeInstanceOf(NotionHttpError);
  });
});
