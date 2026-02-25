// Backend API base URL
// For Expo Go on physical device, replace with your computer's local IP
// For emulator/web, localhost works fine
import { Platform } from 'react-native';
const API_BASE = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : 'http://192.168.1.8:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();
  return data;
}

// ============================================================
// AUTH
// ============================================================
export async function apiRegister({ name, email, password, childName, childAge }) {
  return request('/auth/register', {
    method: 'POST',
    body: { name, email, password, childName, childAge },
  });
}

export async function apiLogin(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function apiUpdateProfile(userId, updates) {
  return request(`/auth/profile/${userId}`, {
    method: 'PUT',
    body: updates,
  });
}

// ============================================================
// HISTORY
// ============================================================
export async function apiGetHistory(userId) {
  return request(`/history/${userId}`);
}

export async function apiSaveHistory(userId, imageUri, result) {
  return request('/history', {
    method: 'POST',
    body: { userId, imageUri, result },
  });
}

export async function apiDeleteHistory(itemId) {
  return request(`/history/${itemId}`, {
    method: 'DELETE',
  });
}

// ============================================================
// AI ANALYSIS
// ============================================================
export async function apiAnalyzeImage(base64Image, userId) {
  return request('/analyze', {
    method: 'POST',
    body: { base64Image, userId },
  });
}

export async function apiSimplify({ summary, visualExplanation, realWorldExamples, extractedText, solutionSteps }) {
  return request('/simplify', {
    method: 'POST',
    body: { summary, visualExplanation, realWorldExamples, extractedText, solutionSteps },
  });
}

// ============================================================
// STATS
// ============================================================
export async function apiGetStats(userId) {
  return request(`/stats/${userId}`);
}

// ============================================================
// GOALS & READING TIME
// ============================================================
export async function apiGetGoals(userId) {
  return request(`/goals/${userId}`);
}

export async function apiUpdateGoals(userId, { dailyLessons, dailyMinutes }) {
  return request(`/goals/${userId}`, {
    method: 'PUT',
    body: { dailyLessons, dailyMinutes },
  });
}

export async function apiLogReadingTime(userId, seconds) {
  return request(`/reading-time/${userId}`, {
    method: 'POST',
    body: { seconds },
  });
}

// ============================================================
// QUIZ
// ============================================================
export async function apiGenerateQuiz({ userId, historyId, extractedText, summary, keyWords, type, solutionSteps, finalAnswer }) {
  return request('/quiz/generate', {
    method: 'POST',
    body: { userId, historyId, extractedText, summary, keyWords, type, solutionSteps, finalAnswer },
  });
}

export async function apiGetQuiz(quizId, showAnswers = false) {
  return request(`/quiz/${quizId}?showAnswers=${showAnswers}`);
}

export async function apiSubmitQuiz(quizId, { userId, answers, timeTakenSeconds }) {
  return request(`/quiz/${quizId}/submit`, {
    method: 'POST',
    body: { userId, answers, timeTakenSeconds },
  });
}

export async function apiGetQuizHistory(userId) {
  return request(`/quiz/history/${userId}`);
}

export async function apiGetQuizPerformance(userId) {
  return request(`/quiz/performance/${userId}`);
}
