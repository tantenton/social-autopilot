import { NextRequest, NextResponse } from 'next/server';
import { submitForReview } from '@/lib/approval';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId } = body;
    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
    }
    const userId = 'user-id'; // Replace with session user id
    const post = await submitForReview(postId, userId);
    return NextResponse.json({ status: 'PENDING_REVIEW', postId, post });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
