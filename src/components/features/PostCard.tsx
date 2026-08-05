import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "./PlatformBadge";

export function PostCard({
  text,
  platform,
  image,
}: {
  text: string;
  platform: string;
  image?: string;
}) {
  return (
    <Card className="rounded-xl shadow-sm border-[rgb(var(--color-border))] overflow-hidden hover:-translate-y-1 transition-transform">
      {image && (
        <img
          src={image}
          alt={text}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <PlatformBadge platform={platform} />
        </div>
        <p className="text-sm font-medium line-clamp-3">{text}</p>
      </CardContent>
    </Card>
  );
}
