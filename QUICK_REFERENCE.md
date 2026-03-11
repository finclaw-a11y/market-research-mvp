# Market Research MVP - Quick Reference (1-Page Checklist)

**30 Minutes. Follow in order. Copy-paste ready. No explanation.**

---

## BEFORE YOU START

Have these accounts ready:
- [ ] Vercel
- [ ] Railway
- [ ] Supabase
- [ ] Stripe
- [ ] Anthropic

Have these installed:
- [ ] Node.js 16+
- [ ] Python 3.11+
- [ ] Git

---

## 1. CREATE ENVIRONMENT VARIABLES TEXT FILE (5 MIN)

Create file: `credentials.txt` on your desktop

### Get Supabase Keys
1. Go to: https://app.supabase.com → New Project → market-research-mvp
2. Wait 2-3 minutes
3. Go to: Settings → API
4. Copy these:
```
SUPABASE_URL = [copy Project URL]
SUPABASE_ANON_KEY = [copy anon public]
SUPABASE_SERVICE_KEY = [copy service_role secret]
```
5. Go to: Settings → Database → Connection pooling → URI
6. Copy connection string, replace [YOUR-PASSWORD]:
```
DATABASE_URL = postgresql://postgres:YOUR_PASSWORD@db.YOUR_ID.supabase.co:5432/postgres
```

### Get Stripe Keys (Test Mode)
1. Go to: https://dashboard.stripe.com → Developers → API Keys
2. Copy:
```
STRIPE_SECRET_KEY = [copy Secret key, starts with sk_test_]
STRIPE_PUBLISHABLE_KEY = [copy Publishable key, starts with pk_test_]
```
3. Go to: Products → Create product → $99/month → Save
4. Copy Price ID:
```
STRIPE_PRICE_ID = [copy Price ID]
```
5. Go to: Developers → Webhooks → Add endpoint
   - URL: https://YOUR_RAILWAY_URL/api/subscriptions/webhook (you'll update this later)
   - Events: customer.subscription.created, updated, deleted
   - Copy Signing secret:
```
STRIPE_WEBHOOK_SECRET = [copy Signing secret, starts with whsec_]
```

### Get Anthropic Key
1. Go to: https://console.anthropic.com → API Keys → Create Key
2. Copy:
```
ANTHROPIC_API_KEY = [copy key, starts with sk-ant-]
```

**Save all values in credentials.txt**

---

## 2. SETUP & TEST LOCALLY (5 MIN)

```bash
cd market-research-mvp

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env
cp .env.example .env
# Edit .env, add values from credentials.txt

# Start backend
python -m uvicorn app:app --reload
# Should see: Uvicorn running on http://127.0.0.1:8000
# Leave running in this terminal
```

**New Terminal:**
```bash
cd market-research-mvp/frontend
npm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local, add values from credentials.txt

# Start frontend
npm run dev
# Should see: ready - started server on 0.0.0.0:3000
```

**Test:**
1. Go to http://localhost:3000
2. Try signup
3. See login page? ✅ Continue

---

## 3. SETUP SUPABASE DATABASE (3 MIN)

1. Go to: https://app.supabase.com
2. Select your project
3. Go to: SQL Editor → New Query
4. Copy-paste the entire SQL from: `database/migrations/001_initial_schema.sql`
5. Click RUN
6. Should see ✓ Success
7. Go to: Table Editor
8. Verify 5 tables exist: users, data_uploads, uploaded_data, insight_analysis, subscriptions

---

## 4. DEPLOY BACKEND TO RAILWAY (5 MIN)

1. Go to: https://railway.app → New Project → Deploy from GitHub
2. Select: market-research-mvp
3. Go to: Settings → Root Directory → Set to: `backend`
4. Go to: Variables
5. Add each variable from credentials.txt:

```
DATABASE_URL = [paste]
SUPABASE_URL = [paste]
SUPABASE_ANON_KEY = [paste]
SUPABASE_SERVICE_KEY = [paste]
STRIPE_SECRET_KEY = [paste]
STRIPE_PUBLISHABLE_KEY = [paste]
STRIPE_PRICE_ID = [paste]
STRIPE_WEBHOOK_SECRET = [paste]
ANTHROPIC_API_KEY = [paste]
DEBUG = False
PORT = 8000
FRONTEND_URL = [leave empty, update later]
CORS_ORIGINS = [leave empty, update later]
```

6. Wait for deployment ✓ Success (3-5 min)
7. Go to: Settings
8. Find: Public URL
9. Copy and save:
```
RAILWAY_URL = https://[something].railway.app
```

---

## 5. DEPLOY FRONTEND TO VERCEL (5 MIN)

1. Go to: https://vercel.com → Add New → Project
2. Select repo: market-research-mvp
3. Framework: Next.js
4. Root Directory: `frontend`
5. Click: Deploy
6. Wait for ✓ Ready (2-3 min)
7. Go to: Settings → Environment Variables
8. Add variables:

```
NEXT_PUBLIC_API_URL = https://YOUR_RAILWAY_URL.railway.app
NEXT_PUBLIC_SUPABASE_URL = [paste]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [paste]
NEXT_PUBLIC_STRIPE_PUBLIC_KEY = [paste]
NEXT_PUBLIC_ENV = production
```

9. Go to: Deployments
10. Click recent deployment
11. Go to: Redeploy
12. Wait for ✓ Ready
13. Click: Visit
14. Save:
```
VERCEL_URL = https://[something].vercel.app
```

---

## 6. UPDATE RAILWAY CORS (1 MIN)

1. Go to: Railway → Your project → Variables
2. Find: `FRONTEND_URL`
3. Change to: `https://YOUR_VERCEL_URL.vercel.app`
4. Find: `CORS_ORIGINS`
5. Change to: `https://YOUR_VERCEL_URL.vercel.app`
6. Save
7. Railway redeploys automatically (wait 2 min)

---

## 7. UPDATE STRIPE WEBHOOK (1 MIN)

1. Go to: https://dashboard.stripe.com → Developers → Webhooks
2. Click your endpoint
3. Update Endpoint URL to: `https://YOUR_RAILWAY_URL.railway.app/api/subscriptions/webhook`
4. Click: Update endpoint

---

## 8. TEST EVERYTHING (5 MIN)

### Frontend loads?
- Go to: https://YOUR_VERCEL_URL
- See login page? ✅

### Signup works?
- Try signup with test@example.com
- No errors? ✅

### Free trial works?
- Click "Start Free Trial"
- Stripe modal appears? ✅
- Test card: 4242 4242 4242 4242 / 12/25 / 123
- Click Subscribe
- See success? ✅

### CSV upload works?
- Create test.csv with sample data
- Upload file
- File appears in list? ✅

### Insights work?
- Click "Generate Insights"
- Wait 10-30 seconds
- See analysis? ✅

### Check Supabase
- Go to: https://app.supabase.com
- Table Editor → users → See your email? ✅
- Table Editor → subscriptions → See subscription? ✅

---

## ✅ DONE!

Your app is live at: `https://YOUR_VERCEL_URL`

All pages load? All features work? You're done!

---

## 🚨 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Blank page on Vercel | Wait 30s, refresh, check console (F12) |
| CORS error | Check FRONTEND_URL and CORS_ORIGINS on Railway match Vercel URL |
| Signup fails | Check SUPABASE_URL and anon key are correct |
| Stripe doesn't work | Check NEXT_PUBLIC_STRIPE_PUBLIC_KEY starts with pk_test_ |
| Insights don't generate | Check ANTHROPIC_API_KEY is correct |
| Backend connection failed | Check Railway is still running, logs for errors |

---

## URLS YOU NEED

```
Vercel: https://YOUR_VERCEL_URL
Railway: https://YOUR_RAILWAY_URL.railway.app
Supabase: https://app.supabase.com
Stripe Test: https://dashboard.stripe.com
Anthropic: https://console.anthropic.com
```

---

## FILES REFERENCE

| File | Purpose |
|------|---------|
| 30_MIN_DEPLOYMENT_GUIDE.md | Full detailed guide |
| ENVIRONMENT_VARIABLES_CHECKLIST.txt | All variables you need |
| TESTING_CHECKLIST.md | 33 tests to verify |
| RAILWAY_SETUP_GUIDE.md | Detailed Railway steps |
| VERCEL_SETUP_GUIDE.md | Detailed Vercel steps |
| SUPABASE_SETUP_GUIDE.md | Detailed Supabase steps |

---

**You made it! Your AI-powered app is deployed to production. 🎉**
