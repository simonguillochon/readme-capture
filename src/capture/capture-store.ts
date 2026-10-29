import { reactive, watch } from 'vue';
import {
  CAPTURE_SESSION_KEY,
  clearCaptureSession,
  parseSession,
  readCaptureSession,
  toSession,
  writeCaptureSession,
  type CaptureSession,
  type CaptureSessionState,
} from './capture-session';
import type { Extract, Section } from './extract-placement';
import { changedFields } from './form-diff';
import type { CaptureFormState } from './form-validation';
import type { SelectionMessage } from './selection-watcher';

/**
 * État de la capture en cours, partagé par `CaptureForm`, `ExtractCapture` et `DescriptionEditor` (US-09, design.md, décision 3).
 * Les objets `form` et `description` ne sont jamais remplacés, seulement modifiés : les composants s'y lient par `toRef`.
 */
export interface CaptureStore {
  // Champs persistants (décision 2).
  databaseId: string | null;
  item: { id: string; url: string } | null;
  form: CaptureFormState;
  savedValues: CaptureFormState | null;
  confirmation: string;
  expanded: boolean;
  sections: Section[];
  extracts: Extract[];
  lastUsed: string;
  description: { text: string; savedText: string };

  // Champs éphémères.
  status: 'editing' | 'creating' | 'created' | 'saving';
  /** Faux à la reprise : le message de confirmation du formulaire n'est pas repris (décision 5). */
  confirmationVisible: boolean;
  creationError: string | null;
  saveError: string | null;
  selection: SelectionMessage | null;
  selectionState: 'waiting' | 'selected' | 'unreadable' | 'added';
  chosen: string | null;
  adding: boolean;
  addError: string | null;
  editing: { blockId: string; text: string; sectionId: string } | null;
  busy: { blockId: string; kind: 'saving' | 'deleting' } | null;
  extractError: { blockId: string; message: string } | null;
  sectionError: string | null;
  descriptionSaving: boolean;
  descriptionError: string | null;
  descriptionConfirmed: boolean;
  /** Incrémenté à chaque remise à zéro : sert de `key` au formulaire, pour le recréer (décision 7). */
  resets: number;
}

function emptyStore(): CaptureStore {
  return {
    databaseId: null,
    item: null,
    form: { title: '', url: '', author: '', authorLinkedin: '', language: null, themes: [] },
    savedValues: null,
    confirmation: 'Item créé dans Readme center',
    expanded: true,
    sections: [],
    extracts: [],
    lastUsed: 'none',
    description: { text: '', savedText: '' },
    status: 'editing',
    confirmationVisible: false,
    creationError: null,
    saveError: null,
    selection: null,
    selectionState: 'waiting',
    chosen: 'none',
    adding: false,
    addError: null,
    editing: null,
    busy: null,
    extractError: null,
    sectionError: null,
    descriptionSaving: false,
    descriptionError: null,
    descriptionConfirmed: false,
    resets: 0,
  };
}

/**
 * Vrai si une métadonnée ou la description diffère de sa valeur enregistrée, ou si un extrait est en cours de
 * modification (design.md, décision 7).
 */
export function hasUnsavedChanges(
  state: Pick<CaptureStore, 'form' | 'savedValues' | 'description' | 'editing'>,
): boolean {
  return (
    (state.savedValues !== null && changedFields(state.savedValues, state.form).length > 0) ||
    state.description.text.trim() !== state.description.savedText ||
    state.editing !== null
  );
}

/** Vrai pendant tout envoi à Notion : création, enregistrement, ajout, modification ou suppression d'extrait (décision 7). */
export function isSending(state: Pick<CaptureStore, 'status' | 'busy' | 'adding' | 'descriptionSaving'>): boolean {
  return (
    state.status === 'creating' || state.status === 'saving' || state.busy !== null || state.adding || state.descriptionSaving
  );
}

// Un seul état par page du panneau.
const store = reactive<CaptureStore>(emptyStore());

export function useCaptureStore(): CaptureStore {
  return store;
}

// Identifiant de ce panneau et dernière révision connue de la capture (décision 4).
const writer = crypto.randomUUID();
let revision = 0;
// Contenu de la dernière capture écrite ou lue, sans `revision` ni `writer`, pour ne pas réécrire une capture inchangée.
let lastContent: string | null = null;

/** Champs persistants du store, ou `null` tant que l'item n'est pas créé. */
function sessionState(): CaptureSessionState | null {
  if (store.item === null || store.databaseId === null || store.savedValues === null) return null;
  return {
    databaseId: store.databaseId,
    item: store.item,
    form: store.form,
    savedValues: store.savedValues,
    confirmation: store.confirmation,
    expanded: store.expanded,
    sections: store.sections,
    extracts: store.extracts,
    lastUsed: store.lastUsed,
    description: store.description,
  };
}

const content = (session: CaptureSession) => JSON.stringify({ ...session, revision: 0, writer: '' });

/** Écrit la capture si elle a changé depuis la dernière écriture ou lecture. */
async function write(state: CaptureSessionState) {
  const session = toSession(state, revision + 1, writer);
  if (content(session) === lastContent) return;
  revision = session.revision;
  lastContent = content(session);
  await writeCaptureSession(session);
}

let pending: ReturnType<typeof setTimeout> | undefined;

/** Écrit la capture immédiatement, par exemple à la création de l'item (décision 4). */
export async function saveCaptureNow(): Promise<void> {
  clearTimeout(pending);
  const state = sessionState();
  if (state) await write(state);
}

/** Remplace les champs persistants du store par ceux de la capture conservée (décisions 5 et 6). */
function applySession(session: CaptureSession) {
  revision = session.revision;
  lastContent = content(session);
  store.databaseId = session.databaseId;
  store.item = { ...session.item };
  Object.assign(store.form, { ...session.form, themes: [...session.form.themes] });
  store.savedValues = { ...session.savedValues, themes: [...session.savedValues.themes] };
  store.confirmation = session.confirmation;
  store.expanded = session.expanded;
  store.sections = session.sections.map((section) => ({ ...section }));
  store.extracts = session.extracts.map((extract) => ({ ...extract, highlight: null }));
  store.lastUsed = session.lastUsed;
  Object.assign(store.description, session.description);
}

/** Vide le store et recrée le formulaire de préparation, sans toucher au stockage (décisions 6 et 7). */
export function resetCaptureStore() {
  clearTimeout(pending);
  revision = 0;
  lastContent = null;
  const { form, description, resets: _resets, ...rest } = emptyStore();
  Object.assign(store.form, form);
  Object.assign(store.description, description);
  Object.assign(store, rest);
  store.resets += 1;
}

/**
 * Termine la capture : vide le store, ce qui recrée le formulaire de préparation pré-rempli depuis l'onglet actif,
 * puis efface la capture conservée, sans appel à Notion (décision 7).
 */
export async function finishCapture(): Promise<void> {
  resetCaptureStore();
  await clearCaptureSession();
}

/**
 * Reporte dans ce panneau un changement de la capture fait dans un autre (décision 6) : une capture plus récente
 * d'un autre panneau remplace les champs persistants, et sa suppression ramène le formulaire de préparation.
 */
function onStorageChanged(changes: Record<string, { newValue?: unknown }>, area: string, databaseId: string) {
  const change = changes[CAPTURE_SESSION_KEY];
  if (area !== 'local' || change === undefined) return;
  if (change.newValue === undefined) {
    if (store.item !== null) resetCaptureStore();
    return;
  }
  const session = parseSession(change.newValue, databaseId);
  if (session === null || session.writer === writer || session.revision <= revision) return;
  applySession(session);
  if (store.status === 'editing') {
    store.status = 'created';
    store.chosen = session.lastUsed;
  }
  // Une section pré-sélectionnée supprimée dans l'autre panneau laisse place à « Sans section », comme en US-07.
  if (store.chosen !== null && store.chosen !== 'none' && store.chosen !== 'new') {
    if (!store.sections.some((section) => section.id === store.chosen)) store.chosen = 'none';
  }
  // Un extrait en cours de modification reste ouvert s'il existe encore.
  if (store.editing && !store.extracts.some((extract) => extract.blockId === store.editing?.blockId)) store.editing = null;
}

/**
 * Reprend la capture conservée pour la base `databaseId`, s'il y en a une valide (décisions 3 et 5), puis écrit
 * chaque changement des champs persistants, regroupé avec les suivants pendant 300 ms (décision 4), et écoute
 * les changements des autres panneaux (décision 6).
 */
export async function loadCaptureStore(databaseId: string): Promise<void> {
  const session = await readCaptureSession(databaseId);
  if (session) {
    applySession(session);
    store.status = 'created';
    store.chosen = session.lastUsed;
  }
  watch(
    () => {
      const state = sessionState();
      return state && toSession(state, 0, writer);
    },
    () => {
      clearTimeout(pending);
      pending = setTimeout(() => void saveCaptureNow(), 300);
    },
    { deep: true },
  );
  browser.storage.onChanged.addListener((changes, area) => onStorageChanged(changes, area, databaseId));
}
