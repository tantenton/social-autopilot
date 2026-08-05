import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostStatus } from '@prisma/client';

// Mock Redis connection
vi.mock('../src/lib/queue', () => {
  const store = new Map<string, string>();
  return {
    redisConnection: {
      set: async (key: string, value: string, mode?: string, duration?: number, flag?: string) => {
        if (flag === 'NX' && store.has(key)) return null;
        store.set(key, value);
        return 'OK';
      },
      get: async (key: string) => store.get(key) || null,
      del: async (key: string) => {
        store.delete(key);
        return 1;
      },
      incr: async () => 1,
      expire: async () => 1,
      _clear: () => store.clear(),
    },
  };
});

// Mock Prisma client
const mockPost = {
  id: 'post-cuid-123',
  platform: 'X',
  status: PostStatus.QUEUED,
  content: {
    id: 'content-cuid-456',
    text: 'Test publish content',
    mediaUrl: 'https://example.com/image.jpg',
  },
};

const mockTransaction = vi.fn().mockImplementation((promises) => Promise.all(promises));
const mockUpdate = vi.fn().mockResolvedValue({ id: 'post-cuid-123', status: PostStatus.PUBLISHED });
const mockFindUnique = vi.fn().mockResolvedValue(mockPost);

vi.mock('../src/lib/db', () => ({
  prisma: {
    post: {
      findUnique: (args: any) => mockFindUnique(args),
      update: (args: any) => mockUpdate(args),
    },
    $transaction: (args: any) => mockTransaction(args),
  },
}));

import publishPostJob from '../workers/jobs/publishPost';
import { redisConnection } from '../src/lib/queue';

describe('Publish Post Worker Job', () => {
  beforeEach(() => {
    (redisConnection as any)._clear();
    vi.clearAllMocks();
  });

  it('validates missing postId parameter', async () => {
    await expect(publishPostJob({ data: {} } as any)).rejects.toThrow('postId string is required');
  });

  it('skips publish if post is already PUBLISHED in database', async () => {
    mockFindUnique.mockResolvedValueOnce({
      ...mockPost,
      status: PostStatus.PUBLISHED,
    });

    const result: any = await publishPostJob({ data: { postId: 'post-cuid-123' } } as any);
    expect(result.skipped).toBe(true);
    expect(result.reason).toContain('Already published in DB');
  });

  it('publishes post successfully and updates DB inside Prisma transaction', async () => {
    mockFindUnique.mockResolvedValueOnce(mockPost);

    const result: any = await publishPostJob({ data: { postId: 'post-cuid-123' } } as any);
    expect(result.success).toBe(true);
    expect(result.externalId).toBeDefined();
    expect(mockTransaction).toHaveBeenCalled();
  });

  it('prevents duplicate execution if another worker acquired the lock', async () => {
    // Acquire lock beforehand
    await redisConnection.set('idempotency:publish:post-cuid-123', 'in_progress', 'EX', 60, 'NX');
    mockFindUnique.mockResolvedValueOnce(mockPost);

    const result: any = await publishPostJob({ data: { postId: 'post-cuid-123' } } as any);
    expect(result.skipped).toBe(true);
  });
});
