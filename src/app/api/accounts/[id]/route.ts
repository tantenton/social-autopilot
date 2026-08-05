import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { id } = await context.params;
  const acc = await prisma.socialAccount.findUnique({ where: { id } });
  if (!acc || acc.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.socialAccount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { id } = await context.params;
  let body: { isDefault?: boolean; platformName?: string } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const acc = await prisma.socialAccount.findUnique({ where: { id } });
  if (!acc || acc.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (body.isDefault === true) {
    await prisma.socialAccount.updateMany({
      where: { userId: user.id, platformName: acc.platformName, isDefault: true },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.socialAccount.update({
    where: { id },
    data: { isDefault: body.isDefault === undefined ? acc.isDefault : body.isDefault },
  });
  return NextResponse.json({ success: true, account: updated });
}
