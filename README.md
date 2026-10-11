# Agent Nauki 🧠📚

Inteligentna aplikacja edukacyjna do nauki matematyki i polskiego z generowaniem zadań przez AI, feedback od ChatGPT i ilustracjami.

## ⚡ Quick Start

### Lokalnie

#### 1. Backend (FastAPI)
```bash
pip install -r requirements.txt
cp .env.example .env
# Edytuj .env i dodaj tokeny
bash run.sh
```

#### 2. Frontend (Next.js)
```bash
npm install
npm run dev
```

Otwórz: **http://localhost:3000**

## 🚀 Deploy na Hugging Face Spaces

### Krok 1: Stwórz Space
1. Wejdź na https://huggingface.co/new-space
2. Wybierz:
   - **Space SDK**: Docker
   - **Space name**: `agent-nauki`
   - **Visibility**: Public
   - **License**: MIT

### Krok 2: Dodaj sekrety
W **Settings → Repository secrets** dodaj:
```
HF_TOKEN=your_hf_token_here
OPENAI_API_KEY=your_openai_key_here
HF_MODEL_ID=mistralai/Mistral-7B-Instruct-v0.1
HF_IMAGE_MODEL=stabilityai/stable-diffusion-xl-base-1.0
```

### Krok 3: Push kodu
```bash
# Dodaj remote do HF Space
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/agent-nauki

# Push main branch
git push hf main
```

**Space automagicznie się builduje i deployuje!** 🎉

## 🏗️ Struktura

```
shiny-train/
├── app/                    # Next.js frontend
│   ├── page.tsx           # Główna strona
│   ├── layout.tsx         # Layout
│   └── globals.css        # Style
├── backend.py             # FastAPI backend
├── requirements.txt       # Python zależności
├── package.json          # Node zależności
├── Dockerfile            # Multi-stage build
├── .env.example          # Zmienne środowiskowe
├── run.sh                # Skrypt startowy
└── README.md             # Ten plik
```

## 🎯 Funkcje

✅ **Generowanie zadań** – Hugging Face LLM (Mistral)  
✅ **Feedback AI** – ChatGPT (OpenAI)  
✅ **Ilustracje** – SDXL / Flux (generowanie)  
✅ **Poziomy trudności** – Łatwy, Średni, Trudny  
✅ **Nowoczesny UI** – Next.js + CSS-in-JS  
✅ **Animacje** – Smooth transitions i karty  
✅ **Statystyki** – Tracking postępu  
✅ **Baza danych** – SQLite  
✅ **Responsywny** – Mobile-first design  
✅ **Production-ready** – Docker + Spaces  

## 📡 API Endpointy

| Metoda | Endpoint | Opis |
|--------|----------|------|
| POST | `/api/generate-task` | Generuj nowe zadanie |
| POST | `/api/check-answer` | Sprawdź odpowiedź |
| POST | `/api/hint` | Pobierz podpowiedź |
| POST | `/api/chat` | Chat z AI |
| POST | `/api/generate-image` | Generuj obraz |
| GET | `/api/stats/{user_id}` | Statystyki |
| GET | `/health` | Health check |

## 🔐 Zmienne środowiskowe

```bash
# Hugging Face
HF_TOKEN=your_token
HF_MODEL_ID=mistralai/Mistral-7B-Instruct-v0.1
HF_IMAGE_MODEL=stabilityai/stable-diffusion-xl-base-1.0

# OpenAI
OPENAI_API_KEY=your_key

# Database
DATABASE=learning_data.db
```

## 🛠️ Tech Stack

**Frontend**
- Next.js 14
- TypeScript
- CSS-in-JS (vanilla)
- Responsive Design

**Backend**
- FastAPI (Python)
- SQLite
- Hugging Face Inference API
- OpenAI API

**AI Models**
- Mistral 7B – generowanie zadań
- GPT-4o Mini – feedback
- SDXL / Flux – ilustracje

**Infrastructure**
- Docker (multi-stage build)
- Hugging Face Spaces
- GitHub (version control)

## 📝 Tokeny

### Hugging Face Token
1. Wejdź na https://huggingface.co/settings/tokens
2. Stwórz nowy token (read access)
3. Skopiuj i wstaw do `.env`

### OpenAI API Key
1. Wejdź na https://platform.openai.com/api-keys
2. Stwórz nowy klucz
3. Skopiuj i wstaw do `.env`

## 🚨 Ważne

⚠️ **Nie commituj `.env`** – zawiera sekrety!  
✅ Commituj tylko `.env.example`  
✅ Tokeny przechowuj w GitHub Secrets / Spaces Secrets  
✅ Public repo – ale z zabezpieczeniami  

## 📊 Monitoring na Spaces

Po deploycie na HF Spaces:
- Otwórz Space URL
- App będzie dostępna na `https://huggingface.co/spaces/YOUR_USERNAME/agent-nauki`
- Logi są dostępne w **Settings → Build logs**

## 🔄 CI/CD

Po każdym push do `main`:
1. GitHub Actions (jeśli skonfigurowane) testuje kod
2. Dockerfile buduje image
3. HF Spaces deployuje automatycznie

## 💡 Rozszerz aplikację

**TODO**
- [ ] Logowanie użytkowników (Auth0 / Firebase)
- [ ] Leaderboard
- [ ] Gamifikacja (badges, achievements)
- [ ] Export raportów PDF
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Voice input/output
- [ ] Integracja Discord/Slack

## 📧 Support

Jeśli masz pytania:
1. Sprawdź logs w Spaces
2. Otwórz issue na GitHubie
3. Kontaktuj autorów

## 📄 Licencja

MIT – używaj swobodnie!

---

**Autor**: emiliaw24-maker  
**Status**: 🚀 Production Ready  
**Ostatnia aktualizacja**: 2026-10-11  
**Version**: 2.0.0 (Next.js + Docker)  
