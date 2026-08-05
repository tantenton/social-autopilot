import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const memberships = await prisma.teamMember.findMany({
    where: { userId: user.id },
    include: { team: true },
  });
  return NextResponse.json({ teams: memberships.map(m => ({ ...m.team, role: m.role })) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: { name?: string } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body.name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 8);
  const team = await prisma.team.create({ data: { name: body.name, slug, ownerId: user.id } });
  await prisma.teamMember.create({ data: { teamId: team.id, userId: user.id, role: 'ADMIN' } });
  return NextResponse.json({ success: true, team });
}
