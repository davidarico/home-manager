import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  // Read from environment variables or use default values
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  // Set a maximum number of clients in the pool
  max: 20,
  // Close idle clients after 30 seconds of inactivity
  idleTimeoutMillis: 30000,
  // Return an error after 5 seconds if a client cannot be acquired
  connectionTimeoutMillis: 5000,
  // Automatically close clients that encounter an error
  allowExitOnIdle: true,
});

export default pool;