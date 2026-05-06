import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const THEMES = ['dark','light','cyberpunk','matrix','sunset']

export default function Settings() {
  const navigate  = useNavigate()
  const [theme, setTheme]   = useState(localStorage.getItem('theme') || 'dark')
  const [meshBg, setMeshBg] = useState(localStorage.getItem('mesh_bg') !== 'false')
  const [saved, setSaved]   = useState(false)

  const applyTheme = (t) => {
    setTheme(t)
    localStorage.setItem('theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }

  const toggleMesh = () => {
    const next = !meshBg
    setMeshBg(next)
    localStorage.setItem('mesh_bg', String(next))
    const el = document.getElementById('global-mesh-bg')
    if (el) el.style.display = next ? '' : 'none'
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    navigate('/auth')
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container-sm">
          <div style={{ marginBottom: 'var(--s8)' }}>
            <p className="section-title">Preferences</p>
            <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', letterSpacing: '-0.04em' }}>Settings</h1>
          </div>

          {saved && <div className="success">✓ Settings saved</div>}

          {/* Theme */}
          <div className="card mb-6">
            <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>Theme</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s3)' }}>
              {THEMES.map(t => (
                <button
                  key={t}
                  className={`role-chip ${theme === t ? 'selected' : ''}`}
                  onClick={() => applyTheme(t)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {t === 'dark' ? '🌑' : t === 'light' ? '☀️' : t === 'cyberpunk' ? '🌆' : t === 'matrix' ? '💚' : '🌅'} {t}
                </button>
              ))}
            </div>
          </div>

          {/* Mesh background */}
          <div className="card mb-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>Animated Mesh Background</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Floating gradient orbs behind the UI</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 46, height: 26, flexShrink: 0 }}>
                <input type="checkbox" checked={meshBg} onChange={toggleMesh} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', inset: 0, borderRadius: 26, background: meshBg ? 'var(--blue)' : 'var(--surface-3)', cursor: 'pointer', transition: 'background 0.2s' }}>
                  <span style={{ position: 'absolute', height: 20, width: 20, left: meshBg ? 22 : 3, bottom: 3, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </span>
              </label>
            </div>
          </div>

          {/* Account */}
          <div className="card mb-6">
            <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>Account</p>
            <div style={{ display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/profile')}>👤 View Profile</button>
              <button className="btn btn-danger" onClick={handleLogout}>🚪 Log Out</button>
            </div>
          </div>

          <button className="btn btn-cta" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  )
}
