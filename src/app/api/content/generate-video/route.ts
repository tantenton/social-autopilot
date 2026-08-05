import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { videoGenerationQueue } from '@/lib/queue';
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  formatErrorResponse,
} from '@/lib/errors';

const SupportedPlatforms = ['X', 'THREADS', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE'] as const;

const GenerateVideoSchema = z.object({
  contentPieceId: z.string().min(1, 'contentPieceId is required'),
  prompt: z.string().min(1, 'prompt is required'),
  imageUrl: z.string().url('imageUrl must be a valid URL').optional().or(z.literal('')),
  platform: z.enum(SupportedPlatforms).optional().default('TIKTOK'),
});

export async function POST(req: NextRequest) {
  try {
    // Strict authentication requirement
    const session = await auth();
    if (!session?.user?.email) {
      throw new UnauthorizedError('Authentication required');
    }

    let jsonBody: any;
    try {
      jsonBody = await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body');
    }

    const parsed = GenerateVideoSchema.safeParse(jsonBody);
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || 'Validation failed';
      throw new ValidationError(issue);
    }
    const { contentPieceId, prompt, imageUrl, platform } = parsed.data;

    // Verify ContentPiece exists in Prisma DB
    const existingPiece = await prisma.contentPiece.findUnique({
      where: { id: contentPieceId },
    });

    if (!existingPiece) {
      throw new NotFoundError(`ContentPiece with ID '${contentPieceId}' not found in database`);
    }

    const job = await videoGenerationQueue.add('generate-video', {
      contentPieceId,
      prompt,
      imageUrl: imageUrl || undefined,
      platform,
    });

    return NextResponse.json({ success: true, jobId: job.id }, { status: 200 });
  } catch (error) {
    return formatErrorResponse(error);
  }
}
