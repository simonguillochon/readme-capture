import { describe, expect, it } from 'vitest';
import { isFormValid, type CaptureFormState } from '@/capture/form-validation';

const validState: CaptureFormState = {
  title: 'Un article',
  url: 'https://exemple.com/blog/un-article',
  author: 'Camille Martin',
  authorLinkedin: '',
  language: 'en',
  themes: ['Management'],
};

describe('isFormValid', () => {
  it('est vrai pour un formulaire complet', () => {
    expect(isFormValid(validState)).toBe(true);
  });

  it('est faux sans thème choisi', () => {
    expect(isFormValid({ ...validState, themes: [] })).toBe(false);
  });

  it('est faux avec un auteur vide', () => {
    expect(isFormValid({ ...validState, author: '' })).toBe(false);
  });

  it('est faux sans langue choisie', () => {
    expect(isFormValid({ ...validState, language: null })).toBe(false);
  });

  it('est faux avec un titre composé uniquement d’espaces', () => {
    expect(isFormValid({ ...validState, title: '   ' })).toBe(false);
  });

  it('est faux avec une URL invalide', () => {
    expect(isFormValid({ ...validState, url: 'article de Camille' })).toBe(false);
  });

  it('est vrai avec un « LinkedIn de l’auteur » vide', () => {
    expect(isFormValid({ ...validState, authorLinkedin: '' })).toBe(true);
  });

  it('est vrai avec un profil LinkedIn valide', () => {
    expect(isFormValid({ ...validState, authorLinkedin: 'https://www.linkedin.com/in/camille-martin-exemple' })).toBe(true);
  });

  it('est faux avec un « LinkedIn de l’auteur » invalide', () => {
    expect(isFormValid({ ...validState, authorLinkedin: 'https://www.linkedin.com/company/exemple' })).toBe(false);
  });
});
