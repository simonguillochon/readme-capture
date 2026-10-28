import { describe, expect, it } from 'vitest';
import { changedFields, type FormField } from '@/capture/form-diff';
import type { CaptureFormState } from '@/capture/form-validation';

const saved: CaptureFormState = {
  title: 'What a workplace can’t promise',
  url: 'https://exemple.com/blog/un-article',
  author: 'C. Martin',
  authorLinkedin: 'https://www.linkedin.com/in/camille-martin-exemple',
  language: 'en',
  themes: ['Management', 'Strategy'],
};

describe('changedFields', () => {
  it('ne renvoie aucun champ quand rien n’a changé', () => {
    expect(changedFields(saved, { ...saved })).toEqual([]);
  });

  it.each<[FormField, Partial<CaptureFormState>]>([
    ['title', { title: 'TBM 444 — What a workplace can’t promise' }],
    ['url', { url: 'https://exemple.com/blog/un-autre-article' }],
    ['author', { author: 'Camille Martin' }],
    ['authorLinkedin', { authorLinkedin: '' }],
    ['language', { language: 'fr' }],
    ['themes', { themes: ['Management'] }],
  ])('renvoie %s quand seul ce champ a changé', (field, change) => {
    expect(changedFields(saved, { ...saved, ...change })).toEqual([field]);
  });

  it('ignore les espaces ajoutés autour du titre et de l’auteur', () => {
    expect(changedFields(saved, { ...saved, title: `  ${saved.title} `, author: ` ${saved.author}  ` })).toEqual([]);
  });

  it('ignore l’ordre des thèmes', () => {
    expect(changedFields(saved, { ...saved, themes: ['Strategy', 'Management'] })).toEqual([]);
  });

  it('détecte un thème ajouté', () => {
    expect(changedFields(saved, { ...saved, themes: ['Management', 'Strategy', 'Design'] })).toEqual(['themes']);
  });

  it('détecte un thème remplacé par un autre', () => {
    expect(changedFields(saved, { ...saved, themes: ['Management', 'Design'] })).toEqual(['themes']);
  });

  it('renvoie tous les champs modifiés à la fois', () => {
    expect(changedFields(saved, { ...saved, title: 'Un autre titre', language: 'fr' })).toEqual(['title', 'language']);
  });
});
