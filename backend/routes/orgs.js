const router = require('express').Router()
const pool   = require('../db')
const { requireSuperAdmin, verifyToken } = require('../middleware/auth')
const { requireUser } = require('../middleware/roles')

// ── GET /api/orgs/approved — public list for signup dropdown ──────────────
router.get('/approved', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name FROM organisations WHERE approved = true ORDER BY name`
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── GET /api/orgs — superadmin: all orgs with member counts ───────────────
router.get('/', requireSuperAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        o.*,
        COUNT(u.id)::int AS member_count,
        COUNT(c.id)::int AS checkin_count
      FROM organisations o
      LEFT JOIN users u ON u.org_id = o.id AND u.role NOT IN ('superadmin')
      LEFT JOIN checkins c ON c.user_id = u.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── PUT /api/orgs/:id/approve — superadmin approves org ──────────────────
router.put('/:id/approve', requireSuperAdmin, async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`UPDATE organisations SET approved = true  WHERE id = $1`, [req.params.id])
    await client.query(`UPDATE users SET role = 'org_admin', approved = true WHERE org_id = $1 AND role = 'org_admin_pending'`, [req.params.id])
    await client.query('COMMIT')
    res.json({ message: 'Organisation approved.' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  } finally {
    client.release()
  }
})

// ── PUT /api/orgs/:id/reject — superadmin rejects org ────────────────────
router.put('/:id/reject', requireSuperAdmin, async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`DELETE FROM organisations WHERE id = $1`, [req.params.id])
    await client.query(`UPDATE users SET role = 'rejected' WHERE org_id = $1`, [req.params.id])
    await client.query('COMMIT')
    res.json({ message: 'Organisation rejected.' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  } finally {
    client.release()
  }
})

module.exports = router
