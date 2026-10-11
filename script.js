const API_BASE = 'http://localhost:7860';
let currentSubject = 'matematyka';
let score = 0;
let currentTask = null;

const taskTextEl = document.getElementById('task-text');
const answerInputEl = document.getElementById('answer-input');
const checkBtn = document.getElementById('check-btn');
const hintBtn = document.getElementById('hint-btn');
const feedbackEl = document.getElementById('feedback');
const hintTextEl = document.getElementById('hint-text');
const scoreEl = document.getElementById('score');
const subjectButtons = document.querySelectorAll('.subject-btn');
const generateImageBtn = document.getElementById('generate-image-btn');
const taskImageEl = document.getElementById('task-image');
const imageStatusEl = document.getElementById('image-status');

async function loadTask() {
  try {
    const response = await fetch(`${API_BASE}/api/generate-task`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: currentSubject, level: 1, user_id: 1 })
    });
    const data = await response.json();
    currentTask = data;
    taskTextEl.textContent = data.question;
    taskImageEl.src = data.image;
    answerInputEl.value = '';
    hintTextEl.textContent = '';
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    imageStatusEl.textContent = 'Obraz edukacyjny';
  } catch (e) {
    console.error(e);
    taskTextEl.textContent = 'Błąd ładowania zadania';
  }
}

subjectButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentSubject = button.dataset.subject;
    subjectButtons.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    score = 0; scoreEl.textContent = '0';
    loadTask();
  });
});

checkBtn.addEventListener('click', async () => {
  if (!currentTask) return;
  const answer = answerInputEl.value.trim();
  if (!answer) {
    feedbackEl.textContent = 'Wpisz odpowiedź!';
    feedbackEl.className = 'feedback error';
    return;
  }
  try {
    const response = await fetch(`${API_BASE}/api/check-answer`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 1, task_id: 1, user_answer: answer, correct_answer: currentTask.answer, question: currentTask.question })
    });
    const data = await response.json();
    if (data.is_correct) {
      score += 1; scoreEl.textContent = score;
      feedbackEl.className = 'feedback success';
    } else {
      feedbackEl.className = 'feedback error';
    }
    feedbackEl.textContent = data.feedback;
    setTimeout(loadTask, 1500);
  } catch (e) {
    console.error(e);
    feedbackEl.textContent = 'Błąd sprawdzania odpowiedzi';
  }
});

hintBtn.addEventListener('click', async () => {
  if (!currentTask) return;
  try {
    const response = await fetch(`${API_BASE}/api/hint`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: currentTask.question, subject: currentSubject })
    });
    const data = await response.json();
    hintTextEl.textContent = `💡 ${data.hint}`;
  } catch (e) {
    console.error(e);
    hintTextEl.textContent = 'Nie udało się pobrać podpowiedzi';
  }
});

generateImageBtn.addEventListener('click', async () => {
  if (!currentTask) return;
  generateImageBtn.disabled = true;
  try {
    const response = await fetch(`${API_BASE}/api/generate-image`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: currentTask.question, subject: currentSubject, task: currentTask.question })
    });
    const data = await response.json();
    taskImageEl.src = data.image;
    imageStatusEl.textContent = data.message;
  } catch (e) {
    console.error(e);
    imageStatusEl.textContent = 'Błąd generowania obrazu';
  } finally {
    generateImageBtn.disabled = false;
  }
});

scoreEl.textContent = '0';
loadTask();
