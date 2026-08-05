import { BasePlatformConnector, PostResult } from './types';

export class ThreadsConnector extends BasePlatformConnector {
  name = 'THREADS';
  private appId: string;
  private appSecret: string;
  private accessToken: string;

  constructor(
    appId: string,
    appSecret: string,
    accessToken?: string
  ) {
    super();
    this.appId = appId;
    this.appSecret = appSecret;
    this.accessToken = accessToken || '';
  }

  async authenticate(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const t = token || this.accessToken;
      const resp = await fetch(
        `https://graph.threads.net/v1.0/me?fields=id,username&access_token=${t}`
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
      console.log('[ThreadsConnector] Simulated post:', payload);
      return {
        postId: `sim_threads_${Date.now()}`,
        url: `https://threads.net/@user/post/sim_${Date.now()}`,
        metrics: { likes: 0, replies: 0 },
      };
    }

    // Real Threads Graph API call placeholder
    return {
      postId: `threads_${Date.now()}`,
      url: `https://threads.net/@user/post/${Date.now()}`,
      metrics: {},
    };
  }

  async getMetrics(postId: string): Promise<Record<string, unknown>> {
    return {
      postId,
      likes: 128,
      replies: 15,
      shares: 32,
      timestamp: new Date().toISOString(),
    };
  }
}
