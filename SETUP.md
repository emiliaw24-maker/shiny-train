# 🚀 Instrukcja Konfiguracji Agent Nauki

## Kroki instalacji

### 1️⃣ Klonuj repozytorium
```bash
git clone https://github.com/emiliaw24-maker/shiny-train.git
cd shiny-train
```

### 2️⃣ Zainstaluj zależności Pythona
```bash
pip install -r requirements.txt
```

**Wymagane pakiety:**
- fastapi==0.115.0
- uvicorn==0.30.6
- requests==2.32.3
- pydantic==2.9.2
- python-dotenv==1.0.1
- Pillow==10.4.0

### 3️⃣ Zainstaluj zależności Node.js
```bash
npm install
```

**Wymagane pakiety:**
- next==14.2.15
- react==18.3.1
- react-dom==18.3.1
- typescript==5.5.4
- eslint==8.57.0

### 4️⃣ Konfiguruj zmienne środowiskowe

Skopiuj plik `.env.example` do `.env`:
```bash
cp .env.example .env
```

Edytuj `.env` i dodaj swoje tokeny:
```env
# Hugging Face Token
# Pobierz z: https://huggingface.co/settings/tokens
HF_TOKEN=hf_your_token_here

# OpenAI API Key
# Pobierz z: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk_your_key_here

# Modele AI (opcjonalne - już są domyślne)
HF_MODEL_ID=mistralai/Mistral-7B-Instruct-v0.1
HF_IMAGE_MODEL=stabilityai/stable-diffusion-xl-base-1.0

# Baza danych
DATABASE=learning_data.db
```

### 5️⃣ Uruchom aplikację

**Opcja A: W dwóch osobnych terminalach**

Terminal 1 - Backend:
```bash
bash run.sh
```
Backend będzie dostępny na: `http://localhost:7860`

Terminal 2 - Frontend:
```bash
npm run dev
```
Frontend będzie dostępny na: `http://localhost:3000`

**Opcja B: Za pomocą Docker**
```bash
docker build -t agent-nauki .
docker run -p 7860:7860 -p 3000:3000 --env-file .env agent-nauki
```

## ✅ Sprawdzenie instalacji

1. **Backend health check:**
   ```bash
   curl http://localhost:7860/health
   ```
   Powinno zwrócić: `{"status":"ok","service":"Agent Nauki Backend"}`

2. **Otwórz aplikację w przeglądarce:**
   - Frontend: http://localhost:3000
   - API dokumentacja: http://localhost:7860/docs (Swagger UI)

## 🔐 Pobranie tokenów

### Hugging Face Token
1. Wejdź na https://huggingface.co/settings/tokens
2. Kliknij "New token"
3. Wybierz `read` access
4. Skopiuj token i wstaw do `.env`

### OpenAI API Key
1. Wejdź na https://platform.openai.com/api-keys
2. Kliknij "Create new secret key"
3. Skopiuj klucz i wstaw do `.env`

## 🛠️ Troubleshooting

### Problem: "ModuleNotFoundError: No module named 'fastapi'"
**Rozwiązanie:**
```bash
pip install -r requirements.txt
```

### Problem: "npm: command not found"
**Rozwiązanie:** Zainstaluj Node.js z https://nodejs.org/

### Problem: "Port 7860 już w użyciu"
**Rozwiązanie:** Zmień port w `run.sh`:
```bash
uvicorn backend:app --host 0.0.0.0 --port 8000
```

### Problem: CORS errors w przeglądarce
**Rozwiązanie:** Backend ma już CORS włączony, ale sprawdź czy oba serwery są uruchomione

### Problem: API nie generuje zadań
**Rozwiązanie:** Sprawdź czy tokeny w `.env` są poprawne

## 📚 API Endpoints

| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | `/health` | Health check |
| POST | `/api/generate-task` | Generuj nowe zadanie |
| POST | `/api/check-answer` | Sprawdź odpowiedź |
| POST | `/api/hint` | Pobierz podpowiedź |
| POST | `/api/generate-image` | Generuj ilustrację |
| GET | `/api/stats/{user_id}` | Pokaż statystyki |

## 📝 Notatki

- ❌ Nie commituj `.env` do repozytorium!
- ✅ Commituj tylko `.env.example`
- 🔒 Trzymaj tokeny w bezpiecznym miejscu
- 🚀 Na produkcji użyj GitHub Secrets lub Hugging Face Spaces Secrets

## 🎯 Następne kroki

Po uruchomieniu aplikacji możesz:
1. Testować różne przedmioty (Matematyka, Polski)
2. Wybierać poziomy trudności (1-3)
3. Generować zadania i odpowiadać na nie
4. Uzyskiwać feedback z AI
5. Śledzić swoje postępy

---

**Autor:** emiliaw24-maker  
**Wersja:** 2.0.0  
**Status:** 🚀 Production Ready
