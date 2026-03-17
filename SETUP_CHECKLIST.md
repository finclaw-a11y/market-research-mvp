# Market Research MVP - Setup Verification Checklist

Use this checklist to verify your local setup is complete and working correctly.

---

## Pre-Setup Requirements

- [ ] Windows machine (7 or later)
- [ ] PowerShell available (built-in on modern Windows)
- [ ] Admin access to install software (if needed)
- [ ] Internet connection for downloading dependencies
- [ ] 2+ GB free disk space
- [ ] Ports 3000 and 8000 available

---

## Installation Prerequisites

After running `setup.ps1` or `setup.bat`, verify these are installed:

### Python
```powershell
python --version
```
Expected output: `Python 3.8.x` or higher
- [ ] Python installed and accessible
- [ ] Version 3.8 or higher

### Node.js
```powershell
node --version
```
Expected output: `v18.x.x` or higher
- [ ] Node.js installed and accessible
- [ ] Version 18+ recommended

### npm
```powershell
npm --version
```
Expected output: `9.x.x` or higher
- [ ] npm installed
- [ ] Can be used to install packages

### Git (Optional but Recommended)
```powershell
git --version
```
Expected output: `git version 2.x.x`
- [ ] Git installed (optional)

---

## Setup Script Results

After running the setup script, verify:

### Configuration Files Created

#### Backend Configuration
```
Location: backend/.env
```
- [ ] `backend/.env` file exists
- [ ] File contains `DATABASE_URL=sqlite:///./test.db`
- [ ] File contains `SUPABASE_URL=http://localhost:5432`
- [ ] File contains `STRIPE_SECRET_KEY=sk_test_*`
- [ ] File contains `ANTHROPIC_API_KEY=sk_test_*`
- [ ] File contains `CORS_ORIGINS=http://localhost:3000`
- [ ] File contains `DEBUG=True`

#### Frontend Configuration
```
Location: frontend/.env.local
```
- [ ] `frontend/.env.local` file exists
- [ ] File contains `NEXT_PUBLIC_API_URL=http://localhost:8000`
- [ ] File contains `NEXT_PUBLIC_STRIPE_KEY=pk_test_*`
- [ ] File contains `NEXT_PUBLIC_SUPABASE_URL=http://localhost:5432`
- [ ] File contains `NEXT_PUBLIC_ENV=development`

### Directory Structure
- [ ] `backend/` directory exists
- [ ] `frontend/` directory exists
- [ ] `database/` directory exists (created by setup)
- [ ] `backend/venv/` directory exists (created by pip)
- [ ] `frontend/node_modules/` directory exists (created by npm)

### Dependencies Installed

#### Backend Python Packages
```powershell
cd backend
pip list
```
Should show installed packages including:
- [ ] flask
- [ ] sqlalchemy
- [ ] python-dotenv
- [ ] stripe
- [ ] All other packages from requirements.txt

#### Frontend Node Packages
```powershell
cd frontend
npm list --depth=0
```
Should show installed packages including:
- [ ] next
- [ ] react
- [ ] react-dom
- [ ] All other packages from package.json

### Database

#### Database File
```
Location: test.db (in project root or backend/)
```
- [ ] `test.db` file exists
- [ ] File size > 0 bytes (has content)
- [ ] Can be read by SQLite tools

#### Database Schema
Verify the database has tables:
```powershell
cd backend
python -c "from app import db; from app import *; print('Database schema initialized')"
```
- [ ] Database initialization succeeds
- [ ] No SQL errors

---

## Starting the Application

### Backend Server

#### In Terminal 1:
```powershell
cd backend
python app.py
```

Expected output:
```
 * Running on http://localhost:8000
```

Verify:
- [ ] Backend starts without errors
- [ ] Listen on `localhost:8000`
- [ ] No port conflicts
- [ ] No import errors
- [ ] Database connects successfully

#### Test Backend:
```powershell
# In another terminal
curl http://localhost:8000/health
```
Or visit `http://localhost:8000` in browser
- [ ] Backend responds to requests
- [ ] HTTP 200 status (or appropriate response)
- [ ] No CORS errors in browser console

### Frontend Server

#### In Terminal 2:
```powershell
cd frontend
npm run dev
```

Expected output:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

Verify:
- [ ] Frontend starts without errors
- [ ] Listen on `localhost:3000`
- [ ] Build completes successfully
- [ ] No module errors

#### Test Frontend:
Visit `http://localhost:3000` in browser
- [ ] Page loads successfully
- [ ] No 404 errors
- [ ] Styled correctly (CSS loaded)
- [ ] Can interact with page elements

---

## Integration Check

With both servers running:

### Frontend to Backend Communication
- [ ] Frontend can reach backend at `http://localhost:8000`
- [ ] API requests show in backend terminal
- [ ] No CORS errors in browser console
- [ ] No network errors (check browser DevTools → Network)

### API Endpoints
Test a few API endpoints to verify backend works:
- [ ] Root endpoint responds
- [ ] API endpoints return expected data
- [ ] Database queries work
- [ ] Error handling works

### Browser Console
Open browser DevTools (F12) → Console:
- [ ] No red error messages
- [ ] No CORS warnings related to localhost
- [ ] Any warnings are not related to setup

---

## Common Issue Checks

### Port Conflicts
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Check what's using port 8000
netstat -ano | findstr :8000
```
- [ ] Port 3000 available (or note what's using it)
- [ ] Port 8000 available (or note what's using it)

### Environment Variables
```powershell
cd backend
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('DATABASE_URL:', os.getenv('DATABASE_URL'))"
```
- [ ] Environment variables load correctly
- [ ] Database URL is correct
- [ ] API keys are present (even if dummy)

### Python Virtual Environment (if using)
```powershell
cd backend
# On Windows:
.\venv\Scripts\Activate
```
- [ ] Virtual environment activates
- [ ] Packages are isolated
- [ ] No global package conflicts

---

## Performance Checks

### Backend Response Time
- [ ] Backend responds within 1 second to basic requests
- [ ] No hanging or timeout issues
- [ ] Database queries are reasonably fast

### Frontend Load Time
- [ ] Frontend page loads within 3 seconds
- [ ] Components render without lag
- [ ] Hot reload works when saving files

### Memory Usage
- [ ] Backend Python process < 200MB RAM
- [ ] Frontend Node process < 300MB RAM
- [ ] No memory leaks (steadily increasing)

---

## Development Setup Verification

### Code Editing
```powershell
# Backend - verify hot reload
cd backend
# Edit app.py and check if changes reflect

# Frontend - verify hot reload
cd frontend
# Edit a component and check if page updates automatically
```
- [ ] Backend reloads on file changes
- [ ] Frontend hot reloads on file changes
- [ ] No need to restart servers

### Debugging
- [ ] Can view backend logs in terminal
- [ ] Can view frontend console in browser
- [ ] Can use browser DevTools for debugging
- [ ] Can add breakpoints in code

### Git Integration
```powershell
git status
git log --oneline -n 5
```
- [ ] Git repository is initialized
- [ ] Can commit code
- [ ] Can see git history

---

## Cleanup & Maintenance

### Log Files
- [ ] Backend logs are visible in terminal
- [ ] Frontend logs are visible in terminal
- [ ] Can identify issues from logs

### Temporary Files
- [ ] No unexpected files in root directory
- [ ] Database files in correct location
- [ ] Node modules/Python packages contained in proper directories

### Backup Verification
- [ ] Original `.env.example` still exists in backend
- [ ] Backups created if `.env` existed (`.env.backup`)
- [ ] Can revert if needed

---

## Final Verification

### Setup Script Completion
- [ ] Script ran without critical errors
- [ ] All steps completed (or explicitly skipped)
- [ ] Success message displayed at end

### Application Ready
- [ ] Both servers can start simultaneously
- [ ] Frontend can communicate with backend
- [ ] Database is accessible
- [ ] All features are working

### Documentation
- [ ] SETUP_INSTRUCTIONS.md exists and is readable
- [ ] SETUP_CHECKLIST.md (this file) is complete
- [ ] README.md available for project context

---

## Post-Setup Next Steps

- [ ] Read the main README.md for project overview
- [ ] Check `/docs` directory for additional documentation
- [ ] Review deployment guides if planning to deploy
- [ ] Update `.env` files with real API keys before production
- [ ] Configure IDE/editor for development
- [ ] Set up code formatting/linting (if desired)
- [ ] Create a feature branch for development

---

## Quick Reset Commands

If you need to reset and start over:

```powershell
# Remove all setup artifacts
Remove-Item backend\.env -Force -ErrorAction SilentlyContinue
Remove-Item backend\venv -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item frontend\.env.local -Force -ErrorAction SilentlyContinue
Remove-Item frontend\node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item frontend\package-lock.json -Force -ErrorAction SilentlyContinue
Remove-Item test.db -Force -ErrorAction SilentlyContinue

# Then re-run setup
.\setup.ps1
```

---

## Troubleshooting Reference

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in .env and start with different port |
| Python module not found | Run: `pip install -r requirements.txt` again |
| Node module not found | Run: `npm install` in frontend directory |
| CORS errors | Check `CORS_ORIGINS` in backend .env |
| Database errors | Delete test.db and reinitialize |
| PowerShell won't run script | Set execution policy: `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser` |
| Frontend not connecting | Check `NEXT_PUBLIC_API_URL` in frontend .env.local |

---

## Setup Success!

If all items in this checklist are verified ✅, your local development environment is ready!

**Estimated Time to Complete:** 5-15 minutes (including downloads)

**Next Step:** Start coding! 🚀

---

**Last Updated:** March 10, 2026
**Version:** 1.0
