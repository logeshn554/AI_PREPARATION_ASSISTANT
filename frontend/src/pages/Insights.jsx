import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { analyticsAPI } from '../services/api'

export default function Insights() {
  const userId = localStorage.getItem('userId')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await analyticsAPI.getUserAnalytics(userId)
        setData(res.data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    if (userId) load()
  }, [userId])

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="card mb-6">
            <p className="section-title mb-4">Analytics</p>
            <h1 style={{ marginBottom: 12 }}>Performance Insights</h1>
          </div>

          {loading && <div className="card">Loading analytics...</div>}
          {error && <div className="error">{error}</div>}

          {data && (
            <>
              <div className="grid-3 mb-6">
                <div className="stat-card orb-blue">
                  <div className="stat-value blue">{data.total_attempts}</div>
                  <div className="stat-label">Total Attempts</div>
                </div>
                <div className="stat-card orb-green">
                  <div className="stat-value green">{data.overall_accuracy}%</div>
                  <div className="stat-label">Overall Accuracy</div>
                </div>
                <div className="stat-card orb-violet">
                  <div className="stat-value violet">{data.average_time_per_question}s</div>
                  <div className="stat-label">Avg Time / Question</div>
                </div>
              </div>

              <div className="card mb-6">
                <h2 style={{ marginBottom: 8 }}>Weak Areas</h2>
                <p>{data.weak_areas?.length ? data.weak_areas.join(', ') : 'No weak areas detected yet.'}</p>
              </div>

              <div className="card">
                <h2 style={{ marginBottom: 10 }}>Recent Progress Scores</h2>
                {data.progress_scores?.length ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Source</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.progress_scores.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.source}</td>
                          <td>{row.score}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p>No score history yet.</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
