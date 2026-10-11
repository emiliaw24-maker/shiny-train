# 🎓 Agent Nauki - Przewodnik Instalacji (PL)

## ⚡ Szybki start

### Wymagania
- Python 3.9+
- Node.js 18+
- pip
- npm

### Instalacja w 5 minut

```bash
# 1. Klonowanie
git clone https://github.com/emiliaw24-maker/shiny-train.git
cd shiny-train

# 2. Backend
pip install -r requirements.txt

# 3. Frontend
npm install

# 4. Konfiguracja
cp .env.example .env
# ⚠️ WAŻNE: Edytuj .env i dodaj HF_TOKEN oraz OPENAI_API_KEY

# 5. Uruchamianie (w dwóch terminalach)
# Terminal 1:
bash run.sh

# Terminal 2:
npm run dev
```

## 📍 Gdzie uruchamiać

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:7860
- **Dokumentacja API:** http://localhost:7860/docs

## 🔑 Tokeny (OBOWIĄZKOWE)

Bez tokenów aplikacja nie będzie działać!

### HF_TOKEN (Hugging Face)
1. https://huggingface.co/settings/tokens
2. Stwórz nowy token (read)
3. Skopiuj do `.env` → HF_TOKEN=...

### OPENAI_API_KEY (OpenAI)
1. https://platform.openai.com/api-keys
2. Stwórz nowy klucz
3. Skopiuj do `.env` → OPENAI_API_KEY=...

## ✅ Test działania

```bash
# Sprawdzenie backendu
curl http://localhost:7860/health
# Powinno: {"status":"ok","service":"Agent Nauki Backend"}

# Sprawdzenie frontendu
# Otwórz http://localhost:3000 w przeglądarce
```

## 🐛 Problemy?

| Problem | Rozwiązanie |
|---------|------------|
| `ModuleNotFoundError` | `pip install -r requirements.txt` |
| `npm not found` | Zainstaluj Node.js z nodejs.org |
| Port 7860 w użyciu | Zmień port w `run.sh` |
| CORS error | Sprawdź czy backend działa |
| Brak zadań | Sprawdź tokeny w `.env` |

## 🚀 Deploy

### Hugging Face Spaces
```bash
git remote add hf https://huggingface.co/spaces/YOUR_USER/agent-nauki
git push hf main
```

### Docker
```bash
docker build -t agent-nauki .
docker run -p 7860:7860 -p 3000:3000 --env-file .env agent-nauki
```

---

💡 **Potrzebujesz pomocy?** Otwórz issue na GitHubie!
