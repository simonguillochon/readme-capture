import { describe, expect, it } from 'vitest';
import type { CaptureFormState } from '@/capture/form-validation';
import { buildCreatePageBody, buildDescriptionBody, buildUpdatePageBody, localDate } from '@/notion/item-payload';

const DATA_SOURCE_ID = 'fedcba98-7654-3210-fedc-ba9876543210';

const form: CaptureFormState = {
  title: 'What a workplace can’t promise',
  url: 'https://exemple.substack.com/p/un-article',
  author: 'Camille Martin',
  authorLinkedin: '',
  language: 'en',
  themes: ['Management'],
};

describe('buildCreatePageBody', () => {
  it('construit le corps complet de la création', () => {
    expect(buildCreatePageBody(form, DATA_SOURCE_ID, '2026-10-27')).toEqual({
      parent: { type: 'data_source_id', data_source_id: DATA_SOURCE_ID },
      icon: { type: 'emoji', emoji: '🇬🇧' },
      properties: {
        Title: { title: [{ text: { content: 'What a workplace can’t promise' } }] },
        URL: { url: 'https://exemple.substack.com/p/un-article' },
        Source: { rich_text: [{ text: { content: 'Camille Martin' } }] },
        Date: { date: { start: '2026-10-27' } },
        Theme: { multi_select: [{ name: 'Management' }] },
      },
    });
  });

  it.each([
    ['fr', '🇫🇷'],
    ['en', '🇬🇧'],
    ['es', '🇪🇸'],
  ] as const)('donne l’icône de la langue %s', (language, emoji) => {
    expect(buildCreatePageBody({ ...form, language }, DATA_SOURCE_ID, '2026-10-27').icon).toEqual({ type: 'emoji', emoji });
  });

  it('renseigne LinkedIn auteur quand le profil est rempli', () => {
    const body = buildCreatePageBody(
      { ...form, authorLinkedin: 'https://www.linkedin.com/in/camille-martin-exemple' },
      DATA_SOURCE_ID,
      '2026-10-27',
    );
    expect(body.properties).toHaveProperty('LinkedIn auteur', { url: 'https://www.linkedin.com/in/camille-martin-exemple' });
  });

  it('omet LinkedIn auteur quand le profil est vide', () => {
    expect(buildCreatePageBody(form, DATA_SOURCE_ID, '2026-10-27').properties).not.toHaveProperty('LinkedIn auteur');
  });

  it('supprime les espaces autour du titre et de l’auteur', () => {
    const { properties } = buildCreatePageBody({ ...form, title: '  Un article  ', author: ' Camille Martin ' }, DATA_SOURCE_ID, '2026-10-27');
    expect(properties.Title.title[0]!.text.content).toBe('Un article');
    expect(properties.Source.rich_text[0]!.text.content).toBe('Camille Martin');
  });

  it('envoie les thèmes dans l’ordre où ils ont été choisis', () => {
    const { properties } = buildCreatePageBody({ ...form, themes: ['Strategy', 'Management', 'Design'] }, DATA_SOURCE_ID, '2026-10-27');
    expect(properties.Theme.multi_select).toEqual([{ name: 'Strategy' }, { name: 'Management' }, { name: 'Design' }]);
  });

  it('ne renseigne ni Description, ni Type, ni le corps de la page', () => {
    const body = buildCreatePageBody(form, DATA_SOURCE_ID, '2026-10-27');
    expect(body).not.toHaveProperty('children');
    expect(body.properties).not.toHaveProperty('Description');
    expect(body.properties).not.toHaveProperty('Type');
  });
});

describe('buildUpdatePageBody', () => {
  const saved: CaptureFormState = {
    ...form,
    author: 'C. Martin',
    authorLinkedin: 'https://www.linkedin.com/in/camille-martin-exemple',
    themes: ['Management', 'Strategy'],
  };

  it('met à jour Title quand le titre a changé', () => {
    expect(buildUpdatePageBody(saved, { ...saved, title: ' TBM 444 — What a workplace can’t promise ' })).toEqual({
      properties: { Title: { title: [{ text: { content: 'TBM 444 — What a workplace can’t promise' } }] } },
    });
  });

  it('met à jour URL quand l’URL a changé', () => {
    expect(buildUpdatePageBody(saved, { ...saved, url: 'https://exemple.com/blog/un-autre-article' })).toEqual({
      properties: { URL: { url: 'https://exemple.com/blog/un-autre-article' } },
    });
  });

  it('met à jour Source quand l’auteur a changé', () => {
    expect(buildUpdatePageBody(saved, { ...saved, author: 'Camille Martin' })).toEqual({
      properties: { Source: { rich_text: [{ text: { content: 'Camille Martin' } }] } },
    });
  });

  it('met à jour LinkedIn auteur quand le profil a changé', () => {
    expect(buildUpdatePageBody(saved, { ...saved, authorLinkedin: 'https://www.linkedin.com/in/camille-martin' })).toEqual({
      properties: { 'LinkedIn auteur': { url: 'https://www.linkedin.com/in/camille-martin' } },
    });
  });

  it('vide LinkedIn auteur avec null quand le profil a été effacé', () => {
    expect(buildUpdatePageBody(saved, { ...saved, authorLinkedin: '' })).toEqual({
      properties: { 'LinkedIn auteur': { url: null } },
    });
  });

  it('envoie la liste complète des thèmes quand les thèmes ont changé', () => {
    expect(buildUpdatePageBody(saved, { ...saved, themes: ['Management', 'Design'] })).toEqual({
      properties: { Theme: { multi_select: [{ name: 'Management' }, { name: 'Design' }] } },
    });
  });

  it('met à jour uniquement l’icône quand la langue a changé', () => {
    expect(buildUpdatePageBody(saved, { ...saved, language: 'fr' })).toEqual({ icon: { type: 'emoji', emoji: '🇫🇷' } });
  });

  it('regroupe plusieurs champs modifiés', () => {
    expect(buildUpdatePageBody(saved, { ...saved, author: 'Camille Martin', language: 'es', themes: ['Design'] })).toEqual({
      icon: { type: 'emoji', emoji: '🇪🇸' },
      properties: {
        Source: { rich_text: [{ text: { content: 'Camille Martin' } }] },
        Theme: { multi_select: [{ name: 'Design' }] },
      },
    });
  });

  it('ne renseigne jamais Date, Description, Type ni le corps de la page', () => {
    const body = buildUpdatePageBody(saved, {
      title: 'Un autre titre',
      url: 'https://exemple.com/blog/un-autre-article',
      author: 'Camille Martin',
      authorLinkedin: '',
      language: 'fr',
      themes: ['Design'],
    });
    expect(body).not.toHaveProperty('children');
    expect(body.properties).not.toHaveProperty('Date');
    expect(body.properties).not.toHaveProperty('Description');
    expect(body.properties).not.toHaveProperty('Type');
  });
});

describe('localDate', () => {
  it('renvoie la date d’un moment en milieu de journée', () => {
    expect(localDate(new Date(2026, 2, 5, 12, 0))).toBe('2026-03-05');
  });

  it('renvoie la date du jour local à 23 h 30', () => {
    expect(localDate(new Date(2026, 9, 27, 23, 30))).toBe('2026-10-27');
  });
});

describe('buildDescriptionBody', () => {
  it('écrit le texte dans la Description', () => {
    expect(buildDescriptionBody('Une culture se lit dans les arbitrages.')).toEqual({
      properties: { Description: { rich_text: [{ text: { content: 'Une culture se lit dans les arbitrages.' } }] } },
    });
  });

  it('retire les espaces de début et de fin', () => {
    expect(buildDescriptionBody('  Version corrigée. \n ').properties.Description.rich_text).toEqual([
      { text: { content: 'Version corrigée.' } },
    ]);
  });

  it('conserve les sauts de ligne', () => {
    expect(buildDescriptionBody('Première ligne.\nSeconde ligne.').properties.Description.rich_text).toEqual([
      { text: { content: 'Première ligne.\nSeconde ligne.' } },
    ]);
  });

  it('efface la description pour un texte vide', () => {
    expect(buildDescriptionBody('   ')).toEqual({ properties: { Description: { rich_text: [] } } });
  });

  it('ne contient aucune autre propriété', () => {
    const body = buildDescriptionBody('Un texte.');
    expect(Object.keys(body)).toEqual(['properties']);
    expect(Object.keys(body.properties)).toEqual(['Description']);
  });
});
