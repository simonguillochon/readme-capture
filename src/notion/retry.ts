import { NotionHttpError } from './client';

// Réessais après une limitation (429) : 3 au maximum, 1 s si Retry-After est absent ou illisible (choix de l'utilisatrice).
const MAX_RATE_LIMIT_RETRIES = 3;
const DEFAULT_RETRY_AFTER_SECONDS = 1;

function retryDelayMs(retryAfter: string | null): number {
  const seconds = retryAfter === null ? Number.NaN : Number(retryAfter);
  return (Number.isFinite(seconds) && seconds >= 0 ? seconds : DEFAULT_RETRY_AFTER_SECONDS) * 1000;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Exécute `run` et le relance après le délai indiqué par Notion en cas de limitation, au plus 3 fois ;
 * après le 3e réessai, l'erreur 429 est propagée (US-10, design.md, décision 2).
 * `onRateLimited` est appelé avant chaque attente, pour afficher « Notion limite les appels ».
 */
export async function withRateLimitRetry<T>(run: () => Promise<T>, onRateLimited: () => void = () => {}): Promise<T> {
  for (let retries = 0; ; retries++) {
    try {
      return await run();
    } catch (error) {
      if (error instanceof NotionHttpError && error.status === 429 && retries < MAX_RATE_LIMIT_RETRIES) {
        onRateLimited();
        await sleep(retryDelayMs(error.retryAfter));
        continue;
      }
      throw error;
    }
  }
}
