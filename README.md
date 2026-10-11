# Agent Nauki 🧮📚

Aplikacja edukacyjna do nauki matematyki i polskiego z AI.

## Funkcje
- generowanie zadań przez Hugging Face
- feedback od ChatGPT
- podpowiedzi do zadań
- generowanie ilustracji do zadań
- prosty wynik i statystyki

## Uruchomienie
```bash
pip install -r requirements.txt
bash run.sh
```

Otwórz: http://localhost:7860

## Zmienne środowiskowe
Skopiuj `.env.example` do `.env` i uzupełnij tokeny.

## Deploy na Hugging Face Spaces
- stwórz nowy Space
- dodaj sekrety: `HF_TOKEN`, `OPENAI_API_KEY`
- użyj Docker/uvicorn do uruchomienia backendu

## Ważne
Nie wrzucaj `.env` do repozytorium.
