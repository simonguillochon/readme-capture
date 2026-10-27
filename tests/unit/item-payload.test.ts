import { describe, expect, it } from 'vitest';
import type { CaptureFormState } from '@/capture/form-validation';
import { buildCreatePageBody, localDate } from '@/notion/item-payload';

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

describe('localDate', () => {
  it('renvoie la date d’un moment en milieu de journée', () => {
    expect(localDate(new Date(2026, 2, 5, 12, 0))).toBe('2026-03-05');
  });

  it('renvoie la date du jour local à 23 h 30', () => {
    expect(localDate(new Date(2026, 9, 27, 23, 30))).toBe('2026-10-27');
  });
});
