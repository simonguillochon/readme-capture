import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NotionConfig } from '@/config/notion-config';
import { NotionHttpError, NotionNetworkError } from '@/notion/client';
import { itemErrorMessage } from '@/notion/errors';
import { headingBlock, quoteBlock } from '@/notion/extract-blocks';
import { appendBlocks, deleteBlock, updateQuote } from '@/notion/extracts';

const PAGE_ID = '11111111-2222-3333-4444-555555555555';

const config: NotionConfig = {
  token: 'ntn_exemple123',
  databaseUrl: 'https://www.notion.so/exemple/0123456789abcdef0123456789abcdef',
  databaseId: '0123456789abcdef0123456789abcdef',
  databaseTitle: 'Readme center',
  dataSourceId: 'fedcba98-7654-3210-fedc-ba9876543210',
};

const blocks = [headingBlock('Le constat', 2), quoteBlock('Culture is what people do when no one is watching.')];

function stubFetch(response: () => Response | Promise<Response>) {
  const fetchMock = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => response());
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('appendBlocks', () => {
  it('ajoute les blocs à la position donnée et renvoie leurs identifiants dans l’ordre', async () => {
    const fetchMock = stubFetch(() => Response.json({ results: [{ id: 'titre' }, { id: 'citation' }] }));
    const position = { type: 'after_block', after_block: { id: 'bloc-precedent' } } as const;

    await expect(appendBlocks(config, PAGE_ID, blocks, position)).resolves.toEqual(['titre', 'citation']);
    const [input, init] = fetchMock.mock.calls[0]!;
    expect(input).toBe(`https://api.notion.com/v1/blocks/${PAGE_ID}/children`);
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(String(init?.body))).toEqual({ children: blocks, position });
  });

  it.each([400, 404])('échoue sur une réponse %i avec le message « Item introuvable dans Notion »', async (status) => {
    stubFetch(() => new Response(null, { status }));

    const error = await appendBlocks(config, PAGE_ID, blocks, { type: 'end' }).catch((caught: unknown) => caught);
    expect(itemErrorMessage(error)).toBe('Item introuvable dans Notion');
  });

  it('échoue sans réseau avec le message « Connexion impossible »', async () => {
    stubFetch(() => Promise.reject(new TypeError('NetworkError')));

    const error = await appendBlocks(config, PAGE_ID, blocks, { type: 'end' }).catch((caught: unknown) => caught);
    expect(itemErrorMessage(error)).toBe('Connexion impossible');
  });
});

describe('updateQuote', () => {
  it('remplace le texte de la citation, sauts de ligne compris', async () => {
    const fetchMock = stubFetch(() => Response.json({ id: 'citation', type: 'quote' }));

    await expect(updateQuote(config, 'citation', 'Culture is what people do.\nWhen no one is watching.')).resolves.toBeUndefined();
    const [input, init] = fetchMock.mock.calls[0]!;
    expect(input).toBe('https://api.notion.com/v1/blocks/citation');
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(String(init?.body))).toEqual({
      quote: { rich_text: [{ type: 'text', text: { content: 'Culture is what people do.\nWhen no one is watching.' } }] },
    });
  });

  it('découpe un texte long comme à l’ajout', async () => {
    const fetchMock = stubFetch(() => Response.json({ id: 'citation', type: 'quote' }));
    const text = 'a'.repeat(2500);

    await updateQuote(config, 'citation', text);
    const [, init] = fetchMock.mock.calls[0]!;
    expect(JSON.parse(String(init?.body))).toEqual({ quote: (quoteBlock(text) as { quote: unknown }).quote });
  });

  it.each([400, 404])('échoue sur une réponse %i avec le message « Item introuvable dans Notion »', async (status) => {
    stubFetch(() => new Response(null, { status }));

    const error = await updateQuote(config, 'citation', 'Texte').catch((caught: unknown) => caught);
    expect(itemErrorMessage(error)).toBe('Item introuvable dans Notion');
  });

  it('échoue sans réseau avec le message « Connexion impossible »', async () => {
    stubFetch(() => Promise.reject(new TypeError('NetworkError')));

    const error = await updateQuote(config, 'citation', 'Texte').catch((caught: unknown) => caught);
    expect(itemErrorMessage(error)).toBe('Connexion impossible');
  });
});

describe('deleteBlock', () => {
  it('supprime le bloc', async () => {
    const fetchMock = stubFetch(() => Response.json({ id: 'citation', in_trash: true }));

    await expect(deleteBlock(config, 'citation')).resolves.toBeUndefined();
    const [input, init] = fetchMock.mock.calls[0]!;
    expect(input).toBe('https://api.notion.com/v1/blocks/citation');
    expect(init?.method).toBe('DELETE');
  });

  it.each([400, 404])('échoue sur une réponse %i avec NotionHttpError et son statut', async (status) => {
    stubFetch(() => new Response(null, { status }));

    const error = await deleteBlock(config, 'citation').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(NotionHttpError);
    expect(error).toMatchObject({ status });
  });

  it('échoue sans réseau avec NotionNetworkError', async () => {
    stubFetch(() => Promise.reject(new TypeError('NetworkError')));

    await expect(deleteBlock(config, 'citation')).rejects.toBeInstanceOf(NotionNetworkError);
  });
});
