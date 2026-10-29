import { describe, expect, it } from 'vitest';
import { hasUnsavedChanges, isSending } from '@/capture/capture-store';
import type { CaptureFormState } from '@/capture/form-validation';

const form: CaptureFormState = {
  title: 'What a workplace can’t promise',
  url: 'https://exemple.substack.com/p/un-article',
  author: 'Camille Martin',
  authorLinkedin: '',
  language: 'en',
  themes: ['Management'],
};

const saved = {
  form: { ...form },
  savedValues: form,
  description: { text: 'Une culture se lit dans les arbitrages.', savedText: 'Une culture se lit dans les arbitrages.' },
  editing: null,
};

describe('hasUnsavedChanges', () => {
  it('est faux quand tout est enregistré', () => {
    expect(hasUnsavedChanges(saved)).toBe(false);
  });

  it('est vrai quand une métadonnée a changé', () => {
    expect(hasUnsavedChanges({ ...saved, form: { ...form, author: 'C. Martin' } })).toBe(true);
  });

  it('est vrai quand la description a changé', () => {
    expect(hasUnsavedChanges({ ...saved, description: { ...saved.description, text: 'Version corrigée.' } })).toBe(true);
  });

  it('ignore les espaces ajoutés à la description', () => {
    expect(hasUnsavedChanges({ ...saved, description: { ...saved.description, text: `${saved.description.text}  ` } })).toBe(false);
  });

  it('est vrai quand un extrait est en cours de modification', () => {
    expect(hasUnsavedChanges({ ...saved, editing: { blockId: 'quote-1', text: 'Culture.', sectionId: 'none' } })).toBe(true);
  });
});

describe('isSending', () => {
  const idle = { status: 'created' as const, busy: null, adding: false, descriptionSaving: false };

  it('est faux sans envoi en cours', () => {
    expect(isSending(idle)).toBe(false);
  });

  it.each(['creating', 'saving'] as const)('est vrai quand le formulaire est à l’état %s', (status) => {
    expect(isSending({ ...idle, status })).toBe(true);
  });

  it.each(['saving', 'deleting'] as const)('est vrai pendant l’envoi d’un extrait (%s)', (kind) => {
    expect(isSending({ ...idle, busy: { blockId: 'quote-1', kind } })).toBe(true);
  });

  it('est vrai pendant l’ajout d’un extrait', () => {
    expect(isSending({ ...idle, adding: true })).toBe(true);
  });

  it('est vrai pendant l’enregistrement de la description', () => {
    expect(isSending({ ...idle, descriptionSaving: true })).toBe(true);
  });
});
