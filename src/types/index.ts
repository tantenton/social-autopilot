export type Platform =
  | "X"
  | "THREADS"
  | "FACEBOOK"
  | "INSTAGRAM"
  | "TIKTOK"
  | "YOUTUBE";

export type PostStatus = "QUEUED" | "POSTING" | "PUBLISHED" | "FAILED";

export type ContentType = "TEXT" | "IMAGE" | "VIDEO";

export type Tone = "CASUAL" | "PROFESSIONAL" | "HUMOROUS";

export interface PlatformConfig {
  name: Platform;
  label: string;
  color: string;
  maxTextLength: number;
  supportsImage: boolean;
  supportsVideo: boolean;
  optimalPostTimes: string[]; // HH:mm format
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  X: {
    name: "X",
    label: "X (Twitter)",
    color: "#000000",
    maxTextLength: 280,
    supportsImage: true,
    supportsVideo: true,
    optimalPostTimes: ["09:00", "12:00", "17:00"],
  },
  THREADS: {
    name: "THREADS",
    label: "Threads",
    color: "#000000",
    maxTextLength: 500,
    supportsImage: true,
    supportsVideo: true,
    optimalPostTimes: ["07:00", "13:00", "21:00"],
  },
  FACEBOOK: {
    name: "FACEBOOK",
    label: "Facebook",
    color: "#1877F2",
    maxTextLength: 63206,
    supportsImage: true,
    supportsVideo: true,
    optimalPostTimes: ["09:00", "13:00"],
  },
  INSTAGRAM: {
    name: "INSTAGRAM",
    label: "Instagram",
    color: "#E1306C",
    maxTextLength: 2200,
    supportsImage: true,
    supportsVideo: true,
    optimalPostTimes: ["11:00", "19:00"],
  },
  TIKTOK: {
    name: "TIKTOK",
    label: "TikTok",
    color: "#010101",
    maxTextLength: 2200,
    supportsImage: false,
    supportsVideo: true,
    optimalPostTimes: ["06:00", "10:00", "22:00"],
  },
  YOUTUBE: {
    name: "YOUTUBE",
    label: "YouTube Shorts",
    color: "#FF0000",
    maxTextLength: 5000,
    supportsImage: false,
    supportsVideo: true,
    optimalPostTimes: ["14:00", "20:00"],
  },
};

export interface GeneratedContent {
  text: string;
  imageUrl?: string;
  rationale: string;
  viralityEstimate: number;
  platform: Platform;
  tone: Tone;
}

export interface PostPayload {
  text: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface PostResult {
  platformPostId: string;
  url?: string;
  postedAt: Date;
}

export interface PostMetrics {
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  reach?: number;
  fetchedAt: Date;
}
