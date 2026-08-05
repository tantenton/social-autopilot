import { Queue, Job } from 'bullmq';
import { contentGenerationQueue } from '../src/lib/queue';
import { prisma } from '../src/lib/db';

const OPTIMAL_TIMES: Record<string, string[]> = {
  X: ['09:00', '12:00', '17:00'],
  THREADS: ['07:00', '13:00', '21:00'],
};

export default async function campaignScheduler() {
  // Repeatable cron via BullMQ repeat (run manually or register with worker)
  const campaigns = await prisma.campaign.findMany({ where: { status: 'active' } });

  for (const campaign of campaigns) {
    const schedules = await prisma.campaignSchedule.findMany({
      where: { campaignId: campaign.id, processed: false },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    });

    for (const sched of schedules) {
      const now = new Date();
      const scheduledTime = new Date(sched.scheduledAt);
      if (scheduledTime > now) continue;

      await contentGenerationQueue.add('generate', {
        ideaId: sched.id,
        topic: sched.ideaTopic,
        platform: sched.platform,
        tone: sched.tone,
      }, { jobId: `sched-${sched.id}` });

      await prisma.campaignSchedule.update({
        where: { id: sched.id },
        data: { processed: true },
      });
    }
  }
}

// If run directly
if (require.main === module) {
  campaignScheduler().catch(console.error);
}
