// Admin authentication utilities
const AUTH_KEY = 'easytutor_admin_token';

function getToken() {
  return localStorage.getItem(AUTH_KEY);
}

function setToken(token) {
  localStorage.setItem(AUTH_KEY, token);
}

function clearToken() {
  localStorage.removeItem(AUTH_KEY);
}

function checkAuth() {
  if (!getToken()) {
    window.location.href = '/admin/index.html';
  }
}

async function logout() {
  try {
    await adminFetch('/api/admin/logout', { method: 'POST' });
  } catch (e) { /* ignore */ }
  clearToken();
  window.location.href = '/admin/index.html';
}

// Show toast notification
function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}
