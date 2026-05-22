const jwt = require('jsonwebtoken')

// Verifies JWT and attaches user payload to req.user
function verifyToken(req, res, next) {
  const header = req.headers['authorization']
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = header.slice(7)
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Optional auth — attaches user if token present, but doesn't block
function optionalToken(req, res, next) {
  const header = req.headers['authorization']
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    } catch {}
  }
  next()
}

// Ensures the user is authenticated AND has the superadmin role
function requireSuperAdmin(req, res, next) {
  // Call verifyToken manually to ensure the user is populated
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'superadmin') {
      next() // User is superadmin, proceed to the route
    } else {
      res.status(403).json({ error: 'Access denied. Superadmin privileges required.' })
    }
  })
}

// Make sure requireSuperAdmin is included in the export
module.exports = { 
  verifyToken, 
  optionalToken, 
  requireSuperAdmin 
}
