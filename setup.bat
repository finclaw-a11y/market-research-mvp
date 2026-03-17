@echo off
REM ============================================================================
REM Market Research MVP - One-Click Local Setup Script (Batch Version)
REM ============================================================================
REM This batch file delegates to the PowerShell script for better functionality
REM If PowerShell is not available, fall back to manual setup
REM ============================================================================

setlocal enabledelayedexpansion

cls

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║    Market Research MVP - One-Click Local Setup Script          ║
echo ║                  Batch Launcher v1.0                          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Try to use PowerShell if available
where powershell >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [INFO] PowerShell found - launching setup.ps1...
    echo.
    
    REM Run PowerShell script with proper execution policy
    powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%setup.ps1"
    
    if %ERRORLEVEL% == 0 (
        echo.
        echo ✓ Setup completed successfully!
        pause
    ) else (
        echo.
        echo ✗ Setup failed. Please check the output above.
        pause
        exit /b 1
    )
) else (
    REM PowerShell not found, show manual setup instructions
    cls
    echo.
    echo ╔════════════════════════════════════════════════════════════════╗
    echo ║    Manual Setup Required - PowerShell Not Available           ║
    echo ╚════════════════════════════════════════════════════════════════╝
    echo.
    echo This setup script requires PowerShell to run automatically.
    echo.
    echo MANUAL SETUP INSTRUCTIONS:
    echo ════════════════════════════════════════════════════════════════
    echo.
    echo 1. Open PowerShell as Administrator
    echo.
    echo 2. Navigate to the project directory:
    echo    cd "%SCRIPT_DIR%"
    echo.
    echo 3. Enable PowerShell script execution:
    echo    Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
    echo.
    echo 4. Run the setup script:
    echo    .\setup.ps1
    echo.
    echo 5. Follow the on-screen instructions
    echo.
    echo ALTERNATIVE (If PowerShell still doesn't work):
    echo ════════════════════════════════════════════════════════════════
    echo.
    echo Follow the manual setup steps in SETUP_INSTRUCTIONS.md
    echo.
    pause
    exit /b 1
)

endlocal
