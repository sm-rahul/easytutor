// Admin API helper
const API_BASE = '';

async function adminFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(API_BASE + url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401 && !url.includes('/login')) {
    clearToken();
    window.location.href = '/admin/index.html';
    throw new Error('Unauthorized');
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

// API functions
async function adminLogin(username, password) {
  return adminFetch('/api/admin/login', {
    method: 'POST',
    body: { username, password },
  });
}

async function getDashboard() {
  return adminFetch('/api/admin/dashboard');
}

async function getUsers(page = 1, limit = 20, search = '') {
  const params = new URLSearchParams({ page, limit, search });
  return adminFetch(`/api/admin/users?${params}`);
}

async function getUser(id) {
  return adminFetch(`/api/admin/users/${id}`);
}

async function deleteUser(id) {
  return adminFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
}

async function getHistory(page = 1, limit = 20, search = '') {
  const params = new URLSearchParams({ page, limit, search });
  return adminFetch(`/api/admin/history?${params}`);
}

async function deleteHistory(id) {
  return adminFetch(`/api/admin/history/${id}`, { method: 'DELETE' });
}

async function updateHistory(id, data) {
  return adminFetch(`/api/admin/history/${id}`, { method: 'PUT', body: data });
}

// Quiz admin
async function getQuizzes(page = 1, limit = 20, search = '') {
  const params = new URLSearchParams({ page, limit, search });
  return adminFetch(`/api/admin/quizzes?${params}`);
}

async function getQuiz(id) {
  return adminFetch(`/api/admin/quizzes/${id}`);
}

async function deleteQuiz(id) {
  return adminFetch(`/api/admin/quizzes/${id}`, { method: 'DELETE' });
}

// Goals admin
async function getGoalsAdmin(page = 1, limit = 20, search = '') {
  const params = new URLSearchParams({ page, limit, search });
  return adminFetch(`/api/admin/goals?${params}`);
}

async function updateGoalsAdmin(userId, data) {
  return adminFetch(`/api/admin/goals/${userId}`, { method: 'PUT', body: data });
}

// Settings admin
async function getSettings() {
  return adminFetch('/api/admin/settings');
}

async function updateSetting(key, value) {
  return adminFetch(`/api/admin/settings/${encodeURIComponent(key)}`, { method: 'PUT', body: { value } });
}

async function createSetting(data) {
  return adminFetch('/api/admin/settings', { method: 'POST', body: data });
}

async function deleteSetting(key) {
  return adminFetch(`/api/admin/settings/${encodeURIComponent(key)}`, { method: 'DELETE' });
}

async function uploadAboutImage(base64Data, filename) {
  return adminFetch('/api/admin/upload-image', { method: 'POST', body: { image: base64Data, filename } });
}
