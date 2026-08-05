import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { id } = await context.params;
  const members = await prisma.teamMember.findMany({
    where: { teamId: id },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });
  return NextResponse.json({ members: members.map(m => ({ ...m, userName: m.user.name, userEmail: m.user.email })) });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { id } = await context.params;
  const adminRow = await prisma.teamMember.findFirst({ where: { teamId: id, userId: user.id } });
  if (!adminRow || adminRow.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: { email?: string; role?: string } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body.email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { email: body.email } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const member = await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: id, userId: target.id } },
    update: { role: (body.role as any) || 'VIEWER' },
    create: { teamId: id, userId: target.id, role: (body.role as any) || 'VIEWER' },
  });
  return NextResponse.json({ success: true, member });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { id: teamId } = await context.params;
  const query = new URL(req.url).searchParams;
  const userId = query.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const adminRow = await prisma.teamMember.findFirst({ where: { teamId, userId: user.id } });
  if (!adminRow || adminRow.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { id: teamId } = await context.params;
  const adminRow = await prisma.teamMember.findFirst({ where: { teamId, userId: user.id } });
  if (!adminRow || adminRow.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: { userId?: string; role?: string } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body.userId || !body.role) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const updated = await prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId: body.userId } },
    data: { role: body.role as any },
  });
  return NextResponse.json({ success: true, member: updated });
}
