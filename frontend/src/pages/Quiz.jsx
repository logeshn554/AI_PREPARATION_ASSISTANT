import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { quizAPI } from '../services/api'

export default function Quiz() {
  const userId = localStorage.getItem('userId')
  const [role, setRole] = useState('Full Stack Developer')
  const [skills, setSkills] = useState('python,react,sql')
  const [numQuestions, setNumQuestions] = useState(8)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [startedAt, setStartedAt] = useState(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean)
      const res = await quizAPI.generate(userId, role, skillList, numQuestions)
      setSessionId(res.data.session_id)
      setQuestions(res.data.questions || [])
      setAnswers({})
      setStartedAt(Date.now())
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not generate quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!sessionId) return
    setLoading(true)
    setError('')

    try {
      const payloadAnswers = questions.map((q) => ({
        question_id: q.question_id,
        answer: answers[q.question_id] || '',
        time_spent_seconds: 0,
      }))
      const totalTime = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0
      const res = await quizAPI.submit(sessionId, payloadAnswers, totalTime)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not submit quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="card mb-6">
            <p className="section-title mb-4">Dynamic Quiz System</p>
            <h1 style={{ marginBottom: 12 }}>Skill-Based Quiz</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              Generates aptitude, technical MCQ, coding, and HR questions.
            </p>

            {error && <div className="error">{error}</div>}

            <div className="grid-2">
              <div className="form-group">
                <label>Role</label>
                <input value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input value={skills} onChange={(e) => setSkills(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Number of Questions</label>
              <input type="number" min={4} max={30} value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value) || 8)} />
            </div>

            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || !userId}>
              {loading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>

          {questions.length > 0 && (
            <div className="card mb-6">
              <h2 style={{ marginBottom: 16 }}>Answer Questions</h2>
              {questions.map((q, idx) => (
                <div key={q.question_id} className="card" style={{ marginBottom: 12, background: 'var(--surface-2)' }}>
                  <p style={{ marginBottom: 8 }}><strong>Q{idx + 1}.</strong> {q.question_text}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 8 }}>
                    Type: {q.question_type}
                  </p>

                  {q.options?.length > 0 ? (
                    <select
                      value={answers[q.question_id] || ''}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.question_id]: e.target.value }))}
                    >
                      <option value="">Select an option</option>
                      {q.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <textarea
                      rows={3}
                      placeholder="Write your answer"
                      value={answers[q.question_id] || ''}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.question_id]: e.target.value }))}
                    />
                  )}
                </div>
              ))}

              <button className="btn btn-success" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          )}

          {result && (
            <div className="card">
              <h2 style={{ marginBottom: 12 }}>Quiz Result</h2>
              <p>Score: <strong>{result.score}%</strong></p>
              <p>Accuracy: <strong>{result.accuracy}%</strong></p>
              <p>Correct: <strong>{result.correct_answers} / {result.total_questions}</strong></p>
              {result.weak_areas?.length > 0 && <p>Weak Areas: {result.weak_areas.join(', ')}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
