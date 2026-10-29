import { describe, expect, it } from 'vitest';
import { formatCharacterCount } from '@/capture/description';

describe('formatCharacterCount', () => {
  it.each([
    [0, '0 / 2000'],
    [999, '999 / 2000'],
    [1240, '1 240 / 2000'],
    [2000, '2 000 / 2000'],
  ])('affiche %i caractères', (count, expected) => {
    expect(formatCharacterCount(count, 2000)).toBe(expected);
  });
});
