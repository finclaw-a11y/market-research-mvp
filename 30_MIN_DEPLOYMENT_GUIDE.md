# Market Research MVP - 30 Minute Deployment Guide

**GOAL:** Go from "I have accounts" to "My app is live" in 30 minutes.

**TIME BREAKDOWN:**
- Pre-Deployment Checklist: 5 min
- Local Testing: 5 min
- Deployment: 15 min
- Verification: 5 min

---

## ⚠️ STOP - READ THIS FIRST

**Before you start, you MUST have:**
- ✅ Vercel account (signed up)
- ✅ Railway account (signed up)
- ✅ Supabase account (signed up)
- ✅ Stripe account (signed up)
- ✅ Node.js 16+ installed (`node --version`)
- ✅ Python 3.11+ installed (`python --version`)
- ✅ Git installed (`git --version`)

**If you don't have these, STOP and create them first. This guide won't work without them.**

---

# SECTION 1: PRE-DEPLOYMENT CHECKLIST (5 MIN)

## Step 1.1: Verify You Have the Project Code

Run this command in your terminal:
```bash
cd market-research-mvp
ls -la
```

You should see these folders:
- `backend/`
- `frontend/`
- `database/`
- `deployment/`
- `docs/`

**If you don't see these folders:** Download/clone the project first. Ask for help.

---

## Step 1.2: Gather Your API Keys (5 MIN)

### 🔵 Supabase Setup

1. Go to: https://app.supabase.com
2. Sign in
3. Click **"New Project"**
4. Fill in:
   - Project name: `market-research-mvp`
   - Database password: **SAVE THIS SOMEWHERE** (you'll need it)
   - Region: Pick closest to you
5. Click **Create new project** (wait 2-3 minutes)
6. Once created, go to: **Settings → API**
7. Copy these 3 values and PASTE them into a text file:
   ```
   SUPABASE_URL = (Copy from "Project URL")
   SUPABASE_ANON_KEY = (Copy from "anon public")
   SUPABASE_SERVICE_KEY = (Copy from "service_role secret")
   ```

### 🔴 Stripe Setup

1. Go to: https://dashboard.stripe.com
2. Sign in
3. Make sure you're in **"Test Mode"** (toggle at top right)
4. Go to: **Developers → API Keys**
5. Copy these 2 values and PASTE them into your text file:
   ```
   STRIPE_SECRET_KEY = (Copy "Secret key", starts with sk_test_)
   STRIPE_PUBLISHABLE_KEY = (Copy "Publishable key", starts with pk_test_)
   ```

6. Now create a price:
   - Go to: **Products → Create a product**
   - Name: `Market Research Pro`
   - Pricing type: Standard pricing
   - Unit price: `99`
   - Billing period: Monthly
   - Click **Save product**
   - Under "Pricing", copy the **Price ID** (looks like `price_1234567890`)
   ```
   STRIPE_PRICE_ID = (Copy Price ID)
   ```

7. Create a webhook:
   - Go to: **Developers → Webhooks**
   - Click **Add endpoint**
   - Endpoint URL: `https://your-railway-url.railway.app/api/subscriptions/webhook` (you'll update this later)
   - Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Click **Add endpoint**
   - Click on the endpoint you just created
   - Copy the **Signing secret** (starts with `whsec_`)
   ```
   STRIPE_WEBHOOK_SECRET = (Copy Signing secret)
   ```

### 🟣 Anthropic (Claude) Setup

1. Go to: https://console.anthropic.com
2. Sign in
3. Go to: **API Keys**
4. Click **Create Key**
5. Name it: `market-research-deployment`
6. Copy the key (starts with `sk-ant-`) and PASTE into your text file:
   ```
   ANTHROPIC_API_KEY = (Copy the key)
   ```

### ✅ You Now Have All Keys

Your text file should look like this:
```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJxxxx...
SUPABASE_SERVICE_KEY = eyJxxxx...
STRIPE_SECRET_KEY = sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY = pk_test_xxxxx
STRIPE_PRICE_ID = price_xxxxx
STRIPE_WEBHOOK_SECRET = whsec_xxxxx
ANTHROPIC_API_KEY = sk-ant-xxxxx
```

**SAVE THIS FILE - you'll use it in next sections.**

---

# SECTION 2: LOCAL TESTING (5 MIN)

**Goal:** Make sure the app runs locally before deploying.

## Step 2.1: Setup Backend

Open Terminal and run:

```bash
cd market-research-mvp/backend

# Create virtual environment
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

This takes 2-3 minutes. Wait for it to finish.

## Step 2.2: Create Backend .env File

In the `backend/` folder, create a file named `.env` (exact name):

```
DATABASE_URL=postgresql://postgres:YOUR_SUPABASE_PASSWORD@db.YOUR_SUPABASE_ID.supabase.co:5432/postgres
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_PRICE_ID=YOUR_STRIPE_PRICE_ID
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
DEBUG=True
PORT=8000
```

**Replace all `YOUR_xxx` with values from your text file above.**

For `DATABASE_URL`:
- Go to Supabase → Settings → Database
- Click "Connection pooling"
- Copy "Connection string" (URI format)
- Paste it in for DATABASE_URL

## Step 2.3: Start Backend

In the `backend/` folder, run:

```bash
python -m uvicorn app:app --reload
```

**What to look for:**
- Should say: `Uvicorn running on http://127.0.0.1:8000`
- NO errors (red text)
- If error: Stop and fix it before continuing

**Leave this terminal running.** Open a NEW terminal for the next step.

## Step 2.4: Setup Frontend

In a NEW terminal, run:

```bash
cd market-research-mvp/frontend

npm install
```

This takes 1-2 minutes. Wait for it to finish.

## Step 2.5: Create Frontend .env.local File

In the `frontend/` folder, create a file named `.env.local` (exact name):

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=YOUR_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_ENV=development
```

**Replace all `YOUR_xxx` with values from your text file.**

## Step 2.6: Start Frontend

In the same terminal, run:

```bash
npm run dev
```

**What to look for:**
- Should say: `ready - started server on 0.0.0.0:3000`
- NO errors
- Wait 10 seconds for it to compile

## Step 2.7: Test Local App

1. Open browser: http://localhost:3000
2. You should see the **login page**
3. Try to **sign up** with a test email
4. **Look for:**
   - ✅ Page loads
   - ✅ No red error messages
   - ✅ Signup button works
   - ✅ Can see the form

**If you see errors:**
- Check backend terminal for error messages
- Check browser console (F12 → Console tab)
- Compare your .env values with the text file
- Make sure backend is running

**If everything works:** ✅ You're ready to deploy!

---

# SECTION 3: DEPLOYMENT (15 MIN)

## PART 1: Database Setup on Supabase (3 MIN)

### Step 3.1.1: Run Database Migrations

1. Go to Supabase: https://app.supabase.com
2. Select your project
3. Go to: **SQL Editor**
4. Click **New Query**
5. Copy this entire SQL code:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create data_uploads table
CREATE TABLE IF NOT EXISTS data_uploads (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    file_url VARCHAR(500),
    row_count INTEGER DEFAULT 0,
    columns JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create uploaded_data table
CREATE TABLE IF NOT EXISTS uploaded_data (
    id VARCHAR(255) PRIMARY KEY,
    upload_id VARCHAR(255) NOT NULL REFERENCES data_uploads(id) ON DELETE CASCADE,
    raw_data JSONB,
    processed_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create insight_analysis table
CREATE TABLE IF NOT EXISTS insight_analysis (
    id VARCHAR(255) PRIMARY KEY,
    upload_id VARCHAR(255) NOT NULL REFERENCES data_uploads(id) ON DELETE CASCADE,
    insights_json JSONB,
    summary TEXT,
    key_findings JSONB,
    recommendations JSONB,
    api_tokens_used INTEGER DEFAULT 0,
    api_cost DECIMAL(10, 4) DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'free',
    price_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    trial_end TIMESTAMP,
    cancel_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_data_uploads_user_id ON data_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_data_upload_id ON uploaded_data(upload_id);
CREATE INDEX IF NOT EXISTS idx_insight_analysis_upload_id ON insight_analysis(upload_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
```

6. Paste it into the SQL editor
7. Click **RUN** (blue button, top right)
8. Wait 5 seconds

**What to look for:**
- ✅ No error messages
- ✅ Green checkmark

### Step 3.1.2: Verify Tables Created

1. Go to: **Table Editor** (left sidebar)
2. You should see these tables:
   - `users`
   - `data_uploads`
   - `uploaded_data`
   - `insight_analysis`
   - `subscriptions`

**If you see all 5 tables:** ✅ Database is ready!

---

## PART 2: Backend Deployment to Railway (5 MIN)

### Step 3.2.1: Connect Your GitHub

1. Go to: https://railway.app
2. Sign in
3. Click **New Project**
4. Click **Deploy from GitHub**
5. **Connect GitHub** (if not already connected)
   - Click "Connect GitHub account"
   - Authorize Railway to access your repos
6. Select your repo: `market-research-mvp` (or wherever you cloned it)
7. Click **Deploy Now**

### Step 3.2.2: Set Environment Variables

Railway will show a project dashboard. Go to: **Variables**

Add these exact variables. Copy from your text file:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres:YOUR_PASSWORD@db.YOUR_ID.supabase.co:5432/postgres` |
| `SUPABASE_URL` | YOUR_SUPABASE_URL |
| `SUPABASE_ANON_KEY` | YOUR_SUPABASE_ANON_KEY |
| `STRIPE_SECRET_KEY` | YOUR_STRIPE_SECRET_KEY |
| `STRIPE_PRICE_ID` | YOUR_STRIPE_PRICE_ID |
| `STRIPE_WEBHOOK_SECRET` | YOUR_STRIPE_WEBHOOK_SECRET |
| `ANTHROPIC_API_KEY` | YOUR_ANTHROPIC_API_KEY |
| `DEBUG` | `False` |
| `PORT` | `8000` |

**For FRONTEND_URL and CORS_ORIGINS:**
- Leave empty for now
- You'll update these in Step 3.3 after Vercel gives you a frontend URL

### Step 3.2.3: Configure to Deploy Backend Only

1. In Railway, click **Settings**
2. Look for "Root Directory"
3. Set it to: `backend`
4. Save

### Step 3.2.4: Wait for Deployment

1. Click the **Deployments** tab
2. Watch the status
3. Wait until it says **"Success"** (might take 3-5 minutes)

### Step 3.2.5: Get Your Backend URL

1. Go to: **Settings**
2. Look for **Public URL**
3. Copy this URL (looks like `https://xyz.railway.app`)
4. **Save it in your text file as `RAILWAY_URL`**

**If you see errors:**
- Check the deployment logs
- Most common issue: Missing environment variable
- Add any missing variable and redeploy

---

## PART 3: Frontend Deployment to Vercel (5 MIN)

### Step 3.3.1: Deploy to Vercel

1. Go to: https://vercel.com
2. Sign in
3. Click **Add New → Project**
4. Click **Import Git Repository**
5. Search for: `market-research-mvp`
6. Select it and click **Import**

### Step 3.3.2: Configure Project Settings

1. Find the section that says **"Configure Project"**
2. For **"Framework Preset"** select: **Next.js**
3. For **"Root Directory"** set to: **`frontend`**
4. Click **Deploy**

### Step 3.3.3: Add Environment Variables

While it's deploying, add your environment variables:

1. After deployment, go to: **Settings → Environment Variables**
2. Add these variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | YOUR_RAILWAY_URL (from Step 3.2.5) |
| `NEXT_PUBLIC_SUPABASE_URL` | YOUR_SUPABASE_URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | YOUR_SUPABASE_ANON_KEY |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | YOUR_STRIPE_PUBLISHABLE_KEY |
| `NEXT_PUBLIC_ENV` | `production` |

3. Click **Save** for each one
4. Click **Deployments** and wait for redeploy to complete

### Step 3.3.4: Get Your Frontend URL

1. Go to the **Deployments** tab
2. When it says **"Ready"**, click it
3. Copy the **Production URL** (looks like `https://xyz.vercel.app`)
4. **Save it in your text file as `VERCEL_URL`**

---

## PART 4: Update All URLs (2 MIN)

### Step 3.4.1: Update Backend Environment Variables

1. Go back to **Railway**
2. Go to: **Variables**
3. Update these:

| Variable | Value |
|----------|-------|
| `FRONTEND_URL` | YOUR_VERCEL_URL (from Step 3.3.4) |
| `CORS_ORIGINS` | YOUR_VERCEL_URL (same) |

4. Wait for automatic redeploy (1-2 minutes)

### Step 3.4.2: Update Stripe Webhook URL

1. Go to: https://dashboard.stripe.com
2. Go to: **Developers → Webhooks**
3. Click on your webhook endpoint
4. Update **Endpoint URL** to:
   ```
   YOUR_RAILWAY_URL/api/subscriptions/webhook
   ```
5. Click **Update endpoint**

---

# SECTION 4: VERIFICATION (5 MIN)

## Step 4.1: Test Frontend

1. Go to your Vercel URL: `https://yourapp.vercel.app`
2. You should see the **login page**

**If you see a blank page:**
- Wait 30 seconds
- Refresh the page
- Check browser console (F12) for errors
- If error about API: Backend URL might be wrong

## Step 4.2: Test Signup

1. Click **Sign Up**
2. Enter:
   - Email: `test@example.com`
   - Password: anything (at least 8 chars)
3. Click **Sign Up**

**What to look for:**
- ✅ No errors
- ✅ Redirects to dashboard or asks for trial
- ❌ If CORS error: Backend FRONTEND_URL might be wrong

## Step 4.3: Test Free Trial

1. Go to **Settings** page
2. Click **Start Free Trial**
3. Complete the Stripe payment

**What to look for:**
- ✅ Stripe modal appears
- ✅ Can use test card: `4242 4242 4242 4242` / `12/25` / `123`
- ✅ Trial starts

## Step 4.4: Test CSV Upload

1. Create a test CSV file named `test.csv`:

```csv
name,email,age,city
John,john@example.com,25,New York
Jane,jane@example.com,30,Los Angeles
Bob,bob@example.com,28,Chicago
```

2. Go to **Upload** page
3. Upload this CSV file
4. Wait for processing

**What to look for:**
- ✅ File uploads
- ✅ Shows "Processing" or "Complete"
- ❌ If fails: Check backend logs on Railway

## Step 4.5: Test Insights

1. Click on your upload
2. Click **Generate Insights**
3. Wait 10-30 seconds

**What to look for:**
- ✅ Insights generate
- ✅ Shows analysis
- ❌ If fails: Check Anthropic API key

---

## ✅ ALL DONE!

If all tests passed, **your app is live!**

**Summary of what you deployed:**
- ✅ Frontend on Vercel
- ✅ Backend on Railway
- ✅ Database on Supabase
- ✅ Payments via Stripe
- ✅ AI via Anthropic

**Your app is live at:** `https://yourapp.vercel.app`

---

## 🚨 TROUBLESHOOTING

See `TROUBLESHOOTING.md` in the deployment folder for:
- Backend connection failed
- Database errors
- Login not working
- Insights not generating
- Stripe errors

---

**Congratulations! You've deployed a production AI app in 30 minutes! 🎉**
