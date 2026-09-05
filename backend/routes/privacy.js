const router = require('express').Router()
const pool = require('../db')
const { requireUser } = require('../middleware/roles')
const { ensurePrivacySchema } = require('../utils/privacy')

router.put('/', requireUser, async (req, res) => {
  try {
    await ensurePrivacySchema()
    const directoryVisible = req.body?.directoryVisible !== false
    const { rows } = await pool.query(`UPDATE users SET directory_visible=$1 WHERE id=$2 RETURNING department,directory_visible`, [directoryVisible, req.user.id])
    res.json({ department: rows[0]?.department || null, directoryVisible: rows[0]?.directory_visible !== false })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not update privacy settings' })
  }
})

module.exports = router
