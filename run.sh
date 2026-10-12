#!/bin/sh
set -eu

echo "Starting Agent Nauki API on port 7861..."
uvicorn backend:app --host 127.0.0.1 --port 7861 &
BACKEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting Agent Nauki frontend on port 7860..."
npm start -- --hostname 0.0.0.0
