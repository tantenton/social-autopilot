import { prisma } from './db';

function getNextSlot(platform: string, base: Date): Date {
  const windows: Record<string, number[]> = {
    X: [9, 12, 17],
    Threads: [7, 13, 21],
    Instagram: [8, 11, 14, 19],
    TikTok: [7, 9, 12, 19, 21],
    YouTube: [14, 16, 21],
    Facebook: [9, 13, 15],
  };
  const hours = windows[platform] || windows['X'];
  const now = new Date();
  const d = new Date(base);
  d.setSeconds(0, 0);

  for (const h of hours) {
    const candidate = new Date(d);
    candidate.setHours(h, 0, 0, 0);
    if (candidate > now && candidate.getTime() >= now.getTime() + 5 * 60 * 1000) {
      return candidate;
    }
  }

  // Next day
  const tomorrow = new Date(d);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(hours[0], 0, 0, 0);
  return tomorrow;
}

export async function getOptimalTime(platform: string, timezone?: string): Promise<Date> {
  const now = new Date();
  return getNextSlot(platform, now);
}

export async function scheduleCampaignPosts(campaignId: string, userId: string) {
  const posts = await prisma.post.findMany({
    where: {
      approvalStatus: 'APPROVED',
      optimalTime: null,
      content: {
        idea: { userId },
      },
    },
    include: { content: { include: { idea: true } } },
  });

  for (const post of posts) {
    const optimal = await getOptimalTime(String(post.platform), 'UTC');
    await prisma.post.update({
      where: { id: post.id },
      data: {
        optimalTime: optimal,
        status: 'QUEUED',
        scheduledAt: optimal,
      },
    });
  }

  return posts.length;
}

export async function getScheduleSuggestions(platform: string, count = 5): Promise<string[]> {
  const results: string[] = [];
  const base = new Date();
  for (let i = 0; i < count; i++) {
    const slot = getNextSlot(platform, new Date(base.getTime() + i * 24 * 60 * 60 * 1000));
    results.push(slot.toISOString());
    base.setHours(slot.getHours());
  }
  return results;
}
