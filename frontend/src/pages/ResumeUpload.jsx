import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { resumeAPI } from '../services/api'
import Navbar from '../components/Navbar'

export default function ResumeUpload() {
  const [file, setFile]       = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [resumes, setResumes] = useState([])
  const userId   = localStorage.getItem('userId')
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId) navigate('/')
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const res = await resumeAPI.getUserResumes(userId)
      setResumes(res.data.resumes || [])
    } catch (err) {
      console.error('Error fetching resumes:', err)
    }
  }

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) { setFile(f); setError(''); setSuccess('') }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) { setFile(f); setError(''); setSuccess('') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { setError('Please select a resume file to upload'); return }
    setLoading(true); setError('')
    try {
      const res = await resumeAPI.upload(userId, file)
      setSuccess(`"${file.name}" uploaded and analysed!`)
      setFile(null); fetchResumes()
      setTimeout(() => navigate('/role-selection', { state: { skills: res.data.skills } }), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await resumeAPI.deleteResume(id)
      setSuccess('Resume deleted')
      fetchResumes()
    } catch { setError('Failed to delete resume') }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container-sm">

          <div className="page-header">
            <p className="section-title">Step 1 of 3</p>
            <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', letterSpacing: '-0.04em' }}>Upload Your Resume</h1>
            <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
              AI will parse your skills and tailor interview questions to you
            </p>
          </div>

          {error   && <div className="error">⚠ {error}</div>}
          {success && <div className="success">✓ {success}</div>}

          <div className="card mb-6">
            <form onSubmit={handleSubmit}>
              <div
                className={`drop-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={file ? { borderColor: 'var(--blue)', background: 'var(--blue-subtle)' } : {}}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <div className="drop-zone-icon">{file ? '✅' : '📂'}</div>
                {file ? (
                  <>
                    <h3 style={{ color: 'var(--blue-bright)' }}>{file.name}</h3>
                    <p>{(file.size / 1024).toFixed(0)} KB &nbsp;·&nbsp; Click to change</p>
                  </>
                ) : (
                  <>
                    <h3>Drop your resume here</h3>
                    <p>or click to browse &nbsp;·&nbsp; PDF, DOCX supported</p>
                  </>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !file}
                style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: 'var(--s5)' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Uploading &amp; Analysing…
                  </span>
                ) : 'Upload &amp; Analyse Resume →'}
              </button>
            </form>
          </div>

          {/* Existing resumes */}
          {resumes.length > 0 && (
            <>
              <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>
                Your Resumes ({resumes.length})
              </p>
              {resumes.map((r) => (
                <div key={r.id} className="resume-card">
                  <div className="resume-card-info">
                    <h3>{r.file_name}</h3>
                    <p>
                      {r.skills?.length > 0
                        ? r.skills.slice(0, 5).join(', ') + (r.skills.length > 5 ? ` +${r.skills.length - 5} more` : '')
                        : 'No skills extracted'}
                    </p>
                  </div>
                  <div className="resume-card-actions">
                    <button
                      className="btn btn-danger"
                      style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                      onClick={() => navigate('/role-selection', { state: { skills: r.skills } })}
                    >
                      Use This →
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
