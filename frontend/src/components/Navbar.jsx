import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const PRIMARY_LINKS = [
  { label: 'Dashboard',    path: '/dashboard' },
  { label: 'AI Chat',      path: '/chat' },
  { label: 'AI Interview', path: '/ai-interviewer' },
]

const SECONDARY_LINKS = [
  { label: 'Voice',        path: '/voice-interview' },
  { label: 'Design',       path: '/system-design' },
  { label: 'JD Analyzer',  path: '/jd-analysis' },
  { label: 'Quiz',         path: '/quiz' },
  { label: 'Challenge',    path: '/daily-challenge' },
  { label: 'Community',    path: '/community' },
  { label: 'Insights',     path: '/insights' },
  { label: 'Settings',     path: '/settings' },
]

const ALL_NAV_LINKS = [...PRIMARY_LINKS, ...SECONDARY_LINKS]

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?'
}

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const isActive  = (path) => location.pathname === path
  const isLoggedIn = Boolean(localStorage.getItem('token'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    navigate('/auth')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <div className="brand-gem"></div>
          <span>InterviewIQ</span>
        </div>

        {/* Desktop nav */}
        <div className="navbar-nav" style={{ display: 'flex' }}>
          <button
            className={`nav-pill ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            Home
          </button>

          {isLoggedIn ? (
            <>
              {/* Primary links — full weight */}
              {PRIMARY_LINKS.map(({ label, path }) => (
                <button
                  key={path}
                  className={`nav-pill ${isActive(path) ? 'active' : ''}`}
                  onClick={() => navigate(path)}
                  style={{ fontWeight: 600, fontSize: '0.875rem' }}
                >
                  {label}
                </button>
              ))}
              {/* Subtle separator */}
              <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.10)', flexShrink: 0 }} />
              {/* Secondary links — dimmed */}
              {SECONDARY_LINKS.map(({ label, path }) => (
                <button
                  key={path}
                  className={`nav-pill ${isActive(path) ? 'active' : ''}`}
                  onClick={() => navigate(path)}
                  style={{ opacity: isActive(path) ? 1 : 0.62, fontSize: '0.82rem' }}
                >
                  {label}
                </button>
              ))}
              <button className="nav-cta" onClick={() => navigate('/role-selection')}>
                Practice →
              </button>
              {/* Profile avatar button */}
              <button
                id="navbar-profile-btn"
                onClick={() => navigate('/profile')}
                title="My Profile"
                style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  background: isActive('/profile')
                    ? 'linear-gradient(135deg, var(--blue-deep), var(--violet))'
                    : 'var(--surface-2)',
                  border: isActive('/profile')
                    ? '2px solid rgba(96,165,250,0.5)'
                    : '2px solid var(--border-default)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.02em',
                  flexShrink: 0,
                  transition: 'all 180ms',
                  boxShadow: isActive('/profile') ? '0 0 20px rgba(96,165,250,0.40)' : 'none',
                  marginLeft: 'var(--s2)',
                }}
              >
                {getInitials(localStorage.getItem('userName') || '')}
              </button>
            </>
          ) : (
            <button className="nav-cta" onClick={() => navigate('/auth')}>
              Login / Signup
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        {isLoggedIn && (
          <button
            className="hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        )}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && isLoggedIn && (
        <div className="mobile-menu">
          {ALL_NAV_LINKS.map(({ label, path }) => (
            <button
              key={path}
              className={`mobile-nav-item ${isActive(path) ? 'active' : ''}`}
              onClick={() => { navigate(path); setMobileOpen(false) }}
            >
              {label}
            </button>
          ))}
          <button
            className={`mobile-nav-item ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => { navigate('/profile'); setMobileOpen(false) }}
            style={{ color: 'var(--blue-bright)', fontWeight: 600 }}
          >
            👤 My Profile
          </button>
          <button
            className="mobile-nav-item"
            onClick={() => { navigate('/role-selection'); setMobileOpen(false) }}
            style={{ color: 'var(--blue-bright)', fontWeight: 700 }}
          >
            Practice →
          </button>
          <button className="mobile-nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>🚪 Log Out</button>
        </div>
      )}
    </nav>
  )
}
