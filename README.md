# Social Autopilot

Autonomous social media manager — riset ide viral, generate konten (teks/foto/video), post otomatis ke X, Threads, Facebook, Instagram, TikTok, YouTube Shorts.

## Tech Stack

- **Framework:** Next.js 15 (App Router + Server Actions)
- **Database:** PostgreSQL 16 + Prisma 7
- **Job Queue:** BullMQ (Redis)
- **Auth:** NextAuth.js v5
- **UI:** Tailwind CSS + shadcn/ui
- **AI:** Gemini API (gratis via Google AI Studio)
- **Image:** FAL Flux (cloud generation)
- **Hosting:** Vercel (frontend) + Railway (workers)

## Features

### MVP (Phase 1)
- ✅ Platform connectors: X (Twitter) + Threads
- ✅ Text generation via Gemini
- ✅ Image generation via FAL Flux
- ✅ Posting scheduler with optimal timing
- ✅ Campaign dashboard

### Roadmap
- [ ] Video generation (Runway/Kling)
- [ ] Instagram + TikTok + YouTube connectors
- [ ] Virality research engine (trending topics)
- [ ] A/B testing automation
- [ ] Analytics dashboard

## Setup

```bash
# Install dependencies
pnpm install

# Setup database
cp .env.example .env
# Edit .env with your credentials
pnpm db:push

# Run development server
pnpm dev
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/socialautopilot"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google Gemini API (gratis via ai.google.dev)
GEMINI_API_KEY="your-gemini-api-key"

# FAL AI (image generation)
FAL_KEY="your-fal-api-key"

# Platform API Keys (akan ditambah per platform)
TWITTER_API_KEY=""
TWITTER_API_SECRET=""
THREADS_ACCESS_TOKEN=""
```

## Project Structure

```
social-autopilot/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Auth pages (login/register)
│   │   ├── (dashboard)/    # Protected dashboard pages
│   │   └── api/            # API routes
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui base components
│   │   └── features/      # Feature-specific components
│   ├── lib/               # Utilities & configs
│   │   ├── db.ts         # Prisma client
│   │   ├── platforms/    # Platform connectors
│   │   └── ai/           # AI generation utilities
│   └── types/            # TypeScript types
├── prisma/
│   └── schema.prisma     # Database schema
└── workers/              # Background job processors
```

## Development

```bash
# Database commands
pnpm db:push        # Push schema changes
pnpm db:studio      # Open Prisma Studio
pnpm db:seed        # Seed demo data

# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Build for production
pnpm build
```

## Deployment

### Vercel (Frontend + API Routes)
```bash
vercel deploy
```

### Railway (Job Workers + Redis)
- Deploy worker process dari `workers/` directory
- Provision Redis addon
- Set environment variables

## License

MIT
