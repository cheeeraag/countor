// ─── Storage Utility ─────────────────────────────────────────────────────────
// Wraps localStorage with JSON helpers and namespacing.

const NS = 'countor_'

export const storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(NS + key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(NS + key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  remove(key) {
    try { localStorage.removeItem(NS + key) } catch {}
  },
  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(NS))
      .forEach(k => localStorage.removeItem(k))
  },
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export function getSession() {
  return storage.get('session')
}

export function setSession(user) {
  storage.set('session', user)
}

export function clearSession() {
  storage.remove('session')
}

export function getUsers() {
  return storage.get('users') || {}
}

export function saveUser(email, data) {
  const users = getUsers()
  users[email] = data
  storage.set('users', users)
}

// ─── Score history ────────────────────────────────────────────────────────────
const histKey = (email) => `history_${email.replace(/[@.]/g, '_')}`

export function getHistory(email) {
  return storage.get(histKey(email)) || []
}

export function saveHistory(email, history) {
  // Keep max 365 entries
  const trimmed = history.slice(-365)
  storage.set(histKey(email), trimmed)
}

export function addEntry(email, entry) {
  const today = new Date().toISOString().split('T')[0]
  let history = getHistory(email).filter(h => h.date !== today)
  history.push({ ...entry, date: today, ts: Date.now() })
  history.sort((a, b) => new Date(a.date) - new Date(b.date))
  saveHistory(email, history)
  return history
}

// ─── Admin helpers ────────────────────────────────────────────────────────────
export function getAllData() {
  const users = getUsers()
  const result = []
  Object.keys(users).forEach(email => {
    const history = getHistory(email)
    history.forEach(h => {
      result.push({
        email,
        name: users[email]?.name || '',
        date: h.date,
        score: h.score,
        tier: h.tier,
        summary: h.summary,
        timestamp: h.ts,
      })
    })
  })
  return result.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function exportCSV(email = null) {
  const data = email
    ? getHistory(email).map(h => ({ email, date: h.date, score: h.score, tier: h.tier, summary: h.summary, timestamp: h.ts }))
    : getAllData()

  const headers = ['Date', 'Name', 'Email', 'Score', 'Tier', 'Summary', 'Timestamp']
  const rows = data.map(d => [
    d.date,
    d.name || '',
    d.email,
    d.score,
    d.tier,
    `"${(d.summary || '').replace(/"/g, "'")}"`,
    d.timestamp ? new Date(d.timestamp).toISOString() : '',
  ])

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = email ? `countor_${email}_export.csv` : `countor_all_users_export.csv`
  a.click()
  URL.revokeObjectURL(url)
}
