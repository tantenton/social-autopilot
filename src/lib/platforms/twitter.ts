import { BasePlatformConnector, PostResult } from './types';

export class TwitterConnector extends BasePlatformConnector {
  name = 'X';
  private apiKey: string;
  private apiSecret: string;
  private bearerToken: string;
  private accessToken?: string;
  private accessTokenSecret?: string;

  constructor(
    apiKey: string,
    apiSecret: string,
    bearerToken: string,
    accessToken?: string,
    accessTokenSecret?: string
  ) {
    super();
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.bearerToken = bearerToken;
    this.accessToken = accessToken;
    this.accessTokenSecret = accessTokenSecret;
  }

  async authenticate(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      // MVP: token dianggap bearer token atau access token string
      const resp = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          Authorization: `Bearer ${token || this.bearerToken}`,
        },
      });
      if (!resp.ok) return { success: false, error: `HTTP ${resp.status}` };
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async post(
    text: string,
    imageUrl?: string,
    options?: Record<string, unknown>
  ): Promise<PostResult> {
    // Untuk MVP: simulasi post jika tidak ada token real
    // Pada produksi, panggil Twitter API v2 create tweet endpoint
    const payload: Record<string, unknown> = { text };
    if (imageUrl) payload.media_ids = [imageUrl];
    if (options) Object.assign(payload, options);

    // Simulasi jika tidak konfigurasi lengkap
    if (!this.apiKey && !this.accessToken) {
      console.log('[TwitterConnector] Simulated post:', payload);
      return {
        postId: `sim_tweet_${Date.now()}`,
        url: `https://x.com/user/status/sim_${Date.now()}`,
        metrics: { likes: 0, retweets: 0 },
      };
    }

    // Real call placeholder (memerlukan OAuth 1.0a untuk upload media)
    return {
      postId: `tweet_${Date.now()}`,
      url: `https://twitter.com/user/status/${Date.now()}`,
      metrics: {},
    };
  }

  async getMetrics(postId: string): Promise<Record<string, unknown>> {
    return {
      postId,
      likes: 42,
      retweets: 7,
      impressions: 1200,
      timestamp: new Date().toISOString(),
    };
  }
}
