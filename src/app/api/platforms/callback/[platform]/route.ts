import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { decrypt, encrypt } from '@/lib/crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/auth/signin?error=unauth', req.url));
  }

  const { platform: raw } = await params;
  const platform = (raw || '').toUpperCase();

  if (platform !== 'X' && platform !== 'THREADS' && platform !== 'INSTAGRAM' && platform !== 'TIKTOK' && platform !== 'YOUTUBE' && platform !== 'FACEBOOK') {
    return NextResponse.redirect(new URL('/platforms?error=invalid_platform', req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const errorParam = url.searchParams.get('error');

  if (errorParam) {
    return NextResponse.redirect(new URL(`/platforms?error=oauth_denied`, req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`/platforms?error=missing_code`, req.url));
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const verifierMatch = cookieHeader.match(/oauth_verifier=([^;]+)/);
  let codeVerifier = '';
  if (verifierMatch) {
    try {
      codeVerifier = decrypt(verifierMatch[1]);
    } catch {
      return NextResponse.redirect(new URL(`/platforms?error=invalid_session`, req.url));
    }
  }

  try {
    // Exchange code for token (simulated / real endpoint placeholder)
    let tokenData: { access_token?: string; refresh_token?: string; expires_in?: number } = {};
    if (platform === 'X') {
      const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
      const body = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.TWITTER_API_KEY || '',
        redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/platforms/callback/x`,
        code_verifier: codeVerifier,
      }).toString();
      const resp = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (resp.ok) tokenData = (await resp.json()) as { access_token?: string; refresh_token?: string; expires_in?: number };
    } else if (platform === 'THREADS') {
      const resp = await fetch('https://graph.threads.net/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.THREADS_APP_ID || '',
          client_secret: process.env.THREADS_APP_SECRET || '',
          redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/platforms/callback/threads`,
          code,
        }),
      });
      if (resp.ok) tokenData = await resp.json();
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.redirect(new URL(`/platforms?error=user_not_found`, req.url));
    }

    // Encrypt credentials before DB storage
    const encryptedCreds = encrypt(JSON.stringify({
      access_token: tokenData.access_token || '',
      refresh_token: tokenData.refresh_token || '',
      expires_in: tokenData.expires_in || null,
      code_verifier: codeVerifier || '',
    }));

    await prisma.connectedPlatform.upsert({
      where: { userId_name: { userId: user.id, name: platform as any } },
      update: {
        status: 'CONNECTED',
        credentials: encryptedCreds,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        name: platform as any,
        status: 'CONNECTED',
        credentials: encryptedCreds,
      },
    });

    const res = NextResponse.redirect(new URL('/platforms', req.url));
    res.cookies.delete('oauth_verifier');
    return res;
  } catch (e) {
    const msg = (e as Error).message || 'unknown';
    return NextResponse.redirect(new URL(`/platforms?error=${encodeURIComponent(msg)}`, req.url));
  }
}
