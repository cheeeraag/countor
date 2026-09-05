import { useEffect, useState } from 'react'
import { PageShell, SectionHeader } from './UI'
import { supportAPI } from '../utils/http'
import { useApp } from '../context/AppContext'

export function ProfilePage() {
  const { user, logout } = useApp()
  const [requests, setRequests] = useState([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { supportAPI.list().then(setRequests).catch(() => {}) }, [])
  const requestSupport = async () => {
    setBusy(true); setMessage('')
    try {
      const r = await supportAPI.create('General support')
      setRequests(prev => [r, ...prev]); setMessage(`Support request created. Your private Countor Member ID is ${r.memberCode}.`)
    } catch (e) { setMessage(e.message || 'Could not create support request.') }
    setBusy(false)
  }

  return <PageShell>
    <div className="dashboard-hero"><div><p className="eyebrow">ACCOUNT</p><h1>Profile</h1><p>Manage your Countor account and privacy preferences.</p></div></div>
    <section className="card profile-card" style={{ marginBottom:18 }}>
      <div className="profile-avatar">{(user?.name || 'U').split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase()}</div>
      <div style={{ minWidth:0 }}><h2>{user?.name || 'Countor user'}</h2><p>{user?.email || 'Account email'}</p><span className="badge badge-blue">{user?.role === 'superadmin' ? 'Superadmin' : user?.role === 'org_admin' ? 'Organization Admin' : 'Member'}</span>{user?.memberCode && <div className="member-code"><small>COUN­TOR MEMBER ID</small><strong>{user.memberCode}</strong></div>}</div>
    </section>
    <section className="card" style={{ marginBottom:18 }}>
      <SectionHeader title="Privacy & security" subtitle="Your individual check-in information stays private." />
      <div className="profile-item"><strong>Personal check-ins</strong><span>Visible to you in your dashboard and insights. Organization admins receive aggregate analytics, not your individual score.</span></div>
      <div className="profile-item"><strong>Organization directory</strong><span>{user?.directoryVisible ? 'Your department can be shown in the organization directory.' : 'Your department is hidden from the organization directory.'}</span></div>
      <div className="profile-item"><strong>Member identity</strong><span>Organization support workflows use your Countor Member ID rather than exposing your name beside wellness or distress scores.</span></div>
      <div className="profile-item"><strong>Assessment framing</strong><span>Countor provides wellness screening and estimates; it does not diagnose.</span></div>
    </section>
    <section className="card" style={{ marginBottom:18 }}>
      <SectionHeader title="Support Center" subtitle="Ask for support without making your wellness score visible to an organization admin." />
      <button className="btn-primary" onClick={requestSupport} disabled={busy}>{busy ? 'Creating request…' : 'Request support'}</button>
      {message && <p className="support-feedback">{message}</p>}
      {requests.length > 0 && <div className="support-list">{requests.slice(0,5).map(r => <div className="support-row" key={r.id}><div><strong>{r.reason || 'Support request'}</strong><small>{new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</small></div><span className={`badge ${r.status==='resolved'?'badge-green':'badge-blue'}`}>{r.status}</span></div>)}</div>}
    </section>
    <button className="btn-outline" onClick={logout} style={{ color:'var(--red)', borderColor:'#E8B8BF' }}>Log out</button>
  </PageShell>
}
