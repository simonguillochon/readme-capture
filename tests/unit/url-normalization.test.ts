import { describe, expect, it } from 'vitest';
import { normalizeUrl } from '@/capture/url-normalization';

describe('normalizeUrl', () => {
  it('supprime les paramètres de suivi d’un lien de newsletter', () => {
    expect(
      normalizeUrl('https://exemple.substack.com/p/un-article?utm_source=post-email-title&publication_id=24711&utm_medium=email'),
    ).toBe('https://exemple.substack.com/p/un-article');
  });

  it('laisse inchangée une URL déjà propre', () => {
    expect(normalizeUrl('https://exemple.com/blog/un-article')).toBe('https://exemple.com/blog/un-article');
  });

  it('conserve le fragment d’une URL sans paramètres', () => {
    expect(normalizeUrl('https://exemple.com/blog/un-article#conclusion')).toBe('https://exemple.com/blog/un-article#conclusion');
  });

  it('supprime le fragment situé après des paramètres', () => {
    expect(normalizeUrl('https://exemple.com/blog/un-article?utm_source=x#conclusion')).toBe('https://exemple.com/blog/un-article');
  });

  it('conserve uniquement le paramètre v d’une vidéo YouTube', () => {
    expect(normalizeUrl('https://www.youtube.com/watch?v=abc123XYZ&list=PL0001&t=42s')).toBe('https://www.youtube.com/watch?v=abc123XYZ');
  });

  it('supprime tous les paramètres d’une vidéo YouTube sans v', () => {
    expect(normalizeUrl('https://www.youtube.com/watch?list=PL0001')).toBe('https://www.youtube.com/watch');
  });

  it('applique l’exception YouTube à m.youtube.com', () => {
    expect(normalizeUrl('https://m.youtube.com/watch?v=abc123XYZ&t=42s')).toBe('https://m.youtube.com/watch?v=abc123XYZ');
  });

  it('accepte une URL http', () => {
    expect(normalizeUrl('http://exemple.com/blog/un-article?ref=x')).toBe('http://exemple.com/blog/un-article');
  });

  it('refuse un texte libre', () => {
    expect(normalizeUrl('un article sur le management')).toBeNull();
  });

  it('refuse une adresse interne du navigateur', () => {
    expect(normalizeUrl('about:newtab')).toBeNull();
  });
});
