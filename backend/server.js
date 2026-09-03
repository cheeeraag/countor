require('node:dns').setDefaultResultOrder('ipv4first');
require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const authRoutes      = require('./routes/auth');
const orgRoutes       = require('./routes/orgs');
const checkinRoutes   = require('./routes/checkins');
const communityRoutes = require('./routes/community');
const adminRoutes     = require('./routes/admin');
const referralRoutes  = require('./routes/referrals');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────
const corsOptions = {
  origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim()),
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Voice recordings are sent as base64 JSON. Keep this comfortably above the
// 15 MB audio safety limit enforced by the check-in route.
app.use(express.json({ limit: '20mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/orgs',     orgRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/posts',    communityRoutes);
app.use('/api/comments', communityRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/referral', referralRoutes);

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.get('/api/health', (_req, res) => res.status(200).send('OK'));

// ── 404 catch-all ─────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Error handler ─────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅  Countor API running on http://localhost:${PORT}`);
  console.log(`    SUPERADMIN_EMAIL = ${process.env.SUPERADMIN_EMAIL}`);
  console.log(`    DB               = ${process.env.DATABASE_URL ? 'connected' : '⚠️  DATABASE_URL not set'}`);
});
