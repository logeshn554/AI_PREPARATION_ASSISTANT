import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardAPI } from '../services/api'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const userId   = localStorage.getItem('userId')
  const userName = localStorage.getItem('userName') || 'Guest'
  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!userId) { navigate('/'); return }
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await dashboardAPI.getDashboard(userId)
      setDashboardData(res.data.stats)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getScoreClass = (score) => {
    if (score >= 80) return 'high'
    if (score >= 60) return 'medium'
    return 'low'
  }

  const avg   = dashboardData?.average_score   || 0
  const total = dashboardData?.total_interviews || 0
  const resumes = dashboardData?.total_resumes  || 0
  const atsScore = dashboardData?.latest_ats_score

  /* ---------- loading ---------- */
  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page-wrapper">
          <div className="loading-screen">
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>
              Loading your dashboard…
            </p>
          </div>
        </div>
      </div>
    )
  }

  /* ---------- main ---------- */
  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container">

          {/* ── Cinematic header ── */}
          <div className="dash-header">
            <p className="section-title">Dashboard</p>
            <div className="dash-greeting">
              Welcome back,&nbsp;
              <span className="highlight">{userName}</span>&nbsp;👋
            </div>
            <p className="dash-subline">
              Here's your complete interview preparation overview
            </p>
            <div className="flex-row mt-6" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/resume-upload')}>
                📄 Upload Resume
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/role-selection')}>
                🚀 Start Interview
              </button>
              <button
                className="btn"
                style={{ background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontSize: '0.82rem' }}
                onClick={fetchDashboardData}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {error && <div className="error">⚠ {error}</div>}

          {/* ── Stat cards ── */}
          <div className="section-title" style={{ marginBottom: 'var(--s5)' }}>Performance Overview</div>
          <div className="grid-3 mb-10">
            <div className="stat-card orb-blue">
              <div className="stat-icon">🎯</div>
              <div className="stat-value blue">{total}</div>
              <div className="stat-label">Total Interviews</div>
            </div>

            <div className="stat-card orb-violet">
              <div className="stat-icon">📄</div>
              <div className="stat-value" style={{ color: 'var(--violet)' }}>{resumes}</div>
              <div className="stat-label">Resumes Uploaded</div>
            </div>

            <div className={`stat-card ${avg >= 80 ? 'orb-green' : avg >= 60 ? 'orb-gold' : 'orb-blue'}`}>
              <div className="stat-icon">📊</div>
              <div className={`stat-value ${avg >= 80 ? 'green' : avg >= 60 ? 'gold' : 'blue'}`}>
                {avg}%
              </div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>

          {(atsScore !== null && atsScore !== undefined) && (
            <div className="card mb-6">
              <div className="flex-between">
                <div>
                  <div className="section-title" style={{ marginBottom: '4px' }}>ATS Resume Score</div>
                  <h2 style={{ fontSize: '1.05rem', marginBottom: 0 }}>Latest Resume Screening Score</h2>
                </div>
                <span className={`score-badge ${atsScore >= 75 ? 'high' : atsScore >= 60 ? 'medium' : 'low'}`}>
                  {atsScore}%
                </span>
              </div>
            </div>
          )}

          {dashboardData?.extracted_skills?.length > 0 && (
            <div className="card mb-6">
              <div className="section-title" style={{ marginBottom: '8px' }}>Extracted Resume Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {dashboardData.extracted_skills.map((skill, idx) => (
                  <span key={idx} className="tag tag-blue">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {dashboardData?.skill_gaps?.length > 0 && (
            <div className="card mb-6">
              <div className="section-title" style={{ marginBottom: '8px' }}>Skill Gaps</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {dashboardData.skill_gaps.map((gap, idx) => (
                  <span key={idx} className="tag tag-gold">{gap}</span>
                ))}
              </div>
            </div>
          )}

          {dashboardData?.recommended_learning_paths?.length > 0 && (
            <div className="card mb-6">
              <div className="section-title" style={{ marginBottom: '8px' }}>Recommended Learning Paths</div>
              <div className="grid-2">
                {dashboardData.recommended_learning_paths.map((item, idx) => (
                  <div key={idx} className="glass-card">
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '6px' }}>{item.skill}</h3>
                    <p style={{ fontSize: '0.84rem' }}>{item.path}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dashboardData?.suggested_roles?.length > 0 && (
            <div className="card mb-6">
              <div className="section-title" style={{ marginBottom: '8px' }}>Role Suggestions</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Fit Score</th>
                    <th>Matched Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.suggested_roles.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.role}</td>
                      <td>{row.fit_score}%</td>
                      <td>{(row.matched_skills || []).join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Empty / onboarding state ── */}
          {total === 0 && !error && (
            <div className="empty-state mb-10">
              <div className="empty-icon">🚀</div>
              <h2>You haven't started yet</h2>
              <p>
                Complete your first mock interview to unlock performance analytics,
                score history, and personalised improvement tips.
              </p>

              <div className="steps-list">
                {[
                  { n: '1', text: 'Upload your resume' },
                  { n: '2', text: 'Choose a job role' },
                  { n: '3', text: 'Complete the interview' },
                  { n: '4', text: 'Review your insights' },
                ].map((s) => (
                  <div className="step-item" key={s.n}>
                    <div className="step-num">{s.n}</div>
                    <div className="step-text">{s.text}</div>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" onClick={() => navigate('/resume-upload')}>
                Upload Resume →
              </button>
            </div>
          )}

          {/* ── Weak areas ── */}
          {dashboardData?.weak_areas?.length > 0 && (
            <div className="card mb-6">
              <div className="flex-between mb-6">
                <div>
                  <div className="section-title" style={{ marginBottom: '4px' }}>Focus Areas</div>
                  <h2 style={{ fontSize: '1.05rem', marginBottom: 0 }}>Topics Needing Improvement</h2>
                </div>
                <span className="tag tag-gold">⚠ Attention needed</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {dashboardData.weak_areas.map((area, idx) => (
                  <span key={idx} className="tag tag-gold">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Recent performance table ── */}
          {dashboardData?.recent_scores?.length > 0 && (
            <div className="card">
              <div className="section-title" style={{ marginBottom: '4px' }}>Activity</div>
              <h2 style={{ fontSize: '1.05rem', marginBottom: 'var(--s6)' }}>Recent Scores</h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Score</th>
                      <th>Rating</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recent_scores.map((s, idx) => (
                      <tr key={idx}>
                        <td>Question #{s.question_id}</td>
                        <td>
                          <span className={`score-badge ${getScoreClass(s.score)}`}>
                            {s.score}%
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {s.score >= 80 ? '🟢 Excellent' : s.score >= 60 ? '🟡 Good' : '🔴 Needs Work'}
                          </span>
                        </td>
                        <td>
                          {new Date(s.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Quick actions (always visible) ── */}
          <div className="divider" />
          <div className="section-title mb-4">Quick Actions</div>
          <div className="grid-2">
            <div
              className="glass-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/resume-upload')}
            >
              <div style={{ fontSize: '2rem', marginBottom: 'var(--s3)' }}>📤</div>
              <h3 style={{ fontSize: '1rem', marginBottom: 'var(--s2)' }}>Upload a Resume</h3>
              <p style={{ fontSize: '0.845rem' }}>
                Add a new resume to analyse your skills and generate tailored interview questions.
              </p>
            </div>
            <div
              className="glass-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/role-selection')}
            >
              <div style={{ fontSize: '2rem', marginBottom: 'var(--s3)' }}>🎤</div>
              <h3 style={{ fontSize: '1rem', marginBottom: 'var(--s2)' }}>Start Mock Interview</h3>
              <p style={{ fontSize: '0.845rem' }}>
                Jump straight into a role-specific practice session with AI-generated questions.
              </p>
            </div>
            <div
              className="glass-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/quiz')}
            >
              <div style={{ fontSize: '2rem', marginBottom: 'var(--s3)' }}>🧪</div>
              <h3 style={{ fontSize: '1rem', marginBottom: 'var(--s2)' }}>Skill Quiz</h3>
              <p style={{ fontSize: '0.845rem' }}>
                Run adaptive aptitude, technical, coding, and HR quizzes based on your profile.
              </p>
            </div>
            <div
              className="glass-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/company-prep')}
            >
              <div style={{ fontSize: '2rem', marginBottom: 'var(--s3)' }}>🏢</div>
              <h3 style={{ fontSize: '1rem', marginBottom: 'var(--s2)' }}>Company Prep</h3>
              <p style={{ fontSize: '0.845rem' }}>
                Get company-specific interview process details, sample questions, and preparation tips.
              </p>
            </div>
            <div
              className="glass-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/mock-test')}
            >
              <div style={{ fontSize: '2rem', marginBottom: 'var(--s3)' }}>⏱️</div>
              <h3 style={{ fontSize: '1rem', marginBottom: 'var(--s2)' }}>Timed Mock Test</h3>
              <p style={{ fontSize: '0.845rem' }}>
                Practice under realistic time constraints with auto-evaluated mixed-question tests.
              </p>
            </div>
            <div
              className="glass-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/insights')}
            >
              <div style={{ fontSize: '2rem', marginBottom: 'var(--s3)' }}>📈</div>
              <h3 style={{ fontSize: '1rem', marginBottom: 'var(--s2)' }}>Analytics</h3>
              <p style={{ fontSize: '0.845rem' }}>
                View detailed progress trends, weak areas, and timing performance across all modules.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
