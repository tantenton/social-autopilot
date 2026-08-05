import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('../src/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null), // Default unauthenticated
}));

const mockFindUniquePiece = vi.fn();
vi.mock('../src/lib/db', () => ({
  prisma: {
    contentPiece: {
      findUnique: (args: any) => mockFindUniquePiece(args),
    },
  },
}));

vi.mock('../src/lib/queue', () => ({
  videoGenerationQueue: {
    add: vi.fn().mockResolvedValue({ id: 'job-123' }),
  },
}));

import { POST } from '../src/app/api/content/generate-video/route';
import { auth } from '../src/lib/auth';

describe('Generate Video API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated request with 401 Unauthorized', async () => {
    (auth as any).mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3000/api/content/generate-video', {
      method: 'POST',
      body: JSON.stringify({ contentPieceId: 'cuid-123', prompt: 'Make a video' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Authentication required');
  });

  it('rejects invalid Zod payload with 400 Bad Request', async () => {
    (auth as any).mockResolvedValueOnce({ user: { email: 'user@example.com' } });

    const req = new NextRequest('http://localhost:3000/api/content/generate-video', {
      method: 'POST',
      body: JSON.stringify({ prompt: '' }), // Missing contentPieceId and empty prompt
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 Not Found if ContentPiece ID is not found in database', async () => {
    (auth as any).mockResolvedValueOnce({ user: { email: 'user@example.com' } });
    mockFindUniquePiece.mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3000/api/content/generate-video', {
      method: 'POST',
      body: JSON.stringify({ contentPieceId: 'non-existent-cuid', prompt: 'Generate video prompt' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('queues video generation job for authentic ContentPiece CUID and returns 200', async () => {
    (auth as any).mockResolvedValueOnce({ user: { email: 'user@example.com' } });
    mockFindUniquePiece.mockResolvedValueOnce({ id: 'valid-cuid-123', text: 'Valid content' });

    const req = new NextRequest('http://localhost:3000/api/content/generate-video', {
      method: 'POST',
      body: JSON.stringify({ contentPieceId: 'valid-cuid-123', prompt: 'Generate video prompt' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.jobId).toBe('job-123');
  });
});
