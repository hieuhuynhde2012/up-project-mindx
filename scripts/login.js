import { renderHeader, renderFooter, findUserByEmail, setCurrentUser } from './utils.js';

renderHeader();
renderFooter();

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const message = document.getElementById('authMessage');
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    message.textContent = 'Email hoặc mật khẩu chưa đúng.';
    return;
  }
  setCurrentUser(user);
  message.textContent = 'Đăng nhập thành công. Đang chuyển về trang chủ...';
  setTimeout(() => (window.location.href = './index.html'), 700);
});
