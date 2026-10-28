import { changedFields } from '@/capture/form-diff';
import type { CaptureFormState, Language } from '@/capture/form-validation';

const LANGUAGE_ICONS: Record<Language, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
};

// Formats d'écriture communs à la création et à la modification (US-05, design.md, décision 4).
const icon = (form: CaptureFormState) => ({ type: 'emoji', emoji: LANGUAGE_ICONS[form.language!] });
const title = (form: CaptureFormState) => ({ title: [{ text: { content: form.title.trim() } }] });
const url = (form: CaptureFormState) => ({ url: form.url });
const source = (form: CaptureFormState) => ({ rich_text: [{ text: { content: form.author.trim() } }] });
const theme = (form: CaptureFormState) => ({ multi_select: form.themes.map((name) => ({ name })) });

/**
 * Corps de `POST /v1/pages` qui crée l'item (design.md, décision 3).
 * N'est appelée que sur un formulaire valide au sens de `isFormValid`, donc avec une langue choisie.
 */
export function buildCreatePageBody(form: CaptureFormState, dataSourceId: string, today: string) {
  return {
    parent: { type: 'data_source_id', data_source_id: dataSourceId },
    icon: icon(form),
    properties: {
      Title: title(form),
      URL: url(form),
      Source: source(form),
      Date: { date: { start: today } },
      Theme: theme(form),
      ...(form.authorLinkedin.trim() === '' ? {} : { 'LinkedIn auteur': { url: form.authorLinkedin } }),
    },
  };
}

/**
 * Corps de `PATCH /v1/pages/{id}` qui ne contient que les champs modifiés depuis `saved` (US-05, design.md, décision 4).
 * N'est appelée que sur un formulaire valide et modifié. Date, Description, Type et le corps de la page n'y figurent jamais.
 */
export function buildUpdatePageBody(saved: CaptureFormState, current: CaptureFormState) {
  const changed = changedFields(saved, current);
  const properties: Record<string, unknown> = {};
  if (changed.includes('title')) properties.Title = title(current);
  if (changed.includes('url')) properties.URL = url(current);
  if (changed.includes('author')) properties.Source = source(current);
  if (changed.includes('authorLinkedin')) {
    properties['LinkedIn auteur'] = { url: current.authorLinkedin.trim() === '' ? null : current.authorLinkedin };
  }
  if (changed.includes('themes')) properties.Theme = theme(current);
  return {
    ...(changed.includes('language') ? { icon: icon(current) } : {}),
    ...(Object.keys(properties).length > 0 ? { properties } : {}),
  };
}

/** Date `AAAA-MM-JJ` dans le fuseau horaire de l'ordinateur (design.md, décision 4). */
export function localDate(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
