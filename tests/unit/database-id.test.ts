import { describe, expect, it } from 'vitest';
import { extractDatabaseId } from '@/config/database-id';

describe('extractDatabaseId', () => {
  it('Nominal — URL copiée depuis Notion', () => {
    expect(
      extractDatabaseId(
        'https://app.notion.com/p/exemple/0123456789abcdef0123456789abcdef?v=fedcba9876543210fedcba9876543210',
      ),
    ).toBe('0123456789abcdef0123456789abcdef');
  });

  it('Alternatif — URL avec le nom de la base dans le chemin', () => {
    expect(
      extractDatabaseId('https://www.notion.so/exemple/Readme-center-0123456789abcdef0123456789abcdef'),
    ).toBe('0123456789abcdef0123456789abcdef');
  });

  it('Erreur — Identifiant seul', () => {
    expect(extractDatabaseId('0123456789abcdef0123456789abcdef')).toBeNull();
  });

  it('Erreur — URL hors Notion', () => {
    expect(extractDatabaseId('https://example.com/0123456789abcdef0123456789abcdef')).toBeNull();
  });

  it('accepte un identifiant à tirets et le normalise sans tirets, en minuscules', () => {
    expect(
      extractDatabaseId('https://www.notion.so/exemple/Readme-center-01234567-89AB-CDEF-0123-456789ABCDEF'),
    ).toBe('0123456789abcdef0123456789abcdef');
  });

  it('refuse une URL http', () => {
    expect(extractDatabaseId('http://www.notion.so/exemple/0123456789abcdef0123456789abcdef')).toBeNull();
  });
});
