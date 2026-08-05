# Social Autopilot

![GitHub last commit](https://img.shields.io/github/last-commit/tantenton/social-autopilot)
![GitHub issues](https://img.shields.io/github/issues/tantenton/social-autopilot)
![License](https://img.shields.io/github/license/tantenton/social-autopilot)

Autonomous social media manager — riset ide viral, generate konten (teks/foto/video), post otomatis ke X, Threads, Facebook, Instagram, TikTok, YouTube Shorts.

**🚀 [Live Demo](#) • 📚 [Docs](./docs/) • 🐛 [Report Bug](https://github.com/tantenton/social-autopilot/issues) • 💡 [Request Feature](https://github.com/tantenton/social-autopilot/issues)**

---

## ⚠️ Read This First

**[RISKS.md](./docs/RISKS.md)** — AI-generated content risks, platform ToS, security warnings  
**[SETUP.md](./docs/SETUP.md)** — Installation & configuration guide  
**[USAGE.md](./docs/USAGE.md)** — How to use dashboard & create campaigns  
**[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** — Architecture, pitfalls, debugging

---

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

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/tantenton/social-autopilot.git
cd social-autopilot
pnpm install

# 2. Setup environment
cp .env.example .env
# Edit .env — minimum: DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET, GEMINI_API_KEY

# 3. Setup database
pnpm db:push

# 4. Run (2 terminals)
pnpm dev          # Terminal 1: Next.js dev server
pnpm worker:dev   # Terminal 2: Job worker
```

Open http://localhost:3000

**Full setup guide:** [docs/SETUP.md](./docs/SETUP.md)

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

## Key Features

- ✅ **Multi-Platform:** X (Twitter), Threads, Facebook, Instagram, TikTok, YouTube Shorts
- ✅ **AI Content Generation:** Text via Gemini (gratis), image via FAL Flux
- ✅ **Smart Scheduling:** Optimal posting time per platform, cron-based automation
- ✅ **Campaign Manager:** Auto-generate + auto-post konten based on topics
- ✅ **Analytics Sync:** Daily metrics pull (likes, shares, impressions)
- ✅ **Secure:** Encrypted credentials, NextAuth GitHub OAuth

## Development

```bash
# Database
pnpm db:push        # Push schema changes
pnpm db:studio      # Prisma Studio UI
pnpm db:generate    # Regenerate Prisma Client after schema edit

# Testing
pnpm lint           # ESLint check
pnpm typecheck      # TypeScript check
pnpm build          # Production build test

# Production
pnpm start          # Run production build
```

**Full dev guide:** [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)

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
