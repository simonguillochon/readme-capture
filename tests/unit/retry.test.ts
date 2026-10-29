import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotionHttpError, NotionNetworkError } from '@/notion/client';
import { withRateLimitRetry } from '@/notion/retry';

const limited = (retryAfter: string | null = null) => new NotionHttpError(429, retryAfter);

/** `run` qui échoue sur chaque erreur de `failures`, dans l'ordre, puis réussit. */
function failing(...failures: Error[]) {
  return vi.fn(async () => {
    const failure = failures.shift();
    if (failure) throw failure;
    return 'ok';
  });
}

describe('withRateLimitRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renvoie le résultat d’un succès direct, sans attente', async () => {
    const run = failing();
    const onRateLimited = vi.fn();

    await expect(withRateLimitRetry(run, onRateLimited)).resolves.toBe('ok');
    expect(run).toHaveBeenCalledTimes(1);
    expect(onRateLimited).not.toHaveBeenCalled();
  });

  it.each([1, 2])('réussit après %i limitation(s)', async (count) => {
    const run = failing(...Array.from({ length: count }, () => limited()));
    const onRateLimited = vi.fn();

    const result = withRateLimitRetry(run, onRateLimited);
    await vi.advanceTimersByTimeAsync(count * 1000);

    await expect(result).resolves.toBe('ok');
    expect(run).toHaveBeenCalledTimes(count + 1);
    expect(onRateLimited).toHaveBeenCalledTimes(count);
  });

  it('propage l’erreur 429 après le 3e réessai', async () => {
    const run = failing(limited(), limited(), limited(), limited());
    const onRateLimited = vi.fn();

    const result = withRateLimitRetry(run, onRateLimited);
    const assertion = expect(result).rejects.toMatchObject({ status: 429 });
    await vi.advanceTimersByTimeAsync(3000);

    await assertion;
    expect(run).toHaveBeenCalledTimes(4);
    expect(onRateLimited).toHaveBeenCalledTimes(3);
  });

  it.each([
    ['absent', null],
    ['illisible', 'bientôt'],
  ])('attend 1 seconde quand Retry-After est %s', async (_cas, retryAfter) => {
    const run = failing(limited(retryAfter));

    const result = withRateLimitRetry(run);
    await vi.advanceTimersByTimeAsync(999);
    expect(run).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);

    await expect(result).resolves.toBe('ok');
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('attend 2 secondes quand Retry-After vaut 2', async () => {
    const run = failing(limited('2'));

    const result = withRateLimitRetry(run);
    await vi.advanceTimersByTimeAsync(1999);
    expect(run).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);

    await expect(result).resolves.toBe('ok');
  });

  it('appelle onRateLimited avant chaque attente', async () => {
    const events: string[] = [];
    const run = vi.fn(async () => {
      events.push('appel');
      if (events.length < 3) throw limited();
      return 'ok';
    });

    const result = withRateLimitRetry(run, () => events.push('limité'));
    await vi.advanceTimersByTimeAsync(1000);
    expect(events).toEqual(['appel', 'limité', 'appel']);
    await vi.advanceTimersByTimeAsync(1000);

    await expect(result).resolves.toBe('ok');
  });

  it.each([
    ['HTTP 500', new NotionHttpError(500, null)],
    ['pas de réseau', new NotionNetworkError('NetworkError')],
  ])('propage immédiatement une autre erreur : %s', async (_cas, error) => {
    const run = failing(error);
    const onRateLimited = vi.fn();

    await expect(withRateLimitRetry(run, onRateLimited)).rejects.toBe(error);
    expect(run).toHaveBeenCalledTimes(1);
    expect(onRateLimited).not.toHaveBeenCalled();
  });
});
