import { Job } from 'bullmq';
import { prisma } from '../../src/lib/db';

// Mock platform connector
async function postToPlatform(platform: string, content: string, imageUrl?: string) {
  // In production: import from src/lib/platforms/x.ts etc.
  return { success: true, externalId: `mock-${Date.now()}`, url: `https://example.com/post/${Date.now()}` };
}

export default async function publishPostJob(job: Job<any, any, string>) {
  const { postId } = job.data;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { contentPiece: true },
  });

  if (!post || !post.contentPiece) {
    throw new Error('Post or content piece not found');
  }

  const result = await postToPlatform(post.platform, post.contentPiece.text, post.contentPiece.imageUrl || undefined);

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

  return result;
}
