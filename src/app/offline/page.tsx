"use client";

export default function OfflinePage() {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center" aria-label="Offline page">
      <div className="rounded-2xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] shadow-lg p-10 max-w-md w-full">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--color-primary-light))]">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 2a8 8 0 0 1 0 16" /><path d="M2 10h8" /><line x1="14" y1="14" x2="22" y2="22" /><line x1="22" y1="10" x2="22" y2="2" /></svg>
        </div>
        <h1 className="text-xl font-extrabold text-[rgb(var(--color-text))] tracking-tight">You are offline</h1>
        <p className="mt-2 text-sm text-[rgb(var(--color-text-muted))]">Check your connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--color-primary))] text-white px-5 py-2.5 text-sm font-medium shadow hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary-hover))] focus-visible:ring-offset-2"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
