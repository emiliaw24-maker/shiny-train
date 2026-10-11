#!/bin/bash
set -e

echo "🚀 Agent Nauki - Starting backend..."
echo "📦 Checking environment..."

if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your tokens."
fi

echo "📚 Loading environment variables..."
set -a
source .env
set +a

echo "🔄 Starting FastAPI backend on port 7860..."
uvicorn backend:app --host 0.0.0.0 --port 7860 --reload
