# Codebase Summary - Market Research MVP

Complete overview of the generated codebase structure and capabilities.

## Project Overview

**Market Research** is a production-ready MVP for automated market research analysis powered by AI.

### Key Features
- 📊 Upload CSV data for analysis
- 🤖 AI-powered insights generation (Claude Haiku)
- 🔐 Secure authentication (Supabase)
- 💳 Subscription management (Stripe)
- 📱 Responsive modern UI (Next.js + Tailwind)
- 🚀 Ready to deploy (Vercel + Railway/Render)

### Tech Stack
- **Frontend:** Next.js 14, React 18, TailwindCSS, Supabase Auth
- **Backend:** FastAPI, Python 3.11, SQLAlchemy
- **Database:** PostgreSQL
- **AI:** Anthropic Claude Haiku API
- **Payments:** Stripe
- **Hosting:** Vercel (frontend), Railway/Render (backend)

---

## Directory Structure

```
market-research-mvp/
├── backend/                    # FastAPI application
│   ├── app.py                 # Main FastAPI app with routes
│   ├── models.py              # SQLAlchemy database models
│   ├── auth.py                # Supabase authentication logic
│   ├── database.py            # Database connection setup
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example           # Environment variables template
│   ├── Dockerfile             # Docker image definition
│   ├── docker-compose.yml     # Local PostgreSQL setup
│   │
│   ├── routes/                # API endpoint modules
│   │   ├── users.py           # User management endpoints
│   │   ├── uploads.py         # CSV upload endpoints
│   │   ├── insights.py        # AI insights endpoints
│   │   └── subscriptions.py   # Stripe subscription endpoints
│   │
│   └── services/              # Business logic modules
│       ├── csv_processor.py   # CSV parsing and validation
│       ├── claude_insights.py # Claude API integration
│       └── stripe_handler.py  # Stripe webhook handling
│
├── frontend/                  # Next.js application
│   ├── pages/                 # Next.js pages/routes
│   │   ├── _app.js           # App wrapper
│   │   ├── _document.js       # HTML document structure
│   │   ├── index.js           # Home page (landing)
│   │   ├── login.js           # Login/signup page
│   │   └── app/               # Protected app pages
│   │       ├── upload.js      # CSV upload interface
│   │       ├── insights.js    # Insights display
│   │       └── settings.js    # Account & subscription settings
│   │
│   ├── components/            # Reusable React components
│   │   ├── Header.js          # Navigation header
│   │   ├── Auth.js            # Login/signup form
│   │   ├── FileUploader.js    # CSV file upload
│   │   └── InsightDisplay.js  # Insights presentation
│   │
│   ├── lib/                   # Utility modules
│   │   ├── api.js             # Axios API client
│   │   └── supabase.js        # Supabase auth client
│   │
│   ├── styles/
│   │   └── globals.css        # Tailwind + custom styles
│   │
│   ├── package.json           # npm dependencies
│   ├── next.config.js         # Next.js configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── postcss.config.js      # PostCSS configuration
│   └── .env.example           # Environment variables template
│
├── database/                  # Database schemas
│   └── migrations/
│       └── 001_initial_schema.sql  # PostgreSQL schema
│
├── deployment/                # Deployment configurations
│   ├── vercel.json           # Vercel frontend deployment
│   ├── railway.yaml          # Railway backend deployment
│   └── render.yaml           # Render backend deployment
│
├── docs/                      # Documentation
│   ├── API_DOCS.md           # Complete API reference
│   ├── SETUP.md              # Local development setup
│   ├── DEPLOYMENT.md         # Production deployment guide
│   ├── ENV_GUIDE.md          # Environment variables reference
│   └── TROUBLESHOOTING.md    # Common issues & solutions
│
├── README.md                  # Project overview
├── QUICKSTART.md             # 5-minute quick start
├── CODEBASE_SUMMARY.md       # This file
└── .gitignore               # Git ignore rules
```

---

## Backend Architecture

### Database Models

**User**
- `id` (String, UUID from Supabase)
- `email` (String, unique)
- `full_name` (String, optional)
- `subscription_status` (free|trial|active|cancelled)
- `created_at`, `updated_at` (DateTime)
- Relations: uploads (One-to-Many), subscription (One-to-One)

**DataUpload**
- `id` (String, UUID)
- `user_id` (String, FK to User)
- `filename` (String)
- `status` (pending|processing|completed|failed)
- `file_url` (String, S3 or similar)
- `row_count` (Integer)
- `columns` (JSON, list of column names)
- Relations: user, uploaded_data, insights

**UploadedData**
- `id` (String, UUID)
- `upload_id` (String, FK to DataUpload)
- `raw_data` (JSON, first 100 rows)
- `processed_data` (JSON, cleaned data)
- Relations: upload

**InsightAnalysis**
- `id` (String, UUID)
- `upload_id` (String, FK to DataUpload)
- `insights_json` (JSON, full Claude response)
- `summary` (Text)
- `key_findings` (JSON, list)
- `recommendations` (JSON, list)
- `api_tokens_used` (Integer)
- `api_cost` (Float, USD)
- `generated_at` (DateTime)
- Relations: upload

**Subscription**
- `id` (String, UUID)
- `user_id` (String, FK to User, unique)
- `stripe_customer_id` (String, unique)
- `stripe_subscription_id` (String, unique)
- `status` (free|trial|active|cancelled|expired)
- `price_id` (String, Stripe price ID)
- `current_period_start`, `current_period_end` (DateTime)
- `trial_end` (DateTime)
- `cancel_at` (DateTime)
- Relations: user

### API Routes

**Authentication & Users** (`/api/users/*`)
- POST `/signup` - Create new user
- GET `/profile/{user_id}` - Get user profile
- PUT `/profile/{user_id}` - Update profile
- POST `/subscription/create/{user_id}` - Create subscription
- GET `/subscription/{user_id}` - Get subscription status
- GET `/billing-portal/{user_id}` - Get Stripe portal URL

**Uploads** (`/api/uploads/*`)
- POST `/csv/{user_id}` - Upload and process CSV
- GET `/list/{user_id}` - List user uploads
- GET `/detail/{upload_id}` - Get upload details
- DELETE `/delete/{upload_id}` - Delete upload

**Insights** (`/api/insights/*`)
- POST `/generate/{upload_id}` - Generate AI insights
- GET `/detail/{insight_id}` - Get insight details
- GET `/by-upload/{upload_id}` - List insights for upload
- POST `/export/{insight_id}` - Export (JSON/CSV)
- DELETE `/delete/{insight_id}` - Delete insights

**Subscriptions** (`/api/subscriptions/*`)
- POST `/webhook` - Stripe webhook endpoint
- POST `/trial/{user_id}` - Start free trial
- GET `/status/{user_id}` - Get status
- POST `/cancel/{user_id}` - Cancel subscription

### Key Services

**CSVProcessor** (`services/csv_processor.py`)
- Validates file size and format
- Parses CSV with pandas
- Cleans and standardizes data
- Generates preview and statistics
- Converts to dictionary format

**ClaudeInsightGenerator** (`services/claude_insights.py`)
- Creates prompts from data
- Calls Claude Haiku API
- Parses JSON response
- Calculates token usage and cost
- Handles errors gracefully

**StripeHandler** (`services/stripe_handler.py`)
- Creates Stripe customers
- Manages subscriptions and trials
- Handles webhook events
- Manages billing portal URLs
- Verifies webhook signatures

---

## Frontend Architecture

### Pages & Routes

**Public Pages**
- `/` - Landing page with features
- `/login` - Combined login/signup form

**Protected Pages** (require authentication)
- `/app/upload` - Upload CSV files and view uploads
- `/app/insights` - View and manage AI insights
- `/app/settings` - Account, subscription, and profile settings

### Components

**Header** (`components/Header.js`)
- Navigation menu
- User dropdown
- Mobile responsive menu
- Logout functionality

**Auth** (`components/Auth.js`)
- Login/signup form
- Email/password validation
- Supabase integration
- Error handling

**FileUploader** (`components/FileUploader.js`)
- Drag & drop interface
- File validation
- Upload progress
- Error messages

**InsightDisplay** (`components/InsightDisplay.js`)
- Summary section
- Key findings list
- Recommendations list
- Export functionality
- API cost tracking

### Utilities

**API Client** (`lib/api.js`)
- Axios instance with auth interceptor
- Organized endpoints by resource
- User management
- Upload management
- Insights operations
- Subscription operations

**Supabase Client** (`lib/supabase.js`)
- Sign up, sign in, sign out
- Get current user
- Password reset
- Auth state change listener
- Session management

### Styling

**Tailwind CSS** (`styles/globals.css`)
- Professional color scheme
- Reusable utility classes (`.btn-primary`, `.card`, `.input-field`)
- Animations (fade-in, slide-up)
- Responsive grid system
- Custom scrollbar styling

---

## Key Features Implementation

### 1. Authentication Flow
```
User → Frontend Login → Supabase Auth
                          ↓
                    JWT Token Created
                          ↓
                    Token in Browser Storage
                          ↓
                    API Requests Include Bearer Token
                          ↓
                    Backend Verifies with Supabase
```

### 2. CSV Upload & Processing
```
User Uploads File
        ↓
Frontend Validates (size, format)
        ↓
Backend Receives File
        ↓
CSVProcessor Parses & Cleans
        ↓
Stored in UploadedData Table
        ↓
Preview Generated
```

### 3. Insights Generation
```
User Selects Upload
        ↓
Frontend Calls /generate Endpoint
        ↓
Backend Gets Upload Data
        ↓
Claude Gets Prompt + Sample Data
        ↓
Claude Returns Insights JSON
        ↓
Insights Stored in Database
        ↓
Frontend Displays Results
```

### 4. Subscription Management
```
User Clicks "Start Free Trial"
        ↓
Backend Creates Stripe Customer
        ↓
Stripe Subscription Created with 7-Day Trial
        ↓
Webhook Notifies Backend
        ↓
User Status Updated to "trial"
        ↓
After 7 Days or Payment
        ↓
Status → "active" or "cancelled"
```

---

## Deployment Ready

### Frontend (Vercel)
- Next.js optimized
- Environment variables configured
- Build configuration included
- Automatic deployment on push

### Backend (Railway/Render)
- Docker containerized
- Environment variables setup
- Database migrations ready
- Gunicorn WSGI server
- Auto-scaling capable

### Database
- PostgreSQL schema with migrations
- Indexes on foreign keys
- JSONB fields for flexible data
- Timestamp tracking

---

## Security Features

✅ **Authentication**
- Supabase JWT tokens
- Session management
- Automatic logout

✅ **Authorization**
- User-specific data access
- Ownership verification
- Protected routes

✅ **Data Protection**
- HTTPS in production
- CORS restrictions
- Database encryption
- Secure environment variables

✅ **Payment Security**
- Stripe webhook verification
- PCI compliance (via Stripe)
- No direct credit card handling

---

## Testing & Validation

### Backend Validation
- CSV file size limits (50MB max)
- Row count limits (100k max)
- Input sanitization
- Error handling on all endpoints
- Database constraint enforcement

### Frontend Validation
- Email format validation
- Password requirements (6+ chars)
- File type validation
- Network error handling
- Loading states

---

## Performance Optimizations

✅ **Frontend**
- Code splitting (Next.js)
- Image optimization
- CSS minification (Tailwind)
- Lazy loading components

✅ **Backend**
- Database connection pooling
- Query optimization
- Caching ready
- Async operations possible

✅ **API**
- Pagination support
- Efficient data retrieval
- Error responses are fast

---

## Monitoring & Logging

### Frontend Logging
- Browser console errors
- Network request logging
- User action tracking

### Backend Logging
- Request/response logging
- Database query logging
- Error stack traces
- API performance metrics

---

## Customization Points

Easy to customize:
1. **Colors** - Edit `frontend/styles/globals.css` and Tailwind config
2. **Text** - All UI strings in component files
3. **Features** - Add new routes and components
4. **AI Prompts** - Modify in `services/claude_insights.py`
5. **Database** - Add columns to models in `models.py`
6. **API** - Add endpoints in `routes/` directory

---

## Production Checklist

Before deploying:
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Stripe webhook configured
- [ ] CORS_ORIGINS updated
- [ ] FRONTEND_URL set correctly
- [ ] API keys in production services
- [ ] Error tracking setup (optional)
- [ ] Backup strategy defined
- [ ] Monitoring configured
- [ ] Security audit completed

---

## What's NOT Included (But Easy to Add)

- Google Sheets integration (API ready)
- Advanced analytics dashboard
- Team/workspace support
- API rate limiting UI
- Data export formats (PDF, Excel)
- Webhook notifications
- Admin dashboard
- User management UI

---

## Next Steps

1. **Local Development**
   - Follow [QUICKSTART.md](QUICKSTART.md)
   - See [docs/SETUP.md](docs/SETUP.md)

2. **Deployment**
   - Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
   - Configure services

3. **Customization**
   - Update branding (logo, colors)
   - Adjust prompts
   - Add features

4. **Launch**
   - Beta test with users
   - Get feedback
   - Iterate

---

## File Statistics

| Category | Count | LOC |
|----------|-------|-----|
| Backend Routes | 4 | ~800 |
| Backend Services | 3 | ~1000 |
| Backend Core | 3 | ~500 |
| Frontend Pages | 5 | ~1000 |
| Frontend Components | 4 | ~1000 |
| Frontend Lib | 2 | ~300 |
| Configuration | 10+ | ~500 |
| Documentation | 5 | ~5000 |
| **Total** | **~40** | **~10,000+** |

---

## Support & Resources

- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)
- **Setup Guide:** [docs/SETUP.md](docs/SETUP.md)
- **API Docs:** [docs/API_DOCS.md](docs/API_DOCS.md)
- **Deployment:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Troubleshooting:** [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- **Environment Variables:** [docs/ENV_GUIDE.md](docs/ENV_GUIDE.md)

---

## License

MIT License - You can use this codebase commercially.

---

**Built with ❤️ using Next.js, FastAPI, and Claude AI**

Ready to deploy and scale! 🚀
