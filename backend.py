import base64
import json
import os
import random
import re
import sqlite3
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(title="Agent Nauki API", version="2.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_TOKEN = os.getenv("HF_TOKEN", "").strip()
HF_MODEL_ID = os.getenv("HF_MODEL_ID", "mistralai/Mistral-7B-Instruct-v0.1").strip()
HF_IMAGE_MODEL = os.getenv("HF_IMAGE_MODEL", "stabilityai/stable-diffusion-xl-base-1.0").strip()
DATABASE = os.getenv("DATABASE", "learning_data.db")

FALLBACK_TASKS = {
    "matematyka": {
        1: [("Ile to 7 + 5?", "12"), ("Ile to 9 - 4?", "5"), ("Ile to 3 × 4?", "12")],
        2: [("Ile to 36 ÷ 4?", "9"), ("Ile to 27 + 18?", "45"), ("Ile to 8 × 7?", "56")],
        3: [("Ile to 125 - 68?", "57"), ("Ile to 12 × 13?", "156"), ("Ile to 144 ÷ 12?", "12")],
    },
    "polski": {
        1: [("Jaką literą zaczyna się słowo „kot”?", "k"), ("Podaj liczbę mnogą słowa „dom”.", "domy"), ("Jakie to zwierzę: miauczy i łapie myszy?", "kot")],
        2: [("Wskaż czasownik w zdaniu: „Ala czyta książkę”.", "czyta"), ("Jaki jest przeciwieństwo słowa „wysoki”?", "niski"), ("Uzupełnij: „___ książka leży na stole” (ta/ten).", "ta")],
        3: [("Jak nazywa się osoba, która pisze książki?", "pisarz"), ("Podaj przymiotnik w zdaniu: „Mały pies szybko biegnie”.", "mały"), ("Jaki jest synonim słowa „wesoły”?", "radosny")],
    },
}


class TaskRequest(BaseModel):
    subject: str = "matematyka"
    level: int = Field(default=1, ge=1, le=3)
    user_id: int = 1


class AnswerRequest(BaseModel):
    user_id: int = 1
    task_id: int = 1
    user_answer: str
    correct_answer: str
    question: str = ""


class HintRequest(BaseModel):
    question: str
    subject: str = "matematyka"


class ImageRequest(BaseModel):
    prompt: str = ""
    subject: str = "matematyka"
    task: str = ""


def init_db() -> None:
    try:
        with sqlite3.connect(DATABASE) as connection:
            connection.execute(
                """CREATE TABLE IF NOT EXISTS answer_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    question TEXT NOT NULL,
                    user_answer TEXT NOT NULL,
                    is_correct INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )"""
            )
    except sqlite3.Error:
        # The API remains usable if a read-only deployment filesystem prevents SQLite writes.
        pass


def ask_huggingface(prompt: str, max_tokens: int = 180) -> Optional[str]:
    if not HF_TOKEN:
        return None
    try:
        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers={"Authorization": f"Bearer {HF_TOKEN}", "Content-Type": "application/json"},
            json={
                "model": HF_MODEL_ID,
                "messages": [
                    {"role": "system", "content": "Jesteś cierpliwym polskim nauczycielem dla dzieci. Odpowiadaj krótko, jasno i bezpiecznie."},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": max_tokens,
                "temperature": 0.7,
            },
            timeout=25,
        )
        if not response.ok:
            return None
        payload = response.json()
        return payload.get("choices", [{}])[0].get("message", {}).get("content", "").strip() or None
    except (requests.RequestException, ValueError, KeyError, IndexError):
        return None


def normalize_answer(value: str) -> str:
    value = value.strip().lower().replace("×", "x").replace(",", ".")
    value = re.sub(r"^[\s\"'„”]+|[\s\"'„”?!.,;:]+$", "", value)
    return re.sub(r"\s+", " ", value)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/health")
def health():
    return {"status": "ok", "service": "Agent Nauki API", "hf_token_configured": bool(HF_TOKEN)}


@app.post("/api/generate-task")
def generate_task(request: TaskRequest):
    subject = request.subject if request.subject in FALLBACK_TASKS else "matematyka"
    level = request.level if request.level in (1, 2, 3) else 1
    prompt = (
        f"Utwórz jedno krótkie zadanie dla dziecka uczącego się po polsku. "
        f"Przedmiot: {subject}; poziom trudności {level}. "
        'Zwróć wyłącznie JSON w formacie {"question":"treść","answer":"odpowiedź"}.'
    )
    generated = ask_huggingface(prompt, 160)
    if generated:
        try:
            cleaned = generated[generated.find("{"):generated.rfind("}") + 1]
            data = json.loads(cleaned)
            if isinstance(data.get("question"), str) and isinstance(data.get("answer"), (str, int, float)):
                return {
                    "question": data["question"].strip(),
                    "answer": str(data["answer"]).strip(),
                    "image": None,
                    "subject": subject,
                    "level": level,
                }
        except (ValueError, AttributeError):
            pass
    question, answer = random.choice(FALLBACK_TASKS[subject][level])
    return {"question": question, "answer": answer, "image": None, "subject": subject, "level": level}


@app.post("/api/check-answer")
def check_answer(request: AnswerRequest):
    correct = normalize_answer(request.user_answer) == normalize_answer(request.correct_answer)
    feedback = "Świetnie! To poprawna odpowiedź! 🎉" if correct else f"Jeszcze nie tym razem. Spróbuj ponownie. Poprawna odpowiedź: {request.correct_answer}"
    try:
        with sqlite3.connect(DATABASE) as connection:
            connection.execute(
                "INSERT INTO answer_history (user_id, question, user_answer, is_correct) VALUES (?, ?, ?, ?)",
                (request.user_id, request.question, request.user_answer, int(correct)),
            )
    except sqlite3.Error:
        pass
    return {"is_correct": correct, "feedback": feedback}


@app.post("/api/hint")
def hint(request: HintRequest):
    generated = ask_huggingface(
        f"Daj jedną krótką podpowiedź po polsku do zadania: {request.question}. "
        "Nie podawaj od razu gotowej odpowiedzi."
    , 100)
    if generated:
        return {"hint": generated}
    if request.subject == "matematyka":
        return {"hint": "Przeczytaj działanie uważnie i rozwiąż je po kolei. Możesz policzyć na palcach lub zapisać kroki."}
    return {"hint": "Przeczytaj zdanie jeszcze raz. Zastanów się, jaką rolę pełni dane słowo i czy pasuje do całego zdania."}


@app.post("/api/generate-image")
def generate_image(request: ImageRequest):
    if not HF_TOKEN:
        return {"image": None, "message": "Dodaj HF_TOKEN w sekretach, aby włączyć generowanie ilustracji."}
    prompt = (
        "Friendly simple educational illustration for a child, no text, colorful, clear objects. "
        + (request.prompt or request.task or "school learning")
    )
    try:
        response = requests.post(
            f"https://router.huggingface.co/hf-inference/models/{HF_IMAGE_MODEL}",
            headers={"Authorization": f"Bearer {HF_TOKEN}", "Content-Type": "application/json"},
            json={"inputs": prompt},
            timeout=60,
        )
        if not response.ok or not response.headers.get("content-type", "").startswith("image/"):
            return {"image": None, "message": "Nie udało się wygenerować ilustracji. Spróbuj ponownie później."}
        mime = response.headers.get("content-type", "image/png").split(";")[0]
        encoded = base64.b64encode(response.content).decode("ascii")
        return {"image": f"data:{mime};base64,{encoded}", "message": "Ilustracja gotowa!"}
    except requests.RequestException:
        return {"image": None, "message": "Usługa ilustracji jest chwilowo niedostępna."}


@app.get("/api/stats/{user_id}")
def stats(user_id: int):
    try:
        with sqlite3.connect(DATABASE) as connection:
            row = connection.execute(
                "SELECT COUNT(*), COALESCE(SUM(is_correct), 0) FROM answer_history WHERE user_id = ?",
                (user_id,),
            ).fetchone()
        total, correct = row or (0, 0)
        return {"user_id": user_id, "answered": total, "correct": correct}
    except sqlite3.Error:
        return {"user_id": user_id, "answered": 0, "correct": 0}
