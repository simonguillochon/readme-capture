import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  clearCaptureSession,
  parseSession,
  readCaptureSession,
  toSession,
  writeCaptureSession,
  type CaptureSession,
  type CaptureSessionState,
} from '@/capture/capture-session';
import type { CaptureFormState } from '@/capture/form-validation';

const DATABASE_ID = '0123456789abcdef0123456789abcdef';

const form: CaptureFormState = {
  title: 'What a workplace can’t promise',
  url: 'https://exemple.substack.com/p/un-article',
  author: 'Camille Martin',
  authorLinkedin: '',
  language: 'en',
  themes: ['Management'],
};

const state: CaptureSessionState = {
  databaseId: DATABASE_ID,
  item: { id: 'page-1', url: 'https://www.notion.so/page-1' },
  form: { ...form, author: 'C. Martin' },
  savedValues: form,
  confirmation: 'Item créé dans Readme center',
  expanded: false,
  sections: [{ id: 'heading-1', title: 'Le constat', level: 2 }],
  extracts: [
    { blockId: 'quote-1', sectionId: 'heading-1', text: 'Culture is what people do.', highlight: { tabId: 4, key: 'h-1' } },
    { blockId: 'quote-2', sectionId: null, text: 'No one is watching.', highlight: null },
  ],
  lastUsed: 'heading-1',
  description: { text: 'Une culture se lit dans les arbitrages. ', savedText: '' },
};

const session: CaptureSession = toSession(state, 3, 'panneau-a');

describe('toSession', () => {
  it('construit la capture avec tous ses champs', () => {
    expect(session).toEqual({
      version: 1,
      databaseId: DATABASE_ID,
      item: { id: 'page-1', url: 'https://www.notion.so/page-1' },
      form: { ...form, author: 'C. Martin' },
      savedValues: form,
      confirmation: 'Item créé dans Readme center',
      expanded: false,
      sections: [{ id: 'heading-1', title: 'Le constat', level: 2 }],
      extracts: [
        { blockId: 'quote-1', sectionId: 'heading-1', text: 'Culture is what people do.' },
        { blockId: 'quote-2', sectionId: null, text: 'No one is watching.' },
      ],
      lastUsed: 'heading-1',
      description: { text: 'Une culture se lit dans les arbitrages. ', savedText: '' },
      revision: 3,
      writer: 'panneau-a',
    });
  });

  it('retire le surlignage de chaque extrait', () => {
    for (const extract of session.extracts) expect(extract).not.toHaveProperty('highlight');
  });
});

describe('parseSession', () => {
  it('renvoie une capture valide de la base configurée', () => {
    expect(parseSession(structuredClone(session), DATABASE_ID)).toEqual(session);
  });

  it('rejette une capture d’une autre base', () => {
    expect(parseSession(session, 'fedcba9876543210fedcba9876543210')).toBeNull();
  });

  it('rejette une version inconnue', () => {
    expect(parseSession({ ...session, version: 2 }, DATABASE_ID)).toBeNull();
  });

  it('rejette une capture à laquelle il manque un champ', () => {
    const { description: _description, ...incomplete } = session;
    expect(parseSession(incomplete, DATABASE_ID)).toBeNull();
  });

  it('rejette un champ imbriqué invalide', () => {
    expect(parseSession({ ...session, sections: [{ id: 'heading-1', title: 'Le constat', level: 4 }] }, DATABASE_ID)).toBeNull();
  });

  it.each([null, undefined, 'captureSession', 42, []])('rejette une valeur qui n’est pas un objet : %s', (raw) => {
    expect(parseSession(raw, DATABASE_ID)).toBeNull();
  });
});

describe('stockage de captureSession', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('renvoie null quand aucune capture n’est conservée', async () => {
    expect(await readCaptureSession(DATABASE_ID)).toBeNull();
  });

  it('relit la capture écrite sous la clé captureSession du stockage local', async () => {
    await writeCaptureSession(session);

    expect(await readCaptureSession(DATABASE_ID)).toEqual(session);
    expect(await fakeBrowser.storage.local.get('captureSession')).toEqual({ captureSession: session });
  });

  it('efface une capture rejetée à la lecture', async () => {
    await writeCaptureSession(session);

    expect(await readCaptureSession('fedcba9876543210fedcba9876543210')).toBeNull();
    expect(await fakeBrowser.storage.local.get('captureSession')).toEqual({});
  });

  it('efface la capture sans toucher à la configuration', async () => {
    await fakeBrowser.storage.local.set({ notionConfig: { databaseId: DATABASE_ID } });
    await writeCaptureSession(session);

    await clearCaptureSession();

    expect(await fakeBrowser.storage.local.get(null)).toEqual({ notionConfig: { databaseId: DATABASE_ID } });
  });
});
