import type { Browser } from 'wxt/browser';
import { postPlatform } from './posts';

/** Métadonnées lues dans la page de l'onglet actif (design.md, décision 3). */
export interface PageSnapshot {
  ogTitle: string | null;
  metaAuthor: string | null;
  articleAuthor: string | null;
  jsonLd: string[];
  postText: string | null;
  postAuthor: string | null;
  postAuthorProfileUrl: string | null;
}

/**
 * Exécutée dans la page par `scripting.executeScript` : autonome, sans import,
 * sans modification de la page ni écouteur. `platform` est celle du post affiché
 * (design.md, décision 5), ou `null` pour une autre page.
 */
export function collectPageSnapshot(platform: 'linkedin' | 'x' | null): PageSnapshot {
  const metaContent = (selector: string): string | null =>
    document.querySelector<HTMLMetaElement>(selector)?.content ?? null;
  const text = (element: HTMLElement | null | undefined): string | null => element?.innerText ?? null;
  const firstLine = (element: HTMLElement | null | undefined): string | null =>
    element?.innerText.split('\n').map((line) => line.trim()).find((line) => line !== '') ?? null;

  let postText: string | null = null;
  let postAuthor: string | null = null;
  let postAuthorProfileUrl: string | null = null;

  if (platform === 'x') {
    const id = /\/status\/(\d+)/.exec(location.pathname)?.[1];
    const article = id
      ? Array.from(document.querySelectorAll<HTMLElement>('article[data-testid="tweet"]')).find(
          (candidate) => candidate.querySelector(`a[href$="/status/${id}"] time`) !== null,
        )
      : undefined;
    postText = text(article?.querySelector<HTMLElement>('[data-testid="tweetText"]'));
    postAuthor = firstLine(article?.querySelector<HTMLElement>('[data-testid="User-Name"]'));
  }

  if (platform === 'linkedin') {
    postText = text(document.querySelector<HTMLElement>('[data-testid="expandable-text-box"]'));
    // Identifiant de l'auteur, présent uniquement dans les URL en `/posts/<identifiant>_…`.
    const identifier = /^\/posts\/([^_/]+)_/.exec(location.pathname)?.[1];
    const authorLink = identifier
      ? Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/in/"]')).find(
          (link) =>
            (link.pathname === `/in/${identifier}` || link.pathname.startsWith(`/in/${identifier}/`)) &&
            link.innerText.trim() !== '',
        )
      : undefined;
    postAuthor = firstLine(authorLink);
    postAuthorProfileUrl = authorLink?.href ?? null;
  }

  return {
    ogTitle: metaContent('meta[property="og:title"]'),
    metaAuthor: metaContent('meta[name="author"]'),
    articleAuthor: metaContent('meta[property="article:author"]'),
    jsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]'), (script) => script.textContent ?? ''),
    postText,
    postAuthor,
    postAuthorProfileUrl,
  };
}

export interface ActiveTabPage {
  tab: Browser.tabs.Tab;
  /** `null` quand la page est illisible. */
  snapshot: PageSnapshot | null;
}

/** Lit l'onglet actif de la fenêtre du panneau, puis sa page si elle est en `http` ou `https`. */
export async function readActiveTabPage(): Promise<ActiveTabPage | null> {
  const { id: windowId } = await browser.windows.getCurrent();
  const [tab] = await browser.tabs.query({ active: true, windowId });
  if (tab?.id === undefined) return null;

  if (!/^https?:/.test(tab.url ?? '')) return { tab, snapshot: null };
  try {
    const [injection] = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: collectPageSnapshot,
      args: [postPlatform(tab.url ?? '')],
    });
    return { tab, snapshot: (injection?.result as PageSnapshot | undefined) ?? null };
  } catch {
    return { tab, snapshot: null };
  }
}
