import type { CaptureFormState } from './form-validation';

export type FormField = keyof CaptureFormState;

const FIELDS: FormField[] = ['title', 'url', 'author', 'authorLinkedin', 'language', 'themes'];

/**
 * Copie normalisée du formulaire, mémorisée comme valeurs enregistrées (design.md, décision 2) :
 * Titre et Auteur sans espaces en début et fin.
 */
export function normalizeForm(state: CaptureFormState): CaptureFormState {
  return { ...state, title: state.title.trim(), author: state.author.trim(), themes: [...state.themes] };
}

function sameThemes(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((theme) => b.includes(theme));
}

/**
 * Champs du formulaire qui diffèrent des valeurs enregistrées, après normalisation (design.md, décision 3).
 * Les thèmes sont comparés comme un ensemble : leur ordre n'est pas significatif.
 */
export function changedFields(saved: CaptureFormState, current: CaptureFormState): FormField[] {
  const before = normalizeForm(saved);
  const after = normalizeForm(current);
  return FIELDS.filter((field) =>
    field === 'themes' ? !sameThemes(before.themes, after.themes) : before[field] !== after[field],
  );
}
