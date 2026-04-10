import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

/* Animated SVG score ring */
function ScoreRing({ score }) {
  const r   = 54
  const circ = 2 * Math.PI * r
  const pct  = Math.min(Math.max(score, 0), 100)
  const offset = circ - (pct / 100) * circ
  const cls   = pct >= 80 ? 'high' : pct >= 60 ? 'medium' : 'low'
  const color = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div className="score-ring-wrap">
      <svg className="score-ring-svg" viewBox="0 0 120 120">
        <circle className="score-ring-bg"   cx="60" cy="60" r={r} />
        <circle
          className={`score-ring-fill ${cls}`}
          cx="60" cy="60" r={r}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="score-ring-text">
        <span className="score-ring-number" style={{ color }}>
          {pct.toFixed(0)}%
        </span>
        <span className="score-ring-label">Score</span>
      </div>
    </div>
  )
}

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const { questions = [], evaluations = [] } = location.state || {}
  const userId = localStorage.getItem('userId')

  const [expandedIndex, setExpandedIndex] = useState(null)

  useEffect(() => {
    if (!userId || evaluations.length === 0) navigate('/resume-upload')
  }, [])

  const avg = evaluations.length > 0
    ? evaluations.reduce((s, e) => s + (e.score || 0), 0) / evaluations.length
    : 0

  const getScoreClass = (s) => s >= 80 ? 'high' : s >= 60 ? 'medium' : 'low'
  const getScoreLabel = (s) => s >= 80 ? 'Excellent' : s >= 60 ? 'Good'      : 'Needs Work'

  const excellent = evaluations.filter(e => (e.score || 0) >= 80).length
  const needsWork = evaluations.filter(e => (e.score || 0) <  60).length

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container">

          {/* ── Hero summary ── */}
          <div className="text-center" style={{ padding: 'var(--s12) 0 var(--s10)' }}>
            <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>Session Complete 🎬</p>
            <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.5rem)', letterSpacing: '-0.04em', marginBottom: 'var(--s8)' }}>
              Your Interview Results
            </h1>

            {/* Score ring */}
            <ScoreRing score={avg} />

            <div style={{ marginTop: 'var(--s3)' }}>
              <span className={`score-badge ${getScoreClass(avg)}`} style={{ fontSize: '0.88rem', padding: '6px 20px' }}>
                {getScoreLabel(avg)}
              </span>
            </div>

            {/* Mini stat row */}
            <div
              className="card"
              style={{
                display: 'inline-flex', gap: 'var(--s8)', padding: 'var(--s5) var(--s8)',
                marginTop: 'var(--s8)', flexWrap: 'wrap', justifyContent: 'center',
              }}
            >
              {[
                { label: 'Questions',  value: questions.length,     color: 'var(--text-primary)' },
                { label: 'Excellent',  value: excellent,             color: 'var(--success)'      },
                { label: 'Needs Work', value: needsWork,             color: 'var(--danger)'       },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div style={{ width: 1, background: 'var(--border-default)', alignSelf: 'stretch' }} />}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.04em', color: s.color }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--text-muted)' }}>
                      {s.label}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ── Breakdown ── */}
          <p className="section-title mb-4">Detailed Breakdown</p>

          {questions.map((q, idx) => {
            const ev        = evaluations[idx] || {}
            const isOpen    = expandedIndex === idx
            const scoreClass = getScoreClass(ev.score || 0)

            return (
              <div
                key={idx}
                className="result-item"
                onClick={() => setExpandedIndex(isOpen ? null : idx)}
              >
                <div className="result-item-header">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 4 }}>
                      Q{idx + 1} &middot; {q.question_type}
                    </div>
                    <div style={{ fontSize: '0.93rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.5 }}>
                      {q.question_text}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', flexShrink: 0 }}>
                    <span className={`score-badge ${scoreClass}`}>{ev.score || 0}%</span>
                    <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                      ▾
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div className="result-item-body">
                    <div className="result-section-title">Full Question</div>
                    <div className="result-section-body">{q.question_text}</div>

                    {ev.feedback && (
                      <>
                        <div className="result-section-title">AI Feedback</div>
                        <div className="result-section-body">{ev.feedback}</div>
                      </>
                    )}

                    {ev.improvement_suggestions && (
                      <>
                        <div className="result-section-title">Improvement Suggestions</div>
                        <div className="result-section-body">{ev.improvement_suggestions}</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* ── Actions ── */}
          <div className="divider" />
          <div className="flex-row mt-4" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: 'var(--s4)' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/resume-upload')}>
              New Interview
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              View Dashboard →
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
