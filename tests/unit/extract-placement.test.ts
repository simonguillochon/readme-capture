import { describe, expect, it } from 'vitest';
import {
  deleteExtract,
  deleteSectionChange,
  editExtract,
  placeExtract,
  placeSection,
  sectionContents,
  sectionDeletionMessage,
  sectionDepths,
  sectionLabel,
  type ExtractState,
} from '@/capture/extract-placement';
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

describe('placeSection', () => {
  it('écrit seulement le titre, sans espaces en début et fin, en fin de page', () => {
    const placement = placeSection(filled, '  Some Notes on Nomenclature ', 1);
    expect(placement.blocks).toEqual([headingBlock('Some Notes on Nomenclature', 1)]);
    expect(placement.position).toEqual({ type: 'end' });
  });

  it('ajoute la section à la fin des sections, sans toucher aux extraits', () => {
    const state = placeSection(filled, 'Les limites', 3).apply(['titre-limites']);
    expect(state.sections).toEqual([...filled.sections, { id: 'titre-limites', title: 'Les limites', level: 3 }]);
    expect(state.extracts).toEqual(filled.extracts);
  });
});

describe('sectionLabel', () => {
  it('préfixe le titre par son niveau', () => {
    expect(sectionLabel({ id: 'titre', title: 'Some Notes on Nomenclature', level: 1 })).toBe('H1 · Some Notes on Nomenclature');
    expect(sectionLabel({ id: 'titre', title: 'Les leviers', level: 2 })).toBe('H2 · Les leviers');
  });
});

const sectionsOf = (...levels: (1 | 2 | 3)[]) => levels.map((level, index) => ({ id: `s${index}`, title: `Section ${index}`, level }));

describe('sectionDepths', () => {
  it.each([
    [[1, 2, 3], [0, 1, 2]],
    [[2], [0]],
    [[1, 2, 1, 3], [0, 1, 0, 1]],
    [[1, 3, 2], [0, 1, 1]],
    [[2, 1, 2], [0, 0, 1]],
  ] as const)('niveaux %j → profondeurs %j', (levels, expected) => {
    const sections = sectionsOf(...levels);
    expect(sections.map((section) => sectionDepths(sections).get(section.id))).toEqual(expected);
  });
});

// Page : « Nomenclature » (H1) avec une citation, « Experimentation » (H2) avec une citation, « Definitions » (H3) vide,
// puis « Overview » (H1) avec une citation.
const nested: ExtractState = {
  sections: [
    { id: 'titre-nomenclature', title: 'Some Notes on Nomenclature', level: 1 },
    { id: 'titre-experimentation', title: '– Experimentation', level: 2 },
    { id: 'titre-definitions', title: 'Definitions', level: 3 },
    { id: 'titre-overview', title: 'Overview', level: 1 },
  ],
  extracts: [
    { blockId: 'citation-libre', sectionId: null, text: 'Extrait libre', highlight: null },
    { blockId: 'citation-nomenclature', sectionId: 'titre-nomenclature', text: 'Nomenclature', highlight: null },
    { blockId: 'citation-experimentation', sectionId: 'titre-experimentation', text: 'Experimentation', highlight: null },
    { blockId: 'citation-overview', sectionId: 'titre-overview', text: 'Overview', highlight: null },
  ],
};

describe('sectionContents', () => {
  it('renvoie les sections de niveau plus bas qui suivent, jusqu’à une section de niveau égal ou supérieur, et leurs extraits', () => {
    const contents = sectionContents(nested, 'titre-nomenclature');
    expect(contents.sections.map((section) => section.id)).toEqual(['titre-experimentation', 'titre-definitions']);
    expect(contents.extracts.map((extract) => extract.blockId)).toEqual(['citation-nomenclature', 'citation-experimentation']);
  });

  it('s’arrête à une section de même niveau', () => {
    const contents = sectionContents(nested, 'titre-definitions');
    expect(contents).toEqual({ sections: [], extracts: [] });
  });

  it('renvoie les seuls extraits d’une section sans sous-section', () => {
    const contents = sectionContents(nested, 'titre-overview');
    expect(contents.sections).toEqual([]);
    expect(contents.extracts.map((extract) => extract.blockId)).toEqual(['citation-overview']);
  });

  it('s’arrête à une section de niveau supérieur', () => {
    const contents = sectionContents(nested, 'titre-experimentation');
    expect(contents.sections.map((section) => section.id)).toEqual(['titre-definitions']);
    expect(contents.extracts.map((extract) => extract.blockId)).toEqual(['citation-experimentation']);
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

    expect(change.operations).toHaveLength(2);

    const state = change.apply(2, 'citation-deplacee');
    expect(ids(state)).toEqual(['citation-deplacee', 'citation-constat-1', 'citation-constat-2']);
    expect(state.sections).toEqual(page.sections);
  });

  it('écrit le texte modifié dans la nouvelle section', () => {
    const change = editExtract(page, 'citation-constat-1', 'Texte corrigé', 'titre-leviers');
    expect(change.operations[0]).toMatchObject({ kind: 'append', blocks: [quoteBlock('Texte corrigé')] });
    expect(change.apply(2, 'citation-deplacee').extracts.at(-1)?.text).toBe('Texte corrigé');
  });

  it('garde le titre de l’ancienne section quand son dernier extrait est déplacé', () => {
    const change = editExtract(page, 'citation-leviers', 'Extrait des leviers', 'titre-constat');
    expect(change.operations).toEqual([
      { kind: 'append', blocks: [quoteBlock('Extrait des leviers')], position: { type: 'after_block', after_block: { id: 'citation-constat-2' } } },
      { kind: 'delete-quote', blockId: 'citation-leviers' },
    ]);

    const state = change.apply(2, 'citation-deplacee');
    expect(state.sections).toEqual(page.sections);
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
});

describe('deleteExtract', () => {
  it('supprime la citation d’un extrait qui n’est pas le dernier de sa section', () => {
    const change = deleteExtract(page, 'citation-constat-1');
    expect(change.operations).toEqual([{ kind: 'delete-quote', blockId: 'citation-constat-1' }]);

    const state = change.apply(1);
    expect(state.sections).toEqual(page.sections);
    expect(ids(state)).toEqual(['citation-libre', 'citation-constat-2', 'citation-leviers']);
  });

  it('supprime seulement la citation et garde le titre de la section quand c’est son dernier extrait', () => {
    const change = deleteExtract(page, 'citation-leviers');
    expect(change.operations).toEqual([{ kind: 'delete-quote', blockId: 'citation-leviers' }]);

    const state = change.apply(1);
    expect(state.sections).toEqual(page.sections);
    expect(ids(state)).toEqual(['citation-libre', 'citation-constat-1', 'citation-constat-2']);
  });

  it('supprime un extrait sans section sans toucher aux sections', () => {
    const change = deleteExtract(page, 'citation-libre');
    expect(change.operations).toEqual([{ kind: 'delete-quote', blockId: 'citation-libre' }]);
    expect(change.apply(1)).toEqual({ sections: page.sections, extracts: page.extracts.slice(1) });
  });

  it('ne change rien à l’état quand la suppression de la citation échoue', () => {
    expect(deleteExtract(page, 'citation-constat-1').apply(0)).toBe(page);
  });
});

describe('deleteSectionChange', () => {
  it('supprime les citations dans l’ordre de la page, puis les sections contenues de la dernière à la première, puis la section', () => {
    expect(deleteSectionChange(nested, 'titre-nomenclature').operations).toEqual([
      { kind: 'delete-quote', blockId: 'citation-nomenclature' },
      { kind: 'delete-quote', blockId: 'citation-experimentation' },
      { kind: 'delete-section', sectionId: 'titre-definitions' },
      { kind: 'delete-section', sectionId: 'titre-experimentation' },
      { kind: 'delete-section', sectionId: 'titre-nomenclature' },
    ]);
  });

  it('retire la section et tout son contenu de l’état, sans toucher au reste', () => {
    const state = deleteSectionChange(nested, 'titre-nomenclature').apply(5);
    expect(state.sections.map((section) => section.id)).toEqual(['titre-overview']);
    expect(ids(state)).toEqual(['citation-libre', 'citation-overview']);
  });

  it('ne retire que les blocs des opérations réussies après un échec en cours de route', () => {
    const change = deleteSectionChange(nested, 'titre-nomenclature');
    const afterFirstQuote = change.apply(1);
    expect(afterFirstQuote.sections).toEqual(nested.sections);
    expect(ids(afterFirstQuote)).toEqual(['citation-libre', 'citation-experimentation', 'citation-overview']);

    const afterDefinitions = change.apply(3);
    expect(afterDefinitions.sections.map((section) => section.id)).toEqual(['titre-nomenclature', 'titre-experimentation', 'titre-overview']);
    expect(ids(afterDefinitions)).toEqual(['citation-libre', 'citation-overview']);
  });

  it('ne change rien à l’état quand la première opération échoue', () => {
    expect(deleteSectionChange(nested, 'titre-nomenclature').apply(0)).toBe(nested);
  });

  it('supprime seulement le titre d’une section vide', () => {
    const change = deleteSectionChange(nested, 'titre-definitions');
    expect(change.operations).toEqual([{ kind: 'delete-section', sectionId: 'titre-definitions' }]);
    expect(change.apply(1).sections.map((section) => section.id)).toEqual(['titre-nomenclature', 'titre-experimentation', 'titre-overview']);
  });
});

describe('sectionDeletionMessage', () => {
  it.each([
    [2, 1, 'Cette section contient 2 citations et 1 section, qui seront supprimées de Notion.'],
    [1, 0, 'Cette section contient 1 citation, qui sera supprimée de Notion.'],
    [0, 2, 'Cette section contient 2 sections, qui seront supprimées de Notion.'],
    [0, 1, 'Cette section contient 1 section, qui sera supprimée de Notion.'],
    [1, 1, 'Cette section contient 1 citation et 1 section, qui seront supprimées de Notion.'],
  ])('%i citation(s) et %i section(s)', (quotes, sections, message) => {
    expect(sectionDeletionMessage(quotes, sections)).toBe(message);
  });
});
