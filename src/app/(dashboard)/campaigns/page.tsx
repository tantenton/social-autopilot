import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus } from "lucide-react";

const campaigns = [
  { id: 1, name: "Promo Akhir Tahun", platforms: ["X", "Threads"], status: "Aktif", posts: 4 },
  { id: 2, name: "Launch Produk", platforms: ["Instagram", "X"], status: "Draf", posts: 0 },
  { id: 3, name: "Ulasan Pelanggan", platforms: ["Threads", "Instagram"], status: "Selesai", posts: 6 },
];

export default function CampaignsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Campaigns</h1>
          <p className="mt-2 text-[rgb(var(--color-text-muted))]">Kelola semua kampanye otomatis Anda.</p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--color-primary))] text-white px-4 py-3 text-sm font-medium shadow hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary-hover))] focus-visible:ring-offset-2"
        >
          <Plus size={16} aria-hidden="true" /> Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((c) => (
          <Card key={c.id} className="rounded-xl shadow-sm border-[rgb(var(--color-border))] hover:-translate-y-1 transition-transform">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg leading-tight">{c.name}</h3>
                <Badge
                  variant={c.status === "Aktif" ? "default" : c.status === "Selesai" ? "outline" : "secondary"}
                  className={`text-xs ${
                    c.status === "Aktif" ? "bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))] border-[rgb(var(--color-success))]/20" : ""
                  }`}
                >
                  {c.status}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-[rgb(var(--color-text-muted))]">{c.platforms.join(", ")}</p>
              <div className="mt-4 text-xs text-[rgb(var(--color-text-muted))]">{c.posts} post</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
