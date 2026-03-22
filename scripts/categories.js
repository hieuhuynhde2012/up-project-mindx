import { fetchCategories, fetchQuestions } from './api.js';
import { renderHeader, renderFooter, fillCategorySelect, setLoading, clearLoading, setEmpty, clearEmpty, createQuizCard, difficultyText } from './utils.js';

renderHeader();
renderFooter();

const categorySelect = document.getElementById('categorySelect');
const difficultyFilter = document.getElementById('difficultyFilter');
const amountSelect = document.getElementById('amountSelect');
const resultEl = document.getElementById('categoryResults');

async function loadCategories() {
  const categories = await fetchCategories();
  fillCategorySelect(categorySelect, categories);
}

async function applyFilters() {
  setLoading('categoryLoading', 'Đang tải bộ bài tập...');
  clearEmpty('categoryEmpty');
  resultEl.innerHTML = '';
  try {
    const categoryId = categorySelect.value;
    const difficulty = difficultyFilter.value;
    const amount = amountSelect.value;
    const questions = await fetchQuestions({ amount, category: categoryId, difficulty });
    clearLoading('categoryLoading');
    if (!questions.length) {
      setEmpty('categoryEmpty', 'Chưa có dữ liệu phù hợp. Hãy đổi bộ lọc và thử lại.');
      return;
    }
    resultEl.innerHTML = questions.map((question, index) => {
      const params = new URLSearchParams({ category: categoryId, difficulty, amount }).toString();
      return createQuizCard({
        title: `${question.category} - Bộ ${index + 1}`,
        description: question.question,
        badges: [question.category, difficultyText(question.difficulty), `${amount} câu/bộ`],
        infoHref: `./info.html?${params}`,
        playHref: `./watch.html?${params}`
      });
    }).join('');
  } catch (error) {
    clearLoading('categoryLoading');
    setEmpty('categoryEmpty', 'Lỗi tải dữ liệu từ API.');
  }
}

document.getElementById('applyBtn').addEventListener('click', applyFilters);
loadCategories().then(applyFilters);
