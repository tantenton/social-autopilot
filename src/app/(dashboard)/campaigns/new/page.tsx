"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const platforms = ["X", "Threads", "Instagram", "TikTok", "Facebook"];

export default function NewCampaignPage() {
  const [selected, setSelected] = useState<string[]>(["X", "Threads"]);
  const [cron, setCron] = useState("0 14 * * *");
  const [active, setActive] = useState(true);

  const toggle = (p: string) => {
    setSelected((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">New Campaign</h1>
        <p className="mt-2 text-[rgb(var(--color-text-muted))]">Create a new automated campaign with a posting schedule.</p>
      </div>

      <Card className="rounded-xl shadow-sm border-[rgb(var(--color-border))]">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold">Nama Kampanye</label>
            <Input id="name" placeholder="Contoh: Year-End Promo" />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold">Platform</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggle(p)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] focus-visible:ring-offset-2 ${
                    selected.includes(p)
                      ? "bg-[rgb(var(--color-primary))] text-white border-[rgb(var(--color-primary))]"
                      : "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-muted))] border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-[rgb(var(--color-text-muted))]">
              Dipilih: {selected.length > 0 ? selected.join(", ") : "Belum ada"}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="cron" className="block text-sm font-semibold">Schedule (cron)</label>
            <Input id="cron" value={cron} onChange={(e) => setCron(e.target.value)} placeholder="0 14 * * *" />
            <p className="text-xs text-[rgb(var(--color-text-muted))]">Contoh: 0 14 * * * (setiap hari pukul 14:00)</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActive((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] focus-visible:ring-offset-2 ${
                active ? "bg-[rgb(var(--color-primary))]" : "bg-[rgb(var(--color-border))]"
              }`}
              aria-pressed={active}
              aria-label="Activekan kampanye"
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm font-medium">Activekan kampanye</span>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full rounded-lg bg-[rgb(var(--color-primary))] hover:opacity-90 text-white shadow-md transition-opacity">
              Simpan Kampanye
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
