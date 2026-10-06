// ===== Blue Crescent — Main Script =====

// ----- Theme -----
const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

function getPreferredTheme() {
  const saved = localStorage.getItem("bc-theme");
  if (saved) return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("bc-theme", theme);
}

setTheme(getPreferredTheme());

themeToggle.addEventListener("click", () => {
  const current = html.getAttribute("data-theme") || "light";
  setTheme(current === "dark" ? "light" : "dark");
});

// ----- Mobile Nav -----
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

// ----- Progress (localStorage) -----
const PROGRESS_KEY = "bc-progress";

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress(data) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

function markLessonComplete(subjectId, lessonId) {
  const progress = getProgress();
  if (!progress[subjectId]) progress[subjectId] = [];
  if (!progress[subjectId].includes(lessonId)) {
    progress[subjectId].push(lessonId);
    saveProgress(progress);
    renderProgress();
    renderSubjects(); // update completion indicators
  }
}

function getSubjectProgress(subjectId) {
  const subject = subjects.find((s) => s.id === subjectId);
  if (!subject) return 0;
  const completed = getProgress()[subjectId] || [];
  return Math.round((completed.length / subject.lessons.length) * 100);
}

// ----- Render Subjects -----
const subjectsGrid = document.getElementById("subjectsGrid");

function renderSubjects() {
  subjectsGrid.innerHTML = subjects
    .map((s) => {
      const pct = getSubjectProgress(s.id);
      return `
      <article class="subject-card" data-id="${s.id}">
        <div class="subject-icon">${s.icon}</div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <div class="subject-meta">
          <span class="subject-tag">${s.tag}</span>
          <span>${s.lessons.length} lessons · ${pct}%</span>
        </div>
      </article>
    `;
    })
    .join("");

  // Attach click handlers
  subjectsGrid.querySelectorAll(".subject-card").forEach((card) => {
    card.addEventListener("click", () => openSubjectModal(card.dataset.id));
  });
}

// ----- Subject Modal -----
const modal = document.getElementById("subjectModal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

function openSubjectModal(id) {
  const subject = subjects.find((s) => s.id === id);
  if (!subject) return;

  const completed = getProgress()[id] || [];

  modalBody.innerHTML = `
    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${subject.icon}</div>
    <h2>${subject.title}</h2>
    <p style="color: var(--text-muted); margin: 0.75rem 0 1.25rem;">${subject.description}</p>
    <h4>Lessons</h4>
    <ul class="lesson-list">
      ${subject.lessons
        .map(
          (lesson) => `
        <li>
          <span>${completed.includes(lesson.id) ? '<span class="completed">✓</span> ' : ""}${lesson.title} <small style="color:var(--text-muted)">· ${lesson.duration}</small></span>
          <button class="btn btn-secondary" style="padding: 0.35rem 0.9rem; font-size: 0.85rem;"
            data-subject="${id}" data-lesson="${lesson.id}">
            ${completed.includes(lesson.id) ? "Review" : "Start"}
          </button>
        </li>
      `
        )
        .join("")}
    </ul>
  `;

  modalBody.querySelectorAll("button[data-lesson]").forEach((btn) => {
    btn.addEventListener("click", () => openLesson(btn.dataset.subject, btn.dataset.lesson));
  });

  modal.classList.add("open");
}

function openLesson(subjectId, lessonId) {
  const subject = subjects.find((s) => s.id === subjectId);
  const index = subject.lessons.findIndex((l) => l.id === lessonId);
  const lesson = subject.lessons[index];
  const next = subject.lessons[index + 1];
  const done = (getProgress()[subjectId] || []).includes(lessonId);

  modalBody.innerHTML = `
    <button class="btn btn-secondary lesson-back" id="lessonBack" style="padding: 0.35rem 0.9rem; font-size: 0.85rem;">← ${subject.title}</button>
    <p style="color: var(--text-muted); margin: 1rem 0 0.25rem;">Lesson ${index + 1} of ${subject.lessons.length} · ${lesson.duration}</p>
    <h2>${lesson.title}</h2>
    <p class="lesson-text">${lessonContent[lessonId] || "This lesson is coming soon."}</p>
    <div class="lesson-actions">
      <button class="btn btn-primary" id="lessonDone" ${done ? "disabled" : ""}>${done ? "✓ Completed" : "Mark as complete"}</button>
      ${next ? `<button class="btn btn-secondary" id="lessonNext">Next lesson →</button>` : ""}
    </div>
  `;

  document.getElementById("lessonBack").addEventListener("click", () => openSubjectModal(subjectId));
  document.getElementById("lessonDone").addEventListener("click", () => {
    markLessonComplete(subjectId, lessonId);
    openLesson(subjectId, lessonId);
  });
  const nextBtn = document.getElementById("lessonNext");
  if (nextBtn) nextBtn.addEventListener("click", () => openLesson(subjectId, next.id));
  modal.querySelector(".modal-content").scrollTop = 0;
}

modalClose.addEventListener("click", () => modal.classList.remove("open"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("open");
});

// ----- Quizzes -----
const quizSelect = document.getElementById("quizSelect");
const quizContainer = document.getElementById("quizContainer");

let currentQuiz = null;
let currentIndex = 0;
let score = 0;
let answered = false;

quizSelect.addEventListener("change", () => {
  const key = quizSelect.value;
  if (!key || !quizzes[key]) {
    quizContainer.innerHTML = `<div class="quiz-placeholder"><p>Select a quiz above to begin</p></div>`;
    return;
  }
  startQuiz(key);
});

function startQuiz(key) {
  currentQuiz = quizzes[key];
  currentIndex = 0;
  score = 0;
  answered = false;
  renderQuestion();
}

function renderQuestion() {
  if (!currentQuiz) return;

  if (currentIndex >= currentQuiz.questions.length) {
    showResult();
    return;
  }

  const q = currentQuiz.questions[currentIndex];
  answered = false;

  quizContainer.innerHTML = `
    <div class="quiz-question">
      <p style="color: var(--text-muted); margin-bottom: 0.5rem;">
        Question ${currentIndex + 1} of ${currentQuiz.questions.length}
      </p>
      <h3>${q.q}</h3>
      <div class="quiz-options">
        ${q.options
          .map(
            (opt, i) => `
          <button class="quiz-option" data-index="${i}">${opt}</button>
        `
          )
          .join("")}
      </div>
    </div>
    <div class="quiz-nav">
      <span class="quiz-score">Score: ${score}</span>
      <button class="btn btn-primary" id="nextBtn" disabled>Next →</button>
    </div>
  `;

  const options = quizContainer.querySelectorAll(".quiz-option");
  const nextBtn = document.getElementById("nextBtn");

  options.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;

      const selected = Number(btn.dataset.index);
      const correct = q.answer;

      options.forEach((o) => o.classList.add("disabled"));

      if (selected === correct) {
        btn.classList.add("correct");
        score++;
      } else {
        btn.classList.add("wrong");
        options[correct].classList.add("correct");
      }

      nextBtn.disabled = false;
      quizContainer.querySelector(".quiz-score").textContent = `Score: ${score}`;
    });
  });

  nextBtn.addEventListener("click", () => {
    currentIndex++;
    renderQuestion();
  });
}

function showResult() {
  const total = currentQuiz.questions.length;
  const pct = Math.round((score / total) * 100);
  let message = "Keep practicing!";
  if (pct >= 90) message = "Outstanding! 🌟";
  else if (pct >= 70) message = "Great job! 💪";
  else if (pct >= 50) message = "Good effort!";

  quizContainer.innerHTML = `
    <div class="quiz-result">
      <h3>${message}</h3>
      <p>You scored <strong>${score} / ${total}</strong> (${pct}%)</p>
      <button class="btn btn-primary" id="retryBtn">Try Again</button>
    </div>
  `;

  document.getElementById("retryBtn").addEventListener("click", () => {
    startQuiz(quizSelect.value);
  });
}

// ----- Progress Section -----
const progressGrid = document.getElementById("progressGrid");

function renderProgress() {
  progressGrid.innerHTML = subjects
    .map((s) => {
      const pct = getSubjectProgress(s.id);
      const completed = (getProgress()[s.id] || []).length;
      return `
      <div class="progress-card">
        <h4>${s.icon} ${s.title}</h4>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${pct}%"></div>
        </div>
        <div class="progress-text">${completed} / ${s.lessons.length} lessons · ${pct}%</div>
      </div>
    `;
    })
    .join("");
}

document.getElementById("resetProgress").addEventListener("click", () => {
  if (confirm("Reset all learning progress? This cannot be undone.")) {
    localStorage.removeItem(PROGRESS_KEY);
    renderProgress();
    renderSubjects();
  }
});

// ----- Stats Counter Animation -----
function animateStats() {
  const stats = document.querySelectorAll(".stat-number");
  const totals = [subjects.length, subjects.reduce((n, s) => n + s.lessons.length, 0), Object.keys(quizzes).length, 100];
  stats.forEach((el, i) => { el.dataset.target = totals[i]; });
  stats.forEach((el) => {
    const target = Number(el.dataset.target);
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = current;
      }
    }, 30);
  });
}

// ----- Init -----
renderSubjects();
renderProgress();
animateStats();

// Highlight active nav link on scroll
const sections = document.querySelectorAll("section[id]");
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY + 100;
  sections.forEach((sec) => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    const id = sec.getAttribute("id");
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modal.classList.remove("open");
});
