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
    { question: 'Wskaż właściwe słowo: "piękny" czy "piękny"?', answer: 'piękny' },
    { question: 'Czy poprawnie brzmi: "Idę do szkoły"?', answer: 'tak' },
    { question: 'Jak poprawnie napisać: "kotek" czy "kotekk"?', answer: 'kotek' }
  ]
};

let currentSubject = 'matematyka';
let currentTaskIndex = 0;
let score = 0;

const taskTextEl = document.getElementById('task-text');
const answerInputEl = document.getElementById('answer-input');
const checkBtn = document.getElementById('check-btn');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const subjectButtons = document.querySelectorAll('.subject-btn');

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

updateScore();
renderTask();
