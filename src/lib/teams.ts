'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { TeamRole } from '@prisma/client';

export async function createTeam(name: string, ownerId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.id !== ownerId) throw new Error('Unauthorized');

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + crypto.randomUUID().slice(0, 8);

  const team = await prisma.team.create({
    data: { name, slug, ownerId },
  });

  await prisma.teamMember.create({
    data: { teamId: team.id, userId: ownerId, role: 'ADMIN' },
  });

  return team;
}

export async function inviteMember(teamId: string, email: string, role: TeamRole, inviterId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const inviter = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!inviter || inviter.id !== inviterId) throw new Error('Unauthorized');

  const memberRow = await prisma.teamMember.findFirst({ where: { teamId, userId: inviter.id } });
  if (!memberRow || memberRow.role !== 'ADMIN') throw new Error('Only ADMIN can invite');

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) throw new Error('User not found');

  return prisma.teamMember.upsert({
    where: { teamId_userId: { teamId, userId: targetUser.id } },
    update: { role },
    create: { teamId, userId: targetUser.id, role },
  });
}

export async function removeMember(teamId: string, userId: string, requesterId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const requester = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!requester || requester.id !== requesterId) throw new Error('Unauthorized');

  const adminRow = await prisma.teamMember.findFirst({ where: { teamId, userId: requester.id } });
  if (!adminRow || adminRow.role !== 'ADMIN') throw new Error('Only ADMIN can remove');

  return prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
}

export async function updateRole(teamId: string, userId: string, role: TeamRole, requesterId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const requester = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!requester || requester.id !== requesterId) throw new Error('Unauthorized');

  const adminRow = await prisma.teamMember.findFirst({ where: { teamId, userId: requester.id } });
  if (!adminRow || adminRow.role !== 'ADMIN') throw new Error('Only ADMIN can change role');

  return prisma.teamMember.update({ where: { teamId_userId: { teamId, userId } }, data: { role } });
}

export async function getTeam(teamId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.id !== userId) throw new Error('Unauthorized');

  const membership = await prisma.teamMember.findFirst({ where: { teamId, userId } });
  if (!membership) throw new Error('Not a member');

  return prisma.team.findUnique({
    where: { id: teamId },
    include: { members: { include: { user: true } }, owner: true },
  });
}

export async function getUserTeams(userId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.id !== userId) throw new Error('Unauthorized');

  return prisma.teamMember.findMany({
    where: { userId },
    include: { team: true },
  });
}
