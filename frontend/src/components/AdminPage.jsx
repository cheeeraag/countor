import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { adminAPI, orgsAPI } from '../utils/http'
import { TIERS } from '../data/recommendations'
import { useApp } from '../context/AppContext'
import { PageShell, SectionHeader, Avatar, Spinner } from './UI'

export function AdminPage() {
  const { user, isSuperAdmin, isOrgAdmin } = useApp()
  if (!isSuperAdmin && !isOrgAdmin) {
    return (
      <PageShell>
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <p style={{ fontSize:40, marginBottom:12 }}>🚫</p>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:20, marginBottom:8 }}>Access Denied</h2>
          <p style={{ color:'var(--muted)', fontSize:14 }}>You do not have permission to view this page.</p>
        </div>
      </PageShell>
    )
  }
  return isSuperAdmin ? <SuperAdminDashboard /> : <OrgAdminDashboard orgId={user.orgId} />
}

// ═══════════════ SUPERADMIN ════════════════════════════════════════════════════
function SuperAdminDashboard() {
  const [tab,    setTab]    = useState('overview')
  const [stats,  setStats]  = useState(null)
  const [users,  setUsers]  = useState([])
  const [orgs,   setOrgs]   = useState([])
  const [busy,   setBusy]   = useState(false)

  const loadAll = async () => {
    setBusy(true)
    try {
      const [s, u, o] = await Promise.all([adminAPI.stats(), adminAPI.users(), orgsAPI.all()])
      setStats(s); setUsers(u); setOrgs(o)
    } catch {}
    setBusy(false)
  }

  useEffect(() => { loadAll() }, [])

  const pending  = orgs.filter(o => !o.approved)
  const approved = orgs.filter(o => o.approved)

  const TABS = [
    { id:'overview', label:'📊 Overview' },
    { id:'orgs',     label:`🏢 Organisations${pending.length ? ` (${pending.length})` : ''}` },
    { id:'users',    label:'👥 All Users' },
    { id:'export',   label:'📥 Export' },
  ]

  return (
    <PageShell>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontFamily:"'Lora',serif", fontSize:22 }}>🔐 Superadmin Dashboard</h1>
        <p style={{ color:'var(--muted)', fontSize:13, marginTop:2 }}>{users.length} users · {orgs.length} orgs</p>
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--cream2)', padding:4, borderRadius:10, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:'7px 14px', borderRadius:8, border:'none', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .2s', background: tab===t.id ? 'var(--white)' : 'transparent', color: tab===t.id ? 'var(--green)' : 'var(--muted)', boxShadow: tab===t.id ? 'var(--shadow-sm)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {busy && !stats ? <div style={{ textAlign:'center', padding:40 }}><Spinner green size={28} /></div> : (
        <>
          {tab === 'overview' && stats && <OverviewTab stats={stats} />}
          {tab === 'orgs'     && <OrgsTab pending={pending} approved={approved} onRefresh={loadAll} />}
          {tab === 'users'    && <UsersTab users={users} showOrg />}
          {tab === 'export'   && <ExportTab approved={approved} users={users} isSuperAdmin />}
        </>
      )}
    </PageShell>
  )
}

// ═══════════════ ORG ADMIN ════════════════════════════════════════════════════
function OrgAdminDashboard({ orgId }) {
  const [tab,   setTab]   = useState('users')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    Promise.all([adminAPI.stats(orgId), adminAPI.users(orgId)])
      .then(([s,u]) => { setStats(s); setUsers(u) })
      .catch(() => {})
  }, [orgId])

  return (
    <PageShell>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontFamily:"'Lora',serif", fontSize:20 }}>🏢 Organisation Admin</h1>
        <p style={{ color:'var(--muted)', fontSize:13, marginTop:2 }}>{users.length} members · {stats?.checkins || 0} check-ins</p>
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--cream2)', padding:4, borderRadius:10, width:'fit-content' }}>
        {[['users','👥 Members'],['export','📥 Export']].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding:'7px 18px', borderRadius:8, border:'none', fontSize:12, fontWeight:700, cursor:'pointer', background: tab===id ? 'var(--white)' : 'transparent', color: tab===id ? 'var(--green)' : 'var(--muted)', boxShadow: tab===id ? 'var(--shadow-sm)' : 'none', transition:'all .2s' }}>
            {label}
          </button>
        ))}
      </div>

      {stats && (
        <div className="grid-3" style={{ marginBottom:20 }}>
          {[
            { icon:'👥', label:'Members',     value: users.length },
            { icon:'📊', label:'Check-ins',   value: stats.checkins },
            { icon:'📈', label:'Avg Wellness', value: stats.avgScore ? `${stats.avgScore}/100` : '—' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign:'center', padding:'14px 10px' }}>
              <p style={{ fontSize:18, marginBottom:4 }}>{s.icon}</p>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5 }}>{s.label}</p>
              <p style={{ fontSize:20, fontWeight:700, color:'var(--green)', fontFamily:"'Lora',serif", marginTop:4 }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'users'  && <UsersTab users={users} showOrg={false} />}
      {tab === 'export' && <ExportTab orgId={orgId} users={users} isSuperAdmin={false} />}
    </PageShell>
  )
}

// ─── Shared sub-components ─────────────────────────────────────────────────────
function OverviewTab({ stats }) {
  return (
    <>
      <div className="grid-3" style={{ marginBottom:20 }}>
        {[
          { icon:'👥', label:'Total Users',      value: stats.users },
          { icon:'📊', label:'Total Check-ins',  value: stats.checkins },
          { icon:'📅', label:"Today's Check-ins", value: stats.today },
          { icon:'📈', label:'Avg Score',        value: stats.avgScore ? `${stats.avgScore}/100` : '—' },
          { icon:'🌿', label:'Healthy (≥85)',     value: (stats.tierDist?.find(t=>t.tier==='maintenance')?.count||0) },
          { icon:'🆘', label:'Severe',            value: (stats.tierDist?.find(t=>t.tier==='stage2')?.count||0) },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:'center', padding:'14px 10px' }}>
            <p style={{ fontSize:18, marginBottom:4 }}>{s.icon}</p>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5 }}>{s.label}</p>
            <p style={{ fontSize:20, fontWeight:700, color:'var(--green)', fontFamily:"'Lora',serif", marginTop:4 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {stats.daily7?.length > 0 && (
        <div className="card" style={{ marginBottom:16 }}>
          <SectionHeader icon="📅" title="7-Day Activity" />
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={stats.daily7} margin={{ top:5, right:5, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EE" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize:11, fill:'#6B8069' }} tickLine={false} axisLine={false} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize:11, fill:'#6B8069' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background:'#fff', border:'1px solid #DCE8DC', borderRadius:10, fontSize:12, fontFamily:'Nunito,sans-serif' }} />
              <Bar dataKey="checkins" fill="#1B5E3B" radius={[6,6,0,0]} name="Check-ins" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {stats.tierDist?.length > 0 && (
        <div className="card">
          <SectionHeader icon="🎯" title="Tier Distribution" />
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {stats.tierDist.map(t => {
              const meta = TIERS[t.tier]; if (!meta) return null
              const pct  = stats.checkins ? Math.round((t.count/stats.checkins)*100) : 0
              return (
                <div key={t.tier} style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', minWidth:120 }}>{meta.label}</span>
                  <div style={{ flex:1, height:8, background:'var(--cream2)', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:meta.color, borderRadius:4, transition:'width .5s ease' }} />
                  </div>
                  <span style={{ fontSize:12, color:'var(--muted)', minWidth:55, textAlign:'right' }}>{t.count} ({pct}%)</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

function OrgsTab({ pending, approved, onRefresh }) {
  const handle = async (id, action) => {
    try {
      action === 'approve' ? await orgsAPI.approve(id) : await orgsAPI.reject(id)
      onRefresh()
    } catch (e) { alert(e.message) }
  }

  return (
    <>
      {pending.length > 0 && (
        <div className="card" style={{ marginBottom:16, border:'1.5px solid #F5C580' }}>
          <SectionHeader icon="⏳" title="Pending Requests" subtitle={`${pending.length} awaiting approval`} />
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {pending.map(o => (
              <div key={o.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--amber-pale)', borderRadius:10 }}>
                <div style={{ width:42, height:42, borderRadius:10, background:'#F5C580', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🏢</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{o.name}</p>
                  <p style={{ fontSize:12, color:'var(--muted)' }}>Requested by {o.admin_name} · {o.admin_email}</p>
                </div>
                <button className="btn-primary" onClick={() => handle(o.id,'approve')} style={{ padding:'7px 14px', fontSize:12 }}>✅ Approve</button>
                <button onClick={() => handle(o.id,'reject')} style={{ padding:'7px 14px', fontSize:12, background:'var(--red)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 }}>✗ Reject</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="card">
        <SectionHeader icon="✅" title="Approved Organisations" subtitle={`${approved.length} active`} />
        {approved.length === 0
          ? <p style={{ color:'var(--muted)', fontSize:13, textAlign:'center', padding:'20px 0' }}>No approved organisations yet.</p>
          : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {approved.map((o,i) => (
                <div key={o.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderTop: i===0?'none':'1px solid var(--border)' }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:'var(--green-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🏢</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{o.name}</p>
                    <p style={{ fontSize:12, color:'var(--muted)' }}>Admin: {o.admin_email}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>{o.member_count} members</p>
                    <p style={{ fontSize:11, color:'var(--muted)' }}>{o.checkin_count} check-ins</p>
                  </div>
                  <button className="btn-ghost" onClick={() => adminAPI.exportCSV(o.id)} style={{ fontSize:12 }}>CSV ↓</button>
                </div>
              ))}
            </div>
        }
      </div>
    </>
  )
}

function UsersTab({ users, showOrg }) {
  const [search, setSearch] = useState('')
  const filtered = search ? users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) : users
  return (
    <>
      <div style={{ marginBottom:14 }}><input type="search" placeholder="Search users..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
      <div className="card">
        {filtered.length === 0
          ? <p style={{ textAlign:'center', padding:20, color:'var(--muted)', fontSize:13 }}>No users found</p>
          : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {filtered.map((u,i) => {
                const t = u.last_tier ? TIERS[u.last_tier] : null
                return (
                  <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderTop: i===0?'none':'1px solid var(--border)' }}>
                    <Avatar initials={u.name?.slice(0,2).toUpperCase()} size={40} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{u.name}</p>
                      <p style={{ fontSize:11, color:'var(--muted)' }}>{u.email}</p>
                      {showOrg && u.org_name && <span className="badge badge-green" style={{ fontSize:10, marginTop:3 }}>🏢 {u.org_name}</span>}
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      {u.avg_score && <p style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>{u.avg_score}/100 avg</p>}
                      <p style={{ fontSize:11, color:'var(--muted)' }}>{u.checkin_count} check-ins</p>
                      {u.last_checkin && <p style={{ fontSize:11, color:'var(--muted)' }}>{String(u.last_checkin).slice(0,10)}</p>}
                    </div>
                    {t && <span className="badge" style={{ background:t.bg, color:t.color, fontSize:10, flexShrink:0 }}>{t.label}</span>}
                    <button className="btn-ghost" onClick={() => adminAPI.exportCSV(null, u.id)} style={{ fontSize:11, flexShrink:0 }}>CSV ↓</button>
                  </div>
                )
              })}
            </div>
        }
      </div>
    </>
  )
}

function ExportTab({ orgId, users, approved = [], isSuperAdmin }) {
  const [done, setDone] = useState(false)
  const doExport = async (oid) => {
    await adminAPI.exportCSV(oid || orgId)
    setDone(true); setTimeout(() => setDone(false), 2500)
  }
  return (
    <div className="card">
      <SectionHeader icon="📥" title="Export Data" subtitle="Download as CSV" />
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        {[{ label:'Users', value:users.length }, { label:'Organisations', value: approved.length }].map(s => (
          <div key={s.label} className="card" style={{ flex:1, textAlign:'center', padding:'12px', minWidth:100, background:'var(--cream)' }}>
            <p style={{ fontSize:20, fontWeight:700, color:'var(--green)', fontFamily:"'Lora',serif" }}>{s.value}</p>
            <p style={{ fontSize:11, color:'var(--muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={() => doExport()} style={{ width:'100%', justifyContent:'center', padding:'13px', marginBottom:16 }}>
        {done ? '✅ Downloaded!' : '📥 Export All Data as CSV'}
      </button>
      {isSuperAdmin && approved.length > 0 && (
        <>
          <p style={{ fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5, marginBottom:10 }}>Export by Organisation</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {approved.map(o => (
              <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--cream)', borderRadius:10 }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>🏢 {o.name}</p>
                  <p style={{ fontSize:11, color:'var(--muted)' }}>{o.checkin_count || 0} records</p>
                </div>
                <button className="btn-outline" onClick={() => doExport(o.id)} style={{ padding:'6px 14px', fontSize:12 }}>CSV ↓</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
