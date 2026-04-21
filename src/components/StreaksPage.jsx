import { useApp } from '../context/AppContext'
import { BADGES, TIERS, calcStreak } from '../data/recommendations'
import { PageShell, SectionHeader, ScoreCircle } from './UI'

export function StreaksPage({ onStartCheckin }) {
  const { history } = useApp()
  const streak = calcStreak(history)
  const earned = BADGES.filter(b => b.condition(history))
  const locked = BADGES.filter(b => !b.condition(history))
  const totalCheckins = history.length

  // Streak milestone target
  const nextMilestone = [3,7,14,30,60,90,180,365].find(n => n > streak) || 365
  const streakPct = Math.min((streak / nextMilestone) * 100, 100)

  return (
    <PageShell>
      <SectionHeader
        icon="🔥"
        title="Streaks & Achievements"
        subtitle="Build healthy check-in habits"
      />

      {/* Streak Hero */}
      <div className="card" style={{ textAlign: 'center', padding: '32px 20px', marginBottom: 16, background: streak > 0 ? 'linear-gradient(135deg, #FF6B35, #E07B3A)' : 'var(--cream2)', border: 'none' }}>
        <p style={{ fontSize: 56, marginBottom: 8 }}>{streak > 0 ? '🔥' : '🌱'}</p>
        <p style={{ fontSize: 52, fontWeight: 700, fontFamily: "'Lora', serif", color: streak > 0 ? '#fff' : 'var(--text)' }}>{streak}</p>
        <p style={{ fontSize: 16, fontWeight: 600, color: streak > 0 ? 'rgba(255,255,255,.85)' : 'var(--muted)', marginTop: 4 }}>
          {streak === 0 ? 'No active streak' : streak === 1 ? 'day streak 🎉' : 'day streak!'}
        </p>
        {streak > 0 && (
          <div style={{ marginTop: 20, background: 'rgba(255,255,255,.2)', borderRadius: 8, padding: '10px 16px' }}>
            <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 12, marginBottom: 8 }}>
              Next milestone: <strong style={{ color: '#fff' }}>{nextMilestone} days</strong>
            </p>
            <div style={{ height: 6, background: 'rgba(255,255,255,.25)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${streakPct}%`, background: '#fff', borderRadius: 4, transition: 'width .5s ease' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 11, marginTop: 6 }}>{streak} / {nextMilestone} days</p>
          </div>
        )}
        {streak === 0 && (
          <button className="btn-primary" onClick={onStartCheckin} style={{ marginTop: 16 }}>
            Start Your Streak →
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[
          { icon: '📊', label: 'Total Check-ins', value: totalCheckins },
          { icon: '🏅', label: 'Badges Earned', value: earned.length },
          { icon: '🎯', label: 'Badges to Go', value: locked.length },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <p style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)', fontFamily: "'Lora', serif" }}>{s.value}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Earned Badges */}
      {earned.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <SectionHeader icon="🏆" title="Earned Badges" subtitle={`${earned.length} unlocked`} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {earned.map(b => (
              <div key={b.id} style={{ textAlign: 'center', padding: '16px 10px', background: 'var(--green-pale)', borderRadius: 12, border: '1.5px solid var(--green-pale2)' }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>{b.emoji}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>{b.label}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <SectionHeader icon="🔒" title="Locked Badges" subtitle="Keep checking in to unlock" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {locked.map(b => (
              <div key={b.id} style={{ textAlign: 'center', padding: '16px 10px', background: 'var(--cream2)', borderRadius: 12, border: '1.5px solid var(--border)', opacity: .65 }}>
                <p style={{ fontSize: 32, filter: 'grayscale(1)', marginBottom: 8 }}>{b.emoji}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>{b.label}</p>
                <p style={{ fontSize: 11, color: 'var(--muted2)', lineHeight: 1.4 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Heat-map */}
      {history.length > 0 && <WeeklyCalendar history={history} />}
    </PageShell>
  )
}

function WeeklyCalendar({ history }) {
  const weeks = 12
  const days = weeks * 7
  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const ds = d.toISOString().split('T')[0]
    const entry = history.find(h => h.date === ds)
    return { date: ds, score: entry ? entry.score : null, day: d.getDay() }
  })

  const getColor = (score) => {
    if (score === null) return '#EDE9E3'
    if (score >= 70) return '#1B5E3B'
    if (score >= 50) return '#4A9E6B'
    if (score >= 35) return '#E07B3A'
    if (score >= 15) return '#C0392B'
    return '#922B21'
  }

  return (
    <div className="card">
      <SectionHeader icon="📅" title="12-Week Activity" subtitle="Daily check-in history" />
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {cells.map((c, i) => (
          <div
            key={i}
            title={c.score !== null ? `${c.date}: Score ${c.score}` : c.date}
            style={{
              width: 14, height: 14, borderRadius: 3,
              background: getColor(c.score),
              cursor: c.score ? 'pointer' : 'default',
              transition: 'transform .1s',
            }}
            onMouseEnter={e => { if (c.score) e.target.style.transform = 'scale(1.3)' }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)' }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>Less</span>
        {[null, 15, 35, 50, 70].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: getColor(s ?? null) }} />
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>{s === null ? 'None' : `${s}+`}</span>
          </div>
        ))}
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>More</span>
      </div>
    </div>
  )
}
