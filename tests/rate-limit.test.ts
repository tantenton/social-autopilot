import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../src/lib/queue', () => {
  const store = new Map<string, string>();
  return {
    redisConnection: {
      set: async (key: string, value: string) => {
        store.set(key, value);
        return 'OK';
      },
      get: async (key: string) => store.get(key) || null,
      del: async (key: string) => {
        store.delete(key);
        return 1;
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

import { checkPublishRateLimit } from '../src/lib/publish-guard';
import { RateLimitError } from '../src/lib/errors';
import { redisConnection } from '../src/lib/queue';

describe('Publish Rate Limiting', () => {
  beforeEach(() => {
    (redisConnection as any)._clear();
  });

  it('allows requests within limit threshold (10 req/min)', async () => {
    const platform = 'X';
    for (let i = 0; i < 10; i++) {
      await expect(checkPublishRateLimit(platform)).resolves.not.toThrow();
    }
  });

  it('rejects 11th request exceeding limit threshold with RateLimitError (HTTP 429)', async () => {
    const platform = 'TIKTOK';
    for (let i = 0; i < 10; i++) {
      await checkPublishRateLimit(platform);
    }

    await expect(checkPublishRateLimit(platform)).rejects.toThrow(RateLimitError);
  });
});
