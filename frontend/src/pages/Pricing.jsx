import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const PLANS = [
  {
    name: 'Free', price: '₹0', period: 'forever',
    color: 'var(--blue)',
    features: ['5 AI Interviews / month', 'Resume Analysis', 'Basic Insights', 'JD Analyzer (3/month)', 'Community Access'],
    cta: 'Get Started Free', ctaClass: 'btn btn-outline',
  },
  {
    name: 'Pro', price: '₹499', period: '/month',
    color: 'var(--violet)',
    badge: 'Most Popular',
    features: ['Unlimited AI Interviews', 'Voice Interview Mode', 'System Design Practice', 'Deep Performance Analytics', 'AI Chat Coach (unlimited)', 'Priority Support'],
    cta: 'Start Pro Trial', ctaClass: 'btn btn-primary',
  },
  {
    name: 'Team', price: '₹1,999', period: '/month',
    color: 'var(--gold-bright)',
    features: ['Everything in Pro', 'Up to 10 team members', 'Team analytics dashboard', 'Custom interview templates', 'Dedicated onboarding', 'SLA support'],
    cta: 'Contact Sales', ctaClass: 'btn btn-secondary',
  },
]

export default function Pricing() {
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto var(--s12)' }}>
            <p className="section-title">Pricing</p>
            <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', letterSpacing: '-0.04em', marginBottom: 16 }}>Simple, Transparent Pricing</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.75 }}>Start free, upgrade when you're ready. No hidden fees.</p>
          </div>

          <div className="grid-3 mb-12" style={{ gap: 'var(--s6)', alignItems: 'start' }}>
            {PLANS.map(plan => (
              <div key={plan.name} className="card" style={{ padding: 'var(--s8)', position: 'relative', border: plan.badge ? '1px solid rgba(124,58,237,0.35)' : undefined }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,var(--blue-deep),var(--violet))', color: '#fff', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', padding: '4px 14px', borderRadius: 'var(--r-full)', whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ marginBottom: 'var(--s6)' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: plan.color, marginBottom: 8 }}>{plan.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.05em' }}>{plan.price}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{plan.period}</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--s3)', marginBottom: 'var(--s8)', padding: 0 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 'var(--s2)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button className={plan.ctaClass} style={{ width: '100%' }} onClick={() => navigate('/auth')}>{plan.cta}</button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            All plans include 14-day free trial • Cancel anytime • Secure payment via Razorpay
          </div>
        </div>
      </div>
    </div>
  )
}
