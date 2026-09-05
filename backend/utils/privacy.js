const crypto = require('node:crypto')
const pool = require('../db')

let schemaReady = false
let schemaPromise = null

async function ensurePrivacySchema() {
  if (schemaReady) return
  if (schemaPromise) return schemaPromise
  schemaPromise = (async () => {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS member_code VARCHAR(14) UNIQUE`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS directory_visible BOOLEAN NOT NULL DEFAULT true`)
    await pool.query(`CREATE SEQUENCE IF NOT EXISTS countor_member_code_seq START WITH 1 MINVALUE 1 MAXVALUE 9999999999`)
    await pool.query(`UPDATE users SET member_code = 'CNT-' || LPAD(nextval('countor_member_code_seq')::text, 10, '0') WHERE member_code IS NULL`)
    await pool.query(`CREATE TABLE IF NOT EXISTS support_requests (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(24) NOT NULL DEFAULT 'requested',
      reason VARCHAR(80),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`)
    await pool.query(`CREATE TABLE IF NOT EXISTS support_messages (
      id BIGSERIAL PRIMARY KEY,
      request_id BIGINT NOT NULL REFERENCES support_requests(id) ON DELETE CASCADE,
      sender_role VARCHAR(24) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`)
    schemaReady = true
  })().catch(err => {
    schemaPromise = null
    throw err
  })
  return schemaPromise
}

async function ensureMemberCode(userId) {
  await ensurePrivacySchema()
  const existing = await pool.query('SELECT member_code FROM users WHERE id = $1', [userId])
  if (existing.rows[0]?.member_code) return existing.rows[0].member_code

  for (let attempt = 0; attempt < 5; attempt++) {
    const digits = crypto.randomInt(0, 10000000000).toString().padStart(10, '0')
    const code = `CNT-${digits}`
    const { rows } = await pool.query(`
      UPDATE users SET member_code=$1 WHERE id=$2 AND member_code IS NULL RETURNING member_code`, [code, userId])
    if (rows.length) return rows[0].member_code
    const retry = await pool.query('SELECT member_code FROM users WHERE id=$1', [userId])
    if (retry.rows[0]?.member_code) return retry.rows[0].member_code
  }
  throw new Error('Could not allocate a Countor member code')
}

module.exports = { ensurePrivacySchema, ensureMemberCode }
