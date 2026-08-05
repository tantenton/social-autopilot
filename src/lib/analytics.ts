import { prisma } from './db';

export interface DashboardStats {
  totalPosts: number;
  publishedToday: number;
  totalLikes: number;
  totalImpressions: number;
  topPost: {
    id: string;
    content: string;
    likes: number;
    impressions: number;
    platform: string;
  } | null;
}

export interface DayMetric {
  date: string;
  likes: number;
  shares: number;
  impressions: number;
}

export interface PlatformMetric {
  platform: string;
  posts: number;
  avgEngagement: number;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  // Find user's posts via connected platforms
  const userPlatforms = await prisma.connectedPlatform.findMany({
    where: { userId },
    select: { id: true },
  });
  const platformIds = userPlatforms.map((p) => p.id);

  const posts = await prisma.post.findMany({
    where: {
      platformId: { in: platformIds },
    },
    include: { content: true },
  });

  const publishedToday = posts.filter((p) => {
    const today = new Date();
    const posted = p.postedAt ? new Date(p.postedAt) : null;
    return posted && posted.toDateString() === today.toDateString();
  }).length;

  const totalLikes = posts.reduce((sum, p) => {
    const m = p.metrics ? (p.metrics as any) || {} : {};
    return sum + (m.likes || 0);
  }, 0);

  const totalImpressions = posts.reduce((sum, p) => {
    const m = p.metrics ? (p.metrics as any) || {} : {};
    return sum + (m.impressions || 0);
  }, 0);

  // Top performing post by likes
  let topPost: DashboardStats['topPost'] = null;
  if (posts.length > 0) {
    const sorted = [...posts].sort((a, b) => {
      const likesA = (a.metrics ? (a.metrics as any)?.likes || 0 : 0);
      const likesB = (b.metrics ? (b.metrics as any)?.likes || 0 : 0);
      return likesB - likesA;
    });
    const best = sorted[0];
    topPost = {
      id: best.id,
      content: best.content?.text || best.contentId,
      likes: (best.metrics ? (best.metrics as any)?.likes || 0 : 0) as number,
      impressions: (best.metrics ? (best.metrics as any)?.impressions || 0 : 0) as number,
      platform: best.platform,
    };
  }

  return {
    totalPosts: posts.length,
    publishedToday,
    totalLikes,
    totalImpressions,
    topPost,
  };
}

export async function getEngagementByDay(userId: string, days: 7 | 30): Promise<DayMetric[]> {
  const userPlatforms = await prisma.connectedPlatform.findMany({
    where: { userId },
    select: { id: true },
  });
  const platformIds = userPlatforms.map((p) => p.id);

  const posts = await prisma.post.findMany({
    where: {
      platformId: { in: platformIds },
      status: 'PUBLISHED',
    },
    select: {
      postedAt: true,
      metrics: true,
      platform: true,
    },
  });

  const results: Record<string, DayMetric> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    results[key] = { date: key, likes: 0, shares: 0, impressions: 0 };
  }

  for (const post of posts) {
    if (!post.postedAt) continue;
    const key = post.postedAt.toISOString().split('T')[0];
    if (!results[key]) continue;
    const m = post.metrics ? (post.metrics as any) || {} : {};
    results[key].likes += (m.likes || 0) as number;
    results[key].shares += (m.shares || 0) as number;
    results[key].impressions += (m.impressions || 0) as number;
  }

  return Object.values(results).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getPlatformBreakdown(userId: string): Promise<PlatformMetric[]> {
  const userPlatforms = await prisma.connectedPlatform.findMany({
    where: { userId },
    select: { id: true, name: true },
  });

  const results: PlatformMetric[] = [];
  for (const p of userPlatforms) {
    const posts = await prisma.post.findMany({
      where: {
        platformId: p.id,
        status: 'PUBLISHED',
      },
    });
    const totalEngagement = posts.reduce((sum, post) => {
      const m = post.metrics ? (post.metrics as any) || {} : {};
      const likes = (m.likes || 0) as number;
      const shares = (m.shares || 0) as number;
      return sum + likes + shares;
    }, 0);
    const avgEngagement = posts.length ? totalEngagement / posts.length : 0;
    results.push({
      platform: p.name,
      posts: posts.length,
      avgEngagement: Math.round(avgEngagement * 10) / 10,
    });
  }
  return results;
}
