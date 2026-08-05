import { Job } from 'bullmq';
import { getOptimalTime } from '../../src/lib/smart-scheduler';
import { prisma } from '../../src/lib/db';

export default async function autoScheduleJob(job: Job<any, any, string>) {
  const posts = await prisma.post.findMany({
    where: {
      approvalStatus: 'APPROVED',
      optimalTime: null,
    },
  });

  for (const post of posts) {
    const optimal = await getOptimalTime(String(post.platform));
    await prisma.post.update({
      where: { id: post.id },
      data: {
        optimalTime: optimal,
        status: 'QUEUED',
        scheduledAt: optimal,
      },
    });
  }

  return { scheduled: posts.length };
}
