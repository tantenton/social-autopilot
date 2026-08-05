import { Job } from 'bullmq';
import { prisma } from '../../src/lib/db';

export default async function syncMetricsJob(job: Job<any, any, string>) {
  const { postId } = job.data;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error('Post not found');

  // Simulate pulling metrics from platform APIs
  const metrics = {
    likes: Math.floor(Math.random() * 500),
    shares: Math.floor(Math.random() * 100),
    impressions: Math.floor(Math.random() * 5000),
    fetchedAt: new Date().toISOString(),
  };

  const current = post.metricsJson ? JSON.parse(post.metricsJson) : {};
  const updatedMetrics = { ...current, ...metrics };

  await prisma.post.update({
    where: { id: postId },
    data: { metricsJson: JSON.stringify(updatedMetrics) },
  });

  return updatedMetrics;
}
