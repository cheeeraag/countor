require('dotenv').config()

const express = require('express')
const cors    = require('cors')

const authRoutes      = require('./routes/auth')
const orgRoutes       = require('./routes/orgs')
const checkinRoutes   = require('./routes/checkins')
const communityRoutes = require('./routes/community')
const adminRoutes     = require('./routes/admin')
const referralRoutes  = require('./routes/referrals')   // ← NEW

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim()),
  credentials: true,
}))
app.use(express.json())

// ── Request logger (dev only) ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
  })
}

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/orgs',     orgRoutes)
app.use('/api/checkins', checkinRoutes)
app.use('/api/posts',    communityRoutes)   // posts + comments nested here
app.use('/api/comments', communityRoutes)   // comment upvote / delete
app.use('/api/admin',    adminRoutes)
app.use('/api/referral', referralRoutes)    // ← NEW

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// ── 404 catch-all ─────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))

// ── Error handler ─────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Countor API running on http://localhost:${PORT}`)
  console.log(`    SUPERADMIN_EMAIL = ${process.env.SUPERADMIN_EMAIL}`)
  console.log(`    DB               = ${process.env.DATABASE_URL ? 'connected' : '⚠️  DATABASE_URL not set'}`)
})
