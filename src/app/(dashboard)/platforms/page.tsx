import { Sparkles, Globe } from 'lucide-react';
import { getPlatforms } from './actions';

const PLATFORM_META = {
  X: { label: 'X (Twitter)', icon: Sparkles },
  THREADS: { label: 'Threads', icon: Globe },
} as const;

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    CONNECTED: 'bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))] border-[rgb(var(--color-success))]/20',
    DISCONNECTED: 'bg-[rgb(var(--color-text-muted))]/10 text-[rgb(var(--color-text-muted))] border-[rgb(var(--color-text-muted))]/20',
    EXPIRED: 'bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] border-[rgb(var(--color-accent))]/20',
    ERROR: 'bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))] border-[rgb(var(--color-danger))]/20',
  };
  const cls = colorMap[status] || colorMap.DISCONNECTED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

export default async function PlatformsPage() {
  let platforms: Array<{ id: string; name: string; status: string; connectedAt: string }> = [];
  try {
    platforms = await getPlatforms();
  } catch {
    platforms = [];
  }

  const connectedNames = new Set(platforms.map((p) => p.name));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[rgb(var(--color-text))]">
          Platforms
        </h1>
        <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">
          Connect your social accounts to post automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(Object.keys(PLATFORM_META) as Array<'X' | 'THREADS'>).map((key) => {
          const meta = PLATFORM_META[key];
          const Icon = meta.icon;
          const connected = platforms.find((p) => p.name === key);
          const status = connected ? connected.status : 'DISCONNECTED';
          return (
            <article
              key={key}
              className="relative rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] transition hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))] shadow-sm">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[rgb(var(--color-text))] leading-tight">
                      {meta.label}
                    </h3>
                    <StatusBadge status={status} />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-sm text-[rgb(var(--color-text-muted))]">
                {connected?.connectedAt && (
                  <p className="text-xs">Connected {new Date(connected.connectedAt).toLocaleDateString()}</p>
                )}
              </div>

              <div className="mt-5 flex items-center gap-2">
                {status === 'CONNECTED' ? (
                  <a
                    href="#"
                    onClick={async (e) => {
                      e.preventDefault();
                      await fetch('/api/platforms/disconnect', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ platform: key }),
                      });
                      window.location.reload();
                    }}
                    className="w-full inline-flex items-center justify-center rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:bg-[rgb(var(--color-bg))] px-4 py-2.5 text-sm font-semibold text-[rgb(var(--color-text))] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                  >
                    Disconnect
                  </a>
                ) : (
                  <a
                    href={`/api/platforms/connect/${key.toLowerCase()}`}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-hover))] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                  >
                    Connect
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
