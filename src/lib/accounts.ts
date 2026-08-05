'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { PlatformName, PlatformStatus } from '@prisma/client';

export async function getAccounts(userId?: string) {
  const session = await auth();
  const id = userId || session?.user?.email ? (await prisma.user.findUnique({ where: { email: session!.user!.email! } }))?.id : null;
  if (!id) throw new Error('Not authenticated');

  const accounts = await prisma.socialAccount.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
  });

  const grouped: Record<string, typeof accounts> = {};
  for (const a of accounts) {
    const key = a.platformName;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  }
  return grouped;
}

export async function addAccount(userId: string, platform: PlatformName, handle: string, credentials: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.id !== userId) throw new Error('Unauthorized');

  return prisma.socialAccount.create({
    data: {
      userId,
      platformName: platform,
      accountHandle: handle,
      accountName: handle,
      credentials,
      status: 'CONNECTED',
      isDefault: false,
    },
  });
}

export async function setDefaultAccount(userId: string, platform: PlatformName, accountId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.id !== userId) throw new Error('Unauthorized');

  await prisma.socialAccount.updateMany({
    where: { userId, platformName: platform, isDefault: true },
    data: { isDefault: false },
  });

  return prisma.socialAccount.update({
    where: { id: accountId },
    data: { isDefault: true },
  });
}

export async function removeAccount(accountId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.id !== userId) throw new Error('Unauthorized');

  const acc = await prisma.socialAccount.findUnique({ where: { id: accountId } });
  if (!acc || acc.userId !== userId) throw new Error('Account not found');

  return prisma.socialAccount.delete({ where: { id: accountId } });
}
