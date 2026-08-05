"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  { id: 1, text: "Promo produk baru dengan diskon 20%", platform: "X", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80" },
  { id: 2, text: "Tips meningkatkan engagement di Threads", platform: "Threads", image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&q=80" },
  { id: 3, text: "Review pelanggan bulan ini", platform: "Instagram", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
];

export default function ContentPage() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [showVariants, setShowVariants] = useState(false);

  const handleGenerateVideo = (item: any) => {
    alert(`Generate video started for item ${item.id}`);
  };

  const handleABTest = async (item: any) => {
    setSelectedItem(item.id);
    setShowVariants(true);
    setVariants([]);
    try {
      const res = await fetch('/api/content/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: item.text, platform: item.platform, count: 3 }),
      });
      const data = await res.json();
      setVariants(data.variants || []);
    } catch {
      setVariants([]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Content</h1>
        <p className="mt-2 text-[rgb(var(--color-text-muted))]">Konten yang telah dihasilkan dan siap dipublikasikan.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="rounded-xl shadow-sm border-[rgb(var(--color-border))] overflow-hidden hover:-translate-y-1 transition-transform">
            <div className="relative">
              <img
                src={item.image}
                alt={item.text}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="outline" className="bg-[rgb(var(--color-surface))]/90 backdrop-blur border-[rgb(var(--color-border))] text-xs font-semibold shadow-sm">
                  {item.platform}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium line-clamp-3">{item.text}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleGenerateVideo(item)}
                  className="inline-flex items-center rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-1.5 text-xs font-medium hover:bg-[rgb(var(--color-bg))] transition-colors"
                >
                  Generate Video
                </button>
                <button
                  onClick={() => handleABTest(item)}
                  className="inline-flex items-center rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-primary))] text-[rgb(var(--color-surface))] px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  A/B Test
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showVariants && (
        <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">A/B Test Variants</h2>
          {variants.length === 0 ? (
            <p className="text-sm text-[rgb(var(--color-text-muted))]">Loading variants...</p>
          ) : (
            <div className="space-y-4">
              {variants.map((v: any, i: number) => (
                <div key={v.id || i} className="rounded-lg border border-[rgb(var(--color-border))] p-4 bg-[rgb(var(--color-bg))]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--color-text-muted))]">{v.angle || `Variant ${i + 1}`}</span>
                    <span className="text-xs font-bold text-[rgb(var(--color-primary))]">Score: {v.predictedScore || 0}</span>
                  </div>
                  <p className="text-sm font-medium mb-1">{v.text}</p>
                  <p className="text-xs text-[rgb(var(--color-text-muted))]">Image prompt: {v.imagePrompt}</p>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setShowVariants(false)} className="mt-4 text-xs text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-foreground))]">Close</button>
        </div>
      )}
    </div>
  );
}
