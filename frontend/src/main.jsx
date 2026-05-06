import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './styles/global.css'

// ── Skeleton loader for code-split routes ─────────────────────────────
function PageSkeleton() {
  return (
    <div className="app-shell">
      <div className="navbar">
        <div className="navbar-inner">
          <div className="skeleton" style={{ width: 140, height: 28, borderRadius: 8 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {[80, 60, 70, 50].map((w, i) => (
              <div key={i} className="skeleton" style={{ width: w, height: 24, borderRadius: 20 }} />
            ))}
          </div>
        </div>
      </div>
      <div className="page-wrapper">
        <div className="container">
          <div className="skeleton" style={{ width: '35%', height: 18, borderRadius: 6, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: '55%', height: 36, borderRadius: 8, marginBottom: 32 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Eagerly loaded (always needed) ────────────────────────────────────
import Home from './pages/Home'
import Auth from './pages/Auth'

// ── Lazy-loaded routes (#11 — Code Splitting) ─────────────────────────
const Dashboard      = React.lazy(() => import('./pages/Dashboard'))
const ResumeUpload   = React.lazy(() => import('./pages/ResumeUpload'))
const RoleSelection  = React.lazy(() => import('./pages/RoleSelection'))
const Interview      = React.lazy(() => import('./pages/Interview'))
const Results        = React.lazy(() => import('./pages/Results'))
const Quiz           = React.lazy(() => import('./pages/Quiz'))
const CompanyPrep    = React.lazy(() => import('./pages/CompanyPrep'))
const MockTest       = React.lazy(() => import('./pages/MockTest'))
const AIInterviewer  = React.lazy(() => import('./pages/AIInterviewer'))
const Insights       = React.lazy(() => import('./pages/Insights'))
const DailyChallenge = React.lazy(() => import('./pages/DailyChallenge'))
const JDAnalysis     = React.lazy(() => import('./pages/JDAnalysis'))
const AIChat         = React.lazy(() => import('./pages/AIChat'))
const Settings       = React.lazy(() => import('./pages/Settings'))
const FocusMode      = React.lazy(() => import('./pages/FocusMode'))
const VoiceInterviewer = React.lazy(() => import('./pages/VoiceInterviewer'))
const SystemDesign   = React.lazy(() => import('./pages/SystemDesign'))
const Community      = React.lazy(() => import('./pages/Community'))
const Pricing        = React.lazy(() => import('./pages/Pricing'))
const Profile        = React.lazy(() => import('./pages/Profile'))

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/auth" replace />
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/resume-upload" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
          <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/company-prep" element={<ProtectedRoute><CompanyPrep /></ProtectedRoute>} />
          <Route path="/mock-test" element={<ProtectedRoute><MockTest /></ProtectedRoute>} />
          <Route path="/ai-interviewer" element={<ProtectedRoute><AIInterviewer /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
          <Route path="/jd-analysis" element={<ProtectedRoute><JDAnalysis /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/focus-mode" element={<ProtectedRoute><FocusMode /></ProtectedRoute>} />
          <Route path="/voice-interview" element={<ProtectedRoute><VoiceInterviewer /></ProtectedRoute>} />
          <Route path="/system-design" element={<ProtectedRoute><SystemDesign /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

// ── Register Service Worker for PWA (#12) ────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

// ── Apply saved theme on load ────────────────────────────────────────
const savedTheme = localStorage.getItem('theme') || 'dark'
document.documentElement.setAttribute('data-theme', savedTheme)

// ── Inject animated mesh gradient background ────────────────────────
const meshEnabled = localStorage.getItem('mesh_bg') !== 'false'
const meshDiv = document.createElement('div')
meshDiv.id = 'global-mesh-bg'
meshDiv.className = 'mesh-bg'
meshDiv.innerHTML = `
  <div class="mesh-blob mesh-blob-1"></div>
  <div class="mesh-blob mesh-blob-2"></div>
  <div class="mesh-blob mesh-blob-3"></div>
`
if (!meshEnabled) meshDiv.style.display = 'none'
document.body.appendChild(meshDiv)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
