import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { personalizationAPI } from '../services/api'

export default function FocusMode() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    personalizationAPI.getFocusMode(userId)
      .then(r => setData(r.data))
      .catch(() => setData({ weak_areas: [], recommendations: [], priority_topics: [] }))
      .finally(() => setLoading(false))
  }, [userId])

  const weak   = data?.weak_areas || data?.weaknesses || []
  const recs   = data?.recommendations || []
  const topics = data?.priority_topics || data?.focus_areas || []

  if (loading) return (
    <div className="app-shell"><Navbar />
      <div className="page-wrapper"><div className="loading-screen"><div className="spinner" /></div></div>
    </div>
  )

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container-sm">
          <div style={{ marginBottom: 'var(--s8)' }}>
            <p className="section-title">AI-Powered</p>
            <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', letterSpacing: '-0.04em' }}>Focus Mode</h1>
            <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.65 }}>
              Personalized practice targeting your weak areas for maximum improvement.
            </p>
          </div>

          {topics.length > 0 && (
            <div className="card mb-6">
              <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>🎯 Priority Topics</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {topics.map((t, i) => <span key={i} className="tag tag-blue">{t}</span>)}
              </div>
            </div>
          )}

          {weak.length > 0 && (
            <div className="card mb-6">
              <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>⚠ Weak Areas</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {weak.map((w, i) => <span key={i} className="tag tag-gold">{w}</span>)}
              </div>
            </div>
          )}

          {recs.length > 0 && (
            <div className="card mb-6">
              <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>💡 Recommendations</p>
              <ul style={{ paddingLeft: 'var(--s6)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                {recs.map((r, i) => <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>{typeof r === 'string' ? r : r.tip || r.text || JSON.stringify(r)}</li>)}
              </ul>
            </div>
          )}

          {weak.length === 0 && topics.length === 0 && (
            <div className="empty-state mb-8">
              <div className="empty-icon">🎯</div>
              <h2>No Focus Data Yet</h2>
              <p>Complete a few interviews to unlock personalized focus recommendations.</p>
              <button className="btn btn-primary mt-6" onClick={() => navigate('/role-selection')}>Start an Interview</button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--s4)', flexWrap: 'wrap' }}>
            <button className="btn btn-cta" onClick={() => navigate('/role-selection')}>🚀 Start Focused Interview</button>
          </div>
        </div>
      </div>
    </div>
  )
}
