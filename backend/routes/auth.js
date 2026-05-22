const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const pool    = require('../db')

const sign = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, orgId: user.org_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

// ── POST /api/auth/signup ──────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { name, email, password, role: requestedRole, orgName, orgId } = req.body

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required.' })
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })

  try {
    // Duplicate check
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (exists.rows.length) return res.status(409).json({ error: 'Account already exists. Please log in.' })

    const hash = await bcrypt.hash(password, 12)

    // ── Superadmin ────────────────────────────────────────────────────────
    if (email === process.env.SUPERADMIN_EMAIL) {
      const { rows } = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, approved)
         VALUES ($1,$2,$3,'superadmin',true) RETURNING *`,
        [name, email, hash]
      )
      return res.json({ token: sign(rows[0]), user: safe(rows[0]) })
    }

    // ── Org admin request ─────────────────────────────────────────────────
    if (requestedRole === 'org_admin') {
      if (!orgName?.trim()) return res.status(400).json({ error: 'Organisation name is required.' })

      const { rows: orgRows } = await pool.query(
        `INSERT INTO organisations (name, admin_email, admin_name, approved)
         VALUES ($1,$2,$3,false) RETURNING *`,
        [orgName.trim(), email, name]
      )
      const org = orgRows[0]

      const { rows: userRows } = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, org_id, approved)
         VALUES ($1,$2,$3,'org_admin_pending',$4,false) RETURNING *`,
        [name, email, hash, org.id]
      )
      return res.status(202).json({
        pending: true,
        message: 'Organisation request submitted. Awaiting superadmin approval.',
        user: safe(userRows[0]),
      })
    }

    // ── Regular user ──────────────────────────────────────────────────────
    const resolvedOrgId = orgId || null
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, org_id, approved)
       VALUES ($1,$2,$3,'user',$4,true) RETURNING *`,
      [name, email, hash, resolvedOrgId]
    )
    return res.json({ token: sign(rows[0]), user: safe(rows[0]) })

  } catch (err) {
    console.error('signup error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (!rows.length) return res.status(401).json({ error: 'No account found. Please sign up.' })

    const user = rows[0]
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) return res.status(401).json({ error: 'Incorrect password.' })

    if (user.role === 'rejected')
      return res.status(403).json({ error: 'Your organisation request was not approved.' })

    if (user.role === 'org_admin_pending')
      return res.status(202).json({ pending: true, user: safe(user) })

    res.json({ token: sign(user), user: safe(user) })
  } catch (err) {
    console.error('login error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  const header = req.headers['authorization']
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [payload.id])
    if (!rows.length) return res.status(404).json({ error: 'User not found' })
    res.json({ user: safe(rows[0]) })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────
function safe(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, orgId: u.org_id, approved: u.approved }
}

module.exports = router
