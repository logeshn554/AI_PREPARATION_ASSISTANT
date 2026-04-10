import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const features = [
  { icon: '📄', title: 'Resume Analysis',   desc: 'AI-powered parsing extracts your skills and experience in seconds' },
  { icon: '🧠', title: 'AI Question Gen',   desc: 'Domain-specific questions tailored precisely to your target role' },
  { icon: '💬', title: 'Mock Interviews',   desc: 'Practice in real-time against hyper-realistic interview scenarios' },
  { icon: '📊', title: 'Deep Insights',     desc: 'Comprehensive performance analytics and actionable feedback' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="hero-container">

          {/* Atmospheric orbs */}
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />

          {/* Subtle grid */}
          <div className="hero-grid" />

          <div className="hero-content">

            <div className="hero-eyebrow">
              <span className="dot" />
              AI-Powered Interview Preparation
            </div>

            <h1 className="hero-title">
              Land Your Dream<br />
              <span className="highlight">Tech Role</span>
            </h1>

            <p className="hero-subtitle">
              Upload your resume, pick your target role, and face AI-generated
              questions — get instant feedback that turns weaknesses into wins.
            </p>

            <div className="cta-container">
              <button className="btn btn-glow" onClick={() => navigate('/resume-upload')}>
                Get Started Free →
              </button>
              <button
                className="btn btn-outline"
                style={{ padding: '15px 32px', fontSize: '1rem', borderRadius: 'var(--r-full)' }}
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
              </button>
            </div>

            {/* Social proof stats */}
            <div className="hero-stats">
              {[
                { value: '10k+', label: 'Interviews Run' },
                null,
                { value: '94%', label: 'Success Rate' },
                null,
                { value: '500+', label: 'Roles Covered' },
              ].map((item, i) =>
                item === null ? (
                  <div key={i} className="hero-stat-sep" />
                ) : (
                  <div key={i} className="hero-stat">
                    <span className="hero-stat-value">{item.value}</span>
                    <span className="hero-stat-label">{item.label}</span>
                  </div>
                )
              )}
            </div>

            {/* Feature cards */}
            <div className="features-grid">
              {features.map((f) => (
                <div className="glass-card" key={f.title}>
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
