import { NextRequest, NextResponse } from 'next/server';
import { TwitterConnector, ThreadsConnector, InstagramConnector, TikTokConnector, YouTubeConnector, FacebookConnector } from '@/lib/platforms';
import { checkPublishRateLimit, isIdempotent, setIdempotencyStatus } from '@/lib/publish-guard';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform: rawPlatform } = await params;
    const platform = rawPlatform.toUpperCase();
    const idempotencyKey = req.headers.get('x-idempotency-key') || req.headers.get('idempotency-key');

    // 1. Idempotency check if key provided in header
    if (idempotencyKey) {
      const alreadyProcessed = await isIdempotent(idempotencyKey);
      if (alreadyProcessed) {
        return NextResponse.json({ success: true, message: 'Request already processed (idempotent response)' }, { status: 200 });
      }
      await setIdempotencyStatus(idempotencyKey, 'in_progress', 60);
    }

    // 2. Rate limiting check
    await checkPublishRateLimit(platform);

    const { text, imageUrl } = await req.json();

    let result;
    if (platform === 'X') {
      const conn = new TwitterConnector('', '', '');
      result = await conn.post(text || 'Hello from X connector', imageUrl);
    } else if (platform === 'THREADS') {
      const conn = new ThreadsConnector('', '', '');
      result = await conn.post(text || 'Hello from Threads connector', imageUrl);
    } else if (platform === 'INSTAGRAM') {
      const conn = new InstagramConnector(
        process.env.INSTAGRAM_APP_ID || '',
        process.env.INSTAGRAM_APP_SECRET || '',
        process.env.INSTAGRAM_ACCESS_TOKEN
      );
      result = await conn.post(text || 'Hello from Instagram connector', imageUrl);
    } else if (platform === 'TIKTOK') {
      const conn = new TikTokConnector(
        process.env.TIKTOK_CLIENT_KEY || '',
        process.env.TIKTOK_CLIENT_SECRET || '',
        process.env.TIKTOK_ACCESS_TOKEN
      );
      result = await conn.post(text || 'Hello from TikTok connector', imageUrl);
    } else if (platform === 'YOUTUBE') {
      const conn = new YouTubeConnector(
        process.env.YOUTUBE_CLIENT_ID || '',
        process.env.YOUTUBE_CLIENT_SECRET || '',
        process.env.YOUTUBE_ACCESS_TOKEN
      );
      result = await conn.post(text || 'Hello from YouTube connector', imageUrl);
    } else if (platform === 'FACEBOOK') {
      const conn = new FacebookConnector(
        process.env.FACEBOOK_APP_ID || '',
        process.env.FACEBOOK_APP_SECRET || '',
        process.env.FACEBOOK_ACCESS_TOKEN,
        process.env.FACEBOOK_PAGE_ID
      );
      result = await conn.post(text || 'Hello from Facebook connector', imageUrl);
    } else {
      if (idempotencyKey) await setIdempotencyStatus(idempotencyKey, 'completed', 0);
      return NextResponse.json({ error: 'Platform not supported' }, { status: 400 });
    }

    if (idempotencyKey) {
      await setIdempotencyStatus(idempotencyKey, 'completed', 86400);
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
