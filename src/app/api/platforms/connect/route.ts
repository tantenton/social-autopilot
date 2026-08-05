import { NextRequest, NextResponse } from 'next/server';
import { TwitterConnector, ThreadsConnector } from '@/lib/platforms';

export async function POST(req: NextRequest) {
  try {
    const { platform, token } = await req.json();
    if (platform === 'X') {
      const conn = new TwitterConnector('', '', token || '');
      const auth = await conn.authenticate(token || '');
      return NextResponse.json({ success: auth.success, error: auth.error }, { status: auth.success ? 200 : 400 });
    }
    if (platform === 'THREADS') {
      const conn = new ThreadsConnector('', '', token || '');
      const auth = await conn.authenticate(token || '');
      return NextResponse.json({ success: auth.success, error: auth.error }, { status: auth.success ? 200 : 400 });
    }
    return NextResponse.json({ error: 'Unknown platform' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
