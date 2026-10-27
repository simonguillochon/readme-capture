import { describe, expect, it } from 'vitest';
import { normalizeLinkedinProfile } from '@/capture/linkedin-profile';

describe('normalizeLinkedinProfile', () => {
  it('nettoie une URL de profil collée avec sous-domaine et paramètres', () => {
    expect(normalizeLinkedinProfile('https://fr.linkedin.com/in/camille-martin-exemple/?originalSubdomain=fr')).toBe(
      'https://www.linkedin.com/in/camille-martin-exemple',
    );
  });

  it('accepte le sous-domaine fr', () => {
    expect(normalizeLinkedinProfile('https://fr.linkedin.com/in/camille-martin-exemple')).toBe('https://www.linkedin.com/in/camille-martin-exemple');
  });

  it('supprime le / final', () => {
    expect(normalizeLinkedinProfile('https://www.linkedin.com/in/camille-martin-exemple/')).toBe('https://www.linkedin.com/in/camille-martin-exemple');
  });

  it('ignore les segments après l’identifiant', () => {
    expect(normalizeLinkedinProfile('https://linkedin.com/in/camille-martin-exemple/recent-activity/')).toBe(
      'https://www.linkedin.com/in/camille-martin-exemple',
    );
  });

  it('refuse une page /company/', () => {
    expect(normalizeLinkedinProfile('https://www.linkedin.com/company/exemple')).toBeNull();
  });

  it('refuse une URL hors LinkedIn', () => {
    expect(normalizeLinkedinProfile('https://x.com/camille_exemple')).toBeNull();
  });

  it('refuse un hôte qui se termine par linkedin.com sans en être un sous-domaine', () => {
    expect(normalizeLinkedinProfile('https://notlinkedin.com/in/camille-martin-exemple')).toBeNull();
  });

  it('refuse un texte libre', () => {
    expect(normalizeLinkedinProfile('Camille Martin')).toBeNull();
  });
});
