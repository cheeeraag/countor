const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false }, // required for Supabase / Railway
})

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err)
})

module.exports = pool
