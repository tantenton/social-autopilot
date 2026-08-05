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
  // Every hour check for active campaigns
  await contentGenerationQueue.add('check-campaigns', {}, {
    repeat: { pattern: '0 * * * *' },
    jobId: 'campaign-cron',
  });
  console.log('Campaign repeat job registered');
}

export async function campaignProcessor() {
  const campaigns = await prisma.campaignSchedule.findMany({
    where: { isActive: true },
  });

  for (const campaign of campaigns) {
    // Generate content for each active campaign
    await contentGenerationQueue.add('generate', {
      campaignId: campaign.id,
      topics: campaign.topics,
      platforms: campaign.platforms,
      tone: campaign.tone,
    }, { jobId: `campaign-${campaign.id}` });
  }
}
