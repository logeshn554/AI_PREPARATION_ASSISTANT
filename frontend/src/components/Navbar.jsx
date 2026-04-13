import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = (path) => location.pathname === path
  const isLoggedIn = Boolean(localStorage.getItem('token'))

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
          <div className="brand-gem">🎯</div>
          <span>InterviewIQ</span>
        </div>

        <div className="navbar-nav">
          <button
            className={`nav-pill ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            Home
          </button>

          {isLoggedIn ? (
            <>
              <button
                className={`nav-pill ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`nav-pill ${isActive('/quiz') ? 'active' : ''}`}
                onClick={() => navigate('/quiz')}
              >
                Quiz
              </button>
              <button
                className={`nav-pill ${isActive('/company-prep') ? 'active' : ''}`}
                onClick={() => navigate('/company-prep')}
              >
                Company
              </button>
              <button
                className={`nav-pill ${isActive('/daily-challenge') ? 'active' : ''}`}
                onClick={() => navigate('/daily-challenge')}
              >
                Challenge
              </button>
              <button className="nav-cta" onClick={() => navigate('/resume-upload')}>
                Start Interview →
              </button>
              <button className="nav-pill" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="nav-cta" onClick={() => navigate('/auth')}>
              Login / Signup
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
