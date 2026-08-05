import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function generateContent(prompt: string) {
  if (!process.env.GEMINI_API_KEY) return { text: '', error: 'GEMINI_API_KEY not set' };
  const result = await geminiModel.generateContent(prompt);
  return { text: result.response.text(), error: undefined };
}
