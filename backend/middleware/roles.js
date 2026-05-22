const { verifyToken } = require('./auth')

// Only superadmin
function requireSuperAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Superadmin access required' })
    }
    next()
  })
}

// Superadmin OR org_admin
function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (!['superadmin', 'org_admin'].includes(req.user?.role)) {
      return res.status(403).json({ error: 'Admin access required' })
    }
    next()
  })
}

// Any approved user
function requireUser(req, res, next) {
  verifyToken(req, res, () => {
    if (!req.user) return res.status(401).json({ error: 'Login required' })
    if (['org_admin_pending', 'rejected'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Account not approved' })
    }
    next()
  })
}

module.exports = { requireSuperAdmin, requireAdmin, requireUser }
