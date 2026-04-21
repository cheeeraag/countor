import { useApp } from '../context/AppContext'

const LINKS = [
  { id: 'dashboard',   label: '📊 Dashboard' },
  { id: 'checkin',     label: '🧠 Check-in' },
  { id: 'therapists',  label: '👩‍⚕️ Therapists' },
  { id: 'streaks',     label: '🔥 Streaks' },
  { id: 'admin',       label: '⚙️ Admin' },
]

export function TopNav({ currentPage, onNavigate }) {
  const { user, logout } = useApp()

  return (
    <nav className="topnav">
      <button
        onClick={() => onNavigate('dashboard')}
        className="topnav-logo"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div className="topnav-logo-icon">🧠</div>
        <span>Countor</span>
      </button>

      <div className="topnav-links">
        {LINKS.map(link => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={`topnav-link ${currentPage === link.id ? 'active' : ''}`}
          >
            {link.label}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
            Hi, {user?.name?.split(' ')[0]}
          </span>
          <button className="btn-ghost" onClick={logout} style={{ color: 'var(--red)', fontSize: 12 }}>
            Log Out
          </button>
        </div>
      </div>
    </nav>
  )
}
