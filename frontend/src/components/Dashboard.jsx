import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useApp } from '../context/AppContext'
import { calcStreak } from '../data/recommendations'
import { PageShell, SectionHeader, EmptyState } from './UI'

function quadrant(x, y) {
  if (y >= 50 && x < 50) return { label: 'Thriving', tone: 'green' }
  if (y >= 50 && x >= 50) return { label: 'Managing Well', tone: 'blue' }
  if (y < 50 && x < 50) return { label: 'Struggling', tone: 'red' }
  return { label: 'At Risk', tone: 'amber' }
}

function Matrix({ x, y, compact = false }) {
  const pos = quadrant(x, y)
  return <div className={`matrix-wrap ${compact ? 'matrix-compact' : ''}`}>
    <div className="matrix-grid" aria-label="Wellness and distress matrix">
      <div className="matrix-zone matrix-thriving"><span>Thriving</span></div><div className="matrix-zone matrix-managing"><span>Managing Well</span></div>
      <div className="matrix-zone matrix-struggling"><span>Struggling</span></div><div className="matrix-zone matrix-risk"><span>At Risk</span></div>
      <div className="matrix-dot" style={{ left: `${Math.min(96, Math.max(4, x))}%`, bottom: `${Math.min(96, Math.max(4, y))}%` }} title={`${pos.label}: Wellness ${y}%, Distress ${x}%`} />
    </div>
    <div className="matrix-y-label">Wellness (Y)</div><div className="matrix-x-label">Distress (X)</div>
    {!compact && <div className="matrix-caption"><span>Low</span><span>High</span></div>}
  </div>
}

function RecommendationCard({ platform, index }) {
  const accents = ['#EEF8F3', '#F1EEFF', '#FFF3E8', '#EEF8F8']
  return <div className="recommendation-card" style={{ background: accents[index % accents.length] }}><div className="recommendation-icon">{index === 0 ? '◌' : index === 1 ? '☾' : index === 2 ? '◉' : '✦'}</div><div style={{ flex: 1, minWidth: 0 }}><h4>{platform.name}</h4><p>{platform.prop || 'A personalized resource selected from your latest check-in.'}</p>{platform.url && platform.url !== '#' && <a href={platform.url} target="_blank" rel="noreferrer">Explore →</a>}</div></div>
}

export function Dashboard({ onStartCheckin, onViewHistory, recommendations = [] }) {
  const { user, history } = useApp(); const streak = calcStreak(history); const today = new Date().toLocaleDateString('en-CA'); const latest = history[history.length - 1]
  const todayEntry = history.find(h => h.date?.substring(0, 10) === today) || latest
  const y = todayEntry ? Math.round(todayEntry.y_score_norm ?? 0) : null; const x = todayEntry ? Math.round(todayEntry.x_score_norm ?? 0) : null
  const position = y !== null && x !== null ? quadrant(x, y) : null
  const trendData = useMemo(() => history.slice(-12).map((h, i) => ({ label: new Date(h.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), wellness: h.y_score_norm ?? null, distress: h.x_score_norm ?? null, key: `${h.date}-${i}` })), [history])
  const improvement = history.length >= 2 ? Math.round((history[history.length - 1].y_score_norm ?? 0) - (history[history.length - 2].y_score_norm ?? 0)) : null

  return <PageShell style={{ maxWidth: 980 }}>
    <div className="dashboard-hero"><div><p className="eyebrow">YOUR WELLNESS JOURNEY</p><h1>{new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {user?.name?.split(' ')[0]} <span aria-hidden="true">👋</span></h1><p>Understand how you're feeling and take a step forward.</p></div><button className="btn-primary hero-checkin" onClick={onStartCheckin}>＋ New Check-in</button></div>
    {todayEntry ? <section className="snapshot-card fade-in"><div className="snapshot-heading"><div><p className="eyebrow">YOUR MENTAL WELLNESS SNAPSHOT</p><p className="snapshot-date">Based on your latest check-in · {new Date(todayEntry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div><span className={`status-pill ${position.tone}`}>{position.label}</span></div><div className="snapshot-content"><Matrix x={x} y={y}/><div className="score-stack"><div className="score-card wellness-score"><span>● Wellness (Y)</span><strong>{y}</strong><small>/100</small><p>Higher scores indicate stronger positive wellbeing.</p></div><div className="score-card distress-score"><span>● Distress (X)</span><strong>{x}</strong><small>/100</small><p>Lower scores indicate less psychological distress.</p></div></div></div><div className="snapshot-footer"><span><strong>{position.label}</strong> · Your current position on the Countor matrix</span><button className="btn-outline" onClick={onStartCheckin}>Check in again</button></div></section> : <section className="empty-hero card fade-in"><div className="empty-hero-icon">✦</div><p className="eyebrow">START YOUR JOURNEY</p><h2>Your first check-in is waiting.</h2><p>Speak naturally or use the questionnaire to map your wellbeing and distress on the Countor 2D matrix.</p><button className="btn-primary" onClick={onStartCheckin}>＋ Start Today's Check-in</button></section>}
    <div className="dashboard-stat-grid"><div className="mini-stat"><span>🔥</span><div><small>CHECK-IN STREAK</small><strong>{streak}</strong><em>{streak === 1 ? 'day' : 'days'}</em></div></div><div className="mini-stat"><span>◷</span><div><small>TOTAL CHECK-INS</small><strong>{history.length}</strong><em>completed</em></div></div><div className="mini-stat"><span>↗</span><div><small>LATEST CHANGE</small><strong>{improvement === null ? '—' : `${improvement > 0 ? '+' : ''}${improvement}`}</strong><em>{improvement === null ? 'need 2 check-ins' : 'wellness points'}</em></div></div></div>
    {recommendations.length > 0 && <section style={{ marginBottom: 24 }}><SectionHeader title="Recommended for you" subtitle="Personalized from your latest check-in" action={<button className="section-link section-action" onClick={onViewHistory}>View history →</button>}/><div className="recommendation-scroll">{recommendations.slice(0, 4).map((p, i) => <RecommendationCard key={p.id || p.name || i} platform={p} index={i}/>)}</div></section>}
    {history.length > 1 && <section className="card analytics-card"><SectionHeader title="Your progress" subtitle="See how your wellbeing and distress have moved"/><div style={{ width: '100%', height: 230 }}><ResponsiveContainer><AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}><defs><linearGradient id="countorWellness" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7565E8" stopOpacity={0.18}/><stop offset="95%" stopColor="#7565E8" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#ECEAF7" vertical={false}/><XAxis dataKey="label" tick={{fontSize:10,fill:'#7B7890'}} tickLine={false} axisLine={false}/><YAxis domain={[0,100]} ticks={[0,25,50,75,100]} tick={{fontSize:10,fill:'#7B7890'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{borderRadius:12,border:'1px solid #E6E3F3',boxShadow:'0 8px 24px rgba(30,25,70,.08)'}} formatter={(v,name)=>[`${v}%`,name==='wellness'?'Wellness':'Distress']}/><Area type="monotone" dataKey="wellness" stroke="#7565E8" strokeWidth={2.5} fill="url(#countorWellness)"/><Area type="monotone" dataKey="distress" stroke="#E07B3A" strokeWidth={2} fill="none"/></AreaChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="legend-dot wellness-dot"/> Wellness</span><span><i className="legend-dot distress-dot"/> Distress</span></div></section>}
    <section className="card journey-card"><SectionHeader title="Your journey" subtitle="Progress is built one check-in at a time"/><div className="journey-progress"><div style={{ width: `${Math.min(100, history.length * 5)}%` }}/></div><div className="journey-meta"><strong>{history.length} check-in{history.length === 1 ? '' : 's'}</strong><span>{Math.min(100, history.length * 5)}% journey progress</span></div></section>
    {history.length > 0 ? <section className="card"><SectionHeader title="Recent check-ins" subtitle={`${history.length} total check-in${history.length === 1 ? '' : 's'}`} action={<button className="section-link section-action" onClick={onViewHistory}>View history →</button>}/><div className="recent-list">{[...history].reverse().slice(0,5).map((h,i)=><div className="recent-row" key={`${h.date}-${i}`}><div className="recent-badge">{Math.round(h.y_score_norm ?? 0)}</div><div style={{flex:1,minWidth:0}}><strong>{new Date(h.date).toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})}</strong><small>{h.mode === 'voice' ? 'Voice check-in' : 'Questionnaire'} · Distress {Math.round(h.x_score_norm ?? 0)}%</small></div><span className="recent-arrow">›</span></div>)}</div></section> : <div className="card"><EmptyState emoji="🌱" title="Start your wellness journey" desc="Complete a check-in to see your scores, movement and personalized recommendations."/></div>}
  </PageShell>
}
export { Matrix }
