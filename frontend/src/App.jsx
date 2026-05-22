import logoImg from './assets/logo.png' // 1. Import your logo image here
import { useState } from 'react'
import { AppProvider, useApp }          from './context/AppContext'
import { AuthScreen }                   from './components/AuthScreen'
import { TopNav }                       from './components/TopNav'
import { Dashboard }                    from './components/Dashboard'
import { QuestionnaireIntro,
         CheckinQuestionnaire }         from './components/CheckinQuestionnaire'
import { ResultsScreen }                from './components/ResultsScreen'
import { CommunityPage }                from './components/CommunityPage'
import { TherapistDirectory }           from './components/TherapistDirectory'
import { StreaksPage }                  from './components/StreaksPage'
import { AdminPage }                    from './components/AdminPage'
import { Spinner }                      from './components/UI'

function AppInner() {
  const { user, loading, saveCheckin, isAdmin, isPending, isRejected } = useApp()
  const [page,       setPage]       = useState('dashboard')
  const [subPage,    setSubPage]    = useState(null)
  const [lastResult, setLastResult] = useState(null)
  const [pendingUser,setPendingUser] = useState(null)

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)' }}>
  <div style={{ textAlign:'center' }}>
    
    {/* Replaced the emoji with the logo image */}
    <img 
      src={brandLogo} 
      alt="CIDANÉ Logo" 
      style={{ width: '60px', height: 'auto', marginBottom: 16 }} 
    />
    
    <Spinner green size={28} />
    <p style={{ fontFamily:"'Lora',serif", color:'var(--green)', fontSize:16, marginTop:14 }}>Loading Countor…</p>
  </div>
</div>
    )
  }

  // ── Not logged in ────────────────────────────────────────────────────────────
  if (!user) {
    return <AuthScreen onPending={(u) => setPendingUser(u)} />
  }

  // ── Org admin pending approval ───────────────────────────────────────────────
  if (isPending || pendingUser) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)', padding:20 }}>
        <div style={{ maxWidth:440, textAlign:'center' }}>
          <p style={{ fontSize:52, marginBottom:16 }}>⏳</p>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, marginBottom:12 }}>Awaiting Approval</h2>
          <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7, marginBottom:24 }}>
            Your organisation admin request is under review. You will be notified once the Countor team approves it.
            <br /><br />
            Questions? Email <strong>admin@countor.app</strong>
          </p>
          <div style={{ background:'var(--green-pale)', border:'1px solid var(--green-pale2)', borderRadius:12, padding:'14px 18px' }}>
            <p style={{ fontSize:13, color:'var(--green)' }}>
              Logged in as <strong>{user?.email || pendingUser?.email}</strong>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Org admin rejected ───────────────────────────────────────────────────────
  if (isRejected) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)', padding:20 }}>
        <div style={{ maxWidth:440, textAlign:'center' }}>
          <p style={{ fontSize:52, marginBottom:16 }}>❌</p>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, marginBottom:12 }}>Request Not Approved</h2>
          <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7 }}>
            Your organisation request was not approved. Contact <strong>admin@countor.app</strong> for more information.
          </p>
        </div>
      </div>
    )
  }

  // ── Check-in flow (full screen, no nav) ──────────────────────────────────────
  if (page === 'checkin' && subPage === 'intro') {
    return (
      <QuestionnaireIntro
        onStart={() => setSubPage('quiz')}
        onBack={() => { setPage('dashboard'); setSubPage(null) }}
      />
    )
  }

  if (page === 'checkin' && subPage === 'quiz') {
    return (
      <CheckinQuestionnaire
        onComplete={async (result, rawAnswers) => {
          const entry = { ...result, score: result.wellness, answers: rawAnswers }
          try {
            await saveCheckin(entry)
          } catch (e) {
            console.error('Failed to save check-in:', e)
          }
          setLastResult(entry)
          setPage('results')
          setSubPage(null)
        }}
        onBack={() => setSubPage('intro')}
      />
    )
  }

  const startCheckin = () => { setPage('checkin'); setSubPage('intro') }

  const navigate = (p) => {
    if (p === 'admin' && !isAdmin) return  // block non-admins
    setPage(p)
    setSubPage(null)
    if (p === 'checkin') setSubPage('intro')
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)' }}>
      <TopNav currentPage={page} onNavigate={navigate} />
      <main style={{ maxWidth:760, margin:'0 auto' }}>
        {page === 'dashboard'  && <Dashboard onStartCheckin={startCheckin} />}
        {page === 'community'  && <CommunityPage />}
        {page === 'therapists' && <TherapistDirectory />}
        {page === 'streaks'    && <StreaksPage onStartCheckin={startCheckin} />}
        {page === 'admin'      && isAdmin && <AdminPage />}
        {page === 'results'    && lastResult && (
          <ResultsScreen
            result={lastResult}
            onDashboard={() => setPage('dashboard')}
            onRetake={startCheckin}
          />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
