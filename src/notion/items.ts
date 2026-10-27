import type { CaptureFormState } from '@/capture/form-validation';
import type { NotionConfig } from '@/config/notion-config';
import { notionPost } from './client';
import { buildCreatePageBody, localDate } from './item-payload';

interface PageResponse {
  id: string;
  url: string;
}

interface QueryResponse {
  results: PageResponse[];
}

export interface CreatedItem {
  id: string;
  url: string;
}

/** Crée l'item dans Readme center, daté du jour de `now` (design.md, décision 5). */
export async function createItem(config: NotionConfig, form: CaptureFormState, now: Date): Promise<CreatedItem> {
  const page = await notionPost<PageResponse>(
    config.token,
    'pages',
    buildCreatePageBody(form, config.dataSourceId, localDate(now)),
  );
  return { id: page.id, url: page.url };
}

/** URL de la page du premier item dont l'URL est exactement `url`, ou `null` (design.md, décision 6). */
export async function findItemByUrl(config: NotionConfig, url: string): Promise<string | null> {
  const { results } = await notionPost<QueryResponse>(config.token, `data_sources/${config.dataSourceId}/query`, {
    filter: { property: 'URL', url: { equals: url } },
    page_size: 1,
  });
  return results[0]?.url ?? null;
}
