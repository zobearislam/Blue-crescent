// ===== Blue Crescent — Games Module =====

const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
hamburger?.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => navLinks.classList.remove("open")));

const gameMenu = document.getElementById("gameMenu");
const gameStage = document.getElementById("gameStage");
const gameHud = document.getElementById("gameHud");
const gameArea = document.getElementById("gameArea");
const gameActions = document.getElementById("gameActions");

let activeGame = null;
let timers = [];

function clearTimers() {
  timers.forEach(clearInterval);
  timers = [];
}

function showStage() {
  gameStage.classList.remove("hidden");
  gameStage.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setActiveCard(id) {
  document.querySelectorAll(".game-card").forEach((c) => {
    c.classList.toggle("active", c.dataset.game === id);
  });
}

// ---------- MEMORY MATCH ----------
const MEMORY_PAIRS = [
  { id: 1, a: "H₂O", b: "💧" },
  { id: 2, a: "CPU", b: "🖥️" },
  { id: 3, a: "π", b: "3.14" },
  { id: 4, a: "DNA", b: "🧬" },
  { id: 5, a: "HTML", b: "</>" },
  { id: 6, a: "Mars", b: "🔴" },
];

function startMemory() {
  clearTimers();
  activeGame = "memory";
  setActiveCard("memory");
  showStage();

  let flips = 0;
  let matches = 0;
  let locked = false;
  let first = null;

  const cards = [];
  MEMORY_PAIRS.forEach((p) => {
    cards.push({ pair: p.id, value: p.a });
    cards.push({ pair: p.id, value: p.b });
  });
  // shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  gameHud.innerHTML = `
    <span>MATCHES: <strong id="memMatches">0</strong> / 6</span>
    <span class="score">FLIPS: <strong id="memFlips">0</strong></span>
  `;

  gameArea.innerHTML = `<div class="memory-grid" id="memGrid"></div>`;
  const grid = document.getElementById("memGrid");

  cards.forEach((c, i) => {
    const el = document.createElement("div");
    el.className = "memory-card";
    el.dataset.index = i;
    el.dataset.pair = c.pair;
    el.innerHTML = `<span class="back">?</span><span class="face">${c.value}</span>`;
    el.addEventListener("click", () => {
      if (locked || el.classList.contains("flipped") || el.classList.contains("matched")) return;
      el.classList.add("flipped");
      flips++;
      document.getElementById("memFlips").textContent = flips;

      if (!first) {
        first = el;
        return;
      }

      locked = true;
      if (first.dataset.pair === el.dataset.pair) {
        first.classList.add("matched");
        el.classList.add("matched");
        matches++;
        document.getElementById("memMatches").textContent = matches;
        first = null;
        locked = false;
        if (matches === 6) {
          setTimeout(() => {
            gameArea.innerHTML = `
              <div class="game-over">
                <h3>MISSION COMPLETE</h3>
                <p>All pairs matched in <strong>${flips}</strong> flips.</p>
              </div>`;
            gameActions.innerHTML = `
              <button class="btn btn-primary" id="replayMem">PLAY AGAIN</button>
              <button class="btn btn-secondary" id="backMenu">BACK TO MENU</button>`;
            document.getElementById("replayMem").onclick = startMemory;
            document.getElementById("backMenu").onclick = () => {
              gameStage.classList.add("hidden");
              setActiveCard(null);
            };
          }, 400);
        }
      } else {
        setTimeout(() => {
          first.classList.remove("flipped");
          el.classList.remove("flipped");
          first = null;
          locked = false;
        }, 700);
      }
    });
    grid.appendChild(el);
  });

  gameActions.innerHTML = `<button class="btn btn-secondary" id="backMenu">BACK TO MENU</button>`;
  document.getElementById("backMenu").onclick = () => {
    gameStage.classList.add("hidden");
    setActiveCard(null);
  };
}

// ---------- SPEED MATH ----------
function startMath() {
  clearTimers();
  activeGame = "math";
  setActiveCard("math");
  showStage();

  let score = 0;
  let timeLeft = 30;
  let current = null;

  function nextProblem() {
    const ops = ["+", "-", "×"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;
    if (op === "+") {
      a = Math.floor(Math.random() * 40) + 5;
      b = Math.floor(Math.random() * 40) + 5;
      answer = a + b;
    } else if (op === "-") {
      a = Math.floor(Math.random() * 50) + 20;
      b = Math.floor(Math.random() * 20) + 1;
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
      answer = a * b;
    }
    const wrongs = new Set();
    while (wrongs.size < 3) {
      const delta = Math.floor(Math.random() * 15) - 7;
      if (delta !== 0) wrongs.add(answer + delta);
    }
    const options = [answer, ...wrongs].sort(() => Math.random() - 0.5);
    current = { a, b, op, answer, options };
    renderMath();
  }

  function renderMath() {
    gameHud.innerHTML = `
      <span>TIME: <strong id="mathTime">${timeLeft}</strong>s</span>
      <span class="score">SCORE: <strong id="mathScore">${score}</strong></span>
    `;
    gameArea.innerHTML = `
      <div class="math-question">
        <div class="expr">${current.a} ${current.op} ${current.b} = ?</div>
        <div class="math-options">
          ${current.options.map((o) => `<button class="math-opt" data-val="${o}">${o}</button>`).join("")}
        </div>
      </div>
    `;
    gameArea.querySelectorAll(".math-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = Number(btn.dataset.val);
        if (val === current.answer) {
          btn.classList.add("correct");
          score++;
          setTimeout(nextProblem, 250);
        } else {
          btn.classList.add("wrong");
          setTimeout(nextProblem, 400);
        }
      });
    });
  }

  nextProblem();

  const tick = setInterval(() => {
    timeLeft--;
    const el = document.getElementById("mathTime");
    if (el) el.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(tick);
      gameArea.innerHTML = `
        <div class="game-over">
          <h3>TIME UP</h3>
          <p>You scored <strong>${score}</strong> points.</p>
        </div>`;
      gameActions.innerHTML = `
        <button class="btn btn-primary" id="replayMath">PLAY AGAIN</button>
        <button class="btn btn-secondary" id="backMenu">BACK TO MENU</button>`;
      document.getElementById("replayMath").onclick = startMath;
      document.getElementById("backMenu").onclick = () => {
        gameStage.classList.add("hidden");
        setActiveCard(null);
      };
    }
  }, 1000);
  timers.push(tick);

  gameActions.innerHTML = `<button class="btn btn-secondary" id="backMenu">BACK TO MENU</button>`;
  document.getElementById("backMenu").onclick = () => {
    clearTimers();
    gameStage.classList.add("hidden");
    setActiveCard(null);
  };
}

// ---------- WORD SCRAMBLE ----------
const SCRAMBLE_WORDS = [
  { word: "PLANET", hint: "Orbits a star" },
  { word: "OXYGEN", hint: "Gas we breathe" },
  { word: "BINARY", hint: "1s and 0s" },
  { word: "ATOM", hint: "Tiny building block" },
  { word: "FRACTION", hint: "Part of a whole" },
  { word: "PYTHON", hint: "Popular coding language" },
  { word: "GRAVITY", hint: "Keeps us on Earth" },
  { word: "HISTORY", hint: "Study of the past" },
  { word: "CIRCUIT", hint: "Path for electricity" },
  { word: "VARIABLE", hint: "Stores a value in code" },
];

function scramble(word) {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const s = arr.join("");
  return s === word ? scramble(word) : s;
}

function startScramble() {
  clearTimers();
  activeGame = "scramble";
  setActiveCard("scramble");
  showStage();

  let score = 0;
  let index = 0;
  const deck = [...SCRAMBLE_WORDS].sort(() => Math.random() - 0.5);

  function showWord() {
    if (index >= deck.length) {
      gameArea.innerHTML = `
        <div class="game-over">
          <h3>ALL WORDS CRACKED</h3>
          <p>Score: <strong>${score}</strong> / ${deck.length}</p>
        </div>`;
      gameActions.innerHTML = `
        <button class="btn btn-primary" id="replayScr">PLAY AGAIN</button>
        <button class="btn btn-secondary" id="backMenu">BACK TO MENU</button>`;
      document.getElementById("replayScr").onclick = startScramble;
      document.getElementById("backMenu").onclick = () => {
        gameStage.classList.add("hidden");
        setActiveCard(null);
      };
      return;
    }

    const item = deck[index];
    const mixed = scramble(item.word);

    gameHud.innerHTML = `
      <span>WORD: <strong>${index + 1}</strong> / ${deck.length}</span>
      <span class="score">SCORE: <strong>${score}</strong></span>
    `;

    gameArea.innerHTML = `
      <div class="scramble-word">${mixed}</div>
      <p class="scramble-hint">Hint: ${item.hint}</p>
      <div class="scramble-input-wrap">
        <input type="text" id="scrInput" maxlength="20" autocomplete="off" placeholder="TYPE ANSWER" />
        <button class="btn btn-primary" id="scrSubmit">SUBMIT</button>
      </div>
      <div class="scramble-feedback" id="scrFeedback"></div>
    `;

    const input = document.getElementById("scrInput");
    const feedback = document.getElementById("scrFeedback");
    input.focus();

    function check() {
      const guess = input.value.trim().toUpperCase();
      if (!guess) return;
      if (guess === item.word) {
        score++;
        feedback.textContent = "CORRECT ✓";
        feedback.className = "scramble-feedback ok";
        index++;
        setTimeout(showWord, 600);
      } else {
        feedback.textContent = "TRY AGAIN";
        feedback.className = "scramble-feedback bad";
        input.select();
      }
    }

    document.getElementById("scrSubmit").onclick = check;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") check();
    });
  }

  showWord();

  gameActions.innerHTML = `<button class="btn btn-secondary" id="backMenu">BACK TO MENU</button>`;
  document.getElementById("backMenu").onclick = () => {
    gameStage.classList.add("hidden");
    setActiveCard(null);
  };
}

// ---------- Menu wiring ----------
document.querySelectorAll(".game-card").forEach((card) => {
  card.addEventListener("click", () => {
    const g = card.dataset.game;
    if (g === "memory") startMemory();
    else if (g === "math") startMath();
    else if (g === "scramble") startScramble();
  });
});
