import { Queue } from 'bullmq';
import { redisConnection } from './queue';
import { prisma } from './db';

const contentGenerationQueue = new Queue('content-generation', { connection: redisConnection });
const publishQueue = new Queue('publish-post', { connection: redisConnection });

const OPTIMAL_TIMES: Record<string, string[]> = {
  X: ['09:00', '12:00', '17:00'],
  THREADS: ['07:00', '13:00', '21:00'],
};

export async function registerCampaignRepeat() {
  // Example: every hour check for campaigns
  await contentGenerationQueue.add('generate-campaign', {}, {
    repeat: { pattern: '0 * * * *' },
    jobId: 'campaign-cron',
  });
  console.log('Campaign repeat job registered');
}

export async function campaignProcessor() {
  const campaigns = await prisma.campaign.findMany({ where: { status: 'active' } });
  for (const campaign of campaigns) {
    const schedules = await prisma.campaignSchedule.findMany({
      where: { campaignId: campaign.id, processed: false },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });
    for (const s of schedules) {
      await contentGenerationQueue.add('generate', {
        ideaId: s.id,
        topic: s.ideaTopic,
        platform: s.platform,
        tone: s.tone,
      }, { jobId: `sched-gen-${s.id}` });
      await prisma.campaignSchedule.update({
        where: { id: s.id },
        data: { processed: true },
      });
    }
  }
}
