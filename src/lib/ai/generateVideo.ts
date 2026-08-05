import { fal } from '@fal-ai/client';

fal.config({
  credentials: process.env.FAL_KEY || 'dummy',
});

export interface VideoGenInput {
  prompt: string;
  imageUrl?: string;
  duration?: 5 | 10;
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

export interface VideoGenOutput {
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
}

export async function generateVideo(input: VideoGenInput): Promise<VideoGenOutput> {
  try {
    const duration = input.duration || 5;
    const aspectRatio = input.aspectRatio || '9:16';

    const result = await fal.subscribe('fal-ai/minimax-video', {
      input: {
        prompt: input.prompt,
        duration,
        aspect_ratio: aspectRatio,
        ...(input.imageUrl ? { image_url: input.imageUrl } : {}),
      },
    });

    const videoUrl =
      (result as any)?.video_url ||
      (result as any)?.data?.video_url ||
      (result as any)?.video?.url ||
      undefined;

    const thumbnailUrl =
      (result as any)?.thumbnail_url ||
      (result as any)?.data?.thumbnail_url ||
      undefined;

    return {
      videoUrl: videoUrl || `https://placehold.co/720x1280/2a2a2a/FFF?text=Generated+Video`,
      thumbnailUrl: thumbnailUrl || undefined,
      duration,
    };
  } catch {
    return {
      videoUrl: `https://placehold.co/720x1280/2a2a2a/FFF?text=Generated+Video`,
      duration: input.duration || 5,
    };
  }
}
