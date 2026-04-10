#!/bin/bash

# AI Interview Preparation System - Unix/macOS Startup Script

echo ""
echo "========================================"
echo "AI Interview Preparation System"
echo "========================================"
echo ""

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 not found. Please install Python 3.10+"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install Node.js 16+"
    exit 1
fi

# Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "ERROR: PostgreSQL not found. Please install PostgreSQL 12+"
    exit 1
fi

echo "Python: $(python3 --version)"
echo "Node.js: $(node --version)"
echo "PostgreSQL: $(psql --version)"

echo ""
echo "Step 1: Starting PostgreSQL..."
echo ""

# Start PostgreSQL (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start postgresql 2>/dev/null
    echo "[OK] PostgreSQL started (macOS)"
else
    # Linux
    sudo systemctl start postgresql 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "[OK] PostgreSQL started (Linux)"
    else
        echo "[WARNING] PostgreSQL may already be running"
    fi
fi

echo ""
echo "Step 2: Setting up Backend..."
echo ""

cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -q -r requirements.txt

echo "Installing spaCy model..."
python -m spacy download -q en_core_web_sm

# Set database URL from environment (no hardcoded password)
DB_PASSWORD="${DB_PASSWORD:-change_me}"
if [ "$DB_PASSWORD" = "change_me" ]; then
    echo "[WARNING] Using placeholder DB_PASSWORD. Set DB_PASSWORD before production use."
fi
export DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@localhost:5432/ai_interview_db"

echo "[OK] Backend ready"

echo ""
echo "Step 3: Setting up Frontend..."
echo ""

cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install -q
fi

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    echo "VITE_API_URL=http://localhost:8000" > .env
fi

echo "[OK] Frontend ready"

echo ""
echo "========================================"
echo "Starting Application..."
echo "========================================"
echo ""
echo "Backend will run on: http://localhost:8000"
echo "Frontend will run on: http://localhost:5173"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop any server."
echo ""

echo "Starting Backend..."
cd ../backend
source venv/bin/activate
python run.py &
BACKEND_PID=$!

sleep 3

echo "Starting Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Application started!"
echo "Open http://localhost:5173 in your browser"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""

# Handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait
