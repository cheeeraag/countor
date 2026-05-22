import { useState } from 'react'
import { useApp } from '../context/AppContext'

export function TopNav({ currentPage, onNavigate }) {
  const { user, logout, isAdmin, isSuperAdmin } = useApp()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const LINKS = [
    { id: 'dashboard',  label: '📊 Dashboard',   show: true },
    { id: 'checkin',    label: '📋 Check-in',     show: true },
    { id: 'community',  label: '🌿 Community',    show: true },
    { id: 'therapists', label: '👩‍⚕️ Therapists',  show: true },
    { id: 'streaks',    label: '🔥 Streaks',      show: true },
    { id: 'admin',      label: isSuperAdmin ? '🔐 Super Admin' : '⚙️ Org Admin', show: isAdmin },
  ]

  // Helper to navigate AND close the menu on mobile automatically
  const handleNavigate = (id) => {
    onNavigate(id)
    setIsMenuOpen(false) 
  }

  return (
    <nav className="topnav">
      {/* Logo */}
      <button onClick={() => handleNavigate('dashboard')} className="topnav-logo" style={{ background:'none', border:'none', cursor:'pointer' }}>
        <div className="topnav-logo-icon">🧠</div>
        <span>Countor</span>
      </button>

      {/* Hamburger Button (Only visible on mobile via CSS) */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}
      >
        {isMenuOpen ? '✖' : '☰'}
      </button>

      {/* Links Container - Adds 'open' class when active on mobile */}
      <div className={`topnav-links ${isMenuOpen ? 'open' : ''}`}>
        {LINKS.filter(l => l.show).map(link => (
          <button key={link.id} onClick={() => handleNavigate(link.id)}
            className={`topnav-link ${currentPage === link.id ? 'active' : ''}`}>
            {link.label}
          </button>
        ))}

        <div className="nav-divider" style={{ width:1, height:20, background:'var(--border)', margin:'0 6px' }} />

        {/* Role badge */}
        {isAdmin && (
          <span className="nav-badge" style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, background: isSuperAdmin ? '#FADBD8' : 'var(--green-pale)', color: isSuperAdmin ? '#922B21' : 'var(--green)', marginRight:4 }}>
            {isSuperAdmin ? '🔐 SUPERADMIN' : '🏢 ORG ADMIN'}
          </span>
        )}

        <span className="nav-username" style={{ fontSize:13, fontWeight:600, color:'var(--muted)' }}>
          {user?.name?.split(' ')[0]}
        </span>
        
        <button className="btn-ghost nav-logout" onClick={logout} style={{ color:'var(--red)', fontSize:12 }}>
          Log Out
        </button>
      </div>
    </nav>
  )
}
