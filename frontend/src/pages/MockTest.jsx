import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { mockTestAPI } from '../services/api'

export default function MockTest() {
  const userId = localStorage.getItem('userId')
  const [company, setCompany] = useState('Google')
  const [role, setRole] = useState('Software Engineer')
  const [skills, setSkills] = useState('python,system design,sql')
  const [duration, setDuration] = useState(45)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [testId, setTestId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [startedAt, setStartedAt] = useState(null)

  const createTest = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean)
      const res = await mockTestAPI.create(userId, company, role, skillList, 10, duration)
      setTestId(res.data.test_id)
      setQuestions(res.data.questions || [])
      setAnswers({})
      setStartedAt(Date.now())
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create mock test')
    } finally {
      setLoading(false)
    }
  }

  const submitTest = async () => {
    if (!testId) return
    setLoading(true)
    setError('')
    try {
      const payloadAnswers = questions.map((q) => ({
        question_id: q.question_id,
        answer: answers[q.question_id] || '',
        time_spent_seconds: 0,
      }))
      const totalTime = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0
      const res = await mockTestAPI.submit(testId, payloadAnswers, totalTime)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not submit mock test')
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
            <p className="section-title mb-4">Mock Test Engine</p>
            <h1 style={{ marginBottom: 12 }}>Timed Company Mock Test</h1>
            {error && <div className="error">{error}</div>}

            <div className="grid-2">
              <div className="form-group">
                <label>Company</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Skills</label>
                <input value={skills} onChange={(e) => setSkills(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input type="number" min={10} max={120} value={duration} onChange={(e) => setDuration(Number(e.target.value) || 45)} />
              </div>
            </div>

            <button className="btn btn-primary" onClick={createTest} disabled={loading || !userId}>
              {loading ? 'Preparing...' : 'Create Mock Test'}
            </button>
          </div>

          {questions.length > 0 && (
            <div className="card mb-6">
              <h2 style={{ marginBottom: 16 }}>Mock Test Questions</h2>
              {questions.map((q, idx) => (
                <div key={q.question_id} className="card" style={{ marginBottom: 12, background: 'var(--surface-2)' }}>
                  <p><strong>Q{idx + 1}.</strong> {q.question_text}</p>
                  {q.options?.length > 0 ? (
                    <select
                      value={answers[q.question_id] || ''}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.question_id]: e.target.value }))}
                    >
                      <option value="">Select answer</option>
                      {q.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <textarea
                      rows={3}
                      value={answers[q.question_id] || ''}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.question_id]: e.target.value }))}
                    />
                  )}
                </div>
              ))}

              <button className="btn btn-success" onClick={submitTest} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Mock Test'}
              </button>
            </div>
          )}

          {result && (
            <div className="card">
              <h2 style={{ marginBottom: 12 }}>Mock Test Result</h2>
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
