# Deployment Guide

Step-by-step guide to deploy the application to production.

## Overview

**Frontend:** Vercel (Next.js hosting)
**Backend:** Railway or Render (Python hosting)
**Database:** PostgreSQL (Supabase, AWS RDS, or service provider)
**Auth:** Supabase (already setup)

## Pre-Deployment Checklist

- [ ] All local tests pass
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Git repository created
- [ ] No secrets committed to git
- [ ] Production Stripe keys obtained
- [ ] Production Anthropic API keys obtained
- [ ] Domain name purchased (optional)
- [ ] SSL/TLS certificate ready (auto-provided by services)

## Step 1: Prepare Code

### 1. Clean Up Code

```bash
# Remove debug prints
grep -r "console.log" frontend/
grep -r "print(" backend/

# Check for secrets
grep -r "STRIPE_SECRET_KEY" --exclude-dir=node_modules --exclude-dir=venv
```

### 2. Create .gitignore

```
# Backend
backend/venv/
backend/__pycache__/
backend/.env
backend/.env.local
backend/*.db
backend/logs/

# Frontend
frontend/node_modules/
frontend/.env
frontend/.env.local
frontend/.next/
frontend/build/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
```

### 3. Commit to Git

```bash
git add .
git commit -m "Initial commit: Market Research MVP"
git push -u origin main
```

## Step 2: Deploy Frontend to Vercel

### Option A: Connect GitHub (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Import Project"
4. Select your repository
5. Configure project:
   - **Root Directory:** `frontend`
   - **Framework:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

6. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL = https://your-api-domain.com
   NEXT_PUBLIC_SUPABASE_URL = your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY = pk_live_...
   ```

7. Click "Deploy"
8. Wait for deployment (usually 2-3 minutes)

### Option B: Manual Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts
# Answer "yes" to create new project
# Select team/account
```

### Verify Frontend

1. Get Vercel project URL
2. Visit `https://your-project.vercel.app`
3. Should see login page
4. Test signup flow

## Step 3: Deploy Backend to Railway

### 1. Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended)
3. Create new project

### 2. Connect GitHub Repository

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Install Railway GitHub app
4. Select your repository

### 3. Configure Services

1. **Create PostgreSQL Database**
   - Click "Add Service"
   - Select "Database"
   - Choose "PostgreSQL"
   - Railway creates database automatically

2. **Create Python Service**
   - Click "Add Service"
   - Select "GitHub Repo"
   - Select your repository
   - Configure root directory: `backend`

3. **Set Environment Variables**
   - Click on service
   - Go to Variables
   - Add all variables from `.env.example`:
     ```
     DATABASE_URL = (auto-populated from PostgreSQL)
     SUPABASE_URL = your-supabase-url
     SUPABASE_ANON_KEY = your-anon-key
     STRIPE_SECRET_KEY = sk_live_...
     STRIPE_PRICE_ID = price_...
     STRIPE_WEBHOOK_SECRET = whsec_...
     ANTHROPIC_API_KEY = sk-ant-...
     FRONTEND_URL = https://your-project.vercel.app
     CORS_ORIGINS = https://your-project.vercel.app
     ```

4. **Deploy**
   - Railway automatically deploys on push
   - Wait for build completion (5-10 minutes)
   - Get public URL from service settings

### 4. Run Database Migrations

```bash
# Connect to Railway database
psql postgresql://user:password@host:port/database

# Paste SQL from database/migrations/001_initial_schema.sql
```

Or use Railway CLI:
```bash
railway db:connect
# Then paste SQL
```

### 5. Verify Backend

```bash
# Check health endpoint
curl https://your-api-domain.com/health

# Should return:
# {"status": "healthy", "service": "market-research-api", "version": "1.0.0"}
```

## Step 4: Deploy Backend to Render (Alternative)

If using Render instead of Railway:

### 1. Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Create new project

### 2. Create PostgreSQL Database

1. New → Database
2. Select PostgreSQL
3. Name: `market-research-db`
4. Plan: Standard (free tier available)
5. Copy connection string → `DATABASE_URL`

### 3. Create Web Service

1. New → Web Service
2. Connect GitHub repository
3. Configure:
   - **Name:** `market-research-api`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000`
   - **Plan:** Starter

4. Add Environment Variables:
   - Click "Environment"
   - Add all from `.env.example`
   - Get `DATABASE_URL` from PostgreSQL service

5. Deploy
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

### 4. Verify Backend

```bash
curl https://your-api-domain.render.com/health
```

## Step 5: Update Supabase Configuration

### 1. Update CORS

1. Go to Supabase Project Settings
2. Authentication → CORS Configuration
3. Add your Vercel domain:
   ```
   https://your-project.vercel.app
   ```

### 2. Update Redirect URLs

1. Authentication → URL Configuration
2. Site URL: `https://your-project.vercel.app`
3. Redirect URLs:
   ```
   https://your-project.vercel.app/login
   https://your-project.vercel.app/app/upload
   https://your-project.vercel.app/app/settings
   ```

## Step 6: Update Stripe Configuration

### 1. Update Webhook Endpoint

1. Go to Stripe Dashboard → Webhooks
2. Edit endpoint
3. Update URL: `https://your-api-domain.com/api/subscriptions/webhook`
4. Save

### 2. Update Redirect URLs

1. Settings → Branding
2. Update website URL

### 3. Switch to Live Keys (if ready)

1. Go to Developers → API Keys
2. Switch toggle to "Live"
3. Copy live keys
4. Update production environment variables:
   - `STRIPE_SECRET_KEY = sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLIC_KEY = pk_live_...`

## Step 7: Final Integration

### 1. Update Frontend Environment Variables

On Vercel:
1. Project Settings → Environment Variables
2. Update:
   ```
   NEXT_PUBLIC_API_URL = https://your-api-domain.com
   ```
3. Redeploy

### 2. Test Full Flow

1. Visit frontend: `https://your-project.vercel.app`
2. Sign up with test email
3. Check Supabase users table - should see new user
4. Start free trial - check Stripe dashboard
5. Upload test CSV
6. Generate insights
7. Check API logs

### 3. Monitor Services

1. **Vercel:** Check deployment logs for errors
2. **Railway/Render:** Check service logs
3. **Supabase:** Check authentication logs
4. **Stripe:** Check webhook deliveries
5. **Anthropic:** Check API usage

## Troubleshooting Deployment

### Frontend Build Fails

**Error:** `Next.js build fails`

**Solutions:**
- Check Node version: `node --version` (should be 16+)
- Clear cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build` locally first

### Backend Deploy Fails

**Error:** `gunicorn: command not found`

**Solutions:**
- Make sure `requirements.txt` has all dependencies
- Check `Dockerfile` is correct
- Verify Python version (3.11+)
- Check for import errors

### Database Connection Error

**Error:** `could not connect to database`

**Solutions:**
- Verify `DATABASE_URL` is correct
- Check database is running
- Check firewall allows connections
- Try connecting with psql locally
- Verify migrations ran

### API Gateway Timeout

**Error:** `504 Gateway Timeout`

**Solutions:**
- Check backend is running: `curl https://api.domain.com/health`
- Check service logs for errors
- Increase timeout (if using custom domain)
- Check API is responding: `time curl https://api.domain.com/health`

### CORS Errors in Frontend

**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solutions:**
- Update `CORS_ORIGINS` in backend
- Make sure frontend URL is exact match
- Check `FRONTEND_URL` env var
- Verify no port mismatch

### Stripe Webhook Not Firing

**Error:** `No webhook deliveries in Stripe dashboard`

**Solutions:**
- Check webhook URL is correct
- Test webhook manually in Stripe dashboard
- Check backend logs for errors
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Try re-sending webhook from dashboard

## Performance Optimization

### Frontend (Vercel)

1. Enable automatic image optimization
2. Use ISR (Incremental Static Regeneration) for pages
3. Check Core Web Vitals in Vercel Analytics
4. Enable compression

### Backend (Railway/Render)

1. Set up proper logging
2. Monitor API response times
3. Use connection pooling for database
4. Set appropriate worker count

### Database

1. Create indexes on frequently queried columns
2. Archive old data
3. Set up automated backups
4. Monitor query performance

## Security Checklist

- [ ] Never commit `.env` files
- [ ] Use strong database passwords
- [ ] Enable HTTPS everywhere
- [ ] Set up API rate limiting
- [ ] Enable CORS restrictions
- [ ] Use environment variables for secrets
- [ ] Enable authentication on all endpoints
- [ ] Set up firewall rules
- [ ] Enable database encryption
- [ ] Use strong JWT secrets
- [ ] Implement input validation
- [ ] Regular security audits

## Monitoring & Analytics

### Error Tracking

Use Sentry or similar:
```python
# backend/app.py
import sentry_sdk
sentry_sdk.init("your-sentry-dsn")
```

### Analytics

Add Google Analytics to frontend:
```javascript
// frontend/pages/_document.js
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

### Logging

Set up structured logging:
```python
import logging
logger = logging.getLogger(__name__)
logger.info("User signed up", extra={"user_id": user.id})
```

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest

  deploy:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod
```

## Next Steps

1. **Monitor:** Set up error tracking and analytics
2. **Scale:** Configure auto-scaling if needed
3. **Optimize:** Optimize performance based on metrics
4. **Document:** Create user documentation
5. **Support:** Set up customer support system
6. **Market:** Start promoting your product

---

For setup instructions, see [SETUP.md](SETUP.md)
For API documentation, see [API_DOCS.md](API_DOCS.md)
