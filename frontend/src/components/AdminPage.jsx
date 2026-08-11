import { useState, useEffect } from 'react'
import { adminAPI, orgsAPI } from '../utils/http'
import { useApp } from '../context/AppContext'
import { PageShell, Spinner } from './UI'

export function AdminPage() {
  const { user, isSuperAdmin, isOrgAdmin } = useApp()
  if (!isSuperAdmin && !isOrgAdmin) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Access Denied</h2>
        </div>
      </PageShell>
    )
  }
  return isSuperAdmin ? <SuperAdminDashboard /> : <OrgAdminDashboard orgId={user.org_id || user.orgId} />
}

function SuperAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [busy, setBusy]   = useState(false)

  useEffect(() => {
    setBusy(true)
    Promise.all([adminAPI.stats(), adminAPI.users()])
      .then(([s, u]) => { setStats(s); setUsers(u) })
      .finally(() => setBusy(false))
  }, [])

  if (busy || !stats) return <PageShell><Spinner green size={28} /></PageShell>

  return (
    <PageShell>
      <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, marginBottom: 20 }}>🔐 Superadmin Dashboard</h1>
      
      {/* Metrics Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>TOTAL USERS</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{stats.users}</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>AVG WELL-BEING (Y)</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{stats.avgWellbeing}%</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>AVG DISTRESS (X)</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#C0392B' }}>{stats.avgDistress}%</p>
        </div>
      </div>

      {stats.safetyAlerts > 0 && (
        <div style={{ background: '#FADBD8', padding: 16, borderRadius: 10, marginBottom: 24 }}>
          <p style={{ color: '#922B21', fontWeight: 700 }}>⚠️ Active Safety Alerts Today: {stats.safetyAlerts}</p>
        </div>
      )}
    </PageShell>
  )
}

function OrgAdminDashboard({ orgId }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminAPI.stats(orgId).then(setStats).catch(() => {})
  }, [orgId])

  if (!stats) return <PageShell><Spinner green size={28} /></PageShell>

  return (
    <PageShell>
      <h1 style={{ fontFamily: "'Lora', serif", fontSize: 20, marginBottom: 20 }}>🏢 Organisation Metrics</h1>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>CHECK-INS</p>
          <p style={{ fontSize: 20, fontWeight: 700 }}>{stats.checkins}</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>WELL-BEING INDEX</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{stats.avgWellbeing}%</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 14 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>DISTRESS INDEX</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#C0392B' }}>{stats.avgDistress}%</p>
        </div>
      </div>
    </PageShell>
  )
}
