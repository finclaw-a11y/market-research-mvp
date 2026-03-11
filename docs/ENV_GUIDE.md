# Environment Variables Guide

Complete reference for all environment variables used in the application.

## Backend Variables

### Database
```
DATABASE_URL=postgresql://user:password@localhost:5432/market_research
```
- PostgreSQL connection string
- Format: `postgresql://username:password@host:port/database`
- Get from: Supabase, AWS RDS, Railway, Render
- Required: Yes
- Example: `postgresql://postgres:secretpass123@db.railway.app:5432/market_research`

### Supabase

```
SUPABASE_URL=https://your-project.supabase.co
```
- Supabase project URL
- Get from: Supabase Dashboard → Settings → API
- Required: Yes (for JWT verification)
- Format: `https://{project-id}.supabase.co`

```
SUPABASE_ANON_KEY=your-anon-key-here
```
- Supabase anonymous key
- Get from: Supabase Dashboard → Settings → API
- Used for: Frontend authentication
- Required: No (for backend)
- Security: Safe to expose in frontend

```
SUPABASE_SERVICE_KEY=your-service-key-here
```
- Supabase service role key
- Get from: Supabase Dashboard → Settings → API
- Used for: Admin operations
- Required: No (optional, for admin tasks)
- Security: Keep secret! Do not expose in frontend

### Stripe

```
STRIPE_SECRET_KEY=sk_test_your_secret_key
```
- Stripe secret API key
- Get from: Stripe Dashboard → Developers → API Keys
- Used for: Backend payment processing
- Required: Yes (for production subscriptions)
- Security: Keep secret! Never commit or expose
- Test mode: `sk_test_...`
- Live mode: `sk_live_...`

```
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```
- Stripe publishable key
- Get from: Stripe Dashboard → Developers → API Keys
- Used for: Frontend payment forms (if any)
- Required: No (not used in current app)
- Security: Safe to expose

```
STRIPE_PRICE_ID=price_1234567890
```
- Stripe price ID for the subscription
- Get from: Stripe Dashboard → Products → Prices
- Used for: Creating subscriptions
- Required: Yes
- Format: `price_...` (test) or `price_...` (live)
- Example: `price_1QOqOPD4eO2x5QlQU0dH9eOi`

```
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```
- Stripe webhook signing secret
- Get from: Stripe Dashboard → Developers → Webhooks (click endpoint)
- Used for: Verifying webhook signatures
- Required: Yes (for payment notifications)
- Security: Keep secret!

### Anthropic (Claude API)

```
ANTHROPIC_API_KEY=sk-ant-your-api-key
```
- Anthropic API key for Claude models
- Get from: [console.anthropic.com](https://console.anthropic.com) → API Keys
- Used for: AI insights generation
- Required: Yes
- Format: `sk-ant-...`
- Security: Keep secret!
- Billing: Pay-as-you-go

### Application Settings

```
FRONTEND_URL=http://localhost:3000
```
- Frontend URL for CORS and redirects
- Local: `http://localhost:3000`
- Production: `https://your-domain.vercel.app`
- Required: Yes
- Used for: CORS configuration, email redirects

```
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```
- Comma-separated list of allowed origins
- Local: `http://localhost:3000`
- Production: `https://your-domain.vercel.app`
- Multiple: `https://example.com,https://www.example.com`
- Required: Yes
- Used for: CORS middleware

```
ALLOWED_HOSTS=localhost,127.0.0.1
```
- Comma-separated list of allowed hosts
- Local: `localhost,127.0.0.1`
- Production: `api.example.com`
- Required: No (defaults shown)
- Used for: TrustedHostMiddleware

```
PORT=8000
```
- Server port
- Local: `8000`
- Production: Usually handled by platform
- Required: No
- Default: `8000`

```
DEBUG=True
```
- Debug mode
- Local: `True`
- Production: `False`
- Required: No
- Default: `False`
- Security: Never `True` in production!

### Optional Services

```
GOOGLE_SHEETS_API_KEY=your-google-sheets-api-key
```
- Google Sheets API key
- Get from: [Google Cloud Console](https://console.cloud.google.com)
- Used for: Google Sheets import (future feature)
- Required: No (not implemented yet)

```
GOOGLE_CLIENT_ID=your-client-id
```
- Google OAuth client ID
- Required: No

```
GOOGLE_CLIENT_SECRET=your-client-secret
```
- Google OAuth client secret
- Required: No

## Frontend Variables

All frontend variables must start with `NEXT_PUBLIC_` to be exposed to browser.

### API Configuration

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
- Backend API URL
- Local: `http://localhost:8000`
- Production: `https://api.example.com` or `https://your-railway-app.com`
- Required: Yes
- Used for: All API calls

### Supabase

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```
- Supabase project URL
- Get from: Supabase Dashboard → Settings → API
- Required: Yes
- Security: Safe to expose (public URL)

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
- Supabase anonymous key
- Get from: Supabase Dashboard → Settings → API
- Required: Yes
- Security: Safe to expose (restricted permissions)

### Stripe

```
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key
```
- Stripe publishable key
- Get from: Stripe Dashboard → Developers → API Keys
- Required: Yes (for Stripe integration)
- Security: Safe to expose
- Format: `pk_test_...` (test) or `pk_live_...` (live)

### Environment

```
NEXT_PUBLIC_ENV=development
```
- Environment identifier
- Options: `development`, `staging`, `production`
- Required: No
- Used for: Feature flags, logging levels

## Environment Examples

### Local Development

**backend/.env:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/market_research
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
STRIPE_SECRET_KEY=sk_test_12345
STRIPE_PRICE_ID=price_test_12345
STRIPE_WEBHOOK_SECRET=whsec_test_12345
ANTHROPIC_API_KEY=sk-ant-xxx
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
DEBUG=True
```

**frontend/.env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_12345
NEXT_PUBLIC_ENV=development
```

### Production (Vercel + Railway)

**Backend (Railway):**
```
DATABASE_URL=postgresql://user:pass@db.railway.app:5432/market_research
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
STRIPE_SECRET_KEY=sk_live_xxxxxxx
STRIPE_PRICE_ID=price_1QOqOPxxx
STRIPE_WEBHOOK_SECRET=whsec_live_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
FRONTEND_URL=https://myapp.vercel.app
CORS_ORIGINS=https://myapp.vercel.app
DEBUG=False
```

**Frontend (Vercel):**
```
NEXT_PUBLIC_API_URL=https://api.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxxxxxx
NEXT_PUBLIC_ENV=production
```

## Getting Each Variable

### Supabase

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_KEY`

### Stripe

1. Go to [stripe.com/test](https://stripe.com/test)
2. Go to Developers → API Keys
3. Copy:
   - **Secret key** → `STRIPE_SECRET_KEY`
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`

4. Create price:
   - Go to Products → Create product
   - Set price to $99/month
   - Copy **Price ID** → `STRIPE_PRICE_ID`

5. Create webhook:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-api.com/api/subscriptions/webhook`
   - Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Anthropic

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Go to API Keys
3. Create new key
4. Copy → `ANTHROPIC_API_KEY`

### Database

**Supabase:**
1. Project → Settings → Database
2. Copy connection string

**Railway:**
1. Dashboard → PostgreSQL service
2. Copy connection string from variables

**Render:**
1. Dashboard → PostgreSQL database
2. Copy Internal Database URL

**Local Docker:**
```
postgresql://user:password@localhost:5432/market_research
```

## Security Best Practices

### Do's ✅
- ✅ Use `.env` files for secrets
- ✅ Add `.env` to `.gitignore`
- ✅ Use `NEXT_PUBLIC_` prefix for frontend-only vars
- ✅ Rotate keys regularly
- ✅ Use different keys for test/production
- ✅ Store secrets in platform's secret manager
- ✅ Use environment-specific values
- ✅ Keep service keys private

### Don'ts ❌
- ❌ Never commit `.env` files to git
- ❌ Never expose `sk_` keys in frontend
- ❌ Never share keys in emails/Slack
- ❌ Don't use same key for test and production
- ❌ Never hardcode secrets in code
- ❌ Don't commit example values to production
- ❌ Never log secret values
- ❌ Don't use weak passwords

## Troubleshooting

### "Invalid Supabase credentials"
- Check URL and keys are copied correctly
- Make sure you're using `anon` key, not `service_role`
- Keys might be expired, try creating new ones

### "Stripe API key not valid"
- Verify `STRIPE_SECRET_KEY` starts with `sk_test_` or `sk_live_`
- Check key hasn't been revoked
- Try creating new key in Stripe dashboard

### "CORS error on API calls"
- Check `FRONTEND_URL` matches exactly
- Make sure `CORS_ORIGINS` includes frontend URL
- Check for port mismatch (3000 vs 3001)

### "DATABASE_URL invalid"
- Verify connection string format: `postgresql://user:password@host:port/db`
- Check password doesn't contain special chars (URL encode if needed)
- Verify database exists and is accessible
- Check firewall allows connections

### "Claude API key rejected"
- Verify key starts with `sk-ant-`
- Check account has available credits
- Make sure key hasn't been revoked
- Try creating new key

## Variable Validation

Use this checklist before deploying:

Backend:
- [ ] `DATABASE_URL` - Can connect to DB
- [ ] `SUPABASE_URL` - Valid Supabase URL
- [ ] `STRIPE_SECRET_KEY` - Starts with `sk_`
- [ ] `ANTHROPIC_API_KEY` - Starts with `sk-ant-`
- [ ] `FRONTEND_URL` - Matches frontend domain
- [ ] `CORS_ORIGINS` - Includes frontend domain

Frontend:
- [ ] `NEXT_PUBLIC_API_URL` - Points to API backend
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Valid Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Not service key
- [ ] `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Starts with `pk_`

---

For setup instructions, see [SETUP.md](SETUP.md)
For deployment, see [DEPLOYMENT.md](DEPLOYMENT.md)
