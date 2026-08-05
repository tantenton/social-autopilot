# Setup Guide

## Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **PostgreSQL** 16+ (local atau cloud)
- **Redis** 7+ (untuk job queue)
- **Git** (untuk version control)

## 1. Clone & Install

```bash
git clone https://github.com/tantenton/social-autopilot.git
cd social-autopilot
pnpm install
```

## 2. Environment Variables

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

### Required (MVP minimum):

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/socialautopilot"

# Redis (untuk BullMQ job queue)
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-dengan-openssl-rand-base64-32"

# GitHub OAuth (untuk login)
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"

# Google Gemini API (GRATIS - https://ai.google.dev)
GEMINI_API_KEY="your-gemini-api-key"

# FAL AI (image generation - https://fal.ai)
FAL_KEY="your-fal-api-key"
```

### Generate NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

### Dapat GitHub OAuth Credentials:

1. Buka https://github.com/settings/developers
2. New OAuth App
3. **Application name:** Social Autopilot (dev)
4. **Homepage URL:** http://localhost:3000
5. **Authorization callback URL:** http://localhost:3000/api/auth/callback/github
6. Copy **Client ID** dan **Client Secret** ke `.env`

### Dapat Gemini API Key (GRATIS):

1. Buka https://makersuite.google.com/app/apikey
2. Login dengan Google account
3. Create API Key
4. Copy ke `.env`
5. **Free tier:** 60 requests/minute, unlimited sebulan

### Dapat FAL API Key:

1. Buka https://fal.ai/dashboard
2. Sign up (GitHub/Google)
3. Copy API key dari dashboard
4. **Free tier:** 100 credits/bulan (1 image = ~1 credit)

## 3. Setup Database

```bash
# Push schema ke database
pnpm db:push

# (Optional) Seed demo data
pnpm db:seed
```

Jika ada error `connection refused`:
- Pastikan PostgreSQL running: `pg_isready`
- Cek DATABASE_URL format: `postgresql://user:password@host:port/dbname`

## 4. Setup Redis

### Local (recommended untuk dev):

**Windows (via Chocolatey):**
```bash
choco install redis-64
redis-server
```

**Mac (via Homebrew):**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

Verify: `redis-cli ping` → harus return `PONG`

### Cloud Redis (untuk production):

- **Upstash:** https://upstash.com (free tier 10k commands/day)
- **Redis Cloud:** https://redis.com/try-free
- **Railway:** provision Redis addon

## 5. Run Development Server

```bash
# Terminal 1: Next.js dev server
pnpm dev

# Terminal 2: Job worker
pnpm worker:dev
```

Buka http://localhost:3000

## 6. Connect Platform

1. Login dengan GitHub
2. Dashboard → klik "Connect Platform"
3. Pilih X (Twitter) atau Threads
4. Follow OAuth flow
5. Setelah connected, badge hijau muncul

## Troubleshooting

### Error: `Cannot find module 'next-auth'`

```bash
rm -rf node_modules .next
pnpm install
```

### Error: `Prisma Client not generated`

```bash
pnpm db:generate
```

### Error: `Redis connection refused`

Pastikan Redis running:
```bash
redis-cli ping
```

Jika masih error, cek REDIS_URL di `.env` (default: `redis://localhost:6379`)

### Error: `GitHub OAuth callback fails`

Cek:
1. GITHUB_CLIENT_ID dan GITHUB_CLIENT_SECRET benar
2. Callback URL di GitHub App settings: `http://localhost:3000/api/auth/callback/github`
3. NEXTAUTH_URL di `.env`: `http://localhost:3000`

### Worker tidak process job

Cek log di terminal worker. Common issues:
- Redis tidak running
- REDIS_URL salah
- Environment variables tidak loaded (pastikan `.env` ada di root)

## Next Steps

- Baca [USAGE.md](./USAGE.md) untuk cara pakai dashboard
- Baca [DEVELOPMENT.md](./DEVELOPMENT.md) sebelum coding
- Baca [RISKS.md](./RISKS.md) untuk warning keamanan
