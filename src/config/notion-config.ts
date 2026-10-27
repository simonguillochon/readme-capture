export interface NotionConfig {
  token: string;
  databaseUrl: string;
  databaseId: string;
  databaseTitle: string;
  dataSourceId: string;
}

const STORAGE_KEY = 'notionConfig';

/** Lit la configuration enregistrée, ou `null` si aucune connexion n'a été enregistrée. */
export async function readNotionConfig(): Promise<NotionConfig | null> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return (stored[STORAGE_KEY] as NotionConfig | undefined) ?? null;
}

/** Enregistre la configuration en une seule opération, en remplaçant la précédente. */
export async function writeNotionConfig(config: NotionConfig): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: config });
}
