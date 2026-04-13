import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import Navbar from '../components/Navbar'
import { authAPI } from '../services/api'

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

  const persistSession = (data) => {
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('userId', String(data.user.id))
    localStorage.setItem('userName', data.user.name)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res =
        mode === 'login'
          ? await authAPI.login(email, password)
          : await authAPI.register(name, email, password)

      persistSession(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential
    if (!idToken) {
      setError('Google login failed: missing identity token')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await authAPI.googleLogin(idToken)
      persistSession(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container-xs">
          <div className="card">
            <p className="section-title mb-4">Secure Access</p>
            <h1 style={{ marginBottom: '16px', fontSize: '1.8rem' }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              Use email or Google authentication to continue.
            </p>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="form-group">
                  <label>Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              )}

              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>

            <button
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '12px' }}
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              disabled={loading}
            >
              {mode === 'login' ? 'Create new account' : 'Already have an account? Login'}
            </button>

            <div className="divider" />

            <div className="form-group">
              <label>Google OAuth</label>
              {hasGoogleClientId ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google login was cancelled or failed')}
                    useOneTap
                  />
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Configure VITE_GOOGLE_CLIENT_ID in frontend/.env to enable Google sign-in.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
