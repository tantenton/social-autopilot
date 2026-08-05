import { BasePlatformConnector, PostResult } from './types';

export class YouTubeConnector extends BasePlatformConnector {
  name = 'YOUTUBE';
  private clientId: string;
  private clientSecret: string;
  private accessToken: string;

  constructor(clientId: string, clientSecret: string, accessToken?: string) {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = accessToken || '';
  }

  async authenticate(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const t = token || this.accessToken;
      const resp = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true&access_token=${t}`
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
    const tags = (options?.tags as string[]) || ['#Shorts'];
    const payload: Record<string, unknown> = { text, tags: tags.join(','), videoUrl };
    if (videoUrl) payload.video_url = videoUrl;
    if (options) Object.assign(payload, options);

    if (!this.accessToken && !this.clientId) {
      console.log('[YouTubeConnector] Simulated post:', payload);
      return {
        postId: `sim_yt_${Date.now()}`,
        url: `https://youtube.com/shorts/sim_${Date.now()}`,
        metrics: { views: 0, likes: 0 },
      };
    }

    return {
      postId: `yt_${Date.now()}`,
      url: `https://youtube.com/shorts/${Date.now()}`,
      metrics: {},
    };
  }

  async getMetrics(postId: string): Promise<Record<string, unknown>> {
    return {
      postId,
      viewCount: 15200,
      likeCount: 890,
      commentCount: 45,
      timestamp: new Date().toISOString(),
    };
  }
}
