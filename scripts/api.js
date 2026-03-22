export const API_BASE = 'https://opentdb.com';

export const defaultCategories = [
  { id: '', name: 'Tất cả môn/chủ đề' },
  { id: 17, name: 'Science & Nature' },
  { id: 18, name: 'Science: Computers' },
  { id: 19, name: 'Science: Mathematics' },
  { id: 22, name: 'Geography' },
  { id: 23, name: 'History' },
  { id: 24, name: 'Politics' },
  { id: 9, name: 'General Knowledge' },
  { id: 27, name: 'Animals' }
];

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/api_category.php`);
    const data = await res.json();
    if (Array.isArray(data.trivia_categories) && data.trivia_categories.length) {
      return [{ id: '', name: 'Tất cả môn/chủ đề' }, ...data.trivia_categories];
    }
    return defaultCategories;
  } catch (error) {
    return defaultCategories;
  }
}

export async function fetchQuestions({ amount = 10, category = '', difficulty = '' } = {}) {
  const url = new URL(`${API_BASE}/api.php`);
  url.searchParams.set('amount', amount);
  url.searchParams.set('type', 'multiple');
  if (category) url.searchParams.set('category', category);
  if (difficulty) url.searchParams.set('difficulty', difficulty);

  const res = await fetch(url.toString());
  const data = await res.json();
  const results = Array.isArray(data.results) ? data.results : [];
  return results.map((item, index) => normalizeQuestion(item, index));
}

export function normalizeQuestion(item, index = 0) {
  const options = shuffle([
    ...item.incorrect_answers.map(decodeHtml),
    decodeHtml(item.correct_answer)
  ]);
  return {
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    category: decodeHtml(item.category),
    difficulty: item.difficulty,
    question: decodeHtml(item.question),
    correctAnswer: decodeHtml(item.correct_answer),
    incorrectAnswers: item.incorrect_answers.map(decodeHtml),
    options,
    type: item.type
  };
}

export function decodeHtml(value = '') {
  const txt = document.createElement('textarea');
  txt.innerHTML = value;
  return txt.value;
}

export function shuffle(arr) {
  const cloned = [...arr];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}
