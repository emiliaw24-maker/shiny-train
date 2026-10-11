const tasks = {
  matematyka: [
    { question: 'Ile to 7 + 5?', answer: '12' },
    { question: 'Ile to 9 × 3?', answer: '27' },
    { question: 'Jaki jest wynik: 15 - 8?', answer: '7' },
    { question: 'Ile to 20 ÷ 4?', answer: '5' },
    { question: 'Ile to 6 + 9?', answer: '15' }
  ],
  polski: [
    { question: 'Wskaż poprawną pisownię: "dziecko" czy "dziećko"?', answer: 'dziecko' },
    { question: 'Jak poprawnie napisać: "mama" czy "mamaa"?', answer: 'mama' },
    { question: 'Czy poprawnie brzmi: "Idę do szkoły"?', answer: 'tak' },
    { question: 'Jak poprawnie napisać: "kotek" czy "kotekk"?', answer: 'kotek' },
    { question: 'Jak brzmi poprawnie: "piękny" czy "piekny"?', answer: 'piękny' }
  ]
};

const defaultImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='100%25' height='100%25' fill='%23eef3ff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='42' fill='%235b6df6' font-family='Arial'%3EIlustracja edukacyjna%3C/text%3E%3C/svg%3E";

let currentSubject = 'matematyka';
let currentTaskIndex = 0;
let score = 0;

const taskTextEl = document.getElementById('task-text');
const answerInputEl = document.getElementById('answer-input');
const checkBtn = document.getElementById('check-btn');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const subjectButtons = document.querySelectorAll('.subject-btn');
const generateImageBtn = document.getElementById('generate-image-btn');
const taskImageEl = document.getElementById('task-image');
const imageStatusEl = document.getElementById('image-status');

function getCurrentTask() {
  const taskList = tasks[currentSubject];
  return taskList[currentTaskIndex % taskList.length];
}

function renderTask() {
  const task = getCurrentTask();
  taskTextEl.textContent = task.question;
  answerInputEl.value = '';
  answerInputEl.focus();
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  imageStatusEl.textContent = 'Gotowy obraz edukacyjny.';
  taskImageEl.src = defaultImage;
}

function updateScore() {
  scoreEl.textContent = String(score);
}

function setSubject(subject) {
  currentSubject = subject;
  currentTaskIndex = 0;
  score = 0;
  updateScore();
  subjectButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.subject === subject);
  });
  renderTask();
}

async function generateImage() {
  const task = getCurrentTask();
  const prompt = `${currentSubject === 'matematyka' ? 'educational math illustration' : 'polish language learning illustration'}, kid-friendly, colorful, simple, clear, high quality, concept art, ${task.question}`;

  imageStatusEl.textContent = 'Generuję ilustrację...';
  generateImageBtn.disabled = true;
  generateImageBtn.textContent = 'Generuję...';

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, subject: currentSubject, task: task.question })
    });

    if (!response.ok) {
      throw new Error('Pierwsza próba generowania nie powiodła się.');
    }

    const result = await response.json();
    if (result.image) {
      taskImageEl.src = result.image;
      imageStatusEl.textContent = result.message || 'Ilustracja wygenerowana.';
    } else {
      throw new Error('Brak obrazu w odpowiedzi.');
    }
  } catch (error) {
    console.error(error);
    taskImageEl.src = defaultImage;
    imageStatusEl.textContent = 'Tryb lokalny: użyto placeholdera edukacyjnego. Ustaw HF_TOKEN, jeśli chcesz aktywne generowanie.';
  } finally {
    generateImageBtn.disabled = false;
    generateImageBtn.textContent = 'Generuj obraz';
  }
}

subjectButtons.forEach((button) => {
  button.addEventListener('click', () => setSubject(button.dataset.subject));
});

checkBtn.addEventListener('click', () => {
  const task = getCurrentTask();
  const userAnswer = answerInputEl.value.trim().toLowerCase();
  const correctAnswer = String(task.answer).trim().toLowerCase();

  if (!userAnswer) {
    feedbackEl.textContent = 'Najpierw wpisz odpowiedź.';
    feedbackEl.className = 'feedback error';
    return;
  }

  if (userAnswer === correctAnswer) {
    score += 1;
    updateScore();
    feedbackEl.textContent = 'Poprawnie!';
    feedbackEl.className = 'feedback success';
  } else {
    feedbackEl.textContent = `Niestety, poprawna odpowiedź to: ${task.answer}`;
    feedbackEl.className = 'feedback error';
  }

  currentTaskIndex += 1;
  setTimeout(renderTask, 900);
});

generateImageBtn.addEventListener('click', generateImage);

updateScore();
renderTask();
