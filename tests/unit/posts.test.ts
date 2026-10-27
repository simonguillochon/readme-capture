import { describe, expect, it } from 'vitest';
import { firstSentence, isPostUrl } from '@/capture/posts';

describe('isPostUrl', () => {
  it.each([
    'https://www.linkedin.com/posts/camille-martin_management-activity-7000000000000000000-AbCd',
    'https://linkedin.com/feed/update/urn:li:activity:7000000000000000000/',
    'https://x.com/camille_exemple/status/1800000000000000000',
    'https://www.x.com/camille_exemple/status/1800000000000000000',
    'https://twitter.com/camille_exemple/status/1800000000000000000',
    'https://www.twitter.com/camille_exemple/status/1800000000000000000/photo/1',
  ])('reconnaît le post %s', (url) => {
    expect(isPostUrl(url)).toBe(true);
  });

  it.each([
    'https://www.linkedin.com/in/camille-martin-exemple',
    'https://www.linkedin.com/feed/',
    'https://fr.linkedin.com/posts/camille-martin_management-activity-7000000000000000000-AbCd',
    'https://x.com/camille_exemple',
    'https://x.com/camille_exemple/status/abc',
    'https://exemple.com/posts/un-article',
    'about:newtab',
  ])('ne reconnaît pas %s', (url) => {
    expect(isPostUrl(url)).toBe(false);
  });
});

describe('firstSentence', () => {
  it('s’arrête au premier point, inclus', () => {
    expect(firstSentence("Le management n'est pas un titre. C'est une pratique quotidienne.")).toBe("Le management n'est pas un titre.");
  });

  it('s’arrête au premier point d’exclamation ou d’interrogation', () => {
    expect(firstSentence('Vraiment ? Oui !')).toBe('Vraiment ?');
    expect(firstSentence('Enfin ! La suite.')).toBe('Enfin !');
  });

  it('s’arrête au premier saut de ligne, exclu', () => {
    expect(firstSentence('3 leçons sur la discovery\n1. Écouter.')).toBe('3 leçons sur la discovery');
  });

  it('renvoie le texte entier sans ponctuation ni saut de ligne', () => {
    expect(firstSentence('Un texte sans ponctuation')).toBe('Un texte sans ponctuation');
  });
});
