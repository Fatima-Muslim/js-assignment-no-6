
const STATE = {
  level:      null,   // 'easy' | 'normal' | 'hard'
  answer:     null,   // secret number
  lives:      3,
  maxLives:   3,
  attempts:   0,
  maxRange:   10,
  gameActive: false,
};

// ---- Level Config ----
const LEVELS = {
  easy:   { max: 10,  label: ' Easy',   color: '#00c98a' },
  normal: { max: 50,  label: ' Normal',  color: '#ff8c00' },
  hard:   { max: 100, label: ' Hard',    color: '#e0365e' },
};

// ---- Hint Messages ----
const TOO_LOW_MSGS  = ['Go higher! ', 'Too small! ', 'Aim higher! ⬆', 'Not enough! Think bigger! '];
const TOO_HIGH_MSGS = ['Go lower! ', 'Too big! ', 'Come down! ⬇', 'Too much! Try smaller! '];

// ---- DOM helpers ----
const $  = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const target = $(id);
  target.style.display = 'block';
  // force reflow so animation re-triggers
  void target.offsetWidth;
  target.classList.add('active');
}

// ---- Start Game ----
function startGame(level) {
  const cfg = LEVELS[level];

  STATE.level    = level;
  STATE.maxRange = cfg.max;
  STATE.answer   = Math.floor(Math.random() * cfg.max) + 1;
  STATE.lives    = 3;
  STATE.attempts = 0;
  STATE.gameActive = true;

  // Update UI
  $('levelBadge').textContent = cfg.label;
  $('levelBadge').style.background = cfg.color;
  $('rangeLabel').textContent = `1 and ${cfg.max}`;
  $('guessInput').max = cfg.max;
  $('guessInput').min = 1;
  $('guessInput').value = '';
  $('feedback').className = 'feedback hidden';
  $('feedback').textContent = '';
  $('attemptLog').innerHTML = '';

  updateLivesDisplay();
  showScreen('gameScreen');

  // focus input after animation
  setTimeout(() => $('guessInput').focus(), 400);
}

// ---- Check Guess ----
function checkGuess() {
  if (!STATE.gameActive) return;

  const raw   = $('guessInput').value.trim();
  const guess = parseInt(raw, 10);

  // Validate
  if (raw === '' || isNaN(guess) || guess < 1 || guess > STATE.maxRange) {
    showFeedback(`Please enter a number between 1 and ${STATE.maxRange}! `, 'too-low');
    shakeInput();
    return;
  }

  STATE.attempts++;
  addAttemptPill(guess);
  $('guessInput').value = '';
  $('guessInput').focus();

  if (guess === STATE.answer) {
    // WIN
    STATE.gameActive = false;
    showFeedback('🎉 Correct! Amazing!', 'correct');
    setTimeout(() => showWin(), 700);

  } else {
    // WRONG
    STATE.lives--;
    updateLivesDisplay();

    if (STATE.lives === 0) {
      // GAME OVER
      STATE.gameActive = false;
      showFeedback('❌ No more lives!', 'too-high');
      setTimeout(() => showGameOver(), 700);
    } else {
      // Hint
      const msgs = guess < STATE.answer ? TOO_LOW_MSGS : TOO_HIGH_MSGS;
      const msg  = msgs[Math.floor(Math.random() * msgs.length)];
      const type = guess < STATE.answer ? 'too-low' : 'too-high';
      showFeedback(msg, type);
      shakeInput();
    }
  }
}

// ---- Show Feedback ----
function showFeedback(msg, type) {
  const el = $('feedback');
  el.textContent = msg;
  el.className   = `feedback ${type}`;
  // Force reflow to restart animation
  void el.offsetWidth;
  el.className = `feedback ${type}`;
}

// ---- Attempt Pill ----
function addAttemptPill(guess) {
  const pill = document.createElement('span');
  pill.className = 'attempt-pill';
  pill.textContent = `#${STATE.attempts}: ${guess}`;
  $('attemptLog').appendChild(pill);
}

// ---- Lives Display ----
function updateLivesDisplay() {
  const hearts = $('livesDisplay').querySelectorAll('span');
  hearts.forEach((h, i) => {
    if (i < STATE.lives) {
      h.classList.remove('lost');
      h.textContent = '❤️';
    } else {
      h.classList.add('lost');
      h.textContent = '🖤';
    }
  });
}

// ---- Shake Input ----
function shakeInput() {
  const el = $('guessInput');
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

// ---- Win Screen ----
function showWin() {
  const tries  = STATE.attempts;
  const plural = tries === 1 ? 'try' : 'tries';
  $('winMsg').innerHTML = `Amazing! You guessed <strong>${STATE.answer}</strong> in ${tries} ${plural}! 🎊`;

  // Star rating
  const stars = tries <= 3 ? '⭐⭐⭐' : tries <= 6 ? '⭐⭐' : '⭐';
  qs('.star-row').textContent = stars;

  showScreen('winScreen');
}

// ---- Game Over Screen ----
function showGameOver() {
  $('revealNum').textContent = STATE.answer;
  showScreen('overScreen');
}

// ---- Restart Game ----
function restartGame() {
  STATE.gameActive = false;
  showScreen('levelScreen');
}

// ---- Keyboard Support ----
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if ($('gameScreen').classList.contains('active')) {
      checkGuess();
    }
  }
});