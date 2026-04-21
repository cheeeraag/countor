import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { AuthScreen }          from './components/AuthScreen'
import { TopNav }              from './components/TopNav'
import { Dashboard }           from './components/Dashboard'
import { ChatScreen }          from './components/ChatScreen'
import { ResultsScreen }       from './components/ResultsScreen'
import { TherapistDirectory }  from './components/TherapistDirectory'
import { StreaksPage }         from './components/StreaksPage'
import { AdminPage }           from './components/AdminPage'
import { Spinner }             from './components/UI'

function AppInner() {
  const { user, loading, saveCheckin } = useApp()
  const [page,       setPage]       = useState('dashboard')
  const [lastResult, setLastResult] = useState(null)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 52, marginBottom: 16 }}>🧠</p>
          <Spinner green size={28} />
          <p style={{ fontFamily: "'Lora', serif", color: 'var(--green)', fontSize: 16, marginTop: 14 }}>Loading Countor…</p>
        </div>
      </div>
    )
  }

  if (!user) return <AuthScreen />

  const handleCheckinComplete = (result) => {
    saveCheckin(result)
    setLastResult(result)
    setPage('results')
  }

  // Chat screen takes full viewport — no nav
  if (page === 'chat') {
    return (
      <ChatScreen
        onComplete={handleCheckinComplete}
        onBack={() => setPage('dashboard')}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <TopNav currentPage={page} onNavigate={setPage} />

      <main style={{ maxWidth: 760, margin: '0 auto' }}>
        {page === 'dashboard'  && <Dashboard onStartCheckin={() => setPage('chat')} />}
        {page === 'checkin'    && <Dashboard onStartCheckin={() => setPage('chat')} />}
        {page === 'therapists' && <TherapistDirectory />}
        {page === 'streaks'    && <StreaksPage onStartCheckin={() => setPage('chat')} />}
        {page === 'admin'      && <AdminPage />}
        {page === 'results' && lastResult && (
          <ResultsScreen
            result={lastResult}
            onDashboard={() => setPage('dashboard')}
            onRetake={() => setPage('chat')}
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
