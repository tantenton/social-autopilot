export enum Platform {
  X = 'X',
  THREADS = 'THREADS',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  TIKTOK = 'TIKTOK',
}

export enum Tone {
  CASUAL = 'CASUAL',
  PROFESSIONAL = 'PROFESSIONAL',
  HUMOROUS = 'HUMOROUS',
}

export interface GenerateContentInput {
  topic: string;
  platform: Platform;
  tone: Tone;
}

export interface GenerateContentOutput {
  text: string;
  imageUrl?: string;
  rationale: string;
  viralityEstimate: number;
}
