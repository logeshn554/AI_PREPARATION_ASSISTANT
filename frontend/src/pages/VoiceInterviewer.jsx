import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { aiInterviewerAPI } from '../services/api'
import useVoiceInterview from '../hooks/useVoiceInterview'

const ROLES = ['Software Engineer','Senior Software Engineer','Frontend Engineer','Backend Engineer','Full Stack Engineer','Data Scientist','ML Engineer','DevOps Engineer','Product Manager','System Architect']

function Waveform({ volume = 0, active = false, color = 'var(--blue-bright)' }) {
  const bars = 20
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, height: 50 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const dist = Math.abs(i - bars / 2) / (bars / 2)
        const h = active ? Math.max(4, (1 - dist * 0.6) * volume * 44 + Math.random() * 6) : 4
        return <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: active ? color : 'var(--surface-3)', transition: 'height 0.08s ease' }} />
      })}
    </div>
  )
}

export default function VoiceInterviewer() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')
  const voice = useVoiceInterview()

  const [phase, setPhase]         = useState('setup')
  const [role, setRole]           = useState('Software Engineer')
  const [timerMode, setTimerMode] = useState(false)
  const [timeLimit, setTimeLimit] = useState(30)
  const [sessionId, setSessionId] = useState(null)
  const [difficulty, setDifficulty] = useState(2)
  const [messages, setMessages]   = useState([])
  const [history, setHistory]     = useState([])
  const [lastQuestion, setLastQuestion] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [scores, setScores]       = useState([])
  const [questionCount, setQuestionCount] = useState(0)
  const [timeLeft, setTimeLeft]   = useState(null)
  const timerRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  const startTimer = () => {
    if (!timerMode) return
    setTimeLeft(timeLimit)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmitVoice(); return 0 }
        return prev - 1
      })
    }, 1000)
  }
  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); setTimeLeft(null) }

  const startInterview = async () => {
    setPhase('interview'); setLoading(true)
    try {
      const res = await aiInterviewerAPI.chat({ user_id: Number(userId) || 0, role, skills: ['general programming'], answer: null, previous_question: null, conversation_history: [], session_id: null })
      const d = res.data
      if (d.session_id) setSessionId(d.session_id)
      if (d.difficulty_level) setDifficulty(d.difficulty_level)
      const qText = d.question || `Hello! Let's begin. Tell me about your background in ${role}.`
      setMessages([{ id: Date.now(), from: 'ai', text: qText }])
      setLastQuestion(qText); setHistory([{ role: 'interviewer', content: qText }]); setQuestionCount(1)
      voice.speak(qText, () => { voice.startListening(); startTimer() })
    } catch {
      const fallback = `Hello! I'm your AI voice interviewer for ${role}. Tell me about yourself.`
      setMessages([{ id: Date.now(), from: 'ai', text: fallback }])
      setLastQuestion(fallback)
      voice.speak(fallback, () => { voice.startListening(); startTimer() })
    } finally { setLoading(false) }
  }

  const handleSubmitVoice = async () => {
    const answerText = (voice.transcript + ' ' + voice.interimTranscript).trim()
    if (!answerText || loading) return
    voice.stopListening(); stopTimer(); voice.clearTranscript()
    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: answerText }])
    const newHistory = [...history, { role: 'candidate', content: answerText }]
    setHistory(newHistory); setLoading(true)
    try {
      const res = await aiInterviewerAPI.chat({ user_id: Number(userId) || 0, role, skills: ['general programming'], answer: answerText, previous_question: lastQuestion, conversation_history: newHistory, session_id: sessionId })
      const d = res.data
      if (d.session_id) setSessionId(d.session_id)
      if (d.difficulty_level) setDifficulty(d.difficulty_level)
      if (d.score != null) setScores(prev => [...prev, d.score])
      const aiText = d.question || 'Thank you for the interview.'
      const feedbackLine = d.feedback ? `\n\n📝 ${d.feedback}` : ''
      if (d.is_complete) {
        setMessages(prev => [...prev, { id: Date.now() + 1, from: 'ai', text: aiText + feedbackLine, score: d.score }])
        voice.speak(aiText, () => setTimeout(() => setPhase('complete'), 1500))
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, from: 'ai', text: aiText + feedbackLine, score: d.score }])
        setLastQuestion(d.question); setHistory([...newHistory, { role: 'interviewer', content: d.question }]); setQuestionCount(prev => prev + 1)
        voice.speak(aiText, () => { voice.startListening(); startTimer() })
      }
    } catch {
      const fallback = "Let's continue. Describe a technical challenge you recently solved."
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'ai', text: fallback }])
      voice.speak(fallback, () => { voice.startListening(); startTimer() })
    } finally { setLoading(false) }
  }

  if (phase === 'setup') return (
    <div className="app-shell"><Navbar />
      <div className="page-wrapper"><div className="container-sm">
        <div style={{ marginBottom: 'var(--s8)' }}>
          <p className="section-title">Voice Mode</p>
          <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.3rem)', letterSpacing: '-0.04em' }}>Voice Interview Simulator</h1>
          <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.65 }}>Practice speaking your answers aloud. The AI listens, evaluates, and responds with voice.</p>
        </div>
        {!voice.supported && <div className="error">Speech recognition not supported. Please use Chrome or Edge.</div>}
        <div className="card mb-6">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Target Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="card mb-6">
          <p className="section-title" style={{ marginBottom: 'var(--s3)' }}>Timer Pressure</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: timerMode ? 'var(--s4)' : 0 }}>
            <div>
              <p style={{ fontWeight: 600, margin: 0 }}>Enable Timer Mode</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Auto-submits when time runs out</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 46, height: 26, flexShrink: 0 }}>
              <input type="checkbox" checked={timerMode} onChange={e => setTimerMode(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', inset: 0, borderRadius: 26, background: timerMode ? 'var(--blue)' : 'var(--surface-3)', cursor: 'pointer', transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', height: 20, width: 20, left: timerMode ? 22 : 3, bottom: 3, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </span>
            </label>
          </div>
          {timerMode && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Seconds per answer</label>
              <select value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))}>
                {[15, 30, 45, 60, 90, 120].map(t => <option key={t} value={t}>{t}s</option>)}
              </select>
            </div>
          )}
        </div>
        <button className="btn btn-cta" onClick={startInterview} disabled={!voice.supported}>🎙 Start Voice Interview →</button>
      </div></div>
    </div>
  )

  if (phase === 'complete') {
    const rating = avgScore >= 80 ? { label: 'Excellent', color: 'var(--success)' } : avgScore >= 65 ? { label: 'Good', color: 'var(--warning)' } : { label: 'Needs Practice', color: 'var(--danger)' }
    return (
      <div className="app-shell"><Navbar />
        <div className="page-wrapper"><div className="container-xs" style={{ textAlign: 'center', paddingTop: 'var(--s16)' }}>
          <p className="section-title">Voice Interview Complete</p>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', letterSpacing: '-0.04em', marginBottom: 'var(--s6)' }}>{rating.label}!</h1>
          <div className="card mb-8" style={{ textAlign: 'center' }}>
            <div className="grid-3" style={{ gap: 'var(--s4)' }}>
              <div><p style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: rating.color, lineHeight: 1 }}>{avgScore}%</p><p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 4 }}>Avg Score</p></div>
              <div><p style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--blue-bright)', lineHeight: 1 }}>{questionCount}</p><p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 4 }}>Questions</p></div>
              <div><p style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--violet)', lineHeight: 1 }}>🎙</p><p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 4 }}>Voice Mode</p></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--s4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { setPhase('setup'); setMessages([]); setHistory([]); setScores([]); setQuestionCount(0); setSessionId(null) }}>New Interview</button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
          </div>
        </div></div>
      </div>
    )
  }

  return (
    <div className="app-shell"><Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--navbar-h))', marginTop: 'var(--navbar-h)', maxWidth: 760, margin: '0 auto', padding: '0 var(--s6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--s5) 0 var(--s4)', borderBottom: '1px solid var(--border-dark)', flexShrink: 0 }}>
          <div>
            <p style={{ fontWeight: 700, margin: 0 }}>Voice Interviewer — {role}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Level {difficulty}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)' }}>
            {timeLeft != null && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: timeLeft <= 10 ? 'var(--danger)' : 'var(--text-primary)' }}>{timeLeft}s</div>}
            <span style={{ fontWeight: 800, color: 'var(--blue-bright)' }}>Q{questionCount}</span>
            <button className="btn btn-danger" style={{ padding: '7px 16px', fontSize: '0.8rem' }} onClick={() => { voice.stopListening(); voice.stopSpeaking(); stopTimer(); setPhase('complete') }}>End</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s5) 0', display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: 'var(--s3)', justifyContent: msg.from === 'ai' ? 'flex-start' : 'flex-end' }}>
              {msg.from === 'ai' && <div style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'linear-gradient(135deg,var(--blue-deep),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🤖</div>}
              <div style={{ maxWidth: '72%', padding: 'var(--s4) var(--s5)', borderRadius: msg.from === 'ai' ? '4px 16px 16px 16px' : '16px 16px 4px 16px', background: msg.from === 'ai' ? 'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(124,58,237,0.08))' : 'var(--surface-2)', border: msg.from === 'ai' ? '1px solid rgba(96,165,250,0.2)' : '1px solid var(--border-default)' }}>
                <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                {msg.score != null && <div style={{ marginTop: 'var(--s2)', fontSize: '0.78rem', fontWeight: 700, color: msg.score >= 70 ? 'var(--success)' : msg.score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>Score: {Math.round(msg.score)}%</div>}
              </div>
              {msg.from === 'user' && <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface-3)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👤</div>}
            </div>
          ))}
          {loading && <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}><div style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'linear-gradient(135deg,var(--blue-deep),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div><div style={{ padding: 'var(--s3) var(--s4)', borderRadius: '4px 16px 16px 16px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', gap: 5 }}>{[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', display: 'block', animation: `blink 1.2s ease-in-out ${i*0.2}s infinite` }} />)}</div></div>}
          <div ref={bottomRef} />
        </div>

        <div style={{ borderTop: '1px solid var(--border-dark)', padding: 'var(--s4) 0 var(--s5)', flexShrink: 0 }}>
          <Waveform volume={voice.volume} active={voice.isListening} color={voice.isSpeaking ? 'var(--violet)' : 'var(--blue-bright)'} />
          {(voice.transcript || voice.interimTranscript) && (
            <div style={{ padding: 'var(--s3) var(--s4)', borderRadius: 'var(--r-md)', background: 'var(--card)', border: '1px solid var(--border-dark)', margin: 'var(--s3) 0', maxHeight: 80, overflowY: 'auto' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>{voice.transcript}<span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{voice.interimTranscript}</span></p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'center', alignItems: 'center' }}>
            {voice.isListening ? (
              <button className="btn btn-danger" onClick={() => { voice.stopListening(); stopTimer() }} style={{ padding: '12px 28px', borderRadius: 'var(--r-full)' }}>⏹ Stop Recording</button>
            ) : (
              <button className="btn btn-primary" onClick={() => { voice.startListening(); startTimer() }} disabled={loading || voice.isSpeaking} style={{ padding: '12px 28px', borderRadius: 'var(--r-full)' }}>🎙 Start Speaking</button>
            )}
            <button className="btn btn-primary" onClick={handleSubmitVoice} disabled={loading || (!voice.transcript.trim() && !voice.interimTranscript.trim())} style={{ padding: '12px 28px' }}>
              {loading ? 'Evaluating…' : 'Submit Answer'}
            </button>
          </div>
          {voice.isSpeaking && <p style={{ fontSize: '0.75rem', color: 'var(--violet)', textAlign: 'center', marginTop: 'var(--s2)' }}>AI is speaking…</p>}
        </div>
      </div>
    </div>
  )
}
