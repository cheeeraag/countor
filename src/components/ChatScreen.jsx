import { useState, useEffect, useRef } from 'react'
import { callClaude, parseResult } from '../utils/api'
import { Spinner } from './UI'

export function ChatScreen({ onComplete, onBack }) {
  const [msgs,      setMsgs]      = useState([])
  const [input,     setInput]     = useState('')
  const [typing,    setTyping]    = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [started,   setStarted]   = useState(false)
  const endRef  = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, typing])

  useEffect(() => { if (!started) { setStarted(true); initChat() } }, [])

  const initChat = async () => {
    setTyping(true)
    try {
      const reply = await callClaude([{ role: 'user', content: 'START_CHECKIN' }])
      setMsgs([{ role: 'bot', text: reply, id: Date.now() }])
    } catch {
      setMsgs([{
        role: 'bot',
        text: "Hi there! 👋 I'm Countor, your wellness check-in buddy.\n\nI'll ask you 10 questions to get a sense of how you're doing — it only takes 3–4 minutes. Ready?\n\nFirst up — how would you describe your overall mood today? What's the general vibe?",
        id: Date.now(),
      }])
    }
    setTyping(false)
    setTimeout(() => inputRef.current?.focus(), 300)
  }

  const send = async () => {
    if (!input.trim() || typing) return
    const txt = input.trim()
    setInput('')
    const newCount = userCount + 1
    setUserCount(newCount)
    const newMsgs = [...msgs, { role: 'user', text: txt, id: Date.now() }]
    setMsgs(newMsgs)
    setTyping(true)

    try {
      // Build API messages from chat history
      const apiMsgs = []
      newMsgs.forEach((m, i) => {
        if (i === 0 && m.role === 'bot') {
          apiMsgs.push({ role: 'user', content: 'START_CHECKIN' })
          apiMsgs.push({ role: 'assistant', content: m.text })
        } else if (m.role === 'user') {
          apiMsgs.push({ role: 'user', content: m.text })
        } else if (m.role === 'bot') {
          apiMsgs.push({ role: 'assistant', content: m.text })
        }
      })

      // After 10 user messages, nudge for final JSON
      if (newCount >= 10) {
        apiMsgs.push({ role: 'user', content: '(Please provide your final JSON assessment now)' })
      }

      const reply = await callClaude(apiMsgs)
      const result = parseResult(reply)

      if (result) {
        setMsgs(prev => [...prev, {
          role: 'bot',
          text: '✨ That covers all 10 questions! Give me a moment to put together your wellness snapshot...',
          id: Date.now(),
        }])
        setTyping(false)
        setTimeout(() => onComplete(result), 2000)
        return
      }

      setMsgs(prev => [...prev, { role: 'bot', text: reply, id: Date.now() }])
    } catch (e) {
      setMsgs(prev => [...prev, {
        role: 'bot',
        text: "Oops, I had a small hiccup! Could you say that again? I'm here and listening 💚",
        id: Date.now(),
      }])
    }

    setTyping(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const progress = Math.min(userCount / 10, 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'var(--white)', borderBottom: '1px solid var(--border)',
        padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <button className="btn-ghost" onClick={onBack} style={{ fontSize: 18, padding: '6px 10px' }}>←</button>
        <div style={{ width: 38, height: 38, background: 'var(--green)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🧠</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Countor Check-in</p>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            Question {Math.min(userCount + 1, 10)} of 10
          </p>
        </div>
        <div style={{ width: 100 }}>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', marginTop: 3 }}>
            {Math.round(progress * 100)}%
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--cream)', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        {msgs.map(m => (
          <div
            key={m.id}
            className="fade-in"
            style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-end' }}
          >
            {m.role === 'bot' && (
              <div style={{ width: 32, height: 32, background: 'var(--green)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🧠</div>
            )}
            <div style={{
              maxWidth: '74%',
              padding: '12px 16px',
              borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: m.role === 'user' ? 'var(--green)' : 'var(--white)',
              color: m.role === 'user' ? '#fff' : 'var(--text)',
              fontSize: 14, lineHeight: 1.65,
              border: m.role === 'bot' ? '1px solid var(--border)' : 'none',
              whiteSpace: 'pre-wrap',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="fade-in" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ width: 32, height: 32, background: 'var(--green)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🧠</div>
            <div style={{ padding: '12px 18px', background: 'var(--white)', borderRadius: '14px 14px 14px 4px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', padding: '12px 16px', display: 'flex', gap: 10, maxWidth: 680, margin: '0 auto', width: '100%' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Type your response..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={typing}
          style={{ flex: 1, borderRadius: 24, padding: '10px 18px', fontSize: 14 }}
        />
        <button
          onClick={send}
          disabled={typing || !input.trim()}
          style={{
            width: 46, height: 46, borderRadius: 23,
            background: input.trim() && !typing ? 'var(--green)' : 'var(--border)',
            border: 'none', color: '#fff', fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background .2s',
            cursor: input.trim() && !typing ? 'pointer' : 'default',
          }}
        >
          {typing ? <Spinner /> : '→'}
        </button>
      </div>
    </div>
  )
}
