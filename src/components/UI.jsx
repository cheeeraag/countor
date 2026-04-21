import { scoreColor } from '../data/recommendations'

// ─── Score Circle SVG ─────────────────────────────────────────────────────────
export function ScoreCircle({ score, size = 100 }) {
  const r = size / 2 - 7
  const circ = 2 * Math.PI * r
  const dash = circ * (score / 100)
  const color = scoreColor(score)

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8F5EE" strokeWidth={7} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray .8s ease' }}
      />
      <text
        x={size/2} y={size/2}
        dominantBaseline="middle" textAnchor="middle"
        style={{
          transform: `rotate(90deg)`,
          transformOrigin: `${size/2}px ${size/2}px`,
          fill: color,
          fontFamily: 'Lora, serif',
          fontWeight: 700,
          fontSize: size * 0.23,
        }}
      >
        {score}
      </text>
    </svg>
  )
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ green = false, size = 20 }) {
  return (
    <span
      className={green ? 'spinner spinner-green' : 'spinner'}
      style={{ width: size, height: size }}
    />
  )
}

// ─── Page Shell ───────────────────────────────────────────────────────────────
export function PageShell({ children, style = {} }) {
  return (
    <div className="container page-pad" style={style}>
      {children}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon && (
          <div style={{
            width: 38, height: 38,
            background: 'var(--green-pale)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
        <div>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 600 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ emoji, title, desc, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <p style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</p>
      <h3 style={{ fontFamily: "'Lora', serif", fontSize: 17, marginBottom: 8, color: 'var(--text)' }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: action ? 20 : 0, maxWidth: 300, margin: '0 auto 20px' }}>{desc}</p>
      {action}
    </div>
  )
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
export function StarRating({ rating }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 12, color: i <= Math.round(rating) ? '#E07B3A' : '#DCE8DC' }}>★</span>
      ))}
      <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </span>
  )
}

// ─── Avatar Initials ──────────────────────────────────────────────────────────
export function Avatar({ initials, size = 44, color = 'var(--green)', bg = 'var(--green-pale)' }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontWeight: 700, fontSize: size * 0.3,
      flexShrink: 0,
      fontFamily: "'Nunito', sans-serif",
    }}>
      {initials}
    </div>
  )
}
