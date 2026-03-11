# Vercel Frontend Deployment Guide

Complete step-by-step guide for deploying the frontend to Vercel.

**Time required:** 5 minutes

---

## PREREQUISITES

Before starting, you need:

- [ ] Vercel account (https://vercel.com) - already signed up
- [ ] GitHub account (https://github.com)
- [ ] Repository pushed to GitHub
- [ ] Environment variables ready (see ENVIRONMENT_VARIABLES_CHECKLIST.txt)
- [ ] Railway backend deployed (RAILWAY_SETUP_GUIDE.md completed)

---

## STEP 1: LOGIN TO VERCEL

1. Go to: https://vercel.com
2. Click **"Log In"** (top right)
3. Click **"GitHub"** to sign in with GitHub
4. Authorize Vercel if asked

You should see the Vercel dashboard.

---

## STEP 2: CREATE NEW PROJECT

1. On dashboard, click **"Add New..."** (top left)
2. Select **"Project"**
3. You'll see: **"Import Git Repository"**

---

## STEP 3: SELECT YOUR GITHUB REPOSITORY

1. You should see a list of your GitHub repos
2. Find: **`market-research-mvp`** (or your repo name)
3. Click the repo name

If you don't see your repo:
- Click **"Search"** and type `market-research-mvp`
- Or authorize Vercel to see more repos

---

## STEP 4: CONFIGURE PROJECT SETTINGS

Once you've selected the repo, Vercel shows configuration options.

### 4.1: Framework Selection

Look for **"Framework Preset"** or **"Select Framework"**:

1. Click dropdown
2. Select: **"Next.js"**
3. Vercel auto-detects remaining settings

### 4.2: Root Directory

Look for **"Root Directory"**:

1. Click the field
2. Clear current value (if any)
3. Enter: `frontend`
4. Press Tab or click away

This tells Vercel that your Next.js app is in the `frontend/` folder.

### 4.3: Build Command

Leave as default (should auto-detect):
- `npm run build`

### 4.4: Output Directory

Leave as default (should be):
- `.next` (or auto-detected)

### 4.5: Install Command

Leave as default:
- `npm install`

---

## STEP 5: DEPLOY

Once settings look correct:

1. Click **"Deploy"** button (blue, bottom right)
2. Vercel starts building and deploying
3. Wait for "Ready" status (takes 2-5 minutes)

You'll see:
```
Building...
✓ Build completed
Deployments are live
```

---

## STEP 6: MONITOR BUILD PROGRESS

While deploying:

1. You'll see real-time logs
2. Watch for any errors (red text)
3. Wait for green checkmark or "Ready" message

**Common build steps:**
```
Installing dependencies...
Running next build...
Generating static pages...
Build completed
```

If the build fails, it will show an error message.

---

## STEP 7: GET YOUR FRONTEND URL

Once deployment is complete:

1. You'll see **"Congratulations!"** message
2. Find **"Visit"** button (blue)
3. Copy the URL shown (looks like: `https://project-name.vercel.app`)
4. **Save this URL - you'll need it**

**Example:**
```
https://market-research-mvp.vercel.app
```

---

## STEP 8: TEST FRONTEND LOADS

1. Click **"Visit"** button
2. You should see the **login page**
3. Check for:
   - ✅ Email input field
   - ✅ Password input field
   - ✅ Sign Up button
   - ✅ Sign In button

**If you see blank page:**
- Wait 30 seconds (Vercel is still loading)
- Refresh page (Ctrl+R or Cmd+R)
- Check browser console (F12) for errors

---

## STEP 9: ADD ENVIRONMENT VARIABLES

Now you need to add environment variables so the frontend can connect to the backend.

### 9.1: Go to Environment Variables Settings

1. In Vercel dashboard, go to: **Settings** (top navigation)
2. Go to: **"Environment Variables"** (left sidebar)

### 9.2: Add Each Variable

For each variable, click **"Add New..."** and fill in:

**Variable 1: API URL**
- Name: `NEXT_PUBLIC_API_URL`
- Value: `https://YOUR_RAILWAY_URL.railway.app` (from Railway deployment)
- Environments: Select all (Development, Preview, Production)
- Click **"Save"**

**Variable 2: Supabase URL**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://your-project.supabase.co` (from Supabase)
- Environments: Select all
- Click **"Save"**

**Variable 3: Supabase Key**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: Your Supabase anon key (from ENVIRONMENT_VARIABLES_CHECKLIST.txt)
- Environments: Select all
- Click **"Save"**

**Variable 4: Stripe Public Key**
- Name: `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- Value: `pk_test_XXXXX` (your publishable key)
- Environments: Select all
- Click **"Save"**

**Variable 5: Environment**
- Name: `NEXT_PUBLIC_ENV`
- Value: `production`
- Environments: Select all
- Click **"Save"**

---

## STEP 10: TRIGGER REDEPLOY

After adding variables, Vercel needs to rebuild with them.

1. Go to: **"Deployments"** tab
2. Find the most recent deployment
3. Click the three dots (...) menu
4. Select **"Redeploy"** (or similar option)
5. Confirm

Wait for new deployment to complete (2-3 minutes).

---

## STEP 11: VERIFY FRONTEND WORKS

1. Click **"Visit"** to go to your frontend
2. You should see **login page**
3. Try signing up with test email
4. Check for errors in browser console (F12)

**Expected:**
- ✅ Page loads
- ✅ No CORS errors
- ✅ No "Cannot reach API" messages
- ✅ Signup form works

**If error about API:**
- Check NEXT_PUBLIC_API_URL matches your Railway URL exactly
- Redeploy again after fixing
- Wait 5 minutes for new deployment

---

## STEP 12: VERIFY BACKEND CONNECTION

1. Sign up with test account
2. Check that account was created in Supabase
   - Go to Supabase → Table Editor → users
   - Should see your test email

**If no account created:**
- API connection might be failing
- Check NEXT_PUBLIC_API_URL is correct
- Check backend is still running on Railway
- Check CORS_ORIGINS in Railway includes your Vercel URL

---

## STEP 13: UPDATE RAILWAY CORS SETTINGS

Now you need to tell Railway to accept requests from your Vercel URL.

1. Go to Railway dashboard: https://railway.app
2. Select your project
3. Go to: **Variables**
4. Find: `FRONTEND_URL`
5. Update value to: `https://your-vercel-app.vercel.app` (your Vercel URL)
6. Find: `CORS_ORIGINS`
7. Update value to: `https://your-vercel-app.vercel.app` (same)
8. Save changes

Railway will automatically redeploy with new variables (wait 2-3 minutes).

---

## STEP 14: UPDATE STRIPE WEBHOOK

Now that you have your backend URL, update the Stripe webhook.

1. Go to: https://dashboard.stripe.com
2. Go to: **Developers → Webhooks**
3. Click your webhook endpoint
4. Update **Endpoint URL** to:
   ```
   https://YOUR_RAILWAY_URL.railway.app/api/subscriptions/webhook
   ```
5. Click **Update endpoint**

---

## STEP 15: FINAL VERIFICATION

After everything is updated:

1. Go to your frontend: `https://your-vercel-app.vercel.app`
2. Refresh page (Ctrl+R)
3. Try signing up again
4. Should work without CORS errors
5. Account should appear in Supabase

---

## TROUBLESHOOTING

### Blank page when visiting frontend

**Problem:** See white blank page, no login form

**Solution:**
1. Wait 30 seconds
2. Refresh page (Ctrl+R)
3. Check browser console (F12) for errors
4. If error about NEXT_PUBLIC_API_URL, redeploy with correct environment variables

---

### "CORS error" in console

**Problem:** Console shows `Access to XMLHttpRequest blocked by CORS`

**Solution:**
1. Check NEXT_PUBLIC_API_URL is correct
2. Go to Railway → Variables
3. Update FRONTEND_URL and CORS_ORIGINS to match your Vercel URL
4. Wait for Railway to redeploy
5. Clear browser cache (Ctrl+Shift+Delete)

---

### API calls timeout

**Problem:** Signup/login takes forever or times out

**Solution:**
1. Check that Railway backend is still running
2. Check logs on Railway for errors
3. Verify DATABASE_URL in Railway is correct
4. Try redeploying Railway

---

### Stripe button doesn't work

**Problem:** Click "Start Free Trial" and nothing happens

**Solution:**
1. Check NEXT_PUBLIC_STRIPE_PUBLIC_KEY is set
2. Make sure it starts with `pk_test_`
3. Check browser console for Stripe errors
4. Verify Stripe keys in environment variables match your Stripe account

---

### Build fails during deployment

**Problem:** Deployment fails with error

**Solution:**
1. Check error message in build logs
2. Common issue: Missing package.json in `frontend/` folder
3. Check `frontend/` folder exists in GitHub repo
4. Verify root directory is set to `frontend`
5. Try redeploying

---

### "npm ERR! code ERESOLVE" error

**Problem:** Build fails with dependency resolution error

**Solution:**
1. Try redeploying (sometimes it's temporary)
2. Check `package-lock.json` exists in `frontend/` folder
3. Ensure all dependencies in `package.json` are valid

---

## VERIFICATION CHECKLIST

Before testing the app, verify:

- [ ] Frontend deployment shows "Ready" or checkmark
- [ ] No errors in deployment logs
- [ ] Can visit frontend URL and see login page
- [ ] All 5 environment variables are set
- [ ] After redeploy, page loads without CORS errors
- [ ] Railway backend is still running
- [ ] FRONTEND_URL and CORS_ORIGINS updated on Railway

---

## NEXT STEPS

1. ✅ Frontend deployed on Vercel
2. ✅ Backend deployed on Railway
3. ➡️ Go to TESTING_CHECKLIST.md
4. Run full testing to verify everything works
5. Deploy to production users

---

## QUICK REFERENCE

**Vercel Dashboard:**
- Login: https://vercel.com
- Your project: https://vercel.com/dashboard
- Deployments: Check build status
- Settings: Manage environment variables
- Domains: Configure custom domain (optional)

**Common Issues:**
- Blank page → Wait + refresh + check console errors
- CORS error → Update FRONTEND_URL on Railway
- API timeout → Check Railway backend is running
- Login fails → Check SUPABASE_URL and keys are correct

**Environment Variables (for reference):**
```
NEXT_PUBLIC_API_URL=https://railway-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_ENV=production
```

---

**Frontend is deployed! Next, run the testing checklist.**
