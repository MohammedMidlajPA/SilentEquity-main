#!/bin/bash

# Auto-start script for Silent Equity Web App
# This script starts both backend and frontend servers

echo "🚀 Starting Silent Equity Web App..."
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start Backend
echo "📦 Starting backend server on port 5001..."
cd "$(dirname "$0")/backend"
PORT=5001 npm start > /tmp/silent-equity-backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo "📋 Logs: tail -f /tmp/silent-equity-backend.log"

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend failed to start. Check logs: tail -f /tmp/silent-equity-backend.log"
    exit 1
fi

# Start Frontend
echo ""
echo "🎨 Starting frontend server on port 5173..."
cd "$(dirname "$0")/frontend"
VITE_API_BASE_URL=http://localhost:5001/api npm run dev > /tmp/silent-equity-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo "📋 Logs: tail -f /tmp/silent-equity-frontend.log"

# Wait for frontend to start
sleep 5

# Check if frontend is running
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend is running"
else
    echo "⚠️ Frontend may still be starting..."
fi

echo ""
echo "🎉 Servers are starting!"
echo ""
echo "📍 Backend: http://localhost:5001"
echo "📍 Frontend: http://localhost:5173"
echo ""
echo "📊 View logs:"
echo "   Backend:  tail -f /tmp/silent-equity-backend.log"
echo "   Frontend: tail -f /tmp/silent-equity-frontend.log"
echo ""
echo "🛑 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "✨ Open http://localhost:5173 in your browser!"

