import type { BlockPosition } from '@/capture/extract-placement';
import type { NotionConfig } from '@/config/notion-config';
import { notionPatch } from './client';
import type { ExtractBlock } from './extract-blocks';

interface AppendResponse {
  results: { id: string }[];
}

/**
 * Ajoute les blocs dans le corps de la page de l'item, à la position donnée, et renvoie les identifiants
 * des blocs créés dans l'ordre de `blocks` (US-06, design.md, décision 6).
 */
export async function appendBlocks(
  config: NotionConfig,
  pageId: string,
  blocks: ExtractBlock[],
  position: BlockPosition,
): Promise<string[]> {
  const { results } = await notionPatch<AppendResponse>(config.token, `blocks/${pageId}/children`, { children: blocks, position });
  return results.map((block) => block.id);
}
