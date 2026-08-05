import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateIdeas } from '@/lib/research/ideaGenerator';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const platformFilter = searchParams.get('platform');
    const sort = searchParams.get('sort') || 'score';

    const where: any = { userId: user.id };
    if (platformFilter) {
      where.platforms = { has: platformFilter };
    }

    const ideas = await prisma.contentIdea.findMany({
      where,
      orderBy: sort === 'score' ? { viralityScore: 'desc' } : { createdAt: 'desc' },
    });
    return NextResponse.json({ ideas });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { topics, platforms } = body;
    if (!topics || !platforms || !Array.isArray(topics) || !Array.isArray(platforms)) {
      return NextResponse.json({ error: 'topics and platforms arrays required' }, { status: 400 });
    }
    const saved = await generateIdeas(topics, platforms as any, user.id);
    return NextResponse.json({ saved, count: saved.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
