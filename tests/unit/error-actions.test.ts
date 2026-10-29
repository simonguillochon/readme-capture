import { describe, expect, it } from 'vitest';
import { errorAction, type ErrorAction, type ErrorContext } from '@/notion/error-actions';
import { MESSAGES, type ErrorMessage } from '@/notion/errors';

const CONTEXTS: ErrorContext[] = ['themes', 'action', 'item', 'extract'];

// Table de la décision 3 : une ligne par message, une colonne par contexte, dans l'ordre de CONTEXTS.
const TABLE: [ErrorMessage, (ErrorAction | null)[]][] = [
  [MESSAGES.network, ['reload-themes', 'retry', 'retry', 'retry']],
  [MESSAGES.unavailable, ['reload-themes', 'retry', 'retry', 'retry']],
  [MESSAGES.changedDatabase, ['reload-themes', 'retry', 'retry', 'retry']],
  [MESSAGES.rateLimited, ['reload-themes', 'retry', 'retry', 'retry']],
  [MESSAGES.invalidToken, ['options', 'options', 'options', 'options']],
  [MESSAGES.inaccessibleDatabase, ['options', 'options', 'options', 'options']],
  [MESSAGES.itemNotFound, [null, null, 'finish', null]],
];

describe('errorAction', () => {
  it.each(TABLE.flatMap(([message, actions]) => CONTEXTS.map((context, i) => [message, context, actions[i]] as const)))(
    '« %s » en contexte %s → %s',
    (message, context, action) => {
      expect(errorAction(message, context)).toBe(action);
    },
  );

  it('couvre tous les messages', () => {
    expect(TABLE.map(([message]) => message).sort()).toEqual(Object.values(MESSAGES).sort());
  });
});
