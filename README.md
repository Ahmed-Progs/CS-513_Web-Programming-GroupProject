# JavaScript Quiz App

A timed, interactive quiz built with plain **HTML, CSS and JavaScript**. It asks 5 random JavaScript questions, gives each one 15 seconds, marks every answer right or wrong instantly, and finishes with a scored review that explains each answer.

Built by Group 9 as a Web Development project: *"Build a Quiz That Challenges the Class with JavaScript"*.

<!-- Add a screenshot of the quiz here, for example:
![Quiz screenshot](screenshot.png)
-->

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
  - [Configuration](#configuration)
  - [Application State](#application-state)
  - [Questions and Random Selection](#questions-and-random-selection)
  - [The Timer](#the-timer)
  - [Colour Changing with Time](#colour-changing-with-time)
  - [Checking Answers](#checking-answers-correct-or-wrong)
  - [Moving On and Results](#moving-on-and-results)
  - [Events and Keyboard Controls](#events-and-keyboard-controls)
- [Is AJAX Used?](#is-ajax-used)
- [Function Reference](#function-reference)
- [Team](#team)

## Features

| Feature | How it is done |
| --- | --- |
| 20 questions, 5 random per attempt | `questionBank` + `pickRandomQuestions()` |
| Shuffled answer positions | `shuffleArray()` on each question's options |
| 15-second timer with colour change | `Date.now()` elapsed time, `setInterval` every 100 ms, green / orange / red classes |
| Instant correct and wrong feedback | `checkAnswer()` adds `correct` or `wrong` classes and a message |
| Skip button and keyboard keys | `skipQuestion()`; `keydown` listener for `1`-`4`, `S` and `Esc` |
| Progress bar and live score | Width set from `currentIndex`; score text updated on each correct answer |
| Pass or fail, animated score, confetti | `showResult()`, `animateScore()`, canvas particles |
| Detailed review with explanations | `buildReview()` using the `userAnswers` records |
| Works on phones | CSS media queries at 860 px and 640 px; options become one column |
| Reduced motion support | CSS `prefers-reduced-motion` rule shortens animations |
| No libraries | 100% self-contained: HTML, CSS and vanilla JavaScript only |

## Getting Started

No installation or build step is needed.

1. Download or clone this repository.
2. Open `index.html` in any modern browser (double-click works).
3. Click **Start Quiz**.

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

## Project Structure

| File | Job | House analogy |
| --- | --- | --- |
| `index.html` | Structure: navbar, Home, Quiz and Result screens, footer | Walls and rooms |
| `style.css` | Design: colours, layout, animations, timer colours | Paint and decoration |
| `script.js` | Logic: questions, timer, scoring, screens, confetti | Electricity and wiring |

## How It Works

`script.js` has eight numbered sections: constants, state, question bank, DOM references, helper functions, game control, confetti engine and event listeners.

### Configuration

Four constants control the whole game. Changing one value changes the behaviour without touching other code.

| Constant | Value | Meaning |
| --- | --- | --- |
| `TOTAL_QUESTIONS` | 5 | Questions per attempt |
| `TIME_PER_QUESTION` | 15 | Seconds per question |
| `PASS_MARK` | 3 | Score needed to pass |
| `FEEDBACK_DELAY` | 1200 | Milliseconds the answer colours stay before the next question |

### Application State

One object, `state`, holds everything that changes while playing.

| Property | Holds |
| --- | --- |
| `questions` | The 5 questions picked for this attempt |
| `currentIndex` | Which question the player is on (0 to 4) |
| `score` | Correct answers so far |
| `timeLeft`, `timerId`, `timerStartTime` | The running countdown |
| `answered` | `true` once a question is answered; blocks double clicks |
| `userAnswers` | One record per question, used by the review |
| `bestScore` | Best score this session, kept only in a variable |

Each screen is a `<section class="screen">` and only the one with the class `active` is visible. `showScreen(id)` fades the old screen out (200 ms), shows the new one, and switches the navbar between the Home link and the Exit Quiz button.

### Questions and Random Selection

The 20 questions live in one array, `questionBank`. Each item is an object with four properties: `question`, `options` (4 strings), `answer` (the text of the correct option) and `explanation` (shown in the review).

```js
{
  question: "What does typeof 5 return?",
  options: ["number", "string", "integer", "undefined"],
  answer: "number",
  explanation: "typeof tells you the type of a value. Every number in JavaScript has the type number."
}
```

`pickRandomQuestions(pool, count)` shuffles the whole bank, takes the first 5 with `slice(0, count)`, then shuffles each question's options so the right answer is not always in the same place.

`shuffleArray(arr)` uses the **Fisher-Yates** method: it copies the array, then walks from the last item to the second, swapping each item with a random item at or before it (`j = Math.floor(Math.random() * (i + 1))`). Because it works on a copy, `questionBank` is never changed.

Shuffling options is safe because answers are checked by their text, not by their position.

### The Timer

Each question has a 15-second countdown started by `startTimer()` and stopped by `stopTimer()`.

1. `startTimer()` first calls `stopTimer()`, so two timers can never run at once.
2. It saves the start time with `Date.now()` and resets the bar to 100%, green, with the text "15s".
3. `setInterval` runs a function every 100 ms, ten times a second.
4. Each tick works out `elapsedSeconds = (Date.now() - timerStartTime) / 1000` and `timeLeft = Math.max(0, 15 - elapsedSeconds)`.
5. It sets the bar width to `timeLeft / 15 * 100`% and the text to `Math.ceil(timeLeft)` plus "s".
6. When `timeLeft` reaches 0 it calls `stopTimer()` and then `handleTimeUp()`.

The timer measures real elapsed time instead of subtracting 1 every second, because browsers can delay timers when a tab is busy or in the background. The 100 ms tick only makes the bar move smoothly.

`stopTimer()` runs `clearInterval(timerId)` and sets `timerId` to `null`. It is called when the player answers, skips, runs out of time, exits, or when a new timer starts.

### Colour Changing with Time

The bar changes colour in the same tick that updates its width. JavaScript works out `percentage = timeLeft / 15 * 100`, removes the three colour classes, and adds back exactly one.

| Time left | Percentage | Seconds left | Class added | Colour in `style.css` |
| --- | --- | --- | --- | --- |
| More than half | above 50% | above 7.5 | `timer-green` | `#22c55e` |
| Half to a quarter | 25% to 50% | 3.75 to 7.5 | `timer-orange` | `#f59e0b` |
| Under a quarter | below 25% | below 3.75 | `timer-red` | `#ef4444` |

JavaScript only swaps the class name; `style.css` decides what each class looks like. The `.timer-bar` rule has `transition: width 0.1s linear, background-color 0.3s ease`, so the bar shrinks smoothly and the colour fades instead of jumping.

At exactly 50% and exactly 25% the bar is orange, because the code tests `percentage > 50` for green and `percentage >= 25` for orange.

The same palette is used for answers: green for correct, red for wrong, orange for the "Time's up" message.

### Checking Answers (Correct or Wrong)

`checkAnswer(selectedText, clickedButton)` runs when a player clicks an option or presses `1`-`4`.

1. If `state.answered` is already `true` it returns, which blocks double clicks.
2. It sets `answered` to `true`, calls `stopTimer()`, and disables the four options and the Skip button.
3. It compares `isCorrect = selectedText === currentQ.answer`, an exact text match.
4. **Correct:** the button gets the class `correct` (green, small pulse), `state.score++`, the live score updates, and the feedback reads "Correct! ✅".
5. **Wrong:** the button gets the class `wrong` (red, small shake), the feedback reads "Wrong ❌", and the right button is found by its `data-option` attribute and turned green so the player learns.
6. The result is pushed into `state.userAnswers` for the review.
7. `setTimeout(nextQuestion, 1200)` leaves time to see the colours.

Two other outcomes follow the same pattern:

| Outcome | Function | Trigger | Feedback | Score |
| --- | --- | --- | --- | --- |
| Correct or wrong | `checkAnswer` | Click or keys `1`-`4` | Correct ✅ or Wrong ❌ | +1 or 0 |
| Skipped | `skipQuestion` | Skip button or `S` | Skipped ⏭️ | 0, no penalty |
| Time up | `handleTimeUp` | Timer reaches 0 | Time's up! ⏰ | 0 |

Skip and time-up also turn the right answer green and record the question for the review.

### Moving On and Results

`nextQuestion()` adds 1 to `currentIndex` and updates the progress bar to `currentIndex / 5 * 100`%. If questions remain it fades the question area out for 220 ms and calls `showQuestion()`; after question 5 it calls `showResult()`.

`showResult()` does the following:

- **Pass or fail:** `passed = score >= PASS_MARK` (3 of 5). A pass shows "Hurray, you passed!" and confetti; a fail shows "Better luck next time!".
- **Best score:** stored in `state.bestScore` for the current session only, with no `localStorage` or cookies. The "New best!" badge appears when a later attempt beats an earlier one, never on the first attempt.
- **Score animation:** `animateScore(target)` counts the number up from 0 over 800 ms using `requestAnimationFrame`.
- **Review:** `buildReview()` creates one card per question with a green, red or grey border (correct, wrong or timed out, skipped), your answer, the correct answer and a "Why" line. Text placed with `innerHTML` goes through `escapeHTML()` first, so characters like `<` show as text instead of running as code.
- **Confetti:** `launchConfetti()` creates 140 particles on a full-screen canvas, each with a random colour, size, fall speed, sway and spin. It runs for 4 seconds and fades in the last 0.8 s. `stopConfetti()` cancels the animation frame and clears the canvas.

### Events and Keyboard Controls

An event is something the user does. `addEventListener` tells the browser which function to run when it happens.

| Event | Where | Runs |
| --- | --- | --- |
| `click` | Start Quiz button | `startQuiz` |
| `click` | Each option button (created in `showQuestion`) | `checkAnswer` |
| `click` | Skip Question button | `skipQuestion` |
| `click` | Exit Quiz, Home link, brand name, Back to Home | `goHome` |
| `click` | Try Again | `restartQuiz`, which calls `startQuiz` |
| `keydown` (window) | Keys `1`, `2`, `3`, `4` | Clicks that option button |
| `keydown` (window) | `S` | `skipQuestion` |
| `keydown` (window) | `Esc` | `goHome`, while on the quiz screen |
| `resize` (window) | Browser window | Resizes the confetti canvas |

`event.preventDefault()` on the link clicks stops the page jumping to `#`.

Keys `1`-`4` and `S` only work while the question is unanswered (`state.answered` is `false`).

## Is AJAX Used?

**No.** The app does not use AJAX. There is no `fetch()`, no `XMLHttpRequest`, and no library such as jQuery or axios.

AJAX means a page asking a server for data in the background without reloading. This app has no server and does not need one: the 20 questions are written directly into `script.js` as the `questionBank` array, and nothing is sent or saved anywhere. Even the best score is a plain variable, with no `localStorage` or cookies, so it resets when the page is refreshed.

The page still changes without reloading, but that is DOM manipulation, not AJAX. `createElement`, `appendChild`, `textContent` and `classList` update what is on screen, and `showScreen` switches between sections of one page (a single-page application).

If you want to add AJAX later, the questions could move into a `questions.json` file and be loaded like this:

```js
async function loadQuestions() {
  const response = await fetch('questions.json');
  return await response.json();
}
```

`startQuiz()` would then wait for the result. This only works when the page is served from a web server (for example the VS Code Live Server extension); opening the file by double-click blocks `fetch` in most browsers. The current design avoids that and works offline.

## Function Reference

| Function | What it does |
| --- | --- |
| `shuffleArray(arr)` | Fisher-Yates shuffle of a copy of the array |
| `pickRandomQuestions(pool, count)` | Picks 5 unique questions and shuffles their options |
| `escapeHTML(str)` | Turns special characters into safe text before using `innerHTML` |
| `showScreen(id, callback)` | Fades between screens and updates the navbar |
| `startQuiz()` | Resets score and answers, picks questions, shows Question 1 |
| `showQuestion()` | Builds the question and option buttons, updates progress, starts the timer |
| `startTimer()` / `stopTimer()` | Runs and cancels the 15-second countdown |
| `checkAnswer(text, button)` | Locks options, marks correct or wrong, updates score |
| `skipQuestion()` | Reveals the answer and records a skip |
| `handleTimeUp()` | Reveals the answer and records a timeout |
| `nextQuestion()` | Moves on, or opens the results after question 5 |
| `showResult()` | Pass or fail, best score, builds review, starts animations |
| `animateScore(target)` | Counts the score up from 0 |
| `buildReview()` | Creates the answer review cards |
| `launchConfetti()` / `stopConfetti()` | Starts and stops the canvas confetti |
| `restartQuiz()` / `goHome()` | Start again, or return Home and cancel timers and confetti |

## Team

**Group 9** · Web Development Project

- Ayesha Fatima
- Malaika Bashir
- Minahal Murtaza
- Ahmed Raza
- Rashid Ali
- Imama Khalid
