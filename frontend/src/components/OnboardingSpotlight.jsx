import React, { useState, useEffect } from 'react'

const STEPS = [
  { selector: '#navbar-profile-btn', title: 'Your Profile', desc: 'Access your profile, stats, and settings from here anytime.' },
  { selector: null, title: 'Welcome to InterviewIQ! 🚀', desc: 'This is your dashboard — your command center for interview prep. Let\'s take a quick tour.' },
]

export default function OnboardingSpotlight({ onComplete }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem('onboarding_done')
    if (!done) {
      setTimeout(() => setVisible(true), 800)
    }
  }, [])

  if (!visible) return null

  const current = STEPS[step]

  const finish = () => {
    localStorage.setItem('onboarding_done', '1')
    setVisible(false)
    onComplete?.()
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else finish()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, z: 9000,
      background: 'rgba(0,0,0,0.70)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9000,
      animation: 'fadeUp 0.3s var(--ease-cinema)',
    }}>
      <div style={{
        background: 'var(--card, #111827)',
        border: '1px solid rgba(96,165,250,0.25)',
        borderRadius: 'var(--r-xl)',
        padding: 'var(--s8)',
        maxWidth: 420, width: '90%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(96,165,250,0.12)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--s4)' }}>
          {step === 0 ? '👋' : '💡'}
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>{current.title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 'var(--s6)' }}>
          {current.desc}
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 'var(--s6)' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 3,
              background: i === step ? 'var(--blue)' : 'var(--surface-3)',
              transition: 'width 0.3s',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'center' }}>
          <button className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={finish}>Skip</button>
          <button className="btn btn-primary" style={{ padding: '10px 28px' }} onClick={next}>
            {step < STEPS.length - 1 ? 'Next →' : '✓ Got it!'}
          </button>
        </div>
      </div>
    </div>
  )
}
