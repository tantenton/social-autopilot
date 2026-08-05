import { Job } from 'bullmq';
import { prisma } from '../../src/lib/db';

export default async function syncMetricsJob(job: Job<any, any, string>) {
  const userId = job.data?.userId || job.data?.postId ? undefined : job.data?.userId;

  // If called with a single postId, sync just that post
  if (job.data?.postId) {
    return syncSinglePost(job.data.postId);
  }

  // Pull metrics for all PUBLISHED posts from past 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      createdAt: { gte: sevenDaysAgo },
    },
    include: { connectedPlatform: true },
  });

  const results = [];
  for (const post of posts) {
    const metrics = await fetchPlatformMetrics(post);
    const current = post.metrics ? (post.metrics as any) || {} : {};
    const updatedMetrics = {
      ...current,
      ...metrics,
      fetchedAt: new Date().toISOString(),
    };
    await prisma.post.update({
      where: { id: post.id },
      data: { metrics: updatedMetrics },
    });
    results.push({ postId: post.id, metrics: updatedMetrics });
  }

  return { synced: results.length, results };
}

async function fetchPlatformMetrics(post: any) {
  // X: GET https://api.twitter.com/2/tweets/:id?tweet.fields=public_metrics
  // Threads: GET https://graph.threads.net/:id/insights
  const platformPostId = post.platformPostId;
  if (!platformPostId) {
    return {
      likes: Math.floor(Math.random() * 500),
      comments: Math.floor(Math.random() * 120),
      shares: Math.floor(Math.random() * 100),
      impressions: Math.floor(Math.random() * 5000),
    };
  }

  let metrics = { likes: 0, comments: 0, shares: 0, impressions: 0 };
  try {
    if (post.platform === 'X' && platformPostId) {
      // Mock X metrics API response
      metrics = {
        likes: Math.floor(Math.random() * 500) + 10,
        comments: Math.floor(Math.random() * 120) + 2,
        shares: Math.floor(Math.random() * 100) + 1,
        impressions: Math.floor(Math.random() * 5000) + 200,
      };
    } else if (post.platform === 'THREADS' && platformPostId) {
      // Mock Threads insights
      metrics = {
        likes: Math.floor(Math.random() * 300) + 5,
        comments: Math.floor(Math.random() * 60) + 1,
        shares: Math.floor(Math.random() * 50) + 0,
        impressions: Math.floor(Math.random() * 3000) + 100,
      };
    } else {
      metrics = {
        likes: Math.floor(Math.random() * 200) + 3,
        comments: Math.floor(Math.random() * 40) + 0,
        shares: Math.floor(Math.random() * 30) + 0,
        impressions: Math.floor(Math.random() * 1500) + 50,
      };
    }
  } catch (e) {
    console.error('Failed to fetch metrics for post', post.id, e);
  }
  return metrics;
}

async function syncSinglePost(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { connectedPlatform: true },
  });
  if (!post) throw new Error('Post not found');
  const metrics = await fetchPlatformMetrics(post);
  const current = post.metrics ? (post.metrics as any) || {} : {};
  const updatedMetrics = { ...current, ...metrics, fetchedAt: new Date().toISOString() };
  await prisma.post.update({
    where: { id: postId },
    data: { metrics: updatedMetrics },
  });
  return updatedMetrics;
}
