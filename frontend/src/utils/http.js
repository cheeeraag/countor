const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const token = {
  get: () => localStorage.getItem('countor_token'),
  set: (t) => localStorage.setItem('countor_token', t),
  remove: () => localStorage.removeItem('countor_token'),
}

async function req(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }
  const t = token.get()
  if (t) headers['Authorization'] = `Bearer ${t}`
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body !== null ? JSON.stringify(body) : undefined })
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('text/csv')) {
    if (!res.ok) throw new Error('Export failed')
    return res.blob()
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const http = { get: path => req('GET', path), post: (path, body) => req('POST', path, body), put: (path, body) => req('PUT', path, body), delete: path => req('DELETE', path) }

export const authAPI = { signup: body => http.post('/api/auth/signup', body), login: body => http.post('/api/auth/login', body), me: () => http.get('/api/auth/me') }
export const orgsAPI = { approved: () => http.get('/api/orgs/approved'), all: () => http.get('/api/orgs'), approve: id => http.put(`/api/orgs/${id}/approve`), reject: id => http.put(`/api/orgs/${id}/reject`) }
export const checkinsAPI = { save: body => http.post('/api/checkins', body), history: () => http.get('/api/checkins'), recommendations: () => http.get('/api/checkins/recommendations') }
export const communityAPI = {
  posts: (category, sort) => http.get(`/api/posts?category=${category || 'all'}&sort=${sort || 'new'}`),
  createPost: body => http.post('/api/posts', body), deletePost: id => http.delete(`/api/posts/${id}`), upvotePost: id => http.post(`/api/posts/${id}/upvote`),
  comments: postId => http.get(`/api/posts/${postId}/comments`), createComment: (postId, body) => http.post(`/api/posts/${postId}/comments`, body), deleteComment: id => http.delete(`/api/comments/${id}`), upvoteComment: id => http.post(`/api/comments/${id}/upvote`)
}
export const adminAPI = {
  stats: orgId => http.get(`/api/admin/stats${orgId ? `?orgId=${orgId}` : ''}`),
  users: orgId => http.get(`/api/admin/users${orgId ? `?orgId=${orgId}` : ''}`),
  exportCSV: async (orgId, userId) => {
    const params = new URLSearchParams(); if (orgId) params.set('orgId', orgId); if (userId) params.set('userId', userId)
    const blob = await req('GET', `/api/admin/export?${params}`); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url
    a.download = orgId ? 'countor_org.csv' : userId ? 'countor_user.csv' : 'countor_all.csv'; a.click(); URL.revokeObjectURL(url)
  },
}
export const referralAPI = {
  click: (companyId, companyName, tier, source, destinationUrl) => http.post('/api/referral/click', { companyId, companyName, tier, source, destinationUrl }),
  stats: orgId => http.get(`/api/referral/stats${orgId ? `?orgId=${orgId}` : ''}`),
}
export async function openReferral(company, tier, source = 'results') {
  const destUrl = company.affiliateUrl || company.url; if (!destUrl || destUrl === '#') return
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag('event', 'referral_click', { event_category: 'outbound_referral', company_id: company.id, company_name: company.name, user_tier: tier, source_location: source })
  try { const { url } = await referralAPI.click(company.id, company.name, tier, source, destUrl); window.open(url, '_blank', 'noopener,noreferrer') }
  catch { window.open(destUrl, '_blank', 'noopener,noreferrer') }
}
