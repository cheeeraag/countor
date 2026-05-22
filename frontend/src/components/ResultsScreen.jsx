import { TIERS, RECOMMENDATIONS } from '../data/recommendations'
import { ScoreCircle, PageShell } from './UI'

export function ResultsScreen({ result, onDashboard, onRetake }) {
  const tier = TIERS[result.tier]    || TIERS.improvement
  const rec  = RECOMMENDATIONS[result.tier] || RECOMMENDATIONS.improvement

  const depLabel = result.depression <= 4  ? 'Minimal'  : result.depression <= 9  ? 'Mild' : result.depression <= 13 ? 'Moderate' : result.depression <= 17 ? 'Mod. Severe' : 'Severe'
  const anxLabel = result.anxiety    <= 4  ? 'Minimal'  : result.anxiety    <= 9  ? 'Mild' : result.anxiety    <= 14 ? 'Moderate'  : 'Severe'

  return (
    <PageShell>
      {/* Hero */}
      <div className="card scale-in" style={{ textAlign:'center', padding:'32px 20px', marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
          <ScoreCircle score={result.score ?? result.wellness} size={130} />
        </div>
        <span className="badge" style={{ background:tier.bg, color:tier.color, fontSize:12, marginBottom:12, display:'inline-flex' }}>
          {tier.emoji} {tier.label}
        </span>
        <h2 style={{ fontSize:22, marginTop:12, marginBottom:8, fontFamily:"'Lora',serif" }}>
          Wellness Score: {result.score ?? result.wellness}/100
        </h2>
        <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7, maxWidth:480, margin:'0 auto' }}>{tier.desc}</p>

        {/* Sub-scores */}
        {result.depression !== undefined && (
          <div className="grid-2" style={{ marginTop:20, gap:10 }}>
            <div style={{ padding:'14px', background:'var(--cream)', borderRadius:12 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>PHQ-9 (Depression)</p>
              <p style={{ fontSize:20, fontWeight:700, color:'var(--text)', fontFamily:"'Lora',serif" }}>{result.depression}<span style={{ fontSize:13, color:'var(--muted)' }}>/18</span></p>
              <p style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{depLabel}</p>
            </div>
            <div style={{ padding:'14px', background:'var(--cream)', borderRadius:12 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>GAD-7 (Anxiety)</p>
              <p style={{ fontSize:20, fontWeight:700, color:'var(--text)', fontFamily:"'Lora',serif" }}>{result.anxiety}<span style={{ fontSize:13, color:'var(--muted)' }}>/12</span></p>
              <p style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{anxLabel}</p>
            </div>
          </div>
        )}
      </div>

      {/* Crisis */}
      {result.tier === 'stage2' && tier.crisis && (
        <div style={{ background:'#FADBD8', border:'1.5px solid #E8A59C', borderRadius:12, padding:'16px 18px', marginBottom:16, display:'flex', gap:14, alignItems:'flex-start' }}>
          <span style={{ fontSize:24 }}>🆘</span>
          <div>
            <p style={{ fontWeight:700, fontSize:15, color:'#922B21', marginBottom:4 }}>Crisis Support Available</p>
            <p style={{ fontSize:13, color:'#922B21', lineHeight:1.6 }}>
              <strong>{tier.crisis.name}: {tier.crisis.contact}</strong> — {tier.crisis.note}.<br />
              You are not alone. Please reach out.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="card fade-in" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ width:40, height:40, background:'var(--green-pale)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🎯</div>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5, marginBottom:3 }}>Recommended approach</p>
            <h3 style={{ fontSize:16, color:'var(--green)', fontFamily:"'Lora',serif" }}>{rec.approach}</h3>
          </div>
        </div>
        <p style={{ color:'var(--muted)', fontSize:13, marginBottom:16, lineHeight:1.7 }}>{rec.approachDesc}</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {rec.actions.map((a, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 14px', background:'var(--cream)', borderRadius:10 }}>
              <span style={{ fontSize:20, lineHeight:1.2, flexShrink:0 }}>{a.icon}</span>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{a.title}</p>
                <p style={{ fontSize:12, color:'var(--muted)' }}>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Companies */}
      <div className="card fade-in" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ width:40, height:40, background:'var(--amber-pale)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>📱</div>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5, marginBottom:3 }}>Recommended platforms</p>
            <h3 style={{ fontSize:16, color:'var(--amber)', fontFamily:"'Lora',serif" }}>Apps and Services for You</h3>
          </div>
        </div>
        <div className="grid-2">
          {rec.companies.map((c, i) => (
            <div key={i} style={{ padding:'12px 14px', background:'var(--cream)', borderRadius:10, border:'1px solid var(--border)' }}>
              <p style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:2 }}>{c.name}</p>
              <p style={{ fontSize:11, color:'var(--muted)' }}>{c.tag}</p>
              <span className="badge badge-gray" style={{ marginTop:6, fontSize:10 }}>{c.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tier scale */}
      <div className="card" style={{ marginBottom:16 }}>
        <p style={{ fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5, marginBottom:14 }}>Score Scale</p>
        <div style={{ display:'flex', gap:4 }}>
          {Object.entries(TIERS).map(([key, t]) => (
            <div key={key} style={{ flex:1, padding:'8px 4px', borderRadius:8, background: key===result.tier ? t.bg : 'var(--cream)', border:`1.5px solid ${key===result.tier ? t.borderColor : 'transparent'}`, textAlign:'center', transition:'all .2s' }}>
              <p style={{ fontSize:14, marginBottom:2 }}>{t.emoji}</p>
              <p style={{ fontSize:10, fontWeight:700, color: key===result.tier ? t.color : 'var(--muted)', lineHeight:1.3 }}>{t.label}</p>
              <p style={{ fontSize:9, color:'#9BAA98', marginTop:2 }}>{t.range}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:16 }}>
        <button className="btn-primary" onClick={onDashboard} style={{ flex:1, padding:'13px', justifyContent:'center', fontSize:15 }}>View Dashboard →</button>
        <button className="btn-outline" onClick={onRetake} style={{ padding:'13px 20px' }}>Retake</button>
      </div>

      <p style={{ textAlign:'center', fontSize:12, color:'var(--muted)', lineHeight:1.7, paddingBottom:24 }}>
        Countor is a screening tool, not a clinical diagnosis.<br />
        <strong>iCall (free & confidential): 9152987821</strong>
      </p>
    </PageShell>
  )
}
