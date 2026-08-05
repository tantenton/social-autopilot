import { NextRequest, NextResponse } from 'next/server';
import { queuePublishPost } from '@/lib/queue-manager';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contentPieceId, platform, scheduledAt } = body;
    if (!contentPieceId || !platform || !scheduledAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Resolve platformId from connected platform
    const connected = await prisma.connectedPlatform.findFirst({
      where: { name: platform },
    });
    if (!connected) {
      return NextResponse.json({ error: 'Platform not connected' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        contentId: contentPieceId,
        platformId: connected.id,
        platform,
        scheduledAt: new Date(scheduledAt),
        status: 'QUEUED',
      },
    });

    const job = await queuePublishPost(post.id, scheduledAt);
    return NextResponse.json({ postId: post.id, jobId: job.id, status: 'scheduled' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
