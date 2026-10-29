import { headingBlock, quoteBlock, type ExtractBlock, type HeadingLevel } from '@/notion/extract-blocks';

/** Section créée pour l'item ; `id` est l'identifiant de son bloc titre dans Notion. */
export interface Section {
  id: string;
  title: string;
  level: HeadingLevel;
}

/** Surlignage d'un extrait : onglet où il a été surligné et clé locale (US-07, design.md, décision 5). */
export interface ExtractHighlight {
  tabId: number;
  key: string;
}

/** Extrait ajouté à l'item ; `blockId` est l'identifiant de sa citation dans Notion. */
export interface Extract {
  blockId: string;
  sectionId: string | null;
  text: string;
  /** `null` quand l'extrait n'a pas été surligné. */
  highlight: ExtractHighlight | null;
}

/** Sections dans l'ordre de création et extraits dans l'ordre de la page (US-06, design.md, décision 3). */
export interface ExtractState {
  sections: Section[];
  extracts: Extract[];
}

export type ExtractTarget =
  | { kind: 'none' }
  | { kind: 'section'; id: string }
  | { kind: 'new'; title: string; level: HeadingLevel };

export type BlockPosition =
  | { type: 'start' }
  | { type: 'end' }
  | { type: 'after_block'; after_block: { id: string } };

export interface Placement {
  blocks: ExtractBlock[];
  position: BlockPosition;
  /** Nouvel état, une fois connus les identifiants des blocs créés par Notion, dans l'ordre de `blocks`. */
  apply(blockIds: string[]): ExtractState;
}

const sameTitle = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const after = (id: string): BlockPosition => ({ type: 'after_block', after_block: { id } });

/** Range les extraits dans l'ordre de la page : sans section d'abord, puis section par section. */
function sortByPage(extracts: Extract[], sections: Section[]): Extract[] {
  const rank = (extract: Extract) => (extract.sectionId === null ? -1 : sections.findIndex((s) => s.id === extract.sectionId));
  return [...extracts].sort((a, b) => rank(a) - rank(b));
}

/**
 * Blocs à écrire et position d'un nouvel extrait dans la page Notion de l'item (US-06, design.md, décision 4).
 * Une nouvelle section dont le titre est celui d'une section existante, sans tenir compte de la casse ni des espaces
 * en début et fin, est traitée comme cette section.
 */
export function placeExtract(state: ExtractState, target: ExtractTarget, text: string): Placement {
  const existing = target.kind === 'new' ? state.sections.find((section) => sameTitle(section.title, target.title)) : undefined;
  const resolved: ExtractTarget = existing ? { kind: 'section', id: existing.id } : target;

  if (resolved.kind === 'new') {
    const title = resolved.title.trim();
    return {
      blocks: [headingBlock(title, resolved.level), quoteBlock(text)],
      position: { type: 'end' },
      apply: ([headingId, quoteId]) => {
        const sections = [...state.sections, { id: headingId!, title, level: resolved.level }];
        return { sections, extracts: [...state.extracts, { blockId: quoteId!, sectionId: headingId!, text, highlight: null }] };
      },
    };
  }

  const sectionId = resolved.kind === 'section' ? resolved.id : null;
  const lastInGroup = state.extracts.filter((extract) => extract.sectionId === sectionId).at(-1);
  let position: BlockPosition;
  if (lastInGroup) position = after(lastInGroup.blockId);
  else if (sectionId !== null) position = after(sectionId);
  else position = { type: 'start' };

  return {
    blocks: [quoteBlock(text)],
    position,
    apply: ([quoteId]) => ({
      sections: state.sections,
      extracts: sortByPage([...state.extracts, { blockId: quoteId!, sectionId, text, highlight: null }], state.sections),
    }),
  };
}

/** Appel Notion d'une modification, d'un déplacement ou d'une suppression (US-07, design.md, décision 3). */
export type ExtractOperation =
  | { kind: 'update'; blockId: string; text: string }
  | { kind: 'append'; blocks: ExtractBlock[]; position: BlockPosition }
  | { kind: 'delete-quote'; blockId: string }
  | { kind: 'delete-section'; sectionId: string };

export interface ExtractChange {
  /** Opérations à envoyer une par une, dans l'ordre. */
  operations: ExtractOperation[];
  /**
   * Nouvel état une fois les `completed` premières opérations réussies, avec l'identifiant de la citation créée
   * par un déplacement (US-07, design.md, décision 4).
   */
  apply(completed: number, newBlockId?: string): ExtractState;
}

/** Retire la section si plus aucun extrait n'y est rangé. */
function withoutEmptySection(state: ExtractState, sectionId: string | null): ExtractState {
  if (sectionId === null || state.extracts.some((extract) => extract.sectionId === sectionId)) return state;
  return { ...state, sections: state.sections.filter((section) => section.id !== sectionId) };
}

/** Suppression du titre d'une section, si elle est vide dans `state`. */
function emptySectionOperations(state: ExtractState, sectionId: string | null): ExtractOperation[] {
  return withoutEmptySection(state, sectionId) === state ? [] : [{ kind: 'delete-section', sectionId: sectionId! }];
}

/**
 * Opérations et nouvel état d'un extrait modifié (US-07, design.md, décision 3). Dans la même section, la citation est
 * mise à jour ; dans une autre section, elle est écrite à l'emplacement de `placeExtract`, puis l'ancienne est supprimée,
 * ainsi que le titre de l'ancienne section si elle est vide.
 */
export function editExtract(state: ExtractState, blockId: string, text: string, sectionId: string | null): ExtractChange {
  const extract = state.extracts.find((candidate) => candidate.blockId === blockId)!;

  if (extract.sectionId === sectionId) {
    return {
      operations: [{ kind: 'update', blockId, text }],
      apply: (completed) =>
        completed === 0
          ? state
          : { ...state, extracts: state.extracts.map((candidate) => (candidate === extract ? { ...extract, text } : candidate)) },
    };
  }

  const others: ExtractState = { ...state, extracts: state.extracts.filter((candidate) => candidate !== extract) };
  const target: ExtractTarget = sectionId === null ? { kind: 'none' } : { kind: 'section', id: sectionId };
  const { blocks, position } = placeExtract(others, target, text);
  const operations: ExtractOperation[] = [
    { kind: 'append', blocks, position },
    { kind: 'delete-quote', blockId },
    ...emptySectionOperations(others, extract.sectionId),
  ];

  return {
    operations,
    apply: (completed, newBlockId) => {
      if (completed === 0) return state;
      const moved: Extract = { ...extract, blockId: newBlockId!, sectionId, text };
      const kept = completed === 1 ? state.extracts : others.extracts;
      const next: ExtractState = { ...state, extracts: sortByPage([...kept, moved], state.sections) };
      return completed === operations.length ? withoutEmptySection(next, extract.sectionId) : next;
    },
  };
}

/**
 * Opérations et nouvel état d'un extrait supprimé : suppression de sa citation, puis du titre de sa section si elle est
 * vide (US-07, design.md, décision 3).
 */
export function deleteExtract(state: ExtractState, blockId: string): ExtractChange {
  const extract = state.extracts.find((candidate) => candidate.blockId === blockId)!;
  const others: ExtractState = { ...state, extracts: state.extracts.filter((candidate) => candidate !== extract) };
  const operations: ExtractOperation[] = [{ kind: 'delete-quote', blockId }, ...emptySectionOperations(others, extract.sectionId)];

  return {
    operations,
    apply: (completed) => {
      if (completed === 0) return state;
      return completed === operations.length ? withoutEmptySection(others, extract.sectionId) : others;
    },
  };
}
