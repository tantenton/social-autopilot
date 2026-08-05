import { Job } from 'bullmq';
import { generateText } from '../../src/lib/ai/generateText';
import { generateImage } from '../../src/lib/ai/generateImage';
import { prisma } from '../../src/lib/db';
import { Platform, Tone } from '../../src/lib/ai/types';

export default async function generateContentJob(job: Job<any, any, string>) {
  const { ideaId, topic, platform, tone } = job.data;
  const p = (platform as string) as Platform;
  const t = (tone as string) as Tone;

  const textResult = await generateText({ topic, platform: p, tone: t });
  const imageUrl = await generateImage({ topic, platform: p, tone: t }, 'meme');

  const piece = await prisma.contentPiece.create({
    data: {
      ideaId,
      topic,
      platform: String(p),
      tone: String(t),
      text: textResult.text,
      imageUrl: imageUrl || null,
      assetUrl: imageUrl || null,
      rationale: textResult.rationale,
      viralityEstimate: textResult.viralityEstimate,
      status: 'draft',
    },
  });

  return { contentPieceId: piece.id, imageUrl, text: textResult.text };
}
