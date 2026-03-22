import { fetchCategories, fetchQuestions } from './api.js';
import { renderHeader, renderFooter, fillCategorySelect, setLoading, clearLoading, setEmpty, clearEmpty, createQuizCard, difficultyText } from './utils.js';

renderHeader();
renderFooter();

const searchInput = document.getElementById('searchInput');
const subjectSelect = document.getElementById('subjectSelect');
const sortSelect = document.getElementById('sortSelect');
const resultEl = document.getElementById('searchResults');

async function init() {
  const categories = await fetchCategories();
  fillCategorySelect(subjectSelect, categories);
  runSearch();
}

function sortQuestions(list, mode) {
  const order = { easy: 1, medium: 2, hard: 3 };
  if (mode === 'easyFirst') return list.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
  if (mode === 'hardFirst') return list.sort((a, b) => order[b.difficulty] - order[a.difficulty]);
  if (mode === 'az') return list.sort((a, b) => a.category.localeCompare(b.category));
  return list;
}

async function runSearch() {
  setLoading('searchLoading', 'Đang tìm bài tập...');
  clearEmpty('searchEmpty');
  resultEl.innerHTML = '';
  try {
    const keyword = searchInput.value.trim().toLowerCase();
    const category = subjectSelect.value;
    const all = await fetchQuestions({ amount: 15, category });
    let filtered = all.filter((item) => !keyword || item.question.toLowerCase().includes(keyword) || item.category.toLowerCase().includes(keyword));
    filtered = sortQuestions(filtered, sortSelect.value);
    clearLoading('searchLoading');
    if (!filtered.length) {
      setEmpty('searchEmpty', 'Không tìm thấy bài tập phù hợp với từ khóa.');
      return;
    }
    resultEl.innerHTML = filtered.map((item) => {
      const params = new URLSearchParams({ category: category, difficulty: item.difficulty, amount: '10' }).toString();
      return createQuizCard({
        title: item.category,
        description: item.question,
        badges: [item.category, difficultyText(item.difficulty)],
        infoHref: `./info.html?${params}`,
        playHref: `./watch.html?${params}`
      });
    }).join('');
  } catch (error) {
    clearLoading('searchLoading');
    setEmpty('searchEmpty', 'Không thể tìm dữ liệu lúc này.');
  }
}

document.getElementById('searchBtn').addEventListener('click', runSearch);
searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(); });
init();
