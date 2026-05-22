const router = require('express').Router()
const pool   = require('../db')
const { requireSuperAdmin, requireAdmin } = require('../middleware/roles')
const { Parser } = require('json2csv').default || require('json2csv')

// ── GET /api/admin/stats — overview numbers ───────────────────────────────
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // FIX: Use req.user.org_id instead of orgId
    const safeOrgId = req.user.org_id || req.user.orgId;
    const orgFilter = req.user.role === 'org_admin' ? `AND u.org_id = '${safeOrgId}'` : ''
    const today     = new Date().toISOString().split('T')[0]

    const [users, checkins, today_, avgScore, tierDist, daily7] = await Promise.all([
      // total users
      pool.query(`SELECT COUNT(*)::int AS count FROM users u WHERE u.role = 'user' ${orgFilter}`),
      // total check-ins
      pool.query(`SELECT COUNT(*)::int AS count FROM checkins c JOIN users u ON u.id=c.user_id WHERE 1=1 ${orgFilter}`),
      // today's check-ins
      pool.query(`SELECT COUNT(*)::int AS count FROM checkins c JOIN users u ON u.id=c.user_id WHERE c.date='${today}' ${orgFilter}`),
      // average score
      pool.query(`SELECT ROUND(AVG(c.score))::int AS avg FROM checkins c JOIN users u ON u.id=c.user_id WHERE 1=1 ${orgFilter}`),
      // tier distribution
      pool.query(`SELECT c.tier, COUNT(*)::int AS count FROM checkins c JOIN users u ON u.id=c.user_id WHERE 1=1 ${orgFilter} GROUP BY c.tier`),
      // last 7 days activity
      pool.query(`
        SELECT
          TO_CHAR(d.day,'YYYY-MM-DD') AS date,
          COUNT(c.id)::int AS checkins
        FROM generate_series(
          NOW()::date - INTERVAL '6 days', NOW()::date, '1 day'
        ) AS d(day)
        LEFT JOIN checkins c ON c.date = d.day::date
          ${orgFilter.replace('AND u.', 'AND (SELECT org_id FROM users WHERE id=c.user_id) IS NOT NULL AND (SELECT org_id FROM users WHERE id=c.user_id)::text ')}
        GROUP BY d.day ORDER BY d.day
      `)
    ])

    res.json({
      users:      users.rows[0].count,
      checkins:   checkins.rows[0].count,
      today:      today_.rows[0].count,
      avgScore:   avgScore.rows[0].avg,
      tierDist:   tierDist.rows,
      daily7:     daily7.rows,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load stats' })
  }
})

// ── GET /api/admin/users — users list ─────────────────────────────────────
router.get('/users', requireAdmin, async (req, res) => {
  // FIX: Use req.user.org_id instead of orgId
  const safeOrgId = req.user.org_id || req.user.orgId;
  const orgFilter = req.user.role === 'org_admin' ? `AND u.org_id = $1` : ''
  const params    = req.user.role === 'org_admin' ? [safeOrgId] : []

  try {
    const { rows } = await pool.query(`
      SELECT
        u.id, u.name, u.email, u.role, u.org_id, u.created_at,
        o.name AS org_name,
        COUNT(c.id)::int       AS checkin_count,
        MAX(c.date)            AS last_checkin,
        ROUND(AVG(c.score))::int AS avg_score,
        (SELECT tier FROM checkins WHERE user_id=u.id ORDER BY date DESC LIMIT 1) AS last_tier
      FROM users u
      LEFT JOIN organisations o ON o.id = u.org_id
      LEFT JOIN checkins c ON c.user_id = u.id
      WHERE u.role NOT IN ('superadmin','org_admin_pending','rejected') ${orgFilter}
      GROUP BY u.id, o.name
      ORDER BY u.created_at DESC
    `, params)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// ── GET /api/admin/export?orgId=&userId= — CSV download ──────────────────
router.get('/export', requireAdmin, async (req, res) => {
  const { orgId, userId } = req.query

  // FIX: Use req.user.org_id instead of orgId
  const safeOrgId = req.user.org_id || req.user.orgId;
  
  // Org admins can only export their own org
  const effectiveOrgId = req.user.role === 'org_admin' ? safeOrgId : orgId

  try {
    let query, params

    if (userId) {
      // Single user export
      query  = `SELECT u.name, u.email, o.name AS org, c.date, c.score, c.raw, c.depression, c.anxiety, c.tier, c.created_at
                FROM checkins c JOIN users u ON u.id=c.user_id LEFT JOIN organisations o ON o.id=u.org_id
                WHERE u.id=$1 ORDER BY c.date DESC`
      params = [userId]
    } else if (effectiveOrgId) {
      // Org export
      query  = `SELECT u.name, u.email, o.name AS org, c.date, c.score, c.raw, c.depression, c.anxiety, c.tier, c.created_at
                FROM checkins c JOIN users u ON u.id=c.user_id LEFT JOIN organisations o ON o.id=u.org_id
                WHERE u.org_id=$1 ORDER BY c.date DESC`
      params = [effectiveOrgId]
    } else if (req.user.role === 'superadmin') {
      // All data
      query  = `SELECT u.name, u.email, o.name AS org, c.date, c.score, c.raw, c.depression, c.anxiety, c.tier, c.created_at
                FROM checkins c JOIN users u ON u.id=c.user_id LEFT JOIN organisations o ON o.id=u.org_id
                ORDER BY c.date DESC`
      params = []
    } else {
      return res.status(403).json({ error: 'Not authorised' })
    }

    const { rows } = await pool.query(query, params)

    // Build CSV manually (no extra deps)
    const headers = ['Date','Name','Email','Organisation','Wellness Score','Raw Score','Depression','Anxiety','Tier','Timestamp']
    const csvRows = rows.map(r => [
      r.date, r.name || '', r.email, r.org || 'Individual',
      r.score ?? '', r.raw ?? '', r.depression ?? '', r.anxiety ?? '', r.tier || '',
      r.created_at ? new Date(r.created_at).toISOString() : ''
    ])
    const csv = [headers, ...csvRows].map(r => r.map(v => `"${String(v).replace(/"/g,"'")}`).join(',')).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="countor_export.csv"`)
    res.send(csv)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Export failed' })
  }
})

module.exports = router
