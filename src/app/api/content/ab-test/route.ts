import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createVariants, scoreVariants } from '@/lib/ab-testing';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { topic, platform, count } = body;

    if (!topic || !platform) {
      return NextResponse.json({ error: 'topic and platform required' }, { status: 400 });
    }

    const variants = await createVariants(topic, platform, count || 3);
    const scored = await scoreVariants(variants);

    return NextResponse.json({ variants: scored });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
