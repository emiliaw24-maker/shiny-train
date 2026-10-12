"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE = "";

type Subject = "matematyka" | "polski";
type Task = {
  question: string;
  answer: string;
  image?: string | null;
  subject?: string;
  level?: number;
};

const levelLabels: Record<number, string> = { 1: "Łatwy", 2: "Średni", 3: "Trudny" };

async function readApiResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || data.message || `Błąd serwera (${response.status})`);
  return data;
}

export default function HomePage() {
  const [subject, setSubject] = useState<Subject>("matematyka");
  const [level, setLevel] = useState(1);
  const [task, setTask] = useState<Task | null>(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const levelName = useMemo(() => levelLabels[level] || "Łatwy", [level]);

  const fetchTask = async () => {
    setLoading(true);
    setHint("");
    setFeedback("");
    try {
      const response = await fetch(`${API_BASE}/api/generate-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, level, user_id: 1 }),
      });
      const data = await readApiResponse(response);
      setTask(data);
      setAnswer("");
    } catch (error) {
      console.error(error);
      setTask({ question: "Nie udało się załadować zadania. Sprawdź połączenie i spróbuj ponownie.", answer: "" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTask();
    // fetchTask depends on current selection; these are the intended triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, level]);

  const handleCheck = async () => {
    if (!task) return;
    if (!answer.trim()) {
      setFeedback("Wpisz odpowiedź!");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/check-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, task_id: 1, user_answer: answer, correct_answer: task.answer, question: task.question }),
      });
      const data = await readApiResponse(response);
      if (data.is_correct) setScore((prev) => prev + 1);
      setFeedback(data.feedback || (data.is_correct ? "Poprawnie!" : "Spróbuj ponownie."));
      window.setTimeout(() => { void fetchTask(); }, 1500);
    } catch (error) {
      console.error(error);
      setFeedback("Błąd sprawdzania odpowiedzi. Spróbuj ponownie.");
    }
  };

  const handleHint = async () => {
    if (!task) return;
    try {
      const response = await fetch(`${API_BASE}/api/hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: task.question, subject }),
      });
      const data = await readApiResponse(response);
      setHint(data.hint || "Brak podpowiedzi.");
    } catch (error) {
      console.error(error);
      setHint("Nie udało się pobrać podpowiedzi.");
    }
  };

  const handleGenerateImage = async () => {
    if (!task) return;
    setImageLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: task.question, subject, task: task.question }),
      });
      const data = await readApiResponse(response);
      if (data.image) setTask((prev) => prev ? { ...prev, image: data.image } : prev);
      else setFeedback(data.message || "Nie udało się wygenerować ilustracji.");
    } catch (error) {
      console.error(error);
      setFeedback("Błąd generowania obrazu.");
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="app-card">
        <header className="topbar">
          <div className="brand-wrap">
            <div className="brand-badge">🧠</div>
            <div><p className="eyebrow">Tutor edukacyjny</p><h1>Agent Nauki</h1></div>
          </div>
          <div className="score-box"><span>Wynik</span><strong>{score}</strong><small>Poziom {level}</small></div>
        </header>

        <section className="selector-block">
          <div className="subject-selector">
            <button className={subject === "matematyka" ? "pill active" : "pill"} onClick={() => setSubject("matematyka")}>📐 Matematyka</button>
            <button className={subject === "polski" ? "pill active" : "pill"} onClick={() => setSubject("polski")}>📖 Polski</button>
          </div>
          <div className="levels-row">
            {[1, 2, 3].map((item) => (
              <button key={item} className={level === item ? "pill active" : "pill"} onClick={() => setLevel(item)}>Poziom {item}</button>
            ))}
          </div>
        </section>

        <section className="task-card">
          <div className="task-head"><span className="task-label">Zadanie</span><span className="chip">{levelName}</span></div>
          <h2>{loading ? "Ładowanie zadania..." : task?.question}</h2>
          <div className="answer-row">
            <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Wpisz odpowiedź" aria-label="Odpowiedź" onKeyDown={(e) => { if (e.key === "Enter") void handleCheck(); }} />
            <button onClick={() => void handleCheck()} disabled={loading || !task?.answer}>Sprawdź</button>
            <button className="secondary" onClick={() => void handleHint()} disabled={loading || !task}>💡 Podpowiedź</button>
          </div>
          {feedback ? <p className="feedback" role="status">{feedback}</p> : null}
          {hint ? <p className="hint" role="status">{hint}</p> : null}
        </section>

        <section className="image-card">
          <div className="image-head">
            <h3>📸 Ilustracja do zadania</h3>
            <button className="secondary" onClick={() => void handleGenerateImage()} disabled={imageLoading || !task}>{imageLoading ? "Generowanie..." : "Generuj obraz"}</button>
          </div>
          <div className="image-frame">
            <img src={task?.image || "https://images.unsplash.com/photo-1503676260728-1d2f6b2f0b6d?auto=format&fit=crop&w=1200&q=80"} alt="Ilustracja edukacyjna" />
          </div>
        </section>
      </div>
    </main>
  );
}
