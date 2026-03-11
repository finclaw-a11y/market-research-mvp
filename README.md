# Market Research - AI-Powered Analysis Tool

Automated market research tool that uses AI to generate instant insights from your data.

## Features

- 📊 **CSV Upload**: Easy drag-and-drop file upload
- 🤖 **AI Analysis**: Claude API-powered insights generation
- 🔐 **Secure**: Supabase authentication with JWT tokens
- 💳 **Payments**: Stripe subscriptions with free trial
- 📱 **Responsive**: Mobile-friendly interface
- 📈 **Analytics**: Comprehensive data analysis and reporting

## Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TailwindCSS** - Styling
- **Supabase Auth** - Authentication
- **Axios** - HTTP client
- **Recharts** - Data visualization

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **Stripe** - Payment processing
- **Anthropic Claude** - AI insights generation

### Infrastructure
- **Vercel** - Frontend hosting
- **Railway/Render** - Backend hosting
- **Supabase** - Authentication & database
- **Stripe** - Payment processing
- **Anthropic** - AI API

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.11+
- PostgreSQL 13+
- Git

### Local Development Setup

#### 1. Clone and Setup Directory

```bash
cd market-research-mvp
```

#### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your credentials
```

#### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your credentials
```

#### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn app:app --reload
# API runs at http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs at http://localhost:3000
```

**Terminal 3 (Optional) - Database:**
```bash
cd backend
docker-compose up
# PostgreSQL runs at localhost:5432
```

### Required Environment Variables

See `.env.example` files in `backend/` and `frontend/` directories.

Key variables needed:
- Supabase credentials (URL, anon key, service key)
- Stripe keys (secret key, publishable key, price ID, webhook secret)
- Anthropic API key
- Database URL
- Frontend URL for CORS

## Project Structure

```
market-research-mvp/
├── backend/
│   ├── app.py                 # Main FastAPI application
│   ├── models.py              # SQLAlchemy database models
│   ├── auth.py                # Supabase authentication
│   ├── database.py            # Database setup
│   ├── routes/                # API endpoints
│   │   ├── users.py
│   │   ├── uploads.py
│   │   ├── insights.py
│   │   └── subscriptions.py
│   ├── services/              # Business logic
│   │   ├── csv_processor.py
│   │   ├── claude_insights.py
│   │   └── stripe_handler.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env.example

├── frontend/
│   ├── pages/
│   │   ├── _app.js
│   │   ├── _document.js
│   │   ├── index.js           # Home page
│   │   ├── login.js
│   │   └── app/
│   │       ├── upload.js
│   │       ├── insights.js
│   │       └── settings.js
│   ├── components/
│   │   ├── Header.js
│   │   ├── FileUploader.js
│   │   ├── InsightDisplay.js
│   │   └── Auth.js
│   ├── lib/
│   │   ├── api.js             # API client
│   │   └── supabase.js        # Auth client
│   ├── styles/
│   │   └── globals.css
│   ├── package.json
│   ├── next.config.js
│   ├── .env.example
│   └── vercel.json

├── database/
│   └── migrations/
│       └── 001_initial_schema.sql

├── deployment/
│   ├── vercel.json
│   ├── railway.yaml
│   └── render.yaml

└── docs/
    ├── API_DOCS.md
    ├── SETUP.md
    ├── DEPLOYMENT.md
    ├── ENV_GUIDE.md
    └── TROUBLESHOOTING.md
```

## API Endpoints

### Users
- `POST /api/users/signup` - Create new user
- `GET /api/users/profile/{user_id}` - Get user profile
- `PUT /api/users/profile/{user_id}` - Update profile
- `POST /api/users/subscription/create/{user_id}` - Create subscription
- `GET /api/users/subscription/{user_id}` - Get subscription status
- `GET /api/users/billing-portal/{user_id}` - Get Stripe portal URL

### Uploads
- `POST /api/uploads/csv/{user_id}` - Upload CSV file
- `GET /api/uploads/list/{user_id}` - List user uploads
- `GET /api/uploads/detail/{upload_id}` - Get upload details
- `DELETE /api/uploads/delete/{upload_id}` - Delete upload

### Insights
- `POST /api/insights/generate/{upload_id}` - Generate AI insights
- `GET /api/insights/detail/{insight_id}` - Get insight details
- `GET /api/insights/by-upload/{upload_id}` - List insights for upload
- `POST /api/insights/export/{insight_id}` - Export insights (JSON/CSV)
- `DELETE /api/insights/delete/{insight_id}` - Delete insights

### Subscriptions
- `POST /api/subscriptions/webhook` - Stripe webhook endpoint
- `POST /api/subscriptions/trial/{user_id}` - Start free trial
- `GET /api/subscriptions/status/{user_id}` - Get subscription status
- `POST /api/subscriptions/cancel/{user_id}` - Cancel subscription

## Deployment

### Deploy Frontend to Vercel

```bash
cd frontend
npm run build
vercel deploy
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repo
4. Configure environment variables
5. Deploy

Or use Railway CLI:
```bash
npm i -g @railway/cli
railway link
railway up
```

### Deploy Backend to Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Configure environment variables
5. Deploy

### Database Setup

1. Create PostgreSQL database (Supabase, AWS RDS, Railway, etc.)
2. Set `DATABASE_URL` environment variable
3. Migrations run automatically on app startup

## Authentication Flow

1. User signs up via Supabase Auth on `/login`
2. Supabase creates JWT token
3. Frontend stores token in localStorage
4. API requests include `Authorization: Bearer {token}` header
5. Backend verifies token with Supabase

## Stripe Integration

### Free Trial
- 7-day free trial on signup
- No credit card required
- Automatic upgrade to paid plan after trial

### Subscription
- $99/month for unlimited access
- Webhook handler for payment events
- Customer portal for managing subscriptions

### Setup Stripe

1. Create Stripe account at [stripe.com](https://stripe.com)
2. Create price for $99/month plan
3. Set `STRIPE_PRICE_ID` environment variable
4. Create webhook endpoint
5. Set `STRIPE_WEBHOOK_SECRET` environment variable

## Cost Breakdown (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Supabase | $5-25 | Auth, database, storage |
| Stripe | 2.9% + $0.30 | Payment processing |
| Claude API | $0.80 - $10 | Per API calls (Haiku model) |
| Vercel | Free - $20 | Frontend hosting |
| Railway/Render | $7 - $20 | Backend hosting |
| **Total** | **$20 - $75** | Scales with usage |

## Troubleshooting

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common issues and solutions.

## Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Review API logs in backend
3. Check browser console for frontend errors
4. Review Stripe/Supabase dashboards

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**Built with ❤️ using Next.js, FastAPI, and Claude AI**
