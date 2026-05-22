const router = require('express').Router()
const pool   = require('../db')
const { verifyToken } = require('../middleware/auth')
const { requireUser } = require('../middleware/roles')

// ── POST /api/checkins — save today's check-in (upsert) ──────────────────
router.post('/', requireUser, async (req, res) => {
  const { score, raw, depression, anxiety, tier, answers } = req.body
  const today = new Date().toISOString().split('T')[0]

  try {
    const { rows } = await pool.query(
      `INSERT INTO checkins (user_id, date, score, raw, depression, anxiety, tier, answers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, date)
       DO UPDATE SET score=$3, raw=$4, depression=$5, anxiety=$6, tier=$7, answers=$8, created_at=NOW()
       RETURNING *`,
      [req.user.id, today, score, raw, depression, anxiety, tier, JSON.stringify(answers || {})]
    )
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save check-in' })
  }
})

// ── GET /api/checkins — current user's full history ───────────────────────
router.get('/', requireUser, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT date, score, raw, depression, anxiety, tier,
              EXTRACT(EPOCH FROM created_at)*1000 AS ts
       FROM checkins
       WHERE user_id = $1
       ORDER BY date ASC`,
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

module.exports = router
