import { defaultCategories } from './api.js';

export function renderHeader() {
  const host = document.getElementById('siteHeader');
  if (!host) return;
  const user = getCurrentUser();
  host.innerHTML = `
    <header class="site-header">
      <div class="container nav-shell">
        <a class="brand" href="./index.html">
          <img src="./assets/logo.svg" alt="EduQuiz Hub" />
          <span>EduQuiz Hub</span>
        </a>
        <nav class="nav-links">
          <a href="./index.html">Trang chủ</a>
          <a href="./categories.html">Môn học</a>
          <a href="./search.html">Tìm bài tập</a>
          <a href="./watch.html">Làm bài</a>
        </nav>
        <div class="nav-auth">
          ${user ? `
            <span class="nav-user">${escapeHtml(user.username)}</span>
            <a href="#" id="logoutBtn">Đăng xuất</a>
          ` : `
            <a href="./login.html">Đăng nhập</a>
            <a href="./register.html" class="btn btn-primary">Đăng ký</a>
          `}
        </div>
      </div>
    </header>
  `;
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('eduquiz_current_user');
      showToast('Đã đăng xuất');
      setTimeout(() => (window.location.href = './index.html'), 400);
    });
  }
}

export function renderFooter() {
  const host = document.getElementById('siteFooter');
  if (!host) return;
  host.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <strong>EduQuiz Hub</strong>
          <p>Nền tảng web học tập với bài tập trắc nghiệm, chấm điểm nhanh và chat box gợi ý.</p>
        </div>
        <div>
          <p>Phù hợp cho học sinh tự học, ôn tập nhanh và luyện đề cơ bản.</p>
        </div>
      </div>
    </footer>
  `;
}

export function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

export function setLoading(id, text = 'Đang tải dữ liệu...') {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="loading-state">${text}</div>`;
}

export function clearLoading(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '';
}

export function setEmpty(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="empty-state">${text}</div>`;
}

export function clearEmpty(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '';
}

export function createQuizCard(config) {
  const { title, description, badges = [], infoHref = '#', playHref = '#', actionText = 'Làm bài' } = config;
  return `
    <article class="quiz-card card">
      <div class="badge-row">
        ${badges.map((badge) => `<span class="badge">${escapeHtml(badge)}</span>`).join('')}
      </div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
      <div class="card-actions">
        <a href="${infoHref}" class="btn btn-secondary">Chi tiết</a>
        <a href="${playHref}" class="btn btn-primary">${actionText}</a>
      </div>
    </article>
  `;
}

export function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

export function toQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  return search.toString();
}

export function saveQuizSession(quiz) {
  localStorage.setItem('eduquiz_current_quiz', JSON.stringify(quiz));
}

export function getSavedQuizSession() {
  try {
    return JSON.parse(localStorage.getItem('eduquiz_current_quiz'));
  } catch (e) {
    return null;
  }
}

export function saveHistory(entry) {
  const current = JSON.parse(localStorage.getItem('eduquiz_history') || '[]');
  current.unshift({ ...entry, savedAt: new Date().toISOString() });
  localStorage.setItem('eduquiz_history', JSON.stringify(current.slice(0, 20)));
}

export function registerUser(user) {
  const users = JSON.parse(localStorage.getItem('eduquiz_users') || '[]');
  users.push(user);
  localStorage.setItem('eduquiz_users', JSON.stringify(users));
}

export function findUserByEmail(email) {
  const users = JSON.parse(localStorage.getItem('eduquiz_users') || '[]');
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function setCurrentUser(user) {
  localStorage.setItem('eduquiz_current_user', JSON.stringify(user));
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('eduquiz_current_user'));
  } catch (e) {
    return null;
  }
}

export function escapeHtml(str = '') {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function fillCategorySelect(select, categories = defaultCategories, includeAll = true) {
  if (!select) return;
  const normalized = includeAll ? categories : categories.filter((item) => item.id !== '');
  select.innerHTML = normalized.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join('');
}

export function difficultyText(value = '') {
  if (value === 'easy') return 'Dễ';
  if (value === 'medium') return 'Trung bình';
  if (value === 'hard') return 'Khó';
  return 'Ngẫu nhiên';
}

export function generateChatReply(message, quizContext = {}) {
  const text = message.toLowerCase();
  const category = quizContext.category || 'General Knowledge';
  const difficulty = difficultyText(quizContext.difficulty || '');

  if (text.includes('toán') || text.includes('math')) {
    return `Bạn nên ưu tiên bài Science: Mathematics ở mức dễ hoặc trung bình. Hãy thử bộ 10 câu trước rồi tăng lên 15 câu nếu đạt trên 8/10.`;
  }
  if (text.includes('máy tính') || text.includes('computer') || text.includes('tin học')) {
    return `Mình gợi ý chủ đề Science: Computers. Nên bắt đầu với mức ${difficulty} hoặc mức dễ để nắm chắc khái niệm, sau đó chuyển sang bộ mới ở trang Môn học.`;
  }
  if (text.includes('lịch sử') || text.includes('history')) {
    return `Với lịch sử, bạn nên làm bài theo từng đợt 5-10 câu và sau mỗi lượt xem lại câu sai. Chủ đề History trong hệ thống khá phù hợp để ôn nhanh.`;
  }
  if (text.includes('gợi ý') || text.includes('đề xuất') || text.includes('nên học gì')) {
    return `Dựa trên bài hiện tại, mình gợi ý bạn luyện thêm chủ đề ${category} ở mức ${difficulty}. Hãy ưu tiên 2 vòng: một vòng 5 câu để làm quen, một vòng 10 câu để kiểm tra lại.`;
  }
  if (text.includes('cải thiện') || text.includes('yếu')) {
    return `Để cải thiện, bạn nên chọn mức dễ, làm chậm từng câu, và ghi lại từ khóa của các câu sai. Sau đó chuyển sang mức trung bình cùng chủ đề.`;
  }
  return `Bạn có thể nói rõ môn muốn luyện như Toán, Lịch sử, Tin học hoặc mục tiêu như “ôn tập cơ bản”, “luyện khó”. Mình sẽ gợi ý bộ bài tập phù hợp hơn. Hiện tại mình đề xuất chủ đề ${category} ở mức ${difficulty}.`;
}
