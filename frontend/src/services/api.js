import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authAPI = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
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

export default api
