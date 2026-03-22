import { fetchQuestions } from './api.js';
import { renderHeader, renderFooter, getQueryParam, difficultyText, saveQuizSession, getSavedQuizSession, saveHistory, generateChatReply, escapeHtml } from './utils.js';

renderHeader();
renderFooter();

const page = document.getElementById('quizPlayerPage');
let currentQuiz = null;
let answers = {};
let submitted = false;

function renderQuiz() {
  if (!currentQuiz) return;
  const progress = Math.round((Object.keys(answers).length / currentQuiz.questions.length) * 100);
  page.innerHTML = `
    <div class="player-grid">
      <section class="quiz-header">
        <div class="card panel">
          <span class="kicker">Làm bài trắc nghiệm</span>
          <h1>${escapeHtml(currentQuiz.categoryLabel)}</h1>
          <p class="muted">Độ khó: ${difficultyText(currentQuiz.difficulty)} · Số câu: ${currentQuiz.questions.length}</p>
          <div class="progress-bar"><div class="progress-value" style="width:${progress}%"></div></div>
        </div>
        <div>
          ${currentQuiz.questions.map((question, index) => `
            <article class="question-card card" data-qid="${question.id}">
              <strong>Câu ${index + 1}. ${escapeHtml(question.question)}</strong>
              <div class="option-list">
                ${question.options.map((option) => {
                  const active = answers[question.id] === option ? 'active' : '';
                  let resultClass = '';
                  if (submitted && option === question.correctAnswer) resultClass = 'correct';
                  if (submitted && answers[question.id] === option && option !== question.correctAnswer) resultClass = 'wrong';
                  return `<button class="option-item ${active} ${resultClass}" data-qid="${question.id}" data-value="${escapeHtml(option)}">${escapeHtml(option)}</button>`;
                }).join('')}
              </div>
            </article>
          `).join('')}
        </div>
        <div class="card panel">
          <div class="card-actions">
            <button id="submitQuiz" class="btn btn-success">Nộp bài</button>
            <button id="reloadQuiz" class="btn btn-secondary">Tạo bộ mới</button>
          </div>
          <div id="resultArea"></div>
        </div>
      </section>
      <aside class="sidebar-stack">
        <div class="card panel">
          <span class="kicker">Chat box gợi ý</span>
          <div class="chat-box">
            <div class="chat-log" id="chatLog">
              <div class="chat-message bot">Chào bạn, hãy nhập môn học hoặc mục tiêu như “ôn Toán cơ bản”, “luyện Tin học”, “mình yếu phần lịch sử” để mình gợi ý bài tập phù hợp.</div>
            </div>
            <div class="chat-input">
              <input id="chatInput" type="text" placeholder="Nhập nhu cầu học tập..." />
              <button id="sendChat" class="btn btn-primary">Gửi</button>
            </div>
          </div>
        </div>
        <div class="card panel">
          <span class="kicker">Mẹo làm bài</span>
          <ul class="feature-list">
            <li>Làm từ câu dễ trước.</li>
            <li>Đánh dấu từ khóa trong câu hỏi.</li>
            <li>Xem lại các câu sai sau khi nộp.</li>
          </ul>
        </div>
      </aside>
    </div>
  `;

  document.querySelectorAll('.option-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (submitted) return;
      answers[btn.dataset.qid] = btn.dataset.value;
      renderQuiz();
    });
  });

  document.getElementById('submitQuiz').addEventListener('click', submitQuiz);
  document.getElementById('reloadQuiz').addEventListener('click', init);
  document.getElementById('sendChat').addEventListener('click', sendChat);
  document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChat();
  });
}

function submitQuiz() {
  submitted = true;
  let correct = 0;
  currentQuiz.questions.forEach((question) => {
    if (answers[question.id] === question.correctAnswer) correct += 1;
  });
  const score = `${correct}/${currentQuiz.questions.length}`;
  saveHistory({ category: currentQuiz.categoryLabel, score, difficulty: currentQuiz.difficulty });
  renderQuiz();
  document.getElementById('resultArea').innerHTML = `
    <div class="result-box">
      <h3>Kết quả của bạn: ${score}</h3>
      <p>Bạn đã trả lời đúng ${correct} trên ${currentQuiz.questions.length} câu. Hãy xem lại các đáp án được tô màu xanh để ôn tập.</p>
    </div>
  `;
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const log = document.getElementById('chatLog');
  const value = input.value.trim();
  if (!value) return;
  log.insertAdjacentHTML('beforeend', `<div class="chat-message user">${escapeHtml(value)}</div>`);
  const reply = generateChatReply(value, { category: currentQuiz.categoryLabel, difficulty: currentQuiz.difficulty });
  log.insertAdjacentHTML('beforeend', `<div class="chat-message bot">${escapeHtml(reply)}</div>`);
  log.scrollTop = log.scrollHeight;
  input.value = '';
}

async function init() {
  page.innerHTML = '<div class="loading-state">Đang tải bài trắc nghiệm...</div>';
  submitted = false;
  answers = {};
  try {
    const category = getQueryParam('category') || '';
    const difficulty = getQueryParam('difficulty') || '';
    const amount = Number(getQueryParam('amount') || 10);
    const questions = await fetchQuestions({ amount, category, difficulty });
    currentQuiz = {
      categoryLabel: questions[0]?.category || 'General Knowledge',
      difficulty,
      amount,
      questions
    };
    saveQuizSession(currentQuiz);
    renderQuiz();
  } catch (error) {
    page.innerHTML = '<div class="empty-state">Không thể tải bài tập từ API.</div>';
  }
}

init();
