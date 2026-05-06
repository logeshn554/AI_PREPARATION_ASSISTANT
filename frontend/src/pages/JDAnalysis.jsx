import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { jdAnalysisAPI } from '../services/api'

export default function JDAnalysis() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')
  const [jd, setJd] = useState('')
  const [role, setRole] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!jd.trim()) { setError('Please paste a job description'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await jdAnalysisAPI.analyze(jd, role, resumeText, [], userId)
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally { setLoading(false) }
  }

  const score = result?.match_score ?? result?.overall_score ?? null
  const missing = result?.missing_skills || result?.gaps || []
  const matched = result?.matched_skills || result?.strengths || []
  const recommendations = result?.recommendations || []

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container-sm">
          <div style={{ marginBottom: 'var(--s8)' }}>
            <p className="section-title">AI Tool</p>
            <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', letterSpacing: '-0.04em' }}>JD Gap Analyzer</h1>
            <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.65 }}>
              Paste any job description and get an instant match analysis against your profile.
            </p>
          </div>

          {error && <div className="error">⚠ {error}</div>}

          <div className="card mb-6">
            <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>Job Description</p>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder="Paste the full job description here..."
              style={{ minHeight: 200, resize: 'vertical' }}
            />
          </div>

          <div className="card mb-6">
            <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>Your Resume (optional)</p>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your resume text for a personalised match score..."
              style={{ minHeight: 120, resize: 'vertical' }}
            />
            <div className="form-group" style={{ marginTop: 'var(--s4)', marginBottom: 0 }}>
              <label>Target Role (optional)</label>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Backend Engineer" />
            </div>
          </div>

          <button className="btn btn-cta" onClick={handleAnalyze} disabled={loading} style={{ marginBottom: 'var(--s8)' }}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analysing…</> : '🔍 Analyse Match →'}
          </button>

          {result && (
            <>
              {score !== null && (
                <div className="card mb-6" style={{ textAlign: 'center', background: 'linear-gradient(135deg,rgba(37,99,235,0.08),rgba(124,58,237,0.06))', border: '1px solid rgba(96,165,250,0.18)' }}>
                  <p className="section-title" style={{ marginBottom: 'var(--s2)' }}>Match Score</p>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.05em', color: score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--gold-bright)' : 'var(--danger)' }}>
                    {Math.round(score)}%
                  </div>
                </div>
              )}

              {matched.length > 0 && (
                <div className="card mb-6">
                  <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>✅ Matched Skills</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {matched.map((s, i) => <span key={i} className="tag tag-green">{s}</span>)}
                  </div>
                </div>
              )}

              {missing.length > 0 && (
                <div className="card mb-6">
                  <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>⚠ Skill Gaps</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {missing.map((s, i) => <span key={i} className="tag tag-gold">{s}</span>)}
                  </div>
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="card mb-6">
                  <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>💡 Recommendations</p>
                  <ul style={{ paddingLeft: 'var(--s6)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                    {recommendations.map((r, i) => <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>{r}</li>)}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--s4)', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => navigate('/role-selection')}>🚀 Start Targeted Interview</button>
                <button className="btn btn-secondary" onClick={() => { setResult(null); setJd('') }}>Analyse Another JD</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
