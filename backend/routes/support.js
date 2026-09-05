const router = require('express').Router()
const pool = require('../db')
const { requireUser } = require('../middleware/roles')
const { ensurePrivacySchema, ensureMemberCode } = require('../utils/privacy')

async function ensureSupportReadColumns() {
  await pool.query(`
    ALTER TABLE support_messages
      ADD COLUMN IF NOT EXISTS member_read_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS admin_read_at TIMESTAMPTZ
  `)
}

router.get('/unread', requireUser, async (req, res) => {
  try {
    await ensurePrivacySchema()
    await ensureSupportReadColumns()
    const { rows } = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM support_messages m
      JOIN support_requests r ON r.id=m.request_id
      WHERE r.user_id=$1 AND m.sender_role='admin' AND m.member_read_at IS NULL`, [req.user.id])
    res.json({ count: rows[0]?.count || 0 })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load support notifications' })
  }
})

router.get('/', requireUser, async (req, res) => {
  try {
    await ensurePrivacySchema()
    await ensureSupportReadColumns()
    const { rows } = await pool.query(`
      SELECT r.id, r.status, r.reason, r.created_at, r.updated_at,
             COALESCE(json_agg(json_build_object(
               'id',m.id,
               'senderRole',m.sender_role,
               'message',m.message,
               'createdAt',m.created_at
             ) ORDER BY m.created_at) FILTER (WHERE m.id IS NOT NULL), '[]') AS messages
      FROM support_requests r
      LEFT JOIN support_messages m ON m.request_id=r.id
      WHERE r.user_id=$1
      GROUP BY r.id
      ORDER BY r.created_at DESC
      LIMIT 10`, [req.user.id])

    await pool.query(`
      UPDATE support_messages m
      SET member_read_at=NOW()
      FROM support_requests r
      WHERE m.request_id=r.id
        AND r.user_id=$1
        AND m.sender_role='admin'
        AND m.member_read_at IS NULL`, [req.user.id])

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load support requests' })
  }
})

router.post('/', requireUser, async (req, res) => {
  try {
    await ensurePrivacySchema()
    await ensureSupportReadColumns()
    const reason = String(req.body?.reason || 'General support').slice(0, 80)
    const { rows } = await pool.query(`
      INSERT INTO support_requests (user_id, reason)
      VALUES ($1,$2)
      RETURNING id, status, reason, created_at, updated_at`, [req.user.id, reason])
    const memberCode = await ensureMemberCode(req.user.id)
    res.status(201).json({ ...rows[0], memberCode, messages: [] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not create support request' })
  }
})

router.post('/:id/messages', requireUser, async (req, res) => {
  try {
    await ensurePrivacySchema()
    await ensureSupportReadColumns()
    const message = String(req.body?.message || '').trim()
    if (!message) return res.status(400).json({ error: 'Message is required' })
    const { rows } = await pool.query(`
      INSERT INTO support_messages (request_id, sender_role, message)
      SELECT r.id, 'member', $2
      FROM support_requests r WHERE r.id=$1 AND r.user_id=$3
      RETURNING id, request_id, sender_role, message, created_at`, [req.params.id, message.slice(0, 2000), req.user.id])
    if (!rows.length) return res.status(404).json({ error: 'Support request not found' })
    await pool.query(`UPDATE support_requests SET updated_at=NOW() WHERE id=$1`, [req.params.id])
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not send message' })
  }
})

module.exports = router
