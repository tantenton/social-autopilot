import { NextRequest, NextResponse } from 'next/server';
import { approvePost, rejectPost } from '@/lib/approval';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, action, note } = body;

    if (!postId || !action) {
      return NextResponse.json({ error: 'Missing postId or action' }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Role check: only ADMIN/EDITOR allowed (simplified — assume request has user info)
    const reviewerId = 'reviewer-id'; // Replace with actual session user id in production

    if (action === 'approve') {
      const post = await approvePost(postId, reviewerId, note);
      return NextResponse.json({ status: 'APPROVED', postId, post });
    } else {
      if (!note) {
        return NextResponse.json({ error: 'Rejection requires a note' }, { status: 400 });
      }
      const post = await rejectPost(postId, reviewerId, note);
      return NextResponse.json({ status: 'REJECTED', postId, post });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
