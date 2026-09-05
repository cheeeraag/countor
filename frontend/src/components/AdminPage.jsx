import { useEffect, useMemo, useState } from 'react'
import { adminAPI, orgsAPI } from '../utils/http'
import { useApp } from '../context/AppContext'
import { PageShell, Spinner, SectionHeader } from './UI'
import { Matrix } from './Dashboard'

function Metric({ label, value, detail, tone = 'purple' }) {
  return <div className="admin-metric">
    <span>{label}</span><strong className={`metric-${tone}`}>{value}</strong>{detail && <small>{detail}</small>}
  </div>
}

function TrendBars({ data = [] }) {
  const max = Math.max(1, ...data.map(d => Number(d.checkins) || 0))
  return <div className="trend-bars">
    {data.map((d, i) => <div className="trend-bar-col" key={`${d.date}-${i}`} title={`${d.date}: ${d.checkins} check-ins`}>
      <div className="trend-bar" style={{ height: `${Math.max(6, ((Number(d.checkins) || 0) / max) * 100)}%` }} />
      <small>{new Date(d.date).toLocaleDateString('en-IN', { weekday:'short' }).slice(0,2)}</small>
    </div>)}
  </div>
}

export function AdminPage() {
  const { user, isSuperAdmin, isOrgAdmin } = useApp()
  if (!isSuperAdmin && !isOrgAdmin) return <PageShell><div className="card" style={{ textAlign:'center', padding:60 }}><h2>Access Denied</h2></div></PageShell>
  return isSuperAdmin ? <SuperAdminDashboard /> : <OrgAdminDashboard orgId={user.org_id || user.orgId} />
}

function SuperAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [orgs, setOrgs] = useState([])
  const [busy, setBusy] = useState(true)
  useEffect(() => {
    Promise.all([adminAPI.stats(), adminAPI.users(), orgsAPI.all()])
      .then(([s, _, o]) => { setStats(s); setOrgs(o || []) })
      .finally(() => setBusy(false))
  }, [])
  if (busy || !stats) return <PageShell><Spinner green size={28} /></PageShell>

  return <PageShell style={{ maxWidth:1200 }}>
    <div className="admin-hero"><div><p className="eyebrow">PLATFORM CONTROL CENTER</p><h1>Superadmin Dashboard</h1><p>Monitor Countor at platform level without exposing individual wellness data.</p></div><button className="btn-outline" onClick={() => adminAPI.exportCSV()}>↓ Export report</button></div>
    <div className="admin-metric-grid">
      <Metric label="Organizations" value={orgs.length || '—'} detail="active + pending" />
      <Metric label="Total users" value={stats.users.toLocaleString()} detail="registered members" />
      <Metric label="Active users" value={stats.activeUsers.toLocaleString()} detail="checked in last 30 days" tone="green" />
      <Metric label="Check-ins" value={stats.checkins.toLocaleString()} detail={`${stats.checkinRate}% active-user rate`} />
      <Metric label="Avg wellness" value={`${stats.avgWellbeing}%`} detail="platform average" tone="green" />
      <Metric label="Avg distress" value={`${stats.avgDistress}%`} detail="platform average" tone="amber" />
    </div>

    <div className="admin-two-col">
      <section className="card"><SectionHeader title="Platform activity" subtitle="Check-ins over the last 7 days" /><TrendBars data={stats.daily7} /></section>
      <section className="card"><SectionHeader title="Safety signals" subtitle="Aggregate monitoring only" /><div className="safety-summary"><strong>{stats.safetyAlerts}</strong><span>flagged check-ins today</span><small>Individual identities and raw responses are not displayed in the admin analytics.</small></div></section>
    </div>

    <section className="card"><SectionHeader title="Organization overview" subtitle="Compare engagement and aggregate wellness signals across organizations" />
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Organization</th><th>Members</th><th>Check-ins</th><th>Status</th></tr></thead><tbody>
        {orgs.slice(0,12).map(o => <tr key={o.id}><td><strong>{o.name}</strong></td><td>{o.member_count ?? 0}</td><td>{o.checkin_count ?? 0}</td><td><span className={`badge ${o.approved ? 'badge-green' : 'badge-amber'}`}>{o.approved ? 'Active' : 'Pending'}</span></td></tr>)}
      </tbody></table></div>
      {!orgs.length && <p className="admin-empty">No organizations available yet.</p>}
    </section>
  </PageShell>
}

function OrgAdminDashboard({ orgId }) {
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [busy, setBusy] = useState(true)
  useEffect(() => {
    Promise.all([adminAPI.stats(orgId), adminAPI.users(orgId)])
      .then(([s, a]) => { setStats(s); setActivity(a || []) })
      .finally(() => setBusy(false))
  }, [orgId])
  if (busy || !stats) return <PageShell><Spinner green size={28} /></PageShell>

  const avgX = Math.round(stats.avgDistress || 0)
  const avgY = Math.round(stats.avgWellbeing || 0)
  const activeRate = stats.users ? Math.round((stats.activeUsers / stats.users) * 100) : 0

  return <PageShell style={{ maxWidth:1200 }}>
    <div className="admin-hero"><div><p className="eyebrow">ORGANIZATION ANALYTICS</p><h1>Organization Dashboard</h1><p>Aggregate insights for your organization. Individual wellness scores are kept private.</p></div><button className="btn-outline" onClick={() => adminAPI.exportCSV(orgId)}>↓ Export report</button></div>
    <div className="admin-metric-grid">
      <Metric label="Members" value={stats.users.toLocaleString()} detail="registered" />
      <Metric label="Active users" value={stats.activeUsers.toLocaleString()} detail="last 30 days" tone="green" />
      <Metric label="Check-in rate" value={`${activeRate}%`} detail="active members" tone="green" />
      <Metric label="Check-ins" value={stats.checkins.toLocaleString()} detail="all time" />
      <Metric label="Avg wellness" value={`${stats.avgWellbeing}%`} detail="aggregate only" tone="green" />
      <Metric label="Avg distress" value={`${stats.avgDistress}%`} detail="aggregate only" tone="amber" />
    </div>

    <div className="admin-two-col">
      <section className="card"><SectionHeader title="Organization position" subtitle="Aggregate Wellness × Distress snapshot" /><div className="admin-matrix"><Matrix x={avgX} y={avgY} compact /></div><p className="privacy-note">This position represents the organization aggregate, not an individual employee.</p></section>
      <section className="card"><SectionHeader title="Engagement" subtitle="Recent check-in activity" /><TrendBars data={stats.daily7} /><div className="admin-engagement"><div><strong>{stats.today}</strong><span>today</span></div><div><strong>{stats.activeUsers}</strong><span>active / 30d</span></div><div><strong>{activity[0]?.latest_checkin ? new Date(activity[0].latest_checkin).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '—'}</strong><span>latest check-in</span></div></div></section>
    </div>

    <section className="card"><SectionHeader title="Member engagement summary" subtitle="No employee names, emails, individual scores or individual risk labels are shown" />
      <div className="aggregate-callouts"><div><strong>{stats.activeUsers}</strong><span>members checked in within 30 days</span></div><div><strong>{Math.max(0, stats.users - stats.activeUsers)}</strong><span>members not active in 30 days</span></div><div><strong>{stats.safetyAlerts}</strong><span>aggregate safety signals today</span></div></div>
      <div className="privacy-banner">🔒 <span>Countor keeps organization analytics aggregate-first. Use authorized support workflows for any intervention that requires more sensitive information.</span></div>
    </section>
  </PageShell>
}
