from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import sqlite3
import requests
import base64
import random

app = FastAPI(title="Agent Nauki API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_TOKEN = os.getenv("HF_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HF_MODEL_ID = os.getenv("HF_MODEL_ID", "mistralai/Mistral-7B-Instruct-v0.1")
HF_IMAGE_MODEL = os.getenv("HF_IMAGE_MODEL", "stabilityai/stable-diffusion-xl-base-1.0")
DB_FILE = "learning_data.db"


def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            subject TEXT,
            question TEXT,
            correct_answer TEXT,
            user_answer TEXT,
            is_correct BOOLEAN,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            role TEXT,
            message TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    conn.commit()
    conn.close()


init_db()


class GenerateTaskRequest(BaseModel):
    subject: str = "matematyka"
    level: int = 1
    user_id: int = 1


class CheckAnswerRequest(BaseModel):
    user_id: int
    task_id: int
    user_answer: str
    correct_answer: str
    question: str


class HintRequest(BaseModel):
    question: str
    subject: str


class ChatRequest(BaseModel):
    user_id: int
    message: str


class GenerateImageRequest(BaseModel):
    prompt: str
    subject: str = "matematyka"
    task: str = "zadanie edukacyjne"


def generate_fallback_task(prompt: str, level: int = 1) -> str:
    math_easy = [
        "Pytanie: Ile to 7 + 5?\nOdpowiedź: 12",
        "Pytanie: Ile to 9 × 3?\nOdpowiedź: 27",
        "Pytanie: Jaki jest wynik: 15 - 8?\nOdpowiedź: 7",
        "Pytanie: Ile to 20 ÷ 4?\nOdpowiedź: 5",
    ]
    math_medium = [
        "Pytanie: Ile to 12 × 6?\nOdpowiedź: 72",
        "Pytanie: Jaki jest wynik: 45 + 17?\nOdpowiedź: 62",
        "Pytanie: Ile to 72 ÷ 8?\nOdpowiedź: 9",
        "Pytanie: Co to jest 3/4 z 40?\nOdpowiedź: 30",
    ]
    math_hard = [
        "Pytanie: Ile to 18 × 12?\nOdpowiedź: 216",
        "Pytanie: Jaki jest wynik: 144 ÷ 12?\nOdpowiedź: 12",
        "Pytanie: Oblicz: 2/3 z 90.\nOdpowiedź: 60",
        "Pytanie: Ile to 25 + 16 × 2?\nOdpowiedź: 57",
    ]

    polish_easy = [
        "Pytanie: Wskaż poprawną pisownię: 'dziecko' czy 'dziećko'?\nOdpowiedź: dziecko",
        "Pytanie: Jak poprawnie napisać: 'mama' czy 'mamaa'?\nOdpowiedź: mama",
        "Pytanie: Czy poprawnie brzmi: 'Idę do szkoły'?\nOdpowiedź: tak",
    ]
    polish_medium = [
        "Pytanie: Wskaż poprawne zdanie: 'Kasia idzie do szkoły.' czy 'Kasia ide do szkoły.'?\nOdpowiedź: Kasia idzie do szkoły.",
        "Pytanie: Jak poprawnie napisać: 'wesoły' czy 'wesołyy'?\nOdpowiedź: wesoły",
        "Pytanie: Co jest poprawne: 'napisałem' czy 'napisłem'?\nOdpowiedź: napisałem",
    ]
    polish_hard = [
        "Pytanie: Uzupełnij zdanie: 'Po południu ... do parku.'\nOdpowiedź: poszłam",
        "Pytanie: Która forma jest poprawna: 'zawiozę' czy 'zawieżę'?\nOdpowiedź: zawiozę",
        "Pytanie: Utwórz poprawną formę: 'mój przyjaciel' w narzędniku.\nOdpowiedź: moim przyjacielem",
    ]

    if 'matematyka' in prompt.lower():
        options = math_easy if level == 1 else math_medium if level == 2 else math_hard
    else:
        options = polish_easy if level == 1 else polish_medium if level == 2 else polish_hard

    return random.choice(options)


def query_hf_llm(prompt: str) -> str:
    if not HF_TOKEN:
        return generate_fallback_task(prompt)

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {
        "inputs": prompt,
        "parameters": {"max_length": 512, "temperature": 0.7, "top_p": 0.95, "do_sample": True}
    }

    try:
        r = requests.post(f"https://api-inference.huggingface.co/models/{HF_MODEL_ID}", headers=headers, json=payload, timeout=30)
        if r.status_code == 200:
            result = r.json()
            if isinstance(result, list) and result and isinstance(result[0], dict):
                return result[0].get("generated_text", generate_fallback_task(prompt))
            if isinstance(result, dict):
                if "generated_text" in result:
                    return result["generated_text"]
        return generate_fallback_task(prompt)
    except Exception as e:
        print("HF error:", e)
        return generate_fallback_task(prompt)


def query_openai(prompt: str, system_role: str = "You are a friendly Polish learning tutor.") -> str:
    if not OPENAI_API_KEY:
        return "Świetnie! Kontynuuj naukę."

    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_role},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 256,
    }

    try:
        r = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=30)
        if r.status_code == 200:
            data = r.json()
            return data["choices"][0]["message"]["content"]
        return "Wystąpił problem z modelem. Spróbuj ponownie."
    except Exception as e:
        print("OpenAI error:", e)
        return "Dobrze! Kontynuuj naukę."


def save_task(user_id: int, subject: str, question: str, correct_answer: str, user_answer: str, is_correct: bool):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(
        '''INSERT INTO tasks (user_id, subject, question, correct_answer, user_answer, is_correct) VALUES (?, ?, ?, ?, ?, ?)''',
        (user_id, subject, question, correct_answer, user_answer, int(is_correct)),
    )
    conn.commit()
    conn.close()


def save_chat(user_id: int, role: str, message: str):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''INSERT INTO chat_history (user_id, role, message) VALUES (?, ?, ?)''', (user_id, role, message))
    conn.commit()
    conn.close()


def get_stats(user_id: int):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('SELECT COUNT(*) FROM tasks WHERE user_id = ?', (user_id,))
    total = c.fetchone()[0]
    c.execute('SELECT COUNT(*) FROM tasks WHERE user_id = ? AND is_correct = 1', (user_id,))
    correct = c.fetchone()[0]
    c.execute('SELECT subject, COUNT(*), SUM(is_correct) FROM tasks WHERE user_id = ? GROUP BY subject', (user_id,))
    rows = c.fetchall()
    conn.close()

    accuracy = round((correct / total) * 100, 2) if total else 0
    return {
        "total_tasks": total,
        "correct_tasks": correct,
        "accuracy": accuracy,
        "subjects": [{"name": r[0], "total": r[1], "correct": r[2] or 0} for r in rows],
    }


def generate_placeholder_svg(prompt: str) -> str:
    safe = prompt.replace("&", "and")[:60]
    svg = f"""
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'>
      <defs>
        <linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stop-color='#eef3ff'/>
          <stop offset='100%' stop-color='#dfe8ff'/>
        </linearGradient>
      </defs>
      <rect width='1200' height='700' fill='url(#bg)'/>
      <circle cx='210' cy='180' r='90' fill='#ffd98d' opacity='0.9'/>
      <rect x='130' y='290' width='170' height='150' rx='22' fill='#7c8cff' opacity='0.9'/>
      <rect x='360' y='220' width='160' height='115' rx='18' fill='#7ce0b8' opacity='0.9'/>
      <rect x='560' y='300' width='180' height='140' rx='22' fill='#ffb5d8' opacity='0.9'/>
      <rect x='790' y='210' width='170' height='150' rx='18' fill='#ffd98d' opacity='0.9'/>
      <rect x='980' y='290' width='120' height='110' rx='18' fill='#8dc9ff' opacity='0.9'/>
      <text x='600' y='620' text-anchor='middle' font-family='Arial' font-size='38' fill='#2d3b7a' font-weight='700'>{safe}</text>
      <text x='600' y='110' text-anchor='middle' font-family='Arial' font-size='56' fill='#2d3b7a' font-weight='700'>Agent Nauki</text>
    </svg>
    """
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode("utf-8")).decode("utf-8")


def generate_image_from_hf(prompt: str) -> str:
    if not HF_TOKEN:
        return generate_placeholder_svg(prompt)

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {
        "inputs": prompt,
        "parameters": {"num_inference_steps": 25, "guidance_scale": 7.5, "height": 768, "width": 768},
    }

    try:
        r = requests.post(
            f"https://api-inference.huggingface.co/models/{HF_IMAGE_MODEL}",
            headers=headers,
            json=payload,
            timeout=120,
        )
        if r.status_code == 200 and "image" in r.headers.get("content-type", "").lower():
            return "data:image/png;base64," + base64.b64encode(r.content).decode("utf-8")
    except Exception as e:
        print("Image error:", e)

    return generate_placeholder_svg(prompt)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "hf": bool(HF_TOKEN),
        "openai": bool(OPENAI_API_KEY),
        "hf_model": HF_MODEL_ID,
    }


@app.post("/api/generate-task")
def generate_task(req: GenerateTaskRequest):
    prompt = (
        f"Generate a {req.subject} learning task for level {req.level}. "
        "Format: Pytanie: ...\nOdpowiedź: ..."
    )
    raw = query_hf_llm(prompt)
    lines = [line.strip() for line in raw.splitlines() if line.strip()]

    question = next(
        (
            line.replace("Pytanie:", "").replace("Question:", "").strip()
            for line in lines
            if "Pytanie:" in line or "Question:" in line
        ),
        generate_fallback_task(prompt, req.level).split("\n")[0].replace("Pytanie: ", ""),
    )

    answer = next(
        (
            line.replace("Odpowiedź:", "").replace("Answer:", "").strip()
            for line in lines
            if "Odpowiedź:" in line or "Answer:" in line
        ),
        generate_fallback_task(prompt, req.level).split("\n")[1].replace("Odpowiedź: ", ""),
    )

    image = generate_image_from_hf(f"{req.subject} educational illustration for level {req.level}: {question}")
    return {
        "question": question,
        "answer": answer,
        "subject": req.subject,
        "level": req.level,
        "image": image,
        "message": "Zadanie wygenerowane.",
    }


@app.post("/api/check-answer")
def check_answer(req: CheckAnswerRequest):
    ok = req.user_answer.strip().lower() == req.correct_answer.strip().lower()
    save_task(req.user_id, "quiz", req.question, req.correct_answer, req.user_answer, ok)

    if ok:
        prompt = f"Student answered correctly to: {req.question}. Give a brief encouraging message in Polish."
    else:
        prompt = f"Student answered '{req.user_answer}' to '{req.question}'. Correct answer is '{req.correct_answer}'. Give a brief explanation in Polish and encourage them."

    feedback = query_openai(prompt, "You are a helpful Polish learning tutor.")
    return {
        "is_correct": ok,
        "feedback": feedback,
        "correct_answer": req.correct_answer,
        "message": "Poprawnie!" if ok else "Spróbuj jeszcze raz.",
    }


@app.post("/api/hint")
def hint(req: HintRequest):
    prompt = f"Give a helpful hint in Polish for this {req.subject} task: {req.question}"
    return {"hint": query_openai(prompt, "You are a friendly Polish learning tutor.")}


@app.post("/api/chat")
def chat(req: ChatRequest):
    save_chat(req.user_id, "user", req.message)
    response = query_openai(req.message, "You are a friendly Polish learning tutor. Keep answers concise and encouraging.")
    save_chat(req.user_id, "assistant", response)
    return {"response": response}


@app.get("/api/stats/{user_id}")
def stats(user_id: int):
    return get_stats(user_id)


@app.post("/api/generate-image")
def generate_image(req: GenerateImageRequest):
    return {
        "image": generate_image_from_hf(req.prompt),
        "message": "Ilustracja wygenerowana." if HF_TOKEN else "Tryb lokalny: placeholder.",
    }


app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend:app", host="0.0.0.0", port=7860, reload=False)
