import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { useApp } from '../context/AppContext'
import { calcStreak } from '../data/recommendations'
import { ScoreCircle, PageShell, SectionHeader, EmptyState } from './UI'

export function Dashboard({ onStartCheckin }) {
  const { user, history } = useApp()
  const [period, setPeriod] = useState('week')

  const today      = new Date().toLocaleDateString('en-CA')
  const todayEntry = history.find(h => h.date?.substring(0, 10) === today)
  
  const streak     = calcStreak(history)
  const hour       = new Date().getHours()
  const greeting   = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const getAvg = (days) => {
    const cut = new Date(); cut.setDate(cut.getDate() - days)
    const sl  = history.filter(h => new Date(h.date) >= cut)
    return sl.length ? Math.round(sl.reduce((s, h) => s + (h.y_score_norm ?? 0), 0) / sl.length) : null
  }

  const chartData = () => {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i))
      const ds = d.toLocaleDateString('en-CA')
      const e  = history.find(h => h.date?.substring(0, 10) === ds)
      
      return {
        label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        score: e ? (e.y_score_norm ?? null) : null,
      }
    })
  }

  const weekAvg  = getAvg(7)
  const monthAvg = getAvg(30)
  const todayWellbeing = todayEntry ? (todayEntry.y_score_norm ?? 0) : null
  const todayDistress  = todayEntry ? (todayEntry.x_score_norm ?? 0) : null

  return (
    <PageShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>
          {greeting}, {user?.name?.split(' ')[0]} {streak > 0 ? '🔥' : '👋'}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {todayEntry ? (
        <div className="card fade-in" style={{
          background: 'linear-gradient(135deg, #1B5E3B 0%, #2D7A50 100%)',
          border: 'none', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 20,
          flexWrap: 'wrap', padding: 24,
        }}>
          <ScoreCircle score={todayWellbeing} size={90} />
          <div style={{ flex: 1 }}>
            <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase' }}>
              Well-being Index
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <span style={{ color: '#fff', fontSize: 24, fontWeight: 700, fontFamily: "'Lora',serif" }}>
                {todayWellbeing}%
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <span style={{ color: '#FFCDCD', fontSize: 12, fontWeight: 600 }}>
                Distress Index: {todayDistress}%
              </span>
            </div>
          </div>
          <button
            className="btn-outline"
            onClick={onStartCheckin}
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)', whiteSpace: 'nowrap' }}
          >
            Retake Assessment
          </button>
        </div>
      ) : (
        <div className="card fade-in" style={{
          background: 'var(--green-pale)', border: '1.5px dashed var(--green-light)',
          textAlign: 'center', padding: '36px 20px', marginBottom: 20,
        }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>📋</p>
          <h2 style={{ fontSize: 18, marginBottom: 8, color: 'var(--green)' }}>No assessment today</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20, maxWidth: 340, margin: '0 auto 20px' }}>
            Take the 2D matrix check-in to map your well-being and distress levels.
          </p>
          <button className="btn-primary" onClick={onStartCheckin} style={{ fontSize: 15, padding: '13px 28px' }}>
            Start Today's Check-in →
          </button>
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[
          { label: '7-day Well-being', value: weekAvg  ? `${weekAvg}%`  : '—', icon: '📅', sub: 'past week' },
          { label: '30-day Well-being', value: monthAvg ? `${monthAvg}%` : '—', icon: '📆', sub: 'past month' },
          { label: 'Check-in streak',   value: streak,                              icon: '🔥', sub: streak === 1 ? 'day' : 'days in a row' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <p style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>
              {s.label}
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)', fontFamily: "'Lora',serif" }}>{s.value}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Lora',serif", fontSize: 16, fontWeight: 600 }}>📈 Well-being Trend</h3>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['week','7D'],['month','30D'],['quarter','90D']].map(([p,l]) => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', border: '1px solid var(--border)',
                  background: period === p ? 'var(--green)' : 'transparent',
                  color:      period === p ? '#fff' : 'var(--muted)',
                }}>{l}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData()} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1B5E3B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1B5E3B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EE" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B8069' }} tickLine={false} axisLine={false} interval={period === 'week' ? 0 : period === 'month' ? 6 : 13} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B8069' }} tickLine={false} axisLine={false} ticks={[0, 25, 50, 75, 100]} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #DCE8DC', borderRadius: 10, fontSize: 13 }} formatter={v => v ? [`${v}%`, 'Well-being'] : ['No data', 'Well-being']} />
              <Area type="monotone" dataKey="score" stroke="#1B5E3B" strokeWidth={2} fill="url(#gScore)" connectNulls={false} dot={{ fill: '#1B5E3B', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {history.length > 0 ? (
        <div className="card">
          <SectionHeader icon="🗓" title="Recent Check-ins" subtitle={`${history.length} total entr${history.length === 1 ? 'y' : 'ies'}`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...history].reverse().slice(0, 7).map(h => (
                <div key={h.date} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--cream)', borderRadius: 10 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)', fontFamily: "'Lora',serif" }}>{h.y_score_norm}%</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                      {new Date(h.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--muted)' }}>Distress: {h.x_score_norm}%</p>
                  </div>
                </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <EmptyState emoji="📭" title="No history yet" desc="Complete your first check-in to start tracking your wellness journey." />
        </div>
      )}
    </PageShell>
  )
}
