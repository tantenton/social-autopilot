import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
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
        <div className="relative h-48 w-full">
          <Image
            src={image}
            alt={text}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            unoptimized
          />
        </div>
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
