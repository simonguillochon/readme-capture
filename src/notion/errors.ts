import { NotionHttpError, NotionNetworkError } from './client';

/** La base est accessible mais sa structure ne correspond pas à celle attendue. */
export class DatabaseStructureError extends Error {}

export const MESSAGES = {
  network: 'Connexion impossible',
  invalidToken: 'Jeton Notion invalide',
  inaccessibleDatabase: 'Base inaccessible',
  changedDatabase: 'La base Notion a changé',
  rateLimited: 'Notion limite les appels',
  unavailable: 'Notion ne répond pas',
} as const;

export type ErrorMessage = (typeof MESSAGES)[keyof typeof MESSAGES];

/**
 * Message correspondant à la cause la plus probable d'un échec (design.md, décision 6).
 * Tout autre code 4xx et toute réponse illisible sont traités comme une base inaccessible (choix de l'utilisatrice).
 */
export function errorMessage(error: unknown): ErrorMessage {
  if (error instanceof NotionNetworkError) return MESSAGES.network;
  if (error instanceof DatabaseStructureError) return MESSAGES.changedDatabase;
  if (error instanceof NotionHttpError) {
    if (error.status === 401) return MESSAGES.invalidToken;
    if (error.status === 429) return MESSAGES.rateLimited;
    if (error.status >= 500) return MESSAGES.unavailable;
  }
  return MESSAGES.inaccessibleDatabase;
}
