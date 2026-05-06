import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const FEATURES = [
  { icon: '📄', title: 'Resume Analysis', desc: 'AI-powered skill extraction and ATS score in seconds.', route: '/resume-upload' },
  { icon: '🧠', title: 'AI Interview', desc: 'Adaptive questions tailored to your role and skill level.', route: '/ai-interviewer' },
  { icon: '🎙', title: 'Voice Practice', desc: 'Practice speaking your answers with real-time feedback.', route: '/voice-interview' },
  { icon: '📊', title: 'JD Analyzer', desc: 'Match any job description against your profile instantly.', route: '/jd-analysis' },
  { icon: '🏗', title: 'System Design', desc: 'Structured 5-stage system design interview practice.', route: '/system-design' },
  { icon: '💬', title: 'AI Chat Coach', desc: '24/7 interview coaching and career advice from AI.', route: '/chat' },
]

export default function Community() {
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto var(--s12)' }}>
            <p className="section-title">Platform</p>
            <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', letterSpacing: '-0.04em', marginBottom: 16 }}>
              Everything You Need to Land the Job
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.75 }}>
              A complete AI-powered interview preparation ecosystem — from resume analysis to live voice practice.
            </p>
          </div>

          <div className="grid-3 mb-10" style={{ gap: 'var(--s6)' }}>
            {FEATURES.map(f => (
              <div key={f.title} className="glass-card card-hover" style={{ cursor: 'pointer', padding: 'var(--s8) var(--s6)' }} onClick={() => navigate(f.route)}>
                <div className="feature-icon">{f.icon}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.65 }}>{f.desc}</p>
                <div style={{ marginTop: 'var(--s4)', fontSize: '0.82rem', color: 'var(--blue-bright)', fontWeight: 600 }}>Get started →</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ textAlign: 'center', padding: 'var(--s10)', background: 'linear-gradient(135deg,rgba(37,99,235,0.08),rgba(124,58,237,0.06))', border: '1px solid rgba(96,165,250,0.15)' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', letterSpacing: '-0.03em', marginBottom: 12 }}>Ready to ace your next interview?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--s6)', lineHeight: 1.7 }}>Start with your resume and let AI guide you to your dream job.</p>
            <div style={{ display: 'flex', gap: 'var(--s4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-glow" onClick={() => navigate('/resume-upload')}>Upload Resume →</button>
              <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>View Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
