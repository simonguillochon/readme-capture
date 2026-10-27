/** Adresse dont certains paramètres de requête sont conservés au nettoyage. */
interface UrlException {
  hosts: string[];
  pathname: string;
  keepParams: string[];
}

/** Exceptions au nettoyage des paramètres de requête (design.md, décision 6). */
export const URL_EXCEPTIONS: UrlException[] = [
  { hosts: ['youtube.com', 'www.youtube.com', 'm.youtube.com'], pathname: '/watch', keepParams: ['v'] },
];

/**
 * Nettoie une URL de contenu : supprime les paramètres de requête et le fragment
 * si elle contient un `?`, sauf exception. Renvoie `null` si la valeur n'est pas
 * une URL `http` ou `https`.
 */
export function normalizeUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  // Un `?` situé avant le fragment, même sans paramètre derrière.
  if (!(url.href.split('#')[0] ?? '').includes('?')) return url.toString();

  const exception = URL_EXCEPTIONS.find(
    ({ hosts, pathname }) => hosts.includes(url.hostname) && url.pathname === pathname,
  );
  const kept = new URLSearchParams();
  for (const name of exception?.keepParams ?? []) {
    const param = url.searchParams.get(name);
    if (param !== null) kept.set(name, param);
  }
  url.search = kept.toString();
  url.hash = '';
  return url.toString();
}
