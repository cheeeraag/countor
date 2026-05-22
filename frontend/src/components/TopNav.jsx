import { useApp } from '../context/AppContext'

export function TopNav({ currentPage, onNavigate }) {
  const { user, logout, isAdmin, isSuperAdmin } = useApp()

  const LINKS = [
    { id: 'dashboard',  label: '📊 Dashboard',   show: true },
    { id: 'checkin',    label: '📋 Check-in',     show: true },
    { id: 'community',  label: '🌿 Community',    show: true },
    { id: 'therapists', label: '👩‍⚕️ Therapists',  show: true },
    { id: 'streaks',    label: '🔥 Streaks',      show: true },
    // Admin link: visible only to org_admin and superadmin
    { id: 'admin',      label: isSuperAdmin ? '🔐 Super Admin' : '⚙️ Org Admin', show: isAdmin },
  ]

  return (
    <nav className="topnav">
      {/* Logo */}
      <button onClick={() => onNavigate('dashboard')} className="topnav-logo" style={{ background:'none', border:'none', cursor:'pointer' }}>
        <div className="topnav-logo-icon">🧠</div>
        <span>Countor</span>
      </button>

      {/* Links */}
      <div className="topnav-links">
        {LINKS.filter(l => l.show).map(link => (
          <button key={link.id} onClick={() => onNavigate(link.id)}
            className={`topnav-link ${currentPage === link.id ? 'active' : ''}`}>
            {link.label}
          </button>
        ))}

        <div style={{ width:1, height:20, background:'var(--border)', margin:'0 6px' }} />

        {/* Role badge */}
        {isAdmin && (
          <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, background: isSuperAdmin ? '#FADBD8' : 'var(--green-pale)', color: isSuperAdmin ? '#922B21' : 'var(--green)', marginRight:4 }}>
            {isSuperAdmin ? '🔐 SUPERADMIN' : '🏢 ORG ADMIN'}
          </span>
        )}

        <span style={{ fontSize:13, fontWeight:600, color:'var(--muted)' }}>
          {user?.name?.split(' ')[0]}
        </span>
        <button className="btn-ghost" onClick={logout} style={{ color:'var(--red)', fontSize:12 }}>
          Log Out
        </button>
      </div>
    </nav>
  )
}
