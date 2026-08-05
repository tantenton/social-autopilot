"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar,
} from "recharts";
import type { DayMetric, PlatformMetric } from "@/lib/analytics";

interface AnalyticsChartsProps {
  engagement: DayMetric[];
  platforms: PlatformMetric[];
  topPost: { id: string; content: string; likes: number; impressions: number; platform: string } | null;
}

export default function AnalyticsCharts({ engagement, platforms, topPost }: AnalyticsChartsProps) {
  return (
    <>
      <section aria-label="Engagement over last 7 days">
        <h2 className="text-xl font-bold mb-4">Engagement (7 hari)</h2>
        <div className="w-full h-72 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
              <XAxis dataKey="date" tick={{ fill: "rgb(var(--color-text-muted))" }} />
              <YAxis tick={{ fill: "rgb(var(--color-text-muted))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--color-surface))",
                  borderColor: "rgb(var(--color-border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Line type="monotone" dataKey="likes" stroke="rgb(var(--color-primary))" strokeWidth={2} dot={{ fill: "rgb(var(--color-primary))" }} />
              <Line type="monotone" dataKey="shares" stroke="rgb(var(--color-accent))" strokeWidth={2} dot={{ fill: "rgb(var(--color-accent))" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section aria-label="Posts by platform">
        <h2 className="text-xl font-bold mb-4">Platform Breakdown</h2>
        <div className="w-full h-72 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platforms}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
              <XAxis dataKey="platform" tick={{ fill: "rgb(var(--color-text-muted))" }} />
              <YAxis tick={{ fill: "rgb(var(--color-text-muted))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--color-surface))",
                  borderColor: "rgb(var(--color-border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="posts" fill="rgb(var(--color-primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section aria-label="Top performing posts">
        <h2 className="text-xl font-bold mb-4">Top Posts</h2>
        <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text-muted))]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Platform</th>
                <th className="text-left px-4 py-3 font-semibold">Preview</th>
                <th className="text-left px-4 py-3 font-semibold">Likes</th>
                <th className="text-left px-4 py-3 font-semibold">Impressions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {topPost ? (
                <tr className="hover:bg-[rgb(var(--color-bg))]">
                  <td className="px-4 py-3 font-medium">{topPost.platform}</td>
                  <td className="px-4 py-3 truncate max-w-xs">{topPost.content}</td>
                  <td className="px-4 py-3">{topPost.likes}</td>
                  <td className="px-4 py-3">{topPost.impressions}</td>
                </tr>
              ) : (
                <tr>
                  <td className="px-4 py-3 text-[rgb(var(--color-text-muted))]" colSpan={4}>
                    No posts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
