import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { aiInterviewerAPI } from '../services/api'

export default function AIInterviewer() {
  const userId = Number(localStorage.getItem('userId'))
  const [role, setRole] = useState('Software Engineer')
  const [skills, setSkills] = useState('python,system design,communication')
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const askQuestion = async () => {
    setLoading(true)
    setError('')
    try {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean)
      const res = await aiInterviewerAPI.chat({
        user_id: userId,
        role,
        skills: skillList,
        previous_question: currentQuestion || null,
        answer: answer || null,
      })

      setCurrentQuestion(res.data.follow_up || res.data.question)
      setHistory((prev) => [
        ...prev,
        {
          question: res.data.question,
          answer,
          feedback: res.data.feedback,
          score: res.data.score,
          followUp: res.data.follow_up,
        },
      ])
      setAnswer('')
    } catch (err) {
      setError(err.response?.data?.detail || 'AI interviewer request failed')
    } finally {
      setLoading(false)
    }
  }

  const start = async () => {
    setAnswer('')
    setCurrentQuestion('')
    await askQuestion()
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="card mb-6">
            <p className="section-title mb-4">AI Interviewer</p>
            <h1 style={{ marginBottom: 12 }}>Simulated Interview Chatbot</h1>
            {error && <div className="error">{error}</div>}

            <div className="grid-2">
              <div className="form-group">
                <label>Role</label>
                <input value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Skills</label>
                <input value={skills} onChange={(e) => setSkills(e.target.value)} />
              </div>
            </div>

            <button className="btn btn-primary" onClick={start} disabled={loading}>
              {loading ? 'Starting...' : 'Start Interview'}
            </button>
          </div>

          {currentQuestion && (
            <div className="card mb-6">
              <h2 style={{ marginBottom: 12 }}>Current Question</h2>
              <p style={{ marginBottom: 14 }}>{currentQuestion}</p>
              <textarea
                rows={5}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your response"
              />
              <button className="btn btn-success" onClick={askQuestion} disabled={loading}>
                {loading ? 'Evaluating...' : 'Submit Answer'}
              </button>
            </div>
          )}

          {history.length > 0 && (
            <div className="card">
              <h2 style={{ marginBottom: 12 }}>Conversation History</h2>
              {history.map((item, idx) => (
                <div key={idx} className="card" style={{ marginBottom: 10, background: 'var(--surface-2)' }}>
                  <p><strong>Q:</strong> {item.question}</p>
                  {item.answer && <p><strong>Your Answer:</strong> {item.answer}</p>}
                  {item.feedback && <p><strong>Feedback:</strong> {item.feedback}</p>}
                  {item.score !== null && item.score !== undefined && <p><strong>Score:</strong> {item.score}%</p>}
                  {item.followUp && <p><strong>Follow-up:</strong> {item.followUp}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
