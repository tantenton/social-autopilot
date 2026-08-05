'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function getPlatforms() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { platforms: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.platforms.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    connectedAt: p.connectedAt.toISOString(),
  }));
}
