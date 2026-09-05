import React from 'react'
import { PageShell } from './UI'
import { Matrix } from './Dashboard'

function quadrant(x, y) {
  if (y >= 50 && x < 50) return { label: 'Thriving', tone: 'green' }
  if (y >= 50 && x >= 50) return { label: 'Managing Well', tone: 'blue' }
  if (y < 50 && x < 50) return { label: 'Struggling', tone: 'red' }
  return { label: 'At Risk', tone: 'amber' }
}

function RecommendationCard({ platform, index }) {
  const accents = ['#EEF8F3', '#F1EEFF', '#FFF3E8', '#EEF8F8']
  return (
    <div className="recommendation-card" style={{ background: accents[index % accents.length] }}>
      <div className="recommendation-icon">{index === 0 ? '◌' : index === 1 ? '☾' : index === 2 ? '◉' : '✦'}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4>{platform.name}</h4>
        <p>{platform.prop || 'A personalized resource selected from your latest check-in.'}</p>
        {platform.url && platform.url !== '#' && (
          <a href={platform.url} target="_blank" rel="noreferrer">Explore →</a>
        )}
      </div>
    </div>
  )
}

export function ResultsScreen({ result, onDashboard, onRetake }) {
  const checkin = result?.checkin || result || {}
  const recommendations = result?.recommendations || []
  const x = Math.round(Number(checkin.x_score_norm ?? 0))
  const y = Math.round(Number(checkin.y_score_norm ?? 0))
  const position = quadrant(x, y)
  const isCrisis = Boolean(checkin.suicidality_flag)

  return (
    <PageShell style={{ maxWidth: 980 }}>
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">YOUR CHECK-IN RESULT</p>
          <h1>Your latest position</h1>
          <p>Here's where your latest check-in places you on the Countor wellness matrix.</p>
        </div>
        <button className="btn-primary hero-checkin" onClick={onRetake}>＋ Check in again</button>
      </div>

      <section className="snapshot-card fade-in">
        <div className="snapshot-heading">
          <div>
            <p className="eyebrow">YOUR MENTAL WELLNESS SNAPSHOT</p>
            <p className="snapshot-date">Based on your latest check-in · {new Date(checkin.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <span className={`status-pill ${position.tone}`}>{position.label}</span>
        </div>

        <div className="snapshot-content">
          <Matrix x={x} y={y} />
          <div className="score-stack">
            <div className="score-card wellness-score">
              <span>● Wellness (Y)</span>
              <strong>{y}</strong><small>/100</small>
              <p>Higher scores indicate stronger positive wellbeing.</p>
            </div>
            <div className="score-card distress-score">
              <span>● Distress (X)</span>
              <strong>{x}</strong><small>/100</small>
              <p>Lower scores indicate less psychological distress.</p>
            </div>
          </div>
        </div>

        <div className="snapshot-footer">
          <span><strong>{position.label}</strong> · Your current position on the Countor matrix</span>
          <button className="btn-outline" onClick={onRetake}>Check in again</button>
        </div>
      </section>

      {isCrisis && (
        <div style={{ background: '#FFF0F0', border: '1px solid #FFCDCD', padding: 20, borderRadius: 12, marginBottom: 24, textAlign: 'center' }}>
          <h3 style={{ color: '#D32F2F', marginBottom: 8 }}>Emergency Support</h3>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
            Based on your check-in, you may be experiencing significant distress. Consider connecting with a trained support listener.
          </p>
          <a href="tel:9820466726" style={{ display: 'inline-block', marginTop: 12, padding: '10px 20px', background: '#D32F2F', color: '#FFF', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
            Call AASRA Crisis Helpline: 9820466726
          </a>
        </div>
      )}

      <section style={{ marginBottom: 24 }}>
        <div className="section-header">
          <div>
            <h3>Recommended for you</h3>
            <p>Personalized resources matched to your latest position</p>
          </div>
        </div>
        <div className="recommendation-scroll">
          {recommendations.length > 0 ? recommendations.slice(0, 4).map((p, i) => (
            <RecommendationCard key={p.id || p.name || i} platform={p} index={i} />
          )) : (
            <div className="card" style={{ padding: 20, width: '100%', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Your personalized resources will appear here after your check-in.</p>
            </div>
          )}
        </div>
      </section>

      <button className="btn-primary" style={{ width: '100%', padding: '14px' }} onClick={onDashboard}>
        Back to Home
      </button>
    </PageShell>
  )
}
