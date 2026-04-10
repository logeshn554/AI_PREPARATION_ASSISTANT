import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './styles/global.css'

import Home from './pages/Home'
import ResumeUpload from './pages/ResumeUpload'
import RoleSelection from './pages/RoleSelection'
import Interview from './pages/Interview'
import Results from './pages/Results'
import Dashboard from './pages/Dashboard'

function App() {
  React.useEffect(() => {
    if (!localStorage.getItem('userId')) {
      // Set a robust anonymous dummy ID for the backend
      const dummyId = 'user_' + Math.random().toString(36).substring(2, 10)
      localStorage.setItem('userId', dummyId)
      localStorage.setItem('userName', 'Guest User')
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/results" element={<Results />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
