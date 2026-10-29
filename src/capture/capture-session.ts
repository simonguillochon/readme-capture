import type { Extract, Section } from './extract-placement';
import type { CaptureFormState } from './form-validation';

/** Capture en cours conservée dans le stockage local sous la clé `captureSession` (US-09, design.md, décision 2). */
export interface CaptureSession {
  version: 1;
  /** Base de la configuration au moment de la création de l'item. */
  databaseId: string;
  item: { id: string; url: string };
  /** Valeurs en cours du formulaire. */
  form: CaptureFormState;
  /** Dernières valeurs enregistrées dans Notion. */
  savedValues: CaptureFormState;
  /** Libellé du message de confirmation du formulaire. */
  confirmation: string;
  expanded: boolean;
  sections: Section[];
  /** Extraits sans leur surlignage, qui n'est pas repris. */
  extracts: Omit<Extract, 'highlight'>[];
  /** Section pré-sélectionnée : identifiant de section ou 'none'. */
  lastUsed: string;
  description: { text: string; savedText: string };
  /** Incrémenté à chaque écriture. */
  revision: number;
  /** Identifiant du panneau qui a écrit la capture. */
  writer: string;
}

/** Champs persistants de l'état du panneau, à partir desquels la capture est écrite. */
export type CaptureSessionState = Omit<CaptureSession, 'version' | 'extracts' | 'revision' | 'writer'> & {
  extracts: Extract[];
};

export const CAPTURE_SESSION_KEY = 'captureSession';

type Check = (value: unknown) => boolean;

const isString: Check = (value) => typeof value === 'string';
const isBoolean: Check = (value) => typeof value === 'boolean';
const isNumber: Check = (value) => typeof value === 'number' && Number.isFinite(value);
const oneOf =
  (...values: unknown[]): Check =>
  (value) =>
    values.includes(value);
const nullable =
  (check: Check): Check =>
  (value) =>
    value === null || check(value);
const arrayOf =
  (check: Check): Check =>
  (value) =>
    Array.isArray(value) && value.every(check);

/** Vrai si `value` est un objet qui a exactement les clés de `shape`, chacune valide. */
const objectOf =
  (shape: Record<string, Check>): Check =>
  (value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record);
    return keys.length === Object.keys(shape).length && Object.entries(shape).every(([key, check]) => key in record && check(record[key]));
  };

const isForm = objectOf({
  title: isString,
  url: isString,
  author: isString,
  authorLinkedin: isString,
  language: nullable(oneOf('fr', 'en', 'es')),
  themes: arrayOf(isString),
});

const isSession = objectOf({
  version: oneOf(1),
  databaseId: isString,
  item: objectOf({ id: isString, url: isString }),
  form: isForm,
  savedValues: isForm,
  confirmation: isString,
  expanded: isBoolean,
  sections: arrayOf(objectOf({ id: isString, title: isString, level: oneOf(1, 2, 3) })),
  extracts: arrayOf(objectOf({ blockId: isString, sectionId: nullable(isString), text: isString })),
  lastUsed: isString,
  description: objectOf({ text: isString, savedText: isString }),
  revision: isNumber,
  writer: isString,
});

/**
 * Capture conservée si `raw` a exactement la forme de `CaptureSession`, en version 1 et pour la base `databaseId`
 * de la configuration ; sinon `null` (design.md, décision 2).
 */
export function parseSession(raw: unknown, databaseId: string): CaptureSession | null {
  if (!isSession(raw)) return null;
  const session = raw as CaptureSession;
  return session.databaseId === databaseId ? session : null;
}

/** Capture à écrire à partir de l'état du panneau, sans le surlignage des extraits (design.md, décision 2). */
export function toSession(state: CaptureSessionState, revision: number, writer: string): CaptureSession {
  return {
    version: 1,
    databaseId: state.databaseId,
    item: { ...state.item },
    form: { ...state.form, themes: [...state.form.themes] },
    savedValues: { ...state.savedValues, themes: [...state.savedValues.themes] },
    confirmation: state.confirmation,
    expanded: state.expanded,
    sections: state.sections.map((section) => ({ ...section })),
    extracts: state.extracts.map(({ blockId, sectionId, text }) => ({ blockId, sectionId, text })),
    lastUsed: state.lastUsed,
    description: { ...state.description },
    revision,
    writer,
  };
}

/** Lit la capture conservée pour la base `databaseId` ; une capture rejetée par `parseSession` est effacée. */
export async function readCaptureSession(databaseId: string): Promise<CaptureSession | null> {
  const stored = await browser.storage.local.get(CAPTURE_SESSION_KEY);
  if (!(CAPTURE_SESSION_KEY in stored)) return null;
  const session = parseSession(stored[CAPTURE_SESSION_KEY], databaseId);
  if (session === null) await clearCaptureSession();
  return session;
}

/** Écrit la capture en une seule opération, en remplaçant la précédente. */
export async function writeCaptureSession(session: CaptureSession): Promise<void> {
  await browser.storage.local.set({ [CAPTURE_SESSION_KEY]: session });
}

/** Efface la capture conservée. */
export async function clearCaptureSession(): Promise<void> {
  await browser.storage.local.remove(CAPTURE_SESSION_KEY);
}
