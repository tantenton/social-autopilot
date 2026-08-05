import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  TwitterConnector,
  ThreadsConnector,
  InstagramConnector,
  TikTokConnector,
  YouTubeConnector,
  FacebookConnector,
} from '@/lib/platforms';
import {
  acquireIdempotencyLock,
  getIdempotencyStatus,
  setIdempotencyStatus,
  clearIdempotencyStatus,
  checkPublishRateLimit,
} from '@/lib/publish-guard';
import {
  ValidationError,
  IdempotencyConflictError,
  formatErrorResponse,
} from '@/lib/errors';

const SupportedPlatforms = ['X', 'THREADS', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE'] as const;

const PostSchema = z.object({
  text: z.string().min(1, 'Text post content is required'),
  imageUrl: z.string().url('imageUrl must be a valid URL').optional().or(z.literal('')),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  let idempotencyKey: string | null = null;

  try {
    const { platform: rawPlatform } = await params;
    const platform = rawPlatform.toUpperCase();

    if (!SupportedPlatforms.includes(platform as any)) {
      throw new ValidationError(`Platform '${rawPlatform}' is not supported`);
    }

    const headerKey = req.headers.get('x-idempotency-key') || req.headers.get('idempotency-key');
    if (headerKey) {
      if (headerKey.length > 128) {
        throw new ValidationError('Idempotency key exceeds maximum length of 128 characters');
      }
      idempotencyKey = headerKey;
    }

    // 1. Read body and validate payload using Zod BEFORE acquiring lock
    let jsonBody: any;
    try {
      jsonBody = await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body');
    }

    const parsed = PostSchema.safeParse(jsonBody);
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || 'Validation failed';
      throw new ValidationError(issue);
    }
    const { text, imageUrl } = parsed.data;

    // 2. Handle Idempotency locking if key is provided
    if (idempotencyKey) {
      const existingStatus = await getIdempotencyStatus(idempotencyKey);
      if (existingStatus === 'completed') {
        return NextResponse.json(
          { success: true, message: 'Request already processed (idempotent response)' },
          { status: 200 }
        );
      }
      if (existingStatus === 'in_progress') {
        throw new IdempotencyConflictError('Publish request with this idempotency key is currently in progress');
      }

      const acquired = await acquireIdempotencyLock(idempotencyKey, 60);
      if (!acquired) {
        throw new IdempotencyConflictError('Concurrent publish request in progress for this idempotency key');
      }
    }

    // 3. Rate Limit Check
    await checkPublishRateLimit(platform);

    // 4. Perform Publish
    let result: any;
    const img = imageUrl || undefined;

    if (platform === 'X') {
      const conn = new TwitterConnector('', '', '');
      result = await conn.post(text, img);
    } else if (platform === 'THREADS') {
      const conn = new ThreadsConnector('', '', '');
      result = await conn.post(text, img);
    } else if (platform === 'INSTAGRAM') {
      const conn = new InstagramConnector(
        process.env.INSTAGRAM_APP_ID || '',
        process.env.INSTAGRAM_APP_SECRET || '',
        process.env.INSTAGRAM_ACCESS_TOKEN
      );
      result = await conn.post(text, img);
    } else if (platform === 'TIKTOK') {
      const conn = new TikTokConnector(
        process.env.TIKTOK_CLIENT_KEY || '',
        process.env.TIKTOK_CLIENT_SECRET || '',
        process.env.TIKTOK_ACCESS_TOKEN
      );
      result = await conn.post(text, img);
    } else if (platform === 'YOUTUBE') {
      const conn = new YouTubeConnector(
        process.env.YOUTUBE_CLIENT_ID || '',
        process.env.YOUTUBE_CLIENT_SECRET || '',
        process.env.YOUTUBE_ACCESS_TOKEN
      );
      result = await conn.post(text, img);
    } else if (platform === 'FACEBOOK') {
      const conn = new FacebookConnector(
        process.env.FACEBOOK_APP_ID || '',
        process.env.FACEBOOK_APP_SECRET || '',
        process.env.FACEBOOK_ACCESS_TOKEN,
        process.env.FACEBOOK_PAGE_ID
      );
      result = await conn.post(text, img);
    }

    // Mark completed on success
    if (idempotencyKey) {
      await setIdempotencyStatus(idempotencyKey, 'completed', 86400);
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    // If publish fails and idempotency lock was acquired, clear lock so retries can proceed
    if (idempotencyKey) {
      try {
        await clearIdempotencyStatus(idempotencyKey);
      } catch (cleanupError) {
        console.error('[POST /api/platforms/post] Failed to clear idempotency lock:', cleanupError);
      }
    }
    return formatErrorResponse(error);
  }
}
