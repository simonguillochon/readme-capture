const NOTION_HOSTS = ['notion.so', 'notion.com'];

// Identifiant de 32 caractères hexadécimaux, avec ou sans tirets, éventuellement précédé du nom de la base et d'un tiret.
const ID_IN_SEGMENT =
  /(?:^|-)([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

function isNotionHost(hostname: string): boolean {
  return NOTION_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

/**
 * Extrait l'identifiant de la base depuis l'URL saisie (design.md, décision 5).
 * Retourne l'identifiant normalisé sans tirets et en minuscules, ou `null` si la valeur n'est pas reconnue.
 */
export function extractDatabaseId(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || !isNotionHost(url.hostname)) {
    return null;
  }

  const segments = url.pathname.split('/').reverse();
  for (const segment of segments) {
    const match = ID_IN_SEGMENT.exec(segment);
    if (match?.[1]) {
      return match[1].replaceAll('-', '').toLowerCase();
    }
  }
  return null;
}
