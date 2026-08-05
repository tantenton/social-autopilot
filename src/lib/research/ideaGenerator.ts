import { GoogleGenerativeAI } from '@google/generative-ai';
import { PlatformName } from './scorer';
import { prisma } from '../db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy');

export interface ContentIdeaDB {
  id: string;
  userId: string;
  topic: string;
  viralityScore: number;
  sentiment: string | null;
  trendingSince: Date | null;
  platforms: PlatformName[];
  metadata: any;
  createdAt: Date;
}

export async function generateIdeas(
  topics: string[],
  platforms: PlatformName[],
  userId: string
): Promise<ContentIdeaDB[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const saved: ContentIdeaDB[] = [];

  for (const topic of topics) {
    for (const platform of platforms) {
      const prompt = `Generate 3 viral content angles for the topic "${topic}" on platform ${platform} for an Indonesian audience.
Return ONLY JSON array of 3 objects with keys: angle (string), hook (string), tone (CASUAL/PROFESSIONAL/HUMOROUS).
`;
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = text.replace(/```json\s*|```/g, '').trim();
        const angles = JSON.parse(cleaned) as Array<{ angle: string; hook: string; tone: string }>;
        const anglesSafe = Array.isArray(angles) ? angles.slice(0, 3) : [
          { angle: 'Hook angle for viral reach', hook: 'Shocking stat opening', tone: 'CASUAL' },
          { angle: 'Storytelling angle', hook: 'Personal journey narrative', tone: 'PROFESSIONAL' },
          { angle: 'Controversial take', hook: 'Unpopular opinion hook', tone: 'HUMOROUS' },
        ];
        for (const a of anglesSafe) {
          const score = 50 + Math.floor(Math.random() * 45);
          const idea = await prisma.contentIdea.create({
            data: {
              userId,
              topic,
              viralityScore: score,
              sentiment: a.tone,
              platforms: [platform],
              metadata: { angle: a.angle, hook: a.hook, tone: a.tone, source: 'gemini-idea-gen' },
            },
          });
          saved.push({
            ...idea,
            platforms: idea.platforms as PlatformName[],
            metadata: idea.metadata,
            trendingSince: idea.trendingSince ? new Date(idea.trendingSince) : null,
          });
        }
      } catch {
        for (let i = 0; i < 3; i++) {
          const score = 50 + Math.floor(Math.random() * 45);
          const idea = await prisma.contentIdea.create({
            data: {
              userId,
              topic,
              viralityScore: score,
              sentiment: 'CASUAL',
              platforms: [platform],
              metadata: { angle: `Angle ${i + 1}`, hook: 'Default hook', tone: 'CASUAL', source: 'fallback' },
            },
          });
          saved.push({
            ...idea,
            platforms: idea.platforms as PlatformName[],
            metadata: idea.metadata,
            trendingSince: idea.trendingSince ? new Date(idea.trendingSince) : null,
          });
        }
      }
    }
  }

  return saved;
}
