# Usage Guide

## Dashboard Overview

Setelah login, kamu dapat:
1. **Connect Platforms** — link akun social media
2. **Create Campaign** — auto-generate + auto-post konten
3. **Browse Content** — lihat konten yang sudah di-generate
4. **View Calendar** — lihat jadwal post mendatang

---

## 1. Connect Platform

### X (Twitter)

**Requirements:**
- Twitter account
- Twitter API access (Basic tier $100/month untuk write)

**Setup:**
1. Buka https://developer.twitter.com/en/portal/dashboard
2. Create Project + App
3. User authentication settings:
   - Type: **Web App**
   - Callback URL: `https://your-domain.com/api/platforms/connect/twitter`
   - Permissions: **Read and write**
4. Copy API Key, API Secret, Bearer Token
5. Di dashboard Social Autopilot: **Connect Platform** → X
6. Paste credentials → Save

**Rate Limits (Basic tier):**
- 10,000 tweets/month write
- 50 tweets/day per user

### Threads

**Requirements:**
- Instagram Professional/Creator account
- Facebook Page linked
- Meta Developer App

**Setup:**
1. Buka https://developers.facebook.com
2. Create App → type **Business**
3. Add **Threads API** product
4. Permissions: `threads_basic`, `threads_content_publish`
5. Generate User Access Token (long-lived)
6. Di dashboard: **Connect Platform** → Threads
7. Paste App ID, App Secret, Access Token

**Rate Limits:**
- 250 API calls/hour
- 1 post per 5 minutes per user

### Facebook / Instagram (Coming Soon)

Sama dengan Threads (pakai Meta Graph API), akan ditambahkan di fase berikutnya.

---

## 2. Create Campaign

Campaign = auto-generate konten + auto-post ke platform sesuai jadwal.

### Step-by-step:

1. Dashboard → **Campaigns** → **New Campaign**
2. **Campaign Name:** misal "Daily Tech News"
3. **Topic Keywords:** misal "AI, machine learning, startup"
4. **Target Platforms:** pilih X, Threads, atau keduanya
5. **Tone:** Casual / Professional / Humorous
6. **Schedule (cron format):**
   - Daily 9am: `0 9 * * *`
   - 3x sehari (9am, 1pm, 9pm): `0 9,13,21 * * *`
   - Setiap 4 jam: `0 */4 * * *`
7. **Active:** toggle ON
8. **Save**

### Bagaimana campaign bekerja:

1. Scheduler check setiap menit
2. Saat cron match (misal 9am), generate content idea dari topic
3. LLM (Gemini) generate text sesuai platform:
   - X: 280 char, hook first 10 words, 1-2 hashtag
   - Threads: 3-5 post thread, casual tone, emoji
4. Jika konten butuh gambar, FAL Flux generate image
5. Post dijadwalkan di optimal time:
   - X: jam terdekat dari [9am, 12pm, 5pm]
   - Threads: jam terdekat dari [7am, 1pm, 9pm]
6. Job worker process posting di waktu scheduled

### Cron Format Cheatsheet:

```
┌───────────── menit (0-59)
│ ┌─────────── jam (0-23)
│ │ ┌───────── hari bulan (1-31)
│ │ │ ┌─────── bulan (1-12)
│ │ │ │ ┌───── hari minggu (0-7, 0=Minggu)
│ │ │ │ │
* * * * *
```

Common examples:
- `0 8 * * *` → setiap hari jam 8 pagi
- `0 */6 * * *` → setiap 6 jam
- `0 9 * * 1-5` → weekdays jam 9am
- `0 12,18 * * *` → setiap hari jam 12 siang dan 6 sore

**Tools untuk generate cron:** https://crontab.guru

---

## 3. Manual Post

Jika tidak mau pakai campaign automation, bisa manual generate + post:

1. Dashboard → **Content** → **Generate New**
2. **Topic:** misal "Tips produktivitas kerja remote"
3. **Platform:** pilih X atau Threads
4. **Tone:** pilih Casual/Professional/Humorous
5. **Include Image:** toggle ON jika mau gambar
6. **Generate**

Preview muncul dengan 3 variant text + image (jika ON). Pilih yang terbaik:

7. **Edit** text jika perlu (fix typo, tambah hashtag, dll)
8. **Post Now** → langsung post sekarang, atau
9. **Schedule** → pilih tanggal + jam

---

## 4. Calendar View

Dashboard → **Calendar** untuk lihat:
- Post yang sudah published (hijau)
- Post scheduled mendatang (kuning)
- Post failed (merah)

Klik post card untuk detail:
- Platform post URL
- Metrics (likes, comments, shares) — auto-sync daily
- Error message (jika failed)

---

## 5. Analytics (Future)

Coming soon di v0.2:
- Engagement rate per platform
- Best posting time analysis
- Top performing content
- Weekly/monthly report

---

## Best Practices

### Content Quality
- **Specificity:** Topic "AI productivity tools for developers" > "technology"
- **Consistency:** Posting 1x/day setiap hari > 10x hari ini, 0 minggu depan
- **Authenticity:** Edit generated text, tambahkan personal insight

### Scheduling
- **Don't spam:** Max 3-5 posts/day per platform
- **Timezone awareness:** Cron run di server timezone (UTC default), set sesuai target audience
- **Buffer time:** Kasih jarak 2 jam antar post di platform yang sama

### Platform-Specific Tips

**X (Twitter):**
- Hook penting — first 10 words menentukan engagement
- Gunakan 1-2 hashtag max (terlalu banyak = spam)
- Thread untuk konten panjang (tapi campaign default single tweet)

**Threads:**
- Lebih santai, emoji OK
- Storytelling format works best (problem → solution)
- Cross-post dari Instagram efektif

### API Rate Limits

Monitor dashboard **Platform Status** badge:
- 🟢 Hijau: connected, healthy
- 🟡 Kuning: rate limit warning (80% quota used)
- 🔴 Merah: disconnected atau error

Jika rate limit hit:
- Campaign auto-pause
- Notification muncul
- Resume otomatis setelah cooldown

---

## Troubleshooting

### "Post failed: Authentication expired"
- Platform credentials expired
- Fix: Dashboard → Platform → Reconnect

### "Content generation timeout"
- Gemini API rate limit (60 req/min free tier)
- Fix: tunggu 1 menit, retry

### "Image generation failed"
- FAL credits habis (free tier 100/bulan)
- Fix: upgrade FAL account atau disable image generation

### Campaign tidak jalan
Cek:
1. Campaign toggle **Active** ON
2. Platform connected (badge hijau)
3. Worker process running (`pnpm worker:dev`)
4. Redis running (`redis-cli ping`)

---

## Safety & Compliance

⚠️ **WAJIB BACA [RISKS.md](./RISKS.md)** sebelum production use.

Key points:
- Tool ini **automate posting** — kamu tetap responsible atas konten
- AI-generated content bisa produce inappropriate/offensive text — **review before enable campaign**
- Platform API ToS violation risk (spam, automation) — **read each platform policy**
- Credential security — **never commit `.env` to git**

---

## Getting Help

- **GitHub Issues:** https://github.com/tantenton/social-autopilot/issues
- **Docs:** https://github.com/tantenton/social-autopilot/tree/master/docs
