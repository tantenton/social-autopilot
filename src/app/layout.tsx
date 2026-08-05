import type { Metadata } from "next";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Autopilot",
  description: "Autonomous social media manager",
  viewport: "width=device-width, initial-scale=1, minimum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6d28d9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] antialiased">
        <div className="min-h-[100dvh]">
          {children}
        </div>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
