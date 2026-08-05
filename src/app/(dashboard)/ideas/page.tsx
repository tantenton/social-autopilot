"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Filter } from "lucide-react";

const mockIdeas = [
  { id: "1", topic: "Generative AI Indonesia", viralityScore: 82, platforms: ["X", "THREADS"], sentiment: "HUMOROUS" },
  { id: "2", topic: "Tren Fashion 2025", viralityScore: 74, platforms: ["INSTAGRAM", "TIKTOK"], sentiment: "CASUAL" },
  { id: "3", topic: "Kuliner Viral Jakarta", viralityScore: 69, platforms: ["FACEBOOK", "INSTAGRAM"], sentiment: "PROFESSIONAL" },
  { id: "4", topic: "Startup Digital", viralityScore: 58, platforms: ["X"], sentiment: "CASUAL" },
  { id: "5", topic: "Influencer Marketing", viralityScore: 91, platforms: ["THREADS", "YOUTUBE"], sentiment: "PROFESSIONAL" },
];

function scoreColor(score: number) {
  if (score > 70) return "bg-[rgb(var(--color-success))]";
  if (score >= 40) return "bg-[rgb(var(--color-accent))]";
  return "bg-[rgb(var(--color-danger))]";
}

function scoreText(score: number) {
  if (score > 70) return "Tinggi";
  if (score >= 40) return "Sedang";
  return "Rendah";
}

export default function IdeasPage() {
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);

  const filtered = mockIdeas.filter((idea) => {
    if (!filterPlatform) return true;
    return idea.platforms.includes(filterPlatform as any);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Idea Riset</h1>
          <p className="mt-2 text-[rgb(var(--color-text-muted))]">Content ideas based on trends and virality scores.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["X", "THREADS", "INSTAGRAM", "TIKTOK", "FACEBOOK", "YOUTUBE"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPlatform(filterPlatform === p ? null : p)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] ${
                filterPlatform === p
                  ? "bg-[rgb(var(--color-primary))] text-white border-transparent"
                  : "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-muted))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-bg))]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((idea) => (
          <Card key={idea.id} className="rounded-xl shadow-sm border-[rgb(var(--color-border))] hover:-translate-y-1 transition-transform">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-lg leading-tight">{idea.topic}</h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${idea.viralityScore > 70 ? "text-[rgb(var(--color-success))] bg-[rgb(var(--color-success))]/10" : idea.viralityScore >= 40 ? "text-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent))]/10" : "text-[rgb(var(--color-danger))] bg-[rgb(var(--color-danger))]/10"}`}>
                  {idea.viralityScore}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-2.5 rounded-full bg-[rgb(var(--color-border))] overflow-hidden">
                  <div className={`h-2.5 rounded-full ${scoreColor(idea.viralityScore)}`} style={{ width: `${idea.viralityScore}%` }} />
                </div>
                <span className="text-xs font-medium text-[rgb(var(--color-text-muted))]">{idea.viralityScore}%</span>
              </div>
              <p className="text-xs text-[rgb(var(--color-text-muted))]">{scoreText(idea.viralityScore)} viralitas</p>

              <div className="flex flex-wrap gap-2">
                {idea.platforms.map((p) => (
                  <Badge key={p} variant="outline" className="text-[10px] uppercase tracking-wide border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))]">
                    {p}
                  </Badge>
                ))}
              </div>

              <a
                href={`/api/content/generate`}
                className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--color-primary))] text-white px-4 py-2.5 text-sm font-medium shadow hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary-hover))] focus-visible:ring-offset-2"
              >
                <Sparkles size={16} aria-hidden="true" />
                Generate Content
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
