import { normalizeLinkedinProfile } from './linkedin-profile';
import type { PageSnapshot } from './page-snapshot';
import { firstSentence, postPlatform } from './posts';
import { normalizeUrl } from './url-normalization';

/** Valeurs pré-remplies du formulaire, vides si rien n'est trouvé. */
export interface Prefill {
  title: string;
  url: string;
  author: string;
  authorLinkedin: string;
}

/** Supprime les espaces en début et fin, et réduit les espaces multiples à un seul. */
function clean(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

/** Première valeur non vide, après nettoyage des espaces. */
function firstFilled(...values: (string | null | undefined)[]): string {
  for (const value of values) {
    const cleaned = clean(value);
    if (cleaned) return cleaned;
  }
  return '';
}

/** Nom d'auteur, ou `null` si la valeur est vide ou est elle-même une URL. */
function authorName(value: string | null | undefined): string | null {
  const cleaned = clean(value);
  return cleaned && normalizeUrl(cleaned) === null ? cleaned : null;
}

/** Premier champ `author` trouvé en parcourant la valeur en profondeur. */
function findAuthorField(value: unknown): unknown {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findAuthorField(item);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  if (value === null || typeof value !== 'object') return undefined;
  if ('author' in value) return value.author;
  for (const child of Object.values(value)) {
    const found = findAuthorField(child);
    if (found !== undefined) return found;
  }
  return undefined;
}

/** Auteur déclaré dans les blocs JSON-LD : chaîne ou objet, premier élément d'un tableau. */
function structuredAuthor(jsonLd: string[]): unknown {
  for (const block of jsonLd) {
    let data: unknown;
    try {
      data = JSON.parse(block);
    } catch {
      continue;
    }
    let author = findAuthorField(data);
    if (Array.isArray(author)) author = author[0];
    if (author !== undefined) return author;
  }
  return undefined;
}

/** Nom de l'auteur des données structurées. */
function structuredAuthorName(author: unknown): string | null {
  if (typeof author === 'string') return author;
  if (author !== null && typeof author === 'object' && 'name' in author && typeof author.name === 'string') return author.name;
  return null;
}

/** Liens de l'auteur des données structurées : champs `url` et `sameAs`, chaîne ou tableau. */
function structuredAuthorLinks(author: unknown): unknown[] {
  if (author === null || typeof author !== 'object') return [];
  const links: unknown[] = [];
  for (const field of ['url', 'sameAs']) {
    const value: unknown = (author as Record<string, unknown>)[field];
    links.push(...(Array.isArray(value) ? value : [value]));
  }
  return links;
}

/** Premier profil LinkedIn valide parmi les valeurs, normalisé, ou vide. */
function firstLinkedinProfile(values: unknown[]): string {
  for (const value of values) {
    const profile = typeof value === 'string' ? normalizeLinkedinProfile(value) : null;
    if (profile) return profile;
  }
  return '';
}

/**
 * Valeurs pré-remplies depuis l'onglet actif et sa page (design.md, décision 4).
 * Une page illisible (`snapshot` à `null`) laisse tous les champs vides.
 */
export function buildPrefill(tabUrl: string, tabTitle: string, snapshot: PageSnapshot | null): Prefill {
  if (!snapshot) return { title: '', url: '', author: '', authorLinkedin: '' };

  const platform = postPlatform(tabUrl);
  if (platform) {
    return {
      title: clean(firstSentence((snapshot.postText ?? '').trimStart())),
      url: normalizeUrl(tabUrl) ?? '',
      author: clean(snapshot.postAuthor),
      authorLinkedin: platform === 'linkedin' ? firstLinkedinProfile([snapshot.postAuthorProfileUrl]) : '',
    };
  }

  const author = structuredAuthor(snapshot.jsonLd);
  return {
    title: firstFilled(snapshot.ogTitle, tabTitle),
    url: normalizeUrl(tabUrl) ?? '',
    author:
      authorName(snapshot.metaAuthor) ??
      authorName(snapshot.articleAuthor) ??
      authorName(structuredAuthorName(author)) ??
      '',
    authorLinkedin: firstLinkedinProfile([snapshot.articleAuthor, ...structuredAuthorLinks(author)]),
  };
}
