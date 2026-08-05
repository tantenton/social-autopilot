"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlus, Trash2, Star, Sparkles, Globe, Circle } from 'lucide-react';

const PLATFORM_META: Record<string, { label: string; icon: any }> = {
  X: { label: 'X (Twitter)', icon: Sparkles },
  THREADS: { label: 'Threads', icon: Globe },
  FACEBOOK: { label: 'Facebook', icon: Circle },
  INSTAGRAM: { label: 'Instagram', icon: Circle },
  TIKTOK: { label: 'TikTok', icon: Circle },
  YOUTUBE: { label: 'YouTube', icon: Circle },
};

export default function AccountsPage() {
  const [grouped, setGrouped] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/accounts')
      .then(r => r.json())
      .then(data => {
        setGrouped(data.grouped || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const platforms = Object.keys(grouped);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[rgb(var(--color-text))]">Accounts</h1>
          <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">Manage your connected social accounts.</p>
        </div>
        <Link href="#" className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-hover))] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors">
          <UserPlus size={18} /> Add Account
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-[rgb(var(--color-text-muted))]">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {platforms.map((key) => {
            const meta = PLATFORM_META[key] || { label: key, icon: Circle };
            const Icon = meta.icon;
            const accounts = grouped[key] || [];
            return (
              <section key={key} className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))] flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-[rgb(var(--color-text))]">{meta.label}</h3>
                </div>

                <div className="space-y-3">
                  {accounts.map((acc: any) => (
                    <div key={acc.id} className="flex items-center justify-between rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] text-white flex items-center justify-center text-xs font-bold">
                          {acc.accountHandle.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[rgb(var(--color-text))] truncate">@{acc.accountHandle}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))] border-[rgb(var(--color-success))]/20">
                              {acc.status}
                            </span>
                            {acc.isDefault && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))] border border-[rgb(var(--color-warning))]/20 px-1.5 py-0.5 text-[10px] font-semibold">Default</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!acc.isDefault && (
                          <button 
                            onClick={() => fetch(`/api/accounts/${acc.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDefault: true, platformName: key }) }).then(() => window.location.reload())}
                            className="inline-flex items-center gap-1 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:bg-[rgb(var(--color-bg))] px-2.5 py-1.5 text-xs font-semibold text-[rgb(var(--color-text))] shadow-sm transition-colors" 
                            title="Set default"
                          >
                            <Star size={12} /> Default
                          </button>
                        )}
                        <button 
                          onClick={() => { if(confirm('Remove this account?')) fetch(`/api/accounts/${acc.id}`, { method: 'DELETE' }).then(() => window.location.reload()); }}
                          className="inline-flex items-center gap-1 rounded-lg border border-[rgb(var(--color-danger))]/20 bg-[rgb(var(--color-danger))]/10 hover:bg-[rgb(var(--color-danger))]/20 px-2.5 py-1.5 text-xs font-semibold text-[rgb(var(--color-danger))] transition-colors" 
                          title="Remove"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {accounts.length === 0 && (
                    <div className="text-sm text-[rgb(var(--color-text-muted))]">No accounts connected.</div>
                  )}
                </div>

                <div className="mt-4">
                  <Link href={`/api/platforms/connect/${key.toLowerCase()}`} className="w-full inline-flex items-center justify-center rounded-lg bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-hover))] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors">
                    Connect {meta.label}
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
