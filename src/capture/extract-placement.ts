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

/** Vrai si deux titres de section sont identiques, sans tenir compte de la casse ni des espaces en début et fin. */
export const sameTitle = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

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

/** Titre seul d'une nouvelle section, écrit en fin de page (US-14, design.md, décision 2). */
export function placeSection(state: ExtractState, title: string, level: HeadingLevel): Placement {
  const trimmed = title.trim();
  return {
    blocks: [headingBlock(trimmed, level)],
    position: { type: 'end' },
    apply: ([headingId]) => ({ ...state, sections: [...state.sections, { id: headingId!, title: trimmed, level }] }),
  };
}

/** Libellé d'une section dans les menus Section : « H2 · Titre » (US-14, design.md, décision 2). */
export function sectionLabel(section: Section): string {
  return `H${section.level} · ${section.title}`;
}

/**
 * Profondeur de chaque section dans la hiérarchie de la page : nombre de sections qui la contiennent
 * (US-14, design.md, décision 2).
 */
export function sectionDepths(sections: Section[]): Map<string, number> {
  const depths = new Map<string, number>();
  const stack: HeadingLevel[] = [];
  for (const section of sections) {
    while (stack.length > 0 && stack.at(-1)! >= section.level) stack.pop();
    depths.set(section.id, stack.length);
    stack.push(section.level);
  }
  return depths;
}

/**
 * Sections contenues dans une section, à tous les niveaux, et extraits de la section et de ces sections, dans l'ordre
 * de la page (US-14, design.md, décision 2).
 */
export function sectionContents(state: ExtractState, sectionId: string): { sections: Section[]; extracts: Extract[] } {
  const index = state.sections.findIndex((section) => section.id === sectionId);
  const level = state.sections[index]!.level;
  const following = state.sections.slice(index + 1);
  const end = following.findIndex((section) => section.level <= level);
  const sections = end === -1 ? following : following.slice(0, end);
  const ids = new Set([sectionId, ...sections.map((section) => section.id)]);
  return { sections, extracts: state.extracts.filter((extract) => extract.sectionId !== null && ids.has(extract.sectionId)) };
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

/**
 * Opérations et nouvel état d'un extrait modifié (US-07, design.md, décision 3). Dans la même section, la citation est
 * mise à jour ; dans une autre section, elle est écrite à l'emplacement de `placeExtract`, puis l'ancienne est supprimée.
 * L'ancienne section est conservée, même vide (US-14, design.md, décision 2).
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
  ];

  return {
    operations,
    apply: (completed, newBlockId) => {
      if (completed === 0) return state;
      const moved: Extract = { ...extract, blockId: newBlockId!, sectionId, text };
      const kept = completed === 1 ? state.extracts : others.extracts;
      return { ...state, extracts: sortByPage([...kept, moved], state.sections) };
    },
  };
}

/**
 * Opérations et nouvel état d'un extrait supprimé : suppression de sa citation ; sa section est conservée, même vide
 * (US-07, design.md, décision 3 ; US-14, décision 2).
 */
export function deleteExtract(state: ExtractState, blockId: string): ExtractChange {
  const extract = state.extracts.find((candidate) => candidate.blockId === blockId)!;
  const others: ExtractState = { ...state, extracts: state.extracts.filter((candidate) => candidate !== extract) };
  return {
    operations: [{ kind: 'delete-quote', blockId }],
    apply: (completed) => (completed === 0 ? state : others),
  };
}

/**
 * Opérations et nouvel état d'une section supprimée avec tout son contenu (US-14, design.md, décision 2) : ses citations
 * et celles des sections qu'elle contient, dans l'ordre de la page, puis les titres des sections contenues, de la
 * dernière à la première, puis son propre titre. Un échec en cours de route laisse la section avec ce qui reste.
 */
export function deleteSectionChange(state: ExtractState, sectionId: string): ExtractChange {
  const contents = sectionContents(state, sectionId);
  const quoteIds = contents.extracts.map((extract) => extract.blockId);
  const sectionIds = [...contents.sections.map((section) => section.id).reverse(), sectionId];
  // Identifiants des blocs supprimés, dans l'ordre des opérations.
  const blockIds = [...quoteIds, ...sectionIds];

  return {
    operations: [
      ...quoteIds.map((blockId): ExtractOperation => ({ kind: 'delete-quote', blockId })),
      ...sectionIds.map((id): ExtractOperation => ({ kind: 'delete-section', sectionId: id })),
    ],
    apply: (completed) => {
      if (completed === 0) return state;
      const removed = new Set(blockIds.slice(0, completed));
      return {
        sections: state.sections.filter((section) => !removed.has(section.id)),
        extracts: state.extracts.filter((extract) => !removed.has(extract.blockId)),
      };
    },
  };
}

/** Message de confirmation de la suppression d'une section non vide (US-14, design.md, décision 2). */
export function sectionDeletionMessage(quotes: number, sections: number): string {
  const count = (value: number, noun: string) => `${value} ${noun}${value > 1 ? 's' : ''}`;
  const parts = [quotes > 0 ? count(quotes, 'citation') : null, sections > 0 ? count(sections, 'section') : null].filter(Boolean);
  const verb = quotes + sections === 1 ? 'qui sera supprimée' : 'qui seront supprimées';
  return `Cette section contient ${parts.join(' et ')}, ${verb} de Notion.`;
}
