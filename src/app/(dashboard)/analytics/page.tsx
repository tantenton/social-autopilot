import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";

const AnalyticsCharts = dynamic(
  () => import("@/components/analytics/AnalyticsCharts"),
  { ssr: false }
);

import { getDashboardStats, getEngagementByDay, getPlatformBreakdown } from "@/lib/analytics";
import { auth } from "@/lib/auth";

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session?.user?.id || "";

  const stats = await getDashboardStats(userId);
  const engagement = await getEngagementByDay(userId, 7);
  const platforms = await getPlatformBreakdown(userId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Analytics</h1>
        <p className="mt-2 text-[rgb(var(--color-text-muted))]">Metrik performa konten dan kampanye Anda.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl shadow-sm border-[rgb(var(--color-border))]">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-[rgb(var(--color-text-muted))] font-semibold">Total Posts</div>
            <div className="mt-2 text-3xl font-bold text-[rgb(var(--color-text))]">{stats.totalPosts}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border-[rgb(var(--color-border))]">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-[rgb(var(--color-text-muted))] font-semibold">Published Today</div>
            <div className="mt-2 text-3xl font-bold text-[rgb(var(--color-text))]">{stats.publishedToday}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border-[rgb(var(--color-border))]">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-[rgb(var(--color-text-muted))] font-semibold">Total Likes</div>
            <div className="mt-2 text-3xl font-bold text-[rgb(var(--color-text))]">{stats.totalLikes}</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border-[rgb(var(--color-border))]">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-[rgb(var(--color-text-muted))] font-semibold">Total Impressions</div>
            <div className="mt-2 text-3xl font-bold text-[rgb(var(--color-text))]">{stats.totalImpressions}</div>
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts
        engagement={engagement}
        platforms={platforms}
        topPost={stats.topPost}
      />
    </div>
  );
}
