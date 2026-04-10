import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = (path) => location.pathname === path

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
          <button
            className={`nav-pill ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-pill ${isActive('/resume-upload') ? 'active' : ''}`}
            onClick={() => navigate('/resume-upload')}
          >
            Resume
          </button>
          <button
            className="nav-cta"
            onClick={() => navigate('/resume-upload')}
          >
            Start Interview →
          </button>
        </div>
      </div>
    </nav>
  )
}
