import { Job } from 'bullmq';
import { generateVideo } from '../../src/lib/ai/generateVideo';
import { prisma } from '../../src/lib/db';

export default async function generateVideoJob(job: Job<any, any, string>) {
  const { contentPieceId, prompt, imageUrl, platform } = job.data;

  try {
    const result = await generateVideo({
      prompt,
      imageUrl,
      duration: 5,
      aspectRatio: '9:16',
    });

    await prisma.contentPiece.update({
      where: { id: contentPieceId },
      data: {
        assetUrl: result.videoUrl,
        mediaUrl: result.videoUrl,
      },
    });

    return { contentPieceId, videoUrl: result.videoUrl, duration: result.duration };
  } catch (e: any) {
    console.error(`[generateVideoJob] Error for ${contentPieceId}:`, e.message || e);
    throw e;
  }
}
