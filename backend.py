from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import sqlite3
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Agent Nauki", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE = os.getenv("DATABASE", "learning_data.db")


class GenerateTaskRequest(BaseModel):
    subject: str
    level: int
    user_id: int


class CheckAnswerRequest(BaseModel):
    user_id: int
    task_id: int
    user_answer: str
    correct_answer: str
    question: str


class HintRequest(BaseModel):
    question: str
    subject: str


class GenerateImageRequest(BaseModel):
    prompt: str
    subject: str
    task: str


def init_db() -> None:
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            subject TEXT,
            level INTEGER,
            correct_count INTEGER DEFAULT 0,
            total_count INTEGER DEFAULT 0,
            score INTEGER DEFAULT 0,
            updated_at TEXT
        )
        """
    )
    conn.commit()
    conn.close()


init_db()


def normalize_answer(value: str) -> str:
    return " ".join(value.strip().lower().split())


def get_fallback_task(subject: str, level: int) -> dict:
    subject_map = {
        "matematyka": {
            1: {"question": "Ile to jest 7 + 5?", "answer": "12"},
            2: {"question": "Oblicz: 12 × 4", "answer": "48"},
            3: {"question": "Rozwiąż: 3x = 18", "answer": "6"},
        },
        "polski": {
            1: {"question": "Jaki jest antonim słowa 'dobry'?", "answer": "zły"},
            2: {"question": "Uzupełnij: 'Książka jest ___ czytania.'", "answer": "do"},
            3: {"question": "Napisz rzeczownik w liczbie mnogiej od 'dom'.", "answer": "domy"},
        },
    }

    if subject not in subject_map or level not in subject_map[subject]:
        return {"question": f"Zadanie z {subject} na poziomie {level}.", "answer": "odpowiedź"}

    return subject_map[subject][level]


def generate_image_url(prompt: str) -> str:
    fallback = "https://images.unsplash.com/photo-1503676260728-1d2f6b2f0b6d?auto=format&fit=crop&w=1200&q=80"
    return fallback


def update_progress(user_id: int, subject: str, level: int, is_correct: bool) -> None:
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    row = cursor.execute(
        "SELECT correct_count, total_count, score FROM progress WHERE user_id = ? AND subject = ? AND level = ?",
        (user_id, subject, level),
    ).fetchone()

    now = datetime.utcnow().isoformat()

    if row:
        correct_count, total_count, _ = row
        correct_count += 1 if is_correct else 0
        total_count += 1
        score = correct_count
        cursor.execute(
            "UPDATE progress SET correct_count = ?, total_count = ?, score = ?, updated_at = ? WHERE user_id = ? AND subject = ? AND level = ?",
            (correct_count, total_count, score, now, user_id, subject, level),
        )
    else:
        correct_count = 1 if is_correct else 0
        total_count = 1
        score = correct_count
        cursor.execute(
            "INSERT INTO progress (user_id, subject, level, correct_count, total_count, score, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, subject, level, correct_count, total_count, score, now),
        )

    conn.commit()
    conn.close()


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "Agent Nauki Backend"}


@app.post("/api/generate-task")
def generate_task(request: GenerateTaskRequest) -> dict:
    task = get_fallback_task(request.subject, request.level)
    return {
        "question": task["question"],
        "answer": task["answer"],
        "image": generate_image_url(task["question"]),
        "subject": request.subject,
        "level": request.level,
    }


@app.post("/api/check-answer")
def check_answer(request: CheckAnswerRequest) -> dict:
    is_correct = normalize_answer(request.user_answer) == normalize_answer(request.correct_answer)
    feedback = (
        "🎉 Poprawnie! Świetna robota!"
        if is_correct
        else f"❌ Niepoprawnie. Poprawna odpowiedź to: {request.correct_answer}"
    )

    update_progress(request.user_id, "matematyka", 1, is_correct)

    return {
        "is_correct": is_correct,
        "feedback": feedback,
        "correct_answer": request.correct_answer,
    }


@app.post("/api/hint")
def hint(request: HintRequest) -> dict:
    hint_text = "Zastanów się, co najważniejsze wynika z treści zadania. Spróbuj rozbić problem na mniejsze części."
    return {"hint": hint_text}


@app.post("/api/generate-image")
def generate_image(request: GenerateImageRequest) -> dict:
    return {
        "image": generate_image_url(request.prompt),
        "message": "Obraz edukacyjny gotowy.",
    }


@app.get("/api/stats/{user_id}")
def get_stats(user_id: int) -> dict:
    conn = sqlite3.connect(DATABASE)
    rows = conn.execute(
        "SELECT subject, level, correct_count, total_count, score FROM progress WHERE user_id = ?",
        (user_id,),
    ).fetchall()
    conn.close()

    return {
        "user_id": user_id,
        "progress": [
            {
                "subject": row[0],
                "level": row[1],
                "correct": row[2],
                "total": row[3],
                "score": row[4],
            }
            for row in rows
        ],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=7860)


"""

"""
"""
"""
"""
"""
"""
"""
"""
"""
"""
"""
"""
"""
"""
"""
"""
"""
"""

"""
"""
"""
"""
"""
"""
"""

