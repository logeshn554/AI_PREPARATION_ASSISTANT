import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { questionAPI } from '../services/api'
import Navbar from '../components/Navbar'

const ROLES = [
  'Senior Python Developer',
  'Senior JavaScript Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Cloud Architect',
  'Frontend Developer',
]

export default function RoleSelection() {
  const [selectedRole, setSelectedRole]   = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [numQuestions, setNumQuestions]   = useState(10)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const skills   = location.state?.skills || []

  const toggleSkill = (skill) =>
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRole) { setError('Please select a job role to continue'); return }
    setLoading(true); setError('')
    try {
      const skillsToUse = selectedSkills.length > 0 ? selectedSkills : skills
      const res = await questionAPI.generateQuestions(selectedRole, skillsToUse, numQuestions)
      navigate('/interview', {
        state: { questions: res.data.questions, role: selectedRole, skills: skillsToUse },
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate questions. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container-sm">

          <div className="page-header">
            <p className="section-title">Step 2 of 3</p>
            <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', letterSpacing: '-0.04em' }}>Configure Interview</h1>
            <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
              Select your target role and customise the session
            </p>
          </div>

          {error && <div className="error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>

            {/* Role chips */}
            <div className="card mb-6">
              <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>Target Role</p>
              <div className="role-grid">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`role-chip ${selectedRole === role ? 'selected' : ''}`}
                    onClick={() => { setSelectedRole(role); setError('') }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="card mb-6">
                <div className="flex-between mb-4">
                  <div>
                    <p className="section-title" style={{ marginBottom: '2px' }}>Focus Skills</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Leave all unchecked to use every extracted skill
                    </p>
                  </div>
                  <span className="tag tag-blue">
                    {selectedSkills.length > 0 ? `${selectedSkills.length} selected` : 'All'}
                  </span>
                </div>
                <div className="skill-list">
                  {skills.map((skill) => (
                    <div
                      key={skill}
                      className="skill-item"
                      onClick={() => toggleSkill(skill)}
                      style={
                        selectedSkills.includes(skill)
                          ? { background: 'var(--blue-subtle)', border: '1px solid rgba(96,165,250,0.22)' }
                          : {}
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label>{skill}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question count */}
            <div className="card mb-6">
              <p className="section-title" style={{ marginBottom: 'var(--s4)' }}>Number of Questions</p>
              <div className="flex-row" style={{ flexWrap: 'wrap', gap: 'var(--s3)' }}>
                {[5, 10, 15, 20].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`role-chip ${numQuestions === n ? 'selected' : ''}`}
                    style={{ minWidth: 72, padding: '10px 16px' }}
                    onClick={() => setNumQuestions(n)}
                  >
                    {n}
                  </button>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Custom:</span>
                  <input
                    type="number"
                    min="5" max="50"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)}
                    style={{ width: 80, marginBottom: 0, padding: '8px 12px' }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '15px', fontSize: '1rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Generating {numQuestions} Questions…
                </span>
              ) : `Generate ${numQuestions} Questions →`}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}
