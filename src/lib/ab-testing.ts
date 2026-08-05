import { GoogleGenerativeAI } from '@google/generative-ai';
import { scoreIdea } from '../lib/research/scorer';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy');

export interface ContentVariant {
  id: string;
  text: string;
  imagePrompt: string;
  predictedScore: number;
  angle: string;
}

export async function createVariants(
  topic: string,
  platform: string,
  count: number = 3
): Promise<ContentVariant[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `Generate ${count} different content variant angles for the topic "${topic}" on platform ${platform}. Each variant should have a different angle (e.g., controversial, educational, humorous, inspirational, storytelling). For each variant return JSON with: angle (string), text (social media caption), imagePrompt (prompt for image generation). Return an array of objects.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\s*|```/g, '').trim();

    // Try to parse JSON array; if fails, build manually
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: split by lines and approximate
      parsed = [];
    }

    const variants: ContentVariant[] = [];
    for (let i = 0; i < count; i++) {
      const item = Array.isArray(parsed) && parsed[i] ? parsed[i] : null;
      variants.push({
        id: `variant-${i}-${Date.now()}`,
        text: item?.text || `Variant ${i + 1} for ${topic}`,
        imagePrompt: item?.imagePrompt || `Social media image about ${topic}`,
        predictedScore: 50,
        angle: item?.angle || `Angle ${i + 1}`,
      });
    }
    return variants;
  } catch {
    const variants: ContentVariant[] = [];
    for (let i = 0; i < count; i++) {
      variants.push({
        id: `variant-${i}-${Date.now()}`,
        text: `Variant ${i + 1} for ${topic}`,
        imagePrompt: `Social media image about ${topic}`,
        predictedScore: 50,
        angle: `Angle ${i + 1}`,
      });
    }
    return variants;
  }
}

export async function scoreVariants(variants: ContentVariant[]): Promise<ContentVariant[]> {
  const scored = await Promise.all(
    variants.map(async (v) => {
      try {
        const score = await scoreIdea(v.text, (v.angle || 'X') as any);
        return { ...v, predictedScore: score };
      } catch {
        return { ...v, predictedScore: 55 };
      }
    })
  );
  return scored.sort((a, b) => b.predictedScore - a.predictedScore);
}

export function selectWinner(variants: ContentVariant[]): ContentVariant {
  const sorted = [...variants].sort((a, b) => b.predictedScore - a.predictedScore);
  return sorted[0] || variants[0];
}
