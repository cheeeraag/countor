import { createContext, useContext, useState, useEffect } from 'react'
import { token, authAPI, checkinsAPI } from '../utils/http'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [history, setHistory] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

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
        token.remove()
      }
      setLoading(false)
    }
    restore()
  }, [])

  const login = async (credentials) => {
    const res = await authAPI.login(credentials)
    if (res.token) {
      token.set(res.token)
      setUser(res.user)
    }
    if (!['org_admin_pending', 'rejected'].includes(res.user.role)) {
      const h = await checkinsAPI.history()
      setHistory(h)
    }
    return res
  }

  const signup = async (formData) => {
    const res = await authAPI.signup(formData)
    if (res.token) {
      token.set(res.token)
      setUser(res.user)
    }
    setHistory([])
    setRecommendations([])
    return res
  }

  const logout = () => {
    token.remove()
    setUser(null)
    setHistory([])
    setRecommendations([])
  }

  const saveCheckin = async (result) => {
    const entry = await checkinsAPI.save(result)
    const h = await checkinsAPI.history()
    setHistory(h)
    setRecommendations(entry?.recommendations || [])
    return entry
  }

  const isSuperAdmin = user?.role === 'superadmin'
  const isOrgAdmin = user?.role === 'org_admin'
  const isAdmin = isSuperAdmin || isOrgAdmin
  const isPending = user?.role === 'org_admin_pending'
  const isRejected = user?.role === 'rejected'

  return (
    <AppContext.Provider value={{
      user, history, recommendations, loading,
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
