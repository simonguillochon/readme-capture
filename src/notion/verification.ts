import { notionGet } from './client';
import { DatabaseStructureError, errorMessage, type ErrorMessage } from './errors';
import { withRateLimitRetry } from './retry';

interface DatabaseResponse {
  title: { plain_text: string }[];
  data_sources: { id: string; name: string }[];
}

interface DataSourceResponse {
  properties: Record<string, { type: string }>;
}

export const EXPECTED_PROPERTIES: Record<string, string> = {
  Title: 'title',
  URL: 'url',
  Source: 'rich_text',
  Date: 'date',
  Theme: 'multi_select',
  Description: 'rich_text',
  'LinkedIn auteur': 'url',
};

export interface VerifiedDatabase {
  databaseTitle: string;
  dataSourceId: string;
}

/** Vérifie la base en deux appels : la base, puis sa première source de données (design.md, décision 6). */
export async function verifyDatabase(token: string, databaseId: string): Promise<VerifiedDatabase> {
  const database = await notionGet<DatabaseResponse>(token, `databases/${databaseId}`);
  const dataSource = database.data_sources[0];
  if (!dataSource) {
    throw new DatabaseStructureError('La base n’a aucune source de données');
  }

  const { properties } = await notionGet<DataSourceResponse>(token, `data_sources/${dataSource.id}`);
  for (const [name, type] of Object.entries(EXPECTED_PROPERTIES)) {
    if (properties[name]?.type !== type) {
      throw new DatabaseStructureError(`Propriété ${name} absente ou d’un autre type que ${type}`);
    }
  }

  return {
    databaseTitle: database.title.map((part) => part.plain_text).join(''),
    dataSourceId: dataSource.id,
  };
}

/** Échec de la vérification, avec le message à afficher. */
export class VerificationError extends Error {
  constructor(override readonly message: ErrorMessage) {
    super(message);
  }
}

/**
 * Vérifie la connexion et relance la vérification après le délai indiqué par Notion en cas de limitation.
 * `onRateLimited` est appelé avant chaque attente, pour afficher « Notion limite les appels ».
 */
export async function verifyConnection(
  token: string,
  databaseId: string,
  onRateLimited: () => void = () => {},
): Promise<VerifiedDatabase> {
  try {
    return await withRateLimitRetry(() => verifyDatabase(token, databaseId), onRateLimited);
  } catch (error) {
    throw new VerificationError(errorMessage(error));
  }
}
