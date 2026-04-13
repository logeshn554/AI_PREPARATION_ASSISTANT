import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './styles/global.css'

import Home from './pages/Home'
import Auth from './pages/Auth'
import ResumeUpload from './pages/ResumeUpload'
import RoleSelection from './pages/RoleSelection'
import Interview from './pages/Interview'
import Results from './pages/Results'
import Dashboard from './pages/Dashboard'
import Quiz from './pages/Quiz'
import CompanyPrep from './pages/CompanyPrep'
import MockTest from './pages/MockTest'
import AIInterviewer from './pages/AIInterviewer'
import Insights from './pages/Insights'
import DailyChallenge from './pages/DailyChallenge'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/auth" replace />
}

function App() {
  return (
    <Router>
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

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
