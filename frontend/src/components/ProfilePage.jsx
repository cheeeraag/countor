import { useCallback, useEffect, useState } from 'react'
import { PageShell, SectionHeader } from './UI'
import { supportAPI } from '../utils/http'
import { useApp } from '../context/AppContext'
import '../styles/voice.css'

function formatDate(value, withTime = false) {
  if (!value) return ''
  return new Date(value).toLocaleString('en-IN', withTime
    ? { day:'numeric', month:'short', hour:'numeric', minute:'2-digit' }
    : { day:'numeric', month:'short', year:'numeric' })
}

function statusLabel(status) {
  return status === 'resolved' ? 'Resolved' : status === 'in_progress' ? 'In progress' : 'Requested'
}

export function ProfilePage() {
  const { user, logout, updateDirectoryPrivacy } = useApp()
  const [requests, setRequests] = useState([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState({})
  const [sending, setSending] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const loadSupport = useCallback(async () => {
    try {
      const data = await supportAPI.list()
      setRequests(data || [])
    } catch (_) {}
  }, [])

  useEffect(() => {
    loadSupport()
    const timer = window.setInterval(loadSupport, 20000)
    return () => window.clearInterval(timer)
  }, [loadSupport])

  const togglePrivacy = async e => {
    try {
      await updateDirectoryPrivacy(e.target.checked)
      setMessage('Privacy setting updated.')
    } catch (err) {
      setMessage(err.message || 'Could not update privacy setting.')
    }
  }

  const requestSupport = async () => {
    setBusy(true)
    setMessage('')
    try {
      const r = await supportAPI.create('General support')
      setRequests(p => [r, ...p])
      setExpanded(r.id)
      setMessage(`Support request created. Your private Countor Member ID is ${r.memberCode}.`)
    } catch (e) {
      setMessage(e.message || 'Could not create support request.')
    }
    setBusy(false)
  }

  const sendReply = async id => {
    const text = String(reply[id] || '').trim()
    if (!text || sending === id) return
    setSending(id)
    try {
      const sent = await supportAPI.message(id, text)
      setRequests(prev => prev.map(r => r.id === id
        ? { ...r, updated_at: sent.created_at, messages: [...(r.messages || []), { id: sent.id, senderRole: sent.sender_role, message: sent.message, createdAt: sent.created_at }] }
        : r))
      setReply(prev => ({ ...prev, [id]: '' }))
    } catch (e) {
      setMessage(e.message || 'Could not send message.')
    }
    setSending(null)
  }

  return <PageShell>
    <div className="dashboard-hero">
      <div><p className="eyebrow">ACCOUNT</p><h1>Profile</h1><p>Manage your Countor account and privacy preferences.</p></div>
    </div>

    <section className="card profile-card" style={{ marginBottom:18 }}>
      <div className="profile-avatar">{(user?.name || 'U').split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()}</div>
      <div style={{ minWidth:0 }}>
        <h2>{user?.name || 'Countor user'}</h2>
        <p>{user?.email || 'Account email'}</p>
        <span className="badge badge-blue">{user?.role === 'superadmin' ? 'Superadmin' : user?.role === 'org_admin' ? 'Organization Admin' : 'Member'}</span>
        {user?.memberCode && <div className="member-code"><small>COUNTOR MEMBER ID</small><strong>{user.memberCode}</strong></div>}
      </div>
    </section>

    <section className="card" style={{ marginBottom:18 }}>
      <SectionHeader title="Privacy & security" subtitle="Your individual check-in information stays private." />
      <div className="profile-item"><strong>Personal check-ins</strong><span>Visible to you in your dashboard and insights. Organization admins receive aggregate analytics, not your individual score.</span></div>
      {user?.orgId && <div className="profile-item"><strong>Organization directory</strong><span><label className="directory-toggle" style={{margin:0}}><input type="checkbox" checked={user.directoryVisible !== false} onChange={togglePrivacy}/><span><strong>Show my department in the organization directory</strong><small>{user?.directoryVisible !== false ? 'Your department is visible.' : 'Your department is hidden.'}</small></span></label></span></div>}
      <div className="profile-item"><strong>Member identity</strong><span>Organization support workflows use your Countor Member ID rather than exposing your name beside wellness or distress scores.</span></div>
      <div className="profile-item"><strong>Assessment framing</strong><span>Countor provides wellness screening and estimates; it does not diagnose.</span></div>
    </section>

    <section className="card" style={{ marginBottom:18 }}>
      <SectionHeader title="Support Center" subtitle="Private conversation with your support team. Your wellness scores are not shared in this conversation." />
      <button className="btn-primary" onClick={requestSupport} disabled={busy}>{busy ? 'Creating request…' : 'Request support'}</button>
      {message && <p className="support-feedback">{message}</p>}

      {requests.length === 0 && <div className="support-empty"><strong>No support requests yet</strong><span>If you need help, you can start a private conversation with your support team.</span></div>}

      {requests.length > 0 && <div className="support-list">
        {requests.slice(0,5).map(r => {
          const messages = r.messages || []
          const unread = messages.some(m => m.senderRole === 'admin')
          const isOpen = expanded === r.id
          return <div className={`support-thread ${isOpen ? 'is-open' : ''}`} key={r.id}>
            <button className="support-thread-head" onClick={() => setExpanded(isOpen ? null : r.id)}>
              <div><strong>{r.reason || 'Support request'}</strong><small>{formatDate(r.updated_at || r.created_at)}</small></div>
              <div className="support-thread-meta">
                {unread && <span className="support-unread">New reply</span>}
                <span className={`badge ${r.status === 'resolved' ? 'badge-green' : 'badge-blue'}`}>{statusLabel(r.status)}</span>
                <span className="support-chevron">{isOpen ? '−' : '+'}</span>
              </div>
            </button>

            {isOpen && <div className="support-conversation">
              <div className="support-privacy-note">Private support conversation · Countor Member ID {user?.memberCode || 'protected'}</div>
              <div className="support-messages">
                {messages.length === 0 && <div className="support-no-messages">Your request is with the support team. You can add more context below.</div>}
                {messages.map(m => <div className={`support-message ${m.senderRole === 'admin' ? 'from-support' : 'from-member'}`} key={m.id}>
                  <div className="support-message-label">{m.senderRole === 'admin' ? 'Support Team' : 'You'}</div>
                  <div className="support-message-bubble">{m.message}</div>
                  <small>{formatDate(m.createdAt, true)}</small>
                </div>)}
              </div>
              {r.status !== 'resolved' && <div className="support-reply-box">
                <textarea value={reply[r.id] || ''} onChange={e => setReply(prev => ({...prev, [r.id]: e.target.value.slice(0,2000)}))} placeholder="Write a message to your support team…" rows={3} />
                <div className="support-reply-footer"><span>{(reply[r.id] || '').length}/2000</span><button className="btn-primary" onClick={() => sendReply(r.id)} disabled={sending === r.id || !(reply[r.id] || '').trim()}>{sending === r.id ? 'Sending…' : 'Send message'}</button></div>
              </div>}
              {r.status === 'resolved' && <div className="support-resolved-note">This support request is resolved. Start a new request if you need further help.</div>}
            </div>}
          </div>
        })}
      </div>}
    </section>

    <button className="btn-outline" onClick={logout} style={{color:'var(--red)',borderColor:'#E8B8BF'}}>Log out</button>
  </PageShell>
}
