# Supabase Database Setup Guide

Complete step-by-step guide for setting up your Supabase database.

**Time required:** 5-10 minutes

---

## WHAT IS SUPABASE?

Supabase provides:
- **Database:** PostgreSQL (where your data lives)
- **Authentication:** User signup/login
- **Storage:** File storage
- **Real-time:** Live data updates

For this app, we use Database + Authentication.

---

## STEP 1: CREATE SUPABASE ACCOUNT

1. Go to: https://supabase.com
2. Click **"Sign Up"** (top right)
3. Create account with:
   - Email address
   - Password (save it)
   - Or use GitHub login

---

## STEP 2: CREATE PROJECT

1. After signing up, go to: https://app.supabase.com
2. Click **"New Project"** (or **"Create a new project"**)
3. Fill in project details:

**Project Name:**
```
market-research-mvp
```

**Database Password:**
```
Create a strong password (at least 16 chars)
SAVE THIS PASSWORD - you'll need it
```

**Region:**
- Choose closest to you (e.g., us-east-1 for USA)
- Or leave default

4. Click **"Create new project"**

**This takes 2-3 minutes.** A progress bar will show.

---

## STEP 3: WAIT FOR PROJECT CREATION

While waiting:
- Don't close the page
- Watch for progress updates
- Should see "Provisioning PostgreSQL database..."

Once complete:
- You'll see dashboard
- Don't navigate away yet

---

## STEP 4: GET YOUR API KEYS

Once your project is created:

1. Go to: **Settings** (left sidebar)
2. Click: **"API"**
3. You'll see your credentials:

**Copy these 3 values into your ENVIRONMENT_VARIABLES_CHECKLIST.txt:**

```
SUPABASE_URL = https://your-project-id.supabase.co
(This is "Project URL" field)

SUPABASE_ANON_KEY = eyJ...
(This is "anon public" field)

SUPABASE_SERVICE_KEY = eyJ...
(This is "service_role secret" field)
```

**Keep these safe!** Don't share or commit them.

---

## STEP 5: GET DATABASE CONNECTION STRING

You'll need the database connection string for the backend.

1. Go to: **Settings** (left sidebar)
2. Click: **"Database"**
3. Look for: **"Connection pooling"** or **"Connection string"**
4. Click: **"Connection pooling"** (recommended)
5. Select: **"URI"** format
6. Copy the connection string

It looks like:
```
postgresql://postgres:password@db.your-id.supabase.co:5432/postgres
```

**Important:** Replace `[YOUR-PASSWORD]` with the password you created in Step 2.

Save this as `DATABASE_URL` in your checklist.

---

## STEP 6: CREATE DATABASE TABLES

Now you need to create tables where your data will live.

1. In Supabase, go to: **SQL Editor** (left sidebar)
2. Click: **"New Query"** (top right)
3. Paste this entire SQL code:

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

4. Once pasted, click **"RUN"** button (blue, top right)
5. Wait for confirmation

You should see:
```
✓ Success
```

---

## STEP 7: VERIFY TABLES CREATED

Let's confirm all tables were created successfully.

1. Go to: **Table Editor** (left sidebar)
2. You should see a list of tables on the left:
   - ✅ `users`
   - ✅ `data_uploads`
   - ✅ `uploaded_data`
   - ✅ `insight_analysis`
   - ✅ `subscriptions`

3. Click each table to view its structure

**All 5 tables should be there.** If not, check the SQL output for errors.

---

## STEP 8: CONFIGURE AUTHENTICATION

Supabase handles user signup/login. We need to configure it.

### 8.1: Enable Email Authentication

1. Go to: **Authentication** (left sidebar)
2. Click: **"Providers"** (if not already there)
3. Find: **"Email"**
4. Make sure it's **"Enabled"** (toggle should be ON)

You should see:
```
Email ✓ Enabled
```

### 8.2: Confirm Email Settings

1. Still in Authentication section
2. Look for settings like:
   - Confirm email: You can leave as default
   - Auto confirm users: Leave OFF (require email confirmation)

These defaults are fine.

---

## STEP 9: ENABLE ROW LEVEL SECURITY (Optional but Recommended)

Row Level Security (RLS) makes your database more secure.

1. Go to: **Authentication** → **Policies**
2. Or go to: **SQL Editor** and create custom policies

**For now, you can skip this.** The app will work without it.

**For production, enable RLS to prevent users from accessing other users' data.**

---

## STEP 10: SETUP STORAGE (Optional)

Storage is for uploading files. For this app, we store CSV files.

1. Go to: **Storage** (left sidebar)
2. Click: **"Create a new bucket"**
3. Name: `uploads`
4. Make it **"Public"** or **"Private"** (private is more secure)
5. Click **"Create bucket"**

This creates a storage bucket for file uploads.

---

## STEP 11: VERIFY DATABASE CONNECTION

Test that the database works:

1. Go to: **SQL Editor**
2. Click: **"New Query"**
3. Paste this simple test query:

```sql
SELECT 1 AS connection_test;
```

4. Click **"RUN"**
5. You should see:
```
✓ Success
connection_test
1
```

This confirms your database is working!

---

## STEP 12: CONNECTION CHECKLIST

Before moving to deployment, verify:

- [ ] Project created and accessible
- [ ] API keys copied (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY)
- [ ] DATABASE_URL obtained (with password)
- [ ] All 5 tables created:
  - [ ] users
  - [ ] data_uploads
  - [ ] uploaded_data
  - [ ] insight_analysis
  - [ ] subscriptions
- [ ] Email authentication enabled
- [ ] Test query runs successfully

---

## TROUBLESHOOTING

### "Cannot connect to database"

**Problem:** Connection string invalid

**Solution:**
1. Check password is correct
2. Check project URL is correct
3. Verify you copied the URI (not the psql command)
4. Make sure you replaced `[YOUR-PASSWORD]` with actual password

---

### "Table already exists" error

**Problem:** Running SQL and it says table already exists

**Solution:**
- This is OK! SQL uses `IF NOT EXISTS`
- Just means table was created before
- Safe to run again

---

### "Permission denied" error

**Problem:** Can't create table or insert data

**Solution:**
1. Check you're using correct credentials
2. Check role has proper permissions
3. For development, use your main credentials
4. In production, create separate read/write roles

---

### "Column type not recognized"

**Problem:** Error during table creation

**Solution:**
1. Check you copied SQL correctly
2. Make sure there are no typos
3. Try running line by line instead of all at once
4. Check PostgreSQL version is 12+

---

### Can't find API keys

**Problem:** Can't locate SUPABASE_URL and anon key

**Solution:**
1. Go to: Settings → API
2. Look for **"Project URL"** - this is SUPABASE_URL
3. Look for **"anon public"** - this is SUPABASE_ANON_KEY
4. Don't confuse with "service_role secret"

---

## REFERENCE: TABLE STRUCTURE

### Users Table
```
id (primary key) | email (unique) | full_name | subscription_status | created_at | updated_at
```

### Data Uploads Table
```
id | user_id | filename | status | file_url | row_count | columns | created_at | updated_at
```

### Uploaded Data Table
```
id | upload_id | raw_data | processed_data | created_at
```

### Insight Analysis Table
```
id | upload_id | insights_json | summary | key_findings | recommendations | api_tokens_used | api_cost | generated_at
```

### Subscriptions Table
```
id | user_id | stripe_customer_id | stripe_subscription_id | status | price_id | current_period_start | current_period_end | trial_end | cancel_at | created_at | updated_at
```

---

## SUPABASE FEATURES TO EXPLORE

Beyond this guide, Supabase has:

- **Real-time:** Get live updates when data changes
- **Edge Functions:** Run serverless code
- **Webhooks:** Trigger actions on data changes
- **Backups:** Automatic daily backups
- **Monitoring:** View query performance

For now, we just need the basic database.

---

## NEXT STEPS

1. ✅ Supabase project created
2. ✅ Database tables created
3. ✅ API keys obtained
4. ➡️ Use these keys in RAILWAY_SETUP_GUIDE.md
5. Deploy backend to Railway
6. Deploy frontend to Vercel

---

## QUICK REFERENCE

**Supabase Dashboard:**
- Go to: https://app.supabase.com
- Settings → API: Get keys
- Settings → Database: Get connection string
- Table Editor: View/edit data
- SQL Editor: Run queries
- Authentication: Manage auth providers

**Important Values:**
```
SUPABASE_URL = https://your-id.supabase.co
SUPABASE_ANON_KEY = eyJ... (safe to expose)
SUPABASE_SERVICE_KEY = eyJ... (keep secret)
DATABASE_URL = postgresql://postgres:password@db.your-id.supabase.co:5432/postgres
```

**Don't forget:**
- ✅ Save your database password
- ✅ Copy API keys to checklist
- ✅ Create all 5 tables
- ✅ Enable email auth
- ✅ Test connection

---

**Database is ready! Move to RAILWAY_SETUP_GUIDE.md next.**
