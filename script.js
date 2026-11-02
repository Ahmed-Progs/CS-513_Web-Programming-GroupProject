/**
 * JavaScript Quiz App
 * Built with HTML, CSS and vanilla JavaScript
 * Self-contained, responsive, zero-library quiz application.
 */

// ============================================================================
// 1. CONSTANTS & GAME CONFIGURATION
// ============================================================================
const TOTAL_QUESTIONS = 5;
const TIME_PER_QUESTION = 15;   // seconds per question
const PASS_MARK = 3;            // score >= 3 is pass
const FEEDBACK_DELAY = 1200;    // ms to show answer feedback before next question

// ============================================================================
// 2. APPLICATION STATE
// ============================================================================
const state = {
  questions: [],        // 5 randomly picked questions for this attempt
  currentIndex: 0,      // current question index (0 to 4)
  score: 0,             // total correct answers in current attempt
  timeLeft: TIME_PER_QUESTION,
  timerId: null,        // setInterval reference
  timerStartTime: null, // timestamp when current question timer started
  answered: false,      // prevents multiple clicks per question
  userAnswers: [],      // records each answer: { question, selected, correct, isCorrect, timedOut, explanation }
  bestScore: null       // session-only best score, never saved to browser storage
};

// ============================================================================
// 3. QUESTION BANK (20 QUESTIONS)
// ============================================================================
const questionBank = [
  {
    question: "What does typeof 5 return?",
    options: ["number", "string", "integer", "undefined"],
    answer: "number",
    explanation: "typeof tells you the type of a value. Every number in JavaScript has the type number."
  },
  {
    question: "Which keyword declares a variable that cannot be reassigned?",
    options: ["const", "let", "var", "static"],
    answer: "const",
    explanation: "const locks the variable so you cannot give it a new value later."
  },
  {
    question: "What is the difference between == and ===?",
    options: [
      "=== checks value and type, == only checks value",
      "== checks value and type, === only checks value",
      "They are exactly the same",
      "=== is used only for strings"
    ],
    answer: "=== checks value and type, == only checks value",
    explanation: "=== is strict: 5 === '5' is false because the types differ, but 5 == '5' is true."
  },
  {
    question: "What is the result of \"5\" + 2 ?",
    options: ["\"52\"", "7", "NaN", "Error"],
    answer: "\"52\"",
    explanation: "When you add a string and a number, JavaScript joins them as text, so you get \"52\"."
  },
  {
    question: "Which array method adds an item to the END of an array?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    answer: "push()",
    explanation: "push() puts a new item at the end. pop() removes the last item instead."
  },
  {
    question: "What is the value of [10, 20, 30].length ?",
    options: ["3", "2", "30", "undefined"],
    answer: "3",
    explanation: "length tells you how many items are in the array. This one has 3 items."
  },
  {
    question: "How do you read the name property of the object person?",
    options: ["person.name", "person->name", "person[name()]", "name.person"],
    answer: "person.name",
    explanation: "Use dot notation: write the object, a dot, then the property name."
  },
  {
    question: "Which event fires when a user clicks a button?",
    options: ["click", "press", "hover", "submitclick"],
    answer: "click",
    explanation: "The click event runs your code whenever the user clicks an element."
  },
  {
    question: "Which of these is a correct function declaration?",
    options: [
      "function greet() { }",
      "def greet() { }",
      "func greet() { }",
      "greet function() { }"
    ],
    answer: "function greet() { }",
    explanation: "In JavaScript, a function starts with the function keyword, then the name and brackets."
  },
  {
    question: "Which method finds an HTML element by its id?",
    options: [
      "document.getElementById()",
      "document.findId()",
      "document.selectById()",
      "document.getId()"
    ],
    answer: "document.getElementById()",
    explanation: "getElementById() looks through the page and returns the element with that id."
  },
  {
    question: "Which function runs code again and again after a fixed delay?",
    options: ["setInterval()", "setTimeout()", "repeat()", "loopTime()"],
    answer: "setInterval()",
    explanation: "setInterval() repeats forever until stopped. setTimeout() runs the code only once."
  },
  {
    question: "What does typeof [] return?",
    options: ["\"object\"", "\"array\"", "\"list\"", "\"undefined\""],
    answer: "\"object\"",
    explanation: "Arrays are a special kind of object in JavaScript, so typeof says object."
  },
  {
    question: "Which array method removes the LAST item?",
    options: ["pop()", "push()", "shift()", "slice()"],
    answer: "pop()",
    explanation: "pop() takes off the last item and gives it back to you."
  },
  {
    question: "What does the map() method do?",
    options: [
      "Creates a new array by changing every item",
      "Removes items from an array",
      "Sorts the array alphabetically",
      "Finds a location on a map"
    ],
    answer: "Creates a new array by changing every item",
    explanation: "map() runs a function on each item and collects the results in a brand new array."
  },
  {
    question: "Which symbol starts a single-line comment in JavaScript?",
    options: ["//", "#", "<!--", "**"],
    answer: "//",
    explanation: "Anything after // on the same line is ignored by JavaScript."
  },
  {
    question: "What does Boolean(0) return?",
    options: ["false", "true", "0", "null"],
    answer: "false",
    explanation: "0 is a 'falsy' value, so converting it to a Boolean gives false."
  },
  {
    question: "What is the main use of addEventListener()?",
    options: [
      "To run a function when an event happens",
      "To create a new HTML element",
      "To store data in the browser",
      "To stop a timer"
    ],
    answer: "To run a function when an event happens",
    explanation: "It 'listens' for an event like a click and runs your function when it happens."
  },
  {
    question: "What is the result of 10 % 3 ?",
    options: ["1", "3", "0", "3.33"],
    answer: "1",
    explanation: "% gives the remainder after division. 10 divided by 3 leaves 1."
  },
  {
    question: "Which is a correct arrow function?",
    options: [
      "const add = (a, b) => a + b;",
      "const add = (a, b) -> a + b;",
      "const add => (a, b) { a + b };",
      "add = function => (a, b);"
    ],
    answer: "const add = (a, b) => a + b;",
    explanation: "Arrow functions use => between the parameters and the result. It is a shorter way to write functions."
  },
  {
    question: "Which function turns the string \"42\" into the number 42?",
    options: ["parseInt()", "toString()", "stringify()", "makeNumber()"],
    answer: "parseInt()",
    explanation: "parseInt() reads a string and gives back a whole number."
  }
];

// ============================================================================
// 4. DOM ELEMENT REFERENCES
// ============================================================================
const screens = {
  home: document.getElementById('home-screen'),
  quiz: document.getElementById('quiz-screen'),
  result: document.getElementById('result-screen'),
  about: document.getElementById('about-screen')
};

const navHome = document.getElementById('nav-home');
const navHomeLink = document.getElementById('nav-home-link');
const navAboutLink = document.getElementById('nav-about-link');
const navExitBtn = document.getElementById('nav-exit-btn');
const startBtn = document.getElementById('start-btn');
const skipBtn = document.getElementById('skip-btn');
const retryBtn = document.getElementById('retry-btn');
const homeBtn = document.getElementById('home-btn');
const aboutStartBtn = document.getElementById('about-start-btn');
const aboutHomeBtn = document.getElementById('about-home-btn');

const timerBar = document.getElementById('timer-bar');
const timerText = document.getElementById('timer-text');
const questionCounter = document.getElementById('question-counter');
const liveScore = document.getElementById('live-score');
const progressBar = document.getElementById('progress-bar');
const questionArea = document.getElementById('question-area');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options');
const feedback = document.getElementById('feedback');

const scoreValue = document.getElementById('score-value');
const resultTitle = document.getElementById('result-title');
const resultSubtitle = document.getElementById('result-subtitle');
const bestScore = document.getElementById('best-score');
const reviewList = document.getElementById('review-list');
const confettiCanvas = document.getElementById('confetti-canvas');

// ============================================================================
// 5. HELPER FUNCTIONS
// ============================================================================

/**
 * Returns a new array with elements shuffled using the Fisher-Yates algorithm.
 * Operates on a shallow copy to never mutate the input array.
 */
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Shuffles the question pool and returns the first `count` items with shuffled options.
 */
function pickRandomQuestions(pool, count) {
  const shuffledPool = shuffleArray(pool);
  const selected = shuffledPool.slice(0, count);
  return selected.map(q => ({
    question: q.question,
    options: shuffleArray(q.options),
    answer: q.answer,
    explanation: q.explanation
  }));
}

/**
 * Safely escapes HTML special characters to avoid injection.
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Switches between Home, Quiz, and Result screens with smooth animations.
 */
function showScreen(screenId, callback) {
  const targetScreen = document.getElementById(screenId);
  if (!targetScreen) return;

  // Toggle navbar Home/About links vs Exit Quiz button (Exit Quiz appears on quiz side only)
  if (navHomeLink && navExitBtn) {
    if (screenId === 'quiz-screen') {
      navHomeLink.style.display = 'none';
      if (navAboutLink) navAboutLink.style.display = 'none';
      navExitBtn.style.display = 'inline-flex';
    } else {
      navHomeLink.style.display = 'inline-flex';
      if (navAboutLink) navAboutLink.style.display = 'inline-flex';
      navExitBtn.style.display = 'none';
    }
  }

  const currentActive = document.querySelector('.screen.active');

  // If already on this screen, do nothing
  if (currentActive === targetScreen) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof callback === 'function') callback();
    return;
  }

  if (currentActive) {
    currentActive.classList.remove('screen-enter');
    currentActive.classList.add('screen-exit');

    setTimeout(() => {
      currentActive.classList.remove('active', 'screen-exit');
      targetScreen.classList.add('active', 'screen-enter');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (typeof callback === 'function') callback();
    }, 200);
  } else {
    targetScreen.classList.add('active', 'screen-enter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof callback === 'function') callback();
  }
}

// ============================================================================
// 6. GAME CONTROL FUNCTIONS
// ============================================================================

/**
 * Starts a new quiz attempt: resets state, picks questions, and presents Question 1.
 */
function startQuiz() {
  stopTimer();
  stopConfetti();

  // Reset transient game state (keeping bestScore intact)
  state.currentIndex = 0;
  state.score = 0;
  state.userAnswers = [];
  state.answered = false;
  state.timeLeft = TIME_PER_QUESTION;

  // Pick 5 random questions with shuffled options
  state.questions = pickRandomQuestions(questionBank, TOTAL_QUESTIONS);

  // Switch to quiz screen, then render first question and start countdown
  showScreen('quiz-screen', () => {
    showQuestion();
  });
}

/**
 * Renders the current question and builds the option buttons.
 */
function showQuestion() {
  state.answered = false;
  const currentQ = state.questions[state.currentIndex];

  // Update question counter & live score
  questionCounter.textContent = `Question ${state.currentIndex + 1} of ${TOTAL_QUESTIONS}`;
  liveScore.textContent = `Score: ${state.score}`;

  // Update progress bar
  const progressPercent = (state.currentIndex / TOTAL_QUESTIONS) * 100;
  progressBar.style.width = `${progressPercent}%`;

  // Render question text
  questionText.textContent = currentQ.question;

  // Reset feedback line
  feedback.textContent = '';
  feedback.className = 'feedback';

  // Enable skip button for new question
  if (skipBtn) {
    skipBtn.removeAttribute('disabled');
  }

  // Build option buttons
  optionsContainer.innerHTML = '';
  currentQ.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.setAttribute('data-option', optionText);
    btn.setAttribute('data-index', String(index + 1));

    // Keyboard shortcut hint (1, 2, 3, 4)
    const keyBadge = document.createElement('span');
    keyBadge.className = 'option-key';
    keyBadge.textContent = String(index + 1);

    const label = document.createElement('span');
    label.className = 'option-label';
    label.textContent = optionText;

    btn.appendChild(keyBadge);
    btn.appendChild(label);

    btn.addEventListener('click', () => {
      checkAnswer(optionText, btn);
    });

    optionsContainer.appendChild(btn);
  });

  // Re-trigger enter animation for question area
  questionArea.classList.remove('anim-out');
  questionArea.classList.remove('question-area');
  void questionArea.offsetWidth; // trigger reflow
  questionArea.classList.add('question-area');

  // Start 15s countdown
  startTimer();
}

/**
 * Starts the countdown timer for the current question using smooth intervals.
 */
function startTimer() {
  stopTimer();

  state.timeLeft = TIME_PER_QUESTION;
  state.timerStartTime = Date.now();

  // Reset bar UI
  timerBar.style.width = '100%';
  timerBar.className = 'timer-bar timer-green';
  timerText.textContent = `${TIME_PER_QUESTION}s`;

  // High-frequency tick (100ms) for ultra-smooth progress animation
  state.timerId = setInterval(() => {
    const elapsedSeconds = (Date.now() - state.timerStartTime) / 1000;
    state.timeLeft = Math.max(0, TIME_PER_QUESTION - elapsedSeconds);

    const percentage = (state.timeLeft / TIME_PER_QUESTION) * 100;
    timerBar.style.width = `${percentage}%`;
    timerText.textContent = `${Math.ceil(state.timeLeft)}s`;

    // Dynamic timer color updates: green (>50%), orange (25%-50%), red (<25%)
    timerBar.classList.remove('timer-green', 'timer-orange', 'timer-red');
    if (percentage > 50) {
      timerBar.classList.add('timer-green');
    } else if (percentage >= 25) {
      timerBar.classList.add('timer-orange');
    } else {
      timerBar.classList.add('timer-red');
    }

    // Time expired
    if (state.timeLeft <= 0) {
      stopTimer();
      handleTimeUp();
    }
  }, 100);
}

/**
 * Clears any active timer interval and resets the timer ID reference.
 */
function stopTimer() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

/**
 * Evaluates the user's selected answer, updates score and highlights results.
 */
function checkAnswer(selectedText, clickedButton) {
  if (state.answered) return;
  state.answered = true;
  stopTimer();

  // Disable all option buttons immediately
  const allButtons = optionsContainer.querySelectorAll('.option-btn');
  allButtons.forEach(btn => btn.setAttribute('disabled', 'true'));
  if (skipBtn) {
    skipBtn.setAttribute('disabled', 'true');
  }

  if (clickedButton) {
    clickedButton.classList.add('pop');
  }

  const currentQ = state.questions[state.currentIndex];
  const isCorrect = selectedText === currentQ.answer;

  if (isCorrect) {
    if (clickedButton) clickedButton.classList.add('correct');
    state.score++;
    liveScore.textContent = `Score: ${state.score}`;
    feedback.textContent = 'Correct! ✅';
    feedback.className = 'feedback show feedback-correct';
  } else {
    if (clickedButton) clickedButton.classList.add('wrong');
    feedback.textContent = 'Wrong ❌';
    feedback.className = 'feedback show feedback-wrong';

    // Highlight the correct answer in green
    allButtons.forEach(btn => {
      if (btn.getAttribute('data-option') === currentQ.answer) {
        btn.classList.add('correct');
      }
    });
  }

  // Record user answer for review
  state.userAnswers.push({
    question: currentQ.question,
    selected: selectedText,
    correct: currentQ.answer,
    isCorrect: isCorrect,
    timedOut: false,
    explanation: currentQ.explanation
  });

  // Advance to next question or results after delay
  setTimeout(nextQuestion, FEEDBACK_DELAY);
}

/**
 * Handles expiration of the 15-second timer when no option was clicked.
 */
function handleTimeUp() {
  if (state.answered) return;
  state.answered = true;

  // Disable all option buttons and skip button
  const allButtons = optionsContainer.querySelectorAll('.option-btn');
  allButtons.forEach(btn => btn.setAttribute('disabled', 'true'));
  if (skipBtn) {
    skipBtn.setAttribute('disabled', 'true');
  }

  const currentQ = state.questions[state.currentIndex];

  // Highlight correct answer
  allButtons.forEach(btn => {
    if (btn.getAttribute('data-option') === currentQ.answer) {
      btn.classList.add('correct');
    }
  });

  feedback.textContent = "Time's up! ⏰";
  feedback.className = 'feedback show feedback-timeout';

  // Record timeout
  state.userAnswers.push({
    question: currentQ.question,
    selected: null,
    correct: currentQ.answer,
    isCorrect: false,
    timedOut: true,
    skipped: false,
    explanation: currentQ.explanation
  });

  setTimeout(nextQuestion, FEEDBACK_DELAY);
}

/**
 * Skips the current question if not already answered: stops timer,
 * highlights the correct answer, records the skip, and advances to the next question.
 */
function skipQuestion() {
  if (state.answered) return;
  state.answered = true;
  stopTimer();

  // Disable all option buttons and skip button
  const allButtons = optionsContainer.querySelectorAll('.option-btn');
  allButtons.forEach(btn => btn.setAttribute('disabled', 'true'));
  if (skipBtn) {
    skipBtn.setAttribute('disabled', 'true');
  }

  const currentQ = state.questions[state.currentIndex];

  // Highlight correct answer in green so the user learns
  allButtons.forEach(btn => {
    if (btn.getAttribute('data-option') === currentQ.answer) {
      btn.classList.add('correct');
    }
  });

  feedback.textContent = 'Skipped ⏭️';
  feedback.className = 'feedback show feedback-skipped';

  // Record skipped question
  state.userAnswers.push({
    question: currentQ.question,
    selected: null,
    correct: currentQ.answer,
    isCorrect: false,
    timedOut: false,
    skipped: true,
    explanation: currentQ.explanation
  });

  setTimeout(nextQuestion, FEEDBACK_DELAY);
}

/**
 * Transitions to the next question or finishes the quiz if all 5 are completed.
 */
function nextQuestion() {
  state.currentIndex++;

  // Update progress bar
  const progressPercent = (state.currentIndex / TOTAL_QUESTIONS) * 100;
  progressBar.style.width = `${progressPercent}%`;

  if (state.currentIndex < TOTAL_QUESTIONS) {
    // Animate out question area, then display next question
    questionArea.classList.add('anim-out');
    setTimeout(() => {
      showQuestion();
    }, 220);
  } else {
    showResult();
  }
}

/**
 * Displays the result screen, computes pass/fail, triggers confetti, and builds the review list.
 */
function showResult() {
  stopTimer();

  const passed = state.score >= PASS_MARK;

  // Set pass or fail messaging
  if (passed) {
    resultTitle.textContent = '🎉 Hurray, you passed!';
    resultTitle.className = 'pass';
    resultSubtitle.textContent = 'Great job! You showed solid JavaScript fundamentals.';
  } else {
    resultTitle.textContent = 'Better luck next time!';
    resultTitle.className = 'fail';
    resultSubtitle.textContent = 'Keep practicing! Review your answers below to sharpen your skills.';
  }

  // Update session-only best score
  const isNewBest = state.bestScore !== null && state.score > state.bestScore;
  if (state.bestScore === null || state.score > state.bestScore) {
    state.bestScore = state.score;
  }

  // Render best score line with optional "New best!" badge
  bestScore.innerHTML = `<span>Best this session: <strong>${state.bestScore} / ${TOTAL_QUESTIONS}</strong></span>${
    isNewBest ? ' <span class="badge-new-best">New best! ⭐</span>' : ''
  }`;

  // Build the review section
  buildReview();

  // Transition to result screen, then start score animation and celebratory confetti
  showScreen('result-screen', () => {
    animateScore(state.score);
    if (passed) {
      launchConfetti();
    }
  });
}

/**
 * Counts up the score number from 0 to target score for visual satisfaction.
 */
function animateScore(target) {
  scoreValue.textContent = '0';
  if (target === 0) return;

  const duration = 800; // ms
  const startTime = Date.now();

  const step = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Linear count up rounded to nearest integer
    const current = Math.floor(progress * target);
    scoreValue.textContent = String(current);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      scoreValue.textContent = String(target);
    }
  };

  requestAnimationFrame(step);
}

/**
 * Constructs the review rows from the attempt's recorded answers.
 */
function buildReview() {
  reviewList.innerHTML = '';

  state.userAnswers.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = `review-item ${item.isCorrect ? 'correct' : item.skipped ? 'skipped' : 'wrong'}`;
    row.style.animationDelay = `${index * 80}ms`;

    const qTitle = document.createElement('div');
    qTitle.className = 'review-q-title';
    qTitle.textContent = `Q${index + 1}. ${item.question}`;
    row.appendChild(qTitle);

    if (item.isCorrect) {
      // User was correct: single answer row
      const ansRow = document.createElement('div');
      ansRow.className = 'review-answer-row';
      ansRow.innerHTML = `
        <span class="review-answer-label">Your answer:</span>
        <span class="review-answer-val">${escapeHTML(item.selected)}</span>
        <span class="status-badge correct">✅ Correct</span>
      `;
      row.appendChild(ansRow);
    } else if (item.skipped) {
      // Question was skipped by user
      const userRow = document.createElement('div');
      userRow.className = 'review-answer-row';
      userRow.innerHTML = `
        <span class="review-answer-label">Your answer:</span>
        <span class="review-answer-val"><em>Skipped (no answer)</em></span>
        <span class="status-badge skipped">⏭️ Skipped</span>
      `;
      row.appendChild(userRow);

      const correctRow = document.createElement('div');
      correctRow.className = 'review-answer-row';
      correctRow.innerHTML = `
        <span class="review-answer-label">Correct answer:</span>
        <span class="review-answer-val">${escapeHTML(item.correct)}</span>
      `;
      row.appendChild(correctRow);
    } else if (item.timedOut) {
      // Question timed out
      const userRow = document.createElement('div');
      userRow.className = 'review-answer-row';
      userRow.innerHTML = `
        <span class="review-answer-label">Your answer:</span>
        <span class="review-answer-val"><em>No answer (time ran out)</em></span>
        <span class="status-badge timeout">⏰ Time ran out</span>
      `;
      row.appendChild(userRow);

      const correctRow = document.createElement('div');
      correctRow.className = 'review-answer-row';
      correctRow.innerHTML = `
        <span class="review-answer-label">Correct answer:</span>
        <span class="review-answer-val">${escapeHTML(item.correct)}</span>
      `;
      row.appendChild(correctRow);
    } else {
      // User selected wrong answer
      const userRow = document.createElement('div');
      userRow.className = 'review-answer-row';
      userRow.innerHTML = `
        <span class="review-answer-label">Your answer:</span>
        <span class="review-answer-val">${escapeHTML(item.selected)}</span>
        <span class="status-badge wrong">❌ Wrong</span>
      `;
      row.appendChild(userRow);

      const correctRow = document.createElement('div');
      correctRow.className = 'review-answer-row';
      correctRow.innerHTML = `
        <span class="review-answer-label">Correct answer:</span>
        <span class="review-answer-val">${escapeHTML(item.correct)}</span>
      `;
      row.appendChild(correctRow);
    }

    // Explanation
    const whyDiv = document.createElement('div');
    whyDiv.className = 'review-why';
    whyDiv.innerHTML = `<strong>Why:</strong> ${escapeHTML(item.explanation)}`;
    row.appendChild(whyDiv);

    reviewList.appendChild(row);
  });
}

/**
 * Resets and starts another quiz attempt when the user clicks 'Try Again'.
 */
function restartQuiz() {
  stopConfetti();
  startQuiz();
}

/**
 * Halts any active timer, stops confetti, and returns the view to the Home screen.
 */
function goHome() {
  stopTimer();
  stopConfetti();
  state.answered = false;
  showScreen('home-screen');
}

/**
 * Halts any active timer, stops confetti, and displays the About Us screen.
 */
function showAbout() {
  stopTimer();
  stopConfetti();
  if (typeof clearPendingNext === 'function') clearPendingNext();
  state.answered = false;
  showScreen('about-screen');
}

// ============================================================================
// 7. PURE CANVAS CONFETTI ENGINE (NO EXTERNAL LIBRARIES)
// ============================================================================
let confettiAnimationId = null;
let confettiParticles = [];
let confettiStartTime = null;

/**
 * Initializes and launches a 4-second canvas confetti celebratory blast.
 */
function launchConfetti() {
  stopConfetti();

  const ctx = confettiCanvas.getContext('2d');
  if (!ctx) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  confettiCanvas.width = width;
  confettiCanvas.height = height;

  const colors = [
    '#4f6bff', '#3b52d9', '#ffb703', '#22c55e',
    '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'
  ];

  const totalParticles = 140;
  confettiParticles = [];

  for (let i = 0; i < totalParticles; i++) {
    confettiParticles.push({
      x: Math.random() * width,
      y: Math.random() * -height * 0.7 - 20, // Stagger above screen
      w: Math.random() * 6 + 6,              // Width: 6-12px
      h: Math.random() * 4 + 4,              // Height: 4-8px
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,         // Horizontal drift
      vy: Math.random() * 3 + 3,             // Fall velocity: 3-6
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 8,       // Rotation speed
      swayAngle: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.04 + 0.02,
      isCircle: Math.random() > 0.65
    });
  }

  confettiStartTime = Date.now();
  const DURATION = 4000; // 4 seconds total

  function renderConfetti() {
    const elapsed = Date.now() - confettiStartTime;
    if (elapsed >= DURATION) {
      stopConfetti();
      return;
    }

    // Fade out smoothly during the last 800ms
    let globalAlpha = 1;
    if (elapsed > DURATION - 800) {
      globalAlpha = Math.max(0, (DURATION - elapsed) / 800);
    }

    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    ctx.save();
    ctx.globalAlpha = globalAlpha;

    confettiParticles.forEach(p => {
      // Physics & oscillation
      p.swayAngle += p.swaySpeed;
      p.x += p.vx + Math.sin(p.swayAngle) * 1.5;
      p.y += p.vy;
      p.rotation += p.vRot;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.isCircle) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }

      ctx.restore();
    });

    ctx.restore();
    confettiAnimationId = requestAnimationFrame(renderConfetti);
  }

  confettiAnimationId = requestAnimationFrame(renderConfetti);
}

/**
 * Halts the confetti animation, cancels requestAnimationFrame, and clears canvas.
 */
function stopConfetti() {
  if (confettiAnimationId !== null) {
    cancelAnimationFrame(confettiAnimationId);
    confettiAnimationId = null;
  }
  const ctx = confettiCanvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
  confettiParticles = [];
}

// ============================================================================
// 8. EVENT LISTENERS
// ============================================================================

// Start Quiz button on home screen
startBtn.addEventListener('click', startQuiz);

// Navbar links
navHome.addEventListener('click', (e) => {
  e.preventDefault();
  goHome();
});

navHomeLink.addEventListener('click', (e) => {
  e.preventDefault();
  goHome();
});

if (navAboutLink) {
  navAboutLink.addEventListener('click', (e) => {
    if (navAboutLink.getAttribute('href') === 'about.html') {
      return;
    }
    e.preventDefault();
    showAbout();
  });
}

// About screen action buttons
if (aboutStartBtn) {
  aboutStartBtn.addEventListener('click', startQuiz);
}
if (aboutHomeBtn) {
  aboutHomeBtn.addEventListener('click', goHome);
}

// Quiz screen exit button in navbar (visible only on quiz screen)
if (navExitBtn) {
  navExitBtn.addEventListener('click', () => {
    goHome();
  });
}

// Skip button
if (skipBtn) {
  skipBtn.addEventListener('click', skipQuestion);
}

// Result screen action buttons
retryBtn.addEventListener('click', restartQuiz);
homeBtn.addEventListener('click', goHome);

// Keyboard shortcuts: 1-4 to select answers, S to skip, Escape to exit to home
window.addEventListener('keydown', (e) => {
  const isQuizActive = screens.quiz.classList.contains('active');

  if (isQuizActive && !state.answered) {
    if (['1', '2', '3', '4'].includes(e.key)) {
      const index = parseInt(e.key, 10) - 1;
      const buttons = optionsContainer.querySelectorAll('.option-btn');
      if (buttons[index] && !buttons[index].disabled) {
        buttons[index].click();
      }
    } else if (e.key === 's' || e.key === 'S') {
      skipQuestion();
    }
  }

  // Escape key exits back to home safely
  if (e.key === 'Escape' && isQuizActive) {
    goHome();
  }
});

// Window resize handler for canvas
window.addEventListener('resize', () => {
  if (confettiAnimationId !== null) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
});

// Auto-start quiz if URL contains ?start=quiz or hash #quiz (e.g. launched from about.html)
if (window.location.search.includes('start=quiz') || window.location.hash === '#quiz') {
  startQuiz();
}
