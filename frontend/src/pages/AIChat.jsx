import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { chatAPI } from '../services/api'

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`chat-bubble-row ${isUser ? 'user' : ''}`}>
      {!isUser && (
        <div className="chat-avatar ai-avatar">🤖</div>
      )}
      <div className="chat-bubble-col">
        <div className={`chat-bubble ${isUser ? 'user' : 'assistant'}`}>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.65 }}>{msg.content}</p>
        </div>
      </div>
      {isUser && (
        <div className="chat-avatar user-avatar">👤</div>
      )}
    </div>
  )
}

const SUGGESTIONS = [
  'Explain system design for Twitter',
  'What is the difference between REST and GraphQL?',
  'How do I prepare for behavioral interviews?',
  'Give me 5 Python interview questions',
]

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI interview coach. Ask me anything about interview prep, coding, system design, or career advice. 🚀" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const newMessages = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const history = newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }))
      const res = await chatAPI.sendMessage(msg, history)
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response || res.data.message || 'Sorry, I could not generate a response.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please check your backend and try again.' }])
    } finally { setLoading(false) }
  }

  return (
    <div className="app-shell" style={{ height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--navbar-h))', marginTop: 'var(--navbar-h)' }}>
        {/* Header */}
        <div className="chat-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
            <div className="chat-avatar ai-avatar" style={{ width: 38, height: 38 }}>🤖</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>InterviewIQ AI Coach</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--success)', margin: 0 }}>● Online</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: 'var(--s6)' }}>
          {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
          {loading && (
            <div className="chat-bubble-row">
              <div className="chat-avatar ai-avatar">🤖</div>
              <div className="chat-bubble-col">
                <div className="chat-bubble assistant" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: 'var(--s3) var(--s4)' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', display: 'block', animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div style={{ padding: '0 var(--s6) var(--s4)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} className="suggestion-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-row">
            <textarea
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask anything about interviews, coding, or career…"
              rows={1}
              style={{ resize: 'none', minHeight: 44 }}
            />
            <button className="btn btn-primary chat-send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
