import type { CaptureFormState, Language } from '@/capture/form-validation';

const LANGUAGE_ICONS: Record<Language, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
};

/**
 * Corps de `POST /v1/pages` qui crée l'item (design.md, décision 3).
 * N'est appelée que sur un formulaire valide au sens de `isFormValid`, donc avec une langue choisie.
 */
export function buildCreatePageBody(form: CaptureFormState, dataSourceId: string, today: string) {
  return {
    parent: { type: 'data_source_id', data_source_id: dataSourceId },
    icon: { type: 'emoji', emoji: LANGUAGE_ICONS[form.language!] },
    properties: {
      Title: { title: [{ text: { content: form.title.trim() } }] },
      URL: { url: form.url },
      Source: { rich_text: [{ text: { content: form.author.trim() } }] },
      Date: { date: { start: today } },
      Theme: { multi_select: form.themes.map((name) => ({ name })) },
      ...(form.authorLinkedin.trim() === '' ? {} : { 'LinkedIn auteur': { url: form.authorLinkedin } }),
    },
  };
}

/** Date `AAAA-MM-JJ` dans le fuseau horaire de l'ordinateur (design.md, décision 4). */
export function localDate(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
