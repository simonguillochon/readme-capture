import type { BlockPosition } from '@/capture/extract-placement';
import type { NotionConfig } from '@/config/notion-config';
import { notionDelete, notionPatch, NotionHttpError } from './client';
import { quoteBlock, type ExtractBlock } from './extract-blocks';

interface AppendResponse {
  results: { id: string }[];
}

type QuoteBlock = Extract<ExtractBlock, { type: 'quote' }>;

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

/** Remplace le texte d'une citation, découpé comme à l'ajout (US-07, design.md, décision 2). */
export async function updateQuote(config: NotionConfig, blockId: string, text: string): Promise<void> {
  const { quote } = quoteBlock(text) as QuoteBlock;
  await notionPatch<unknown>(config.token, `blocks/${blockId}`, { quote });
}

/** Supprime un bloc de la page de l'item (US-07, design.md, décision 2). */
export async function deleteBlock(config: NotionConfig, blockId: string): Promise<void> {
  await notionDelete<unknown>(config.token, `blocks/${blockId}`);
}

/**
 * Vrai si l'échec d'une suppression de bloc signifie que le bloc n'existe déjà plus : une réponse 400 ou 404 compte
 * comme une suppression réussie (US-07, design.md, décision 4 ; US-14, décision 3).
 */
export function isAlreadyDeleted(caught: unknown): boolean {
  return caught instanceof NotionHttpError && (caught.status === 400 || caught.status === 404);
}
