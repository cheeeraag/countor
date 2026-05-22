import { createContext, useContext, useState, useEffect } from 'react'
import { token, authAPI, checkinsAPI } from '../utils/http'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      if (!token.get()) { setLoading(false); return }
      try {
        const { user: u } = await authAPI.me()
        setUser(u)
        if (!['org_admin_pending', 'rejected'].includes(u.role)) {
          const h = await checkinsAPI.history()
          setHistory(h)
        }
      } catch {
        token.remove() // expired or invalid
      }
      setLoading(false)
    }
    restore()
  }, [])

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    const res = await authAPI.login(credentials)
    if (res.pending) return { pending: true, user: res.user }
    token.set(res.token)
    setUser(res.user)
    if (!['org_admin_pending', 'rejected'].includes(res.user.role)) {
      const h = await checkinsAPI.history()
      setHistory(h)
    }
    return { pending: false, user: res.user }
  }

  // ── Signup ───────────────────────────────────────────────────────────────
  const signup = async (formData) => {
    const res = await authAPI.signup(formData)
    if (res.pending) return { pending: true, user: res.user }
    token.set(res.token)
    setUser(res.user)
    setHistory([])
    return { pending: false, user: res.user }
  }

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    token.remove()
    setUser(null)
    setHistory([])
  }

  // ── Save check-in ────────────────────────────────────────────────────────
  const saveCheckin = async (result) => {
    const entry = await checkinsAPI.save(result)
    // Refresh history after saving
    const h = await checkinsAPI.history()
    setHistory(h)
    return entry
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isSuperAdmin = user?.role === 'superadmin'
  const isOrgAdmin   = user?.role === 'org_admin'
  const isAdmin      = isSuperAdmin || isOrgAdmin
  const isPending    = user?.role === 'org_admin_pending'
  const isRejected   = user?.role === 'rejected'

  return (
    <AppContext.Provider value={{
      user, history, loading,
      login, signup, logout, saveCheckin,
      isSuperAdmin, isOrgAdmin, isAdmin, isPending, isRejected,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
