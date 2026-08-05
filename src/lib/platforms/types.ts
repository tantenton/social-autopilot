export interface PostResult {
  postId: string;
  url?: string;
  metrics?: Record<string, unknown>;
}

export interface IPlatformConnector {
  name: string;
  authenticate(token: string): Promise<{ success: boolean; error?: string }>;
  post(
    text: string,
    imageUrl?: string,
    options?: Record<string, unknown>
  ): Promise<PostResult>;
  getMetrics(postId: string): Promise<Record<string, unknown>>;
}

export abstract class BasePlatformConnector implements IPlatformConnector {
  abstract name: string;

  abstract authenticate(token: string): Promise<{ success: boolean; error?: string }>;
  abstract post(
    text: string,
    imageUrl?: string,
    options?: Record<string, unknown>
  ): Promise<PostResult>;
  abstract getMetrics(postId: string): Promise<Record<string, unknown>>;
}
