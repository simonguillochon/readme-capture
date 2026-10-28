import { headingBlock, quoteBlock, type ExtractBlock, type HeadingLevel } from '@/notion/extract-blocks';

/** Section créée pour l'item ; `id` est l'identifiant de son bloc titre dans Notion. */
export interface Section {
  id: string;
  title: string;
  level: HeadingLevel;
}

/** Extrait ajouté à l'item ; `blockId` est l'identifiant de sa citation dans Notion. */
export interface Extract {
  blockId: string;
  sectionId: string | null;
  text: string;
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
        return { sections, extracts: [...state.extracts, { blockId: quoteId!, sectionId: headingId!, text }] };
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
      extracts: sortByPage([...state.extracts, { blockId: quoteId!, sectionId, text }], state.sections),
    }),
  };
}
