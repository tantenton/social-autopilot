# Risk Warnings & Security

⚠️ **READ THIS BEFORE USING IN PRODUCTION**

Social Autopilot adalah tool powerful yang **automate posting ke social media**. Dengan kekuatan besar datang tanggung jawab besar — kamu harus paham risks dan mitigations.

---

## 🔴 Critical Risks

### 1. AI-Generated Content Liability

**Risk:**  
LLM (Gemini) bisa generate konten yang:
- Offensive, racist, sexist, atau hate speech
- Misinformation atau factually incorrect
- Copyright infringement (plagiarized text)
- Brand-damaging atau off-brand tone

**Impact:**  
- Account suspension/ban dari platform
- Legal liability (defamation, discrimination)
- Reputation damage

**Mitigation:**
- ✅ **ALWAYS review generated content** sebelum enable campaign
- ✅ Use **manual approval mode** untuk high-risk topics (politik, agama, kesehatan)
- ✅ Set **content filters** di campaign (coming in v0.2)
- ✅ Monitor **post metrics daily** — spike in negative engagement = red flag
- ❌ **NEVER** enable autopilot untuk brand accounts tanpa human review

### 2. Platform API Terms of Service Violation

**Risk:**  
Semua platform (X, Threads, FB, IG) punya **Anti-Automation Rules**:
- X ToS 5.3: "You may not use automation to post content"
- Threads Guidelines: "No bots or scripted behavior"
- Instagram API Policy: "Do not spam or bulk post"

**Impact:**  
- API access revoked
- Account permanent ban
- Legal action dari platform (rare tapi possible)

**Mitigation:**
- ✅ Use **rate limiting** — max 3-5 posts/day per platform
- ✅ Add **randomized delays** between posts (2-4 jam)
- ✅ Keep **authentic engagement** — reply to comments manually
- ✅ **Read each platform ToS** before connecting: [X Rules](https://developer.twitter.com/en/developer-terms/agreement-and-policy) | [Meta Platform Terms](https://developers.facebook.com/terms/)
- ❌ **NEVER** bulk post ratusan kali sehari

### 3. Credential & Token Security

**Risk:**  
Platform API credentials (tokens, secrets) stored di database. Jika leaked:
- Attacker bisa post atas nama kamu
- Data breach dari connected accounts
- Unauthorized charges (jika API berbayar)

**Impact:**  
- Account takeover
- Financial loss (jika attacker spam paid API)
- GDPR/privacy law violation (jika ada user data)

**Mitigation:**
- ✅ **Encrypt credentials** di database (gunakan `crypto.encrypt` sebelum save)
- ✅ **Use environment variables** untuk secrets (`.env` file NEVER commit ke git)
- ✅ **Enable 2FA** pada semua connected accounts
- ✅ **Rotate tokens** setiap 90 hari
- ✅ **Audit logs** — track siapa access apa kapan
- ❌ **NEVER** share `.env` file atau database dump
- ❌ **NEVER** log/print credentials ke console

### 4. Job Queue Failure & Duplicate Posts

**Risk:**  
Redis down atau job worker crash bisa cause:
- Scheduled post tidak jalan (silent failure)
- Double posting (job retry without idempotency)

**Impact:**  
- Missed posting deadlines (campaign tidak efektif)
- Spam audience dengan duplicate konten
- Platform rate limit hit

**Mitigation:**
- ✅ **Monitor Redis uptime** (alert jika down > 5 min)
- ✅ **Idempotent job handlers** — cek `platformPostId` sebelum post lagi
- ✅ **Job retry with backoff** — max 3 retry, exponential delay
- ✅ **Dead letter queue** untuk failed jobs (manual review)
- ✅ Use **managed Redis** (Upstash, Redis Cloud) untuk production — lebih reliable dari self-hosted

---

## 🟡 Medium Risks

### 5. Rate Limit & API Quota Exhaustion

**Risk:**  
Free/Basic tier API punya strict limits:
- Gemini: 60 requests/minute
- FAL: 100 credits/month (habis = no image generation)
- X Basic: 10k tweets/month write

**Impact:**  
- Campaign auto-pause
- Konten tidak di-generate/post
- Downgrade user experience

**Mitigation:**
- ✅ **Track quota usage** di dashboard (show remaining credits)
- ✅ **Alert at 80% quota** (email/notif)
- ✅ **Fallback to cheaper model** (Gemini Flash jika Pro hit limit)
- ✅ **Queue prioritization** — urgent posts first

### 6. Database Migration & Schema Changes

**Risk:**  
Prisma schema changes bisa cause:
- Data loss jika migration gagal
- Downtime saat migrate large tables
- Type mismatch di runtime (stale Prisma Client)

**Impact:**  
- Campaign berhenti
- Data corruption (posts/credentials hilang)
- Production outage

**Mitigation:**
- ✅ **Always backup DB** sebelum migrate (`pg_dump`)
- ✅ **Test migration di staging** environment dulu
- ✅ **Use migration files** (`prisma migrate dev`) — NEVER `prisma db push` di production
- ✅ **Version control migrations** (commit `prisma/migrations/` to git)
- ❌ **NEVER** edit `schema.prisma` langsung di production tanpa testing

---

## 🟢 Low Risks (Tapi Harus Aware)

### 7. LLM Hallucination

**Risk:** Gemini bisa "hallucinate" facts, names, statistics yang salah.

**Mitigation:** Review factual claims sebelum post, terutama untuk news/educational content.

### 8. Image Generation NSFW Content

**Risk:** FAL Flux bisa accidentally generate NSFW imagery dari innocent prompt.

**Mitigation:** Use FAL safety filters (enabled by default), review image preview before post.

### 9. Timezone Confusion

**Risk:** Cron schedule di UTC, audience di WIB — post jalan jam 3 pagi instead of 9am.

**Mitigation:** Convert timezone saat set schedule, atau configure server timezone to WIB.

### 10. Cost Overrun (Jika Pakai Paid Tier)

**Risk:** Bug/misconfiguration cause spam API calls → tagihan membengkak.

**Mitigation:** Set **billing alerts** di provider dashboards (OpenAI, FAL, Twitter), monitor daily spend.

---

## 📋 Pre-Production Checklist

Sebelum deploy ke production atau enable campaign untuk client:

### Security
- [ ] All credentials encrypted di database
- [ ] `.env` file in `.gitignore` (verify dengan `git status`)
- [ ] NEXTAUTH_SECRET generated dengan `openssl rand -base64 32`
- [ ] Database exposed to public? If yes, setup firewall rules (whitelist IP only)
- [ ] Redis exposed? If yes, enable password (`requirepass` di `redis.conf`)

### Compliance
- [ ] Baca [Twitter Automation Rules](https://help.twitter.com/en/rules-and-policies/twitter-automation)
- [ ] Baca [Meta Platform Terms](https://developers.facebook.com/terms/)
- [ ] Confirm client aware of AI-generated content risks (dokumentasikan approval)

### Reliability
- [ ] Redis monitored (alert jika down)
- [ ] Database backups scheduled (daily at minimum)
- [ ] Job worker auto-restart on crash (`pm2` atau systemd)
- [ ] Error logging setup (Sentry, Logtail, etc.)

### Testing
- [ ] Test campaign di staging environment (dummy social accounts)
- [ ] Verify idempotency (restart worker mid-job, no duplicate posts)
- [ ] Load test (simulate 100 campaigns, confirm no rate limit hit)
- [ ] Failure scenario tested (Redis down, API 500 error, token expired)

### Documentation
- [ ] Client trained on dashboard usage ([USAGE.md](./USAGE.md))
- [ ] Runbook for common issues ([DEVELOPMENT.md](./DEVELOPMENT.md#troubleshooting))
- [ ] Incident response plan (what to do jika account banned, data breach, etc.)

---

## 🚨 Incident Response

### Jika Account Banned/Suspended

1. **Stop all campaigns** immediately (toggle OFF di dashboard)
2. **Investigate root cause:**
   - Check post history (spam pattern?)
   - Review API logs (ToS violation?)
   - Contact platform support (appeal form)
3. **Mitigation:**
   - If spam: reduce posting frequency
   - If offensive content: add manual review step
   - If API abuse: implement stricter rate limits
4. **Document:** Write incident report (what happened, why, how to prevent)

### Jika Credentials Leaked

1. **Revoke tokens** immediately (platform developer console)
2. **Rotate NEXTAUTH_SECRET** + restart server
3. **Audit database** (check unauthorized posts/access)
4. **Notify affected users** (if multi-tenant)
5. **Review access logs** (identify breach source)

### Jika Database Corrupted/Lost

1. **Restore from backup** (if available)
2. **If no backup:** Recreate schema dari `prisma/schema.prisma`
3. **Reconnect platforms** (users re-auth)
4. **Post-mortem:** Why no backup? Setup automated backups.

---

## Legal Disclaimer

**THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.**

Kamu (user) bertanggung jawab penuh atas:
- Konten yang di-post via tool ini
- Compliance dengan platform ToS
- Legal liabilities dari konten (defamation, copyright infringement, etc.)

Developer **TIDAK BERTANGGUNG JAWAB** atas:
- Account bans/suspensions
- Legal action dari platform atau third parties
- Data loss atau security breaches
- Financial loss dari API costs atau legal fees

**USE AT YOUR OWN RISK.**

---

## Questions?

Jika ada concerns atau menemukan security vulnerability:
- **Security issues:** Email ke [security@example.com] (jangan buat public issue)
- **General questions:** GitHub Discussions atau Issues
