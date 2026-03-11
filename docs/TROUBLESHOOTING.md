# Troubleshooting Guide

Solutions to common issues and how to debug them.

## Quick Diagnosis

### Step 1: Identify the Problem

**Frontend issues:**
- Check browser console (F12)
- Check Network tab for API errors
- Look for error messages in UI

**Backend issues:**
- Check backend terminal for error logs
- Visit `http://localhost:8000/health`
- Check API request/response in Network tab

**Database issues:**
- Try connecting directly: `psql {DATABASE_URL}`
- Check service is running
- Verify credentials

**Authentication issues:**
- Check Supabase dashboard for users
- Verify keys in `.env` files
- Check browser localStorage for tokens

## Common Issues & Solutions

### Authentication Issues

#### "Invalid Credentials" on Login

**Symptoms:**
- Login fails with "Invalid credentials"
- Supabase key error in console

**Solutions:**
```bash
# 1. Verify Supabase keys
cat backend/.env | grep SUPABASE

# 2. Check keys match in frontend
cat frontend/.env.local | grep SUPABASE

# 3. Copy fresh keys from Supabase
# Supabase Dashboard → Settings → API

# 4. Verify Supabase project exists
# Visit supabase.com and check project list

# 5. Check if Auth is enabled
# Supabase Dashboard → Authentication → Providers
# Make sure "Email/Password" is enabled
```

#### User Can't Sign Up

**Symptoms:**
- Sign up button doesn't work
- No error message appears
- Stuck on loading state

**Solutions:**
```bash
# 1. Check network request
# Browser DevTools → Network tab
# Look for signup POST request
# Check response status and body

# 2. Verify email is valid
# Must be standard email format

# 3. Check password requirements
# Minimum 6 characters required

# 4. Look for duplicate account
# User might already exist with this email

# 5. Check Supabase quota
# Supabase → Project → Logs
# Look for "User limit exceeded"

# 6. Verify API is running
curl http://localhost:8000/health
```

#### JWT Token Expired

**Symptoms:**
- Logged in user gets unauthorized
- "401 Unauthorized" on API calls
- Need to login again frequently

**Solutions:**
```bash
# 1. Check token refresh logic
# Frontend lib/supabase.js should auto-refresh

# 2. Clear browser storage
# Browser DevTools → Application
# Clear localStorage and sessionStorage
# Log in again

# 3. Check Supabase session settings
# Supabase → Authentication → Policies
# Verify session timeout isn't too short
```

### Database Issues

#### "could not connect to server"

**Symptoms:**
- Backend startup fails
- `psycopg2.OperationalError: could not connect to server`

**Solutions:**
```bash
# 1. Check DATABASE_URL
cat backend/.env | grep DATABASE_URL

# 2. Verify database is running
docker-compose ps  # If using Docker

# 3. Check credentials
# Extract user/password from DATABASE_URL
# Verify they're correct

# 4. Test connection directly
psql postgresql://user:password@localhost:5432/market_research

# 5. If using Railway/Render
# Check database service is running
# Check connection string is up to date
# Verify firewall allows connections

# 6. Restart database
docker-compose down
docker-compose up -d
sleep 10  # Wait for startup
```

#### Tables Don't Exist

**Symptoms:**
- API returns table not found errors
- `relation "users" does not exist`

**Solutions:**
```bash
# 1. Run migrations manually
psql postgresql://user:password@localhost:5432/market_research < database/migrations/001_initial_schema.sql

# 2. Check migrations ran
psql postgresql://user:password@localhost:5432/market_research
# Type: \dt (list tables)
# Should see: users, data_uploads, uploaded_data, insight_analysis, subscriptions

# 3. Verify database exists
psql postgresql://user:password@localhost:5432
# Type: \l (list databases)
# Should see: market_research

# 4. For Railway/Render
# Use web interface to run SQL
# Or use their CLI to connect and run SQL
```

### API Issues

#### "404 Not Found" on API Calls

**Symptoms:**
- API returns 404
- Endpoint doesn't exist

**Solutions:**
```bash
# 1. Verify endpoint exists
curl http://localhost:8000/health
# Should return 200

# 2. Check API documentation
# http://localhost:8000/docs

# 3. Verify endpoint URL spelling
# Check route in routes/*.py

# 4. Check if backend is running
# Terminal should show: "Uvicorn running on http://0.0.0.0:8000"

# 5. Check for typos in request
# Make sure method matches (POST vs GET)
# Make sure path matches exactly
```

#### "CORS error" on Frontend

**Symptoms:**
- Browser console: "Access to XMLHttpRequest blocked by CORS policy"
- API calls fail from frontend

**Solutions:**
```bash
# 1. Check CORS_ORIGINS in backend
cat backend/.env | grep CORS_ORIGINS

# 2. Verify frontend URL matches exactly
# CORS is strict about protocol, domain, port
# http://localhost:3000 ≠ http://localhost:3001
# http://localhost ≠ http://127.0.0.1

# 3. Update CORS_ORIGINS
# Edit backend/.env:
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# 4. Restart backend
# Press Ctrl+C to stop
# Run: python -m uvicorn app:app --reload

# 5. For production
# Set CORS_ORIGINS to your exact frontend domain
# Example: https://myapp.vercel.app
```

#### "500 Internal Server Error"

**Symptoms:**
- API returns 500 error
- Backend logs show exception

**Solutions:**
```bash
# 1. Check backend logs
# Look at terminal where uvicorn is running
# Error should be printed there

# 2. Check database connection
# Verify DATABASE_URL is correct
# Test: psql {DATABASE_URL}

# 3. Check environment variables
# Make sure all required vars are set
cat backend/.env

# 4. Check for missing dependencies
# Verify all imports work
python -c "from anthropic import Anthropic"
python -c "import stripe"

# 5. Check API logs
# Add print statements for debugging
# Look for exceptions in traceback

# 6. Restart backend in debug mode
python -m uvicorn app:app --reload --log-level debug
```

#### "Stripe Integration Not Working"

**Symptoms:**
- Webhook not firing
- Payment fails
- Trial doesn't start

**Solutions:**
```bash
# 1. Verify Stripe keys
cat backend/.env | grep STRIPE

# 2. Check webhook endpoint
# Stripe Dashboard → Developers → Webhooks
# Endpoint should be: https://your-api.com/api/subscriptions/webhook

# 3. Test webhook manually
# Stripe Dashboard → Webhooks
# Click endpoint → Send test event
# Select "customer.subscription.updated"
# Should see 200 response

# 4. Check backend webhook handler
# Look at routes/subscriptions.py:handle_stripe_webhook()
# Add logging to debug

# 5. Verify webhook secret
# Get from: Stripe → Developers → Webhooks → Endpoint
# Make sure STRIPE_WEBHOOK_SECRET matches exactly

# 6. Test Stripe API connection
python
from services.stripe_handler import StripeHandler
StripeHandler.verify_webhook_signature(b'test', 'test_sig')  # Should fail gracefully
```

### AI (Claude) Issues

#### "Invalid API Key"

**Symptoms:**
- `anthropic.error.AuthenticationError`
- Insights generation fails

**Solutions:**
```bash
# 1. Check API key
cat backend/.env | grep ANTHROPIC_API_KEY

# 2. Verify key format
# Should start with "sk-ant-"
# Should be 20+ characters

# 3. Get fresh key
# Go to console.anthropic.com
# API Keys → Create new key

# 4. Check account has credits
# console.anthropic.com → Billing
# Should have available balance

# 5. Test connection
python
from anthropic import Anthropic
client = Anthropic(api_key="your-key")
# Should not error

# 6. Check model name
# Should be: claude-3-5-haiku-20241022
# Not: gpt-4 or other models
```

#### "Rate Limited by Claude API"

**Symptoms:**
- Insights generation fails intermittently
- Error: "Rate limit exceeded"

**Solutions:**
```bash
# 1. Check API quota
# console.anthropic.com → Billing
# Verify you have available tokens

# 2. Add rate limiting
# Back end should implement exponential backoff
# Check services/claude_insights.py for retry logic

# 3. Upgrade account
# Increase usage limits in Anthropic console
# If you're on free tier, upgrade to paid

# 4. Batch requests
# Don't generate multiple insights simultaneously
# Queue them instead

# 5. Reduce token usage
# Simplify prompts in services/claude_insights.py
# Reduce sample data size
```

### Frontend Build Issues

#### "npm install fails"

**Symptoms:**
- `npm install` errors out
- `peer dependency` warnings
- `ERESOLVE unable to resolve dependency tree`

**Solutions:**
```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Delete old installation
rm -rf node_modules package-lock.json

# 3. Reinstall
npm install

# 4. If still fails, use legacy dependency resolution
npm install --legacy-peer-deps

# 5. Check Node version
node --version  # Should be 16+
npm --version   # Should be 8+

# 6. Update npm
npm install -g npm@latest
```

#### "Build fails with 'module not found'"

**Symptoms:**
- `Cannot find module 'next'`
- Build fails during `npm run build`

**Solutions:**
```bash
# 1. Install dependencies
npm install

# 2. Check node_modules exists
ls node_modules | grep next

# 3. Clear Next.js cache
rm -rf .next
npm run build

# 4. Check package.json
# Verify all dependencies are listed
cat package.json | grep -A 20 '"dependencies"'

# 5. Verify imports are correct
# Check capitalization (JavaScript is case-sensitive)
```

#### "Styles not loading"

**Symptoms:**
- CSS not applied
- Classes like `btn-primary` not working
- Tailwind not working

**Solutions:**
```bash
# 1. Verify Tailwind config
cat tailwind.config.js
# Should include: content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}']

# 2. Rebuild Tailwind
npm run build

# 3. Clear cache
rm -rf .next node_modules/.cache

# 4. Check CSS is imported
# pages/_app.js should have:
# import '../styles/globals.css'

# 5. Verify styles file exists
ls styles/globals.css

# 6. Test with inline styles
# <div style={{color: 'red'}}>Test</div>
# If this works, issue is with Tailwind
```

### Deployment Issues

#### "Vercel Build Fails"

**Symptoms:**
- Deployment fails on Vercel
- Build logs show errors

**Solutions:**
```bash
# 1. Check Vercel logs
# Dashboard → Project → Deployments
# Click failed deployment → Build logs

# 2. Test build locally
cd frontend
npm run build

# 3. Check for missing env vars
# Vercel → Settings → Environment Variables
# Verify all NEXT_PUBLIC_* vars are set

# 4. Verify root directory
# Vercel → Settings → Root Directory
# Should be: `frontend`

# 5. Check Node version
# Vercel → Settings → Node.js Version
# Should match local (16+)

# 6. Clear build cache
# Vercel → Settings → Git
# Disconnect and reconnect
```

#### "Railway Deploy Fails"

**Symptoms:**
- Deployment fails on Railway
- App stuck in crashed state

**Solutions:**
```bash
# 1. Check Railway logs
# Dashboard → Service → View Logs
# Look for error messages

# 2. Verify environment variables
# Dashboard → Service → Variables
# All required vars should be set
# DATABASE_URL should be correct

# 3. Test Dockerfile locally
docker build -t test-api -f backend/Dockerfile backend/
docker run test-api

# 4. Check build command
# Should be: pip install -r requirements.txt

# 5. Check start command
# Should be: gunicorn app:app --workers 4 --worker-class uvicorn.workers.UvicornWorker

# 6. Restart service
# Dashboard → Service → Menu → Restart
```

## Performance Issues

### API Slow Responses

**Symptoms:**
- API calls take >1 second
- Insights generation takes too long

**Solutions:**
```bash
# 1. Check database queries
# Enable query logging in SQLAlchemy
# Look for N+1 queries

# 2. Add indexes
# Database → Run migrations
# Verify indexes exist on common columns

# 3. Profile code
python -m cProfile -s cumulative app.py

# 4. Check Claude API
# Haiku model should respond in <10 seconds
# Check network latency to Anthropic API

# 5. Optimize prompts
# Reduce sample data size
# Simplify prompt in services/claude_insights.py

# 6. Add caching
# Cache insights results
# Avoid re-generating for same data
```

### Frontend Slow Rendering

**Symptoms:**
- Page loads slowly
- Interactions are sluggish

**Solutions:**
```bash
# 1. Check bundle size
# npm run build
# Look for .next/static/chunks

# 2. Reduce imports
# Remove unused libraries
# Use code splitting

# 3. Optimize images
# Use Next.js Image component
# Compress images

# 4. Check network requests
# Browser DevTools → Network
# Look for slow API calls
# Optimize backend responses
```

## Debugging Tools

### Browser DevTools

```javascript
// Check Supabase session
const { data } = await supabase.auth.getSession()
console.log(data.session)

// Check stored data
console.log(localStorage.getItem('sb-access-token'))

// Test API calls
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
```

### Backend Debugging

```python
# Add debug output
import logging
logger = logging.getLogger(__name__)
logger.debug(f"User ID: {user_id}")
logger.info(f"Insights generated: {insight_id}")
logger.error(f"Error: {error}")

# Pretty print JSON
import json
print(json.dumps(data, indent=2))

# Check database
from database import SessionLocal
db = SessionLocal()
users = db.query(User).all()
print(f"Total users: {len(users)}")
```

### SQL Debugging

```sql
-- Check table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'users';

-- Check data
SELECT * FROM users;
SELECT COUNT(*) FROM data_uploads;

-- Check indexes
SELECT * FROM pg_indexes 
WHERE tablename = 'users';

-- Slow query log
EXPLAIN ANALYZE SELECT * FROM data_uploads WHERE user_id = 'xyz';
```

## Getting Help

1. **Check logs** - Frontend console, backend terminal, service dashboards
2. **Read docs** - [SETUP.md](SETUP.md), [API_DOCS.md](API_DOCS.md)
3. **Test locally** - Reproduce issue in local environment
4. **Minimal example** - Create smallest test case
5. **Search online** - Google error message
6. **Check issues** - GitHub issues for similar problems

## Still Stuck?

Include this info when asking for help:
- Error message (full text, not screenshot)
- Steps to reproduce
- Environment (OS, Node version, Python version)
- Terminal logs (copy/paste full output)
- Browser console errors
- Network request/response details
- Environment variables set (not the actual values!)

---

For setup help, see [SETUP.md](SETUP.md)
For API details, see [API_DOCS.md](API_DOCS.md)
For deployment, see [DEPLOYMENT.md](DEPLOYMENT.md)
