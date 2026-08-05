import type { Metadata } from "next";
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
      <body className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] antialiased">
        <div className="min-h-[100dvh]">
          {children}
        </div>
      </body>
    </html>
  );
}
