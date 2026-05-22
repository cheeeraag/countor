import { useState } from 'react'
import { useApp } from '../context/AppContext'
import logoImg from '../assets/logo.png' // 1. Import your logo image here

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

  const handleNavigate = (id) => {
    onNavigate(id)
    setIsMenuOpen(false) 
  }

  return (
    <nav className="topnav">
      {/* Logo Section */}
      <button onClick={() => handleNavigate('dashboard')} className="topnav-logo" style={{ background:'none', border:'none', cursor:'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* 2. REPLACED EMOJI DIV WITH IMG TAG */}
        <img 
          src={logoImg} 
          alt="Countor Logo" 
          style={{ 
            height: '32px', // Matches the previous icon height
            width: 'auto',  // Maintains aspect ratio
            display: 'block'
          }} 
        />
        
        {/* The 'Countor' text remains next to the logo */}
        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: '19px', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text)' }}>
  Countor
</span>
      </button>

      {/* Hamburger Button (visible on mobile via CSS) */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}
      >
        {isMenuOpen ? '✖' : '☰'}
      </button>

      {/* Links Container */}
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
