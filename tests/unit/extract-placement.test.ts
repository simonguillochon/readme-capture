import { describe, expect, it } from 'vitest';
import { deleteExtract, editExtract, placeExtract, type ExtractState } from '@/capture/extract-placement';
import { headingBlock, quoteBlock } from '@/notion/extract-blocks';

const empty: ExtractState = { sections: [], extracts: [] };

// Page : une citation sans section, puis « Le constat » avec une citation, puis « Les leviers » sans citation.
const filled: ExtractState = {
  sections: [
    { id: 'titre-constat', title: 'Le constat', level: 2 },
    { id: 'titre-leviers', title: 'Les leviers', level: 2 },
  ],
  extracts: [
    { blockId: 'citation-libre', sectionId: null, text: 'Extrait libre', highlight: null },
    { blockId: 'citation-constat', sectionId: 'titre-constat', text: 'Extrait du constat', highlight: null },
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
    expect(state.extracts.at(-1)).toEqual({ blockId: 'citation-limites', sectionId: 'titre-limites', text: 'Nouveau', highlight: null });
  });

  it('garde les extraits dans l’ordre de la page après un ajout dans une section antérieure', () => {
    const withLeviers: ExtractState = {
      ...filled,
      extracts: [...filled.extracts, { blockId: 'citation-leviers', sectionId: 'titre-leviers', text: 'Extrait des leviers', highlight: null }],
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

// Page : une citation sans section, puis « Le constat » avec deux citations, puis « Les leviers » avec une citation.
const page: ExtractState = {
  sections: [
    { id: 'titre-constat', title: 'Le constat', level: 2 },
    { id: 'titre-leviers', title: 'Les leviers', level: 2 },
  ],
  extracts: [
    { blockId: 'citation-libre', sectionId: null, text: 'Extrait libre', highlight: null },
    { blockId: 'citation-constat-1', sectionId: 'titre-constat', text: 'Premier du constat', highlight: null },
    { blockId: 'citation-constat-2', sectionId: 'titre-constat', text: 'Second du constat', highlight: null },
    { blockId: 'citation-leviers', sectionId: 'titre-leviers', text: 'Extrait des leviers', highlight: null },
  ],
};

const ids = (state: ExtractState) => state.extracts.map((extract) => extract.blockId);

describe('editExtract', () => {
  it('met à jour la citation quand seul le texte change', () => {
    const change = editExtract(page, 'citation-constat-1', 'Texte corrigé', 'titre-constat');
    expect(change.operations).toEqual([{ kind: 'update', blockId: 'citation-constat-1', text: 'Texte corrigé' }]);

    const state = change.apply(1);
    expect(state.sections).toEqual(page.sections);
    expect(state.extracts[1]).toEqual({ blockId: 'citation-constat-1', sectionId: 'titre-constat', text: 'Texte corrigé', highlight: null });
    expect(ids(state)).toEqual(ids(page));
  });

  it('déplace un extrait à la fin d’une section qui a des extraits, puis supprime l’ancienne citation', () => {
    const change = editExtract(page, 'citation-constat-1', 'Premier du constat', 'titre-leviers');
    expect(change.operations).toEqual([
      { kind: 'append', blocks: [quoteBlock('Premier du constat')], position: { type: 'after_block', after_block: { id: 'citation-leviers' } } },
      { kind: 'delete-quote', blockId: 'citation-constat-1' },
    ]);

    const state = change.apply(2, 'citation-deplacee');
    expect(state.sections).toEqual(page.sections);
    expect(ids(state)).toEqual(['citation-libre', 'citation-constat-2', 'citation-leviers', 'citation-deplacee']);
    expect(state.extracts.at(-1)).toEqual({ blockId: 'citation-deplacee', sectionId: 'titre-leviers', text: 'Premier du constat', highlight: null });
  });

  it('déplace un extrait juste après le titre d’une section sans extrait', () => {
    const withEmpty: ExtractState = { ...page, sections: [...page.sections, { id: 'titre-limites', title: 'Les limites', level: 3 }] };
    const change = editExtract(withEmpty, 'citation-constat-1', 'Premier du constat', 'titre-limites');
    expect(change.operations[0]).toEqual({
      kind: 'append',
      blocks: [quoteBlock('Premier du constat')],
      position: { type: 'after_block', after_block: { id: 'titre-limites' } },
    });

    expect(ids(change.apply(2, 'citation-deplacee'))).toEqual([
      'citation-libre',
      'citation-constat-2',
      'citation-leviers',
      'citation-deplacee',
    ]);
  });

  it('déplace un extrait vers « Sans section » après les extraits sans section existants', () => {
    const change = editExtract(page, 'citation-constat-2', 'Second du constat', null);
    expect(change.operations[0]).toEqual({
      kind: 'append',
      blocks: [quoteBlock('Second du constat')],
      position: { type: 'after_block', after_block: { id: 'citation-libre' } },
    });

    expect(ids(change.apply(2, 'citation-deplacee'))).toEqual([
      'citation-libre',
      'citation-deplacee',
      'citation-constat-1',
      'citation-leviers',
    ]);
  });

  it('déplace un extrait vers « Sans section » en début de page quand il n’y a pas d’extrait sans section', () => {
    const withoutFree: ExtractState = { ...page, extracts: page.extracts.slice(1) };
    const change = editExtract(withoutFree, 'citation-leviers', 'Extrait des leviers', null);
    expect(change.operations[0]).toEqual({ kind: 'append', blocks: [quoteBlock('Extrait des leviers')], position: { type: 'start' } });

    const state = change.apply(3, 'citation-deplacee');
    expect(ids(state)).toEqual(['citation-deplacee', 'citation-constat-1', 'citation-constat-2']);
    expect(state.sections.map((section) => section.id)).toEqual(['titre-constat']);
  });

  it('écrit le texte modifié dans la nouvelle section', () => {
    const change = editExtract(page, 'citation-constat-1', 'Texte corrigé', 'titre-leviers');
    expect(change.operations[0]).toMatchObject({ kind: 'append', blocks: [quoteBlock('Texte corrigé')] });
    expect(change.apply(2, 'citation-deplacee').extracts.at(-1)?.text).toBe('Texte corrigé');
  });

  it('supprime le titre de l’ancienne section quand son dernier extrait est déplacé', () => {
    const change = editExtract(page, 'citation-leviers', 'Extrait des leviers', 'titre-constat');
    expect(change.operations).toEqual([
      { kind: 'append', blocks: [quoteBlock('Extrait des leviers')], position: { type: 'after_block', after_block: { id: 'citation-constat-2' } } },
      { kind: 'delete-quote', blockId: 'citation-leviers' },
      { kind: 'delete-section', sectionId: 'titre-leviers' },
    ]);

    const state = change.apply(3, 'citation-deplacee');
    expect(state.sections.map((section) => section.id)).toEqual(['titre-constat']);
    expect(ids(state)).toEqual(['citation-libre', 'citation-constat-1', 'citation-constat-2', 'citation-deplacee']);
  });

  it('garde l’extrait déplacé avec ses autres propriétés', () => {
    const highlighted = { ...page, extracts: page.extracts.map((extract) => ({ ...extract, highlight: { tabId: 7, key: 'cle' } })) };
    const state = editExtract(highlighted, 'citation-constat-1', 'Premier du constat', 'titre-leviers').apply(2, 'citation-deplacee');
    expect(state.extracts.at(-1)).toMatchObject({ blockId: 'citation-deplacee', highlight: { tabId: 7, key: 'cle' } });
  });

  it('ne change rien à l’état quand la première opération échoue', () => {
    expect(editExtract(page, 'citation-constat-1', 'Texte corrigé', 'titre-constat').apply(0)).toBe(page);
    expect(editExtract(page, 'citation-constat-1', 'Texte', 'titre-leviers').apply(0)).toBe(page);
  });

  it('garde l’ancien et le nouvel extrait quand la suppression de l’ancienne citation échoue', () => {
    const state = editExtract(page, 'citation-leviers', 'Extrait des leviers', 'titre-constat').apply(1, 'citation-deplacee');
    expect(ids(state)).toEqual(['citation-libre', 'citation-constat-1', 'citation-constat-2', 'citation-deplacee', 'citation-leviers']);
    expect(state.sections).toEqual(page.sections);
  });

  it('garde la section vidée quand la suppression de son titre échoue', () => {
    const state = editExtract(page, 'citation-leviers', 'Extrait des leviers', 'titre-constat').apply(2, 'citation-deplacee');
    expect(state.sections).toEqual(page.sections);
    expect(state.extracts.some((extract) => extract.sectionId === 'titre-leviers')).toBe(false);
  });
});

describe('deleteExtract', () => {
  it('supprime la citation d’un extrait qui n’est pas le dernier de sa section', () => {
    const change = deleteExtract(page, 'citation-constat-1');
    expect(change.operations).toEqual([{ kind: 'delete-quote', blockId: 'citation-constat-1' }]);

    const state = change.apply(1);
    expect(state.sections).toEqual(page.sections);
    expect(ids(state)).toEqual(['citation-libre', 'citation-constat-2', 'citation-leviers']);
  });

  it('supprime la citation puis le titre de la section quand c’est son dernier extrait', () => {
    const change = deleteExtract(page, 'citation-leviers');
    expect(change.operations).toEqual([
      { kind: 'delete-quote', blockId: 'citation-leviers' },
      { kind: 'delete-section', sectionId: 'titre-leviers' },
    ]);

    const state = change.apply(2);
    expect(state.sections.map((section) => section.id)).toEqual(['titre-constat']);
    expect(ids(state)).toEqual(['citation-libre', 'citation-constat-1', 'citation-constat-2']);
  });

  it('supprime un extrait sans section sans toucher aux sections', () => {
    const change = deleteExtract(page, 'citation-libre');
    expect(change.operations).toEqual([{ kind: 'delete-quote', blockId: 'citation-libre' }]);
    expect(change.apply(1)).toEqual({ sections: page.sections, extracts: page.extracts.slice(1) });
  });

  it('garde la section vidée quand la suppression de son titre échoue', () => {
    const state = deleteExtract(page, 'citation-leviers').apply(1);
    expect(state.sections).toEqual(page.sections);
    expect(ids(state)).toEqual(['citation-libre', 'citation-constat-1', 'citation-constat-2']);
  });

  it('ne change rien à l’état quand la suppression de la citation échoue', () => {
    expect(deleteExtract(page, 'citation-constat-1').apply(0)).toBe(page);
  });
});
