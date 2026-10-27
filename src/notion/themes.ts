import type { NotionConfig } from '@/config/notion-config';
import { notionGet } from './client';
import { DatabaseStructureError } from './errors';

interface DataSourceResponse {
  properties: Record<string, { type: string; multi_select?: { options: { name: string }[] } }>;
}

/** Noms des options de la propriété Theme, dans l'ordre de Notion (design.md, décision 7). */
export async function fetchThemes(config: NotionConfig): Promise<string[]> {
  const { properties } = await notionGet<DataSourceResponse>(config.token, `data_sources/${config.dataSourceId}`);
  const theme = properties.Theme;
  if (theme?.type !== 'multi_select' || !theme.multi_select) {
    throw new DatabaseStructureError('Propriété Theme absente ou d’un autre type que multi_select');
  }
  return theme.multi_select.options.map((option) => option.name);
}
