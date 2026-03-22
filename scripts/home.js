import { fetchQuestions } from './api.js';
import { renderHeader, renderFooter, setLoading, clearLoading, createQuizCard, showToast, saveQuizSession } from './utils.js';

renderHeader();
renderFooter();

async function init() {
  setLoading('trendingLoading', 'Đang tải bài tập nổi bật...');
  try {
    const questions = await fetchQuestions({ amount: 6 });
    clearLoading('trendingLoading');
    document.getElementById('liveQuestionCount').textContent = `${questions.length}+`;
    document.getElementById('trendingList').innerHTML = questions.map((question, index) => {
      const params = new URLSearchParams({ category: question.category, difficulty: question.difficulty, amount: '5' }).toString();
      return createQuizCard({
        title: `Bộ luyện tập ${index + 1}: ${question.category}`,
        description: question.question,
        badges: [question.category, question.difficulty, 'Multiple Choice'],
        infoHref: `./info.html?${params}`,
        playHref: `./watch.html?${params}`
      });
    }).join('');

    document.querySelectorAll('#trendingList .btn-primary').forEach((btn) => {
      btn.addEventListener('click', () => showToast('Đang mở trang làm bài...'));
    });
  } catch (error) {
    clearLoading('trendingLoading');
    document.getElementById('trendingList').innerHTML = '<div class="empty-state">Không thể tải bài tập. Vui lòng thử lại sau.</div>';
  }
}

init();
