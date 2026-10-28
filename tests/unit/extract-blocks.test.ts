import { describe, expect, it } from 'vitest';
import { headingBlock, quoteBlock } from '@/notion/extract-blocks';

const text = (content: string) => ({ type: 'text', text: { content } });

describe('headingBlock', () => {
  it.each([
    [1, 'heading_1'],
    [2, 'heading_2'],
    [3, 'heading_3'],
  ] as const)('construit un titre de niveau %i', (level, type) => {
    expect(headingBlock('Le constat', level)).toEqual({ type, [type]: { rich_text: [text('Le constat')] } });
  });
});

describe('quoteBlock', () => {
  it('construit une citation sans annotation', () => {
    expect(quoteBlock('Culture is what people do when no one is watching.')).toEqual({
      type: 'quote',
      quote: { rich_text: [text('Culture is what people do when no one is watching.')] },
    });
  });

  it('découpe une citation de 4500 caractères en 3 morceaux', () => {
    const block = quoteBlock('a'.repeat(4500));
    if (block.type !== 'quote') throw new Error('citation attendue');
    expect(block.quote.rich_text.map((part) => part.text.content.length)).toEqual([2000, 2000, 500]);
  });

  it('ne coupe jamais un emoji entre deux morceaux', () => {
    const block = quoteBlock(`${'a'.repeat(1999)}🇫🇷b`);
    if (block.type !== 'quote') throw new Error('citation attendue');
    expect(block.quote.rich_text.map((part) => part.text.content)).toEqual(['a'.repeat(1999), '🇫🇷b']);
  });

  it('conserve les sauts de ligne', () => {
    expect(quoteBlock('Premier paragraphe.\nSecond paragraphe.')).toEqual({
      type: 'quote',
      quote: { rich_text: [text('Premier paragraphe.\nSecond paragraphe.')] },
    });
  });
});
