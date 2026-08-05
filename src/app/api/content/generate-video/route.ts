import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { videoGenerationQueue } from '@/lib/queue';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { contentPieceId, prompt, imageUrl, platform } = body;

    if (!contentPieceId || !prompt) {
      return NextResponse.json({ error: 'contentPieceId and prompt required' }, { status: 400 });
    }

    const job = await videoGenerationQueue.add('generate-video', {
      contentPieceId: String(contentPieceId),
      prompt,
      imageUrl: imageUrl || undefined,
      platform: platform || 'TIKTOK',
    });

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
