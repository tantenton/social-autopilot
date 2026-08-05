import { NextRequest, NextResponse } from 'next/server';
import { queueGenerateContent } from '@/lib/queue-manager';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ideaId, topic, platform, tone } = body;
    if (!ideaId || !topic || !platform || !tone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const job = await queueGenerateContent(ideaId, { topic, platform, tone });
    return NextResponse.json({ jobId: job.id, status: 'queued' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
