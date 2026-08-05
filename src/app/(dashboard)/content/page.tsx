import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  { id: 1, text: "Promo produk baru dengan diskon 20%", platform: "X", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80" },
  { id: 2, text: "Tips meningkatkan engagement di Threads", platform: "Threads", image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&q=80" },
  { id: 3, text: "Review pelanggan bulan ini", platform: "Instagram", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
];

export default function ContentPage() {
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
            <CardContent className="p-4">
              <p className="text-sm font-medium line-clamp-3">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
