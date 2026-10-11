# Agent Nauki

Aplikacja edukacyjna z AI w wersji Next.js + FastAPI.

## Stack
- Next.js 14 + TypeScript
- FastAPI (backend AI)
- SQLite
- Hugging Face + OpenAI + image generation
- Dockerfile do deployu na Spaces

## Uruchomienie

### Frontend Next.js
```bash
npm install
npm run dev
```

### Backend FastAPI
```bash
pip install -r requirements.txt
bash run.sh
```

Frontend działa na `http://localhost:3000` a backend na `http://localhost:7860`.

## Deploy na Hugging Face Spaces

1. Utwórz nowy Space (Docker)
2. W Settings → Secrets dodaj:
   - `HF_TOKEN`
   - `OPENAI_API_KEY`
3. Push repo do Space
4. Uruchom `Dockerfile`

## Ważne
- Nie wrzucaj `.env` do repo.
- Zmienna `.env` jest lokalna.

## Cel
- uczniowie rozwiązują zadania w matematyce i polskim
- AI generuje pytania i podpowiedzi
- UI jest nowoczesne i animowane
