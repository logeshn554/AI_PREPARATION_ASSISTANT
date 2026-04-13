import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { challengeAPI } from '../services/api'

export default function DailyChallenge() {
  const userId = localStorage.getItem('userId')
  const [challenge, setChallenge] = useState(null)
  const [answer, setAnswer] = useState('')
  const [submission, setSubmission] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [challengeRes, leaderboardRes] = await Promise.all([
        challengeAPI.today(),
        challengeAPI.leaderboard(10),
      ])
      setChallenge(challengeRes.data)
      setLeaderboard(leaderboardRes.data.rows || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load daily challenge')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const submit = async () => {
    if (!challenge || !answer.trim()) return
    try {
      setLoading(true)
      const res = await challengeAPI.submit(userId, challenge.id, answer)
      setSubmission(res.data)
      const board = await challengeAPI.leaderboard(10)
      setLeaderboard(board.data.rows || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit challenge')
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
            <p className="section-title mb-4">Daily Challenge</p>
            <h1 style={{ marginBottom: 12 }}>Daily Skill Challenge + Leaderboard</h1>
          </div>

          {loading && <div className="card mb-6">Loading...</div>}
          {error && <div className="error">{error}</div>}

          {challenge && (
            <div className="card mb-6">
              <h2 style={{ marginBottom: 6 }}>{challenge.title}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>
                {challenge.challenge_date} - {challenge.question_type} - {challenge.difficulty}
              </p>
              <p style={{ marginBottom: 12 }}>{challenge.question_text}</p>
              <textarea
                rows={5}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your challenge answer"
              />
              <button className="btn btn-primary" onClick={submit} disabled={loading || !userId}>
                Submit Challenge
              </button>

              {submission && (
                <div className="card" style={{ marginTop: 12, background: 'var(--surface-2)' }}>
                  <h3>Submission Result</h3>
                  <p>Score: <strong>{submission.score}%</strong></p>
                  <p>Feedback: {submission.feedback}</p>
                </div>
              )}
            </div>
          )}

          <div className="card">
            <h2 style={{ marginBottom: 12 }}>Leaderboard</h2>
            {leaderboard.length === 0 ? (
              <p>No rankings yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row, idx) => (
                    <tr key={row.user_id}>
                      <td>{idx + 1}</td>
                      <td>{row.name}</td>
                      <td>{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
