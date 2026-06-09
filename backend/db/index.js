const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false }, // required for Supabase / Railway
  
  // --- Connection Robustness Settings ---
  // Close idle connections after 30 seconds so they don't go stale
  idleTimeoutMillis: 30000, 
  
  // Fail fast if a connection takes longer than 5 seconds to establish
  connectionTimeoutMillis: 5000, 
  
  // Limit max connections so you don't exhaust Supabase's limits
  max: 15 
})

// Listen for fatal errors on idle clients
pool.on('error', (err, client) => {
  console.error('Unexpected DB pool error. Forcing app restart to flush DNS cache:', err)
  
  // Exiting the process here is the key. It forces Railway to instantly 
  // restart the container, which grabs the fresh IP address for Supabase
  // and completely resolves the freeze without your manual intervention.
  process.exit(-1) 
})

module.exports = pool
