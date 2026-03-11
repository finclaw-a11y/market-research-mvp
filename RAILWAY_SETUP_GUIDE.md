# Railway Backend Deployment Guide

Complete step-by-step guide for deploying the backend to Railway.

**Time required:** 5-10 minutes

---

## PREREQUISITES

Before starting, you need:

- [ ] Railway account (https://railway.app) - already signed up
- [ ] GitHub account (https://github.com)
- [ ] Repository pushed to GitHub
- [ ] Environment variables ready (see ENVIRONMENT_VARIABLES_CHECKLIST.txt)

---

## STEP 1: LOGIN TO RAILWAY

1. Go to: https://railway.app
2. Click **"Login"**
3. Choose your login method:
   - GitHub
   - Google
   - Email
4. Complete login

You should see the Railway dashboard.

---

## STEP 2: CREATE NEW PROJECT

1. On Railway dashboard, click **"New Project"** (top right)
2. You'll see options:
   - **Deploy from GitHub**
   - **Deploy from Template**
   - **Create Empty Project**

3. Click **"Deploy from GitHub"**

---

## STEP 3: CONNECT GITHUB ACCOUNT (First Time Only)

If this is your first time, Railway needs permission to access your GitHub.

1. Click **"Connect GitHub"** button
2. GitHub will ask for authorization
3. Click **"Authorize Railway"**
4. GitHub will ask which repositories to allow
5. Select: **"Only select repositories"**
6. Choose: `market-research-mvp` (or whichever repo you're using)
7. Click **"Install & Authorize"**

You'll be redirected to Railway.

---

## STEP 4: SELECT REPOSITORY

1. You should see a list of your GitHub repositories
2. Find and click: **`market-research-mvp`** (or your repo name)
3. Click **"Deploy"**

Railway will import your repo. Wait 10-30 seconds.

---

## STEP 5: CONFIGURE DEPLOYMENT SETTINGS

Railway will show your project. You'll see a section for configuration.

### 5.1: Set Root Directory

This tells Railway which folder contains the backend code.

1. Look for **"Settings"** (might be a gear icon or tab)
2. Find **"Root Directory"** field
3. Enter: `backend`
4. Click **"Save"** or press Enter

### 5.2: Configure Environment

1. Look for **"Variables"** or **"Environment Variables"** section
2. Click **"Add Variable"** (or similar button)

You'll see a form to add variables. Add them one by one:

**Important:** Copy values from your ENVIRONMENT_VARIABLES_CHECKLIST.txt file.

---

## STEP 6: ADD ENVIRONMENT VARIABLES

Add each variable exactly as shown. Copy values from your checklist.

### Database Variables

1. Click **"Add Variable"**
   - Key: `DATABASE_URL`
   - Value: `postgresql://postgres:YOUR_PASSWORD@db.YOUR_ID.supabase.co:5432/postgres`
   - Click **"Add"** or **"Save"**

**Where to get DATABASE_URL:**
- Go to Supabase → Settings → Database
- Click "Connection pooling"
- Copy URI format connection string

### Supabase Variables

2. Click **"Add Variable"**
   - Key: `SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Click **"Save"**

3. Click **"Add Variable"**
   - Key: `SUPABASE_ANON_KEY`
   - Value: (Copy from Supabase API settings)
   - Click **"Save"**

4. Click **"Add Variable"**
   - Key: `SUPABASE_SERVICE_KEY`
   - Value: (Copy from Supabase API settings)
   - Click **"Save"**

### Stripe Variables

5. Click **"Add Variable"**
   - Key: `STRIPE_SECRET_KEY`
   - Value: `sk_test_XXXXX` (your test secret key)
   - Click **"Save"**

6. Click **"Add Variable"**
   - Key: `STRIPE_PUBLISHABLE_KEY`
   - Value: `pk_test_XXXXX` (your test publishable key)
   - Click **"Save"**

7. Click **"Add Variable"**
   - Key: `STRIPE_PRICE_ID`
   - Value: `price_XXXXX` (your price ID)
   - Click **"Save"**

8. Click **"Add Variable"**
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_XXXXX` (your webhook secret)
   - Click **"Save"**

### Anthropic Variables

9. Click **"Add Variable"**
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-XXXXX` (your API key)
   - Click **"Save"**

### Application Variables

10. Click **"Add Variable"**
    - Key: `FRONTEND_URL`
    - Value: Leave empty for now (you'll set this after Vercel deployment)
    - Click **"Save"**

11. Click **"Add Variable"**
    - Key: `CORS_ORIGINS`
    - Value: Leave empty for now (you'll set this after Vercel deployment)
    - Click **"Save"**

12. Click **"Add Variable"**
    - Key: `DEBUG`
    - Value: `False`
    - Click **"Save"**

13. Click **"Add Variable"**
    - Key: `PORT`
    - Value: `8000`
    - Click **"Save"**

---

## STEP 7: START DEPLOYMENT

Once all variables are added:

1. Look for **"Deploy"** button
2. Click it
3. Railway starts building and deploying

**This takes 3-5 minutes.** You'll see:
- `Build starting...`
- `Building...`
- `Build complete`
- `Deployment complete`

---

## STEP 8: MONITOR DEPLOYMENT

1. You'll see a **"Deployments"** tab or section
2. Click it to see deployment status
3. Watch the logs scroll by
4. Wait for green checkmark or "Success" message

**Common messages you'll see:**
```
Cloning repository...
Installing dependencies...
Running pip install...
Building application...
Starting application...
Application started on port 8000
```

**If you see errors:**
- Check that all variables are entered correctly
- Check that `backend` is set as root directory
- Look at error messages - they often tell you what's wrong

---

## STEP 9: GET YOUR BACKEND URL

Once deployment is complete:

1. Go to **"Settings"** or **"Environment"** tab
2. Look for **"Public URL"** or **"Deployment URL"**
3. Copy this URL (looks like: `https://project-abc123.railway.app`)
4. **Save this URL - you'll need it for Vercel**

**Example:**
```
https://market-research-mvp.railway.app
```

---

## STEP 10: TEST BACKEND IS WORKING

1. Take your Railway URL from Step 9
2. Open it in browser: `https://your-railway-url.railway.app`
3. You should see:
   - JSON response or error message (not blank page)
   - No "Connection refused"

**Try accessing the health endpoint:**
```
https://your-railway-url.railway.app/api/health
```

You should see: `200 OK` or similar.

---

## STEP 11: UPDATE FRONTEND_URL AND CORS_ORIGINS

After you deploy to Vercel, you'll come back and update these.

1. Go back to Railway → Your Project → **Variables**
2. Find `FRONTEND_URL` variable
3. Update value to: `https://your-vercel-app.vercel.app` (from Vercel deployment)
4. Find `CORS_ORIGINS` variable
5. Update value to: `https://your-vercel-app.vercel.app` (same as FRONTEND_URL)
6. Save changes

Railway will automatically redeploy with new variables.

---

## TROUBLESHOOTING

### Build fails with "Module not found"

**Problem:** Error during `pip install`

**Solution:**
1. Check `requirements.txt` exists in `backend/` folder
2. Check all dependencies are spelled correctly
3. Try redeploying (click Deploy button again)

---

### Deployment stuck on "Building"

**Problem:** Takes longer than 5 minutes

**Solution:**
1. Wait a bit longer (sometimes it takes 10 minutes)
2. If >15 minutes, check logs for errors
3. Cancel and try again

---

### "Public URL" not showing

**Problem:** Can't find your Railway URL

**Solution:**
1. Go to **Settings** tab
2. Scroll down to **"Public URL"** or **"Domain"**
3. If still not there, check deployment status
4. May need to wait for deployment to complete

---

### Backend gives 502 Bad Gateway

**Problem:** `https://your-url.railway.app` returns 502

**Solution:**
1. Deployment might still be in progress
2. Wait 5 minutes and refresh
3. Check logs for Python errors
4. Ensure all environment variables are set

---

### "Cannot find module" error in logs

**Problem:** Error mentions missing Python package

**Solution:**
1. Check `requirements.txt` is in `backend/` folder
2. Check spelling of package names
3. Make sure `backend` is set as root directory
4. Redeploy

---

### API doesn't respond to requests

**Problem:** Frontend gets "Connection refused" or timeout

**Solution:**
1. Check FRONTEND_URL and CORS_ORIGINS are set
2. Check they match your Vercel URL exactly
3. Check frontend is making requests to correct URL
4. Redeploy to apply new CORS settings

---

### Stripe webhook not working

**Problem:** Payments don't trigger webhooks

**Solution:**
1. Check STRIPE_WEBHOOK_SECRET is correct
2. Update webhook endpoint in Stripe dashboard to: `https://your-railway-url.railway.app/api/subscriptions/webhook`
3. Check Stripe test mode is ON
4. Webhook signing secret must match STRIPE_WEBHOOK_SECRET

---

## VERIFICATION CHECKLIST

Before moving to Vercel deployment, verify:

- [ ] Deployment shows "Success" or green checkmark
- [ ] No errors in deployment logs
- [ ] `https://your-railway-url.railway.app` loads (gives response, not blank)
- [ ] All environment variables are set (check Variables page)
- [ ] PUBLIC_URL/domain is visible and copied
- [ ] No red errors in logs

---

## NEXT STEPS

1. ✅ Backend is now deployed on Railway
2. ➡️ Go to VERCEL_SETUP_GUIDE.md
3. Deploy frontend to Vercel
4. Come back and update FRONTEND_URL and CORS_ORIGINS
5. Test everything end-to-end

---

## QUICK REFERENCE

**Railway Dashboard:**
- Login: https://railway.app
- Your project: https://railway.app/project/YOUR_PROJECT_ID
- Deployments: Check status here
- Variables: Add/edit environment variables
- Settings: Configure root directory, public URL
- Logs: Debugging and monitoring

**Common Commands (if using Railway CLI):**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Link project
railway link

# View logs
railway logs

# Deploy
railway up
```

---

**You're ready to deploy! Move to VERCEL_SETUP_GUIDE.md next.**
