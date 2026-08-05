"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Overview" },
    { href: "/campaigns", label: "Campaigns" },
    { href: "/content", label: "Content" },
    { href: "/calendar", label: "Calendar" },
  ];

  return (
    <div className="flex min-h-[100dvh]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[rgb(var(--color-surface))] border-r border-[rgb(var(--color-border))] shadow-md transform transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:z-auto lg:block`}
      >
        <div className="flex h-14 items-center justify-between px-5 border-b border-[rgb(var(--color-border))]">
          <Link href="/" className="text-lg font-bold tracking-tight text-[rgb(var(--color-primary))]">
            Social Autopilot
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-[rgb(var(--color-bg))]"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-3 space-y-1" aria-label="Dashboard navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-primary-light))] hover:text-[rgb(var(--color-primary))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 h-14 bg-[rgb(var(--color-surface))]/80 backdrop-blur border-b border-[rgb(var(--color-border))] px-4 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-[rgb(var(--color-bg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-semibold text-[rgb(var(--color-text-muted))] truncate">
            Dashboard
          </h1>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
