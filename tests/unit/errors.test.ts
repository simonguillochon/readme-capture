import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MESSAGES } from '@/notion/errors';
import { verifyConnection } from '@/notion/verification';

const DATABASE_ID = '0123456789abcdef0123456789abcdef';
const DATA_SOURCE_ID = 'fedcba98-7654-3210-fedc-ba9876543210';

const database = {
  title: [{ plain_text: 'Readme center' }],
  data_sources: [{ id: DATA_SOURCE_ID, name: 'Readme center' }],
};
const properties = {
  Title: { type: 'title' },
  URL: { type: 'url' },
  Source: { type: 'rich_text' },
  Date: { type: 'date' },
  Theme: { type: 'multi_select' },
  Description: { type: 'rich_text' },
  'LinkedIn auteur': { type: 'url' },
};

function okResponse(input: string | URL | Request): Response {
  return String(input).includes('/data_sources/') ? Response.json({ properties }) : Response.json(database);
}

/** Simule Notion : chaque appel consomme la réponse suivante de la liste, puis répond normalement. */
function mockNotion(...responses: (Response | Error)[]) {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return next ?? okResponse(input);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const status = (code: number, headers?: Record<string, string>) => new Response(null, { status: code, headers });

describe('correspondance des erreurs', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['fetch rejette (pas de réseau)', () => new TypeError('NetworkError'), MESSAGES.network],
    ['HTTP 401', () => status(401), MESSAGES.invalidToken],
    ['HTTP 403', () => status(403), MESSAGES.inaccessibleDatabase],
    ['HTTP 404', () => status(404), MESSAGES.inaccessibleDatabase],
    ['HTTP 500', () => status(500), MESSAGES.unavailable],
    ['HTTP 503', () => status(503), MESSAGES.unavailable],
    ['autre 4xx (400)', () => status(400), MESSAGES.inaccessibleDatabase],
    ['réponse illisible', () => new Response('<html>', { status: 200 }), MESSAGES.inaccessibleDatabase],
  ])('%s', async (_cas, response, message) => {
    mockNotion(response());

    await expect(verifyConnection('ntn_exemple123', DATABASE_ID)).rejects.toThrow(message);
  });

  it('propriété absente', async () => {
    const { Theme: _theme, ...withoutTheme } = properties;
    mockNotion(Response.json(database), Response.json({ properties: withoutTheme }));

    await expect(verifyConnection('ntn_exemple123', DATABASE_ID)).rejects.toThrow(MESSAGES.changedDatabase);
  });

  it('base sans source de données', async () => {
    mockNotion(Response.json({ ...database, data_sources: [] }));

    await expect(verifyConnection('ntn_exemple123', DATABASE_ID)).rejects.toThrow(MESSAGES.changedDatabase);
  });
});

describe('réessai après limitation (HTTP 429)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('signale la limitation puis relance la vérification après 2 secondes', async () => {
    const fetchMock = mockNotion(status(429, { 'Retry-After': '2' }));
    const onRateLimited = vi.fn();

    const verification = verifyConnection('ntn_exemple123', DATABASE_ID, onRateLimited);
    await vi.advanceTimersByTimeAsync(1999);
    expect(onRateLimited).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await expect(verification).resolves.toEqual({ databaseTitle: 'Readme center', dataSourceId: DATA_SOURCE_ID });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('attend 1 seconde quand Retry-After est absent', async () => {
    const fetchMock = mockNotion(status(429));

    const verification = verifyConnection('ntn_exemple123', DATABASE_ID);
    await vi.advanceTimersByTimeAsync(999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await expect(verification).resolves.toBeDefined();
  });

  it('abandonne avec « Notion limite les appels » après 3 réessais', async () => {
    const limited = () => status(429, { 'Retry-After': '1' });
    const fetchMock = mockNotion(limited(), limited(), limited(), limited());
    const onRateLimited = vi.fn();

    const verification = verifyConnection('ntn_exemple123', DATABASE_ID, onRateLimited);
    const assertion = expect(verification).rejects.toThrow(MESSAGES.rateLimited);
    await vi.advanceTimersByTimeAsync(3000);
    await assertion;
    expect(onRateLimited).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
