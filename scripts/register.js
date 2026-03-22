import { renderHeader, renderFooter, findUserByEmail, registerUser, setCurrentUser } from './utils.js';

renderHeader();
renderFooter();

document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const message = document.getElementById('authMessage');

  if (findUserByEmail(email)) {
    message.textContent = 'Email này đã được đăng ký.';
    return;
  }

  const user = { username, email, password };
  registerUser(user);
  setCurrentUser(user);
  message.textContent = 'Đăng ký thành công. Đang chuyển về trang chủ...';
  setTimeout(() => (window.location.href = './index.html'), 700);
});
