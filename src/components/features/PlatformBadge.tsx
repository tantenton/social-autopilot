import { Twitter, Instagram, Sparkles, Globe } from "lucide-react";

const icons: Record<string, React.ReactNode> = {
  X: <Twitter size={16} aria-hidden="true" />,
  Threads: <Sparkles size={16} aria-hidden="true" />,
  Instagram: <Instagram size={16} aria-hidden="true" />,
  Facebook: <Globe size={16} aria-hidden="true" />,
  TikTok: <Sparkles size={16} aria-hidden="true" />,
};

export function PlatformBadge({ platform }: { platform: string }) {
  const icon = icons[platform] || <Globe size={16} aria-hidden="true" />;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-2.5 py-1 text-xs font-medium text-[rgb(var(--color-text))] shadow-sm">
      {icon}
      <span>{platform}</span>
    </span>
  );
}
