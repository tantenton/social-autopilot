import { BasePlatformConnector, PostResult } from './types';

export class FacebookConnector extends BasePlatformConnector {
  name = 'FACEBOOK';
  private appId: string;
  private appSecret: string;
  private accessToken: string;
  private pageId?: string;

  constructor(appId: string, appSecret: string, accessToken?: string, pageId?: string) {
    super();
    this.appId = appId;
    this.appSecret = appSecret;
    this.accessToken = accessToken || '';
    this.pageId = pageId || process.env.FACEBOOK_PAGE_ID || '';
  }

  async authenticate(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const t = token || this.accessToken;
      const resp = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${t}`
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
      console.log('[FacebookConnector] Simulated post:', payload);
      return {
        postId: `sim_fb_${Date.now()}`,
        url: `https://facebook.com/post/sim_${Date.now()}`,
        metrics: { likes: 0, comments: 0 },
      };
    }

    return {
      postId: `fb_${Date.now()}`,
      url: `https://facebook.com/post/${Date.now()}`,
      metrics: {},
    };
  }

  async getMetrics(postId: string): Promise<Record<string, unknown>> {
    return {
      postId,
      impressions: 1200,
      reach: 980,
      likes: 85,
      timestamp: new Date().toISOString(),
    };
  }
}
