# Market Research MVP - Local Setup Guide

## Quick Start (Recommended)

The easiest way to set up your local development environment is to use the automated setup script.

### Option 1: Using setup.bat (Easiest)
```bash
# Simply double-click setup.bat in Windows Explorer
# Or from Command Prompt:
setup.bat
```

### Option 2: Using setup.ps1 (PowerShell)
```powershell
# Open PowerShell and navigate to the project directory
cd C:\Users\{YourUsername}\Projects\market-research-mvp

# If you get an execution policy error, run:
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser

# Then run the setup script:
.\setup.ps1
```

---

## What the Setup Script Does

The automated setup script performs all of the following steps automatically:

### ✓ Prerequisites Check
- Verifies Python 3.8+ is installed
- Verifies Node.js is installed
- Verifies npm is available
- Checks for Git (optional but recommended)

### ✓ Configuration Files
- Creates `backend/.env` with all required environment variables
- Creates `frontend/.env.local` with all required environment variables
- Backs up any existing configuration files

### ✓ Environment Setup
- Creates the database directory structure
- Sets up all necessary directories

### ✓ Dependencies Installation
- Installs Python packages via `pip install -r requirements.txt`
- Installs Node.js packages via `npm install`
- Handles dependency resolution

### ✓ Database Initialization
- Creates SQLite database at `./test.db`
- Initializes database schema
- Sets up any required tables

### ✓ Ready to Launch
- Confirms all setup is complete
- Provides instructions to start servers
- Optionally launches both servers in separate terminal windows

---

## Manual Setup (If Automated Script Fails)

If the automated script doesn't work, follow these manual steps:

### Step 1: Check Prerequisites

```powershell
# Check Python
python --version

# Check Node.js
node --version

# Check npm
npm --version

# Check Git
git --version
```

If any of these fail, install the missing tools:
- **Python:** https://www.python.org/downloads/
- **Node.js:** https://nodejs.org/
- **Git:** https://git-scm.com/

### Step 2: Create Backend .env File

Create a file `backend/.env` with the following content:

```env
# Database Configuration
DATABASE_URL=sqlite:///./test.db

# Supabase (Local Dummy Values)
SUPABASE_URL=http://localhost:5432
SUPABASE_KEY=dummy_test_key_local_dev_only

# Stripe (Test Keys - Local Development Only)
STRIPE_SECRET_KEY=sk_test_dummy123456789abcdefghijklmnop
STRIPE_WEBHOOK_SECRET=whsec_test_dummy123456789abcdefghijklmnop

# Anthropic API (Local Dummy - Replace with real key in production)
ANTHROPIC_API_KEY=sk_test_dummy123456789abcdefghijklmnop

# CORS Configuration
CORS_ORIGINS=http://localhost:3000

# Debug Mode (Set to False in production)
DEBUG=True

# Server Configuration
SERVER_HOST=localhost
SERVER_PORT=8000

# Session Configuration
SECRET_KEY=dev_secret_key_change_in_production
```

### Step 3: Create Frontend .env.local File

Create a file `frontend/.env.local` with the following content:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Stripe (Test Keys - Local Development Only)
NEXT_PUBLIC_STRIPE_KEY=pk_test_dummy123456789abcdefghijklmnop

# Supabase (Local Dummy Values)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:5432
NEXT_PUBLIC_SUPABASE_KEY=dummy_test_key_local_dev_only

# Application Environment
NEXT_PUBLIC_ENV=development

# Debug Mode
NEXT_PUBLIC_DEBUG=true
```

### Step 4: Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
cd ..
```

### Step 5: Install Frontend Dependencies

```powershell
cd frontend
npm install
cd ..
```

### Step 6: Initialize Database

```powershell
cd backend
python -c "from app import app, db; app.app_context().push(); db.create_all()"
cd ..
```

### Step 7: Start the Servers

**Terminal 1 - Backend:**
```powershell
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

The servers will start at:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

---

## Environment Variables Explained

### Backend (.env)

| Variable | Purpose | Local Value |
|----------|---------|-------------|
| `DATABASE_URL` | SQLite database connection | `sqlite:///./test.db` |
| `SUPABASE_URL` | Supabase API endpoint | `http://localhost:5432` (dummy) |
| `SUPABASE_KEY` | Supabase authentication key | `dummy_test_key_local_dev_only` |
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_test_dummy...` (test key) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing key | `whsec_test_dummy...` (test key) |
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk_test_dummy...` (dummy for local) |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:3000` |
| `DEBUG` | Debug mode toggle | `True` (local only) |
| `SECRET_KEY` | Flask session secret | Random generated value |

### Frontend (.env.local)

| Variable | Purpose | Local Value |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe public key | `pk_test_dummy...` (test key) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | `http://localhost:5432` (dummy) |
| `NEXT_PUBLIC_SUPABASE_KEY` | Supabase key | `dummy_test_key_local_dev_only` |
| `NEXT_PUBLIC_ENV` | Environment type | `development` |
| `NEXT_PUBLIC_DEBUG` | Debug mode | `true` |

---

## Project Structure

```
market-research-mvp/
├── backend/                    # Flask backend API
│   ├── app.py                 # Main Flask application
│   ├── auth.py                # Authentication logic
│   ├── database.py            # Database configuration
│   ├── models.py              # Data models
│   ├── requirements.txt        # Python dependencies
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── .env                   # Backend configuration (created by setup)
│   └── venv/                  # Virtual environment (created by pip install)
│
├── frontend/                   # Next.js frontend app
│   ├── app/                   # Application pages
│   ├── components/            # React components
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   ├── next.config.js         # Next.js configuration
│   ├── .env.local             # Frontend configuration (created by setup)
│   └── node_modules/          # Installed packages (created by npm install)
│
├── database/                   # Database directory
│   └── test.db                # SQLite database (created on first run)
│
├── setup.ps1                  # PowerShell setup script
├── setup.bat                  # Batch file launcher
└── SETUP_INSTRUCTIONS.md      # This file
```

---

## Troubleshooting

### "Python not found"
**Solution:** Install Python from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

### "Node not found"
**Solution:** Install Node.js from https://nodejs.org/
- Node.js installation includes npm automatically

### "Port 3000 already in use"
**Solution:** Stop the other application using port 3000, or change the frontend port:
```powershell
cd frontend
npm run dev -- -p 3001
```

### "Port 8000 already in use"
**Solution:** Change the backend port in `backend/.env`:
```env
SERVER_PORT=8001  # Change to different port
```
Then run: `python app.py --port 8001`

### "Module not found" error in backend
**Solution:** Reinstall Python dependencies:
```powershell
cd backend
pip install -r requirements.txt --force-reinstall
cd ..
```

### "Module not found" error in frontend
**Solution:** Reinstall Node.js dependencies:
```powershell
cd frontend
rm -r node_modules package-lock.json
npm install
cd ..
```

### Database errors
**Solution:** Delete the database and reinitialize:
```powershell
# Delete the existing database
Remove-Item test.db -Force -ErrorAction SilentlyContinue

# Reinitialize
cd backend
python -c "from app import app, db; app.app_context().push(); db.create_all()"
cd ..
```

### PowerShell execution policy error
**Solution:** Set execution policy to allow scripts:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

---

## Starting Fresh

If you want to completely clean up and start over:

```powershell
# Remove all created files and directories
Remove-Item backend\.env -Force -ErrorAction SilentlyContinue
Remove-Item backend\venv -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item frontend\.env.local -Force -ErrorAction SilentlyContinue
Remove-Item frontend\node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item frontend\package-lock.json -Force -ErrorAction SilentlyContinue
Remove-Item test.db -Force -ErrorAction SilentlyContinue
Remove-Item database -Recurse -Force -ErrorAction SilentlyContinue

# Then run setup again
.\setup.ps1
```

---

## Next Steps After Setup

Once the setup is complete and both servers are running:

1. **Open Frontend:** http://localhost:3000
2. **Check Backend Health:** http://localhost:8000/health (if available)
3. **Test API:** Try making requests to the backend API
4. **Review Logs:** Check terminal windows for any errors or warnings
5. **Start Development:** Begin working on your features!

---

## Important Reminders

⚠️ **SECURITY WARNING:** The environment variables in the setup contain DUMMY/TEST values for local development only.

🔒 **Before Production Deployment:**
- Replace all `dummy_test_*` values with real API keys
- Use real Stripe API keys (not test keys)
- Use strong, unique `SECRET_KEY` values
- Set `DEBUG=False`
- Use proper database URL (not SQLite for production)
- Update `CORS_ORIGINS` to only allow your real domain

💾 **Database:** SQLite is great for development but NOT suitable for production. Consider PostgreSQL, MySQL, or cloud databases for production.

---

## Getting Help

If you encounter issues:

1. **Check the logs:** Look at the terminal output when the error occurs
2. **Review this guide:** Search for your error message above
3. **Check Prerequisites:** Ensure all tools are properly installed
4. **Verify Ports:** Make sure ports 3000 and 8000 aren't in use
5. **Restart:** Sometimes a fresh terminal window helps
6. **Deep Clean:** Use the "Starting Fresh" section to reset everything

---

## Support

For issues or questions:
- Check the project's main README.md
- Review deployment guides in the `/docs` directory
- Check existing GitHub issues
- Create a new issue with detailed error messages

---

**Last Updated:** March 10, 2026
**Version:** 1.0
