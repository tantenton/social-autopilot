"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ContentItem {
  id: number;
  text: string;
  platform: string;
  image: string;
}

interface Variant {
  id?: string;
  angle?: string;
  text: string;
  imagePrompt?: string;
  predictedScore?: number;
}

const items: ContentItem[] = [
  { id: 1, text: "Promo produk baru dengan diskon 20%", platform: "X", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80" },
  { id: 2, text: "Tips meningkatkan engagement di Threads", platform: "Threads", image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&q=80" },
  { id: 3, text: "Review pelanggan bulan ini", platform: "Instagram", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
];

export default function ContentPage() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [lastABTestItem, setLastABTestItem] = useState<ContentItem | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [variantsError, setVariantsError] = useState<string | null>(null);

  const [generatingVideoId, setGeneratingVideoId] = useState<number | null>(null);
  const [videoStatus, setVideoStatus] = useState<{
    type: "success" | "error";
    message: string;
    itemId: number;
  } | null>(null);

  const handleGenerateVideo = async (item: ContentItem) => {
    setGeneratingVideoId(item.id);
    setVideoStatus(null);
    try {
      const res = await fetch("/api/content/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentPieceId: String(item.id),
          prompt: item.text,
          imageUrl: item.image,
          platform: item.platform,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses request generate video");
      }

      setVideoStatus({
        type: "success",
        message: `Video generation queued successfully! Job ID: ${data.jobId}`,
        itemId: item.id,
      });
    } catch (err: any) {
      setVideoStatus({
        type: "error",
        message: err.message || "Terjadi kesalahan saat membuat video",
        itemId: item.id,
      });
    } finally {
      setGeneratingVideoId(null);
    }
  };

  const handleABTest = async (item: ContentItem) => {
    setSelectedItem(item.id);
    setLastABTestItem(item);
    setShowVariants(true);
    setLoadingVariants(true);
    setVariantsError(null);
    setVariants([]);

    try {
      const res = await fetch("/api/content/ab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: item.text, platform: item.platform, count: 3 }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil data varian A/B test dari server.");
      }

      setVariants(data.variants || []);
    } catch (err: any) {
      setVariantsError(err.message || "Gagal memuat varian A/B test. Silakan coba lagi.");
    } finally {
      setLoadingVariants(false);
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
            <div className="relative h-48 w-full">
              <Image
                src={item.image}
                alt={item.text}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                unoptimized
              />
              <div className="absolute top-3 left-3 z-10">
                <Badge variant="outline" className="bg-[rgb(var(--color-surface))]/90 backdrop-blur border-[rgb(var(--color-border))] text-xs font-semibold shadow-sm">
                  {item.platform}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium line-clamp-3">{item.text}</p>
              
              {videoStatus && videoStatus.itemId === item.id && (
                <div
                  className={`p-2 rounded-md text-xs ${
                    videoStatus.type === "success"
                      ? "bg-green-500/10 text-green-600 border border-green-500/20"
                      : "bg-red-500/10 text-red-600 border border-red-500/20"
                  }`}
                >
                  {videoStatus.message}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  disabled={generatingVideoId === item.id}
                  onClick={() => handleGenerateVideo(item)}
                  className="inline-flex items-center rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-1.5 text-xs font-medium hover:bg-[rgb(var(--color-bg))] transition-colors disabled:opacity-50"
                >
                  {generatingVideoId === item.id ? "Queuing..." : "Generate Video"}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">A/B Test Variants {selectedItem ? `(Item #${selectedItem})` : ""}</h2>
            <button
              onClick={() => setShowVariants(false)}
              className="text-xs text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-foreground))]"
            >
              Close
            </button>
          </div>

          {loadingVariants && (
            <div className="flex items-center space-x-2 text-sm text-[rgb(var(--color-text-muted))] py-4">
              <svg className="animate-spin h-4 w-4 text-[rgb(var(--color-primary))]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Memuat varian A/B test...</span>
            </div>
          )}

          {!loadingVariants && variantsError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 space-y-3">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{variantsError}</p>
              {lastABTestItem && (
                <button
                  onClick={() => handleABTest(lastABTestItem)}
                  className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 transition-colors"
                >
                  Coba Lagi (Retry)
                </button>
              )}
            </div>
          )}

          {!loadingVariants && !variantsError && variants.length === 0 && (
            <p className="text-sm text-[rgb(var(--color-text-muted))] py-4">Tidak ada varian ditemukan.</p>
          )}

          {!loadingVariants && !variantsError && variants.length > 0 && (
            <div className="space-y-4">
              {variants.map((v, i) => (
                <div key={v.id || i} className="rounded-lg border border-[rgb(var(--color-border))] p-4 bg-[rgb(var(--color-bg))]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--color-text-muted))]">{v.angle || `Variant ${i + 1}`}</span>
                    <span className="text-xs font-bold text-[rgb(var(--color-primary))]">Score: {v.predictedScore || 0}</span>
                  </div>
                  <p className="text-sm font-medium mb-1">{v.text}</p>
                  {v.imagePrompt && <p className="text-xs text-[rgb(var(--color-text-muted))]">Image prompt: {v.imagePrompt}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
