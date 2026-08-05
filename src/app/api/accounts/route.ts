import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const rows = await prisma.socialAccount.findMany({
    where: { userId: user.id },
    orderBy: { platformName: 'asc' },
  });

  const grouped: Record<string, typeof rows> = {};
  for (const r of rows) {
    const k = r.platformName;
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(r);
  }

  return NextResponse.json({ accounts: rows, grouped });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: { platform?: string; handle?: string; credentials?: string } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const platform = (body.platform || '').toUpperCase();
  if (!platform) return NextResponse.json({ error: 'Missing platform' }, { status: 400 });

  const handle = body.handle || '';
  const credentials = body.credentials || '{}';

  try {
    const acc = await prisma.socialAccount.create({
      data: {
        userId: user.id,
        platformName: platform as any,
        accountHandle: handle,
        accountName: handle,
        credentials,
        status: 'CONNECTED',
        isDefault: false,
      },
    });
    return NextResponse.json({ success: true, account: acc });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
