import { describe, it, expect, beforeEach, vi } from 'vitest';

// Vitest mock for Redis connection
vi.mock('../src/lib/queue', () => {
  const store = new Map<string, string>();
  return {
    redisConnection: {
      set: async (key: string, value: string, mode?: string, duration?: number, flag?: string) => {
        if (flag === 'NX' && store.has(key)) {
          return null; // Key exists, NX lock fails
        }
        store.set(key, value);
        return 'OK';
      },
      get: async (key: string) => store.get(key) || null,
      del: async (key: string) => {
        const existed = store.has(key);
        store.delete(key);
        return existed ? 1 : 0;
      },
      incr: async (key: string) => {
        const val = parseInt(store.get(key) || '0', 10) + 1;
        store.set(key, String(val));
        return val;
      },
      expire: async () => 1,
      _clear: () => store.clear(),
    },
  };
});

import {
  acquireIdempotencyLock,
  getIdempotencyStatus,
  setIdempotencyStatus,
  clearIdempotencyStatus,
} from '../src/lib/publish-guard';
import { redisConnection } from '../src/lib/queue';

describe('Idempotency & Atomic Locking', () => {
  beforeEach(() => {
    (redisConnection as any)._clear();
  });

  it('first request acquires lock successfully (NX)', async () => {
    const key = 'test-idempotency-1';
    const acquired = await acquireIdempotencyLock(key, 60);
    expect(acquired).toBe(true);

    const status = await getIdempotencyStatus(key);
    expect(status).toBe('in_progress');
  });

  it('second concurrent request fails to acquire lock', async () => {
    const key = 'test-idempotency-2';
    const first = await acquireIdempotencyLock(key, 60);
    expect(first).toBe(true);

    const second = await acquireIdempotencyLock(key, 60);
    expect(second).toBe(false); // Fails atomic NX lock
  });

  it('completed request status is returned correctly', async () => {
    const key = 'test-idempotency-3';
    await acquireIdempotencyLock(key, 60);
    await setIdempotencyStatus(key, 'completed', 86400);

    const status = await getIdempotencyStatus(key);
    expect(status).toBe('completed');
  });

  it('clearing idempotency lock removes key using DEL (never EX 0)', async () => {
    const key = 'test-idempotency-4';
    await acquireIdempotencyLock(key, 60);
    expect(await getIdempotencyStatus(key)).toBe('in_progress');

    await clearIdempotencyStatus(key);
    expect(await getIdempotencyStatus(key)).toBeNull();
  });

  it('retry after failure can acquire lock again after clearIdempotencyStatus', async () => {
    const key = 'test-idempotency-5';
    // Initial attempt fails
    await acquireIdempotencyLock(key, 60);
    await clearIdempotencyStatus(key);

    // Retry attempt succeeds
    const retryAcquired = await acquireIdempotencyLock(key, 60);
    expect(retryAcquired).toBe(true);
  });
});
