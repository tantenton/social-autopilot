import { Queue, QueueEvents } from 'bullmq';
import { redisConnection } from '../src/lib/queue';
import { fetchGoogleTrends, fetchTwitterTrends } from '../src/lib/research/trending';
import { scoreIdeaFull } from '../src/lib/research/scorer';
import { generateIdeas } from '../src/lib/research/ideaGenerator';
import { prisma } from '../src/lib/db';

export const researchTrendsQueue = new Queue('research-trends', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: { count: 50 },
  },
});

export async function addDailyResearchJob() {
  return researchTrendsQueue.add('daily-research', { runAt: new Date() }, {
    repeat: { pattern: '0 8 * * *' }, // 8 AM daily
    jobId: `daily-research-${new Date().toISOString().split('T')[0]}`,
  });
}

export default async function researchTrendsJob() {
  console.log('[Research Trends] Starting daily trend fetch');
  const googleTrends = await fetchGoogleTrends('ID');
  const twitterTrends = await fetchTwitterTrends();
  const allTopics = [...googleTrends, ...twitterTrends];
  const keywords = allTopics.map((t) => t.keyword);

  console.log(`[Research Trends] Fetched ${keywords.length} topics`);

  const campaigns = await prisma.campaignSchedule.findMany({
    where: { isActive: true },
  });

  for (const campaign of campaigns) {
    const topics = campaign.topics.length > 0 ? campaign.topics : keywords.slice(0, 3);
    const platforms = (campaign.platforms as string[]).map((p) => p as any);
    try {
      await generateIdeas(topics, platforms, campaign.userId);
      await prisma.campaignSchedule.update({
        where: { id: campaign.id },
        data: { lastRunAt: new Date() },
      });
      console.log(`[Research Trends] Generated ideas for campaign: ${campaign.name}`);
    } catch (e: any) {
      console.error(`[Research Trends] Failed for campaign ${campaign.name}:`, e.message || e);
    }
  }
}
