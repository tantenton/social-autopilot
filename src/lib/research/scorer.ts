import { GoogleGenerativeAI } from '@google/generative-ai';
import { Platform } from '../ai/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy');

export type PlatformName = 'X' | 'THREADS' | 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE';

export interface ScoreResult {
  score: number;
  reasoning: string;
  suggestedAngles: string[];
}

export async function scoreIdea(topic: string, platform: PlatformName): Promise<number> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `You are an expert virality researcher focused on the Indonesian market.
Topic: "${topic}"
Platform: ${platform}

Evaluate virality potential (0-100) based on:
- Emotional triggers: controversy, FOMO, humor, inspiration (weight 30%)
- Platform fit: short punchy for X, storytelling for Threads, visual for Instagram/TikTok, long form for YouTube (weight 25%)
- Trend recency: how fresh / rising is this topic? (weight 25%)
- Target audience Indonesia: relevance to Indonesian culture, language, and current events (weight 20%)

Return ONLY a JSON object with exactly these keys:
{ "score": number (0-100), "reasoning": "brief explanation", "suggestedAngles": ["angle1", "angle2", "angle3"] }
`;
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\s*|```/g, '').trim();
    const parsed = JSON.parse(cleaned) as ScoreResult;
    return Math.max(0, Math.min(100, Math.round(parsed.score || 50)));
  } catch {
    return 55;
  }
}

export async function scoreIdeaFull(topic: string, platform: PlatformName): Promise<ScoreResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `You are an expert virality researcher focused on the Indonesian market.
Topic: "${topic}"
Platform: ${platform}

Evaluate virality potential (0-100) based on:
- Emotional triggers: controversy, FOMO, humor, inspiration (weight 30%)
- Platform fit: short punchy for X, storytelling for Threads, visual for Instagram/TikTok, long form for YouTube (weight 25%)
- Trend recency: how fresh / rising is this topic? (weight 25%)
- Target audience Indonesia: relevance to Indonesian culture, language, and current events (weight 20%)

Return ONLY a JSON object with exactly these keys:
{ "score": number (0-100), "reasoning": "brief explanation", "suggestedAngles": ["angle1", "angle2", "angle3"] }
`;
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\s*|```/g, '').trim();
    const parsed = JSON.parse(cleaned) as ScoreResult;
    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score || 50))),
      reasoning: parsed.reasoning || 'No reasoning provided.',
      suggestedAngles: Array.isArray(parsed.suggestedAngles) ? parsed.suggestedAngles.slice(0, 3) : ['Viral hook angle', 'Storytelling angle', 'Controversial take'],
    };
  } catch {
    return {
      score: 55,
      reasoning: 'Fallback scoring applied.',
      suggestedAngles: ['Viral hook angle', 'Storytelling angle', 'Controversial take'],
    };
  }
}
