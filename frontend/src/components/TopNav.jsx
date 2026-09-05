import { useState } from 'react'
import { useApp } from '../context/AppContext'
import logoImg from '../assets/logo.png'

export function TopNav({ currentPage, onNavigate }) {
  const { user, logout, isAdmin, isSuperAdmin } = useApp()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const LINKS = [
    { id: 'dashboard', label: 'Home', show: true },
    { id: 'checkin', label: 'Check-in', show: true },
    { id: 'community', label: 'Community', show: true },
    { id: 'therapists', label: 'Support', show: true },
    { id: 'streaks', label: 'Journey', show: true },
    { id: 'admin', label: isSuperAdmin ? 'Super Admin' : 'Org Admin', show: isAdmin },
  ]

  const handleNavigate = (id) => {
    onNavigate(id)
    setIsMenuOpen(false)
  }

  return (
    <nav className="topnav">
      <button onClick={() => handleNavigate('dashboard')} className="topnav-logo" aria-label="Countor home">
        <img src={logoImg} alt="Countor" style={{ height: 34, width: 'auto', display: 'block' }} />
      </button>

      <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle navigation" aria-expanded={isMenuOpen}>
        {isMenuOpen ? '✖' : '☰'}
      </button>

      <div className={`topnav-links ${isMenuOpen ? 'open' : ''}`}>
        {LINKS.filter(l => l.show).map(link => (
          <button key={link.id} onClick={() => handleNavigate(link.id)} className={`topnav-link ${currentPage === link.id ? 'active' : ''}`}>
            {link.label}
          </button>
        ))}
        <div className="nav-divider" />
        {isAdmin && <span className="nav-badge">{isSuperAdmin ? 'SUPERADMIN' : 'ORG ADMIN'}</span>}
        <span className="nav-username">{user?.name?.split(' ')[0]}</span>
        <button className="btn-ghost nav-logout" onClick={logout}>Log Out</button>
      </div>
    </nav>
  )
}
