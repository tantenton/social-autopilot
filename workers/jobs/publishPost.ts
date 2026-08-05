import { Job } from 'bullmq';
import { PostStatus } from '@prisma/client';
import { prisma } from '../../src/lib/db';
import {
  acquireIdempotencyLock,
  getIdempotencyStatus,
  setIdempotencyStatus,
  clearIdempotencyStatus,
  checkPublishRateLimit,
} from '../../src/lib/publish-guard';
import { ValidationError, NotFoundError } from '../../src/lib/errors';

// Mock platform connector
async function postToPlatform(platform: string, content: string, imageUrl?: string) {
  return {
    success: true,
    externalId: `mock-${Date.now()}`,
    url: `https://example.com/post/${Date.now()}`,
  };
}

export default async function publishPostJob(job: Job<any, any, string>) {
  const { postId } = job.data || {};
  if (!postId || typeof postId !== 'string') {
    throw new ValidationError('postId string is required for publishPostJob');
  }

  // 1. Fetch Post and relation from Prisma (using correct relation 'content')
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { content: true },
  });

  if (!post || !post.content) {
    throw new NotFoundError(`Post or related ContentPiece not found for ID ${postId}`);
  }

  // Check DB status before attempting publish
  if (post.status === PostStatus.PUBLISHED) {
    console.log(`[publishPostJob] Post ${postId} is already PUBLISHED in DB. Skipping.`);
    return { success: true, skipped: true, reason: 'Already published in DB' };
  }

  // 2. Atomic Idempotency Lock Check
  const lockAcquired = await acquireIdempotencyLock(postId, 60);
  if (!lockAcquired) {
    const status = await getIdempotencyStatus(postId);
    if (status === 'completed') {
      console.log(`[publishPostJob] Post ${postId} is completed in idempotency cache. Skipping.`);
      return { success: true, skipped: true, reason: 'Completed in idempotency cache' };
    }
    console.log(`[publishPostJob] Post ${postId} is currently in_progress by another worker. Skipping.`);
    return { success: true, skipped: true, reason: 'In progress by another worker' };
  }

  try {
    // 3. Rate Limit Check
    await checkPublishRateLimit(post.platform);

    // 4. Execute Platform Post
    const textContent = post.content.text || 'Default content';
    const mediaUrl = post.content.mediaUrl || post.content.assetUrl || undefined;
    const result = await postToPlatform(post.platform, textContent, mediaUrl);

    // 5. Update Database within Prisma Transaction (using correct fields: postedAt, metrics)
    await prisma.$transaction([
      prisma.post.update({
        where: { id: postId },
        data: {
          status: PostStatus.PUBLISHED,
          postedAt: new Date(),
          metrics: { externalId: result.externalId, url: result.url },
        },
      }),
    ]);

    // 6. Set Idempotency Status to completed AFTER DB transaction succeeds
    await setIdempotencyStatus(postId, 'completed', 86400);

    return result;
  } catch (error) {
    // Clear lock via nested try/catch so original error is not swallowed
    try {
      await clearIdempotencyStatus(postId);
    } catch (cleanupError) {
      console.error('[publishPostJob] Failed to clear idempotency lock during cleanup:', cleanupError);
    }
    throw error;
  }
}
