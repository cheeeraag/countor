require('node:dns').setDefaultResultOrder('ipv4first');

// ... the rest of your imports (express, cors, etc.)
// const express = require('express');
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
// ── Middleware ────────────────────────────────────────────────────────────

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (e.g., Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // 2. If the origin matches our allowed list, let it through
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } 
    
    // 3. If it fails, print the exact mismatch to Railway Deploy Logs!
    console.error(`🚨 CORS BLOCKED!`);
    console.error(`➡️ Incoming Request Origin: "${origin}"`);
    console.error(`✅ Allowed Origins List:`, allowedOrigins);
    
    // Reject the request
    return callback(null, false);
  },
  credentials: true,
}));

app.use(express.json())

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
app.get('/api/health', (req, res) => res.status(200).send('OK'));

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
