import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { encrypt } from '@/lib/crypto';
import crypto from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  const { platform: raw } = await params;
  const platform = (raw || '').toUpperCase();

  if (platform !== 'X' && platform !== 'THREADS') {
    return NextResponse.redirect(new URL('/platforms?error=invalid_platform', req.url));
  }

  // PKCE code verifier
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');

  if (platform === 'X') {
    const url = new URL('https://twitter.com/i/oauth2/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', process.env.TWITTER_API_KEY || '');
    url.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/platforms/callback/x`);
    url.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access');
    url.searchParams.set('state', crypto.randomUUID());
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');

    const res = NextResponse.redirect(url.toString());
    res.cookies.set('oauth_verifier', encrypt(verifier), { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 300 });
    return res;
  }

  // Threads
  const url = new URL('https://www.threads.net/oauth/authorize');
  url.searchParams.set('client_id', process.env.THREADS_APP_ID || '');
  url.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/platforms/callback/threads`);
  url.searchParams.set('scope', 'threads_basic');

  const res = NextResponse.redirect(url.toString());
  res.cookies.set('oauth_verifier', encrypt(verifier), { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 300 });
  return res;
}
