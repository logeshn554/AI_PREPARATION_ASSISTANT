import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { aiInterviewerAPI } from '../services/api'

const AVAILABLE_ROLES = [
  'Software Engineer', 'Senior Software Engineer', 'Frontend Engineer',
  'Backend Engineer', 'Full Stack Engineer', 'Data Engineer', 'Data Scientist',
  'ML Engineer', 'DevOps Engineer', 'Cloud Engineer', 'Product Manager',
  'Technical Lead', 'System Architect',
]

const COMMON_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'FastAPI', 'Django',
  'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'GCP',
  'Machine Learning', 'System Design', 'REST APIs', 'GraphQL', 'Git', 'CI/CD',
]

function ScoreRing({ score, size = 48 }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? 'var(--success)' : score >= 55 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s var(--ease-cinema)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: size < 60 ? '0.7rem' : '0.95rem',
        fontWeight: 800, color,
      }}>
        {score}
      </div>
    </div>
  )
}

function MessageBubble({ msg }) {
  const isAI = msg.from === 'ai'
  return (
    <div style={{
      display: 'flex', gap: 'var(--s3)',
      justifyContent: isAI ? 'flex-start' : 'flex-end',
      alignItems: 'flex-end',
      animation: 'fadeUp 0.3s var(--ease-cinema)',
    }}>
      {isAI && (
        <div style={{
          width: 34, height: 34, borderRadius: 'var(--r-sm)',
          background: 'linear-gradient(135deg, var(--blue-deep), var(--violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
          boxShadow: '0 0 12px rgba(96,165,250,0.3)',
        }}>🤖</div>
      )}

      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
        {/* Main bubble */}
        <div style={{
          padding: 'var(--s4) var(--s5)',
          borderRadius: isAI ? '4px 16px 16px 16px' : '16px 16px 4px 16px',
          background: isAI
            ? 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.08))'
            : 'var(--surface-2)',
          border: isAI
            ? '1px solid rgba(96,165,250,0.2)'
            : '1px solid var(--border-default)',
          backdropFilter: 'blur(12px)',
        }}>
          <p style={{
            fontSize: '0.92rem', lineHeight: 1.65,
            color: isAI ? 'var(--text-primary)' : 'var(--text-secondary)',
            margin: 0, whiteSpace: 'pre-wrap',
          }}>{msg.text}</p>
        </div>

        {/* Feedback bubble for AI messages */}
        {isAI && msg.feedback && (
          <div style={{
            padding: 'var(--s3) var(--s4)',
            borderRadius: 'var(--r-md)',
            background: 'var(--surface-1)',
            border: '1px solid var(--border-dark)',
            display: 'flex', gap: 'var(--s3)', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 14, flexShrink: 0, marginTop: 2 }}>
              {msg.score >= 75 ? '✅' : msg.score >= 55 ? '🟡' : '💡'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', marginBottom: 'var(--s2)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Feedback
                </span>
                {msg.score != null && <ScoreRing score={msg.score} size={40} />}
              </div>
              {/* Multi-dimensional scores */}
              {msg.dimensionScores && (
                <div style={{ display: 'flex', gap: 'var(--s3)', marginBottom: 'var(--s2)', flexWrap: 'wrap' }}>
                  {[{k:'logic',l:'Logic',c:'var(--blue-bright)'},{k:'clarity',l:'Clarity',c:'var(--success)'},{k:'depth',l:'Depth',c:'var(--violet)'},{k:'communication',l:'Comm.',c:'var(--gold-bright)'}].map(d => (
                    msg.dimensionScores[d.k] != null && (
                      <div key={d.k} style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <ScoreRing score={msg.dimensionScores[d.k]} size={28} />
                        <span style={{ fontSize:'0.65rem', color:'var(--text-dim)' }}>{d.l}</span>
                      </div>
                    )
                  ))}
                </div>
              )}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {msg.feedback}
              </p>
              {msg.followUp && (
                <p style={{ fontSize: '0.82rem', color: 'var(--blue-bright)', marginTop: 'var(--s2)', margin: 0 }}>
                  💬 {msg.followUp}
                </p>
              )}
            </div>
          </div>
        )}

        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: isAI ? 'flex-start' : 'flex-end' }}>
          {msg.time}
        </span>
      </div>

      {!isAI && (
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--surface-3)', border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
        }}>👤</div>
      )}
    </div>
  )
}

export default function AIInterviewer() {
  const navigate  = useNavigate()
  const userId    = localStorage.getItem('userId')
  const bottomRef = useRef(null)
  const location  = typeof window !== 'undefined' ? window.location : {}

  // Setup state
  const [phase,        setPhase]        = useState('setup')  // 'setup' | 'interview' | 'complete'
  const [role,         setRole]         = useState('Software Engineer')
  const [customRole,   setCustomRole]   = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [customSkill,  setCustomSkill]  = useState('')

  // Interview state
  const [messages,     setMessages]     = useState([])
  const [history,      setHistory]      = useState([])  // {role, content} pairs
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [lastQuestion, setLastQuestion] = useState(null)
  const [loading,      setLoading]      = useState(false)

  // Session tracking (Phase 1)
  const [sessionId,    setSessionId]    = useState(null)
  const [difficulty,   setDifficulty]   = useState(2)
  const [dimScores,    setDimScores]    = useState([])  // Array of {logic, clarity, depth, communication}

  // Score tracking
  const [scores,       setScores]       = useState([])
  const [questionCount, setQuestionCount] = useState(0)

  const effectiveRole = customRole.trim() || role
  const skills = selectedSkills.length > 0 ? selectedSkills : ['general programming']

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const addCustomSkill = () => {
    const s = customSkill.trim()
    if (s && !selectedSkills.includes(s)) {
      setSelectedSkills(prev => [...prev, s])
    }
    setCustomSkill('')
  }

  const timeNow = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const startInterview = async () => {
    setPhase('interview')
    setLoading(true)
    try {
      const res = await aiInterviewerAPI.chat({
        user_id: Number(userId) || 0,
        role: effectiveRole,
        skills,
        answer: null,
        previous_question: null,
        conversation_history: [],
        session_id: null,
      })
      const d = res.data
      if (d.session_id) setSessionId(d.session_id)
      if (d.difficulty_level) setDifficulty(d.difficulty_level)
      const aiMsg = {
        id: Date.now(), from: 'ai',
        text: d.question || 'Hello! Let\'s begin the interview. Tell me about yourself.',
        feedback: null, score: null, dimensionScores: null, followUp: null, time: timeNow(),
      }
      setMessages([aiMsg])
      setLastQuestion(d.question)
      setHistory([{ role: 'interviewer', content: d.question }])
      setQuestionCount(1)
    } catch {
      setMessages([{
        id: Date.now(), from: 'ai',
        text: `Hello! I'm your AI interviewer for the ${effectiveRole} role. Let's start — please introduce yourself and walk me through your background.`,
        feedback: null, score: null, dimensionScores: null, followUp: null, time: timeNow(),
      }])
      setLastQuestion('Please introduce yourself.')
    } finally {
      setLoading(false)
    }
  }

  const sendAnswer = async () => {
    if (!currentAnswer.trim() || loading) return
    const answerText = currentAnswer.trim()
    setCurrentAnswer('')

    const userMsg = { id: Date.now(), from: 'user', text: answerText, time: timeNow() }
    setMessages(prev => [...prev, userMsg])

    const newHistory = [
      ...history,
      { role: 'candidate', content: answerText },
    ]
    setHistory(newHistory)
    setLoading(true)

    try {
      const res = await aiInterviewerAPI.chat({
        user_id: Number(userId) || 0,
        role: effectiveRole,
        skills,
        answer: answerText,
        previous_question: lastQuestion,
        conversation_history: newHistory,
        session_id: sessionId,
      })
      const d = res.data

      if (d.session_id) setSessionId(d.session_id)
      if (d.difficulty_level) setDifficulty(d.difficulty_level)
      if (d.score != null) setScores(prev => [...prev, d.score])
      if (d.dimension_scores) setDimScores(prev => [...prev, d.dimension_scores])

      if (d.is_complete) {
        const avgScore = scores.length > 0
          ? Math.round([...scores, d.score || 0].reduce((a, b) => a + b, 0) / (scores.length + 1))
          : 0
        const aiMsg = {
          id: Date.now() + 1, from: 'ai',
          text: d.question || `Thank you for the interview! You answered ${questionCount} questions. Your overall performance score is ${avgScore}%.`,
          feedback: d.feedback, score: d.score, dimensionScores: d.dimension_scores, followUp: d.follow_up, time: timeNow(),
        }
        setMessages(prev => [...prev, aiMsg])
        setTimeout(() => setPhase('complete'), 1800)
      } else {
        const aiMsg = {
          id: Date.now() + 1, from: 'ai',
          text: d.question || 'Interesting. Can you elaborate further?',
          feedback: d.feedback, score: d.score, dimensionScores: d.dimension_scores, followUp: d.follow_up, time: timeNow(),
        }
        setMessages(prev => [...prev, aiMsg])
        setLastQuestion(d.question)
        setHistory([...newHistory, { role: 'interviewer', content: d.question }])
        setQuestionCount(prev => prev + 1)
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, from: 'ai',
        text: 'Thank you for that answer. Let\'s continue — can you describe a challenging technical problem you solved recently?',
        feedback: null, score: null, dimensionScores: null, followUp: null, time: timeNow(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  /* ─────────────── SETUP PHASE ─────────────── */
  if (phase === 'setup') {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page-wrapper">
          <div className="container-sm">
            <div style={{ paddingTop: 'var(--s8)', marginBottom: 'var(--s8)' }}>
              <p className="section-title" style={{ marginBottom: 'var(--s2)' }}>AI Interview</p>
              <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.3rem)', letterSpacing: '-0.04em', marginBottom: 'var(--s2)' }}>
                Conversational AI Interviewer
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Experience a realistic interview with adaptive follow-up questions, live scoring, and specific feedback.
              </p>
            </div>

            <div className="card mb-5">
              <div className="form-group">
                <label>Target Role</label>
                <select value={role} onChange={e => setRole(e.target.value)}>
                  {AVAILABLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Custom Role <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-muted)' }}>(overrides above)</span></label>
                <input value={customRole} onChange={e => setCustomRole(e.target.value)} placeholder="e.g. Principal ML Engineer" />
              </div>
            </div>

            <div className="card mb-6">
              <p className="section-title" style={{ marginBottom: 'var(--s2)' }}>Skills to be Assessed</p>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 'var(--s4)' }}>
                Select the skills you want the interviewer to focus on.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s2)', marginBottom: 'var(--s5)' }}>
                {COMMON_SKILLS.map(s => (
                  <button
                    key={s} type="button"
                    className={`role-chip ${selectedSkills.includes(s) ? 'selected' : ''}`}
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    onClick={() => toggleSkill(s)}
                  >{s}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 'var(--s3)' }}>
                <input
                  value={customSkill}
                  onChange={e => setCustomSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                  placeholder="Add custom skill…"
                  style={{ flex: 1 }}
                />
                <button className="btn btn-secondary" onClick={addCustomSkill} style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>
                  + Add
                </button>
              </div>
              {selectedSkills.length > 0 && (
                <div style={{ marginTop: 'var(--s4)', display: 'flex', flexWrap: 'wrap', gap: 'var(--s2)' }}>
                  {selectedSkills.map(s => (
                    <span key={s} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 12px', borderRadius: 'var(--r-full)',
                      background: 'var(--blue-subtle)', color: 'var(--blue-bright)',
                      border: '1px solid rgba(96,165,250,0.25)', fontSize: '0.8rem', fontWeight: 600,
                    }}>
                      {s}
                      <button type="button" onClick={() => toggleSkill(s)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, padding: 0, display: 'flex' }}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="card mb-6" style={{ background: 'var(--blue-subtle)', border: '1px solid rgba(96,165,250,0.2)' }}>
              <p className="section-title" style={{ color: 'var(--blue-bright)', marginBottom: 'var(--s3)' }}>Interview Tips</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                {[
                  'Use the STAR method: Situation, Task, Action, Result.',
                  'Be specific — quantify your impact when possible.',
                  'Think out loud for technical questions.',
                  'Ask clarifying questions as a real candidate would.',
                ].map((tip, i) => (
                  <li key={i} style={{ display: 'flex', gap: 'var(--s3)', fontSize: '0.87rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--blue-bright)', flexShrink: 0 }}>→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: 'var(--r-lg)' }}
              onClick={startInterview}
            >
              🎤 Start AI Interview
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ─────────────── COMPLETE PHASE ─────────────── */
  if (phase === 'complete') {
    const rating = avgScore >= 80 ? { label: 'Excellent', color: 'var(--success)', icon: '🏆' }
      : avgScore >= 65 ? { label: 'Good', color: 'var(--warning)', icon: '🎯' }
      : { label: 'Needs Practice', color: 'var(--danger)', icon: '📚' }

    return (
      <div className="app-shell">
        <Navbar />
        <div className="page-wrapper">
          <div className="container-xs" style={{ textAlign: 'center', paddingTop: 'var(--s16)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--s5)' }}>{rating.icon}</div>
            <p className="section-title" style={{ marginBottom: 'var(--s2)' }}>Interview Complete</p>
            <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', letterSpacing: '-0.04em', marginBottom: 'var(--s6)' }}>
              {rating.label}!
            </h1>

            <div className="card mb-8" style={{ textAlign: 'left' }}>
              <div className="grid-3" style={{ textAlign: 'center', gap: 'var(--s4)' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: rating.color, lineHeight: 1 }}>{avgScore}%</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 4 }}>Avg Score</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--blue-bright)', lineHeight: 1 }}>{questionCount}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 4 }}>Questions</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--violet)', lineHeight: 1 }}>{scores.length}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 4 }}>Evaluated</p>
                </div>
              </div>
              {scores.length > 0 && (
                <div style={{ marginTop: 'var(--s6)', borderTop: '1px solid var(--border-dark)', paddingTop: 'var(--s5)' }}>
                  <p className="section-title" style={{ marginBottom: 'var(--s3)' }}>Score Breakdown</p>
                  {scores.map((s, i) => {
                    const col = s >= 75 ? 'var(--success)' : s >= 55 ? 'var(--warning)' : 'var(--danger)'
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)', marginBottom: 'var(--s2)' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', minWidth: 80 }}>Question {i + 1}</span>
                        <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${s}%`, background: col, borderRadius: 'var(--r-full)', transition: 'width 1s var(--ease-cinema)' }} />
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: col, minWidth: 36, textAlign: 'right' }}>{Math.round(s)}%</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--s4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => { setPhase('setup'); setMessages([]); setHistory([]); setScores([]); setDimScores([]); setQuestionCount(0); setSessionId(null); setDifficulty(2) }}>
                🔄 New Interview
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                📊 Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ─────────────── INTERVIEW PHASE ─────────────── */
  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrapper">
        <div style={{
          display: 'flex', flexDirection: 'column',
          height: 'calc(100vh - var(--navbar-h))',
          maxWidth: 760, margin: '0 auto', padding: '0 var(--s6)',
        }}>

          {/* Header bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 'var(--s5) 0 var(--s4)',
            borderBottom: '1px solid var(--border-dark)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 'var(--r-sm)',
                background: 'linear-gradient(135deg, var(--blue-deep), var(--violet))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>🤖</div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>AI Interviewer</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{effectiveRole}</p>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px',
                    borderRadius: 'var(--r-full)',
                    background: difficulty >= 4 ? 'rgba(248,113,113,0.15)' : difficulty >= 3 ? 'rgba(251,191,36,0.15)' : 'rgba(96,165,250,0.15)',
                    color: difficulty >= 4 ? 'var(--danger)' : difficulty >= 3 ? 'var(--warning)' : 'var(--blue-bright)',
                  }}>
                    {'★'.repeat(difficulty)} L{difficulty}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s5)' }}>
              {scores.length > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800,
                    color: avgScore >= 75 ? 'var(--success)' : avgScore >= 55 ? 'var(--warning)' : 'var(--danger)',
                    margin: 0, lineHeight: 1 }}>{avgScore}%</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg Score</p>
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--blue-bright)', margin: 0, lineHeight: 1 }}>{questionCount}</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Questions</p>
              </div>
              <button className="btn btn-danger"
                style={{ padding: '7px 16px', fontSize: '0.8rem' }}
                onClick={() => { setPhase('complete') }}>
                End
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s5) 0', display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

            {loading && (
              <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center', animation: 'fadeUp 0.3s var(--ease-cinema)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)',
                  background: 'linear-gradient(135deg, var(--blue-deep), var(--violet))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
                <div style={{ padding: 'var(--s3) var(--s4)', borderRadius: '4px 16px 16px 16px',
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.08))',
                  border: '1px solid rgba(96,165,250,0.2)',
                  display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block',
                      animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={{
            borderTop: '1px solid var(--border-dark)',
            padding: 'var(--s4) 0 var(--s5)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'flex-end' }}>
              <textarea
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendAnswer()
                  }
                }}
                placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
                rows={3}
                disabled={loading}
                style={{
                  flex: 1, resize: 'none', borderRadius: 'var(--r-md)',
                  padding: 'var(--s3) var(--s4)', minHeight: 72, maxHeight: 160,
                }}
              />
              <button
                className="btn btn-primary"
                onClick={sendAnswer}
                disabled={loading || !currentAnswer.trim()}
                style={{ padding: '14px 22px', alignSelf: 'flex-end', flexShrink: 0 }}
              >
                {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '→'}
              </button>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 'var(--s2)', textAlign: 'center' }}>
              Skills: {skills.slice(0, 4).join(', ')}{skills.length > 4 ? ` +${skills.length - 4} more` : ''}
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
