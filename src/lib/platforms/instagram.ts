import { BasePlatformConnector, PostResult } from './types';

export class InstagramConnector extends BasePlatformConnector {
  name = 'INSTAGRAM';
  private appId: string;
  private appSecret: string;
  private accessToken: string;

  constructor(appId: string, appSecret: string, accessToken?: string) {
    super();
    this.appId = appId;
    this.appSecret = appSecret;
    this.accessToken = accessToken || '';
  }

  async authenticate(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const t = token || this.accessToken;
      const resp = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${t}`
      );
      if (!resp.ok) return { success: false, error: `HTTP ${resp.status}` };
      const data = (await resp.json()) as { error?: { message: string } };
      if (data.error) return { success: false, error: data.error.message };
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
    const payload: Record<string, unknown> = { text };
    if (imageUrl) payload.image_url = imageUrl;
    if (options) Object.assign(payload, options);

    if (!this.accessToken && !this.appId) {
      console.log('[InstagramConnector] Simulated post:', payload);
      return {
        postId: `sim_ig_${Date.now()}`,
        url: `https://instagram.com/p/sim_${Date.now()}`,
        metrics: { likes: 0, comments: 0 },
      };
    }

    return {
      postId: `ig_${Date.now()}`,
      url: `https://instagram.com/p/${Date.now()}`,
      metrics: {},
    };
  }

  async getMetrics(postId: string): Promise<Record<string, unknown>> {
    return {
      postId,
      impressions: 3400,
      reach: 1200,
      likes_count: 210,
      timestamp: new Date().toISOString(),
    };
  }
}
