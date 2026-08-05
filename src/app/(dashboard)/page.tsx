import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Overview</h1>
        <p className="mt-2 text-[rgb(var(--color-text-muted))]">Ringkasan performa autopilot sosial Anda.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-xl shadow-sm border-[rgb(var(--color-border))]">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-[rgb(var(--color-text-muted))] font-semibold">Platform Terhubung</div>
            <div className="mt-2 text-3xl font-bold">3</div>
            <div className="mt-1 text-sm text-[rgb(var(--color-text-muted))]">X, Threads, Instagram</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border-[rgb(var(--color-border))]">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-[rgb(var(--color-text-muted))] font-semibold">Post Hari Ini</div>
            <div className="mt-2 text-3xl font-bold">2</div>
            <div className="mt-1 text-sm text-[rgb(var(--color-text-muted))]">Dijadwalkan otomatis</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border-[rgb(var(--color-border))]">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-[rgb(var(--color-text-muted))] font-semibold">Jadwal Berikutnya</div>
            <div className="mt-2 text-xl font-bold">14:00</div>
            <div className="mt-1 text-sm text-[rgb(var(--color-text-muted))]">Promo produk baru</div>
          </CardContent>
        </Card>
      </div>

      <section aria-label="Quick actions">
        <h2 className="text-xl font-bold mb-3">Aksi Cepat</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/campaigns/new" className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--color-primary))] text-white px-4 py-3 text-sm font-medium shadow hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary-hover))] focus-visible:ring-offset-2">
            <Sparkles size={16} aria-hidden="true" /> Buat Kampanye
          </Link>
          <Link href="/content" className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-3 text-sm font-medium shadow-sm hover:bg-[rgb(var(--color-bg))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] focus-visible:ring-offset-2">
            <ArrowRight size={16} aria-hidden="true" /> Lihat Konten
          </Link>
        </div>
      </section>
    </div>
  );
}
