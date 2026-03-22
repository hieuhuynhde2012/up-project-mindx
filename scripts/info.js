import { fetchQuestions } from './api.js';
import { renderHeader, renderFooter, getQueryParam, toQuery, difficultyText, createQuizCard } from './utils.js';

renderHeader();
renderFooter();

const page = document.getElementById('quizInfoPage');

async function init() {
  const category = getQueryParam('category') || '';
  const difficulty = getQueryParam('difficulty') || '';
  const amount = Number(getQueryParam('amount') || 10);

  page.innerHTML = '<div class="loading-state">Đang tải thông tin bài tập...</div>';
  try {
    const questions = await fetchQuestions({ amount, category, difficulty });
    const first = questions[0];
    if (!first) {
      page.innerHTML = '<div class="empty-state">Không có dữ liệu bài tập.</div>';
      return;
    }

    const query = toQuery({ category, difficulty, amount });
    page.innerHTML = `
      <div class="info-grid">
        <section class="card info-main">
          <span class="kicker">Chi tiết bộ bài tập</span>
          <h1>${first.category}</h1>
          <p class="summary-text">Bộ bài này phù hợp để luyện tập nhanh theo hình thức trắc nghiệm 4 đáp án. Học sinh có thể làm trực tiếp, xem điểm số và đối chiếu đáp án ngay sau khi nộp.</p>
          <div class="meta-list">
            <div class="meta-item"><span>Số câu</span><strong>${amount}</strong></div>
            <div class="meta-item"><span>Độ khó</span><strong>${difficultyText(difficulty || first.difficulty)}</strong></div>
            <div class="meta-item"><span>Loại câu hỏi</span><strong>Trắc nghiệm 4 lựa chọn</strong></div>
            <div class="meta-item"><span>Chủ đề mẫu</span><strong>${first.question}</strong></div>
          </div>
          <div class="card-actions" style="margin-top:18px;">
            <a class="btn btn-primary" href="./watch.html?${query}">Bắt đầu làm bài</a>
            <a class="btn btn-secondary" href="./search.html">Tìm bộ khác</a>
          </div>
        </section>
        <aside class="card info-side">
          <span class="kicker">Gợi ý tương tự</span>
          <div class="recommend-grid">
            ${questions.slice(0, 3).map((item) => createQuizCard({
              title: item.category,
              description: item.question,
              badges: [difficultyText(item.difficulty)],
              infoHref: `./info.html?${query}`,
              playHref: `./watch.html?${query}`,
              actionText: 'Làm ngay'
            })).join('')}
          </div>
        </aside>
      </div>
    `;
  } catch (error) {
    page.innerHTML = '<div class="empty-state">Tải thông tin thất bại.</div>';
  }
}

init();
