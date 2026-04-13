import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { companyAPI } from '../services/api'

export default function CompanyPrep() {
  const [company, setCompany] = useState('Google')
  const [role, setRole] = useState('Software Engineer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const handleFetch = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await companyAPI.prepare(company, role, true)
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load company prep')
    } finally {
      setLoading(false)
    }
  }

  const renderList = (title, items = []) => (
    <div className="card" style={{ marginBottom: 12 }}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      {items.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No data available</p> : (
        <ul style={{ paddingLeft: 18, lineHeight: 1.7 }}>
          {items.map((item, idx) => <li key={`${title}-${idx}`}>{item}</li>)}
        </ul>
      )}
    </div>
  )

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="card mb-6">
            <p className="section-title mb-4">Company Preparation Module</p>
            <h1 style={{ marginBottom: 12 }}>Company-Specific Preparation</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              Scrapes interview questions, hiring process, and preparation tips.
            </p>

            {error && <div className="error">{error}</div>}

            <div className="grid-2">
              <div className="form-group">
                <label>Company Name</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleFetch} disabled={loading}>
              {loading ? 'Fetching...' : 'Fetch Company Prep'}
            </button>
          </div>

          {data && (
            <>
              {renderList('Interview Questions', data.interview_questions)}
              {renderList('Hiring Process', data.hiring_process)}
              {renderList('Preparation Tips', data.preparation_tips)}
              {renderList('Sources', data.source_urls)}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
