export const NOTION_VERSION = '2025-09-03';

const NOTION_API_URL = 'https://api.notion.com/v1';

/** `fetch` a rejeté la requête : pas de réseau. */
export class NotionNetworkError extends Error {}

/** Réponse HTTP non réussie de l'API Notion. */
export class NotionHttpError extends Error {
  constructor(
    readonly status: number,
    readonly retryAfter: string | null,
  ) {
    super(`Notion a répondu ${status}`);
  }
}

/** Appel GET à l'API Notion. */
export async function notionGet<T>(token: string, path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${NOTION_API_URL}/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
      },
    });
  } catch {
    throw new NotionNetworkError('Requête vers Notion impossible');
  }
  if (!response.ok) {
    throw new NotionHttpError(response.status, response.headers.get('Retry-After'));
  }
  return (await response.json()) as T;
}

/** Appel POST à l'API Notion, avec un corps JSON. */
export function notionPost<T>(token: string, path: string, body: unknown): Promise<T> {
  return notionSend<T>('POST', token, path, body);
}

/** Appel PATCH à l'API Notion, avec un corps JSON. */
export function notionPatch<T>(token: string, path: string, body: unknown): Promise<T> {
  return notionSend<T>('PATCH', token, path, body);
}

/** Appel DELETE à l'API Notion. */
export function notionDelete<T>(token: string, path: string): Promise<T> {
  return notionSend<T>('DELETE', token, path, undefined);
}

async function notionSend<T>(method: 'POST' | 'PATCH' | 'DELETE', token: string, path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${NOTION_API_URL}/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new NotionNetworkError('Requête vers Notion impossible');
  }
  if (!response.ok) {
    throw new NotionHttpError(response.status, response.headers.get('Retry-After'));
  }
  return (await response.json()) as T;
}
