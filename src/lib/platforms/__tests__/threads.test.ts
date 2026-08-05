import { describe, it, expect } from 'node:test';
import { ThreadsConnector } from '../threads';

describe('ThreadsConnector', () => {
  it('should simulate post when no token configured', async () => {
    const conn = new ThreadsConnector('', '', '');
    const result = await conn.post('Hello Threads');
    expect(result.postId).toMatch(/sim_threads_/);
  });

  it('should return simulated metrics', async () => {
    const conn = new ThreadsConnector('', '', '');
    const metrics = await conn.getMetrics('any');
    expect(metrics.likes).toBe(128);
  });
});
