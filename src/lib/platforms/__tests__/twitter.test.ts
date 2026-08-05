import { describe, it, expect } from 'node:test';
import { TwitterConnector } from '../twitter';

describe('TwitterConnector', () => {
  it('should simulate post when no token configured', async () => {
    const conn = new TwitterConnector('', '', '');
    const result = await conn.post('Hello X');
    expect(result.postId).toMatch(/sim_tweet_/);
  });

  it('should return simulated metrics', async () => {
    const conn = new TwitterConnector('', '', '');
    const metrics = await conn.getMetrics('any');
    expect(metrics.likes).toBe(42);
  });
});
