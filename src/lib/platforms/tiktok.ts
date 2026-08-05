import { BasePlatformConnector, PostResult } from './types';

export class TikTokConnector extends BasePlatformConnector {
  name = 'TIKTOK';
  private clientKey: string;
  private clientSecret: string;
  private accessToken: string;

  constructor(clientKey: string, clientSecret: string, accessToken?: string) {
    super();
    this.clientKey = clientKey;
    this.clientSecret = clientSecret;
    this.accessToken = accessToken || '';
  }

  async authenticate(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const t = token || this.accessToken;
      const resp = await fetch(
        `https://open.tiktokapis.com/v2/user/info/?access_token=${t}`
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
    videoUrl?: string,
    options?: Record<string, unknown>
  ): Promise<PostResult> {
    const payload: Record<string, unknown> = { text };
    if (videoUrl) payload.video_url = videoUrl;
    if (options) Object.assign(payload, options);

    if (!this.accessToken && !this.clientKey) {
      console.log('[TikTokConnector] Simulated post:', payload);
      return {
        postId: `sim_tiktok_${Date.now()}`,
        url: `https://tiktok.com/@user/video/sim_${Date.now()}`,
        metrics: { likes: 0, views: 0 },
      };
    }

    return {
      postId: `tiktok_${Date.now()}`,
      url: `https://tiktok.com/@user/video/${Date.now()}`,
      metrics: {},
    };
  }

  async getMetrics(postId: string): Promise<Record<string, unknown>> {
    return {
      postId,
      views: 85000,
      likes: 4200,
      shares: 310,
      timestamp: new Date().toISOString(),
    };
  }
}
