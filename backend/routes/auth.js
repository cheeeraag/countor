const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const pool    = require('../db')
const { ensurePrivacySchema, ensureMemberCode } = require('../utils/privacy')

const sign = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role, orgId: user.org_id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
)

router.post('/signup', async (req, res) => {
  const { name, email, password, role: requestedRole, orgName, orgId, department, directoryVisible } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })

  try {
    await ensurePrivacySchema()
    const normalizedEmail = email.trim().toLowerCase()
    const exists = await pool.query('SELECT id, role, org_id FROM users WHERE email = $1', [normalizedEmail])
    if (exists.rows.length) {
      const existingUser = exists.rows[0]
      if (existingUser.role === 'rejected') {
        await pool.query('DELETE FROM users WHERE id = $1', [existingUser.id])
        if (existingUser.org_id) await pool.query('DELETE FROM organisations WHERE id = $1', [existingUser.org_id])
      } else return res.status(409).json({ error: 'Account already exists. Please log in.' })
    }

    const hash = await bcrypt.hash(password, 12)

    if (normalizedEmail === String(process.env.SUPERADMIN_EMAIL || '').trim().toLowerCase()) {
      const { rows } = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, approved) VALUES ($1,$2,$3,'superadmin',true) RETURNING *`,
        [name.trim(), normalizedEmail, hash]
      )
      const memberCode = await ensureMemberCode(rows[0].id)
      return res.json({ token: sign(rows[0]), user: safe(rows[0], memberCode) })
    }

    if (requestedRole === 'org_admin') {
      if (!orgName?.trim()) return res.status(400).json({ error: 'Organisation name is required.' })
      const { rows: orgRows } = await pool.query(
        `INSERT INTO organisations (name, admin_email, admin_name, approved) VALUES ($1,$2,$3,false) RETURNING *`,
        [orgName.trim(), normalizedEmail, name.trim()]
      )
      const org = orgRows[0]
      const { rows: userRows } = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, org_id, approved) VALUES ($1,$2,$3,'org_admin_pending',$4,false) RETURNING *`,
        [name.trim(), normalizedEmail, hash, org.id]
      )
      const memberCode = await ensureMemberCode(userRows[0].id)
      return res.status(202).json({ pending: true, token: sign(userRows[0]), user: safe(userRows[0], memberCode) })
    }

    let resolvedOrgId = orgId || null
    if (resolvedOrgId) {
      const { rows: orgRows } = await pool.query('SELECT id, approved, admin_email FROM organisations WHERE id=$1', [resolvedOrgId])
      if (!orgRows.length || !orgRows[0].approved) return res.status(400).json({ error: 'Please select an approved organisation.' })
      const emailDomain = normalizedEmail.split('@')[1]
      const orgAdminDomain = String(orgRows[0].admin_email || '').toLowerCase().split('@')[1]
      if (orgAdminDomain && emailDomain !== orgAdminDomain) {
        return res.status(400).json({ error: `Use your organisation email (${orgAdminDomain}) to join this organisation.` })
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, org_id, approved, department, directory_visible)
       VALUES ($1,$2,$3,'user',$4,true,$5,$6) RETURNING *`,
      [name.trim(), normalizedEmail, hash, resolvedOrgId, department?.trim() || null, directoryVisible !== false]
    )
    const memberCode = await ensureMemberCode(rows[0].id)
    return res.json({ token: sign(rows[0]), user: safe(rows[0], memberCode) })
  } catch (err) {
    console.error('signup error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })
  try {
    await ensurePrivacySchema()
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()])
    if (!rows.length) return res.status(401).json({ error: 'No account found. Please sign up.' })
    const user = rows[0]
    if (!await bcrypt.compare(password, user.password_hash)) return res.status(401).json({ error: 'Incorrect password.' })
    if (user.role === 'rejected') return res.status(403).json({ error: 'Your organisation request was rejected. Please sign up again to reapply.' })
    const memberCode = await ensureMemberCode(user.id)
    if (user.role === 'org_admin_pending') return res.status(202).json({ pending: true, token: sign(user), user: safe(user, memberCode) })
    res.json({ token: sign(user), user: safe(user, memberCode) })
  } catch (err) {
    console.error('login error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

router.get('/me', async (req, res) => {
  const header = req.headers['authorization']
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    await ensurePrivacySchema()
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [payload.id])
    if (!rows.length) return res.status(404).json({ error: 'User not found' })
    const memberCode = await ensureMemberCode(rows[0].id)
    res.json({ user: safe(rows[0], memberCode) })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

function safe(u, memberCode = u.member_code) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    orgId: u.org_id,
    approved: u.approved,
    memberCode,
    department: u.department || null,
    directoryVisible: u.directory_visible !== false,
  }
}

module.exports = router
