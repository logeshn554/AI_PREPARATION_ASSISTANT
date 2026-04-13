import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  googleLogin: (idToken) =>
    api.post('/auth/google', { id_token: idToken }),
  me: () =>
    api.get('/auth/me'),
}

export const resumeAPI = {
  upload: (userId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/resume/upload?user_id=${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getUserResumes: (userId) =>
    api.get(`/resume/user/${userId}`),
  getResume: (resumeId) =>
    api.get(`/resume/${resumeId}`),
  deleteResume: (resumeId) =>
    api.delete(`/resume/${resumeId}`),
}

export const questionAPI = {
  generateQuestions: (role, skills, numQuestions = 10) =>
    api.post('/questions/generate', { role, skills, num_questions: numQuestions }),
  getQuestionsByRole: (role) =>
    api.get(`/questions/role/${role}`),
  getRandomQuestions: (role, limit = 10) =>
    api.get(`/questions/random?role=${role}&limit=${limit}`),
  getQuestion: (questionId) =>
    api.get(`/questions/${questionId}`),
}

export const answerAPI = {
  submitAnswer: (userId, questionId, answerText) =>
    api.post(`/answers/submit?user_id=${userId}`, {
      question_id: questionId,
      answer_text: answerText,
    }),
  evaluateAnswer: (userId, questionId, answerText) =>
    api.post(`/answers/evaluate?user_id=${userId}`, {
      question_id: questionId,
      answer_text: answerText,
    }),
  getUserAnswers: (userId) =>
    api.get(`/answers/user/${userId}`),
  getAnswer: (answerId) =>
    api.get(`/answers/${answerId}`),
  getUserStats: (userId) =>
    api.get(`/answers/stats/${userId}`),
}

export const dashboardAPI = {
  getDashboard: (userId) =>
    api.get(`/dashboard/${userId}`),
}

export const quizAPI = {
  generate: (userId, role, skills, numQuestions = 10) =>
    api.post(`/quiz/generate?user_id=${userId}`, {
      role,
      skills,
      num_questions: numQuestions,
    }),
  submit: (sessionId, answers, totalTimeSeconds = 0) =>
    api.post(`/quiz/${sessionId}/submit`, {
      answers,
      total_time_seconds: totalTimeSeconds,
    }),
  getSession: (sessionId) =>
    api.get(`/quiz/${sessionId}`),
}

export const companyAPI = {
  prepare: (companyName, role = '', refresh = false) =>
    api.post('/company/prepare', {
      company_name: companyName,
      role: role || null,
      refresh,
    }),
  get: (companyName) =>
    api.get(`/company/${companyName}`),
}

export const mockTestAPI = {
  create: (userId, companyName, role, skills, numQuestions = 12, durationMinutes = 45) =>
    api.post(`/mock-tests/create?user_id=${userId}`, {
      company_name: companyName,
      role,
      skills,
      num_questions: numQuestions,
      duration_minutes: durationMinutes,
    }),
  submit: (testId, answers, totalTimeSeconds = 0) =>
    api.post(`/mock-tests/${testId}/submit`, {
      answers,
      total_time_seconds: totalTimeSeconds,
    }),
  get: (testId) =>
    api.get(`/mock-tests/${testId}`),
}

export const analyticsAPI = {
  getUserAnalytics: (userId) =>
    api.get(`/analytics/${userId}`),
}

export const aiInterviewerAPI = {
  chat: (payload) =>
    api.post('/ai-interviewer/chat', payload),
}

export const challengeAPI = {
  today: () =>
    api.get('/challenges/today'),
  submit: (userId, challengeId, answerText) =>
    api.post(`/challenges/submit?user_id=${userId}`, {
      challenge_id: challengeId,
      answer_text: answerText,
    }),
  leaderboard: (limit = 20) =>
    api.get(`/leaderboard?limit=${limit}`),
}

export default api
