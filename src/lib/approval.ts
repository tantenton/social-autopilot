import { prisma } from './db';

export async function submitForReview(postId: string, userId: string) {
  return prisma.post.update({
    where: { id: postId },
    data: { approvalStatus: 'PENDING_REVIEW' },
  });
}

export async function approvePost(postId: string, reviewerId: string, note?: string) {
  return prisma.post.update({
    where: { id: postId },
    data: {
      approvalStatus: 'APPROVED',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNote: note || null,
    },
  });
}

export async function rejectPost(postId: string, reviewerId: string, note: string) {
  return prisma.post.update({
    where: { id: postId },
    data: {
      approvalStatus: 'REJECTED',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNote: note,
    },
  });
}

export async function getPendingReviews(userId: string) {
  return prisma.post.findMany({
    where: {
      approvalStatus: 'PENDING_REVIEW',
      content: {
        idea: {
          userId,
        },
      },
    },
    include: {
      content: {
        include: {
          idea: true,
        },
      },
      connectedPlatform: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getDraftPosts(userId: string) {
  return prisma.post.findMany({
    where: {
      approvalStatus: 'DRAFT',
      content: {
        idea: {
          userId,
        },
      },
    },
    include: {
      content: {
        include: {
          idea: true,
        },
      },
      connectedPlatform: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
