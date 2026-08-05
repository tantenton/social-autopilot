# Social Autopilot

[![Build](https://img.shields.io/github/actions/workflow/status/tantenton/social-autopilot/ci.yml?branch=main)](https://github.com/tantenton/social-autopilot/actions)
[![License: MIT](https://img.shields.io/github/license/tantenton/social-autopilot)](https://github.com/tantenton/social-autopilot/blob/main/LICENSE)
[![Version](https://img.shields.io/github/v/tag/tantenton/social-autopilot?label=version)](https://github.com/tantenton/social-autopilot/releases)

**Autonomous social media manager with AI content generation.** Research viral ideas, generate text and images via Gemini and FAL, schedule posts across X, Threads, Instagram, Facebook, TikTok, and YouTube, and track engagement — all from one dashboard.

---

## Quick Start

```bash
git clone https://github.com/tantenton/social-autopilot.git
cd social-autopilot
pnpm install
cp .env.example .env
pnpm db:push
pnpm dev
```

See [docs/SETUP.md](docs/SETUP.md) for full environment setup.

---

## Features

- **Multi-Platform Connectors** — X (Twitter), Threads, Instagram, Facebook, TikTok, YouTube Shorts
- **AI Content Generation** — text via Gemini 2.0 Flash, images via FAL Flux
- **Virality Research Engine** — trending topic scraping, Gemini virality scoring
- **Campaign Manager** — automated scheduling with cron-based posting
- **Analytics Dashboard** — post metrics, engagement charts via recharts
- **Secure Auth** — NextAuth GitHub OAuth, encrypted platform tokens

---

## Tech Stack

- **Framework:** Next.js 15 (App Router + Server Actions)
- **Database:** PostgreSQL 16 + Prisma 7
- **Job Queue:** BullMQ (Redis)
- **Auth:** NextAuth.js v5
- **UI:** Tailwind CSS + shadcn/ui + lucide-react icons
- **AI:** Gemini API (Google AI Studio) + FAL Flux
- **Charts:** recharts
- **Hosting:** Vercel (frontend) + Railway (workers + Redis)

---

## Architecture

```
social-autopilot/
├── src/app/           # Next.js App Router pages
│   ├── (auth)/        # Auth pages
│   ├── (dashboard)/   # Protected dashboard
│   └── api/           # REST API routes
├── src/components/    # React components
├── src/lib/           # Utilities, AI, platforms, auth
├── workers/           # Background job processors
└── prisma/            # Database schema
```

---

## Environment Variables

Required (see `.env.example`):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis URL for BullMQ queue |
| `NEXTAUTH_SECRET` | NextAuth session secret |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `FAL_KEY` | FAL.ai API key for image generation |

---

## Releases

- **v1.0.0** — Initial Release (scaffold, DB schema, platform connectors MVP, auth, dashboard UI)
- **v2.0.0** — Platform OAuth & AI Research Engine (OAuth X+Threads, virality research, Gemini scoring, analytics dashboard, recharts)

See [releases](https://github.com/tantenton/social-autopilot/releases) for full changelogs.

---

## Roadmap

- Video generation (Runway / Kling)
- Instagram + TikTok + YouTube connectors
- A/B testing automation
- Multi-account management
- Content filters and moderation

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make changes in English only (comments, strings, docs)
4. Run `pnpm lint` and `pnpm typecheck`
5. Open a pull request

---

## License

MIT — see [LICENSE](LICENSE)
