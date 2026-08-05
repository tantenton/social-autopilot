import { redisConnection } from './queue';
import { RateLimitError } from './errors';

const PUBLISH_RATE_LIMIT_PER_MINUTE = 10;

/**
 * Atomic lock acquisition using Redis SET key value EX ttl NX.
 * Returns true if lock was successfully acquired, false if key already exists.
 */
export async function acquireIdempotencyLock(
  idempotencyKey: string,
  ttlSeconds = 60
): Promise<boolean> {
  const key = `idempotency:publish:${idempotencyKey}`;
  const result = await redisConnection.set(key, 'in_progress', 'EX', ttlSeconds, 'NX');
  return result === 'OK';
}

/**
 * Reads the current idempotency status for a given key.
 * Returns 'in_progress' | 'completed' | null.
 */
export async function getIdempotencyStatus(
  idempotencyKey: string
): Promise<'in_progress' | 'completed' | null> {
  const key = `idempotency:publish:${idempotencyKey}`;
  const val = await redisConnection.get(key);
  if (val === 'completed' || val === 'in_progress') {
    return val;
  }
  return null;
}

/**
 * Sets idempotency status (typically 'completed') with a given TTL.
 */
export async function setIdempotencyStatus(
  idempotencyKey: string,
  status: 'completed' | 'in_progress',
  ttlSeconds = 86400
): Promise<void> {
  const key = `idempotency:publish:${idempotencyKey}`;
  await redisConnection.set(key, status, 'EX', ttlSeconds);
}

/**
 * Safely clears an idempotency key using Redis DEL command.
 * Never uses EX 0.
 */
export async function clearIdempotencyStatus(idempotencyKey: string): Promise<void> {
  const key = `idempotency:publish:${idempotencyKey}`;
  await redisConnection.del(key);
}

/**
 * Checks platform publish rate limit atomically via Redis.
 * Throws RateLimitError (HTTP 429) if current minute threshold is exceeded.
 */
export async function checkPublishRateLimit(platform: string): Promise<void> {
  const currentMinute = Math.floor(Date.now() / 60000);
  const key = `ratelimit:publish:${platform.toUpperCase()}:${currentMinute}`;

  const currentCount = await redisConnection.incr(key);
  if (currentCount === 1) {
    await redisConnection.expire(key, 65);
  }

  if (currentCount > PUBLISH_RATE_LIMIT_PER_MINUTE) {
    throw new RateLimitError(
      `Rate limit exceeded for platform ${platform}. Maximum ${PUBLISH_RATE_LIMIT_PER_MINUTE} posts per minute allowed.`
    );
  }
}
