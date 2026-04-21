import { createContext, useContext, useState, useEffect } from 'react'
import { getSession, setSession, clearSession, getHistory, addEntry } from '../utils/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [history, setHistory]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [lastResult, setLastResult] = useState(null)

  // Restore session on load
  useEffect(() => {
    const session = getSession()
    if (session) {
      setUser(session)
      setHistory(getHistory(session.email))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setSession(userData)
    setUser(userData)
    setHistory(getHistory(userData.email))
  }

  const logout = () => {
    clearSession()
    setUser(null)
    setHistory([])
    setLastResult(null)
  }

  const saveCheckin = (result) => {
    const updated = addEntry(user.email, result)
    setHistory(updated)
    setLastResult(result)
    return updated
  }

  const todayEntry = () => {
    const today = new Date().toISOString().split('T')[0]
    return history.find(h => h.date === today) || null
  }

  return (
    <AppContext.Provider value={{ user, history, loading, lastResult, login, logout, saveCheckin, todayEntry }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
