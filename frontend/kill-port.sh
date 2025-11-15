#!/bin/bash
# Kill process on port 5174
PORT=5174
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
  echo "✅ Port $PORT is already free"
else
  echo "🔪 Killing process $PID on port $PORT..."
  kill -9 $PID
  sleep 1
  if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "⚠️ Failed to kill process"
  else
    echo "✅ Port $PORT is now free"
  fi
fi

