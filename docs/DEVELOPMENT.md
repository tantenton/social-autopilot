# Development Guide

## Project Structure

```
social-autopilot/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login/register)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   └── features/          # Feature-specific components
│   ├── lib/
│   │   ├── ai/                # AI generation utilities
│   │   │   ├── generateText.ts
│   │   │   └── generateImage.ts
│   │   ├── platforms/         # Platform connectors
│   │   │   ├── twitter.ts
│   │   │   ├── threads.ts
│   │   │   └── types.ts
│   │   ├── auth.ts            # NextAuth config
│   │   ├── db.ts              # Prisma client
│   │   └── queue.ts           # BullMQ queue manager
│   └── types/                 # TypeScript types
├── workers/                   # Background job processors
│   ├── index.ts               # Worker entry point
│   └── jobs/
│       ├── generateContent.ts
│       ├── publishPost.ts
│       └── syncMetrics.ts
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration files
└── docs/                      # Documentation
```

---

## Tech Stack

### Core
- **Next.js 15** — App Router, Server Actions, API Routes
- **React 19** — UI rendering
- **TypeScript 5** — Type safety
- **Prisma 7** — ORM untuk PostgreSQL
- **NextAuth v5** — Authentication (GitHub OAuth)

### UI
- **Tailwind CSS 3** — Utility-first styling
- **shadcn/ui** — Accessible components (Radix UI under the hood)

### Queue & Workers
- **BullMQ** — Job queue dengan Redis
- **Redis 7** — In-memory store untuk queue

### AI & Generation
- **Google Gemini API** — Text generation (gratis, 60 req/min)
- **FAL Flux** — Image generation (100 credits/bulan free tier)

### Platform APIs
- **Twitter API v2** — X posting (Basic $100/month)
- **Threads API** — Meta Platform API
- *(Future: Facebook, Instagram, TikTok, YouTube)*

---

## Database Schema

Key models (`prisma/schema.prisma`):

### User
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  platforms ConnectedPlatform[]
  campaigns CampaignSchedule[]
}
```

### ConnectedPlatform
```prisma
model ConnectedPlatform {
  id          String         @id @default(cuid())
  userId      String
  name        PlatformName   // X, THREADS, FACEBOOK, etc.
  status      PlatformStatus // CONNECTED, EXPIRED, ERROR
  credentials Json           // Encrypted tokens
  connectedAt DateTime       @default(now())
}
```

### ContentPiece
```prisma
model ContentPiece {
  id               String      @id @default(cuid())
  ideaId           String
  platform         PlatformName
  type             ContentType // TEXT, IMAGE, VIDEO
  tone             Tone        // CASUAL, PROFESSIONAL, HUMOROUS
  text             String?
  assetUrl         String?     // Image/video URL
  viralityEstimate Int?        // 0-100
  generatedAt      DateTime    @default(now())
}
```

### Post
```prisma
model Post {
  id             String      @id @default(cuid())
  contentId      String
  platformId     String
  platform       PlatformName
  scheduledAt    DateTime?
  postedAt       DateTime?
  status         PostStatus  // QUEUED, POSTING, PUBLISHED, FAILED
  platformPostId String?     // Tweet ID, Threads post ID
  platformUrl    String?     // Link ke post
  metrics        Json?       // { likes, comments, shares, impressions }
  errorMessage   String?
}
```

### CampaignSchedule
```prisma
model CampaignSchedule {
  id             String         @id @default(cuid())
  userId         String
  name           String
  cronExpression String         // "0 9 * * *"
  platforms      PlatformName[] // [X, THREADS]
  topics         String[]       // ["AI", "startup", "productivity"]
  tone           Tone           @default(CASUAL)
  isActive       Boolean        @default(true)
  lastRunAt      DateTime?
}
```

---

## Code Architecture

### 1. Platform Connectors (`src/lib/platforms/`)

**Interface:**
```typescript
export interface IPlatformConnector {
  authenticate(credentials: PlatformCredentials): Promise<AuthResult>;
  post(payload: PostPayload): Promise<PostResult>;
  getMetrics(postId: string): Promise<PostMetrics>;
}
```

**Implementation Pattern:**
```typescript
// src/lib/platforms/twitter.ts
export class TwitterConnector implements IPlatformConnector {
  async authenticate(credentials) {
    // OAuth flow via Twitter API v2
  }
  
  async post(payload) {
    // POST https://api.twitter.com/2/tweets
    // Return { platformPostId, url }
  }
  
  async getMetrics(postId) {
    // GET https://api.twitter.com/2/tweets/:id?tweet.fields=public_metrics
  }
}
```

**⚠️ CRITICAL: Error Handling**

Semua platform connector MUST handle:
1. **Rate limit** — return specific error code `RATE_LIMIT_EXCEEDED`
2. **Auth expired** — return `AUTH_EXPIRED` (trigger reconnect flow)
3. **Network timeout** — retry dengan exponential backoff
4. **API changes** — log unknown errors untuk debugging

```typescript
try {
  const response = await fetch(url, options);
  if (response.status === 429) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }
  if (response.status === 401) {
    throw new Error('AUTH_EXPIRED');
  }
  return await response.json();
} catch (error) {
  if (error.code === 'ETIMEDOUT') {
    // Retry logic
  }
  throw error;
}
```

### 2. AI Generation (`src/lib/ai/`)

**Text Generation:**
```typescript
// src/lib/ai/generateText.ts
export async function generateText(params: {
  topic: string;
  platform: Platform;
  tone: Tone;
}): Promise<GeneratedContent> {
  const prompt = buildPrompt(params);
  const response = await gemini.generateContent(prompt);
  return {
    text: response.text(),
    viralityEstimate: estimateVirality(response),
    rationale: extractRationale(response),
  };
}
```

**Prompt Template Pattern:**
```typescript
function buildPrompt({ topic, platform, tone }: GenerateParams): string {
  const platformRules = {
    X: "280 chars max. Hook in first 10 words. 1-2 hashtags. CTA at end.",
    THREADS: "Casual 3-5 post thread. Use emoji. Storytelling format.",
  };
  
  return `
System: You are a viral social media content creator for ${platform}.
User: Create ${tone.toLowerCase()} post about ${topic}.
Rules: ${platformRules[platform]}
Output JSON: { text, rationale, viralityEstimate }
  `.trim();
}
```

**⚠️ GOTCHA: Gemini API Rate Limits**

Free tier: **60 requests/minute**. Implement token bucket:

```typescript
let requestCount = 0;
let resetTime = Date.now() + 60000;

export async function generateText(params) {
  if (Date.now() > resetTime) {
    requestCount = 0;
    resetTime = Date.now() + 60000;
  }
  
  if (requestCount >= 60) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }
  
  requestCount++;
  return await gemini.generateContent(...);
}
```

**Image Generation:**
```typescript
// src/lib/ai/generateImage.ts
import * as fal from "@fal-ai/client";

export async function generateImage(params: {
  prompt: string;
  style: "meme" | "quote" | "infographic";
}): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt: `${stylePresets[params.style]} ${params.prompt}`,
      image_size: "square",
      num_inference_steps: 4,
      enable_safety_checker: true,
    },
  });
  
  return result.images[0].url;
}
```

**⚠️ CRITICAL: Safety Checker**

ALWAYS `enable_safety_checker: true`. FAL bisa generate NSFW accidentally. Jika user complaint, check:
1. Prompt contains trigger words? (sanitize input)
2. Safety checker disabled by mistake?
3. FAL API version outdated? (update `@fal-ai/client`)

### 3. Job Queue (`src/lib/queue.ts` + `workers/`)

**Queue Setup:**
```typescript
// src/lib/queue.ts
import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL);

export const contentQueue = new Queue("content-generation", { connection });
export const postQueue = new Queue("post-publishing", { connection });
export const metricsQueue = new Queue("metrics-sync", { connection });

export async function queueGenerateContent(ideaId: string) {
  await contentQueue.add("generate", { ideaId });
}

export async function queuePublishPost(postId: string, scheduledAt: Date) {
  await postQueue.add(
    "publish",
    { postId },
    { delay: scheduledAt.getTime() - Date.now() }
  );
}
```

**Worker Process:**
```typescript
// workers/index.ts
import { Worker } from "bullmq";
import { generateContentJob } from "./jobs/generateContent";
import { publishPostJob } from "./jobs/publishPost";

const contentWorker = new Worker(
  "content-generation",
  async (job) => {
    await generateContentJob(job.data);
  },
  { connection: new Redis(process.env.REDIS_URL) }
);

const postWorker = new Worker(
  "post-publishing",
  async (job) => {
    await publishPostJob(job.data);
  },
  { connection: new Redis(process.env.REDIS_URL) }
);

console.log("Workers started. Waiting for jobs...");
```

**⚠️ CRITICAL: Idempotency**

Job bisa retry on failure. MUST check `platformPostId` sebelum post lagi:

```typescript
// workers/jobs/publishPost.ts
export async function publishPostJob({ postId }: { postId: string }) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  
  // Idempotency check
  if (post.platformPostId) {
    console.log(`Post ${postId} already published. Skipping.`);
    return;
  }
  
  const connector = getPlatformConnector(post.platform);
  const result = await connector.post({
    text: post.content.text,
    imageUrl: post.content.assetUrl,
  });
  
  await prisma.post.update({
    where: { id: postId },
    data: {
      status: "PUBLISHED",
      platformPostId: result.platformPostId,
      platformUrl: result.url,
      postedAt: new Date(),
    },
  });
}
```

**⚠️ GOTCHA: Worker Must Run Separately**

Workers TIDAK auto-start dengan `pnpm dev`. Must run di terminal terpisah:

```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm worker:dev
```

Production deployment:
- Vercel: Next.js app only (no workers — functions timeout 60s max)
- Railway: Deploy `workers/` as separate service (Dockerfile needed)

---

## API Routes

### Server Actions (Preferred)

Next.js 15 Server Actions untuk mutation:

```typescript
// src/app/(dashboard)/campaigns/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { queueGenerateContent } from "@/lib/queue";

export async function createCampaign(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  const campaign = await prisma.campaignSchedule.create({
    data: {
      userId: session.user.id,
      name: formData.get("name") as string,
      cronExpression: formData.get("schedule") as string,
      platforms: formData.getAll("platforms") as Platform[],
      topics: (formData.get("topics") as string).split(","),
      tone: formData.get("tone") as Tone,
      isActive: formData.get("active") === "on",
    },
  });
  
  // Trigger immediate first run
  await queueGenerateContent(campaign.id);
  
  return { success: true, id: campaign.id };
}
```

### API Routes (Untuk OAuth Callback)

```typescript
// src/app/api/platforms/connect/twitter/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TwitterConnector } from "@/lib/platforms/twitter";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  
  const connector = new TwitterConnector();
  const result = await connector.authenticate({ code });
  
  await prisma.connectedPlatform.create({
    data: {
      userId: session.user.id,
      name: "X",
      credentials: encrypt(result.tokens),
      status: "CONNECTED",
    },
  });
  
  return Response.redirect("/dashboard/platforms");
}
```

**⚠️ SECURITY: Encrypt Credentials**

NEVER store API tokens plain text:

```typescript
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte hex
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string): string {
  const parts = text.split(":");
  const iv = Buffer.from(parts.shift()!, "hex");
  const encrypted = Buffer.from(parts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

Generate ENCRYPTION_KEY:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Common Pitfalls & How to Avoid

### 1. Prisma Client Stale After Schema Change

**Symptom:** TypeScript error `Property 'xyz' does not exist on type 'User'` after adding field ke schema.

**Cause:** Prisma Client belum regenerated.

**Fix:**
```bash
pnpm db:push        # Push schema change ke DB
pnpm db:generate    # Regenerate Prisma Client
```

**Prevention:** Always run `pnpm db:generate` setelah edit `schema.prisma`.

### 2. NextAuth Session Null in API Route

**Symptom:** `await auth()` return `null` padahal user logged in.

**Cause:** Cookie tidak di-forward, atau `NEXTAUTH_URL` salah.

**Fix:**
```typescript
// Check NEXTAUTH_URL matches current host
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("Request URL:", request.url);

// In production, MUST be https://your-domain.com
```

**Prevention:** Set `NEXTAUTH_URL` correctly di `.env` dan Vercel env vars.

### 3. Worker Job Stuck in "Active" Forever

**Symptom:** Job masuk queue tapi worker tidak process, stuck di "active" state.

**Cause:** Worker crash mid-job atau Redis connection lost.

**Fix:**
```bash
# Clear stuck jobs (development only)
redis-cli
> DEL bull:content-generation:active
> DEL bull:post-publishing:active
```

**Prevention:** 
- Wrap job handler with try-catch
- Set job timeout (`{ timeout: 60000 }`)
- Monitor worker health (Sentry, Logtail)

### 4. Rate Limit Hit Without Warning

**Symptom:** Posts suddenly fail dengan "Rate limit exceeded" error.

**Cause:** No quota tracking, user spam-posting.

**Fix:**
```typescript
// Add rate limit check sebelum queue job
const todayPostCount = await prisma.post.count({
  where: {
    platform: "X",
    postedAt: { gte: startOfDay(new Date()) },
  },
});

if (todayPostCount >= 50) {
  throw new Error("Daily post limit reached (50/day per platform)");
}
```

**Prevention:** Dashboard tampilkan quota usage, alert at 80%.

### 5. Vercel Function Timeout (10s default)

**Symptom:** API route timeout on slow operations (image generation 30s).

**Cause:** Vercel serverless function default timeout 10s.

**Fix:** Jangan run heavy operation di API route. Use job queue:

```typescript
// ❌ WRONG — timeout after 10s
export async function POST(request: Request) {
  const image = await generateImage(prompt); // 30s operation
  return Response.json({ image });
}

// ✅ CORRECT — queue job, return immediately
export async function POST(request: Request) {
  await contentQueue.add("generate-image", { prompt });
  return Response.json({ status: "queued" });
}
```

**Prevention:** Heavy operations → job queue. API routes hanya untuk fast responses (<1s).

---

## Testing

### Unit Tests (Coming Soon)

```bash
pnpm test
```

Pattern untuk test platform connectors:

```typescript
// __tests__/platforms/twitter.test.ts
import { TwitterConnector } from "@/lib/platforms/twitter";

describe("TwitterConnector", () => {
  it("should handle rate limit gracefully", async () => {
    const connector = new TwitterConnector();
    // Mock API response 429
    expect(() => connector.post(payload)).toThrowError("RATE_LIMIT_EXCEEDED");
  });
  
  it("should retry on network timeout", async () => {
    // Mock ETIMEDOUT error
    // Verify retry logic called
  });
});
```

### Integration Tests

```bash
# Setup test database
DATABASE_URL="postgresql://user:pass@localhost:5432/socialautopilot_test" pnpm db:push

# Run tests
pnpm test:integration
```

### Manual Testing Checklist

Before every PR:
- [ ] `pnpm lint` pass
- [ ] `pnpm typecheck` pass
- [ ] `pnpm build` sukses
- [ ] Dev server running tanpa error
- [ ] Worker process job tanpa stuck
- [ ] Auth flow (login/logout) works
- [ ] Platform connect flow works
- [ ] Campaign create + schedule works
- [ ] Manual post works
- [ ] Metrics sync after 24 jam

---

## Deployment

### Vercel (Frontend + API)

```bash
vercel deploy --prod
```

Environment variables needed:
- All from `.env.example`
- `NEXTAUTH_URL` → production URL (`https://yourdomain.com`)
- `DATABASE_URL` → production Postgres (Neon, Supabase, Railway)
- `REDIS_URL` → production Redis (Upstash, Redis Cloud)

**⚠️ CRITICAL: Database Migration**

Vercel tidak auto-run migration. Must run manual before deploy:

```bash
# Connect to production DB
DATABASE_URL="postgresql://prod-url" pnpm db:push

# Or via migration files (recommended)
DATABASE_URL="postgresql://prod-url" npx prisma migrate deploy
```

### Railway (Workers)

Create `Dockerfile` untuk workers:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm db:generate

CMD ["pnpm", "worker:start"]
```

`package.json` add script:
```json
{
  "scripts": {
    "worker:start": "node --loader tsx workers/index.ts"
  }
}
```

Railway dashboard:
1. New Project → Deploy from GitHub
2. Root directory: `/`
3. Build command: `pnpm install && pnpm db:generate`
4. Start command: `pnpm worker:start`
5. Environment variables: same as Vercel

**⚠️ GOTCHA: Railway Redis Addon**

Jika pakai Railway Redis addon, `REDIS_URL` format berbeda:
- Addon: `redis://default:password@host:port`
- External: `redis://host:port` (no auth)

Verify connection:
```typescript
const redis = new Redis(process.env.REDIS_URL);
redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err));
```

---

## Monitoring & Debugging

### Logs

**Vercel:** Dashboard → Deployments → Logs  
**Railway:** Dashboard → Service → Logs

**Structured Logging Pattern:**
```typescript
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: "info",
  message: "Post published",
  meta: { postId, platform, userId },
}));
```

### Error Tracking

Install Sentry (optional):
```bash
pnpm add @sentry/nextjs
```

```typescript
// src/app/api/error-handler.ts
import * as Sentry from "@sentry/nextjs";

export function handleError(error: Error, context: Record<string, any>) {
  console.error(error);
  Sentry.captureException(error, { extra: context });
}
```

### Health Check Endpoint

```typescript
// src/app/api/health/route.ts
import { prisma } from "@/lib/db";
import Redis from "ioredis";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const redis = new Redis(process.env.REDIS_URL);
    await redis.ping();
    
    return Response.json({ status: "healthy" });
  } catch (error) {
    return Response.json({ status: "unhealthy", error }, { status: 500 });
  }
}
```

Monitor via cron (UptimeRobot, Better Uptime):
- Check `/api/health` every 5 min
- Alert jika down > 2 checks

---

## Contributing

1. Fork repo
2. Create branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m "feat: add amazing feature"`
4. Push: `git push origin feature/amazing-feature`
5. Open PR

**Commit Convention:**
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `style:` formatting, missing semicolons
- `refactor:` code change without bug fix/feature
- `test:` add missing tests
- `chore:` updating build tasks, dependencies

---

## FAQ

**Q: Bisa pakai model LLM lain selain Gemini?**  
A: Ya. Edit `src/lib/ai/generateText.ts`, ganti Gemini client dengan OpenAI/Anthropic/dll. Interface sama, tinggal swap implementation.

**Q: Bisa self-host tanpa Vercel/Railway?**  
A: Ya. Next.js bisa run di VPS (`pnpm build && pnpm start`). Workers run via `pnpm worker:start`. Need Nginx/Caddy untuk reverse proxy.

**Q: Database migration rollback?**  
A: Prisma tidak support auto-rollback. Manual: restore dari backup, atau write manual migration SQL.

**Q: Job queue persistent jika Redis restart?**  
A: Tidak. BullMQ default in-memory. Enable persistence: edit `redis.conf` → `appendonly yes`.

**Q: Maksimal berapa campaign per user?**  
A: Tidak ada limit. Tapi banyak campaign = banyak API calls = rate limit risk. Recommended max 5 campaign active per user.

---

**Need Help?** Open GitHub issue atau cek [docs/](../docs/)
