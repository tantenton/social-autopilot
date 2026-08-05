import { NextRequest, NextResponse } from 'next/server';
import { getScheduleSuggestions } from '@/lib/smart-scheduler';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform') || 'X';
    const count = parseInt(searchParams.get('count') || '5', 10);

    const times = await getScheduleSuggestions(platform, count);
    return NextResponse.json({ platform, count, times });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
