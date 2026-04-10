@echo off
REM AI Interview Preparation System - Windows Startup Script

echo.
echo ========================================
echo AI Interview Preparation System
echo ========================================
echo.

REM Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.10+
    pause
    exit /b 1
)

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)

REM Check for PostgreSQL
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL not found. Please install PostgreSQL 12+
    pause
    exit /b 1
)

echo Python: %PYTHON_VERSION%
echo Node.js: %NODE_VERSION%
echo PostgreSQL found

echo.
echo Step 1: Starting PostgreSQL...
echo.
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL started
) else (
    echo [WARNING] PostgreSQL may already be running
)

echo.
echo Step 2: Setting up Backend...
echo.
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -q -r requirements.txt

echo Installing spaCy model...
python -m spacy download -q en_core_web_sm

REM Set database URL from environment (no hardcoded password)
if "%DB_PASSWORD%"=="" set "DB_PASSWORD=change_me"
if "%DB_PASSWORD%"=="change_me" echo [WARNING] Using placeholder DB_PASSWORD. Set DB_PASSWORD before production use.
set "DATABASE_URL=postgresql://postgres:%DB_PASSWORD%@localhost:5432/ai_interview_db"

echo [OK] Backend ready

echo.
echo Step 3: Setting up Frontend...
echo.
cd ..\frontend

if not exist node_modules (
    echo Installing npm dependencies...
    call npm install -q
)

if not exist .env (
    echo Creating .env file...
    echo VITE_API_URL=http://localhost:8000 > .env
)

echo [OK] Frontend ready

echo.
echo ========================================
echo Starting Application...
echo ========================================
echo.
echo Backend will run on: http://localhost:8000
echo Frontend will run on: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop any server.
echo.

echo Starting Backend...
start cmd /k "cd backend && venv\Scripts\activate.bat && python run.py"

timeout /t 3 /nobreak

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo Application started! 
echo Open http://localhost:5173 in your browser
echo.

pause
