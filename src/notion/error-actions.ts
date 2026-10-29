import { MESSAGES, type ErrorMessage } from './errors';

/** Action proposée sous un message d'erreur du panneau (US-10, design.md, décision 3). */
export type ErrorAction = 'retry' | 'reload-themes' | 'options' | 'finish';

/**
 * Contexte de l'action échouée : lecture des thèmes, création de l'item, action sur l'item existant
 * (métadonnées, ajout d'extrait, description), ou modification et suppression d'un extrait.
 */
export type ErrorContext = 'themes' | 'action' | 'item' | 'extract';

/** Action à proposer pour `message` dans `context`, ou `null` si aucune (table de la décision 3). */
export function errorAction(message: ErrorMessage, context: ErrorContext): ErrorAction | null {
  switch (message) {
    case MESSAGES.network:
    case MESSAGES.unavailable:
    case MESSAGES.changedDatabase:
    case MESSAGES.rateLimited:
      return context === 'themes' ? 'reload-themes' : 'retry';
    case MESSAGES.invalidToken:
    case MESSAGES.inaccessibleDatabase:
      return 'options';
    case MESSAGES.itemNotFound:
      return context === 'item' ? 'finish' : null;
  }
}

/** Erreur affichée par `ErrorNotice` : le message et l'action proposée. */
export interface Notice {
  message: ErrorMessage;
  action: ErrorAction | null;
}

/** Erreur finale d'une action, avec l'action de la table de la décision 3. */
export const failureNotice = (message: ErrorMessage, context: ErrorContext): Notice => ({
  message,
  action: errorAction(message, context),
});

/** « Notion limite les appels » pendant l'attente d'un réessai automatique, sans action (décision 4). */
export const RATE_LIMITED_NOTICE: Notice = { message: MESSAGES.rateLimited, action: null };
