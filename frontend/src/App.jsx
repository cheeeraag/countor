import logoImg from './assets/logo.png' 
import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
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
import { TermsOfService }               from './components/TermsOfService' 
import { PrivacyPolicy }                from './components/PrivacyPolicy'
import { Footer }                       from './components/Footer'

function AppInner() {
  const { user, saveCheckin, isAdmin } = useApp()
  const [page, setPage]       = useState('dashboard') 
  const [subPage, setSubPage] = useState(null)
  const [lastResult, setLastResult] = useState(null)

  if (!user) return <AuthScreen />

  if (page === 'checkin' && subPage === 'intro') {
    return <QuestionnaireIntro onStart={() => setSubPage('questions')} onBack={() => setPage('dashboard')} />
  }

  if (page === 'checkin' && subPage === 'questions') {
    return (
      <CheckinQuestionnaire 
        onComplete={async (answers) => {
          try {
            // The backend calculates everything, we just send the 30 answers
            const res = await saveCheckin({ answers })
            setLastResult(res) // res now contains { checkin, recommendations }
            setPage('results')
            setSubPage(null)
          } catch (e) {
            console.error('Failed to save check-in:', e)
          }
        }}
        onBack={() => setSubPage('intro')}
      />
    )
  }

  const startCheckin = () => { setPage('checkin'); setSubPage('intro') }

  const navigate = (p) => {
    if (p === 'admin' && !isAdmin) return
    setPage(p)
    setSubPage(null)
    if (p === 'checkin') setSubPage('intro')
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--cream)' }}>
      <TopNav currentPage={page} onNavigate={navigate} />
      <main style={{ maxWidth:760, margin:'0 auto', width: '100%', flex: 1 }}>
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
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
      <Analytics />
    </AppProvider>
  )
}
