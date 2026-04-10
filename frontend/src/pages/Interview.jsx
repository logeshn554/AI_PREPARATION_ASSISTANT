import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { answerAPI } from '../services/api'
import Navbar from '../components/Navbar'

export default function Interview() {
  const location = useLocation()
  const navigate = useNavigate()
  const { questions = [], role = '' } = location.state || {}
  const userId = localStorage.getItem('userId')
  const textareaRef = useRef(null)

  const [currentIdx, setCurrentIdx]     = useState(0)
  const [answers, setAnswers]           = useState([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [evaluations, setEvaluations]   = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  useEffect(() => {
    if (!userId || questions.length === 0) navigate('/resume-upload')
  }, [])

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus()
  }, [currentIdx])

  if (questions.length === 0) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page-wrapper">
          <div className="loading-screen">
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)' }}>Loading interview…</p>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIdx] || {}
  const progress        = ((currentIdx + 1) / questions.length) * 100
  const isLast          = currentIdx === questions.length - 1

  const handleSubmit = async () => {
    if (!currentAnswer.trim()) { setError('Please write your answer before submitting'); return }
    setLoading(true); setError('')
    try {
      const res         = await answerAPI.evaluateAnswer(userId, currentQuestion.id, currentAnswer)
      const newAnswers  = [...answers, currentAnswer]
      const newEvals    = [...evaluations, res.data]
      setAnswers(newAnswers)
      setEvaluations(newEvals)
      setCurrentAnswer('')
      if (!isLast) {
        setCurrentIdx(currentIdx + 1)
      } else {
        navigate('/results', { state: { answers: newAnswers, evaluations: newEvals, questions } })
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to evaluate answer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    if (!isLast) { setCurrentAnswer(''); setError(''); setCurrentIdx(currentIdx + 1) }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div className="container-sm">

          {/* Session meta */}
          <div className="flex-between mb-4">
            <div>
              <p className="section-title" style={{ marginBottom: '2px' }}>Live Interview</p>
              {role && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{role}</p>}
            </div>
            <span className="tag tag-blue" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {currentIdx + 1} / {questions.length}
            </span>
          </div>

          {/* Cinematic progress bar */}
          <div className="progress-track mb-8">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {error && <div className="error">⚠ {error}</div>}

          {/* Question */}
          <div className="question-box">
            <div className="question-number">Question {currentIdx + 1}</div>
            <div className="question-text">{currentQuestion.question_text}</div>
            {currentQuestion.question_type && (
              <span
                className="tag"
                style={
                  currentQuestion.question_type === 'technical'
                    ? { background: 'var(--blue-subtle)', color: 'var(--blue-bright)', borderColor: 'rgba(96,165,250,0.22)' }
                    : {}
                }
              >
                {currentQuestion.question_type}
              </span>
            )}
          </div>

          {/* Answer area */}
          <div className="card mb-5">
            <label style={{ marginBottom: 'var(--s3)', display: 'block' }}>Your Answer</label>
            <textarea
              ref={textareaRef}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here… Be specific and detailed."
              style={{ minHeight: 200, resize: 'vertical', marginBottom: 0, lineHeight: 1.75 }}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
              }}
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 'var(--s2)' }}>
              Ctrl + Enter to submit quickly
            </p>
          </div>

          {/* Actions */}
          <div className="flex-row" style={{ gap: 'var(--s3)', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ flex: 1, padding: '14px', fontSize: '0.95rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Evaluating…
                </span>
              ) : isLast ? 'Submit & View Results →' : 'Submit & Next →'}
            </button>
            {!isLast && (
              <button
                className="btn btn-secondary"
                onClick={handleSkip}
                disabled={loading}
                style={{ padding: '14px 22px' }}
              >
                Skip
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
