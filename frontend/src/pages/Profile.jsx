import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { authAPI, dashboardAPI } from '../services/api'

export default function Profile() {
  const navigate = useNavigate()
  const userId   = localStorage.getItem('userId')
  const userName = localStorage.getItem('userName') || 'User'

  const [user, setUser]           = useState(null)
  const [stats, setStats]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    if (!userId) { navigate('/auth'); return }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const [meRes, dashRes] = await Promise.allSettled([
        authAPI.me(),
        dashboardAPI.getDashboard(userId),
      ])
      if (meRes.status === 'fulfilled')   setUser(meRes.value.data)
      if (dashRes.status === 'fulfilled') setStats(dashRes.value.data.stats)
    } catch (_) {
      // silently fall back to localStorage data
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    navigate('/auth')
  }

  /* helpers */
  const initials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const authBadge = user?.auth_provider === 'google'
    ? { icon: '🔵', label: 'Google Account' }
    : { icon: '📧', label: 'Email Account' }

  const avg    = stats?.average_score   ?? 0
  const total  = stats?.total_interviews ?? 0
  const resumes = stats?.total_resumes   ?? 0
  const ats    = stats?.latest_ats_score ?? null

  const scoreColor =
    avg >= 80 ? 'var(--success)'
    : avg >= 60 ? 'var(--gold-bright)'
    : 'var(--blue-bright)'

  /* ── loading ── */
  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page-wrapper">
          <div className="loading-screen">
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>
              Loading profile…
            </p>
          </div>
        </div>
      </div>
    )
  }

  /* ── main ── */
  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container-sm">

          {/* ── Page title ── */}
          <p className="section-title">My Account</p>
          <h1 style={{ marginBottom: 'var(--s8)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
            Profile
          </h1>

          {/* ── Hero card ── */}
          <div
            className="card mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(167,139,250,0.06) 100%)',
              border: '1px solid rgba(96,165,250,0.18)',
              padding: 'var(--s8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s6)', flexWrap: 'wrap' }}>

              {/* Avatar */}
              <div
                id="profile-avatar"
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--blue-deep), var(--violet))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#fff',
                  flexShrink: 0,
                  boxShadow: '0 0 30px rgba(96,165,250,0.35)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.03em',
                }}
              >
                {initials(user?.name || userName)}
              </div>

              {/* Name / email */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 4, wordBreak: 'break-word' }}>
                  {user?.name || userName}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 8 }}>
                  {user?.email || '—'}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="tag tag-blue">{authBadge.icon} {authBadge.label}</span>
                  <span className="tag">🗓 Joined {joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stat tiles ── */}
          <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>Performance Summary</p>
          <div className="grid-3 mb-6">

            <div className="stat-card orb-blue">
              <div className="stat-icon">🎯</div>
              <div className="stat-value blue">{total}</div>
              <div className="stat-label">Interviews</div>
            </div>

            <div className="stat-card orb-violet">
              <div className="stat-icon">📄</div>
              <div className="stat-value" style={{ color: 'var(--violet)' }}>{resumes}</div>
              <div className="stat-label">Resumes</div>
            </div>

            <div className={`stat-card ${avg >= 80 ? 'orb-green' : avg >= 60 ? 'orb-gold' : 'orb-blue'}`}>
              <div className="stat-icon">📊</div>
              <div className="stat-value" style={{ color: scoreColor }}>{avg}%</div>
              <div className="stat-label">Avg Score</div>
            </div>
          </div>

          {/* ATS score strip */}
          {ats !== null && (
            <div
              className="card mb-6"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
            >
              <div>
                <p className="section-title" style={{ marginBottom: 4 }}>Latest ATS Score</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Resume screening performance
                </p>
              </div>
              <span className={`score-badge ${ats >= 75 ? 'high' : ats >= 60 ? 'medium' : 'low'}`}
                style={{ fontSize: '1rem', padding: '6px 18px' }}>
                {ats}%
              </span>
            </div>
          )}

          {/* ── Account Details ── */}
          <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>Account Details</p>
          <div className="card mb-6">
            {[
              { label: 'Full Name',      value: user?.name || userName,        icon: '👤' },
              { label: 'Email Address',  value: user?.email || '—',            icon: '✉️' },
              { label: 'Auth Provider',  value: authBadge.label,               icon: '🔐' },
              { label: 'Account ID',     value: `#${user?.id ?? userId}`,      icon: '🪪' },
              { label: 'Member Since',   value: joinDate,                       icon: '📅' },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--s4) 0',
                  borderBottom: '1px solid var(--border-dark)',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                  <span style={{
                    fontSize: '0.78rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.09em',
                    color: 'var(--text-muted)',
                  }}>
                    {label}
                  </span>
                </div>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 500 }}>
                  {value}
                </span>
              </div>
            ))}
            {/* Remove bottom border on last item */}
            <style>{`.profile-detail-last { border-bottom: none !important; }`}</style>
          </div>

          {/* ── Quick links ── */}
          <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--s3)', marginBottom: 'var(--s8)' }}>
            {[
              { label: '📄 Upload Resume',  path: '/resume-upload' },
              { label: '🚀 Start Interview', path: '/role-selection' },
              { label: '📊 View Insights',   path: '/insights' },
              { label: '⚙️ Settings',        path: '/settings' },
            ].map(({ label, path }) => (
              <button
                key={path}
                id={`profile-action-${path.replace('/', '')}`}
                className="btn btn-secondary"
                onClick={() => navigate(path)}
                style={{ justifyContent: 'flex-start', fontSize: '0.88rem' }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Logout section ── */}
          <div
            className="card"
            style={{
              border: '1px solid rgba(248,113,113,0.12)',
              background: 'rgba(248,113,113,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>Sign out</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  You'll need to log in again to access your account.
                </p>
              </div>
              {showLogout ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    id="profile-logout-cancel"
                    className="btn btn-secondary"
                    onClick={() => setShowLogout(false)}
                    style={{ fontSize: '0.85rem', padding: '10px 18px' }}
                  >
                    Cancel
                  </button>
                  <button
                    id="profile-logout-confirm"
                    className="btn btn-danger"
                    onClick={handleLogout}
                    style={{ fontSize: '0.85rem', padding: '10px 18px' }}
                  >
                    Yes, Log Out
                  </button>
                </div>
              ) : (
                <button
                  id="profile-logout-btn"
                  className="btn btn-danger"
                  onClick={() => setShowLogout(true)}
                  style={{ fontSize: '0.88rem', padding: '10px 22px' }}
                >
                  🚪 Log Out
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
