const router = require('express').Router()
const pool   = require('../db')
const { optionalToken } = require('../middleware/auth')

// ── POST /api/referral/click — log a referral click ───────────────────────
// Called before opening the partner URL.
// Returns the destination URL so the frontend can open it.
router.post('/click', optionalToken, async (req, res) => {
  const { companyId, companyName, tier, source, destinationUrl } = req.body

  if (!companyId || !destinationUrl) {
    return res.status(400).json({ error: 'companyId and destinationUrl are required.' })
  }

  // Append UTM params to the destination URL
  let url
  try {
    url = new URL(destinationUrl)
    url.searchParams.set('utm_source',   'countor')
    url.searchParams.set('utm_medium',   'referral')
    url.searchParams.set('utm_campaign', tier || 'general')
    url.searchParams.set('utm_content',  companyId)
  } catch {
    return res.status(400).json({ error: 'Invalid destination URL.' })
  }

  const trackedUrl = url.toString()

  try {
    await pool.query(
      `INSERT INTO referral_clicks (user_id, company_id, company_name, tier, source, referral_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user?.id || null, companyId, companyName, tier || null, source || 'results', trackedUrl]
    )
  } catch (err) {
    // Don't block the redirect if DB insert fails
    console.error('referral click log error:', err)
  }

  res.json({ url: trackedUrl })
})

// ── GET /api/referral/stats — admin: referral analytics ──────────────────
router.get('/stats', async (req, res) => {
  // Minimal auth check
  const jwt = require('jsonwebtoken')
  const header = req.headers['authorization']
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    if (!['superadmin', 'org_admin'].includes(payload.role)) return res.status(403).json({ error: 'Forbidden' })

    const orgFilter = payload.role === 'org_admin'
      ? `AND rc.user_id IN (SELECT id FROM users WHERE org_id = '${payload.orgId}')`
      : ''

    const [totals, byCompany, byTier, daily30] = await Promise.all([
      // Overall totals
      pool.query(`
        SELECT
          COUNT(*)::int                                        AS total_clicks,
          COUNT(DISTINCT company_id)::int                     AS companies_clicked,
          COUNT(DISTINCT user_id)::int                        AS unique_users
        FROM referral_clicks rc WHERE 1=1 ${orgFilter}
      `),

      // Clicks per company (top 10)
      pool.query(`
        SELECT
          company_id, company_name,
          COUNT(*)::int            AS clicks,
          COUNT(DISTINCT user_id)::int AS unique_users,
          MAX(created_at)          AS last_click
        FROM referral_clicks rc
        WHERE 1=1 ${orgFilter}
        GROUP BY company_id, company_name
        ORDER BY clicks DESC
        LIMIT 10
      `),

      // Clicks per tier
      pool.query(`
        SELECT tier, COUNT(*)::int AS clicks
        FROM referral_clicks rc
        WHERE tier IS NOT NULL ${orgFilter}
        GROUP BY tier ORDER BY clicks DESC
      `),

      // Daily clicks last 30 days
      pool.query(`
        SELECT
          TO_CHAR(d.day,'YYYY-MM-DD') AS date,
          COUNT(rc.id)::int            AS clicks
        FROM generate_series(
          NOW()::date - INTERVAL '29 days', NOW()::date, '1 day'
        ) AS d(day)
        LEFT JOIN referral_clicks rc ON rc.created_at::date = d.day::date ${orgFilter.replace('AND rc.', 'AND ')}
        GROUP BY d.day ORDER BY d.day
      `),
    ])

    res.json({
      totals:    totals.rows[0],
      byCompany: byCompany.rows,
      byTier:    byTier.rows,
      daily30:   daily30.rows,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load referral stats' })
  }
})

module.exports = router
