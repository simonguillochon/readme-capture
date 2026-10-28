import { describe, expect, it } from 'vitest';
import { placeExtract, type ExtractState } from '@/capture/extract-placement';
import { headingBlock, quoteBlock } from '@/notion/extract-blocks';

const empty: ExtractState = { sections: [], extracts: [] };

// Page : une citation sans section, puis « Le constat » avec une citation, puis « Les leviers » sans citation.
const filled: ExtractState = {
  sections: [
    { id: 'titre-constat', title: 'Le constat', level: 2 },
    { id: 'titre-leviers', title: 'Les leviers', level: 2 },
  ],
  extracts: [
    { blockId: 'citation-libre', sectionId: null, text: 'Extrait libre' },
    { blockId: 'citation-constat', sectionId: 'titre-constat', text: 'Extrait du constat' },
  ],
};

describe('placeExtract', () => {
  it('place un extrait sans section en début de page quand il n’y en a pas encore', () => {
    const placement = placeExtract({ ...filled, extracts: filled.extracts.slice(1) }, { kind: 'none' }, 'Nouveau');
    expect(placement.blocks).toEqual([quoteBlock('Nouveau')]);
    expect(placement.position).toEqual({ type: 'start' });
  });

  it('place un extrait sans section après le dernier extrait sans section', () => {
    const placement = placeExtract(filled, { kind: 'none' }, 'Nouveau');
    expect(placement.blocks).toEqual([quoteBlock('Nouveau')]);
    expect(placement.position).toEqual({ type: 'after_block', after_block: { id: 'citation-libre' } });
  });

  it('place un extrait juste après le titre d’une section sans extrait', () => {
    const placement = placeExtract(filled, { kind: 'section', id: 'titre-leviers' }, 'Nouveau');
    expect(placement.blocks).toEqual([quoteBlock('Nouveau')]);
    expect(placement.position).toEqual({ type: 'after_block', after_block: { id: 'titre-leviers' } });
  });

  it('place un extrait après le dernier extrait de sa section', () => {
    const placement = placeExtract(filled, { kind: 'section', id: 'titre-constat' }, 'Nouveau');
    expect(placement.position).toEqual({ type: 'after_block', after_block: { id: 'citation-constat' } });
  });

  it('écrit le titre puis la citation d’une nouvelle section en fin de page', () => {
    const placement = placeExtract(empty, { kind: 'new', title: '  Le constat ', level: 2 }, 'Nouveau');
    expect(placement.blocks).toEqual([headingBlock('Le constat', 2), quoteBlock('Nouveau')]);
    expect(placement.position).toEqual({ type: 'end' });
  });

  it('réutilise une section de même nom, sans tenir compte de la casse ni des espaces', () => {
    const placement = placeExtract(filled, { kind: 'new', title: '  le CONSTAT ', level: 1 }, 'Nouveau');
    expect(placement.blocks).toEqual([quoteBlock('Nouveau')]);
    expect(placement.position).toEqual({ type: 'after_block', after_block: { id: 'citation-constat' } });
    expect(placement.apply(['citation-2']).sections).toEqual(filled.sections);
  });

  it('ajoute la nouvelle section et son extrait à l’état', () => {
    const state = placeExtract(filled, { kind: 'new', title: 'Les limites', level: 3 }, 'Nouveau').apply(['titre-limites', 'citation-limites']);
    expect(state.sections.at(-1)).toEqual({ id: 'titre-limites', title: 'Les limites', level: 3 });
    expect(state.extracts.at(-1)).toEqual({ blockId: 'citation-limites', sectionId: 'titre-limites', text: 'Nouveau' });
  });

  it('garde les extraits dans l’ordre de la page après un ajout dans une section antérieure', () => {
    const withLeviers: ExtractState = {
      ...filled,
      extracts: [...filled.extracts, { blockId: 'citation-leviers', sectionId: 'titre-leviers', text: 'Extrait des leviers' }],
    };
    const state = placeExtract(withLeviers, { kind: 'section', id: 'titre-constat' }, 'Nouveau').apply(['citation-constat-2']);
    expect(state.extracts.map((extract) => extract.blockId)).toEqual([
      'citation-libre',
      'citation-constat',
      'citation-constat-2',
      'citation-leviers',
    ]);
  });

  it('garde les extraits sans section en tête après un ajout sans section', () => {
    const state = placeExtract(filled, { kind: 'none' }, 'Nouveau').apply(['citation-libre-2']);
    expect(state.extracts.map((extract) => extract.blockId)).toEqual(['citation-libre', 'citation-libre-2', 'citation-constat']);
  });
});
