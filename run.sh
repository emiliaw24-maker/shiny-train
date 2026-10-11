#!/bin/bash
set -e

echo "🚀 Agent Nauki - starting backend..."

echo "📦 Sprawdzanie środowiska..."
if [ ! -f .env ]; then
    echo "⚠️  Brak pliku .env. Tworzę przykładowy plik z .env.example..."
    cp .env.example .env
    echo "✅ Utworzono .env. Uzupełnij dane logowania do API."
fi

echo "📚 Ładowanie zmiennych środowiskowych..."
set -a
source .env
set +a

echo "🔄 Uruchamianie FastAPI na porcie 7860..."
uvicorn backend:app --host 0.0.0.0 --port 7860 --reload
