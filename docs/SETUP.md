# Setup Guide - Market Research Tool

Complete guide to setting up the application for local development or deployment.

## Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.11+
- **PostgreSQL** 13+ (or Docker)
- **Git**
- **Code editor** (VS Code recommended)

## Initial Setup (5 minutes)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/market-research-mvp.git
cd market-research-mvp
```

### 2. Create External Services

You'll need accounts for:
- **Supabase** (Authentication) - [Sign up](https://supabase.com)
- **Stripe** (Payments) - [Sign up](https://stripe.com)
- **Anthropic** (AI API) - [Sign up](https://console.anthropic.com)

## Supabase Setup (10 minutes)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Organization: Choose or create
   - Project name: `market-research`
   - Database password: Strong password
   - Region: Closest to you
4. Wait for project to be created (2-3 minutes)

### 2. Get Credentials

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_KEY` (backend only)

### 3. Enable Auth

1. Go to Authentication
2. Settings → Providers → Email
3. Make sure "Email/Password" is enabled

### 4. Create Database

1. Go to SQL Editor
2. Create new query
3. Paste content from `database/migrations/001_initial_schema.sql`
4. Click "Run"

## Stripe Setup (10 minutes)

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Click "Start now"
3. Complete signup and email verification

### 2. Create Price

1. Go to Products → Create product
   - Name: `Market Research Pro`
   - Description: `Unlimited uploads and insights`
   - Price: `99.00`
   - Currency: `USD`
   - Billing period: `Monthly`
2. Copy the **Price ID** → `STRIPE_PRICE_ID`

### 3. Get API Keys

1. Go to Developers → API keys
2. Copy these values:
   - **Secret key** → `STRIPE_SECRET_KEY`
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`

### 4. Create Webhook

1. Go to Developers → Webhooks
2. Click "Add an endpoint"
3. Endpoint URL: `https://your-api-domain.com/api/subscriptions/webhook`
4. Events: Select these events:
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

## Anthropic Setup (5 minutes)

### 1. Create Account

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up with email
3. Verify email

### 2. Get API Key

1. Go to "API keys"
2. Create new API key
3. Copy the key → `ANTHROPIC_API_KEY`

## Backend Setup (10 minutes)

### 1. Navigate to Backend

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
# Copy example
cp .env.example .env

# Edit with your values
nano .env  # or use your editor
```

**Required variables:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/market_research
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
```

### 5. Setup Database (if using Docker)

```bash
# Start PostgreSQL
docker-compose up -d

# Wait for container to start (10 seconds)
sleep 10

# Create database
psql postgresql://user:password@localhost:5432 -c "CREATE DATABASE market_research;"
```

### 6. Test Backend

```bash
python -m uvicorn app:app --reload
```

Visit http://localhost:8000/docs - You should see Swagger API docs.

## Frontend Setup (10 minutes)

### 1. Navigate to Frontend

```bash
cd ../frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
# Copy example
cp .env.example .env.local

# Edit with your values
nano .env.local  # or use your editor
```

**Required variables:**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

### 4. Test Frontend

```bash
npm run dev
```

Visit http://localhost:3000 - App should load!

## Full Local Development

### Terminal 1 - Backend

```bash
cd backend
source venv/bin/activate
python -m uvicorn app:app --reload
# http://localhost:8000
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
# http://localhost:3000
```

### Terminal 3 - Database (Optional)

```bash
cd backend
docker-compose up
```

## Testing the Setup

### 1. Sign Up

1. Go to http://localhost:3000
2. Click "Get Started" or go to `/login`
3. Click "Sign Up"
4. Enter email, password, and full name
5. Create account

### 2. Start Free Trial

1. You should be redirected to `/app/upload`
2. Go to `/app/settings`
3. Click "Start 7-Day Free Trial"
4. Should see success message

### 3. Upload Test File

1. Create a test CSV file:
```csv
name,email,age,city
John,john@example.com,25,New York
Jane,jane@example.com,30,Los Angeles
Bob,bob@example.com,28,Chicago
```

2. Go to `/app/upload`
3. Drag and drop the CSV file
4. Click "Upload File"
5. Should see file listed

### 4. Generate Insights

1. Click "View Insights" on the uploaded file
2. Click "Generate Insights Now"
3. Should see AI-generated insights after 10-15 seconds

### 5. Check Stripe Webhook

1. Stripe Dashboard → Developers → Webhooks
2. Should see webhook deliveries to your endpoint
3. Status should be "Succeeded" (200)

## Troubleshooting Setup

### Database Connection Error

**Error:** `psycopg2.OperationalError: could not connect to server`

**Solutions:**
- Check PostgreSQL is running: `docker-compose ps`
- Check DATABASE_URL is correct in .env
- Check password in CONNECTION_URL matches
- Try: `docker-compose down && docker-compose up`

### Supabase Connection Error

**Error:** `Invalid Supabase credentials`

**Solutions:**
- Copy correct URL and keys from Supabase console
- Make sure you're using `anon` key for frontend, not `service_role`
- Check keys are not expired
- Try creating new API keys

### Stripe Integration Error

**Error:** `StripeError: Invalid API key`

**Solutions:**
- Make sure `STRIPE_SECRET_KEY` starts with `sk_test_` (test mode)
- Never commit actual keys to git
- Use `.env` file and add to `.gitignore`
- Check key hasn't been revoked

### Claude API Error

**Error:** `anthropic.error.AuthenticationError`

**Solutions:**
- Get fresh API key from console.anthropic.com
- Make sure key is not expired
- Check you have available credits
- Use Haiku model (`claude-3-5-haiku-20241022`)

### Port Already in Use

**Error:** `Address already in use: ('0.0.0.0', 8000)`

**Solutions:**
- Kill process on port: `lsof -i :8000` then `kill -9 <PID>`
- Or use different port: `uvicorn app:app --port 8001`
- Check no other services running on 3000/8000

### CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
- Check `FRONTEND_URL` matches frontend domain
- Check `CORS_ORIGINS` in backend `.env`
- Make sure frontend is http://localhost:3000 for local
- Check backend is running on 8000

## Environment Variables Reference

See [ENV_GUIDE.md](ENV_GUIDE.md) for complete environment variable documentation.

## Next Steps

1. **Customize**: Modify UI colors, logos, text
2. **Add features**: Implement Google Sheets import, more data formats
3. **Deploy**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Monitor**: Set up error tracking, analytics
5. **Promote**: Share your app with beta users

## Getting Help

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Review API docs at http://localhost:8000/docs
- Check browser console for frontend errors
- Check backend logs for API errors
- Visit Supabase, Stripe, Anthropic dashboards for service issues

## Quick Reference

| Service | Local URL | Production |
|---------|-----------|------------|
| Frontend | http://localhost:3000 | Vercel domain |
| Backend API | http://localhost:8000 | Railway/Render domain |
| API Docs | http://localhost:8000/docs | Same with path |
| Database | localhost:5432 | RDS/Supabase |
| Supabase | supabase.com | supabase.com |
| Stripe Dashboard | stripe.com/test | stripe.com |
| Anthropic Console | console.anthropic.com | console.anthropic.com |

---

For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)
