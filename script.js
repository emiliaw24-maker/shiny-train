:root {
  --bg-1: #f3f6ff;
  --bg-2: #eefaf5;
  --panel: rgba(255, 255, 255, 0.9);
  --primary: #5f6fff;
  --primary-strong: #3d49d1;
  --primary-soft: #eef1ff;
  --secondary: #ffb85c;
  --secondary-soft: #fff2db;
  --success: #21b26b;
  --danger: #e65d5d;
  --text: #1f2a37;
  --muted: #64748b;
  --stroke: rgba(148, 163, 184, 0.25);
  --shadow: 0 24px 60px rgba(31, 42, 55, 0.12);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--bg-1), var(--bg-2));
  color: var(--text);
  font-family: "Segoe UI", Arial, sans-serif;
}

button, input {
  font: inherit;
}

.app-shell {
  width: min(900px, 94vw);
  padding: 1rem 0 2rem;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.brand-wrap {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-badge {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary), #79a5ff);
  color: white;
  display: grid;
  place-items: center;
  font-weight: 800;
  box-shadow: 0 12px 28px rgba(95, 111, 255, 0.35);
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  font-size: 0.72rem;
}

h1 {
  margin: 0.2rem 0 0;
  font-size: clamp(2rem, 4vw, 3rem);
}

.score-box {
  background: rgba(255,255,255,0.7);
  border: 1px solid var(--stroke);
  backdrop-filter: blur(8px);
  border-radius: 18px;
  padding: 0.9rem 1.1rem;
  box-shadow: 0 18px 35px rgba(95, 111, 255, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.score-box span,
.score-box small {
  color: var(--muted);
}

.score-box strong {
  font-size: 1.9rem;
  line-height: 1.2;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--stroke);
  border-radius: 30px;
  padding: 1.6rem;
  box-shadow: var(--shadow);
}

.selector-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.subject-selector,
.level-selector {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.subject-btn,
.level-btn,
.secondary-btn,
#check-btn {
  border: none;
  border-radius: 999px;
  padding: 0.82rem 1.14rem;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s ease;
}

.subject-btn,
.level-btn {
  background: #edf2ff;
  color: var(--text);
}

.subject-btn.active,
.level-btn.active,
#check-btn {
  background: linear-gradient(135deg, var(--primary), #7a8dff);
  color: white;
  box-shadow: 0 12px 24px rgba(95, 111, 255, 0.22);
}

.task-card {
  border: 1px solid var(--stroke);
  background: linear-gradient(180deg, #fafbff, #f7f9ff);
  border-radius: 26px;
  padding: 1.4rem;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
}

.task-topline {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.8rem;
}

.task-label {
  margin: 0;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.74rem;
  font-weight: 700;
}

.difficulty-chip {
  background: var(--secondary-soft);
  color: #9a5b00;
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 800;
}

#task-text {
  margin: 0 0 1.2rem;
  font-size: clamp(1.5rem, 2vw, 2.25rem);
  line-height: 1.3;
}

.answer-row {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

input {
  flex: 1;
  min-width: 180px;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(148, 163, 184, 0.5);
  border-radius: 14px;
  background: rgba(255,255,255,0.8);
  color: var(--text);
}

input:focus {
  outline: 2px solid rgba(95, 111, 255, 0.2);
  border-color: rgba(95, 111, 255, 0.6);
}

.secondary-btn {
  background: var(--primary-soft);
  color: var(--primary-strong);
}

button:hover {
  transform: translateY(-1px);
}

.feedback {
  min-height: 1.5rem;
  margin: 1rem 0 0;
  font-weight: 700;
}

.feedback.success {
  color: var(--success);
}

.feedback.error {
  color: var(--danger);
}

.hint-text {
  min-height: 1.5rem;
  margin: 0.6rem 0 0;
  color: var(--muted);
  font-style: italic;
}

.image-panel {
  margin-top: 1.5rem;
  border: 1px solid var(--stroke);
  border-radius: 24px;
  padding: 1.2rem;
  background: linear-gradient(180deg, #f9fafc, #f3f7ff);
}

.image-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.image-header h3 {
  margin: 0;
}

.image-wrapper {
  background: linear-gradient(135deg, #eef2ff, #ffffff);
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--stroke);
  min-height: 260px;
}

#task-image {
  display: block;
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.image-status {
  margin: 0.8rem 0 0;
  color: var(--muted);
  font-size: 0.95rem;
}

@media (max-width: 620px) {
  .topbar,
  .selector-block,
  .image-header,
  .task-topline {
    flex-direction: column;
    align-items: flex-start;
  }

  .score-box {
    align-self: stretch;
  }
}
