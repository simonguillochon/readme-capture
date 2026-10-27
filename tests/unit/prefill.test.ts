import { describe, expect, it } from 'vitest';
import type { PageSnapshot } from '@/capture/page-snapshot';
import { buildPrefill } from '@/capture/prefill';

const ARTICLE_URL = 'https://exemple.com/blog/un-article';

function snapshot(values: Partial<PageSnapshot> = {}): PageSnapshot {
  return {
    ogTitle: null,
    metaAuthor: null,
    articleAuthor: null,
    jsonLd: [],
    postText: null,
    postAuthor: null,
    postAuthorProfileUrl: null,
    ...values,
  };
}

describe('buildPrefill — titre', () => {
  it('prend le titre de partage plutôt que le titre de l’onglet', () => {
    const prefill = buildPrefill(ARTICLE_URL, 'TBM 444 | The Beautiful Mess', snapshot({ ogTitle: "What a workplace can't promise" }));
    expect(prefill.title).toBe("What a workplace can't promise");
  });

  it('prend le titre de l’onglet à défaut de titre de partage', () => {
    expect(buildPrefill(ARTICLE_URL, 'Notes de lecture', snapshot()).title).toBe('Notes de lecture');
  });

  it('nettoie les espaces du titre', () => {
    expect(buildPrefill(ARTICLE_URL, '', snapshot({ ogTitle: '  Un   titre\n sur deux lignes ' })).title).toBe('Un titre sur deux lignes');
  });
});

describe('buildPrefill — URL', () => {
  it('nettoie l’URL de l’onglet', () => {
    const prefill = buildPrefill('https://exemple.substack.com/p/un-article?utm_source=post-email-title', '', snapshot());
    expect(prefill.url).toBe('https://exemple.substack.com/p/un-article');
  });
});

describe('buildPrefill — auteur', () => {
  it('prend la balise author', () => {
    expect(buildPrefill(ARTICLE_URL, '', snapshot({ metaAuthor: 'Camille Martin', articleAuthor: 'Autre Nom' })).author).toBe('Camille Martin');
  });

  it('prend la balise article:author à défaut de balise author', () => {
    expect(buildPrefill(ARTICLE_URL, '', snapshot({ articleAuthor: 'Camille Martin' })).author).toBe('Camille Martin');
  });

  it('ignore un auteur qui est une URL et essaie la source suivante', () => {
    const page = snapshot({
      articleAuthor: 'https://exemple.com/auteurs/camille',
      jsonLd: [JSON.stringify({ '@type': 'Article', author: { '@type': 'Person', name: 'Camille Martin' } })],
    });
    expect(buildPrefill(ARTICLE_URL, '', page).author).toBe('Camille Martin');
  });

  it('prend l’auteur des données structurées, dans un tableau', () => {
    const page = snapshot({
      jsonLd: [JSON.stringify({ '@type': 'NewsArticle', author: [{ '@type': 'Person', name: 'Camille Martin' }, { name: 'Autre Nom' }] })],
    });
    expect(buildPrefill(ARTICLE_URL, '', page).author).toBe('Camille Martin');
  });

  it('prend l’auteur des données structurées, dans @graph', () => {
    const page = snapshot({
      jsonLd: [JSON.stringify({ '@graph': [{ '@type': 'WebSite', name: 'Exemple' }, { '@type': 'Article', author: 'Camille Martin' }] })],
    });
    expect(buildPrefill(ARTICLE_URL, '', page).author).toBe('Camille Martin');
  });

  it('ignore un bloc JSON-LD invalide', () => {
    const page = snapshot({ jsonLd: ['{ invalide', JSON.stringify({ author: { name: 'Camille Martin' } })] });
    expect(buildPrefill(ARTICLE_URL, '', page).author).toBe('Camille Martin');
  });

  it('laisse l’auteur vide si la page n’en déclare aucun', () => {
    expect(buildPrefill(ARTICLE_URL, '', snapshot({ jsonLd: [JSON.stringify({ '@type': 'WebPage' })] })).author).toBe('');
  });
});

describe('buildPrefill — LinkedIn de l’auteur', () => {
  it('prend le profil LinkedIn des liens de l’auteur des données structurées', () => {
    const page = snapshot({
      jsonLd: [
        JSON.stringify({
          '@type': 'Article',
          author: { '@type': 'Person', name: 'Camille Martin', url: 'https://exemple.com/camille', sameAs: ['https://x.com/camille_exemple', 'https://www.linkedin.com/in/camille-martin-exemple/'] },
        }),
      ],
    });
    expect(buildPrefill(ARTICLE_URL, '', page).authorLinkedin).toBe('https://www.linkedin.com/in/camille-martin-exemple');
  });

  it('prend le profil LinkedIn du champ url de l’auteur', () => {
    const page = snapshot({ jsonLd: [JSON.stringify({ author: { name: 'Camille Martin', url: 'https://www.linkedin.com/in/camille-martin-exemple' } })] });
    expect(buildPrefill(ARTICLE_URL, '', page).authorLinkedin).toBe('https://www.linkedin.com/in/camille-martin-exemple');
  });

  it('prend le profil LinkedIn de la balise article:author en priorité', () => {
    const page = snapshot({
      articleAuthor: 'https://fr.linkedin.com/in/camille-martin-exemple?trk=article',
      jsonLd: [JSON.stringify({ author: { name: 'Camille Martin', sameAs: 'https://www.linkedin.com/in/autre-profil-exemple' } })],
    });
    expect(buildPrefill(ARTICLE_URL, '', page).authorLinkedin).toBe('https://www.linkedin.com/in/camille-martin-exemple');
  });

  it('laisse le champ vide si l’auteur n’a pas de profil LinkedIn', () => {
    const page = snapshot({ jsonLd: [JSON.stringify({ author: { name: 'Camille Martin', sameAs: 'https://x.com/camille_exemple' } })] });
    expect(buildPrefill(ARTICLE_URL, '', page).authorLinkedin).toBe('');
  });
});

describe('buildPrefill — posts', () => {
  const LINKEDIN_POST = 'https://www.linkedin.com/posts/camille-martin_management-activity-7000000000000000000-AbCd?utm_source=share';
  const X_POST = 'https://x.com/camille_exemple/status/1800000000000000000';

  it('prend la première phrase d’un post LinkedIn comme titre', () => {
    const page = snapshot({ ogTitle: 'Titre de partage', postText: "Le management n'est pas un titre. C'est une pratique quotidienne." });
    expect(buildPrefill(LINKEDIN_POST, 'Onglet', page).title).toBe("Le management n'est pas un titre.");
  });

  it('prend la première ligne d’un post X sans ponctuation comme titre', () => {
    expect(buildPrefill(X_POST, '', snapshot({ postText: '3 leçons sur la discovery\n1. Écouter.' })).title).toBe('3 leçons sur la discovery');
  });

  it('laisse le titre vide si le texte du post est introuvable', () => {
    expect(buildPrefill(LINKEDIN_POST, 'Onglet', snapshot({ ogTitle: 'Titre de partage' })).title).toBe('');
  });

  it('nettoie l’URL du post', () => {
    expect(buildPrefill(LINKEDIN_POST, '', snapshot()).url).toBe(
      'https://www.linkedin.com/posts/camille-martin_management-activity-7000000000000000000-AbCd',
    );
  });

  it('prend l’auteur du post plutôt que les balises de la page', () => {
    expect(buildPrefill(X_POST, '', snapshot({ metaAuthor: 'Autre Nom', postAuthor: ' Camille  Martin ' })).author).toBe('Camille Martin');
  });

  it('prend le profil de l’auteur d’un post LinkedIn', () => {
    const page = snapshot({ postAuthorProfileUrl: 'https://www.linkedin.com/in/camille-martin-exemple?miniProfileUrn=x' });
    expect(buildPrefill(LINKEDIN_POST, '', page).authorLinkedin).toBe('https://www.linkedin.com/in/camille-martin-exemple');
  });

  it('laisse l’auteur et son profil vides pour un post LinkedIn en /feed/update/ sans auteur trouvé', () => {
    const page = snapshot({ postText: 'Une accroche. La suite.' });
    const prefill = buildPrefill('https://www.linkedin.com/feed/update/urn:li:activity:7000000000000000000/', '', page);
    expect(prefill).toEqual({
      title: 'Une accroche.',
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:7000000000000000000/',
      author: '',
      authorLinkedin: '',
    });
  });

  it('laisse le profil LinkedIn vide pour un post X', () => {
    const page = snapshot({ postAuthorProfileUrl: 'https://www.linkedin.com/in/camille-martin-exemple', articleAuthor: 'https://www.linkedin.com/in/camille-martin-exemple' });
    expect(buildPrefill(X_POST, '', page).authorLinkedin).toBe('');
  });
});

describe('buildPrefill — page illisible', () => {
  it('laisse tous les champs vides', () => {
    expect(buildPrefill('about:newtab', 'Nouvel onglet', null)).toEqual({ title: '', url: '', author: '', authorLinkedin: '' });
  });
});
