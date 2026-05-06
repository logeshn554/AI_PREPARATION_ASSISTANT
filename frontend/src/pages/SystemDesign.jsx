import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const STAGES = [
  { id: 'requirements', title: 'Requirements Clarification', icon: '📋', desc: 'Ask questions to understand scope, users, and constraints before designing.' },
  { id: 'estimation', title: 'Scale Estimation', icon: '📊', desc: 'Estimate QPS, storage, bandwidth, and server count.' },
  { id: 'hld', title: 'High-Level Design', icon: '🗺', desc: 'Sketch the major components and data flow.' },
  { id: 'deep_dive', title: 'Deep Dive', icon: '🔍', desc: 'Detail critical components: DB schema, APIs, algorithms.' },
  { id: 'bottlenecks', title: 'Bottlenecks & Trade-offs', icon: '⚖️', desc: 'Identify failure points and discuss scaling / caching / CDN.' },
]

const TOPICS = [
  'Design Twitter', 'Design YouTube', 'Design URL Shortener', 'Design WhatsApp',
  'Design Uber', 'Design Netflix', 'Design Google Drive', 'Design Rate Limiter',
]

export default function SystemDesign() {
  const navigate = useNavigate()
  const [selectedTopic, setSelectedTopic] = useState('')
  const [activeStage, setActiveStage]     = useState(0)
  const [notes, setNotes]                 = useState({})
  const [started, setStarted]             = useState(false)

  const updateNote = (stageId, text) => setNotes(n => ({ ...n, [stageId]: text }))

  if (!started) return (
    <div className="app-shell"><Navbar />
      <div className="page-wrapper"><div className="container-sm">
        <div style={{ marginBottom: 'var(--s8)' }}>
          <p className="section-title">Practice</p>
          <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', letterSpacing: '-0.04em' }}>System Design Interview</h1>
          <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.65 }}>
            Practice structured system design using the 5-stage framework used by top tech companies.
          </p>
        </div>
        <div className="card mb-6">
          <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>Choose a Topic</p>
          <div className="role-grid">
            {TOPICS.map(t => (
              <button key={t} className={`role-chip ${selectedTopic === t ? 'selected' : ''}`} onClick={() => setSelectedTopic(t)}>{t}</button>
            ))}
          </div>
        </div>
        <button className="btn btn-cta" disabled={!selectedTopic} onClick={() => setStarted(true)}>🚀 Start Design Session →</button>
      </div></div>
    </div>
  )

  const stage = STAGES[activeStage]
  return (
    <div className="app-shell"><Navbar />
      <div className="page-wrapper"><div className="container-sm">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', marginBottom: 'var(--s6)' }}>
          <button className="btn btn-secondary" style={{ padding: '8px 14px' }} onClick={() => setStarted(false)}>← Back</button>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{selectedTopic}</h2>
        </div>

        {/* Stage nav */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--s6)' }}>
          {STAGES.map((s, i) => (
            <button key={s.id} onClick={() => setActiveStage(i)}
              style={{ padding: '8px 14px', borderRadius: 'var(--r-full)', border: `1px solid ${i === activeStage ? 'var(--blue)' : 'var(--border-default)'}`, background: i === activeStage ? 'var(--blue-subtle)' : 'transparent', color: i === activeStage ? 'var(--blue-bright)' : 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        <div className="card mb-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', marginBottom: 'var(--s4)' }}>
            <span style={{ fontSize: '1.5rem' }}>{stage.icon}</span>
            <div>
              <p style={{ fontWeight: 700, margin: 0 }}>{stage.title}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{stage.desc}</p>
            </div>
          </div>
          <textarea
            value={notes[stage.id] || ''}
            onChange={e => updateNote(stage.id, e.target.value)}
            placeholder={`Write your ${stage.title.toLowerCase()} notes here...`}
            style={{ minHeight: 220, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--s4)', flexWrap: 'wrap' }}>
          {activeStage > 0 && <button className="btn btn-secondary" onClick={() => setActiveStage(p => p - 1)}>← Previous</button>}
          {activeStage < STAGES.length - 1 && <button className="btn btn-primary" onClick={() => setActiveStage(p => p + 1)}>Next Stage →</button>}
          {activeStage === STAGES.length - 1 && <button className="btn btn-cta" onClick={() => navigate('/dashboard')}>✅ Complete Design</button>}
        </div>
      </div></div>
    </div>
  )
}
