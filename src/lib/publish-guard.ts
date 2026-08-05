import { redisConnection } from './queue';

const PUBLISH_RATE_LIMIT_PER_MINUTE = 10;

/**
 * Checks platform rate limit using Redis counter.
 * Throws an error if rate limit is exceeded.
 */
export async function checkPublishRateLimit(platform: string): Promise<void> {
  const currentMinute = Math.floor(Date.now() / 60000);
  const key = `ratelimit:publish:${platform.toUpperCase()}:${currentMinute}`;
  
  const currentCount = await redisConnection.incr(key);
  if (currentCount === 1) {
    await redisConnection.expire(key, 65);
  }

  if (currentCount > PUBLISH_RATE_LIMIT_PER_MINUTE) {
    throw new Error(`Rate limit exceeded for platform ${platform}. Maximum ${PUBLISH_RATE_LIMIT_PER_MINUTE} posts per minute allowed.`);
  }
}

/**
 * Checks idempotency status for a given key.
 * Returns true if key was already processed or in-progress.
 */
export async function isIdempotent(idempotencyKey: string): Promise<boolean> {
  const key = `idempotency:publish:${idempotencyKey}`;
  const existing = await redisConnection.get(key);
  return existing === 'completed' || existing === 'in_progress';
}

/**
 * Marks an idempotency key with a status (in_progress | completed).
 */
export async function setIdempotencyStatus(
  idempotencyKey: string,
  status: 'in_progress' | 'completed',
  ttlSeconds = 86400
): Promise<void> {
  const key = `idempotency:publish:${idempotencyKey}`;
  await redisConnection.set(key, status, 'EX', ttlSeconds);
}
