/**
 * Normalise une URL de profil LinkedIn en `https://www.linkedin.com/in/<identifiant>`
 * (design.md, décision 6 bis). Renvoie `null` pour toute autre valeur.
 */
export function normalizeLinkedinProfile(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (url.hostname !== 'linkedin.com' && !url.hostname.endsWith('.linkedin.com')) return null;

  const identifier = /^\/in\/([^/]+)/.exec(url.pathname)?.[1];
  return identifier ? `https://www.linkedin.com/in/${identifier}` : null;
}
