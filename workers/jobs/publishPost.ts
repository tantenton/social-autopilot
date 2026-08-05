import { Job } from 'bullmq';
import { prisma } from '../../src/lib/db';
import { checkPublishRateLimit, isIdempotent, setIdempotencyStatus } from '../../src/lib/publish-guard';

// Mock platform connector
async function postToPlatform(platform: string, content: string, imageUrl?: string) {
  // In production: import from src/lib/platforms/x.ts etc.
  return { success: true, externalId: `mock-${Date.now()}`, url: `https://example.com/post/${Date.now()}` };
}

export default async function publishPostJob(job: Job<any, any, string>) {
  const { postId } = job.data;
  if (!postId) {
    throw new Error('postId is required');
  }

  // 1. Idempotency Check: Prisma status & Redis idempotency key
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { contentPiece: true },
  });

  if (!post || !post.contentPiece) {
    throw new Error('Post or content piece not found');
  }

  if (post.status === 'published') {
    console.log(`[publishPostJob] Post ${postId} is already published in database. Skipping.`);
    return { success: true, skipped: true, reason: 'Already published' };
  }

  const alreadyProcessed = await isIdempotent(postId);
  if (alreadyProcessed) {
    console.log(`[publishPostJob] Post ${postId} idempotency check triggered. Skipping.`);
    return { success: true, skipped: true, reason: 'Idempotency key matched' };
  }

  // Set transient in_progress lock (TTL 60s)
  await setIdempotencyStatus(postId, 'in_progress', 60);

  try {
    // 2. Rate Limiting Check per platform
    await checkPublishRateLimit(post.platform);

    // 3. Execute Publish
    const result = await postToPlatform(post.platform, post.contentPiece.text, post.contentPiece.imageUrl || undefined);

    // 4. Update Database
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        metricsJson: JSON.stringify({ externalId: result.externalId, url: result.url }),
      },
    });

    await prisma.contentPiece.update({
      where: { id: post.contentPiece.id },
      data: { status: 'published' },
    });

    // 5. Mark Idempotency as completed (TTL 24h)
    await setIdempotencyStatus(postId, 'completed', 86400);

    return result;
  } catch (err) {
    // Release in_progress lock on failure so job retries can proceed
    await setIdempotencyStatus(postId, 'completed', 0);
    throw err;
  }
}
