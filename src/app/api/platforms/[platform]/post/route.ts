import { NextRequest, NextResponse } from 'next/server';
import { TwitterConnector, ThreadsConnector } from '@/lib/platforms';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform: rawPlatform } = await params;
    const platform = rawPlatform.toUpperCase();
    const { text, imageUrl } = await req.json();

    let result;
    if (platform === 'X') {
      const conn = new TwitterConnector('', '', '');
      result = await conn.post(text || 'Hello from X connector', imageUrl);
    } else if (platform === 'THREADS') {
      const conn = new ThreadsConnector('', '', '');
      result = await conn.post(text || 'Hello from Threads connector', imageUrl);
    } else {
      return NextResponse.json({ error: 'Platform not supported' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
