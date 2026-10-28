export type HeadingLevel = 1 | 2 | 3;

const MAX_TEXT_LENGTH = 2000;

type RichText = { type: 'text'; text: { content: string } }[];

export type ExtractBlock =
  | { type: 'heading_1'; heading_1: { rich_text: RichText } }
  | { type: 'heading_2'; heading_2: { rich_text: RichText } }
  | { type: 'heading_3'; heading_3: { rich_text: RichText } }
  | { type: 'quote'; quote: { rich_text: RichText } };

/**
 * Découpe le texte en morceaux de 2000 caractères au plus, un objet `text` par morceau, sans annotation
 * (US-06, design.md, décision 5). Un caractère hors du plan de base (emoji) n'est jamais coupé en deux.
 */
function richText(content: string): RichText {
  const chunks: string[] = [];
  let chunk = '';
  for (const character of content) {
    if (chunk.length + character.length > MAX_TEXT_LENGTH) {
      chunks.push(chunk);
      chunk = '';
    }
    chunk += character;
  }
  chunks.push(chunk);
  return chunks.map((part) => ({ type: 'text', text: { content: part } }));
}

/** Bloc titre d'une section, au niveau choisi (US-06, design.md, décision 5). */
export function headingBlock(title: string, level: HeadingLevel): ExtractBlock {
  const rich_text = richText(title);
  if (level === 1) return { type: 'heading_1', heading_1: { rich_text } };
  if (level === 2) return { type: 'heading_2', heading_2: { rich_text } };
  return { type: 'heading_3', heading_3: { rich_text } };
}

/** Bloc citation d'un extrait ; les sauts de ligne sont conservés tels quels (US-06, design.md, décision 5). */
export function quoteBlock(text: string): ExtractBlock {
  return { type: 'quote', quote: { rich_text: richText(text) } };
}
