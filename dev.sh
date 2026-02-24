#!/bin/bash

# Function to kill processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap Control-C and Kill
trap cleanup SIGINT SIGTERM

echo "🚀 Starting SplitMint Development Environment..."

# Start Backend
echo "🐍 Starting Backend (Port 8000)..."
cd backend
# Check if venv exists, if not instruct user
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found in backend/venv"
    echo "Please run: cd backend && python -m venv venv && pip install -r requirements.txt"
    exit 1
fi
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start Frontend
echo "⚛️  Starting Frontend (Port 3000)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
