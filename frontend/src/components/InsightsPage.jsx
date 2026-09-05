import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext'
import { PageShell, SectionHeader } from './UI'

function position(x, y) { if (y >= 50 && x < 50) return 'Thriving'; if (y >= 50 && x >= 50) return 'Managing Well'; if (y < 50 && x < 50) return 'Struggling'; return 'At Risk' }

function InsightRecommendation({ platform, index }) {
  const icons = ['◌', '☾', '◉']
  return <div className="recommendation-card insight-recommendation"><div className="recommendation-icon">{icons[index % icons.length]}</div><div style={{ flex: 1, minWidth: 0 }}><h4>{platform.name}</h4><p>{platform.prop || 'A personalized resource selected from your latest Countor position.'}</p>{platform.url && platform.url !== '#' && <a href={platform.url} target="_blank" rel="noreferrer">Explore →</a>}</div></div>
}

export function InsightsPage() {
  const { history, recommendations } = useApp()
  const data = useMemo(() => history.slice(-12).map((h, i) => ({ label: new Date(h.date).toLocaleDateString('en-IN', { month:'short', day:'numeric' }), wellness: Math.round(h.y_score_norm ?? 0), distress: Math.round(h.x_score_norm ?? 0), key: `${h.date}-${i}` })), [history])
  const latest = history[history.length - 1]
  const previous = history.length > 1 ? history[history.length - 2] : null
  const wellnessChange = previous && latest ? Math.round((latest.y_score_norm ?? 0) - (previous.y_score_norm ?? 0)) : null
  const distressChange = previous && latest ? Math.round((latest.x_score_norm ?? 0) - (previous.x_score_norm ?? 0)) : null
  const latestPosition = latest ? position(latest.x_score_norm ?? 0, latest.y_score_norm ?? 0) : null

  if (!latest) return <PageShell><div className="empty-hero card"><div className="empty-hero-icon">✦</div><p className="eyebrow">YOUR INSIGHTS</p><h2>Your story starts with a check-in.</h2><p>Complete your first check-in to see your Wellness × Distress trends and personalized resources.</p></div></PageShell>

  return <PageShell>
    <div className="dashboard-hero"><div><p className="eyebrow">PERSONAL INSIGHTS</p><h1>Your progress</h1><p>See how your Countor position has changed over time.</p></div></div>
    <section className="card" style={{ marginBottom:18 }}><SectionHeader title="Wellness & distress trend" subtitle="Your latest check-ins"/><div style={{ width:'100%', height:260 }}><ResponsiveContainer><LineChart data={data} margin={{top:8,right:8,left:-18,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#ECEAF7" vertical={false}/><XAxis dataKey="label" tick={{fontSize:10,fill:'#77758B'}} tickLine={false} axisLine={false}/><YAxis domain={[0,100]} ticks={[0,25,50,75,100]} tick={{fontSize:10,fill:'#77758B'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{borderRadius:12,border:'1px solid #E6E3F1'}} formatter={(v,n)=>[`${v}%`,n==='wellness'?'Wellness':'Distress']}/><Line type="monotone" dataKey="wellness" stroke="#7565E8" strokeWidth={3} dot={{r:3}}/><Line type="monotone" dataKey="distress" stroke="#E07B3A" strokeWidth={2.5} dot={{r:3}}/></LineChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="legend-dot wellness-dot"/> Wellness</span><span><i className="legend-dot distress-dot"/> Distress</span></div></section>
    <section className="card" style={{ marginBottom:18 }}><SectionHeader title="Your current position" subtitle="Based on your latest check-in"/><div className="insight-position"><div><strong>{Math.round(latest.y_score_norm)}%</strong><span>Wellness</span></div><div className="position-arrow">→</div><div><strong>{Math.round(latest.x_score_norm)}%</strong><span>Distress</span></div><div className="status-pill blue">{latestPosition}</div></div></section>
    <div className="dashboard-stat-grid"><div className="mini-stat"><span>↗</span><div><small>WELLNESS CHANGE</small><strong>{wellnessChange === null ? '—' : `${wellnessChange > 0 ? '+' : ''}${wellnessChange}`}</strong><em>vs previous</em></div></div><div className="mini-stat"><span>◌</span><div><small>DISTRESS CHANGE</small><strong>{distressChange === null ? '—' : `${distressChange > 0 ? '+' : ''}${distressChange}`}</strong><em>vs previous</em></div></div><div className="mini-stat"><span>◷</span><div><small>CHECK-INS</small><strong>{history.length}</strong><em>total</em></div></div></div>
    <section className="card insights-recommendations"><SectionHeader title="Recommended for you" subtitle="Resources matched to your latest Wellness × Distress position"/>{recommendations.length ? <div className="recommendation-scroll">{recommendations.slice(0,3).map((p,i)=><InsightRecommendation key={p.id || p.name || i} platform={p} index={i}/>)}</div> : <div className="insight-empty">No personalized resources are available yet. Complete another check-in to refresh your matches.</div>}</section>
    {history.length > 1 && <section className="card"><SectionHeader title="Position history" subtitle="Your movement across the Countor framework"/><div className="position-history-list">{[...history].reverse().slice(0,8).map((h,i)=><div className="position-history-row" key={`${h.date}-${i}`}><div className="position-history-date">{new Date(h.date).toLocaleDateString('en-IN',{month:'short',day:'numeric'})}</div><div><strong>{position(h.x_score_norm??0,h.y_score_norm??0)}</strong><small>Wellness {Math.round(h.y_score_norm??0)}% · Distress {Math.round(h.x_score_norm??0)}%</small></div></div>)}</div></section>}
  </PageShell>
}
