import { NextRequest, NextResponse } from 'next/server';
import { scheduleCampaignPosts } from '@/lib/smart-scheduler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId } = body;
    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
    }
    const userId = 'user-id'; // Replace with session user id
    const count = await scheduleCampaignPosts(campaignId, userId);
    return NextResponse.json({ status: 'scheduled', campaignId, count });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
