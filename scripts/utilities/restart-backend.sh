#!/bin/bash

# Restart Backend Server Script
# This script kills the backend server and restarts it

set -e

BACKEND_DIR="backend"
PORT=5001

echo "🔄 Restarting Backend Server"
echo "=============================="
echo ""

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Error: $BACKEND_DIR directory not found"
    echo "   Please run this script from the project root"
    exit 1
fi

# Find and kill process on port 5001
echo "🔍 Checking for running backend server on port $PORT..."
PID=$(lsof -ti:$PORT 2>/dev/null || echo "")

if [ -n "$PID" ]; then
    echo "   Found process: $PID"
    echo "   Stopping backend server..."
    kill -9 $PID 2>/dev/null || true
    sleep 2
    echo "✅ Backend server stopped"
else
    echo "   No process found on port $PORT"
fi

echo ""
echo "🚀 Starting backend server..."
echo ""

# Change to backend directory and start server
cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found, installing dependencies..."
    npm install
fi

# Start the server
echo "   Starting: npm start"
echo ""
npm start

