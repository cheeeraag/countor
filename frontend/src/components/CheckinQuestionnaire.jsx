import { useState } from 'react'
import { QUESTIONS, OPTIONS_5, OPTIONS_3 } from '../data/recommendations'

export function CheckinQuestionnaire({ onComplete, onBack }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)

  const q = QUESTIONS[current]
  const total = QUESTIONS.length
  const pct = Math.round(((current) / total) * 100)
  const isLast = current === total - 1
  const currentOptions = q.scale === 5 ? OPTIONS_5 : OPTIONS_3

  const choose = (val) => setSelected(val)

  const next = () => {
    if (selected === null && answers[q.id] === undefined) return
    const val = selected !== null ? selected : answers[q.id]
    const newAnswers = { ...answers, [q.id]: val }
    setAnswers(newAnswers)
    setSelected(null)
    if (isLast) onComplete(newAnswers)
    else setCurrent(c => c + 1)
  }

  const back = () => {
    if (current === 0) { onBack(); return }
    setCurrent(c => c - 1)
    setSelected(answers[QUESTIONS[current - 1].id] ?? null)
  }

  const effectiveSelected = selected !== null ? selected : (answers[q.id] !== undefined ? answers[q.id] : null)

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'var(--white)', borderBottom:'1px solid var(--border)', padding:'14px 20px', display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
        <button className="btn-ghost" onClick={back} style={{ fontSize:18, padding:'6px 10px' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase' }}>{q.sectionIcon} {q.section}</span>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--muted)' }}>{current + 1} / {total}</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width:`${pct + (1 / total) * 100}%` }} /></div>
        </div>
      </div>

      <div style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 16px 120px' }}>
        <div style={{ width:'100%', maxWidth:560 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:q.sectionColor + '18', color:q.sectionColor, padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, textTransform:'uppercase', marginBottom:20 }}>
            <span>{q.sectionIcon}</span> {q.section} · {q.source}
          </div>
          <h2 className="fade-in" key={q.id} style={{ fontSize:20, fontFamily:"'Lora', serif", fontWeight:600, color:'var(--text)', lineHeight:1.55, marginBottom:32 }}>{q.text}</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {currentOptions.map(opt => {
              const isChosen = effectiveSelected === opt.value
              return (
                <button key={opt.value} onClick={() => choose(opt.value)} style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px', background:isChosen ? '#E8F5EE' : 'var(--white)', border:`2px solid ${isChosen ? 'var(--green)' : 'var(--border)'}`, borderRadius:12, cursor:'pointer', textAlign:'left', width:'100%' }}>
                  <span style={{ fontSize:22 }}>{opt.emoji}</span>
                  <div style={{ flex:1 }}><p style={{ fontSize:15, fontWeight:isChosen ? 700 : 600, color:isChosen ? 'var(--green)' : 'var(--text)', marginBottom:0 }}>{opt.label}</p></div>
                  <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:12, background:isChosen ? 'var(--green)' : 'var(--cream2)', color:isChosen ? '#fff' : 'var(--muted)' }}>{opt.value} pts</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'var(--white)', borderTop:'1px solid var(--border)', padding:'16px 20px', display:'flex', justifyContent:'center' }}>
        <div style={{ width:'100%', maxWidth:560, display:'flex', gap:12 }}>
          <button className="btn-outline" onClick={back} style={{ padding:'13px 20px' }}>← Back</button>
          <button className="btn-primary" onClick={next} disabled={effectiveSelected === null} style={{ flex:1, padding:'13px', justifyContent:'center', fontSize:15, opacity:effectiveSelected === null ? 0.45 : 1 }}>
            {isLast ? 'Complete Assessment' : 'Next Question →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function QuestionnaireIntro({ onStart, onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ maxWidth:520, width:'100%' }}>
        <button className="btn-ghost" onClick={onBack} style={{ marginBottom:24, fontSize:14 }}>← Back</button>
        <div className="card" style={{ padding:32 }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <p style={{ fontSize:48, marginBottom:12 }}>📋</p>
            <h1 style={{ fontSize:24, fontFamily:"'Lora', serif", marginBottom:8 }}>Questionnaire Check-in</h1>
            <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.7 }}>
              A 30-question screening assessment using the <strong>MHC-SF</strong> (wellbeing) and <strong>PHQ-ADS</strong> (distress) frameworks.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28 }}>
            {[
              { icon:'⏱', title:'Takes about 3 minutes', desc:'30 questions, one at a time' },
              { icon:'🔒', title:'Private check-in', desc:'Your responses are used to calculate your 2D position' },
              { icon:'📊', title:'2D assessment', desc:'Maps wellbeing and psychological distress separately' },
            ].map(item => (
              <div key={item.icon} style={{ display:'flex', gap:14, padding:'12px 16px', background:'var(--cream)', borderRadius:10 }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{item.icon}</span>
                <div><p style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{item.title}</p><p style={{ fontSize:12, color:'var(--muted)' }}>{item.desc}</p></div>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={onStart} style={{ width:'100%', padding:14, fontSize:16, justifyContent:'center' }}>Begin Questionnaire →</button>
        </div>
      </div>
    </div>
  )
}
