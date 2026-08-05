import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerateContentInput, GenerateContentOutput, Platform, Tone } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy');

function buildPrompt(platform: Platform, tone: Tone, topic: string): string {
  switch (platform) {
    case Platform.X:
      return tone === Tone.HUMOROUS
        ? `Write a funny viral tweet about "${topic}". Max 280 chars. Start with a hook in first 10 words. Include 1-2 hashtags. End with a call-to-action.`
        : tone === Tone.PROFESSIONAL
          ? `Write a professional tweet about "${topic}". Max 280 chars. Hook in first 10 words. 1-2 hashtags. Include CTA.`
          : `Write a casual tweet about "${topic}". Max 280 chars. Hook in first 10 words. 1-2 hashtags. Include a casual CTA.`;
    case Platform.THREADS:
      return tone === Tone.HUMOROUS
        ? `Write a humorous 3-5 post Threads thread about "${topic}" with emojis and storytelling. Casual tone.`
        : tone === Tone.PROFESSIONAL
          ? `Write a professional 3-5 post Threads thread about "${topic}". Storytelling style with emoji accents.`
          : `Write a casual 3-5 post Threads thread about "${topic}" with emojis and storytelling.`;
    default:
      return `Generate social media text about "${topic}" for ${platform} with tone ${tone}.`;
  }
}

export async function generateText(input: GenerateContentInput): Promise<GenerateContentOutput> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = buildPrompt(input.platform, input.tone, input.topic);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const viralityEstimate = Math.random(); // simulated
  const rationale = `Generated for ${input.platform} with ${input.tone} tone on topic: ${input.topic}.`;

  return { text, rationale, viralityEstimate };
}
