import { useApp } from '../context/AppContext'
import { PageShell, SectionHeader } from './UI'

export function ProfilePage() {
  const { user, logout } = useApp()
  return <PageShell>
    <div className="dashboard-hero"><div><p className="eyebrow">ACCOUNT</p><h1>Profile</h1><p>Manage your Countor account and privacy preferences.</p></div></div>
    <section className="card profile-card" style={{ marginBottom:18 }}>
      <div className="profile-avatar">{(user?.name || 'U').split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase()}</div>
      <div><h2>{user?.name || 'Countor user'}</h2><p>{user?.email || 'Account email'}</p><span className="badge badge-blue">{user?.role === 'superadmin' ? 'Superadmin' : user?.role === 'org_admin' ? 'Organization Admin' : 'Member'}</span></div>
    </section>
    <section className="card" style={{ marginBottom:18 }}>
      <SectionHeader title="Privacy & security" subtitle="Your check-in information belongs to you." />
      <div className="profile-item"><strong>Personal check-ins</strong><span>Visible to you in your dashboard and insights.</span></div>
      <div className="profile-item"><strong>Organization analytics</strong><span>Organization views are aggregate-first and do not show employee names with individual wellness scores.</span></div>
      <div className="profile-item"><strong>Assessment framing</strong><span>Countor provides wellness screening and estimates; it does not diagnose.</span></div>
    </section>
    <button className="btn-outline" onClick={logout} style={{ color:'var(--red)', borderColor:'#E8B8BF' }}>Log out</button>
  </PageShell>
}
