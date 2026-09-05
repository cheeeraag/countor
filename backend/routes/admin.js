const router = require('express').Router()
const pool = require('../db')
const { requireAdmin } = require('../middleware/roles')

function orgScope(req) {
  const requested = req.query.orgId || req.user.orgId || req.user.org_id
  if (req.user.role === 'org_admin' && !requested) return { clause: '', params: [], error: 'Missing Organization ID' }
  return req.user.role === 'org_admin'
    ? { clause: 'AND u.org_id = $1', params: [requested] }
    : requested
      ? { clause: 'AND u.org_id = $1', params: [requested] }
      : { clause: '', params: [] }
}

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const scope = orgScope(req)
    if (scope.error) return res.status(400).json({ error: scope.error })
    const today = new Date().toISOString().split('T')[0]
    const userClause = scope.clause
    const userParams = scope.params
    const checkinClause = scope.clause
    const checkinParams = scope.params
    const dailyJoin = scope.params.length
      ? `AND c.user_id IN (SELECT id FROM users WHERE org_id=$1 AND role='user')`
      : ''

    const [users, checkins, today_, avgScores, safetyAlerts, active30, daily7] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM users u WHERE u.role='user' ${userClause}`, userParams),
      pool.query(`SELECT COUNT(*)::int AS count FROM checkins c JOIN users u ON u.id=c.user_id WHERE 1=1 ${checkinClause}`, checkinParams),
      pool.query(`SELECT COUNT(*)::int AS count FROM checkins c JOIN users u ON u.id=c.user_id WHERE c.date=$${userParams.length + 1} ${userClause}`, [...userParams, today]),
      pool.query(`SELECT ROUND(AVG(c.y_score_norm))::int AS avg_wellbeing, ROUND(AVG(c.x_score_norm))::int AS avg_distress FROM checkins c JOIN users u ON u.id=c.user_id WHERE 1=1 ${checkinClause}`, checkinParams),
      pool.query(`SELECT COUNT(DISTINCT c.user_id)::int AS risk_count FROM checkins c JOIN users u ON u.id=c.user_id WHERE c.suicidality_flag=true AND c.date=$${userParams.length + 1} ${userClause}`, [...userParams, today]),
      pool.query(`SELECT COUNT(DISTINCT c.user_id)::int AS count FROM checkins c JOIN users u ON u.id=c.user_id WHERE c.date >= CURRENT_DATE - INTERVAL '30 days' ${userClause}`, userParams),
      pool.query(`SELECT TO_CHAR(d.day,'YYYY-MM-DD') AS date, COUNT(c.id)::int AS checkins FROM generate_series(NOW()::date - INTERVAL '6 days', NOW()::date, '1 day') AS d(day) LEFT JOIN checkins c ON c.date=d.day::date ${dailyJoin} GROUP BY d.day ORDER BY d.day`, scope.params)
    ])

    const totalUsers = users.rows[0].count
    const activeUsers = active30.rows[0].count
    res.json({
      users: totalUsers,
      activeUsers,
      checkins: checkins.rows[0].count,
      today: today_.rows[0].count,
      avgWellbeing: avgScores.rows[0].avg_wellbeing || 0,
      avgDistress: avgScores.rows[0].avg_distress || 0,
      safetyAlerts: safetyAlerts.rows[0].risk_count || 0,
      daily7: daily7.rows,
      checkinRate: totalUsers ? Math.round((activeUsers / totalUsers) * 100) : 0,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load stats' })
  }
})

// Privacy-safe activity summary. No names, emails, raw scores, or individual risk labels are returned.
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const scope = orgScope(req)
    if (scope.error) return res.status(400).json({ error: scope.error })
    const { rows } = await pool.query(`
      SELECT COALESCE(o.name,'Platform') AS org_name,
             COUNT(DISTINCT u.id)::int AS member_count,
             COUNT(c.id)::int AS checkin_count,
             COUNT(DISTINCT CASE WHEN c.date >= CURRENT_DATE - INTERVAL '30 days' THEN u.id END)::int AS active_30d,
             MAX(c.date) AS latest_checkin
      FROM users u
      LEFT JOIN organisations o ON o.id=u.org_id
      LEFT JOIN checkins c ON c.user_id=u.id
      WHERE u.role='user' ${scope.clause}
      GROUP BY o.id,o.name
      ORDER BY member_count DESC
    `, scope.params)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch privacy-safe analytics' })
  }
})

// Exports are aggregate-only. Organization admins never receive employee-level exports.
router.get('/export', requireAdmin, async (req, res) => {
  try {
    const scope = orgScope(req)
    if (scope.error) return res.status(400).json({ error: scope.error })
    const { rows } = await pool.query(`
      SELECT COALESCE(o.name,'Platform') AS organisation,
             COUNT(DISTINCT u.id)::int AS members,
             COUNT(DISTINCT CASE WHEN c.date >= CURRENT_DATE - INTERVAL '30 days' THEN u.id END)::int AS active_30d,
             COUNT(c.id)::int AS checkins,
             ROUND(AVG(c.y_score_norm))::int AS avg_wellbeing,
             ROUND(AVG(c.x_score_norm))::int AS avg_distress
      FROM users u
      LEFT JOIN organisations o ON o.id=u.org_id
      LEFT JOIN checkins c ON c.user_id=u.id
      WHERE u.role='user' ${scope.clause}
      GROUP BY o.id,o.name ORDER BY organisation
    `, scope.params)
    const headers = ['Organisation','Members','Active (30d)','Check-ins','Average Wellness %','Average Distress %']
    const csvRows = rows.map(r => [r.organisation,r.members,r.active_30d,r.checkins,r.avg_wellbeing ?? '',r.avg_distress ?? ''])
    const csv = [headers,...csvRows].map(row => row.map(v => `"${String(v).replace(/"/g,"'")}"`).join(',')).join('\n')
    res.setHeader('Content-Type','text/csv')
    res.setHeader('Content-Disposition','attachment; filename="countor_aggregate_report.csv"')
    res.send(csv)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Export failed' })
  }
})

module.exports = router
