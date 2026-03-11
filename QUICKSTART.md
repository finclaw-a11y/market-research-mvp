# Quick Start Guide (5 Minutes)

Get Market Research running locally in 5 minutes.

## 1. Prerequisites (You need these)

- Python 3.11+: `python --version`
- Node.js 16+: `node --version`
- Git: `git clone ...`

## 2. Get API Keys (2 minutes)

### Supabase
1. Go to https://supabase.com → Sign up
2. Create project
3. Settings → API → Copy URL and `anon key`

### Stripe (Testing)
1. Go to https://stripe.com → Sign up
2. Developers → API Keys → Copy `Secret key` and `Publishable key`
3. Products → Create product → $99/month → Copy `Price ID`

### Anthropic
1. Go to https://console.anthropic.com → Sign up
2. API Keys → Create key → Copy key

## 3. Setup Backend (2 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Or: venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your keys:
# DATABASE_URL=postgresql://user:password@localhost:5432/market_research
# SUPABASE_URL=your-supabase-url
# SUPABASE_ANON_KEY=your-anon-key
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PRICE_ID=price_...
# ANTHROPIC_API_KEY=sk-ant-...
# FRONTEND_URL=http://localhost:3000
# CORS_ORIGINS=http://localhost:3000
```

**For Database** (if you don't have PostgreSQL):
```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Wait 10 seconds for it to start
sleep 10
```

## 4. Setup Frontend (1 minute)

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Edit .env.local with your keys:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

## 5. Run Everything

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python -m uvicorn app:app --reload
# ✅ Backend running at http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# ✅ Frontend running at http://localhost:3000
```

## 6. Test It

1. Open http://localhost:3000
2. Sign up with test email
3. Go to Settings → Start Free Trial
4. Create test CSV file:
```csv
name,email,age,city
John,john@example.com,25,New York
Jane,jane@example.com,30,Los Angeles
```
5. Upload file
6. View insights
7. ✅ Done!

## 7. Deploy (Optional)

### Frontend → Vercel
```bash
cd frontend
vercel
# Follow prompts
```

### Backend → Railway
1. Go to https://railway.app
2. Create project from GitHub
3. Set environment variables
4. Deploy

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## Troubleshooting

### Database connection error
```bash
# Check Docker is running
docker-compose ps

# If not running
docker-compose up -d
```

### Port already in use
```bash
# Kill process on port 8000
lsof -i :8000 | grep -v PID | awk '{print $2}' | xargs kill -9

# Or use different port
uvicorn app:app --port 8001
```

### API won't start
```bash
# Check all dependencies installed
pip list | grep -E "fastapi|sqlalchemy|stripe|anthropic"

# If missing, reinstall
pip install -r requirements.txt
```

### Frontend won't load
```bash
# Check node modules
npm list | head -20

# If issues, reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS error
Check `CORS_ORIGINS` in `backend/.env` matches frontend URL exactly:
```
CORS_ORIGINS=http://localhost:3000
```

## Full Documentation

- **Setup Details:** [docs/SETUP.md](docs/SETUP.md)
- **API Docs:** [docs/API_DOCS.md](docs/API_DOCS.md)
- **Deployment:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Troubleshooting:** [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- **Environment Variables:** [docs/ENV_GUIDE.md](docs/ENV_GUIDE.md)

## What's Included

✅ **Backend** (FastAPI)
- User authentication (Supabase)
- CSV file upload
- AI insights generation (Claude)
- Stripe subscriptions
- PostgreSQL database

✅ **Frontend** (Next.js)
- Login/Signup
- File upload interface
- Insights display
- Settings & subscription management
- Responsive design

✅ **Infrastructure**
- Docker Compose for local database
- Deployment configs (Vercel, Railway, Render)
- Database migrations
- API documentation
- Complete guides

## Next Steps

1. Customize the UI (logo, colors, text)
2. Add Google Sheets import
3. Setup error tracking (Sentry)
4. Add analytics
5. Deploy to production
6. Share with beta users
7. Iterate based on feedback

## Support

- Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- Read [SETUP.md](docs/SETUP.md) for detailed setup
- Check [API_DOCS.md](docs/API_DOCS.md) for API details
- Review logs in browser console and backend terminal

---

**Enjoy! 🚀**

Built with ❤️ using Next.js, FastAPI, and Claude AI
