/** Réseau d'un post reconnu par son URL. */
export type PostPlatform = 'linkedin' | 'x';

const LINKEDIN_HOSTS = ['linkedin.com', 'www.linkedin.com'];
const X_HOSTS = ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'];

/** Réseau du post désigné par l'URL, ou `null` si ce n'est pas un post LinkedIn ou X (design.md, décision 5). */
export function postPlatform(value: string): PostPlatform | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (LINKEDIN_HOSTS.includes(url.hostname) && /^\/(posts|feed\/update)\//.test(url.pathname)) return 'linkedin';
  if (X_HOSTS.includes(url.hostname) && /^\/[^/]+\/status\/\d+(\/|$)/.test(url.pathname)) return 'x';
  return null;
}

/** Vrai si l'URL est celle d'un post LinkedIn ou X. */
export function isPostUrl(value: string): boolean {
  return postPlatform(value) !== null;
}

/**
 * Texte jusqu'au premier `.`, `!` ou `?` inclus, ou jusqu'au premier saut de ligne exclu,
 * selon ce qui arrive en premier. Le texte entier si aucun ne figure.
 */
export function firstSentence(text: string): string {
  return /^[^.!?\n]*[.!?]?/.exec(text)?.[0] ?? text;
}
