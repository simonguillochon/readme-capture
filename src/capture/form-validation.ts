import { normalizeLinkedinProfile } from './linkedin-profile';
import { normalizeUrl } from './url-normalization';

export type Language = 'fr' | 'en' | 'es';

/** Valeurs du formulaire de préparation de l'item (design.md, décision 8). */
export interface CaptureFormState {
  title: string;
  url: string;
  author: string;
  authorLinkedin: string;
  language: Language | null;
  themes: string[];
}

/** Vrai si « Ajouter » peut être activé (exigence « Activer « Ajouter » uniquement si le formulaire est valide »). */
export function isFormValid(state: CaptureFormState): boolean {
  return (
    state.title.trim() !== '' &&
    state.author.trim() !== '' &&
    normalizeUrl(state.url) !== null &&
    (state.authorLinkedin.trim() === '' || normalizeLinkedinProfile(state.authorLinkedin) !== null) &&
    state.language !== null &&
    state.themes.length > 0
  );
}
