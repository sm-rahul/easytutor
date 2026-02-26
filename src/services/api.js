// Backend API base URL
// For Expo Go on physical device, replace with your computer's local IP
// For emulator/web, localhost works fine
import { Platform } from 'react-native';
const API_BASE = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : 'http://192.168.1.8:5000/api';

async function request(endpoint, options = {}, timeoutMs = 45000) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  let response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    response = await fetch(url, { ...config, signal: controller.signal });
  } catch (networkError) {
    clearTimeout(timeoutId);
    if (networkError.name === 'AbortError') {
      throw new Error('Request timed out — please try again');
    }
    throw new Error('Network error — check your internet connection');
  }
  clearTimeout(timeoutId);

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error(`Server error (${response.status})`);
  }

  if (!response.ok && !data.success) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

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

export async function apiUpdateHistoryReadTime(itemId, seconds) {
  return request(`/history/${itemId}/read-time`, {
    method: 'PUT',
    body: { seconds },
  });
}

// ============================================================
// AI ANALYSIS
// ============================================================
export async function apiAnalyzeImage(base64Image, userId) {
  return request('/analyze', {
    method: 'POST',
    body: { base64Image, userId },
  }, 120000); // 2 minutes — gpt-4o with images can take 60+ seconds
}

export async function apiSimplify({ summary, visualExplanation, realWorldExamples, extractedText, solutionSteps }) {
  return request('/simplify', {
    method: 'POST',
    body: { summary, visualExplanation, realWorldExamples, extractedText, solutionSteps },
  }, 90000); // 90 seconds
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
  }, 90000); // 90 seconds
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

export async function apiGetAttemptDetail(attemptId) {
  return request(`/quiz/attempt/${attemptId}`);
}
