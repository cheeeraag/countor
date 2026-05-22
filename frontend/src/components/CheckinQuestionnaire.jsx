import { useState } from 'react'
import { QUESTIONS, OPTIONS, calculateScore } from '../data/recommendations'

// ─── Main Questionnaire Component ─────────────────────────────────────────────
export function CheckinQuestionnaire({ onComplete, onBack }) {
  const [current,  setCurrent]  = useState(0)
  const [answers,  setAnswers]  = useState({})
  const [selected, setSelected] = useState(null) // temp highlight for current Q

  const q       = QUESTIONS[current]
  const total   = QUESTIONS.length
  const pct     = Math.round(((current) / total) * 100)
  const isLast  = current === total - 1
  const answered = answers[q.id] !== undefined

  const choose = (val) => {
    setSelected(val)
  }

  const next = () => {
    if (selected === null && answers[q.id] === undefined) return
    const val = selected !== null ? selected : answers[q.id]
    const newAnswers = { ...answers, [q.id]: val }
    setAnswers(newAnswers)
    setSelected(null)

    if (isLast) {
      // All done — calculate and submit
      const result = calculateScore(newAnswers)
      onComplete(result, newAnswers)
    } else {
      setCurrent(c => c + 1)
    }
  }

  const back = () => {
    if (current === 0) { onBack(); return }
    setCurrent(c => c - 1)
    setSelected(answers[QUESTIONS[current - 1].id] ?? null)
  }

  // Pre-fill selection when navigating back
  const effectiveSelected = selected !== null ? selected : (answers[q.id] !== undefined ? answers[q.id] : null)

  // Section change detection
  const prevSection = current > 0 ? QUESTIONS[current - 1].section : null
  const sectionChanged = q.section !== prevSection

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
        <button className="btn-ghost" onClick={back} style={{ fontSize: 18, padding: '6px 10px' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5 }}>
              {q.sectionIcon} {q.section}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>
              {current + 1} / {total}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct + (1 / total) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px 120px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          {/* Section pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: q.sectionColor + '18', color: q.sectionColor, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 20 }}>
            <span>{q.sectionIcon}</span>
            {q.section} · {q.source}
          </div>

          {/* Question */}
          <h2 className="fade-in" key={q.id} style={{ fontSize: 20, fontFamily: "'Lora', serif", fontWeight: 600, color: 'var(--text)', lineHeight: 1.55, marginBottom: 32 }}>
            {q.text}
          </h2>

          {/* Answer options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {OPTIONS.map(opt => {
              const isChosen = effectiveSelected === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => choose(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px',
                    background: isChosen ? '#E8F5EE' : 'var(--white)',
                    border: `2px solid ${isChosen ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all .15s',
                    textAlign: 'left',
                    width: '100%',
                    boxShadow: isChosen ? '0 0 0 3px rgba(27,94,59,.1)' : 'var(--shadow-sm)',
                  }}
                >
                  {/* Radio dot */}
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${isChosen ? 'var(--green)' : 'var(--border)'}`,
                    background: isChosen ? 'var(--green)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}>
                    {isChosen && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                  </div>

                  {/* Emoji indicator */}
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{opt.emoji}</span>

                  {/* Label + score */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: isChosen ? 700 : 600, color: isChosen ? 'var(--green)' : 'var(--text)', marginBottom: 0 }}>
                      {opt.label}
                    </p>
                  </div>

                  {/* Score badge */}
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                    background: isChosen ? 'var(--green)' : 'var(--cream2)',
                    color: isChosen ? '#fff' : 'var(--muted)',
                    flexShrink: 0,
                    transition: 'all .15s',
                  }}>
                    {opt.value} pts
                  </span>
                </button>
              )
            })}
          </div>

          {/* Source note */}
          <p style={{ fontSize: 11, color: 'var(--muted2)', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
            Based on validated {q.source} clinical screening tool
          </p>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--white)', borderTop: '1px solid var(--border)', padding: '16px 20px', display: 'flex', gap: 12, justifyContent: 'center', boxShadow: '0 -4px 16px rgba(0,0,0,.06)' }}>
        <div style={{ width: '100%', maxWidth: 560, display: 'flex', gap: 12 }}>
          <button
            className="btn-outline"
            onClick={back}
            style={{ padding: '13px 20px', flexShrink: 0 }}
          >
            ← Back
          </button>
          <button
            className="btn-primary"
            onClick={next}
            disabled={effectiveSelected === null}
            style={{
              flex: 1, padding: '13px', justifyContent: 'center', fontSize: 15,
              opacity: effectiveSelected === null ? .45 : 1,
              cursor: effectiveSelected === null ? 'not-allowed' : 'pointer',
            }}
          >
            {isLast ? '✅ See My Results' : 'Next Question →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Intro Screen ─────────────────────────────────────────────────────────────
export function QuestionnaireIntro({ onStart, onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 24, fontSize: 14 }}>← Back</button>

        <div className="card" style={{ padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>📋</p>
            <h1 style={{ fontSize: 24, fontFamily: "'Lora', serif", marginBottom: 8 }}>Mental Wellness Check-in</h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>
              A structured self-assessment based on <strong>PHQ-9</strong> (depression) and <strong>GAD-7</strong> (anxiety) — two of the most widely used clinical screening tools globally.
            </p>
          </div>

          {/* What to expect */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {[
              { icon: '⏱', title: '2–3 minutes', desc: '10 validated questions, one at a time' },
              { icon: '🔒', title: 'Completely private', desc: 'Your answers stay on your device' },
              { icon: '📊', title: 'Scored instantly', desc: 'No waiting — results the moment you finish' },
              { icon: '🎯', title: 'Personalised actions', desc: 'Recommendations based on your score' },
            ].map(item => (
              <div key={item.icon} style={{ display: 'flex', gap: 14, padding: '12px 16px', background: 'var(--cream)', borderRadius: 10 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--amber-pale)', border: '1px solid #F5C9A0', borderRadius: 10, padding: '12px 16px', marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: '#7A4010', lineHeight: 1.6 }}>
              ⚠️ <strong>Important:</strong> This is a screening tool, not a diagnosis. Your results indicate whether you should consider professional support. If you are in crisis, call <strong>iCall: 9152987821</strong>.
            </p>
          </div>

          <button className="btn-primary" onClick={onStart} style={{ width: '100%', padding: '14px', fontSize: 16, justifyContent: 'center' }}>
            Begin Assessment →
          </button>
        </div>
      </div>
    </div>
  )
}
