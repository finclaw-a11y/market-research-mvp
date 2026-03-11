# Testing Checklist - Market Research MVP

After deployment, use this checklist to verify everything works end-to-end.

---

## SECTION 1: PRE-TESTING SETUP

### Step 1.1: Get Your URLs

Before you start testing, gather these:

```
Frontend URL: https://____________.vercel.app
Backend URL: https://____________.railway.app
Supabase Project: https://app.supabase.com
Stripe Test Dashboard: https://dashboard.stripe.com
```

### Step 1.2: Open Browser Console

You'll need to check for errors. Open browser developer tools:
- On any page, press: **F12**
- Go to: **Console** tab
- Leave it open while testing

---

## SECTION 2: BASIC INFRASTRUCTURE TESTS

Test that all services are running.

### ✅ Test 1: Backend is Running

1. Go to: `https://YOUR_RAILWAY_URL`
2. You should see error or JSON (not blank page)
3. Check console for **CORS** or **connection** errors

**If fails:**
- ❌ Railway deployment might be down
- ❌ Environment variables might be missing
- ❌ Solution: Check Railway logs

---

### ✅ Test 2: Frontend Loads

1. Go to: `https://YOUR_VERCEL_URL`
2. You should see the **login page** with:
   - Email input field
   - Password input field
   - "Sign Up" button
   - "Sign In" button

**What you should NOT see:**
- ❌ Blank white page
- ❌ "Cannot GET /"
- ❌ 404 error
- ❌ "Failed to fetch"

**If page is blank:**
1. Wait 30 seconds (Vercel might be loading)
2. Refresh page (Ctrl+R)
3. Open F12 console and look for red errors
4. Common error: `NEXT_PUBLIC_API_URL` might be wrong

---

### ✅ Test 3: Supabase is Connected

1. Go to: `https://YOUR_VERCEL_URL`
2. In browser console, look for:
   - ✅ No red errors about "Supabase"
   - ✅ No error about "anon key"

---

### ✅ Test 4: Database Tables Exist

1. Go to: https://app.supabase.com
2. Select your project
3. Go to: **Table Editor** (left sidebar)
4. You should see these tables:
   - ✅ `users`
   - ✅ `data_uploads`
   - ✅ `uploaded_data`
   - ✅ `insight_analysis`
   - ✅ `subscriptions`

**If missing tables:**
- ❌ SQL migrations didn't run
- ❌ Solution: Go back to 30_MIN_DEPLOYMENT_GUIDE.md, Section 3, Part 1 and run SQL

---

## SECTION 3: AUTHENTICATION TESTS

Test signup, signin, and user account creation.

### ✅ Test 5: Signup Works

1. Go to: `https://YOUR_VERCEL_URL`
2. Click **"Sign Up"**
3. Enter:
   - Email: `test1@example.com` (or any test email)
   - Password: `TestPassword123!` (8+ chars, mix of letters/numbers/symbols)
   - Confirm: `TestPassword123!`
4. Click **"Sign Up"** button

**Expected result:**
- ✅ Redirects to dashboard OR asks to start free trial
- ✅ No error messages
- ✅ Console has NO red errors

**If fails with error "User already exists":**
- ❌ You signed up before with this email
- ❌ Solution: Use a different email (test2@example.com, test3@example.com, etc.)

**If fails with CORS error:**
- ❌ Backend CORS settings wrong
- ❌ Solution: Check Railway → Variables → CORS_ORIGINS

**If fails with "Invalid credentials":**
- ❌ Supabase keys might be wrong
- ❌ Solution: Check SUPABASE_URL and SUPABASE_ANON_KEY

---

### ✅ Test 6: Signin Works

1. Go to: `https://YOUR_VERCEL_URL`
2. Click **"Sign In"**
3. Enter:
   - Email: `test1@example.com` (the one you just signed up with)
   - Password: `TestPassword123!`
4. Click **"Sign In"** button

**Expected result:**
- ✅ Redirects to dashboard
- ✅ Can see "Welcome" or username
- ✅ No errors

**If fails:**
- ❌ Email/password wrong
- ❌ User not created yet
- ❌ Solution: Check browser console for error details

---

### ✅ Test 7: User Appears in Supabase

1. Go to: https://app.supabase.com
2. Select your project
3. Go to: **Table Editor → users**
4. You should see a row with your test email

**If no row:**
- ❌ User wasn't created
- ❌ Solution: Try signing up again, check console for errors

---

## SECTION 4: SUBSCRIPTION & STRIPE TESTS

Test free trial signup and Stripe payment integration.

### ✅ Test 8: Free Trial Starts

1. Sign in to your account: `https://YOUR_VERCEL_URL`
2. Go to: **Settings** or **Subscription** page
3. Click **"Start Free Trial"** button

**Expected result:**
- ✅ Stripe payment modal appears
- ✅ Can see "Test Mode" badge on modal
- ✅ Can see plan details ($99/month)

**If no modal appears:**
- ❌ Stripe key might be wrong
- ❌ Solution: Check NEXT_PUBLIC_STRIPE_PUBLIC_KEY

---

### ✅ Test 9: Test Stripe Payment

1. In the Stripe modal, enter test card:
   - Card: `4242 4242 4242 4242`
   - Month: `12`
   - Year: `25`
   - CVC: `123`
   - Name: Any name

2. Click **"Subscribe"** or **"Pay"** button

**Expected result:**
- ✅ Modal closes
- ✅ Message says "Trial started" or "Subscription active"
- ✅ No error messages

**If payment fails:**
- ❌ Stripe secret key might be wrong
- ❌ STRIPE_PRICE_ID might be wrong
- ❌ Solution: Check Railway variables, look for Stripe errors in console

---

### ✅ Test 10: Subscription Appears in Supabase

1. Go to: https://app.supabase.com
2. Go to: **Table Editor → subscriptions**
3. You should see a row with:
   - ✅ Your user_id
   - ✅ Status: "active" or "trialing"
   - ✅ stripe_customer_id (not empty)
   - ✅ stripe_subscription_id (not empty)

**If no row or empty:**
- ❌ Subscription creation failed
- ❌ Solution: Check backend logs on Railway

---

### ✅ Test 11: Subscription Appears in Stripe

1. Go to: https://dashboard.stripe.com
2. Go to: **Customers**
3. You should see customer with your email
4. Click customer
5. You should see **Subscription** with status:
   - ✅ "Trialing" (free trial active)
   - ✅ With $99/month plan

**If not there:**
- ❌ Stripe webhook might be failing
- ❌ Solution: Check Stripe webhook in developers section

---

## SECTION 5: FILE UPLOAD & CSV TESTS

Test uploading CSV files and processing.

### ✅ Test 12: CSV Upload Works

1. Create a test CSV file named `test_data.csv`:

```csv
product,sales,region,month
Widget,1000,North,Jan
Gadget,1500,South,Jan
Doohickey,800,East,Jan
Thingamajig,2000,West,Jan
Widget,1100,North,Feb
Gadget,1600,South,Feb
Doohickey,900,East,Feb
Thingamajig,2100,West,Feb
```

2. Save this file to your computer

3. Go to your app: `https://YOUR_VERCEL_URL`

4. Go to: **Upload** or **Files** page

5. Click **"Upload CSV"** or drag file onto page

6. Select your `test_data.csv` file

**Expected result:**
- ✅ File uploads (shows progress bar)
- ✅ File appears in list
- ✅ Status shows "Uploaded" or "Ready"

**If upload fails:**
- ❌ Backend API might be down
- ❌ Database connection might be broken
- ❌ Solution: Check Railway logs, check console errors

---

### ✅ Test 13: Upload Appears in Supabase

1. Go to: https://app.supabase.com
2. Go to: **Table Editor → data_uploads**
3. You should see a row with:
   - ✅ Your filename: `test_data.csv`
   - ✅ Status: "pending" or "completed"
   - ✅ Row count: should be 8

**If no row:**
- ❌ Upload didn't save to database
- ❌ Solution: Check backend logs

---

## SECTION 6: AI INSIGHTS TESTS

Test Claude API integration for generating insights.

### ✅ Test 14: Generate Insights

1. Go to: **Upload** page
2. Find your `test_data.csv` upload
3. Click **"Generate Insights"** or **"Analyze"** button
4. Wait 10-30 seconds (API is thinking)

**Expected result:**
- ✅ Insights appear (text analysis)
- ✅ Shows key findings, trends, recommendations
- ✅ No error messages
- ✅ Takes 10-30 seconds (not instant)

**If fails immediately:**
- ❌ ANTHROPIC_API_KEY might be wrong
- ❌ API key might not have credits
- ❌ Solution: Check Railway variables, test key on console.anthropic.com

**If takes >60 seconds:**
- ❌ Request might be timing out
- ❌ Solution: Check backend logs

---

### ✅ Test 15: Insights Appear in Supabase

1. Go to: https://app.supabase.com
2. Go to: **Table Editor → insight_analysis**
3. You should see a row with:
   - ✅ Your upload_id
   - ✅ insights_json: not empty
   - ✅ summary: contains text
   - ✅ key_findings: not empty

**If no row:**
- ❌ Insights weren't saved
- ❌ Solution: Check backend logs

---

### ✅ Test 16: Display Insights

1. Go to: **Insights** page
2. Find insights for your upload
3. You should see:
   - ✅ Summary text
   - ✅ Key findings (list)
   - ✅ Recommendations
   - ✅ Charts/visualizations (if any)

**If blank:**
- ❌ Insights not loading
- ❌ Solution: Check console errors, refresh page

---

## SECTION 7: DATA EXPORT TESTS

Test exporting insights and data.

### ✅ Test 17: Export as JSON

1. Go to: **Insights** page
2. Find your insights
3. Click **"Export"** or **"Download"** button
4. Select **"JSON"** format
5. Wait for download

**Expected result:**
- ✅ JSON file downloads
- ✅ File contains insights data
- ✅ File is valid JSON (can open in text editor)

**If fails:**
- ❌ Export endpoint might be broken
- ❌ Solution: Check backend logs

---

### ✅ Test 18: Export as CSV

1. Go to: **Insights** page
2. Find your insights
3. Click **"Export"** or **"Download"** button
4. Select **"CSV"** format
5. Wait for download

**Expected result:**
- ✅ CSV file downloads
- ✅ File opens in Excel/Sheets
- ✅ Contains insights data in columns

**If fails:**
- ❌ CSV export might not be implemented
- ❌ Solution: Check if this feature is deployed

---

## SECTION 8: ACCOUNT MANAGEMENT TESTS

Test user settings and account management.

### ✅ Test 19: Update Profile

1. Go to: **Settings** page
2. Find profile section
3. Update:
   - Full name: "Test User"
   - Any other fields
4. Click **"Save"** button

**Expected result:**
- ✅ Changes save
- ✅ Show "Saved" message
- ✅ Refresh page and changes persist

**If doesn't save:**
- ❌ API endpoint might be broken
- ❌ Solution: Check backend logs

---

### ✅ Test 20: Logout Works

1. Go to: **Settings** or top menu
2. Click **"Logout"** or **"Sign Out"** button

**Expected result:**
- ✅ Redirects to login page
- ✅ Session is cleared
- ✅ Can't access dashboard without signin

**If you can still access dashboard:**
- ❌ Logout didn't clear session
- ❌ Solution: Check if authentication state is managed correctly

---

## SECTION 9: ERROR HANDLING TESTS

Test that errors are handled gracefully.

### ✅ Test 21: Wrong Password Error

1. Go to login page
2. Enter:
   - Email: `test1@example.com`
   - Password: `WrongPassword123!`
3. Click **"Sign In"**

**Expected result:**
- ✅ Error message: "Invalid credentials" or similar
- ✅ Stays on login page
- ✅ No console errors (expected error)

---

### ✅ Test 22: Invalid Email Error

1. Go to signup page
2. Enter:
   - Email: `not-an-email` (no @)
   - Password: `TestPassword123!`
3. Click **"Sign Up"**

**Expected result:**
- ✅ Error message: "Invalid email"
- ✅ Form shows error in red
- ✅ Can't submit

---

### ✅ Test 23: Weak Password Error

1. Go to signup page
2. Enter:
   - Email: `test999@example.com`
   - Password: `123` (too short)
3. Click **"Sign Up"**

**Expected result:**
- ✅ Error message: "Password too short" or similar
- ✅ Form shows requirement (8+ chars)
- ✅ Can't submit

---

### ✅ Test 24: Network Error Handling

1. Open browser DevTools (F12)
2. Go to: **Network** tab
3. Click offline (checkbox: "Offline")
4. Try to interact with app

**Expected result:**
- ✅ Shows error: "No internet" or "Cannot reach server"
- ✅ Graceful error message
- ✅ Not a blank page

---

## SECTION 10: PERFORMANCE TESTS

Test that app performs well.

### ✅ Test 25: Page Load Speed

1. Go to: `https://YOUR_VERCEL_URL`
2. Open DevTools (F12) → **Network** tab
3. Refresh page
4. Check:
   - ✅ Time to First Byte (TTFB): < 2 seconds
   - ✅ Fully loaded: < 5 seconds

---

### ✅ Test 26: Dashboard Load Speed

1. Sign in
2. Go to dashboard
3. Check load time: should be < 3 seconds

---

### ✅ Test 27: Large CSV Upload

1. Create a large CSV (100+ rows)
2. Upload it
3. Should handle without crashing

**Expected:**
- ✅ Uploads successfully
- ✅ Shows progress
- ✅ No timeout errors

---

## SECTION 11: MOBILE/RESPONSIVE TESTS

Test on different screen sizes.

### ✅ Test 28: Mobile Signup

1. Go to: `https://YOUR_VERCEL_URL`
2. Open DevTools (F12) → toggle mobile view (Ctrl+Shift+M)
3. Try signup on mobile view

**Expected:**
- ✅ Form is readable
- ✅ Buttons are clickable
- ✅ Layout adjusts to small screen

---

### ✅ Test 29: Mobile Dashboard

1. Sign in on mobile view
2. Go to dashboard
3. Check:
   - ✅ All elements visible
   - ✅ No overflow
   - ✅ Responsive design works

---

## SECTION 12: SECURITY TESTS

Test security features.

### ✅ Test 30: JWT Token Protection

1. Sign in
2. Open DevTools → Application → LocalStorage
3. You should see:
   - ✅ Auth token stored (from Supabase)
   - ✅ Logout clears token

---

### ✅ Test 31: Authenticated Routes

1. Sign out completely
2. Try to access: `https://YOUR_VERCEL_URL/dashboard` (directly in URL)

**Expected:**
- ✅ Redirects to login
- ✅ Can't access protected pages without auth

---

### ✅ Test 32: HTTPS Only

1. Check all URLs use HTTPS
2. Go to: `https://YOUR_VERCEL_URL` (not http://)

**Expected:**
- ✅ All requests are HTTPS
- ✅ No mixed content warnings in console

---

## SECTION 13: END-TO-END FLOW TEST

Complete workflow from start to finish.

### ✅ Test 33: Full User Journey

1. **Start:** Go to app
2. **Signup:** Create new account
3. **Trial:** Start free trial
4. **Upload:** Upload CSV file
5. **Analyze:** Generate insights
6. **View:** See insights displayed
7. **Export:** Export insights
8. **Settings:** Update profile
9. **Logout:** Sign out

**Expected:**
- ✅ All steps complete without errors
- ✅ Data persists across page refreshes
- ✅ No console errors

---

## SECTION 14: ISSUE DOCUMENTATION

If you encounter issues, document them here:

### Issue 1
```
Test: ________________
Error: ________________
Steps to reproduce: ________________
Expected: ________________
Actual: ________________
Screenshot: ________________
Console error: ________________
Solution attempted: ________________
Resolved: [ ] Yes [ ] No
```

### Issue 2
```
Test: ________________
Error: ________________
Steps to reproduce: ________________
Expected: ________________
Actual: ________________
Screenshot: ________________
Console error: ________________
Solution attempted: ________________
Resolved: [ ] Yes [ ] No
```

---

## SECTION 15: FINAL CHECKLIST

Before declaring the app "Production Ready":

**Core Features:**
- [ ] Signup works
- [ ] Login works
- [ ] Free trial works
- [ ] CSV upload works
- [ ] Insights generate
- [ ] Insights display
- [ ] Export works
- [ ] Logout works

**Quality:**
- [ ] No console errors
- [ ] Pages load < 5 seconds
- [ ] Mobile responsive
- [ ] No broken links
- [ ] All buttons work
- [ ] All forms validate

**Infrastructure:**
- [ ] Frontend on Vercel
- [ ] Backend on Railway
- [ ] Database on Supabase
- [ ] Stripe connected
- [ ] Claude API working
- [ ] Webhooks firing

**Security:**
- [ ] HTTPS everywhere
- [ ] Auth tokens secure
- [ ] Protected routes work
- [ ] No sensitive data in console
- [ ] CORS configured

**Performance:**
- [ ] Load times acceptable
- [ ] Large files handled
- [ ] No memory leaks
- [ ] API responses fast

---

## ✅ ALL TESTS PASSED!

If you've checked all boxes above, your app is **production ready**!

---

## 📞 STILL HAVING ISSUES?

See `TROUBLESHOOTING.md` for common problems and solutions.

